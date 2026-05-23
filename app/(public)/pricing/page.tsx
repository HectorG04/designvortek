import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
import SectionLabel from '@/components/ui/SectionLabel'
import Markdown from '@/components/ui/Markdown'
import PaperTexture from '@/components/decor/PaperTexture'
import USDDisclaimer from '@/components/ui/USDDisclaimer'
import {
  BUCKETS,
  bucketLabel,
  fetchBucketProducts,
  formatTurnaround,
  type ServiceBucket,
  type ServiceProduct,
} from '@/lib/services-server'
import { cn } from '@/lib/utils'

/* =====================================================================
   PRICING — CMS-backed, restructured into 6 per-bucket sections.

   Each section lists every product in the bucket with a price card
   shaped by the product's pricing_mode. Six pricing-mode renderers
   below cover the cheatsheet from the Services Restructure Brief.

   ISR keeps the page fresh against admin edits at most every 60s.
   ===================================================================== */

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Pricing · Design Vortex',
  description:
    'Transparent USD pricing across 6 buckets: character work, party work, GM/world-building, tokens, subscriptions, and commercial. Flat-rate quotes, 2 revisions, 30% deposit.',
  alternates: { canonical: '/pricing' },
}

const ArrowRightMd = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Why flat-rate instead of hourly?',
    a: 'Because you deserve to know the price before we start. Hourly billing punishes care, the artist who polishes for an extra two hours should not cost you more. Fixed scope, fixed price, every time.',
  },
  {
    q: 'How does payment work?',
    a: 'A **30% deposit** holds your slot. The deposit becomes non-refundable once we send the first sketch. The remaining balance is due on delivery. All payments through Stripe, including cards, Apple Pay, and Google Pay.',
  },
  {
    q: 'What if I need to cancel?',
    a: 'Before first sketch: **100% refundable**. After first sketch: deposit covers our sketch work. After paint begins: pro-rated based on stage completed. See full [refund policy](/refunds).',
  },
  {
    q: 'Do you charge in any other currency?',
    a: 'No. All pricing is **USD only**. International cards are billed at the current exchange rate by your card provider.',
  },
  {
    q: 'What about commercial use?',
    a: 'Personal use is included. **Commercial licensing is +40% of the base job price (flat)**, covering books, paid streaming, merchandise, indie game assets, and paid Patreons. See [/commercial](/commercial) for retainer arrangements.',
  },
]

