import type { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/types'
import AdminShell from '@/components/admin/AdminShell'
import ServiceEditorForm, { type ServiceFormValues } from './_ServiceEditorForm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Edit service' }

const DEMO_DEFAULTS: Record<string, Partial<ServiceFormValues>> = {
  'character-art': {
    slug: 'character-art',
    title: 'Character Art',
    subtitle: 'your hero, painted',
    description:
      'Single-character portraits at portfolio quality. Detailed rendering, expressive poses, dramatic lighting.',
    starting_price: 180,
    turnaround_days: '7–14 days',
    features: ['2 revisions included', '7–14 day turnaround', '4K final delivery', 'Transparent background export'],
    tiers: [
      { name: 'Standard', price: 180, turnaround_days: '10 days', features: ['1 character', '1 revision', 'Standard rendering'] },
      { name: 'Deluxe',   price: 320, turnaround_days: '14 days', features: ['1 character', '2 revisions', 'Detailed background'] },
      { name: 'Premium',  price: 520, turnaround_days: '18 days', features: ['1 character', '3 revisions', 'Custom background, props'] },
    ],
    sort_order: 1,
  },
  'vtt-tokens': {
    slug: 'vtt-tokens',
    title: 'VTT Tokens',
    subtitle: 'for the virtual tabletop',
    description: 'Round, square, hex — token sets ready for Roll20, Foundry, and the rest.',
    starting_price: 80,
    turnaround_days: '3–7 days',
    features: ['Single · Party · Bulk', '3–7 day turnaround', 'Multi-format export'],
    tiers: [
      { name: 'Standard', price: 80,  turnaround_days: '5 days',  features: ['1 token', 'Round + square'] },
      { name: 'Deluxe',   price: 220, turnaround_days: '7 days',  features: ['Up to 4 tokens', 'All shapes'] },
      { name: 'Premium',  price: 420, turnaround_days: '10 days', features: ['Bulk set', 'Style-locked'] },
    ],
    sort_order: 2,
  },
  'party-portraits': {
    slug: 'party-portraits',
    title: 'Party Portraits',
    subtitle: 'the whole gang',
    description: 'Group compositions for adventuring parties.',
    starting_price: 400,
    turnaround_days: '14–21 days',
    features: ['Trio · Adventurers · Epic', 'Up to 6 characters', 'Print-ready'],
    tiers: [
      { name: 'Standard', price: 400, turnaround_days: '14 days', features: ['3 characters', '1 revision'] },
      { name: 'Deluxe',   price: 720, turnaround_days: '18 days', features: ['Up to 5 characters', '2 revisions'] },
      { name: 'Premium',  price: 1100, turnaround_days: '21 days', features: ['Up to 6 characters', 'Custom setting'] },
    ],
    sort_order: 3,
  },
  'npc-packs': {
    slug: 'npc-packs',
    title: 'NPC Packs',
    subtitle: 'for the campaign',
    description: 'A bench of supporting characters delivered in a unified style.',
    starting_price: 600,
    turnaround_days: '3–6 weeks',
    features: ['5–20 figure tiers', 'Style-locked', 'Token cuts'],
    tiers: [
      { name: 'Standard', price: 600,  turnaround_days: '3 weeks', features: ['5 NPCs'] },
      { name: 'Deluxe',   price: 1100, turnaround_days: '4 weeks', features: ['10 NPCs'] },
      { name: 'Premium',  price: 2000, turnaround_days: '6 weeks', features: ['20 NPCs'] },
    ],
    sort_order: 4,
  },
  'custom-projects': {
    slug: 'custom-projects',
    title: 'Custom Projects',
    subtitle: "whatever you're dreaming up",
    description: 'Book covers, indie game art, large illustrations. Scoped per project.',
    starting_price: 0,
    turnaround_days: 'By scope',
    features: ['Per-project scoping', 'Custom usage license'],
    tiers: [
      { name: 'Standard', price: 0, turnaround_days: 'By scope', features: ['Per-project scope'] },
      { name: 'Deluxe',   price: 0, turnaround_days: 'By scope', features: ['Larger scope, more revisions'] },
      { name: 'Premium',  price: 0, turnaround_days: 'By scope', features: ['Full creative partnership'] },
    ],
    sort_order: 5,
  },
}

interface Tier {
  name: string
  price: number
  turnaround_days: string
  features: string[]
}

function parseTiers(tierData: unknown): Tier[] {
  const fallback: Tier[] = [
    { name: 'Standard', price: 0, turnaround_days: '', features: [] },
    { name: 'Deluxe',   price: 0, turnaround_days: '', features: [] },
    { name: 'Premium',  price: 0, turnaround_days: '', features: [] },
  ]
  if (!tierData || typeof tierData !== 'object') return fallback

  if (Array.isArray(tierData)) {
    return tierData.slice(0, 3).map((t) => normalizeTier(t))
  }

  const obj = tierData as Record<string, unknown>
  if (Array.isArray(obj.tiers)) {
    return (obj.tiers as unknown[]).slice(0, 3).map((t) => normalizeTier(t))
  }

  return fallback
}

