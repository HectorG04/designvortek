import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronRight, ZoomIn } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Container from '@/components/ui/Container'
import Button, { LinkButton } from '@/components/ui/Button'
import SectionLabel from '@/components/ui/SectionLabel'
import { cn } from '@/lib/utils'

/* =====================================================================
   DEMO DATA — hardcoded portfolio piece lookup by slug.
   Replace with CMS / database query when content layer lands.
   ===================================================================== */

interface PortfolioPiece {
  slug: string
  title: string
  category: string
  client: string
  description: string[]
  tools: string
  hours: string
  style: string
  resolution: string
  revisions: string
  delivered: string
  tags: string[]
  gradient: string
  artistNote: string
}

const PIECES: Record<string, PortfolioPiece> = {
  'lyra-vexweaver-tiefling-sorceror': {
    slug: 'lyra-vexweaver-tiefling-sorceror',
    title: 'Lyra Vexweaver',
    category: 'Character Art',
    client: 'commissioned by Aria M.',
    description: [
      "A level-9 tiefling sorceress, soft purple skin and dark freckles, gold horns swept back. Her robe is stitched with constellations in silver thread — a family heirloom from a sister she's lost.",
      'Aria came to us with a six-paragraph backstory and a single Pinterest board. We talked for an hour, then painted for three weeks. This is the result.',
    ],
    tools: 'Procreate · Photoshop',
    hours: '14h across 18 days',
    style: 'Painterly · warm dramatic',
    resolution: '4096 × 5120 px',
    revisions: '2 of 2 used',
    delivered: 'March 12, 2026',
    tags: ['Tiefling', 'Sorceress', 'D&D 5e', 'Painterly', 'Constellations', 'Warm lighting'],
    gradient: 'from-violet-900 via-purple-700 to-indigo-600',
    artistNote: 'The horns were the third pass. We tried curved, then ridged, then finally swept back — and that\'s when Lyra became Lyra.',
  },
  'eira-half-orc-paladin': {
    slug: 'eira-half-orc-paladin',
    title: 'Eira the Half-Orc Paladin',
    category: 'Character Art',
    client: 'commissioned by Marcus K.',
    description: [
      'A half-orc paladin sworn to the Light, broad-shouldered and battle-worn. Cracked plate armor catches the last of the sunset, her warhammer rested across one knee.',
      'Marcus had played Eira for four years before commissioning her portrait. The brief was simple: capture exactly the look players see across the table when Eira speaks.',
    ],
    tools: 'Procreate · Photoshop',
    hours: '18h across 22 days',
    style: 'Painterly · sunset light',
    resolution: '4096 × 6144 px',
    revisions: '1 of 2 used',
    delivered: 'February 04, 2026',
    tags: ['Half-Orc', 'Paladin', 'D&D 5e', 'Painterly', 'Sunset', 'Armor'],
    gradient: 'from-amber-950 via-orange-800 to-yellow-700',
    artistNote: 'We rebuilt the armor twice. Plate is unforgiving — every dent has to earn its place.',
  },
  'stormwatch-adventuring-party': {
    slug: 'stormwatch-adventuring-party',
    title: 'Stormwatch Adventuring Party',
    category: 'Portraits',
    client: 'commissioned by the Stormwatch table',
    description: [
      'Five party members in a single frame — gnome wizard, drow ranger, dwarven cleric, half-elf bard, and human fighter — caught mid-camp on the eve of their final session.',
      'Each character was developed in 80+ sessions of play. The brief was a 14-page shared doc. The challenge: keep five distinct silhouettes legible at every reading distance.',
    ],
    tools: 'Procreate · Photoshop',
    hours: '42h across 38 days',
    style: 'Painterly · campfire light',
    resolution: '6144 × 4096 px',
    revisions: '2 of 2 used',
    delivered: 'January 22, 2026',
    tags: ['Party Portrait', 'D&D 5e', 'Group', 'Painterly', 'Campfire', 'Five figures'],
    gradient: 'from-emerald-900 via-teal-700 to-cyan-600',
    artistNote: 'The hardest part was the gnome — small figures need bigger gestures to read at distance. Three poses later, we found her.',
  },
}

