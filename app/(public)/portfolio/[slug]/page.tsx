import type { Metadata } from 'next'
import ProtectedImage from '@/components/ui/ProtectedImage'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, ChevronRight, ZoomIn } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Container from '@/components/ui/Container'
import Button, { LinkButton } from '@/components/ui/Button'
import SectionLabel from '@/components/ui/SectionLabel'
import Markdown from '@/components/ui/Markdown'
import { cn } from '@/lib/utils'

/* =====================================================================
   PORTFOLIO DETAIL â€” literal port of Portfolio Detail.html.
   Server component for generateMetadata + generateStaticParams +
   CreativeWork JSON-LD. Three demo slugs hardcoded.
   ===================================================================== */

/* PortfolioPiece type + the 24-piece PIECES record both live in
 * lib/portfolio-pieces.ts so the masonry index and the homepage
 * strip can read from the same source. Keep ../[slug]/page.tsx
 * as a thin server entry: generateStaticParams + generateMetadata
 * + JSON-LD + the detail render. When the Supabase CMS lands, the
 * library file gets replaced with a Supabase query and this file
 * needs no changes. */
import { getAllSlugs, getPieceBySlug } from '@/lib/portfolio-pieces'

/* Related-pieces lookup (kept lean â€” three siblings per piece) */
const RELATED: Array<{ slug: string; title: string; category: string; gradient: string; meta: string }> = [
  { slug: 'aldric-half-elf-paladin',   title: 'Aldric Â· half-elf paladin',     category: 'Character Art', gradient: 'from-amber-900 via-yellow-700 to-orange-600', meta: 'Painterly Â· Mar 2026' },
  { slug: 'drowned-captain-veska',     title: 'Drowned Captain Veska',          category: 'Character Art', gradient: 'from-slate-800 via-teal-700 to-emerald-600',  meta: 'Painterly Â· Feb 2026' },
  { slug: 'brennen-bardic-dropout',    title: 'Brennen Â· bardic dropout',       category: 'Character Art', gradient: 'from-amber-800 via-rose-700 to-pink-600',     meta: 'Painterly Â· Jan 2026' },
]

/* =====================================================================
   STATIC PARAMS + METADATA
   ===================================================================== */

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

