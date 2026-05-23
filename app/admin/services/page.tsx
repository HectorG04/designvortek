/* =====================================================================
   ADMIN · SERVICES — list view (Phase 5 polish).

   Literal port of:
   `Claude Design Final/Claude designs New Screens and flow V2/Admin Services List v2.html`
   plus the `.adm-svc-*` class spec from the V2 admin.css.

   Renders services grouped by bucket with drag handles (visual only),
   pricing-mode chips, status pills, and filter chips. Page chrome is
   provided by <AdminShell>. Filter chips are non-interactive (static
   visual treatment) — real filter logic remains deferred. Drag-to-
   reorder behavior is intentionally not wired; the grip icon is a
   visual affordance only.
   ===================================================================== */

import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import {
  Plus,
  Pencil,
  GripVertical,
  User,
  Users,
  Mountain,
  Coins,
  BookOpen,
  CalendarDays,
} from 'lucide-react'
import { type ServiceBucket, type PricingPayload } from '@/lib/services'

export const metadata: Metadata = { title: 'Services' }

type ServiceRow = {
  id: number
  slug: string
  name: string
  bucket: string
  eyebrow: string | null
  pricing_mode: string
  pricing: PricingPayload | Record<string, unknown> | null
  is_published: boolean
  is_featured_homepage: boolean
  sort_order: number
  updated_at: string
  bundle_with_slugs: string[] | null
  bundle_uplift_cents: number | null
}

function pricingModeLabel(mode: string, isBundle: boolean): string {
  if (isBundle) return 'Bundle'
  switch (mode) {
    case 'tiered':            return 'Tiered'
    case 'range':             return 'Range'
    case 'per_extra':         return 'Per extra'
    case 'pack_with_qty':     return 'Pack'
    case 'pct_uplift':        return '% Uplift'
    case 'monthly_recurring': return 'Monthly'
    case 'quote_only':        return 'Quote only'
    case 'flat':              return 'Flat'
    default:                  return mode
  }
}

function formatShortDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
  })
}

/* Per-bucket icon — picked to echo the V2 SVGs */
const BUCKET_ICONS: Record<ServiceBucket, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  'character-work':    User,
  'party-work':        Users,
  'gm-world-building': Mountain,
  'tokens':            Coins,
  'commercial':        BookOpen,
  'subscription':      CalendarDays,
}

/* Per-bucket icon background — matches the V2 HTML inline styles */
const BUCKET_ICON_BG: Record<ServiceBucket, string> = {
  'character-work':    'bg-burgundy-700',
  'party-work':        'bg-gold-700',
  'gm-world-building': 'bg-forest-700',
  'tokens':            'bg-ink-700',
  'commercial':        'bg-tome-950',
  'subscription':      'bg-burgundy-500',
}

/* Per-bucket display label — overrides the shared BUCKETS label to match
   the V2 HTML's hand-tuned group names (the shared lib uses shorter
   public-facing labels). */
const BUCKET_DISPLAY_LABEL: Record<ServiceBucket, string> = {
  'character-work':    'Character work',
  'party-work':        'Party work',
  'gm-world-building': 'GM & world-building',
  'tokens':            'Tokens (standalone)',
  'commercial':        'Commercial / publisher',
  'subscription':      'Subscription',
}

/* Per-page bucket display order — the design HTML lists commercial as
   Bucket 5 and subscription as Bucket 6, which is the reverse of the
   public `BUCKETS` order (subscription first because commercial has its
   own landing page on the public site). */
const BUCKET_DISPLAY_ORDER: readonly ServiceBucket[] = [
  'character-work',
  'party-work',
  'gm-world-building',
  'tokens',
  'commercial',
  'subscription',
]

