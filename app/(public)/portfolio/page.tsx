'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'
import { cn } from '@/lib/utils'

/* =====================================================================
   PORTFOLIO INDEX — literal port of Portfolio.html.
   Hero → sticky controls (filters + search + sort) → masonry gallery →
   load-more row → dark CTA strip.

   The sticky controls bar (.po-controls) sits at top: 76px so it tucks
   right under the fixed site header once you scroll past the hero.
   ===================================================================== */

/* ---------- Design-spec gradients (from .ds-ph-* in design-system.css) ---------- */
const GRADIENTS = {
  character:
    'radial-gradient(ellipse at 30% 20%, rgba(232,200,128,0.6), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(107,31,42,0.6), transparent 60%), linear-gradient(135deg, #2a1810, #3e1218 60%, #1a130c)',
  token:
    'radial-gradient(circle at 50% 50%, rgba(212,162,76,0.5), transparent 50%), radial-gradient(circle at 50% 50%, rgba(107,31,42,0.8), transparent 70%), linear-gradient(135deg, #1a130c, #251A10)',
  party:
    'radial-gradient(ellipse at 20% 40%, rgba(201,160,74,0.5), transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(31,77,58,0.6), transparent 55%), linear-gradient(160deg, #3e1218, #6B1F2A, #1F4D3A)',
  anime:
    'radial-gradient(ellipse at 50% 30%, rgba(243,214,217,0.6), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(201,160,74,0.4), transparent 60%), linear-gradient(160deg, #6B1F2A, #8A2A35 70%, #3e1218)',
  scene:
    'radial-gradient(ellipse at 50% 80%, rgba(232,200,128,0.4), transparent 60%), linear-gradient(180deg, #1F4D3A 0%, #6B1F2A 60%, #1a130c 100%)',
} as const

type CategoryKey = 'all' | 'character-art' | 'vtt-tokens' | 'party-portraits' | 'anime' | 'custom'

interface PortfolioItem {
  slug: string
  title: string
  category: Exclude<CategoryKey, 'all'>
  categoryLabel: string
  gradient: string
  aspect: '4/5' | '1/1' | '3/4' | '3/2'
  featured?: boolean
  hueRotate?: number
}

const REAL_SLUGS = [
  'lyra-vexweaver-tiefling-sorceror',
  'eira-half-orc-paladin',
  'stormwatch-adventuring-party',
]
const slugFor = (i: number) => REAL_SLUGS[i % REAL_SLUGS.length]

const ITEMS: PortfolioItem[] = [
  { slug: slugFor(0),  title: 'Lyra Vexweaver · Tiefling Sorceror',  category: 'character-art',    categoryLabel: 'Character Art',  gradient: GRADIENTS.character, aspect: '4/5', featured: true },
  { slug: slugFor(1),  title: 'The Hooded Stranger',                 category: 'vtt-tokens',       categoryLabel: 'VTT Token',      gradient: GRADIENTS.token,     aspect: '1/1' },
  { slug: slugFor(2),  title: 'Kaeru — spring duelist',              category: 'anime',            categoryLabel: 'Anime',          gradient: GRADIENTS.anime,     aspect: '3/4' },
  { slug: slugFor(0),  title: 'The Howling Crows · level 9',         category: 'party-portraits',  categoryLabel: 'Party Portrait', gradient: GRADIENTS.party,     aspect: '3/2' },
  { slug: slugFor(1),  title: 'Aldric · half-elf paladin',           category: 'character-art',    categoryLabel: 'Character Art',  gradient: GRADIENTS.character, aspect: '4/5', featured: true, hueRotate: 20 },
  { slug: slugFor(2),  title: 'Strahd NPC Pack · session 14',        category: 'custom',           categoryLabel: 'Custom',         gradient: GRADIENTS.scene,     aspect: '3/4' },
  { slug: slugFor(0),  title: 'The Mage of Saltmarsh',               category: 'vtt-tokens',       categoryLabel: 'VTT Token',      gradient: GRADIENTS.token,     aspect: '1/1', hueRotate: -10 },
  { slug: slugFor(1),  title: 'Nyssa & Vaelen · twin rogues',        category: 'character-art',    categoryLabel: 'Character Art',  gradient: GRADIENTS.character, aspect: '4/5', hueRotate: 40 },
  { slug: slugFor(2),  title: 'The Wedding Adventurers',             category: 'party-portraits',  categoryLabel: 'Party Portrait', gradient: GRADIENTS.party,     aspect: '3/2', hueRotate: 15 },
  { slug: slugFor(0),  title: 'Mei · jade scholar',                  category: 'anime',            categoryLabel: 'Anime',          gradient: GRADIENTS.anime,     aspect: '3/4', hueRotate: 30 },
  { slug: slugFor(1),  title: 'Gorbash · ironforge berserker',       category: 'character-art',    categoryLabel: 'Character Art',  gradient: GRADIENTS.character, aspect: '4/5' },
  { slug: slugFor(2),  title: 'Inkbloom · book cover',               category: 'custom',           categoryLabel: 'Custom',         gradient: GRADIENTS.scene,     aspect: '3/4', featured: true, hueRotate: -20 },
]

