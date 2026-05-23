import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import Markdown from '@/components/ui/Markdown'
import PaperTexture from '@/components/decor/PaperTexture'
import USDDisclaimer from '@/components/ui/USDDisclaimer'
import {
  bucketLabel,
  bucketTagline,
  fetchProductsByBucket,
  formatTurnaround,
  formatBundleUplift,
  type ServiceBucket,
  type ServiceProduct,
} from '@/lib/services-server'
import { cn } from '@/lib/utils'

/* =====================================================================
   SERVICES · BUCKET DETAIL — V2 PORT.

   Literal port of `Claude Design Final/Claude designs New Screens and
   flow V2/Service Detail v2.html` into the Next.js App Router. Replaces
   the Phase 3 interim that reused the pricing-card pattern.

   Route: /services/[bucket-slug]
   bucket-slug ∈ {character-work, party-work, gm-world-building, tokens}.
   Subscription and Commercial have dedicated pages at /subscription and
   /commercial.

   PRICING-MODE RENDERER COVERS ALL 8 VARIANTS:
     1. tiered             — 3-up tier grid (Basic / Standard / Premium)
     2. range              — single "From $X to $Y" card
     3. per_extra          — base + "+$X–Y per extra" line + footnote
     4. pack_with_qty      — 2-up (or n-up) pack cards with qty + per-piece
     5. pct_uplift         — "+X%" big display card
     6. monthly_recurring  — "$X/month" with included list + cadence
     7. quote_only         — "From $X · request a quote" + CTA link
     8. flat               — single "$X" card; bundle uplift callout below if
                             bundleWithSlugs is non-empty

   Bucket truths strip (Revisions · Turnaround · Delivery) sits below the
   hero. Per-product blocks stack with dashed dividers (.bd-product
   pattern). Each product also renders included grid, examples, FAQ
   accordion, and a per-product CTA row. Dark-tome CTA closer at the
   bottom mirrors /pricing and /services.

   ISR: revalidate = 60s so admin edits propagate within a minute.
   ===================================================================== */

export const revalidate = 60

type AllowedBucket = Extract<ServiceBucket, 'character-work' | 'party-work' | 'gm-world-building' | 'tokens'>

const ALLOWED_BUCKETS: AllowedBucket[] = [
  'character-work',
  'party-work',
  'gm-world-building',
  'tokens',
]

function isAllowedBucket(slug: string): slug is AllowedBucket {
  return (ALLOWED_BUCKETS as string[]).includes(slug)
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return ALLOWED_BUCKETS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (!isAllowedBucket(slug)) return { title: 'Service not found · Design Vortex' }
  const label = bucketLabel(slug)
  return {
    title: `${label} · every tier of finish · Design Vortex`,
    description: `${label} commissions: hand-painted, fixed-rate pricing, two revisions on every tier. Browse every product in the ${label.toLowerCase()} bucket with USD pricing and turnaround ranges.`,
    alternates: { canonical: `/services/${slug}` },
  }
}

/* =====================================================================
   Bucket-level meta — H1 title fragment + lede + truths strip values.
   Mirrors the V2 design's "Character work, every tier of finish" copy
   pattern. Falls back to bucketTagline() / sensible defaults for any
   bucket the design doc doesn't explicitly cover.
   ===================================================================== */
