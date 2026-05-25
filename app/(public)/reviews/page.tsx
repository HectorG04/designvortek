import type { Metadata } from 'next'
import { Star, Quote, ArrowRight } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import Markdown from '@/components/ui/Markdown'
import { fetchAllReviews, fetchAggregateRating } from '@/lib/reviews-server'
import { formatReviewDate } from '@/lib/reviews'

/* =====================================================================
   REVIEWS PAGE — Supabase-backed (with in-memory fallback).

   Reads approved reviews from the `reviews` table via the server-only
   fetcher. Aggregate rating (average + breakdown bars) is computed from
   whatever set of reviews is returned, so the JSON-LD AggregateRating
   matches the actual reviews on the page.

   ISR rebuilds at most every 60 seconds — admin approval / unapproval /
   feature toggles propagate without a deploy.
   ===================================================================== */

export const metadata: Metadata = {
  title: 'Client Reviews | Hand-Painted Character Art Commissions',
  description:
    'See what D&D players, DMs & tabletop gamers say about commissioning with Design Vortex. Real reviews, real painted portraits, real results.',
  alternates: { canonical: '/reviews' },
}

export const revalidate = 60

export default async function ReviewsPage() {
  const [reviews, aggregate] = await Promise.all([
    fetchAllReviews(),
    fetchAggregateRating(),
  ])

  /* JSON-LD: AggregateRating + each review nested under Organization. */
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Design Vortex',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: aggregate.average.toString(),
      reviewCount: aggregate.total.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
        bestRating: '5',
      },
      author: { '@type': 'Person', name: r.customerName },
      reviewBody: r.content,
      datePublished: r.date,
    })),
  }

  return (
    <>
      <SiteHeader />
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />

        <PageHero
          eyebrow="Reviews"
          title={
            <>
              What clients <em className="font-display italic font-medium text-burgundy-700">actually</em> say
            </>
          }
          description={`${aggregate.total} reviews from the people who commissioned the work. Every one verified.`}
        />

        {/* Aggregate summary */}
        <section className="pb-16">
          <Container>
            <div className="bg-parchment-50 border border-border-light rounded-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-16 items-center max-w-[960px] mx-auto">
              {/* Score */}
              <div className="text-center md:border-r md:border-border-light md:pr-10">
                <div
                  className="font-display font-semibold text-burgundy-700 leading-none"
                  style={{ fontSize: 'clamp(4rem, 8vw, 6rem)' }}
                >
                  {aggregate.average.toFixed(1)}
                </div>
                <div className="flex justify-center gap-0.5 text-gold-500 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill={i < Math.round(aggregate.average) ? 'currentColor' : 'none'}
                      stroke={i < Math.round(aggregate.average) ? 'none' : 'currentColor'}
                      strokeWidth={i < Math.round(aggregate.average) ? 0 : 1.5}
                      className={i < Math.round(aggregate.average) ? 'text-gold-500' : 'text-ink-300'}
                    />
                  ))}
                </div>
                <div className="text-xs uppercase tracking-[0.12em] text-ink-500 font-semibold mt-3">
                  across {aggregate.total} reviews
                </div>
              </div>

              {/* Breakdown bars */}
              <div className="space-y-3">
                {aggregate.breakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700 w-10">
                      {row.stars}
                      <Star size={11} fill="currentColor" strokeWidth={0} className="text-gold-500" />
                    </span>
                    <div className="flex-1 h-2.5 bg-parchment-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold-700 to-gold-500 rounded-full"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink-500 w-10 text-right tabular-nums">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Review grid */}
        <section className="pb-24 md:pb-32">
          <Container>
            {reviews.length === 0 ? (
              <div className="text-center text-ink-500 py-16">
                Reviews are loading. Try again in a moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {reviews.map((r) => (
                  <article
                    key={r.key}
                    className="bg-parchment-50 border border-border-light rounded-2xl p-7 flex flex-col hover:border-border-medium hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow"
                  >
                    <Quote size={28} className="text-gold-300 mb-3" strokeWidth={1.5} />

                    <div className="flex gap-px mb-4 text-gold-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < r.rating ? 'currentColor' : 'none'}
                          stroke={i < r.rating ? 'none' : 'currentColor'}
                          strokeWidth={i < r.rating ? 0 : 1.5}
                          className={i < r.rating ? 'text-gold-500' : 'text-ink-300'}
                        />
                      ))}
                    </div>

                    <blockquote className="text-ink-700 text-[0.9375rem] leading-[1.7] mb-6 flex-1 [&_p]:mb-0 [&_strong]:text-ink-900 [&_strong]:font-semibold">
                      <Markdown>{r.content}</Markdown>
                    </blockquote>

                    <div className="h-px bg-border-light mb-5" aria-hidden="true" />

                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-semibold text-cream-50 flex-shrink-0"
                        style={{
                          background:
                            'linear-gradient(135deg, var(--color-burgundy-700), var(--color-burgundy-500))',
                        }}
                        aria-hidden="true"
                      >
                        {r.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-display text-base font-semibold text-ink-900 leading-tight truncate">
                          {r.customerName}
                        </div>
                        <div className="text-xs text-ink-500 mt-0.5">
                          {r.role} · {formatReviewDate(r.date)}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="text-center mt-16">
              <Button href="/order" variant="outline" size="md">
                Be the next review <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
              <div className="text-xs text-ink-500 mt-3">
                Showing {reviews.length} of {aggregate.total}
              </div>
            </div>
          </Container>
        </section>

        {/* CTA strip */}
        <section className="relative bg-tome-950 text-cream-50 py-24 overflow-hidden">
          <Container>
            <div className="max-w-[640px] mx-auto text-center">
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}
              >
                Be the <em className="font-display italic font-medium text-gold-glow">next</em> review
              </h2>
              <p className="text-lg text-cream-200 leading-relaxed mt-4">
                Slots open every month. Yours could be the next painting clients write about.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-3 mt-8">
                <Button href="/order" variant="gold" size="lg">
                  Start commission <ArrowRight size={14} strokeWidth={1.8} />
                </Button>
                <Button href="/portfolio" variant="outline-cream" size="lg">
                  See the work first
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
