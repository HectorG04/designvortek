import type { Metadata } from 'next'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import {
  Briefcase,
  Plus,
  Pencil,
  Sparkles,
  Palette,
  Coins,
  Users,
  Crown,
  Wand2,
  Info,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Services' }

type IconKey =
  | 'character-art'
  | 'vtt-tokens'
  | 'party-portraits'
  | 'npc-packs'
  | 'custom-projects'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  'character-art': Palette,
  'vtt-tokens': Coins,
  'party-portraits': Users,
  'npc-packs': Crown,
  'custom-projects': Wand2,
}

interface ServiceCardItem {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  starting_price: number | null
  price_label: string
  turnaround_days: string
  features: string[]
  is_active: boolean
  sort_order: number
  icon_name: string
  dbId: number | null
}
type DemoService = ServiceCardItem

const DEMO_SERVICES: DemoService[] = [
  {
    id: 'character-art',
    slug: 'character-art',
    title: 'Character Art',
    subtitle: 'your hero, painted',
    description:
      'Single-character portraits at portfolio quality. Detailed rendering, expressive poses, dramatic lighting.',
    starting_price: 180,
    price_label: '$180',
    turnaround_days: '7–14 days',
    features: ['2 revisions included', '7–14 day turnaround', '4K final delivery', 'Transparent background export'],
    is_active: true,
    sort_order: 1,
    icon_name: 'character-art',
    dbId: null,
  },
  {
    id: 'vtt-tokens',
    slug: 'vtt-tokens',
    title: 'VTT Tokens',
    subtitle: 'for the virtual tabletop',
    description:
      'Round, square, hex — token sets ready for Roll20, Foundry, and the rest. Crisp at every grid size.',
    starting_price: 80,
    price_label: '$80',
    turnaround_days: '3–7 days',
    features: ['Single · Party · Bulk tiers', '3–7 day turnaround', 'Multi-format export', 'Print-friendly version'],
    is_active: true,
    sort_order: 2,
    icon_name: 'vtt-tokens',
    dbId: null,
  },
  {
    id: 'party-portraits',
    slug: 'party-portraits',
    title: 'Party Portraits',
    subtitle: 'the whole gang',
    description:
      'Group compositions for adventuring parties. Custom backgrounds, dynamic poses, table-worthy presence.',
    starting_price: 400,
    price_label: '$400',
    turnaround_days: '14–21 days',
    features: ['Trio · Adventurers · Epic tiers', '14–21 day turnaround', 'Print-ready master file', 'Up to 6 characters'],
    is_active: true,
    sort_order: 3,
    icon_name: 'party-portraits',
    dbId: null,
  },
  {
    id: 'npc-packs',
    slug: 'npc-packs',
    title: 'NPC Packs',
    subtitle: 'for the campaign',
    description:
      'A bench of supporting characters delivered in a unified style. Drop-in-ready for your sessions.',
    starting_price: 600,
    price_label: '$600',
    turnaround_days: '3–6 weeks',
    features: ['5–20 figure tiers', '3–6 week turnaround', 'Style-locked bench', 'Token cuts included'],
    is_active: true,
    sort_order: 4,
    icon_name: 'npc-packs',
    dbId: null,
  },
  {
    id: 'custom-projects',
    slug: 'custom-projects',
    title: 'Custom Projects',
    subtitle: "whatever you're dreaming up",
    description:
      'Book covers, indie game art, large illustrations, weird requests. Scoped per project.',
    starting_price: null,
    price_label: 'Quote',
    turnaround_days: 'By scope',
    features: ['Per-project scoping', 'Quoted turnaround', 'Custom usage license', 'Direct creative partnership'],
    is_active: true,
    sort_order: 5,
    icon_name: 'custom-projects',
    dbId: null,
  },
]

async function toggleActive(id: number, next: boolean) {
  'use server'
  const admin = createAdminClient()
  await admin.from('services').update({ is_active: next }).eq('id', id)
  revalidatePath('/admin/services')
}

