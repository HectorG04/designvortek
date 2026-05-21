import type { Metadata } from 'next'
import { Star, Quote, ArrowRight } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Reviews · 4.9 stars across 247 commissions · Design Vortex',
  description:
    'Four years, 500+ commissions, 247 verified reviews. Real words from D&D players, Dungeon Masters, and gift givers who have worked with us since 2022.',
  alternates: { canonical: '/reviews' },
}

/* =====================================================================
   REVIEW DATA + AGGREGATE
   ===================================================================== */

interface Review {
  quote: string
  name: string
  initials: string
  role: string
  rating: number
  date: string
}

const REVIEWS: Review[] = [
  {
    quote: "Lyra came back better than I could have pictured. Every revision sharpened the piece. This isn't a transaction — it's a collaboration.",
    name: 'Aria Mendel',
    initials: 'AM',
    role: 'Character commission',
    rating: 5,
    date: 'Mar 2026',
  },
  {
    quote: 'Eight NPCs for Curse of Strahd, all in matching style, delivered on a schedule I could plan sessions around. Worth every dollar.',
    name: 'Marcus K.',
    initials: 'MK',
    role: 'NPC pack',
    rating: 5,
    date: 'Feb 2026',
  },
  {
    quote: 'A wedding party portrait for my brother and his fiancée. They cried. I cried. The piece hangs above their mantel now.',
    name: 'Priya R.',
    initials: 'PR',
    role: 'Party portrait · gift',
    rating: 5,
    date: 'Feb 2026',
  },
  {
    quote: "I'd commissioned three artists for my drow ranger over five years. This is the one that finally got him. The patience and care show in every brushstroke.",
    name: 'James T.',
    initials: 'JT',
    role: 'Character commission',
    rating: 5,
    date: 'Jan 2026',
  },
  {
    quote: 'VTT tokens for my whole party. Roll20-ready, perfect at every zoom. Players actually got excited when they saw them on the map.',
    name: 'Sasha E.',
    initials: 'SE',
    role: 'VTT token pack',
    rating: 5,
    date: 'Jan 2026',
  },
  {
    quote: "My indie game's cover. We went through three artists before finding the right fit. Theo got it on the second sketch. The book sold out the print run.",
    name: 'Devon L.',
    initials: 'DL',
    role: 'Custom book cover',
    rating: 5,
    date: 'Dec 2025',
  },
  {
    quote: 'Communication was thoughtful. The painting was better than my reference board. And it arrived a day early.',
    name: 'Rosa C.',
    initials: 'RC',
    role: 'Character commission',
    rating: 5,
    date: 'Dec 2025',
  },
  {
    quote: "Anniversary gift for my partner's wedding-themed campaign. Five player characters in one frame, all consistent. Made his year.",
    name: 'Nadia L.',
    initials: 'NL',
    role: 'Party portrait',
    rating: 5,
    date: 'Nov 2025',
  },
  {
    quote: "First commission I've ever gotten where the artist actually asked good questions. Felt like a real conversation, not a transaction.",
    name: 'Emma H.',
    initials: 'EH',
    role: 'Character commission',
    rating: 4,
    date: 'Nov 2025',
  },
  {
    quote: 'Twenty NPCs for our homebrew world. The style sheet they delivered up front saved us hours of guesswork. Each portrait feels like the same hand.',
    name: 'Theo W.',
    initials: 'TW',
    role: 'NPC pack · 20 portraits',
    rating: 5,
    date: 'Oct 2025',
  },
  {
    quote: 'Surprise birthday gift for my partner. The brief was a single voice memo. They asked smart questions, then nailed it on the first pass.',
    name: 'Kim O.',
    initials: 'KO',
    role: 'Character commission · gift',
    rating: 5,
    date: 'Oct 2025',
  },
  {
    quote: 'Half-orc barbarian, scarred and tired. Other artists make my character look like a stock hero. This one looks like a person.',
    name: 'Ravi P.',
    initials: 'RP',
    role: 'Character commission',
    rating: 5,
    date: 'Sep 2025',
  },
]

const AGGREGATE = {
  average: 4.9,
  total: 247,
  breakdown: [
    { stars: 5, count: 224, pct: 91 },
    { stars: 4, count: 18,  pct: 7 },
    { stars: 3, count: 4,   pct: 1.5 },
    { stars: 2, count: 1,   pct: 0.5 },
    { stars: 1, count: 0,   pct: 0 },
  ],
}

/* =====================================================================
   PAGE
   ===================================================================== */

export default function ReviewsPage() {
  // JSON-LD: AggregateRating + Review array under Organization
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Design Vortex',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: AGGREGATE.average.toString(),
      reviewCount: AGGREGATE.total.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    review: REVIEWS.map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
        bestRating: '5',
      },
      author: { '@type': 'Person', name: r.name },
      reviewBody: r.quote,
      datePublished: r.date,
    })),
  }

  return (
    <>
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />

        <PageHero
          eyebrow="Reviews"
          title={<>What clients <em className="font-display italic font-medium text-burgundy-700">actually</em> say</>}
          description='Four years, 500+ commissions, 247 reviews. Every one verified from a real client. Read them all — the good, the long, the occasional "made me cry."'
        />

        {/* Aggregate summary */}
        <section className="pb-16">
          <Container>
            <div className="bg-parchment-50 border border-border-light rounded-2xl p-8 md:p-12 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10 md:gap-16 items-center max-w-[960px] mx-auto">
              {/* Score */}
              <div className="text-center md:border-r md:border-border-light md:pr-10">
                <div className="font-display font-semibold text-burgundy-700 leading-none" style={{ fontSize: 'clamp(4rem, 8vw, 6rem)' }}>
                  {AGGREGATE.average}
                </div>
                <div className="flex justify-center gap-0.5 text-gold-500 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <div className="text-xs uppercase tracking-[0.12em] text-ink-500 font-semibold mt-3">
                  across {AGGREGATE.total} reviews
                </div>
              </div>

              {/* Breakdown bars */}
              <div className="space-y-3">
                {AGGREGATE.breakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700 w-10">
                      {row.stars}<Star size={11} fill="currentColor" strokeWidth={0} className="text-gold-500" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {REVIEWS.map((r) => (
                <article
                  key={r.name}
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

                  <blockquote className="text-ink-700 text-[0.9375rem] leading-[1.7] mb-6 flex-1">
                    &ldquo;{r.quote}&rdquo;
                  </blockquote>

                  <div className="h-px bg-border-light mb-5" aria-hidden="true" />

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-semibold text-cream-50 flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--color-burgundy-700), var(--color-burgundy-500))' }}
                      aria-hidden="true"
                    >
                      {r.initials}
                    </div>
                    <div>
                      <div className="font-display text-base font-semibold text-ink-900 leading-tight">{r.name}</div>
                      <div className="text-xs text-ink-500 mt-0.5">{r.role} · {r.date}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-16">
              <Button variant="outline" size="md">
                Load more reviews <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
              <div className="text-xs text-ink-500 mt-3">Showing {REVIEWS.length} of {AGGREGATE.total}</div>
            </div>
          </Container>
        </section>

        {/* CTA strip */}
        <section className="relative bg-tome-950 text-cream-50 py-24 overflow-hidden">
          <Container>
            <div className="max-w-[640px] mx-auto text-center">
              <h2 className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}>
                Be the <em className="font-display italic font-medium text-gold-glow">next</em> review
              </h2>
              <p className="text-lg text-cream-200 leading-relaxed mt-4">
                Two May slots remain. Yours could be the next painting clients write about.
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