/* Related-pieces lookup (kept lean — three siblings per piece) */
const RELATED: Array<{ slug: string; title: string; category: string; gradient: string; meta: string }> = [
  { slug: 'aldric-half-elf-paladin',   title: 'Aldric, Half-Elf Paladin',   category: 'Character Art', gradient: 'from-amber-900 via-yellow-700 to-orange-600', meta: 'Painterly · Mar 2026' },
  { slug: 'drowned-captain-veska',     title: 'Drowned Captain Veska',     category: 'Character Art', gradient: 'from-slate-800 via-teal-700 to-emerald-600',  meta: 'Painterly · Feb 2026' },
  { slug: 'brennen-bardic-dropout',    title: 'Brennen, Bardic Dropout',   category: 'Character Art', gradient: 'from-amber-800 via-rose-700 to-pink-600',     meta: 'Painterly · Jan 2026' },
]

/* =====================================================================
   STATIC PARAMS + METADATA
   ===================================================================== */

export function generateStaticParams() {
  return Object.keys(PIECES).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const piece = PIECES[slug]
  if (!piece) {
    return { title: 'Portfolio piece not found · Design Vortek' }
  }
  const desc = piece.description[0].length > 160
    ? piece.description[0].slice(0, 157) + '...'
    : piece.description[0]
  return {
    title: `${piece.title} · ${piece.category} · Design Vortek`,
    description: desc,
    alternates: { canonical: `/portfolio/${piece.slug}` },
    openGraph: {
      title: `${piece.title} · ${piece.category}`,
      description: desc,
      type: 'article',
    },
  }
}