export default async function PricingPage() {
  const bucketProducts = await fetchBucketProducts()
  const visibleBuckets = BUCKETS.filter((b) => (bucketProducts[b.slug]?.length ?? 0) > 0)

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        <PageHero
          eyebrow="Pricing"
          title={
            <>
              Transparent pricing.<br />
              <em className="font-display italic font-medium text-burgundy-700">No surprises.</em>
            </>
          }
          description="Flat-rate quotes, fixed scopes, no hourly games. Every price below is what you'll actually pay. The quote you approve is the price we charge."
        />

        {/* USD disclaimer just below the hero */}
        <section className="pb-10">
          <Container>
            <div className="flex justify-center">
              <USDDisclaimer variant="block" />
            </div>
          </Container>
        </section>

        {/* Per-bucket sections */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="flex flex-col gap-20">
              {visibleBuckets.map((bucket) => {
                const products = bucketProducts[bucket.slug] ?? []
                return (
                  <BucketSection
                    key={bucket.slug}
                    slug={bucket.slug}
                    label={bucket.label}
                    tagline={bucket.tagline}
                    products={products}
                  />
                )
              })}
            </div>
          </Container>
        </section>

        {/* Pricing FAQ */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 max-w-[1080px] mx-auto">
              <div>
                <div className="mb-3">
                  <SectionLabel>Pricing questions</SectionLabel>
                </div>
                <h2
                  className="font-display font-semibold leading-[1.1] tracking-tight text-ink-900 mb-4 [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  The fine <em>print</em>
                </h2>
                <p className="text-ink-500 leading-[1.65] mb-5">
                  Common questions about payment, refunds, and what&rsquo;s covered.
                </p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:gap-3.5 transition-all"
                >
                  Full FAQ <ArrowRightMd />
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {FAQ.map((item, i) => (
                  <details
                    key={i}
                    open={i === 0}
                    className="group bg-parchment-100 border border-border-light rounded-xl open:bg-parchment-50 open:border-border-medium open:shadow-sm transition-colors"
                  >
                    <summary className="list-none cursor-pointer flex items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-display text-xl font-semibold text-ink-900 leading-[1.3]">
                        {item.q}
                      </span>
                      <span className="flex-shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] bg-parchment-50 text-burgundy-700 border border-border-medium group-open:bg-burgundy-700 group-open:text-cream-50 group-open:border-burgundy-700 group-open:rotate-45">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-5 text-base text-ink-700 leading-[1.7] max-w-[64ch]">
                      <Markdown>{item.a}</Markdown>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* CTA closer */}
        <section className="relative bg-tome-950 text-cream-50 py-16 md:py-20 text-center overflow-hidden">
          <PaperTexture variant="cream" opacity={0.5} />
          <div className="relative">
            <Container>
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.15] tracking-tight mb-4 mx-auto max-w-[28ch] [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
              >
                Send a <em>brief</em>, get a fixed quote.
              </h2>
              <p className="text-base text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-7">
                48 hours to a quote. 30% deposit holds your slot. Refundable until first sketch.
              </p>
              <Link
                href="/order"
                className="inline-flex items-center justify-center gap-2 bg-gold-500 text-ink-900 px-9 py-[18px] rounded-full font-body text-[0.8125rem] font-semibold uppercase tracking-[0.12em] hover:bg-gold-300 hover:-translate-y-px transition-all"
              >
                Start commission <ArrowRightMd />
              </Link>
            </Container>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}

/* =====================================================================
   BucketSection — one bucket with all its products laid out beneath.
   ===================================================================== */
function BucketSection({
  slug,
  label,
  tagline,
  products,
}: {
  slug: ServiceBucket
  label: string
  tagline: string
  products: ServiceProduct[]
}) {
  const sectionHref =
    slug === 'subscription' ? '/subscription' :
    slug === 'commercial'   ? '/commercial'   :
    `/services/${slug}`

  return (
    <div>
      <div className="flex flex-wrap justify-between items-end gap-4 pb-4 mb-7 border-b border-border-light">
        <div>
          <div className="font-display text-[2rem] font-semibold text-ink-900 leading-[1.1]">
            {label}
          </div>
          <div className="font-accent text-[1.25rem] text-burgundy-700">{tagline}</div>
        </div>
        <Link
          href={sectionHref}
          className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-burgundy-700 hover:gap-2.5 transition-all"
        >
          See full {label.toLowerCase()} <ArrowRightMd />
        </Link>
      </div>

      <div className="flex flex-col gap-10">
        {products.map((product) => (
          <ProductRow key={product.slug} product={product} />
        ))}
      </div>
    </div>
  )
}

/* =====================================================================
   ProductRow — name + pricing card per product.
   ===================================================================== */
function ProductRow({ product }: { product: ServiceProduct }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-start">
      <div>
        <h3 className="font-display text-xl font-semibold text-ink-900 leading-snug">
          {product.name}
        </h3>
        {product.eyebrow && (
          <div className="font-accent text-base text-burgundy-700 mt-0.5">
            {product.eyebrow}
          </div>
        )}
        <p className="text-[0.875rem] text-ink-500 mt-2 leading-[1.6]">
          {product.lede}
        </p>
        <div className="mt-3 text-[0.75rem] text-ink-500 font-mono">
          Turnaround:{' '}
          <strong className="font-display text-ink-700 font-semibold">
            {formatTurnaround(product)}
          </strong>
          {product.revisionsIncluded != null && (
            <>
              {' · '}
              {product.revisionsIncluded} {product.revisionsIncluded === 1 ? 'revision' : 'revisions'} included
            </>
          )}
        </div>
      </div>

      <PricingDisplay product={product} />
    </div>
  )
}

/* =====================================================================
   PricingDisplay — same per-mode renderer used by /services/[slug],
   stripped down for the pricing page (no examples, no FAQ inline).
   ===================================================================== */
function PricingDisplay({ product }: { product: ServiceProduct }) {
  const p = product.pricing

  switch (p.mode) {
    case 'tiered': {
      return (
        <div className={cn(
          'grid gap-4',
          p.tiers.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3',
        )}>
          {p.tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'relative rounded-2xl px-7 py-8 flex flex-col gap-4',
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
                <div className="font-display text-2xl font-semibold text-ink-900">
                  {tier.name}
                </div>
                {tier.note && (
                  <div className="font-accent text-base text-burgundy-700 -mt-1">
                    {tier.note}
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-2 py-3 border-y border-dashed border-border-light">
                <span className="font-display text-[2.75rem] font-semibold text-ink-900 leading-none tracking-[-0.02em]">
                  ${tier.price}
                </span>
              </div>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0 flex-1">
                {tier.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2.5 items-start text-[0.9375rem] text-ink-700 leading-[1.4]">
                    <span className="text-gold-700 flex-shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    }
    case 'range': {
      return (
        <CompactPrice
          primary={`From $${p.range.low}`}
          secondary={`to $${p.range.high}`}
          note="Quoted inside this range per brief."
        />
      )
    }
    case 'per_extra': {
      return (
        <CompactPrice
          primary={`From $${p.per_extra.base}`}
          secondary={`+$${p.per_extra.extra_low}–${p.per_extra.extra_high} per extra`}
          note={p.per_extra.extra_label}
        />
      )
    }
    case 'pack_with_qty': {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {p.pack.packs.map((pk) => (
            <div
              key={pk.qty}
              className="bg-parchment-100 border border-border-light rounded-2xl px-7 py-8 flex flex-col gap-3"
            >
              <div className="font-display text-2xl font-semibold text-ink-900">
                {pk.qty}-pack
              </div>
              <div className="flex items-baseline gap-2 py-3 border-y border-dashed border-border-light">
                <span className="font-display text-[2.75rem] font-semibold text-ink-900 leading-none tracking-[-0.02em]">
                  ${pk.price}
                </span>
                <span className="text-[0.875rem] text-ink-500">
                  · ${Math.round(pk.price / pk.qty)}/piece
                </span>
              </div>
              {pk.label && <p className="text-[0.875rem] text-ink-500">{pk.label}</p>}
            </div>
          ))}
        </div>
      )
    }
    case 'pct_uplift': {
      return (
        <CompactPrice
          primary={`+${p.uplift.percent}%`}
          secondary={p.uplift.label ?? 'of base job price'}
          note="Applied on top of the standard quote for commercially-used pieces."
        />
      )
    }
    case 'monthly_recurring': {
      return (
        <div className="bg-parchment-100 border border-border-light rounded-2xl px-7 py-8 flex flex-col gap-4">
          <div className="flex items-baseline gap-2 pb-3 border-b border-dashed border-border-light">
            <span className="font-display text-[2.5rem] font-semibold text-ink-900 leading-none tracking-[-0.02em]">
              ${p.monthly.monthly_price}
            </span>
            <span className="text-[0.875rem] text-ink-500">/ month</span>
          </div>
          <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
            {p.monthly.included.map((i) => (
              <li key={i} className="flex gap-2.5 items-start text-[0.9375rem] text-ink-700 leading-[1.4]">
                <span className="text-gold-700 flex-shrink-0">✓</span>
                <span>{i}</span>
              </li>
            ))}
          </ul>
          {p.monthly.cadence && (
            <p className="text-[0.875rem] text-ink-500 italic">{p.monthly.cadence}</p>
          )}
        </div>
      )
    }
    case 'quote_only': {
      const fromLine = p.quote.from_price != null ? `From $${p.quote.from_price}` : 'Custom quote'
      return (
        <div className="bg-parchment-100 border border-border-light rounded-2xl px-7 py-8 flex flex-col gap-4">
          <div className="font-display text-2xl font-semibold text-ink-900">{fromLine}</div>
          <p className="text-[0.9375rem] text-ink-700 leading-[1.55]">
            Pricing varies per brief. Send the details and we send a fixed quote within 48 hours.
          </p>
          {p.quote.cta_label && p.quote.cta_href && (
            <Link
              href={p.quote.cta_href}
              className="inline-flex items-center gap-2 self-start mt-1 bg-burgundy-700 text-cream-50 px-5 py-2.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] hover:bg-burgundy-500 transition-all"
            >
              {p.quote.cta_label}
            </Link>
          )}
        </div>
      )
    }
    case 'flat': {
      return (
        <CompactPrice
          primary={`$${p.flat.price}`}
          secondary={p.flat.label ?? ''}
        />
      )
    }
  }
}

function CompactPrice({
  primary,
  secondary,
  note,
}: {
  primary: string
  secondary?: string
  note?: string | null
}) {
  return (
    <div className="bg-parchment-100 border border-border-light rounded-2xl px-7 py-8 flex flex-col gap-4">
      <div className="flex items-baseline gap-2 pb-3 border-b border-dashed border-border-light">
        <span className="font-display text-[2.75rem] font-semibold text-ink-900 leading-none tracking-[-0.02em]">
          {primary}
        </span>
        {secondary && <span className="text-[0.875rem] text-ink-500">{secondary}</span>}
      </div>
      {note && <p className="text-[0.875rem] text-ink-700 leading-[1.5]">{note}</p>}
    </div>
  )
}