const FILTERS: { key: CategoryKey; label: string; count: number }[] = [
  { key: 'all',              label: 'All',              count: 247 },
  { key: 'character-art',    label: 'Character Art',    count: 142 },
  { key: 'vtt-tokens',       label: 'VTT Tokens',       count: 58 },
  { key: 'party-portraits',  label: 'Party Portraits',  count: 24 },
  { key: 'anime',            label: 'Anime',            count: 16 },
  { key: 'custom',           label: 'Custom',           count: 7 },
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

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-ink-400 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
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

/* ---------- Aspect → Tailwind class ---------- */
const ASPECT_CLASSES: Record<PortfolioItem['aspect'], string> = {
  '4/5': 'aspect-[4/5]',
  '1/1': 'aspect-square',
  '3/4': 'aspect-[3/4]',
  '3/2': 'aspect-[3/2]',
}

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState<CategoryKey>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'popular' | 'random'>('newest')

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    return ITEMS.filter((item) => {
      if (activeFilter !== 'all' && item.category !== activeFilter) return false
      if (term && !item.title.toLowerCase().includes(term) && !item.categoryLabel.toLowerCase().includes(term)) return false
      return true
    })
  }, [activeFilter, search])

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        {/* Hero */}
        <PageHero
          eyebrow="Portfolio"
          title={
            <>
              Five hundred pieces.<br />
              <em className="font-display italic font-medium text-burgundy-700">One craft.</em>
            </>
          }
          description="Every commission since 2022 — character portraits, VTT tokens, NPC packs, party portraits, and the occasional book cover."
          stat={
            <>
              <ClockIcon />
              <span>
                <strong className="font-display text-base font-semibold text-ink-900">500+ pieces</strong>
                {' · '}updated weekly{' · '}last update May 18, 2026
              </span>
            </>
          }
        />

        {/* Sticky controls — sits at top: 76px (below fixed site header) */}
        <div className="sticky top-[76px] z-10 border-y border-border-light backdrop-blur-md bg-parchment-50/[0.92] py-4 mb-12">
          <Container>
            <div className="flex flex-wrap items-center gap-5">

              {/* Filters */}
              <div className="flex flex-wrap gap-1.5 flex-1">
                {FILTERS.map((f) => {
                  const active = f.key === activeFilter
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setActiveFilter(f.key)}
                      className={cn(
                        'px-4 py-2 rounded-full font-body text-[0.8125rem] font-medium transition-all duration-150 border',
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

              {/* Search */}
              <div className="relative w-full sm:w-60 flex-shrink-0">
                <SearchIcon />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or tag…"
                  className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-full pl-10 pr-3.5 py-2 font-body text-[0.875rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                />
              </div>

              {/* Sort */}
              <div className="inline-flex items-center gap-1.5 flex-shrink-0">
                <label htmlFor="po-sort" className="font-body text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-500">
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
            {visibleItems.map((item, i) => (
              <Link
                key={`${item.slug}-${i}`}
                href={`/portfolio/${item.slug}`}
                className="group relative block mb-4 break-inside-avoid rounded-lg overflow-hidden border border-border-light bg-parchment-100 cursor-pointer transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[3px] hover:shadow-lg hover:border-border-medium"
              >
                {/* Gold corner flourishes — featured items only (per design HTML) */}
                {item.featured && (
                  <>
                    <CornerTL />
                    <CornerTR />
                    <CornerBL />
                    <CornerBR />
                  </>
                )}

                {/* Quick view eye — visible on hover (or always for featured) */}
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
                    item.featured ? 'opacity-100' : 'opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0',
                    'hover:bg-burgundy-700 hover:text-cream-50 hover:border-burgundy-700',
                  )}
                >
                  <EyeIcon />
                </button>

                {/* Image */}
                <div
                  className={cn('block w-full', ASPECT_CLASSES[item.aspect])}
                  style={{
                    background: item.gradient,
                    ...(item.hueRotate ? { filter: `hue-rotate(${item.hueRotate}deg)` } : {}),
                  }}
                  aria-hidden="true"
                />

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col justify-end"
                  style={{
                    background: 'linear-gradient(180deg, transparent 55%, rgba(26, 19, 12, 0.85) 100%)',
                    padding: '18px',
                  }}
                >
                  <div className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-gold-glow mb-1">
                    {item.categoryLabel}
                  </div>
                  <div className="font-display text-[1.125rem] font-semibold text-cream-50 leading-[1.2]">
                    {item.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load more */}
          <div className="text-center mb-14">
            <Button variant="outline" size="md">
              Load 24 more
            </Button>
            <div className="font-body text-[0.875rem] text-ink-500 mt-3">
              Showing {visibleItems.length} of 247
            </div>
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