const BUCKET_COPY: Record<AllowedBucket, {
  heroEmphasis: string
  lede: string
  truths: { label: string; value: string }[]
}> = {
  'character-work': {
    heroEmphasis: 'tier of finish',
    lede: 'Four ways to commission a character. A bust for the character sheet, a full-body for the wall, a reference sheet for the long campaign, or the bundle that includes a matching VTT token. Same hand-painted craft on every option.',
    truths: [
      { label: 'Revisions',  value: '2 included on every tier' },
      { label: 'Turnaround', value: '2 to 4 weeks per piece'    },
      { label: 'Delivery',   value: '4K final + transparent PNG' },
    ],
  },
  'party-work': {
    heroEmphasis: 'one composition',
    lede: 'Group portraits, matched sets, and action scenes for the whole table. Whether you want everyone in one canvas or individual portraits that share a style guide, the same hand-painted craft applies to every figure.',
    truths: [
      { label: 'Revisions',  value: '2 included on every tier' },
      { label: 'Turnaround', value: '2 to 5 weeks per piece'    },
      { label: 'Delivery',   value: '4K master + print-ready'   },
    ],
  },
  'gm-world-building': {
    heroEmphasis: 'campaign',
    lede: 'NPC packs, monsters, magic items, battle maps, region maps — the visual language of your whole world. Painted to a shared style guide so the campaign feels like one continuous setting.',
    truths: [
      { label: 'Revisions',  value: '2 included on every tier'  },
      { label: 'Turnaround', value: '3 days to 6 weeks by scope' },
      { label: 'Delivery',   value: '4K · VTT-ready · print'     },
    ],
  },
  tokens: {
    heroEmphasis: 'table-ready',
    lede: 'Hand-painted VTT tokens built for the circle, not cropped from a square. Single tokens, matched packs, or conversions from your existing art — every option ships at 512 and 1024 px transparent PNG.',
    truths: [
      { label: 'Revisions',  value: '1 included per token'      },
      { label: 'Turnaround', value: '2 days to 2 weeks by scope' },
      { label: 'Delivery',   value: '512 + 1024 px PNG'         },
    ],
  },
}

