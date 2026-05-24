'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import ProtectedImage from '@/components/ui/ProtectedImage'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'
import { cn } from '@/lib/utils'
import {
  CATEGORY_FILTER_KEYS,
  type PortfolioPiece,
} from '@/lib/portfolio-pieces'

/* =====================================================================
   PORTFOLIO INDEX — literal port of Portfolio.html.
   Hero â†’ sticky controls (filters + search + sort) â†’ masonry gallery â†’
   load-more row â†’ dark CTA strip.

   Reads from lib/portfolio-pieces.ts so the data matches the homepage
   strip and the detail pages exactly. Filter chips use live counts from
   getCategoryCounts() so chip numbers stay accurate as pieces are added
   or removed.
   ===================================================================== */

type CategoryKey =
  | 'all'
  | 'character-art'
  | 'vtt-tokens'
  | 'party-portraits'
  | 'anime'
  | 'custom'
  | 'weapons-assets'
  | 'character-sheets'
  | 'emotes'

const FILTER_DEFINITIONS: { key: CategoryKey; label: string }[] = [
  { key: 'all',               label: 'All' },
  { key: 'character-art',     label: 'Character Art' },
  { key: 'vtt-tokens',        label: 'VTT Tokens' },
  { key: 'party-portraits',   label: 'Party Portraits' },
  { key: 'anime',             label: 'Anime' },
  { key: 'custom',            label: 'Custom' },
  { key: 'weapons-assets',    label: 'Weapons & Assets' },
  { key: 'character-sheets',  label: 'Character Sheets' },
  { key: 'emotes',            label: 'Emotes' },
]

/* ---------- Inline SVGs from the design HTML (verbatim) ---------- */
const CornerTL = () => (
  <svg viewBox="0 0 24 24" className="absolute top-2.5 left-2.5 w-5 h-5 text-gold-500 z-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
    <path d="M2 12 V2 H12 M2 2 Q8 4 12 8" />
  </svg>
)
const CornerTR = () => (
  <svg viewBox="0 0 24 24" className="absolute top-2.5 right-2.5 w-5 h-5 text-gold-500 z-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
    <path d="M22 12 V2 H12 M22 2 Q16 4 12 8" />
  </svg>
)
const CornerBL = () => (
  <svg viewBox="0 0 24 24" className="absolute bottom-2.5 left-2.5 w-5 h-5 text-gold-500 z-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
    <path d="M2 12 V22 H12 M2 22 Q8 20 12 16" />
  </svg>
)
const CornerBR = () => (
  <svg viewBox="0 0 24 24" className="absolute bottom-2.5 right-2.5 w-5 h-5 text-gold-500 z-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
    <path d="M22 12 V22 H12 M22 22 Q16 20 12 16" />
  </svg>
)

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 6l-6 6 6 6" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-gold-700" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
)

const ArrowRightMd = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

/* ---------- Aspect â†’ Tailwind class ---------- */
const ASPECT_CLASSES: Record<PortfolioPiece['aspect'], string> = {
  '4/5': 'aspect-[4/5]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
  '3/2': 'aspect-[3/2]',
}

/* Pieces + category counts are passed as props from the server parent so
 * the source of truth is the Supabase fetch (with in-memory fallback).
 * The client only handles filter / search / sort interactivity. */
export interface PortfolioMasonryClientProps {
  pieces: PortfolioPiece[]
  counts: Record<string, number>
}

