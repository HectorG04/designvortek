import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
import Button from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'
import {
  BUCKETS,
  fetchBucketProducts,
  formatPriceLine,
  type ServiceBucket,
  type ServiceProduct,
} from '@/lib/services-server'

/* =====================================================================
   SERVICES INDEX — CMS-backed.

   Restructured from the old 5 flat services to the new 5 bucket layout
   (plus Subscription). Each bucket card lists the products inside it
   with their "from $X" pricing. The Commercial bucket is omitted here
   because it has its own landing page at /commercial.

   ISR keeps the cards fresh against admin edits without a rebuild.
   ===================================================================== */

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Services · Design Vortex',
  description:
    'Five buckets of hand-painted commission work: character portraits, party illustrations, GM/world-building, VTT tokens, and monthly subscriptions. Plus commercial and publisher arrangements.',
  alternates: { canonical: '/services' },
}

/* Design-spec gradients matching .ds-ph-* from design-system.css */
const BUCKET_GRADIENTS: Record<ServiceBucket, string> = {
  'character-work':
    'radial-gradient(ellipse at 30% 20%, rgba(232,200,128,0.6), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(107,31,42,0.6), transparent 60%), linear-gradient(135deg, #2a1810, #3e1218 60%, #1a130c)',
  'party-work':
    'radial-gradient(ellipse at 20% 40%, rgba(201,160,74,0.5), transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(31,77,58,0.6), transparent 55%), linear-gradient(160deg, #3e1218, #6B1F2A, #1F4D3A)',
  'gm-world-building':
    'radial-gradient(ellipse at 50% 80%, rgba(232,200,128,0.4), transparent 60%), linear-gradient(180deg, #1F4D3A 0%, #6B1F2A 60%, #1a130c 100%)',
  tokens:
    'radial-gradient(circle at 50% 50%, rgba(212,162,76,0.5), transparent 50%), radial-gradient(circle at 50% 50%, rgba(107,31,42,0.8), transparent 70%), linear-gradient(135deg, #1a130c, #251A10)',
  commercial:
    'radial-gradient(ellipse at 50% 30%, rgba(243,214,217,0.6), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(201,160,74,0.4), transparent 60%), linear-gradient(160deg, #6B1F2A, #8A2A35 70%, #3e1218)',
  subscription:
    'radial-gradient(ellipse at 50% 50%, rgba(232,200,128,0.5), transparent 55%), linear-gradient(140deg, #1F4D3A 0%, #2a1810 70%, #6B1F2A 100%)',
}

/* Bucket landing routes — most go to /services/[bucket-slug]; commercial
 * and subscription get dedicated pages designed in Phase 4. */
function bucketHref(slug: ServiceBucket): string {
  if (slug === 'subscription') return '/subscription'
  if (slug === 'commercial') return '/commercial'
  return `/services/${slug}`
}

const ArrowRightSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3 h-3">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const ArrowRightMd = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3.5 h-3.5">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export default async function ServicesIndexPage() {
  const bucketProducts = await fetchBucketProducts()

  // Hide buckets with zero published products (empty buckets just look broken)
  const visibleBuckets = BUCKETS.filter(
    (b) => b.showOnIndex && (bucketProducts[b.slug]?.length ?? 0) > 0,
  )

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        <PageHero
          eyebrow="Services"
          title={
            <>
              Five buckets of <em className="font-display italic font-medium text-burgundy-700">hand-painted</em> work.
            </>
          }
          description="Character portraits, party illustrations, GM and world-building, VTT tokens, and monthly subscriptions. Every bucket carries the same craft. Commercial and publisher arrangements live separately."
        />

        {/* Bucket cards — 5 visible, 3-col on desktop, 2-col tablet, 1-col mobile */}
        <section className="pb-12 md:pb-16">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleBuckets.map((bucket) => {
                const products = bucketProducts[bucket.slug] ?? []
                const minPriceLine = (() => {
                  // Find the lowest "from" price across products in the bucket
                  const lines = products
                    .map((p) => formatPriceLine(p))
                    .filter((s) => s.startsWith('From $'))
                  if (lines.length === 0) {
                    // Subscription / quote-only buckets
                    return products[0] ? formatPriceLine(products[0]) : 'Quote'
                  }
                  const numbers = lines
                    .map((s) => Number(s.replace(/[^0-9.]/g, '')))
                    .filter((n) => Number.isFinite(n))
                  const min = Math.min(...numbers)
                  return `From $${min}`
                })()
                return (
                  <Link
                    key={bucket.slug}
                    href={bucketHref(bucket.slug)}
                    className="group bg-parchment-50 border border-border-light rounded-3xl overflow-hidden flex flex-col transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:border-border-medium hover:shadow-[0_8px_24px_rgba(201,160,74,0.18)]"
                  >
                    {/* Image — aspect 4/3, gradient placeholder per design's .ds-ph-* */}
                    <div
                      className="aspect-[4/3] relative"
                      style={{ background: BUCKET_GRADIENTS[bucket.slug] }}
                      aria-hidden="true"
                    />

                    {/* Body */}
                    <div className="p-7 flex-1 flex flex-col gap-3">
                      <h3 className="font-display text-2xl font-semibold text-ink-900 leading-[1.2]">
                        {bucket.label}
                      </h3>

                      <div className="font-accent text-[1.125rem] text-burgundy-700 -mt-2">
                        {bucket.tagline}
                      </div>

                      {/* List the products inside this bucket */}
                      <ul className="flex flex-col gap-1.5 mt-1 mb-2">
                        {products.slice(0, 4).map((p) => (
                          <ProductLine key={p.slug} product={p} />
                        ))}
                        {products.length > 4 && (
                          <li className="text-[0.8125rem] text-ink-500 italic">
                            + {products.length - 4} more
                          </li>
                        )}
                      </ul>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3.5 border-t border-border-light mt-auto">
                        <span className="font-body text-[0.625rem] font-bold uppercase tracking-[0.15em] text-gold-700 whitespace-nowrap">
                          {minPriceLine}
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                          Browse <ArrowRightSm />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Container>
        </section>

        {/* Commercial callout — sits between the bucket grid and the closer.
            Commercial doesn't appear in the grid since it has its own
            landing page; this card surfaces it from the index. */}
        <section className="pt-4 pb-16 md:pb-24">
          <Container>
            <SectionHead
              eyebrow="For publishers and studios"
              title={
                <>
                  Commercial &amp; <em className="font-display italic font-medium text-burgundy-700">publisher</em> work
                </>
              }
              description="Books, indie game art, Kickstarter campaigns, merch, streaming. Licensing handled transparently via a +40% uplift, with retainer arrangements for ongoing collaborators."
            />
            <div className="flex justify-center">
              <Button href="/commercial" variant="primary" size="md">
                See commercial details <ArrowRightMd />
              </Button>
            </div>
          </Container>
        </section>

        {/* CTA closer — dark tome bg with cream grain overlay */}
        <section className="relative bg-tome-950 text-cream-50 py-20 text-center overflow-hidden">
          <PaperTexture variant="cream" opacity={0.5} />
          <div className="relative">
            <Container>
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.15] tracking-tight mb-4 mx-auto max-w-[24ch] [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
              >
                Know what you <em>need</em>?
              </h2>
              <p className="text-base text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-7">
                Send a brief in three minutes. We send a fixed quote within 48 hours. Prices in USD.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-3">
                <Button href="/order" variant="gold" size="lg">
                  Start commission <ArrowRightMd />
                </Button>
                <Button href="/portfolio" variant="outline-cream" size="lg">
                  See portfolio
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

/* ---------- Helper ---------- */
function ProductLine({ product }: { product: ServiceProduct }) {
  return (
    <li className="flex items-baseline justify-between gap-3 text-[0.875rem]">
      <span className="text-ink-700 truncate">{product.name}</span>
      <span className="font-mono text-[0.75rem] text-ink-500 whitespace-nowrap">
        {formatPriceLine(product)}
      </span>
    </li>
  )
}
