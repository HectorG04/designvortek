import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import ServiceForm, { type ServiceFormValues } from '../../_ServiceForm'

export const metadata: Metadata = { title: 'Edit service' }

/* =====================================================================
   ADMIN · SERVICES — edit page (Phase 1 interim).

   When `id = 'new'`, renders an empty form in create mode.
   Otherwise loads the row by numeric id and renders an edit form.
   ===================================================================== */

type ServiceRow = {
  id: number
  slug: string
  name: string
  bucket: string
  eyebrow: string | null
  lede: string | null
  description: string | null
  pricing_mode: string
  pricing: unknown
  turnaround_low_days: number | null
  turnaround_high_days: number | null
  revisions_included: number | null
  resolution: string | null
  included: unknown
  examples: unknown
  faq: unknown
  bundle_with_slugs: string[] | null
  bundle_uplift_cents: number | null
  genre_tags: string[] | null
  is_published: boolean
  is_featured_homepage: boolean
  featured_order: number | null
  seo_title: string | null
  seo_description: string | null
  sort_order: number
  updated_at: string
}

const EMPTY_VALUES: ServiceFormValues = {
  slug: '',
  name: '',
  bucket: 'character-work',
  eyebrow: '',
  lede: '',
  description: '',
  pricing_mode: 'tiered',
  pricing_json: JSON.stringify({ tiers: [{ name: 'Basic', price: 0, features: [] }] }, null, 2),
  turnaround_low_days: '',
  turnaround_high_days: '',
  revisions_included: '2',
  resolution: '',
  included_json: '[]',
  examples_json: '[]',
  faq_json: '[]',
  bundle_with_slugs: '',
  bundle_uplift_cents: '',
  genre_tags: '',
  is_published: false,
  is_featured_homepage: false,
  featured_order: '',
  seo_title: '',
  seo_description: '',
  sort_order: '0',
}

function jsonString(value: unknown, fallback: string): string {
  if (value === null || value === undefined) return fallback
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return fallback
  }
}

export default async function ServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortex.co'
  const initials = email.slice(0, 2).toUpperCase()

  // 'new' route — render empty form for creation
  if (id === 'new') {
    return (
      <AdminShell
        user={{ email, initials }}
        title="New product"
        subtitle="Add a new service to the catalog"
        showSearch={false}
      >
        <ServiceForm mode="create" initial={EMPTY_VALUES} />
      </AdminShell>
    )
  }

  const numericId = parseInt(id, 10)
  if (!Number.isFinite(numericId)) notFound()

  const admin = createAdminClient()
  const { data: row } = await admin
    .from('services')
    .select('*')
    .eq('id', numericId)
    .maybeSingle()

  if (!row) notFound()

  const service = row as ServiceRow

  const initial: ServiceFormValues = {
    id: service.id,
    slug: service.slug,
    name: service.name,
    bucket: service.bucket,
    eyebrow: service.eyebrow ?? '',
    lede: service.lede ?? '',
    description: service.description ?? '',
    pricing_mode: service.pricing_mode,
    pricing_json: jsonString(service.pricing, '{}'),
    turnaround_low_days: service.turnaround_low_days?.toString() ?? '',
    turnaround_high_days: service.turnaround_high_days?.toString() ?? '',
    revisions_included: service.revisions_included?.toString() ?? '2',
    resolution: service.resolution ?? '',
    included_json: jsonString(service.included, '[]'),
    examples_json: jsonString(service.examples, '[]'),
    faq_json: jsonString(service.faq, '[]'),
    bundle_with_slugs: (service.bundle_with_slugs ?? []).join(', '),
    bundle_uplift_cents: service.bundle_uplift_cents?.toString() ?? '',
    genre_tags: (service.genre_tags ?? []).join(', '),
    is_published: !!service.is_published,
    is_featured_homepage: !!service.is_featured_homepage,
    featured_order: service.featured_order?.toString() ?? '',
    seo_title: service.seo_title ?? '',
    seo_description: service.seo_description ?? '',
    sort_order: service.sort_order?.toString() ?? '0',
  }

  const lastEdited = new Date(service.updated_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const status = service.is_published ? 'Published' : 'Draft'

  return (
    <AdminShell
      user={{ email, initials }}
      title="Edit product"
      subtitle={`${service.name} · last edit ${lastEdited} · ${status}`}
      showSearch={false}
    >
      <ServiceForm mode="edit" initial={initial} />
    </AdminShell>
  )
}
