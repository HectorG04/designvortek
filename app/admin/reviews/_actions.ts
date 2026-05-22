'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'

/* Server actions for the reviews admin. createReview / updateReview accept
 * FormData from the _ReviewForm client component and write to the reviews
 * table via the service-role Supabase client (bypasses RLS). On success
 * we revalidate the admin list AND the public /reviews page so ISR picks
 * the change up on next request. */

function asString(fd: FormData, key: string): string {
  const v = fd.get(key)
  return typeof v === 'string' ? v.trim() : ''
}

function asInt(fd: FormData, key: string, fallback: number): number {
  const v = fd.get(key)
  if (typeof v !== 'string') return fallback
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : fallback
}

function asBool(fd: FormData, key: string): boolean {
  return fd.get(key) === 'on'
}

interface ActionResult {
  ok: boolean
  error?: string
}

export async function createReview(fd: FormData): Promise<ActionResult | never> {
  const customer_name = asString(fd, 'customer_name')
  const content = asString(fd, 'content')
  const rating = Math.max(1, Math.min(5, asInt(fd, 'rating', 5)))

  if (!customer_name) return { ok: false, error: 'Customer name is required.' }
  if (!content) return { ok: false, error: 'Review content is required.' }

  const row = {
    customer_name,
    customer_role: asString(fd, 'customer_role') || null,
    content,
    rating,
    service_type: asString(fd, 'service_type') || null,
    avatar_url: asString(fd, 'avatar_url') || null,
    is_approved: asBool(fd, 'is_approved'),
    is_featured: asBool(fd, 'is_featured'),
  }

  const admin = createAdminClient()
  const { error } = await admin.from('reviews').insert(row)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/reviews')
  revalidatePath('/reviews')
  redirect('/admin/reviews')
}

export async function updateReview(fd: FormData): Promise<ActionResult | never> {
  const idRaw = fd.get('id')
  const id = typeof idRaw === 'string' ? parseInt(idRaw, 10) : NaN
  if (!Number.isFinite(id)) return { ok: false, error: 'Missing review id.' }

  const customer_name = asString(fd, 'customer_name')
  const content = asString(fd, 'content')
  const rating = Math.max(1, Math.min(5, asInt(fd, 'rating', 5)))

  if (!customer_name) return { ok: false, error: 'Customer name is required.' }
  if (!content) return { ok: false, error: 'Review content is required.' }

  const row = {
    customer_name,
    customer_role: asString(fd, 'customer_role') || null,
    content,
    rating,
    service_type: asString(fd, 'service_type') || null,
    avatar_url: asString(fd, 'avatar_url') || null,
    is_approved: asBool(fd, 'is_approved'),
    is_featured: asBool(fd, 'is_featured'),
  }

  const admin = createAdminClient()
  const { error } = await admin.from('reviews').update(row).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/reviews')
  revalidatePath('/reviews')
  redirect('/admin/reviews')
}

export async function deleteReviewById(fd: FormData): Promise<ActionResult | never> {
  const idRaw = fd.get('id')
  const id = typeof idRaw === 'string' ? parseInt(idRaw, 10) : NaN
  if (!Number.isFinite(id)) return { ok: false, error: 'Missing review id.' }

  const admin = createAdminClient()
  const { error } = await admin.from('reviews').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/admin/reviews')
  revalidatePath('/reviews')
  redirect('/admin/reviews')
}