function normalizeTier(raw: unknown): Tier {
  if (!raw || typeof raw !== 'object') {
    return { name: '', price: 0, turnaround_days: '', features: [] }
  }
  const r = raw as Record<string, unknown>
  const features = Array.isArray(r.features)
    ? (r.features as unknown[]).filter((x): x is string => typeof x === 'string')
    : []
  return {
    name: typeof r.name === 'string' ? r.name : '',
    price: typeof r.price === 'number' ? r.price : Number(r.price) || 0,
    turnaround_days: typeof r.turnaround_days === 'string' ? r.turnaround_days : '',
    features,
  }
}

export default async function ServiceEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()

  // Try to find the service: first by numeric id, then by slug
  let existing = null
  const numericId = Number(id)
  if (Number.isFinite(numericId) && Number.isInteger(numericId)) {
    const { data } = await admin.from('services').select('*').eq('id', numericId).maybeSingle()
    existing = data
  }
  if (!existing) {
    const { data } = await admin.from('services').select('*').eq('slug', id).maybeSingle()
    existing = data
  }

  const initialValues: ServiceFormValues = existing
    ? {
        id: existing.id,
        slug: existing.slug,
        title: existing.title,
        subtitle: existing.subtitle ?? '',
        description: existing.description,
        starting_price: existing.starting_price ?? 0,
        turnaround_days: existing.turnaround_days ?? '',
        features: existing.features ?? [],
        hero_image: existing.hero_image ?? '',
        sort_order: existing.sort_order ?? 0,
        is_active: existing.is_active,
        tiers: parseTiers(existing.tier_data),
      }
    : {
        id: null,
        slug: id === 'new' ? '' : id,
        title: '',
        subtitle: '',
        description: '',
        starting_price: 0,
        turnaround_days: '',
        features: [],
        hero_image: '',
        sort_order: 0,
        is_active: true,
        tiers: [
          { name: 'Standard', price: 0, turnaround_days: '', features: [] },
          { name: 'Deluxe',   price: 0, turnaround_days: '', features: [] },
          { name: 'Premium',  price: 0, turnaround_days: '', features: [] },
        ],
        ...DEMO_DEFAULTS[id],
      }

  async function saveService(values: ServiceFormValues) {
    'use server'
    const admin = createAdminClient()

    if (!values.slug.trim() || !values.title.trim()) {
      throw new Error('Slug and title are required')
    }

    const payload = {
      slug: values.slug.trim(),
      title: values.title.trim(),
      subtitle: values.subtitle.trim() || null,
      description: values.description,
      starting_price: Number(values.starting_price) || 0,
      turnaround_days: values.turnaround_days.trim() || null,
      features: values.features,
      hero_image: values.hero_image.trim() || null,
      sort_order: Number(values.sort_order) || 0,
      is_active: !!values.is_active,
      tier_data: { tiers: values.tiers } as unknown as Json,
      updated_at: new Date().toISOString(),
    }

    // Decide insert vs update: if values.id is set, update. Otherwise, look up by slug.
    if (values.id) {
      await admin.from('services').update(payload).eq('id', values.id)
    } else {
      const { data: bySlug } = await admin
        .from('services')
        .select('id')
        .eq('slug', payload.slug)
        .maybeSingle()
      if (bySlug?.id) {
        await admin.from('services').update(payload).eq('id', bySlug.id)
      } else {
        await admin.from('services').insert(payload)
      }
    }

    revalidatePath('/admin/services')
    revalidatePath(`/admin/services/${payload.slug}/edit`)
    redirect('/admin/services')
  }

  async function deleteService() {
    'use server'
    if (!initialValues.id) {
      redirect('/admin/services')
    }
    const admin = createAdminClient()
    await admin.from('services').delete().eq('id', initialValues.id!)
    revalidatePath('/admin/services')
    redirect('/admin/services')
  }

  const title = existing ? 'Edit service' : 'New service'
  const subtitle = existing
    ? `${existing.title} · /${existing.slug}`
    : id === 'new'
      ? 'Create a new service'
      : `Stub — saving will create /${initialValues.slug} in the database`

  return (
    <AdminShell user={{ email, initials }} title={title} subtitle={subtitle}>
      <ServiceEditorForm
        initialValues={initialValues}
        onSave={saveService}
        onDelete={existing ? deleteService : null}
      />
    </AdminShell>
  )
}