/** Strip markdown emphasis tokens for SEO meta description (plain text). */
function stripMarkdown(s: string): string {
  return s.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\[(.*?)\]\([^)]+\)/g, '$1')
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const piece = getPieceBySlug(slug)
  if (!piece) {
    return { title: 'Portfolio piece not found Â· Design Vortex' }
  }
  const first = stripMarkdown(piece.description[0])
  const desc = first.length > 160 ? first.slice(0, 157) + '...' : first
  return {
    title: `${piece.title} Â· ${piece.category} Â· Design Vortex`,
    description: desc,
    alternates: { canonical: `/portfolio/${piece.slug}` },
    openGraph: {
      title: `${piece.title} Â· ${piece.category}`,
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
  const piece = getPieceBySlug(slug)

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
    description: piece.description.map(stripMarkdown).join(' '),
    keywords: piece.tags.join(', '),
    creator: { '@type': 'Organization', name: 'Design Vortex' },
    dateCreated: piece.delivered,
    inLanguage: 'en',
  }

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />

        {/* Breadcrumbs */}
        <section className="pt-[120px] pb-6">
          <Container>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-ink-500 font-semibold"
            >
              <Link href="/" className="hover:text-burgundy-700 transition-colors">Home</Link>
              <ChevronRight size={12} strokeWidth={1.8} className="text-ink-400" />
              <Link href="/portfolio" className="hover:text-burgundy-700 transition-colors">Portfolio</Link>
              <ChevronRight size={12} strokeWidth={1.8} className="text-ink-400" />
              <Link
                href={`/portfolio?category=${encodeURIComponent(piece.category)}`}
                className="hover:text-burgundy-700 transition-colors"
              >
                {piece.category}
              </Link>
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
                {/* HERO â€” real artwork via next/image when heroImage is set,
                    otherwise the original gradient placeholder. Gradient is
                    always rendered as the backdrop so transparent edges and
                    letter-box bars (for non-4:5 sources) tint correctly. */}
                <div
                  className={cn(
                    'relative rounded-2xl overflow-hidden border border-border-medium aspect-[4/5] bg-gradient-to-br',
                    piece.gradient,
                  )}
                >
                  {piece.heroImage ? (
                    <ProtectedImage
                      src={piece.heroImage}
                      alt={`${piece.title} â€” hand-painted portrait`}
                      fill
                      sizes="(min-width: 1024px) 56vw, 100vw"
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
                      <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm" />
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label="Zoom image"
                    className="absolute bottom-4 right-4 z-10 w-10 h-10 rounded-full bg-tome-950/70 backdrop-blur-sm flex items-center justify-center text-cream-50 hover:bg-tome-950/90 transition-colors cursor-pointer"
                  >
                    <ZoomIn size={16} strokeWidth={1.6} />
                  </button>
                </div>

                {/* PROCESS THUMBS â€” iterate piece.processImages when set
                    (each entry = real stage), otherwise fall back to the
                    legacy 4 gradient-filtered placeholder squares. */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {piece.processImages && piece.processImages.length > 0 ? (
                    piece.processImages.slice(0, 4).map((thumb, i) => (
                      <div
                        key={thumb.label}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all bg-gradient-to-br',
                          piece.gradient,
                          i === 0
                            ? 'border-gold-500 ring-2 ring-gold-500/30'
                            : 'border-border-light opacity-90 hover:opacity-100',
                        )}
                      >
                        <ProtectedImage
                          src={thumb.src}
                          alt={`${piece.title} â€” ${thumb.label.toLowerCase()} stage`}
                          fill
                          sizes="(min-width: 1024px) 140px, 22vw"
                          className="object-cover"
                        />
                        <span className="absolute bottom-1.5 left-1.5 z-10 text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-cream-50 bg-tome-950/60 px-1.5 py-0.5 rounded">
                          {thumb.label}
                        </span>
                      </div>
                    ))
                  ) : (
                    ['FINAL', 'SKETCH', 'BLOCK', 'REV 01'].map((label, i) => (
                      <div
                        key={label}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden border bg-gradient-to-br cursor-pointer transition-all',
                          piece.gradient,
                          i === 0
                            ? 'border-gold-500 ring-2 ring-gold-500/30'
                            : 'border-border-light opacity-75 hover:opacity-100',
                        )}
                        style={{
                          filter:
                            i === 1
                              ? 'grayscale(1) brightness(1.1)'
                              : i === 2
                                ? 'saturate(0.4)'
                                : i === 3
                                  ? 'hue-rotate(30deg)'
                                  : undefined,
                        }}
                      >
                        <span className="absolute bottom-1.5 left-1.5 text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-cream-50 bg-tome-950/60 px-1.5 py-0.5 rounded">
                          {label}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right: meta + details (sticky on desktop) */}
              <aside className="lg:sticky lg:top-28 self-start">
                <div className="text-[0.625rem] uppercase tracking-[0.15em] font-bold text-burgundy-700 mb-2">
                  {piece.category}
                </div>
                <h1
                  className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}
                >
                  {piece.title}
                </h1>
                <div className="font-accent text-2xl text-burgundy-700 mt-2">{piece.client}</div>

                {/* Description â€” rendered via Markdown so **bold** + [links] survive */}
                <div className="mt-6 space-y-4 text-ink-700 leading-[1.7] [&_p]:mb-0">
                  {piece.description.map((md, i) => (
                    <Markdown key={i}>{md}</Markdown>
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
                      <dt className="uppercase tracking-[0.12em] text-[0.6875rem] font-semibold text-ink-500">
                        {dt}
                      </dt>
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

        {/* From the artist â€” pull-quote */}
        <section className="pb-20">
          <Container narrow>
            <figure className="relative bg-parchment-100 border border-border-light rounded-2xl p-10 md:p-14 text-center">
              <blockquote className="font-display italic text-2xl md:text-3xl text-ink-900 leading-[1.4] [&_strong]:not-italic [&_strong]:font-semibold">
                <span className="text-burgundy-700">&ldquo;</span>
                <Markdown className="inline">{piece.artistNote}</Markdown>
                <span className="text-burgundy-700">&rdquo;</span>
              </blockquote>
              <figcaption className="font-accent text-xl text-burgundy-700 mt-5">â€” from the studio</figcaption>
            </figure>
          </Container>
        </section>

        {/* More from this collection */}
        <section className="bg-parchment-100 py-24">
          <Container>
            <div className="text-center max-w-[640px] mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>More from this collection</SectionLabel>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-tight tracking-tight">
                Related <em className="font-display italic font-medium text-burgundy-700">{piece.category.toLowerCase()}</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {RELATED.map((r) => (
                <Link
                  key={r.slug}
                  href={`/portfolio/${r.slug}`}
                  className="group block bg-parchment-50 border border-border-light rounded-2xl overflow-hidden hover:border-border-medium hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow"
                >
                  <div className={cn('relative aspect-[4/5] bg-gradient-to-br overflow-hidden', r.gradient)}>
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
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight"
                style={{ fontSize: 'clamp(2rem, 4.5vw, 3.25rem)' }}
              >
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
