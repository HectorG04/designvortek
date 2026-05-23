'use server'

/* =====================================================================
   SERVICES — server actions for the admin editor.

   Same shape as the blog and reviews actions: a FormData payload comes
   in from the client form, we validate + write via the service-role
   Supabase client (bypasses RLS), then revalidate the relevant paths.

   Public surfaces aren't wired yet (Phase 3) but we still revalidate
   /services so the cache is ready when they go live.
   ===================================================================== */

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { BUCKETS, type PricingMode, type ServiceBucket } from '@/lib/services'
import type { Database } from '@/lib/supabase/types'

type ServiceInsert = Database['public']['Tables']['services']['Insert']
type ServiceUpdate = Database['public']['Tables']['services']['Update']

interface ActionResult {
  ok: boolean
  error?: string
}

/* --------------------------------------------------------------------
   Small parsers
   -------------------------------------------------------------------- */

function asString(fd: FormData, key: string): string {
  const v = fd.get(key)
  return typeof v === 'string' ? v.trim() : ''
}

function asNullableString(fd: FormData, key: string): string | null {
  const v = asString(fd, key)
  return v.length === 0 ? null : v
}

function asInt(fd: FormData, key: string): number | null {
  const v = fd.get(key)
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  if (!trimmed) return null
  const n = parseInt(trimmed, 10)
  return Number.isFinite(n) ? n : null
}

function asBool(fd: FormData, key: string): boolean {
  const v = fd.get(key)
  return v === 'on' || v === 'true'
}

function asTextArray(fd: FormData, key: string): string[] {
  const v = fd.get(key)
  if (typeof v !== 'string') return []
  return v
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function asJson<T = unknown>(fd: FormData, key: string, fallback: T): T {
  const v = fd.get(key)
  if (typeof v !== 'string' || !v.trim()) return fallback
  try {
    return JSON.parse(v) as T
  } catch {
    return fallback
  }
}

function isPricingMode(s: string): s is PricingMode {
  return [
    'tiered',
    'range',
    'per_extra',
    'pack_with_qty',
    'pct_uplift',
    'monthly_recurring',
    'quote_only',
    'flat',
  ].includes(s)
}

function isBucket(s: string): s is ServiceBucket {
  return BUCKETS.some((b) => b.slug === s)
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/* --------------------------------------------------------------------
   Payload builder — shared by create + update
   -------------------------------------------------------------------- */

interface PayloadResult {
  payload?: Record<string, unknown>
  error?: string
}

function buildPayload(fd: FormData): PayloadResult {
  const name = asString(fd, 'name')
  if (!name) return { error: 'Name is required' }

  const slugRaw = asString(fd, 'slug')
  const slug = slugRaw ? slugify(slugRaw) : slugify(name)
  if (!slug) return { error: 'Could not derive a valid slug' }

  const bucketRaw = asString(fd, 'bucket')
  if (!isBucket(bucketRaw)) return { error: 'Invalid bucket' }

  const pricingModeRaw = asString(fd, 'pricing_mode')
  if (!isPricingMode(pricingModeRaw)) return { error: 'Invalid pricing mode' }

  const pricing = asJson<Record<string, unknown>>(fd, 'pricing', {})

  return {
    payload: {
      slug,
      name,
      bucket: bucketRaw,
      eyebrow: asNullableString(fd, 'eyebrow'),
      lede: asNullableString(fd, 'lede'),
      description: asNullableString(fd, 'description'),

      pricing_mode: pricingModeRaw,
      pricing,

      turnaround_low_days: asInt(fd, 'turnaround_low_days'),
      turnaround_high_days: asInt(fd, 'turnaround_high_days'),
      revisions_included: asInt(fd, 'revisions_included') ?? 2,
      resolution: asNullableString(fd, 'resolution'),

      included: asJson(fd, 'included', []),
      examples: asJson(fd, 'examples', []),
      faq: asJson(fd, 'faq', []),

      bundle_with_slugs: asTextArray(fd, 'bundle_with_slugs'),
      bundle_uplift_cents: asInt(fd, 'bundle_uplift_cents'),

      genre_tags: asTextArray(fd, 'genre_tags'),

      is_published: asBool(fd, 'is_published'),
      is_featured_homepage: asBool(fd, 'is_featured_homepage'),
      featured_order: asInt(fd, 'featured_order'),

      seo_title: asNullableString(fd, 'seo_title'),
      seo_description: asNullableString(fd, 'seo_description'),

      sort_order: asInt(fd, 'sort_order') ?? 0,
    },
  }
}

/* --------------------------------------------------------------------
   Actions
   -------------------------------------------------------------------- */

export async function createService(fd: FormData): Promise<ActionResult | never> {
  const result = buildPayload(fd)
  if (result.error || !result.payload) {
    return { ok: false, error: result.error ?? 'Invalid payload' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('services')
    .insert(result.payload as unknown as ServiceInsert)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/services')
  revalidatePath('/services')
  revalidatePath('/pricing')
  redirect('/admin/services')
}

export async function updateService(fd: FormData): Promise<ActionResult | never> {
  const idRaw = fd.get('id')
  const id = typeof idRaw === 'string' ? parseInt(idRaw, 10) : NaN
  if (!Number.isFinite(id)) return { ok: false, error: 'Missing service id' }

  const result = buildPayload(fd)
  if (result.error || !result.payload) {
    return { ok: false, error: result.error ?? 'Invalid payload' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('services')
    .update(result.payload as unknown as ServiceUpdate)
    .eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/services')
  revalidatePath(`/admin/services/${id}/edit`)
  revalidatePath('/services')
  revalidatePath('/pricing')
  redirect('/admin/services')
}

export async function deleteService(fd: FormData): Promise<ActionResult | never> {
  const idRaw = fd.get('id')
  const id = typeof idRaw === 'string' ? parseInt(idRaw, 10) : NaN
  if (!Number.isFinite(id)) return { ok: false, error: 'Missing service id' }

  const admin = createAdminClient()
  const { error } = await admin.from('services').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/services')
  revalidatePath('/services')
  revalidatePath('/pricing')
  redirect('/admin/services')
}