export default async function ServicesAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortex.co'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: rows } = await admin
    .from('services')
    .select('id,slug,name,bucket,eyebrow,pricing_mode,pricing,is_published,is_featured_homepage,sort_order,updated_at,bundle_with_slugs,bundle_uplift_cents')
    .order('bucket', { ascending: true })
    .order('sort_order', { ascending: true })

  const services: ServiceRow[] = (rows ?? []) as ServiceRow[]
  const isEmpty = services.length === 0

  const publishedCount = services.filter((s) => s.is_published).length
  const draftCount = services.length - publishedCount

  // Counts for filter chips
  const quoteOnlyCount = services.filter((s) => s.pricing_mode === 'quote_only').length
  const subscriptionCount = services.filter((s) => s.pricing_mode === 'monthly_recurring').length

  // Bucket count for the header meta line
  const bucketCount = new Set(services.map((s) => s.bucket)).size

  const subtitle = isEmpty
    ? 'No products yet — run the Phase 2 seed to populate the catalog'
    : `${bucketCount} bucket${bucketCount === 1 ? '' : 's'} · ${services.length} product${services.length === 1 ? '' : 's'} · ${draftCount} draft${draftCount === 1 ? '' : 's'}`

  // Group by bucket using the design-spec display order. The shared
  // `BUCKETS` array puts subscription before commercial (because the
  // public site routes commercial to its own landing page); the V2
  // admin design instead lists commercial as Bucket 5 and subscription
  // as Bucket 6, so we render in `BUCKET_DISPLAY_ORDER`.
  const grouped: Record<ServiceBucket, ServiceRow[]> = {} as Record<ServiceBucket, ServiceRow[]>
  for (const slug of BUCKET_DISPLAY_ORDER) grouped[slug] = []
  for (const s of services) {
    const bucket = s.bucket as ServiceBucket
    if (grouped[bucket]) grouped[bucket].push(s)
  }

  // First non-empty bucket gets the "Reorder" icon button (matches the
  // V2 HTML where only Bucket 1 carries it).
  const firstNonEmptyBucket = BUCKET_DISPLAY_ORDER.find((b) => grouped[b].length > 0)

  const filterChips: { label: string; count: number; active?: boolean }[] = [
    { label: 'All',          count: services.length, active: true },
    { label: 'Published',    count: publishedCount },
    { label: 'Drafts',       count: draftCount },
    { label: 'Quote-only',   count: quoteOnlyCount },
    { label: 'Subscription', count: subscriptionCount },
  ]

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
          New product
        </Link>
      }
    >
      {/* Toolbar: filter chips (visual-only) + group-by select (visual-only) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-parchment-100 border border-border-light rounded-xl px-5 py-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {filterChips.map((chip) => (
            <span
              key={chip.label}
              className={
                chip.active
                  ? 'inline-flex items-center gap-1.5 rounded-full border border-burgundy-700 bg-burgundy-700 text-cream-50 px-3.5 py-1.5 text-[0.8125rem] font-medium'
                  : 'inline-flex items-center gap-1.5 rounded-full border border-border-light bg-parchment-50 text-ink-700 px-3.5 py-1.5 text-[0.8125rem] font-medium'
              }
            >
              {chip.label}
              <span
                className={
                  chip.active
                    ? 'px-1.5 rounded-full bg-white/20 text-[0.6875rem]'
                    : 'px-1.5 rounded-full bg-parchment-300 text-ink-700 text-[0.6875rem]'
                }
              >
                {chip.count}
              </span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-md border border-border-light bg-parchment-50 text-ink-900 px-3 py-1.5 text-[0.8125rem] cursor-default select-none">
            Group by bucket
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3 text-ink-500">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
      </div>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-[18px]">
          {BUCKET_DISPLAY_ORDER.map((bucketSlug) => {
            const products = grouped[bucketSlug] ?? []
            if (products.length === 0) return null
            const Icon = BUCKET_ICONS[bucketSlug]
            const iconBg = BUCKET_ICON_BG[bucketSlug]
            const label = BUCKET_DISPLAY_LABEL[bucketSlug]
            const minPrice = computeMinPrice(products)
            const summary = bucketSummary(bucketSlug, products.length, minPrice)
            const showReorder = bucketSlug === firstNonEmptyBucket
            return (
              <section
                key={bucketSlug}
                className="bg-parchment-100 border border-border-light rounded-xl overflow-hidden"
              >
                {/* Group head */}
                <div className="flex items-center justify-between gap-4 px-5 py-4 bg-parchment-50 border-b border-border-light">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-md ${iconBg} text-cream-50 inline-flex items-center justify-center`}>
                      <Icon size={16} strokeWidth={1.7} />
                    </div>
                    <div>
                      <div className="font-display text-[1.0625rem] font-semibold text-ink-900 tracking-tight leading-none">
                        {label}
                      </div>
                      <div className="text-[0.75rem] text-ink-500 mt-1 tracking-[0.04em]">
                        {summary}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {showReorder && (
                      <span
                        className="inline-flex w-[30px] h-[30px] items-center justify-center rounded-sm text-ink-500 border border-transparent cursor-default"
                        title="Reorder bucket (deferred)"
                        aria-hidden
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                          <path d="M8 6v12M16 6v12M4 10h8M4 14h12" />
                        </svg>
                      </span>
                    )}
                    <Link
                      href="/admin/services/new/edit"
                      className="inline-flex w-[30px] h-[30px] items-center justify-center rounded-sm text-ink-500 hover:bg-parchment-200 hover:text-burgundy-700 hover:border-border-light border border-transparent transition-colors"
                      title="Add to bucket"
                      aria-label="Add product to this bucket"
                    >
                      <Plus size={16} strokeWidth={1.8} />
                    </Link>
                  </div>
                </div>

                {/* Product rows */}
                <div>
                  {products.map((p, idx) => (
                    <ProductRow key={p.id} product={p} isFirst={idx === 0} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </AdminShell>
  )
}

/* ------------ Product row ------------ */
function ProductRow({ product, isFirst }: { product: ServiceRow; isFirst: boolean }) {
  const isBundle = (product.bundle_with_slugs?.length ?? 0) > 0
  const modeLabel = pricingModeLabel(product.pricing_mode, isBundle)
  const isQuoteOnly = product.pricing_mode === 'quote_only'

  return (
    <Link
      href={`/admin/services/${product.id}/edit`}
      className={`group grid items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-parchment-50 transition-colors ${
        isFirst ? '' : 'border-t border-border-light'
      }`}
      style={{ gridTemplateColumns: '28px 1fr 200px 110px 70px 110px 36px' }}
    >
      {/* Drag handle (visual only) */}
      <span
        className="inline-flex items-center justify-center w-7 h-7 -ml-1 rounded-sm text-ink-400 group-hover:text-ink-700"
        aria-hidden
        title="Drag to reorder (deferred)"
      >
        <GripVertical size={16} strokeWidth={1.6} />
      </span>

      {/* Name + slug/eyebrow */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display text-base font-semibold text-ink-900 leading-tight">
            {product.name}
          </span>
          <span className="inline-flex items-center px-2 py-[2px] rounded-full bg-parchment-200 text-ink-700 text-[0.625rem] font-semibold uppercase tracking-[0.06em]">
            {modeLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[0.75rem] text-ink-500">
          {product.eyebrow && <span>{product.eyebrow}</span>}
          {product.eyebrow && <span aria-hidden>·</span>}
          <code className="font-mono text-[0.6875rem] text-ink-500">/services/{product.bucket}/{product.slug}</code>
        </div>
      </div>

      {/* Pricing line */}
      <div
        className={`font-display font-semibold text-[0.9375rem] ${
          isQuoteOnly ? 'text-ink-500 font-medium' : 'text-burgundy-700'
        } hidden md:block`}
      >
        {pricingDisplay(product, isBundle)}
      </div>

      {/* Tier count */}
      <div className="text-[0.75rem] text-ink-500 text-center hidden md:block">
        {tierCountDisplay(product)}
      </div>

      {/* Status */}
      <div className="hidden md:block">
        {product.is_published ? (
          <StatusBadge variant="published">Published</StatusBadge>
        ) : (
          <StatusBadge variant="draft">Draft</StatusBadge>
        )}
      </div>

      {/* Updated */}
      <div className="text-[0.75rem] text-ink-500 font-mono hidden md:block">
        {formatShortDate(product.updated_at)}
      </div>

      {/* Edit pencil */}
      <span
        className="inline-flex w-[30px] h-[30px] items-center justify-center rounded-sm text-ink-500 group-hover:bg-parchment-200 group-hover:text-burgundy-700 group-hover:border-border-light border border-transparent transition-colors justify-self-end"
        aria-hidden
      >
        <Pencil size={14} strokeWidth={1.8} />
      </span>
    </Link>
  )
}

/* ------------ Status badge (matches .adm-status pill spec) ------------ */
function StatusBadge({
  variant,
  children,
}: {
  variant: 'published' | 'draft'
  children: React.ReactNode
}) {
  const styles =
    variant === 'published'
      ? 'bg-forest-500/15 text-forest-700'
      : 'bg-parchment-200 text-ink-500'
  const dot = variant === 'published' ? 'bg-forest-500' : 'bg-ink-400'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.75rem] font-medium ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  )
}

/* ------------ Empty state ------------ */
function EmptyState() {
  return (
    <section className="bg-parchment-50 border border-dashed border-border-medium rounded-xl px-8 py-12 text-center">
      <h3 className="font-display text-[1.375rem] font-semibold text-ink-900 mb-2">No products yet</h3>
      <p className="text-sm text-ink-500 max-w-md mx-auto mb-5">
        The services catalog is empty. Add a product to get started, or run the Phase 2 seed.
      </p>
      <Link
        href="/admin/services/new/edit"
        className="inline-flex items-center gap-1.5 bg-gold-500 text-ink-900 hover:bg-gold-300 transition-colors px-5 py-2.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em]"
      >
        <Plus size={14} strokeWidth={2} />
        Add a product
      </Link>
    </section>
  )
}

/* =====================================================================
   Display helpers — kept local to mirror the V2 HTML's hand-tuned copy.
   ===================================================================== */

function bucketSummary(bucket: ServiceBucket, productCount: number, minPrice: number | null): string {
  if (bucket === 'subscription') {
    return `${productCount} tier${productCount === 1 ? '' : 's'} · monthly recurring`
  }
  if (bucket === 'commercial') {
    return `${productCount} product${productCount === 1 ? '' : 's'} · custom quote`
  }
  const priceLabel = minPrice != null ? ` · from $${minPrice}` : ''
  return `${productCount} product${productCount === 1 ? '' : 's'}${priceLabel}`
}

function computeMinPrice(products: ServiceRow[]): number | null {
  let min: number | null = null
  for (const p of products) {
    const candidate = minPriceForRow(p)
    if (candidate == null) continue
    if (min == null || candidate < min) min = candidate
  }
  return min
}

function minPriceForRow(p: ServiceRow): number | null {
  const pp = p.pricing as PricingPayload | null
  if (!pp || typeof pp !== 'object') return null
  switch ((pp as { mode?: string }).mode) {
    case 'tiered': {
      const tiers = (pp as Extract<PricingPayload, { mode: 'tiered' }>).tiers ?? []
      if (tiers.length === 0) return null
      return Math.min(...tiers.map((t) => t.price))
    }
    case 'range':
      return (pp as Extract<PricingPayload, { mode: 'range' }>).range?.low ?? null
    case 'per_extra':
      return (pp as Extract<PricingPayload, { mode: 'per_extra' }>).per_extra?.base ?? null
    case 'pack_with_qty': {
      const packs = (pp as Extract<PricingPayload, { mode: 'pack_with_qty' }>).pack?.packs ?? []
      if (packs.length === 0) return null
      return Math.min(...packs.map((q) => q.price))
    }
    case 'monthly_recurring':
      return (pp as Extract<PricingPayload, { mode: 'monthly_recurring' }>).monthly?.monthly_price ?? null
    case 'quote_only':
      return (pp as Extract<PricingPayload, { mode: 'quote_only' }>).quote?.from_price ?? null
    case 'flat':
      return (pp as Extract<PricingPayload, { mode: 'flat' }>).flat?.price ?? null
    default:
      return null
  }
}

/** Compact pricing display matching the V2 HTML's hand-tuned strings.
 *  Examples: `$60 / $90 / $140`, `$250 – $450`, `+40% of job`, `$30 / mo`. */
function pricingDisplay(product: ServiceRow, isBundle: boolean): string {
  if (isBundle) {
    const cents = product.bundle_uplift_cents
    if (cents != null) return `+$${Math.round(cents / 100)} add-on`
    return 'Bundle add-on'
  }
  const pp = product.pricing as PricingPayload | null
  if (!pp || typeof pp !== 'object') return '—'
  switch ((pp as { mode?: string }).mode) {
    case 'tiered': {
      const tiers = (pp as Extract<PricingPayload, { mode: 'tiered' }>).tiers ?? []
      if (tiers.length === 0) return 'Quote'
      return tiers.map((t) => `$${t.price}`).join(' / ')
    }
    case 'range': {
      const r = (pp as Extract<PricingPayload, { mode: 'range' }>).range
      return `$${r.low} – $${r.high}`
    }
    case 'per_extra': {
      const x = (pp as Extract<PricingPayload, { mode: 'per_extra' }>).per_extra
      return `$${x.base} + $${x.extra_low}–${x.extra_high}/extra`
    }
    case 'pack_with_qty': {
      const packs = (pp as Extract<PricingPayload, { mode: 'pack_with_qty' }>).pack?.packs ?? []
      if (packs.length === 0) return 'Quote'
      return packs.map((q) => `$${q.price}`).join(' / ')
    }
    case 'pct_uplift': {
      const u = (pp as Extract<PricingPayload, { mode: 'pct_uplift' }>).uplift
      return `+${u.percent}% of job`
    }
    case 'monthly_recurring': {
      const m = (pp as Extract<PricingPayload, { mode: 'monthly_recurring' }>).monthly
      return `$${m.monthly_price} / mo`
    }
    case 'quote_only': {
      const q = (pp as Extract<PricingPayload, { mode: 'quote_only' }>).quote
      return q?.from_price != null ? `From $${q.from_price}` : 'Custom quote'
    }
    case 'flat': {
      const f = (pp as Extract<PricingPayload, { mode: 'flat' }>).flat
      return `$${f.price}`
    }
    default:
      return '—'
  }
}

/** Right-column tier/qty count, matching the V2 HTML's "3 tiers" / "2 quantities" / "—". */
function tierCountDisplay(product: ServiceRow): string {
  const pp = product.pricing as PricingPayload | null
  if (!pp || typeof pp !== 'object') return '—'
  switch ((pp as { mode?: string }).mode) {
    case 'tiered': {
      const tiers = (pp as Extract<PricingPayload, { mode: 'tiered' }>).tiers ?? []
      if (tiers.length === 0) return '—'
      return `${tiers.length} tier${tiers.length === 1 ? '' : 's'}`
    }
    case 'pack_with_qty': {
      const packs = (pp as Extract<PricingPayload, { mode: 'pack_with_qty' }>).pack?.packs ?? []
      if (packs.length === 0) return '—'
      return `${packs.length} quantit${packs.length === 1 ? 'y' : 'ies'}`
    }
    default:
      return '—'
  }
}
