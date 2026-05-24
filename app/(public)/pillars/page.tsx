import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import {
  fetchAllPillars,
  fetchActivePillarGenres,
  GENRES,
  genreBySlug,
  type BlogPost,
} from '@/lib/blog-server'

/* =====================================================================
   /pillars — index of every genre we paint in, with each genre's
   pillar post (or a "coming soon" placeholder when none exists yet).
   Each card links into /pillars/[genre] for the authority page +
   spoke roundup.
   ===================================================================== */

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Pillars · Design Vortex',
  description:
    'Long-form authority pages on every genre we paint: D&D 5e, sci-fi, cyberpunk, horror, fantasy, modern, historical, Souls/anime fan art, and weird western. The deep dives plus every related guide.',
  alternates: { canonical: '/pillars' },
}

const ArrowRightSm = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

/* Per-genre placeholder gradient so cards without a featured_image
   still feel intentional. Hue tuned per genre slug. */
const GENRE_GRADIENTS: Record<string, string> = {
  fantasy:
    'radial-gradient(ellipse at 30% 20%, rgba(232,200,128,0.6), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(107,31,42,0.6), transparent 60%), linear-gradient(135deg, #2a1810, #3e1218 60%, #1a130c)',
  'dnd-5e':
    'radial-gradient(ellipse at 50% 30%, rgba(243,214,217,0.6), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(201,160,74,0.4), transparent 60%), linear-gradient(160deg, #6B1F2A, #8A2A35 70%, #3e1218)',
  'sci-fi':
    'radial-gradient(ellipse at 25% 75%, rgba(80,160,200,0.45), transparent 55%), radial-gradient(ellipse at 75% 25%, rgba(232,200,128,0.35), transparent 60%), linear-gradient(135deg, #0e1a2a, #1F4D3A 60%, #1a130c)',
  cyberpunk:
    'radial-gradient(ellipse at 30% 50%, rgba(255,90,180,0.4), transparent 55%), radial-gradient(ellipse at 70% 50%, rgba(80,200,255,0.4), transparent 60%), linear-gradient(135deg, #0d0a18, #2a1042 60%, #1a130c)',
  horror:
    'radial-gradient(ellipse at 50% 40%, rgba(120,40,40,0.55), transparent 55%), radial-gradient(ellipse at 30% 90%, rgba(40,30,40,0.6), transparent 60%), linear-gradient(180deg, #0a0808, #2a0e0e 70%, #1a0a0a)',
  modern:
    'radial-gradient(ellipse at 30% 30%, rgba(200,200,210,0.4), transparent 55%), radial-gradient(ellipse at 70% 70%, rgba(80,80,90,0.5), transparent 60%), linear-gradient(135deg, #1a1a20, #2a2a30 60%, #1a1a20)',
  historical:
    'radial-gradient(ellipse at 50% 30%, rgba(232,200,128,0.5), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(107,31,42,0.4), transparent 60%), linear-gradient(160deg, #3e2818, #2a1810 70%, #1a130c)',
  'souls-anime':
    'radial-gradient(ellipse at 50% 30%, rgba(243,214,217,0.5), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(120,90,140,0.45), transparent 60%), linear-gradient(160deg, #2a1830, #3e1838 70%, #1a131c)',
  western:
    'radial-gradient(ellipse at 50% 80%, rgba(232,180,100,0.5), transparent 60%), radial-gradient(ellipse at 30% 30%, rgba(160,80,40,0.5), transparent 60%), linear-gradient(160deg, #3e2818, #6B3F1F 70%, #2a1810)',
}

const FALLBACK_GRADIENT =
  'radial-gradient(ellipse at 50% 50%, rgba(232,200,128,0.45), transparent 55%), linear-gradient(135deg, #2a1810, #3e1218 60%, #1a130c)'