/* =====================================================================
   PAGE
   ===================================================================== */

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const piece = PIECES[slug]

  if (!piece) {
    notFound()
  }

  // JSON-LD: CreativeWork
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: piece.title,
    headline: piece.title,
    genre: piece.category,
    description: piece.description.join(' '),
    keywords: piece.tags.join(', '),
    creator: { '@type': 'Organization', name: 'Design Vortek' },
    dateCreated: piece.delivered,
    inLanguage: 'en',
  }

  return (
    <>
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />

        {/* Breadcrumb */}
        <section className="pt-[120px] pb-6">
          <Container>
            <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-ink-500 font-semibold">
              <Link href="/" className="hover:text-burgundy-700 transition-colors">Home</Link>
              <ChevronRight size={12} strokeWidth={1.8} className="text-ink-400" />
              <Link href="/portfolio" className="hover:text-burgundy-700 transition-colors">Portfolio</Link>
              <ChevronRight size={12} strokeWidth={1.8} className="text-ink-400" />
              <Link href={`/portfolio?category=${encodeURIComponent(piece.category)}`} className="hover:text-burgundy-700 transition-colors">{piece.category}</Link>
              <ChevronRight size={12} strokeWidth={1.8} className="text-ink-400" />
              <span className="text-ink-700 normal-case tracking-normal" aria-current="page">{piece.title}</span>
            </nav>
          </Container>
        </section>

        {/* Two-column detail */}
        <section className="pb-20">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16">
              {/* Left: hero image + thumb gallery */}
              <div>
                <div className={cn(
                  'relative rounded-2xl overflow-hidden border border-border-medium aspect-[4/5] bg-gradient-to-br',
                  piece.gradient,
                )}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-15">
                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm" />
                  </div>
                  <button
                    type="button"
                    aria-label="Zoom image"
                    className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-tome-950/70 backdrop-blur-sm flex items-center justify-center text-cream-50 hover:bg-tome-950/90 transition-colors"
                  >
                    <ZoomIn size={16} strokeWidth={1.6} />
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {['FINAL', 'SKETCH', 'BLOCK', 'REV 01'].map((label, i) => (
                    <div
                      key={label}
                      className={cn(
                        'relative aspect-square rounded-lg overflow-hidden border bg-gradient-to-br cursor-pointer transition-all',
                        piece.gradient,
                        i === 0 ? 'border-gold-500 ring-2 ring-gold-500/30' : 'border-border-light opacity-75 hover:opacity-100',
                      )}
                      style={{
                        filter: i === 1 ? 'grayscale(1) brightness(1.1)' : i === 2 ? 'saturate(0.4)' : i === 3 ? 'hue-rotate(30deg)' : undefined,
                      }}
                    >
                      <span className="absolute bottom-1.5 left-1.5 text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-cream-50 bg-tome-950/60 px-1.5 py-0.5 rounded">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: meta + details */}
              <aside className="lg:sticky lg:top-28 self-start">
                <div className="text-[0.625rem] uppercase tracking-[0.15em] font-bold text-burgundy-700 mb-2">
                  {piece.category}
                </div>
                <h1 className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
                  {piece.title}
                </h1>
                <div className="font-accent text-2xl text-burgundy-700 mt-2">{piece.client}</div>

                <div className="mt-6 space-y-4 text-ink-700 leading-[1.7]">
                  {piece.description.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                {/* Specs */}
                <dl className="mt-8 border-t border-border-light divide-y divide-border-light">
                  {[
                    ['Tools', piece.tools],
                    ['Hours', piece.hours],
                    ['Style', piece.style],
                    ['Resolution', piece.resolution],
                    ['Revisions', piece.revisions],
                    ['Delivered', piece.delivered],
                  ].map(([dt, dd]) => (
                    <div key={dt} className="flex items-center justify-between py-3 text-sm">
                      <dt className="uppercase tracking-[0.12em] text-[0.6875rem] font-semibold text-ink-500">{dt}</dt>
                      <dd className="text-ink-900 font-medium text-right">{dd}</dd>
                    </div>
                  ))}
                </dl>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-6">
                  {piece.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.1em] bg-parchment-100 border border-border-light text-ink-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 mt-8">
                  <LinkButton href="/order" variant="primary" size="md">
                    Commission something like this <ArrowRight size={14} strokeWidth={1.8} />
                  </LinkButton>
                  <LinkButton href="/portfolio" variant="outline" size="md">
                    See more {piece.category}
                  </LinkButton>
                </div>
              </aside>
            </div>
          </Container>
        </section>

        {/* Artist note */}
        <section className="pb-20">
          <Container narrow>
            <figure className="relative bg-parchment-100 border border-border-light rounded-2xl p-10 md:p-14 text-center">
              <blockquote className="font-display italic text-2xl md:text-3xl text-ink-900 leading-[1.4]">
                &ldquo;{piece.artistNote}&rdquo;
              </blockquote>
              <figcaption className="font-accent text-xl text-burgundy-700 mt-5">— from the studio</figcaption>
            </figure>
          </Container>
        </section>

        {/* Related */}
        <section className="bg-parchment-100 py-24">
          <Container>
            <div className="text-center max-w-[640px] mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>More from this collection</SectionLabel>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-tight tracking-tight">
                Related <em className="font-display italic font-medium text-burgundy-700">{piece.category}</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {RELATED.map((r) => (
                <Link
                  key={r.slug}
                  href={`/portfolio/${r.slug}`}
                  className="group block bg-parchment-50 border border-border-light rounded-2xl overflow-hidden hover:border-border-medium hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow"
                >
                  <div className={cn(
                    'relative aspect-[4/5] bg-gradient-to-br overflow-hidden',
                    r.gradient,
                  )}>
                    <div className="absolute top-3 left-3 inline-flex items-center px-3 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-[0.15em] bg-tome-950/70 backdrop-blur-sm text-gold-glow">
                      {r.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-ink-900 leading-tight group-hover:text-burgundy-700 transition-colors">
                      {r.title}
                    </h3>
                    <div className="text-xs text-ink-500 mt-1">{r.meta}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA strip */}
        <section className="relative bg-tome-950 text-cream-50 py-24 overflow-hidden">
          <Container>
            <div className="max-w-[640px] mx-auto text-center">
              <h2 className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}>
                Your character, <em className="font-display italic font-medium text-gold-glow">painted</em>.
              </h2>
              <p className="text-lg text-cream-200 leading-relaxed mt-4">
                Tell us about them. We&rsquo;ll send a quote within 48 hours.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-3 mt-8">
                <Button href="/order" variant="gold" size="lg">
                  Start commission <ArrowRight size={14} strokeWidth={1.8} />
                </Button>
                <Button href="/portfolio" variant="outline-cream" size="lg">
                  View more work
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