export default async function ServicesAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: dbServices } = await admin.from('services').select('*').order('sort_order')

  const usingDemo = !dbServices || dbServices.length === 0

  const items: ServiceCardItem[] = usingDemo
    ? DEMO_SERVICES
    : dbServices!.map((s) => ({
        id: String(s.id),
        slug: s.slug,
        title: s.title,
        subtitle: s.subtitle ?? '',
        description: s.description,
        starting_price: s.starting_price,
        price_label: s.starting_price ? `$${s.starting_price}` : 'Quote',
        turnaround_days: s.turnaround_days ?? 'By scope',
        features: s.features ?? [],
        is_active: s.is_active,
        sort_order: s.sort_order,
        icon_name: s.icon_name ?? s.slug,
        dbId: s.id,
      }))

  const activeCount = items.filter((s) => s.is_active).length
  const inactiveCount = items.length - activeCount
  const subtitle = `${items.length} service${items.length === 1 ? '' : 's'} · ${activeCount} active · ${inactiveCount} inactive`

  return (
    <AdminShell
      user={{ email, initials }}
      title="Services"
      subtitle={subtitle}
      actions={
        <Link
          href="/admin/services/new/edit"
          className="hidden sm:inline-flex items-center gap-1.5 bg-gold-500 text-ink-900 hover:bg-gold-300 hover:shadow-[0_8px_24px_rgba(201,160,74,0.32)] transition-all px-4 py-2 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em]"
        >
          <Plus size={14} strokeWidth={2} />
          Add service
        </Link>
      }
    >
      {usingDemo && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-gold-300 bg-gold-100 px-4 py-3 text-sm text-ink-700">
          <Info size={18} strokeWidth={1.6} className="mt-0.5 flex-shrink-0 text-gold-700" />
          <div className="flex-1">
            <p className="font-display text-base font-semibold text-ink-900">
              Showing stub services
            </p>
            <p className="mt-0.5 text-[0.8125rem] leading-relaxed">
              No services exist in the database yet. These are placeholders — edit one to save it
              to your database.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((service) => {
          const Icon = ICON_MAP[service.icon_name as IconKey] ?? Briefcase
          const editHref = `/admin/services/${service.slug}/edit`
          const dbId = service.dbId
          return (
            <article
              key={service.id}
              className="relative bg-parchment-100 border border-border-light rounded-xl p-5 flex flex-col gap-4 hover:border-border-medium transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-burgundy-100/60 border border-gold-300/40 flex items-center justify-center flex-shrink-0 text-burgundy-700">
                  <Icon size={22} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold text-ink-900 leading-tight">
                      {service.title}
                    </h3>
                    <span className="font-mono text-sm font-semibold text-burgundy-700 whitespace-nowrap">
                      {service.price_label}
                    </span>
                  </div>
                  {service.subtitle && (
                    <p
                      className="text-base text-burgundy-700 mt-0.5 font-accent"
                      style={{ fontSize: '1.125rem', lineHeight: 1.2 }}
                    >
                      {service.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-[0.875rem] text-ink-700 line-clamp-2 leading-relaxed">
                {service.description}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.75rem] text-ink-500">
                <span className="font-mono">
                  <span className="text-ink-400">Turnaround:</span> {service.turnaround_days}
                </span>
                <span className="font-mono">
                  <span className="text-ink-400">Features:</span> {service.features.length}
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between pt-3 border-t border-dashed border-border-light">
                {dbId !== null ? (
                  <form action={toggleActive.bind(null, dbId, !service.is_active)}>
                    <button
                      type="submit"
                      className="flex items-center gap-2.5 text-[0.8125rem] font-medium text-ink-700 hover:text-ink-900"
                      aria-label={service.is_active ? 'Disable service' : 'Activate service'}
                    >
                      <span
                        className={[
                          'relative inline-block w-10 h-[22px] rounded-full transition-colors',
                          service.is_active ? 'bg-burgundy-700' : 'bg-parchment-300',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'absolute top-0.5 w-[18px] h-[18px] bg-cream-50 rounded-full shadow-sm transition-all',
                            service.is_active ? 'left-[20px]' : 'left-0.5',
                          ].join(' ')}
                        />
                      </span>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </form>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-ink-500">
                    <Sparkles size={12} strokeWidth={1.8} className="text-gold-700" />
                    Stub
                  </span>
                )}
                <Link
                  href={editHref}
                  className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-burgundy-700 hover:text-burgundy-500"
                >
                  <Pencil size={12} strokeWidth={2} />
                  Edit
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </AdminShell>
  )
}