export default async function ServiceBucketDetailPage({ params }: PageProps) {
  const { slug } = await params
  if (!isAllowedBucket(slug)) notFound()

  const products = await fetchProductsByBucket(slug)
  if (products.length === 0) notFound()

  const label = bucketLabel(slug)
  const tagline = bucketTagline(slug)
  const copy = BUCKET_COPY[slug]

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        {/* ============ BREADCRUMBS ============ */}
        <div className="pt-[108px]">
          <Container>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-[0.8125rem] text-ink-500"
            >
              <Link href="/" className="hover:text-burgundy-700 transition-colors">
                Home
              </Link>
              <Chevron />
              <Link href="/services" className="hover:text-burgundy-700 transition-colors">
                Services
              </Link>
              <Chevron />
              <span aria-current="page" className="text-ink-900 font-medium">
                {label}
              </span>
            </nav>
          </Container>
        </div>

        {/* ============ HERO ============ */}
        <section className="pt-6 pb-16 text-center">
          <Container>
            <div className="mb-4 flex justify-center">
              <span className="inline-flex items-center gap-[10px] font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                <span aria-hidden="true" className="h-px w-6 bg-burgundy-700" />
                {label}
              </span>
            </div>
            <h1
              className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight mb-4 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
            >
              {label}, every <em>{copy.heroEmphasis}</em>.
            </h1>
            <p className="text-lg text-ink-500 leading-[1.65] mx-auto max-w-[60ch]">
              {copy.lede}
            </p>
          </Container>
        </section>

        {/* ============ BUCKET TRUTHS STRIP ============ */}
        <section>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-14">
              {copy.truths.map((truth, i) => (
                <div
                  key={truth.label}
                  className="bg-parchment-100 border border-border-light rounded-lg px-5 py-[18px] flex items-center gap-3.5"
                >
                  <div className="w-8 h-8 rounded-full bg-gold-100 inline-flex items-center justify-center flex-shrink-0 text-gold-700">
                    {i === 0 && <ChartIcon />}
                    {i === 1 && <ClockIcon />}
                    {i === 2 && <DeliveryIcon />}
                  </div>
                  <div>
                    <span className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-500 mb-0.5">
                      {truth.label}
                    </span>
                    <span className="block font-display text-[1.0625rem] font-semibold text-ink-900 leading-tight">
                      {truth.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ============ PER-PRODUCT BLOCKS ============ */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="flex flex-col">
              {products.map((product, i) => (
                <ProductBlock key={product.slug} product={product} isFirst={i === 0} />
              ))}
            </div>

            <div className="mt-14 flex justify-center">
              <USDDisclaimer variant="block" />
            </div>
          </Container>
        </section>

        {/* ============ CTA CLOSER ============ */}
        <section className="relative bg-tome-950 text-cream-50 py-20 text-center overflow-hidden">
          <PaperTexture variant="cream" opacity={0.5} />
          <div className="relative">
            <Container>
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.15] tracking-tight mb-4 mx-auto max-w-[24ch] [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
              >
                Ready to commission <em>{tagline || label.toLowerCase()}</em>?
              </h2>
              <p className="text-base text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-7">
                Pick a product, pick a tier, send a short brief. Fixed quote back within 48 hours.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-3">
                <Button href="/order" variant="gold" size="lg">
                  Start a commission <ArrowRight />
                </Button>
                <Button href="/portfolio" variant="outline-cream" size="lg">
                  Browse portfolio
                </Button>
              </div>
            </Container>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}

/* =====================================================================
   ProductBlock — one product block from the V2 design.

   Stacking pattern (.bd-product): first block has no top divider; every
   subsequent block has a dashed top border + 56px padding/margin to
   visually separate within the same bucket section.
   ===================================================================== */
function ProductBlock({ product, isFirst }: { product: ServiceProduct; isFirst: boolean }) {
  const turnaroundLabel = formatTurnaround(product)
  const bundleUplift = formatBundleUplift(product)

  return (
    <div
      className={cn(
        'flex flex-col',
        !isFirst && 'mt-14 pt-14 border-t border-dashed border-border-light',
      )}
    >
      {/* Product head: name + meta */}
      <div className="flex flex-wrap justify-between items-end gap-6 mb-6">
        <div>
          <h2
            className="font-display font-medium text-ink-900 leading-[1.15] tracking-tight [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}
          >
            {product.name}
          </h2>
          {product.eyebrow && (
            <div className="font-accent text-[1.0625rem] text-burgundy-700 mt-1">
              {product.eyebrow}
            </div>
          )}
        </div>
        <div className="inline-flex items-center gap-2 text-[0.8125rem] text-ink-500">
          <ClockIcon className="w-4 h-4 text-gold-700" />
          Turnaround{' '}
          <strong className="text-ink-900 font-semibold">{turnaroundLabel}</strong>
          {product.revisionsIncluded != null && (
            <>
              <span className="text-border-medium">·</span>
              <strong className="text-ink-900 font-semibold">
                {product.revisionsIncluded}
              </strong>{' '}
              {product.revisionsIncluded === 1 ? 'revision' : 'revisions'}
            </>
          )}
        </div>
      </div>

      {/* Lede paragraph */}
      {product.lede && (
        <p className="max-w-[65ch] text-ink-700 leading-[1.6] mb-7">
          {product.lede}
        </p>
      )}

      {/* Pricing card(s) per mode */}
      <PricingDisplay product={product} />

      {/* Bundle uplift callout — when this product or one it bundles WITH is paired */}
      {bundleUplift && product.bundleWithSlugs.length > 0 && (
        <div className="relative mt-7 bg-tome-950 text-cream-50 rounded-lg px-8 py-7 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center overflow-hidden">
          {/* Gold glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 0% 100%, rgba(212,162,76,0.12), transparent 60%)',
            }}
          />
          <div className="relative">
            <h4 className="font-display text-[1.375rem] font-medium text-cream-50 mb-1.5 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow">
              Add a matching <em>token</em> for {bundleUplift}
            </h4>
            <p className="text-cream-200 text-[0.9375rem] leading-[1.5] max-w-[50ch]">
              One flat price on top of any portrait tier. Circular crop, VTT-scaled, transparent PNG.
              Same character, same painting, ready for Roll20 or Foundry the day the portrait ships.
              {product.bundleWithSlugs.length > 0 && (
                <>
                  {' '}Pairs with{' '}
                  {product.bundleWithSlugs
                    .map((s) => s.replace(/-/g, ' '))
                    .join(' or ')}
                  .
                </>
              )}
            </p>
          </div>
          <div className="relative font-display text-[2.25rem] font-semibold text-gold-glow whitespace-nowrap">
            {bundleUplift}
          </div>
        </div>
      )}

      {/* Included grid */}
      {product.included.length > 0 && (
        <div className="mt-10">
          <div className="font-body text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-gold-700 mb-4">
            Always included
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.included.map((item) => (
              <div
                key={item.name}
                className="bg-parchment-100 border border-border-light rounded-xl p-5"
              >
                <div className="font-display text-[1.0625rem] font-semibold text-ink-900 mb-1.5">
                  {item.name}
                </div>
                <p className="text-[0.875rem] text-ink-700 leading-[1.55]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examples — gradient cards */}
      {product.examples.length > 0 && (
        <div className="mt-10">
          <div className="font-body text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-gold-700 mb-4">
            Recent examples
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.examples.map((ex) => (
              <article
                key={ex.title}
                className={cn(
                  'rounded-xl overflow-hidden border border-border-light',
                  `bg-gradient-to-br ${ex.gradient}`,
                )}
              >
                <div className="aspect-[4/3] flex items-end p-4">
                  <div>
                    <div className="font-display text-base font-semibold text-cream-50 leading-tight drop-shadow">
                      {ex.title}
                    </div>
                    <div className="text-[0.6875rem] uppercase tracking-[0.15em] text-cream-200 mt-1 font-semibold">
                      {ex.meta}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* FAQ accordion */}
      {product.faq.length > 0 && (
        <div className="mt-10">
          <div className="font-body text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-gold-700 mb-4">
            Common questions
          </div>
          <div className="flex flex-col gap-3">
            {product.faq.map((item, i) => (
              <details
                key={item.q}
                open={i === 0}
                className="group bg-parchment-100 border border-border-light rounded-xl open:bg-parchment-50 open:border-border-medium open:shadow-sm transition-colors"
              >
                <summary className="list-none cursor-pointer flex items-center justify-between gap-4 px-6 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-lg font-semibold text-ink-900 leading-snug">
                    {item.q}
                  </span>
                  <span className="flex-shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center transition-all duration-[250ms] bg-parchment-50 text-burgundy-700 border border-border-medium group-open:bg-burgundy-700 group-open:text-cream-50 group-open:border-burgundy-700 group-open:rotate-45">
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-5 text-[0.9375rem] text-ink-700 leading-[1.65] max-w-[64ch]">
                  <Markdown>{item.a}</Markdown>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Per-product CTA row */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/order" variant="primary" size="md">
          Commission this <ArrowRight />
        </Button>
        <Button href="/pricing" variant="outline" size="md">
          See full pricing
        </Button>
      </div>
    </div>
  )
}

/* =====================================================================
   PricingDisplay — ONE switch that covers all 8 pricing modes from the
   discriminated union in lib/services.ts. Each branch returns the V2
   card shape from the design (tier grid, range card, per-extra card,
   pack-with-qty card with stacked rows, pct-uplift card, monthly card,
   quote-only card, flat card).
   ===================================================================== */
function PricingDisplay({ product }: { product: ServiceProduct }) {
  const p = product.pricing

  switch (p.mode) {
    /* ---- 1 of 8: TIERED (3-up grid) ---- */
    case 'tiered': {
      const cols =
        p.tiers.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
        'grid-cols-1 lg:grid-cols-3'
      return (
        <div className={cn('grid gap-4', cols)}>
          {p.tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'relative rounded-xl p-7 sm:p-8 flex flex-col gap-4 transition-all duration-[250ms]',
                'hover:-translate-y-1 hover:shadow-md',
                tier.featured
                  ? 'bg-parchment-50 border border-gold-500 shadow-[0_8px_24px_rgba(201,160,74,0.18)]'
                  : 'bg-parchment-100 border border-border-light',
              )}
            >
              {tier.flag && (
                <span className="absolute -top-2.5 right-6 bg-gold-500 text-ink-900 font-body text-[0.625rem] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">
                  {tier.flag}
                </span>
              )}

              <div>
                <div className="font-display text-2xl font-semibold text-ink-900">{tier.name}</div>
                {tier.note && (
                  <div className="font-accent text-base text-burgundy-700 -mt-1">{tier.note}</div>
                )}
              </div>

              <div className="flex items-baseline gap-2 py-3 border-y border-dashed border-border-light">
                <span className="font-display text-[2.75rem] font-semibold text-ink-900 leading-none tracking-[-0.02em]">
                  ${tier.price}
                </span>
                {tier.note && (
                  <span className="text-sm text-ink-500">{tier.note}</span>
                )}
              </div>

              <ul className="flex flex-col gap-2.5 list-none p-0 m-0 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2.5 items-start text-[0.9375rem] text-ink-700 leading-[1.4]">
                    <CheckIcon className="w-3.5 h-3.5 text-gold-700 flex-shrink-0 mt-1" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                href="/order"
                variant={tier.featured ? 'primary' : 'outline'}
                size="md"
                className="mt-2 w-full"
              >
                Choose {tier.name}
              </Button>
            </div>
          ))}
        </div>
      )
    }

    /* ---- 2 of 8: RANGE (single card, "From $X to $Y") ---- */
    case 'range': {
      return (
        <BdCard
          title={product.name}
          body={
            product.description ??
            'Scoped per brief. The base sits at the floor of the range; the upper end reflects added scope (more views, alt outfits, expression studies, detail call-outs).'
          }
          priceNum={`$${p.range.low} – $${p.range.high}`}
          priceNote="scoped per brief"
          ctaLabel="Request a quote"
          ctaHref="/order"
          ctaVariant="primary"
        />
      )
    }

    /* ---- 3 of 8: PER_EXTRA (base + footnote) ---- */
    case 'per_extra': {
      return (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[720px]">
            <div className="relative rounded-xl p-7 sm:p-8 flex flex-col gap-4 bg-parchment-100 border border-border-light">
              <div>
                <div className="font-display text-2xl font-semibold text-ink-900">{product.name}</div>
                {product.eyebrow && (
                  <div className="font-accent text-base text-burgundy-700 -mt-1">
                    {product.eyebrow}
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-2 py-3 border-y border-dashed border-border-light">
                <span className="font-display text-[2.75rem] font-semibold text-ink-900 leading-none tracking-[-0.02em]">
                  ${p.per_extra.base}
                </span>
                <span className="text-sm text-ink-500">base scope</span>
              </div>
              <p className="text-[0.9375rem] text-ink-700 leading-[1.5]">
                {p.per_extra.extra_label ?? 'Base scope covered in the flat price.'}
              </p>
            </div>
          </div>
          <p className="mt-4 text-[0.9375rem] text-ink-700 italic">
            Each additional member adds{' '}
            <strong className="text-burgundy-700 font-semibold not-italic">
              +${p.per_extra.extra_low} to ${p.per_extra.extra_high}
            </strong>{' '}
            depending on tier complexity.
          </p>
        </div>
      )
    }

    /* ---- 4 of 8: PACK_WITH_QTY (stacked rows inside one card) ---- */
    case 'pack_with_qty': {
      const min = Math.min(...p.pack.packs.map((q) => q.price))
      const max = Math.max(...p.pack.packs.map((q) => q.price))
      const priceLine = p.pack.packs.map((q) => `$${q.price}`).join(' / ')
      return (
        <div className="bg-parchment-100 border border-border-light rounded-lg p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-7 items-center">
          <div>
            <h4 className="font-display text-xl font-semibold text-ink-900 mb-1">
              {product.name}
            </h4>
            <p className="text-[0.9375rem] text-ink-500 leading-[1.55] max-w-[50ch]">
              {product.description ??
                'Pick the volume that fits the brief. Per-piece rate drops as the pack grows.'}
            </p>
            <div className="flex flex-col gap-3 pt-5">
              {p.pack.packs.map((pk) => (
                <div
                  key={pk.qty}
                  className="grid grid-cols-[1fr_auto] gap-4 items-center px-4 py-3 bg-parchment-50 border border-border-light rounded-md"
                >
                  <span className="text-ink-700 text-[0.9375rem]">
                    {pk.label ?? `${pk.qty} in matching style`}
                    <span className="text-ink-400 text-xs ml-2">
                      · ${Math.round(pk.price / pk.qty)}/piece
                    </span>
                  </span>
                  <strong className="font-display text-[1.125rem] text-burgundy-700">
                    ${pk.price}
                  </strong>
                </div>
              ))}
            </div>
          </div>
          <div className="md:border-l md:border-dashed md:border-border-light md:pl-7 md:text-right">
            <span className="block font-display text-[2rem] font-semibold text-burgundy-700 leading-none">
              {min === max ? `$${min}` : priceLine}
            </span>
            <span className="block text-xs font-medium uppercase tracking-[0.1em] text-ink-500 mt-1.5">
              {p.pack.packs.length === 1 ? 'one quantity' : `${p.pack.packs.length} quantities`}
            </span>
            <Button href="/order" variant="primary" size="md" className="mt-4">
              Start a pack
            </Button>
          </div>
        </div>
      )
    }

    /* ---- 5 of 8: PCT_UPLIFT (big +X% display) ---- */
    case 'pct_uplift': {
      return (
        <BdCard
          title={product.name}
          body={
            product.description ??
            'Applied on top of the standard quote for any commercially-used piece. Covers broad commercial use in the agreed scope.'
          }
          priceNum={`+${p.uplift.percent}%`}
          priceNote={p.uplift.label ?? 'of base job price'}
          ctaLabel="Discuss scope"
          ctaHref="/order"
          ctaVariant="primary"
        />
      )
    }

    /* ---- 6 of 8: MONTHLY_RECURRING ---- */
    case 'monthly_recurring': {
      return (
        <div className="bg-parchment-100 border border-border-light rounded-xl p-8 flex flex-col gap-4 max-w-[480px]">
          <div className="flex items-baseline gap-2 pb-3 border-b border-dashed border-border-light">
            <span className="font-display text-[2.75rem] font-semibold text-ink-900 leading-none tracking-[-0.02em]">
              ${p.monthly.monthly_price}
            </span>
            <span className="text-base text-ink-500">/ month</span>
          </div>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {p.monthly.included.map((i) => (
              <li key={i} className="flex gap-2.5 items-start text-[0.9375rem] text-ink-700">
                <CheckIcon className="w-3.5 h-3.5 text-gold-700 flex-shrink-0 mt-1" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
          {p.monthly.cadence && (
            <p className="text-[0.8125rem] text-ink-500 italic">{p.monthly.cadence}</p>
          )}
          <Button href="/subscription" variant="primary" size="md" className="self-start mt-2">
            Subscribe
          </Button>
        </div>
      )
    }

    /* ---- 7 of 8: QUOTE_ONLY ---- */
    case 'quote_only': {
      const priceNum = p.quote.from_price != null ? `From $${p.quote.from_price}` : 'Custom quote'
      return (
        <BdCard
          title={product.name}
          body={
            product.description ??
            'Quote-based pricing. Scope depends on size, detail, and labels. Send a brief and the studio will quote within 48 hours.'
          }
          priceNum={priceNum}
          priceNote="request a quote"
          ctaLabel={p.quote.cta_label ?? 'Send a brief'}
          ctaHref={p.quote.cta_href ?? '/order'}
          ctaVariant="gold"
        />
      )
    }

    /* ---- 8 of 8: FLAT (single $X card) ---- */
    case 'flat': {
      return (
        <BdCard
          title={product.name}
          body={
            product.description ??
            'Single flat price. No tiers, no add-ons. Includes everything listed below.'
          }
          priceNum={`$${p.flat.price}`}
          priceNote={p.flat.label ?? 'flat price'}
          ctaLabel="Add to a commission"
          ctaHref="/order"
          ctaVariant="primary"
        />
      )
    }
  }
}

/* =====================================================================
   BdCard — the canonical `.bd-card` from the V2 design: 1fr / auto grid
   with a left info column and a right price column separated by a dashed
   vertical rule. Used by range, pct_uplift, quote_only, and flat modes.
   ===================================================================== */
function BdCard({
  title,
  body,
  priceNum,
  priceNote,
  ctaLabel,
  ctaHref,
  ctaVariant = 'primary',
}: {
  title: string
  body: string
  priceNum: string
  priceNote: string
  ctaLabel: string
  ctaHref: string
  ctaVariant?: 'primary' | 'gold' | 'outline'
}) {
  return (
    <div className="bg-parchment-100 border border-border-light rounded-lg p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-7 items-center">
      <div>
        <h4 className="font-display text-xl font-semibold text-ink-900 mb-1">
          {title}
        </h4>
        <p className="text-[0.9375rem] text-ink-500 leading-[1.55] max-w-[50ch]">
          {body}
        </p>
      </div>
      <div className="md:border-l md:border-dashed md:border-border-light md:pl-7 md:text-right">
        <span className="block font-display text-[2rem] font-semibold text-burgundy-700 leading-none">
          {priceNum}
        </span>
        <span className="block text-xs font-medium uppercase tracking-[0.1em] text-ink-500 mt-1.5">
          {priceNote}
        </span>
        <Button href={ctaHref} variant={ctaVariant} size="md" className="mt-4">
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}

/* =====================================================================
   Inline icons — small, used by truths strip / meta row / feature bullets
   ===================================================================== */
function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 text-gold-500" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}

function ClockIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

function ChartIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M3 12h4l3 8 4-16 3 8h4" />
    </svg>
  )
}

function DeliveryIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16v12H4z" />
      <path d="M4 20h16" />
    </svg>
  )
}