export default function PortfolioMasonryClient({
  pieces: ALL_PIECES,
  counts: CATEGORY_COUNTS,
}: PortfolioMasonryClientProps) {
  const [activeFilter, setActiveFilter] = useState<CategoryKey>('all')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'popular' | 'random'>('newest')

  /* Horizontal-scroll plumbing for the chip track. We track whether
   * there's more content to the left / right so the arrow buttons can
   * hide themselves at the boundaries. Re-checks on scroll + resize. */
  const chipScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = chipScrollRef.current
    if (!el) return
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 1)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const scrollChips = (delta: number) => {
    chipScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  const FILTERS = useMemo(
    () => FILTER_DEFINITIONS.map((f) => ({ ...f, count: CATEGORY_COUNTS[f.key] ?? 0 })),
    [CATEGORY_COUNTS],
  )

  const visibleItems = useMemo(() => {
    const sorted = [...ALL_PIECES].sort((a, b) => {
      const aTime = new Date(a.delivered).getTime()
      const bTime = new Date(b.delivered).getTime()
      if (sort === 'oldest') return aTime - bTime
      if (sort === 'random') return Math.random() - 0.5
      // 'newest' and 'popular' both default to newest-first for now
      return bTime - aTime
    })
    return sorted.filter((piece) => {
      if (activeFilter !== 'all' && CATEGORY_FILTER_KEYS[piece.category] !== activeFilter) return false
      return true
    })
  }, [ALL_PIECES, activeFilter, sort])

  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-parchment-50">

        {/* Hero */}
        <PageHero
          eyebrow="Portfolio"
          title={
            <>
              Two hundred pieces.<br />
              <em className="font-display italic font-medium text-burgundy-700">One craft.</em>
            </>
          }
          description="Every commission since 2024 — character portraits, VTT tokens, NPC packs, party portraits, and the occasional book cover."
          stat={
            <>
              <ClockIcon />
              <span>
                <strong className="font-display text-base font-semibold text-ink-900">{CATEGORY_COUNTS.all} recent pieces</strong>
                {' · '}updated as commissions wrap{' · '}last delivery {ALL_PIECES[0]?.delivered}
              </span>
            </>
          }
        />

        {/* Sticky controls — sits at top: 76px (below fixed site header).
            Chips scroll horizontally inside their own track (so they don't
            wrap to a second line as the category list grows); search +
            sort sit on the right at desktop, drop below on mobile. */}
        <div className="sticky top-[76px] z-10 border-y border-border-light backdrop-blur-md bg-parchment-50/[0.92] py-4 mb-12">
          <Container>
            <div className="flex flex-col md:flex-row md:items-center md:gap-5">

              {/* Filters — horizontal scroll track flanked by chevron
                  buttons that appear/disappear at the boundaries. Scrollbar
                  hidden in both webkit + firefox. Each chip is shrink-0 +
                  whitespace-nowrap so they keep their shape. */}
              <div className="relative flex-1 min-w-0 -mx-1">
                {/* Left scroll button — only when there's content to the left */}
                <button
                  type="button"
                  onClick={() => scrollChips(-240)}
                  aria-label="Scroll filters left"
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-cream-50 border border-border-medium shadow-sm flex items-center justify-center text-ink-700 hover:bg-parchment-100 hover:text-burgundy-700 transition-all',
                    canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none',
                  )}
                >
                  <ChevronLeftIcon />
                </button>

                {/* Right scroll button — only when there's content to the right */}
                <button
                  type="button"
                  onClick={() => scrollChips(240)}
                  aria-label="Scroll filters right"
                  className={cn(
                    'absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-cream-50 border border-border-medium shadow-sm flex items-center justify-center text-ink-700 hover:bg-parchment-100 hover:text-burgundy-700 transition-all',
                    canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none',
                  )}
                >
                  <ChevronRightIcon />
                </button>

                {/* Soft fade edges behind the buttons so chips don't
                    visually collide with them. */}
                <div
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-parchment-50/[0.92] via-parchment-50/[0.75] to-transparent transition-opacity',
                    canScrollLeft ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <div
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-parchment-50/[0.92] via-parchment-50/[0.75] to-transparent transition-opacity',
                    canScrollRight ? 'opacity-100' : 'opacity-0',
                  )}
                />

                {/* The scrollable chip track — padded so the buttons
                    don't cover the first/last chip. */}
                <div
                  ref={chipScrollRef}
                  className="flex gap-1.5 overflow-x-auto overflow-y-hidden px-1 py-1 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {FILTERS.map((f) => {
                    const active = f.key === activeFilter
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => setActiveFilter(f.key)}
                        className={cn(
                          'flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full font-body text-[0.8125rem] font-medium transition-all duration-150 border',
                          active
                            ? 'bg-burgundy-700 border-burgundy-700 text-cream-50'
                            : 'bg-parchment-100 text-ink-700 border-border-light hover:bg-parchment-200 hover:border-border-medium',
                        )}
                      >
                        {f.label} · {f.count}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sort — stacks below chips on mobile, inline on the right at md+. */}
              <div className="inline-flex items-center gap-1.5 flex-shrink-0 mt-3 md:mt-0">
                <label htmlFor="po-sort" className="font-body text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-500 hidden sm:inline">
                  Sort
                </label>
                <select
                  id="po-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="appearance-none bg-parchment-50 border-[1.5px] border-border-light rounded-full pl-3.5 pr-9 py-2 font-body text-[0.875rem] text-ink-900 cursor-pointer focus:outline-none focus:border-burgundy-500 transition-colors bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem_1rem]"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B5A48' stroke-width='1.6' stroke-linecap='round'><path d='M6 9l6 6 6-6'/></svg>\")",
                  }}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="popular">Most popular</option>
                  <option value="random">Random</option>
                </select>
              </div>

            </div>
          </Container>
        </div>

        {/* Gallery — CSS columns masonry */}
        <Container>
          <div
            className="mb-14"
            style={{ columns: '4 280px', columnGap: '16px' }}
          >
            {visibleItems.map((piece) => (
              <Link
                key={piece.slug}
                href={`/portfolio/${piece.slug}`}
                className="group relative block mb-4 break-inside-avoid rounded-lg overflow-hidden border border-border-light bg-parchment-100 cursor-pointer transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[3px] hover:shadow-lg hover:border-border-medium"
              >
                {/* Gold corner flourishes — featured pieces only (per design HTML) */}
                {piece.featured && (
                  <>
                    <CornerTL />
                    <CornerTR />
                    <CornerBL />
                    <CornerBR />
                  </>
                )}

                {/* Quick view eye — always visible on featured, hover-only otherwise */}
                <button
                  type="button"
                  aria-label="Quick view"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  className={cn(
                    'absolute top-3 right-3 z-[3] w-9 h-9 rounded-full inline-flex items-center justify-center',
                    'bg-parchment-50/90 border border-border-medium text-ink-700 cursor-pointer',
                    'transition-all duration-250',
                    piece.featured ? 'opacity-100' : 'opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0',
                    'hover:bg-burgundy-700 hover:text-cream-50 hover:border-burgundy-700',
                  )}
                >
                  <EyeIcon />
                </button>

                {/* Image — real artwork via next/image, gradient backdrop
                    for any letter-box edges when the source aspect doesn't
                    match the slot's `piece.aspect` perfectly. */}
                <div
                  className={cn('relative block w-full bg-gradient-to-br', ASPECT_CLASSES[piece.aspect], piece.gradient)}
                >
                  <ProtectedImage
                    src={piece.heroImage}
                    alt={piece.title}
                    fill
                    sizes="(min-width: 1280px) 320px, (min-width: 768px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col justify-end"
                  style={{
                    background: 'linear-gradient(180deg, transparent 55%, rgba(26, 19, 12, 0.85) 100%)',
                    padding: '18px',
                  }}
                >
                  <div className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-gold-glow mb-1">
                    {piece.category}
                  </div>
                  <div className="font-display text-[1.125rem] font-semibold text-cream-50 leading-[1.2]">
                    {piece.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load more — hidden until we have more than the initial display */}
          {visibleItems.length < ALL_PIECES.length && (
            <div className="text-center mb-14">
              <Button variant="outline" size="md">
                Load more
              </Button>
            </div>
          )}
          <div className="text-center mb-14 font-body text-[0.875rem] text-ink-500">
            Showing {visibleItems.length} of {CATEGORY_COUNTS.all} pieces
          </div>
        </Container>

        {/* CTA strip — dark tome closer */}
        <section className="relative bg-tome-950 text-cream-50 py-20 text-center overflow-hidden">
          <PaperTexture variant="cream" opacity={0.5} />
          <div className="relative">
            <Container>
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.15] tracking-tight mb-4 mx-auto max-w-[24ch] [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
              >
                Seen something you <em>love</em>?
              </h2>
              <p className="text-base text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-7">
                Every portrait above was a collaboration. Yours can be next.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-3">
                <Button href="/order" variant="gold" size="lg">
                  Start commission <ArrowRightMd />
                </Button>
                <Button href="/contact" variant="outline-cream" size="lg">
                  Ask a question
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