export default async function PillarsIndexPage() {
  const [pillars, activeGenres] = await Promise.all([
    fetchAllPillars(),
    fetchActivePillarGenres(),
  ])

  const activeSlugs = new Set(activeGenres.map((g) => g.slug))
  const pillarBySlug = new Map(pillars.map((p) => [p.pillarGenre!, p]))

  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-parchment-50">

        {/* Hero */}
        <PageHero
          eyebrow="Pillars"
          title={
            <>
              The genres we <em className="font-display italic font-medium text-burgundy-700">paint in</em>
            </>
          }
          description="One long-form authority page per genre, with every related guide and case study linked back to it. Start with the pillar, follow the spokes."
        />

        {/* Grid: one card per genre. Live pillars get the post title +
            excerpt; genres without a pillar yet show a "coming soon" state. */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {GENRES.map((g) => {
                const pillar = pillarBySlug.get(g.slug)
                const hasPillar = activeSlugs.has(g.slug)
                return (
                  <PillarCard
                    key={g.slug}
                    genreSlug={g.slug}
                    genreLabel={g.label}
                    tagline={g.tagline}
                    pillar={pillar}
                    hasPillar={hasPillar}
                  />
                )
              })}
            </div>
          </Container>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}

function PillarCard({
  genreSlug,
  genreLabel,
  tagline,
  pillar,
  hasPillar,
}: {
  genreSlug: string
  genreLabel: string
  tagline: string
  pillar: BlogPost | undefined
  hasPillar: boolean
}) {
  const gradient = GENRE_GRADIENTS[genreSlug] ?? FALLBACK_GRADIENT

  if (hasPillar && pillar) {
    return (
      <Link
        href={`/pillars/${genreSlug}`}
        className="group block bg-parchment-50 border border-border-light rounded-2xl overflow-hidden transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-md hover:border-border-medium"
      >
        <div
          className="relative aspect-[4/3] flex items-end p-5"
          style={{ background: pillar.featuredImage ? undefined : gradient }}
        >
          {pillar.featuredImage && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${pillar.featuredImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-tome-950/[0.55] via-tome-950/[0.15] to-transparent" aria-hidden="true" />
          <div className="relative z-10">
            <span className="inline-block bg-parchment-50/[0.92] backdrop-blur-md border border-gold-300 text-ink-900 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2.5 py-[5px] rounded-full mb-2">
              {genreLabel}
            </span>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="font-accent text-[1.0625rem] text-burgundy-700 -mb-0.5">{tagline}</div>
          <h3 className="font-display text-[1.375rem] font-semibold text-ink-900 leading-snug mt-1 mb-2 group-hover:text-burgundy-700 transition-colors">
            {pillar.title}
          </h3>
          <p className="text-[0.9375rem] text-ink-700 leading-[1.55] line-clamp-3">
            {pillar.excerpt}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 group-hover:gap-2.5 transition-all">
            Read the pillar <ArrowRightSm />
          </div>
        </div>
      </Link>
    )
  }

  // No pillar yet — show a quieter "coming soon" card so the genre is
  // still visible (good for SEO discovery + roadmap signaling).
  return (
    <div className="bg-parchment-100/70 border border-dashed border-border-light rounded-2xl overflow-hidden opacity-75">
      <div
        className="relative aspect-[4/3] flex items-end p-5"
        style={{ background: gradient, filter: 'grayscale(0.4)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-tome-950/[0.55] via-tome-950/[0.15] to-transparent" aria-hidden="true" />
        <div className="relative z-10">
          <span className="inline-block bg-parchment-50/[0.92] backdrop-blur-md border border-border-light text-ink-700 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2.5 py-[5px] rounded-full">
            {genreLabel}
          </span>
        </div>
      </div>
      <div className="px-6 py-5">
        <div className="font-accent text-[1.0625rem] text-ink-500 -mb-0.5">{tagline}</div>
        <h3 className="font-display text-[1.375rem] font-semibold text-ink-700 leading-snug mt-1 mb-1">
          Pillar in progress
        </h3>
        <p className="text-[0.875rem] text-ink-500 leading-[1.55]">
          We&rsquo;re writing the long-form on this one. In the meantime, see other commissioned work in our{' '}
          <Link href="/portfolio" className="text-burgundy-700 underline underline-offset-[3px] hover:text-burgundy-500">portfolio</Link>.
        </p>
      </div>
    </div>
  )
}
