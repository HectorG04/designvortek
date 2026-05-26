import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import {
  fetchFeaturedPost,
  fetchGridPosts,
  fetchCategoryCounts,
  fetchAllPillars,
  fetchActivePillarGenres,
  GENRES,
  type BlogPost,
} from '@/lib/blog-server'
import { cn } from '@/lib/utils'

/* =====================================================================
   /resources — single hub for Pillars + Studio Notes.

   Two sections inside one page:
     01  Hero
     02  Genre pillars         — 9 cards, live pillar OR "in progress"
     03  Studio notes (blog)   — featured + category chips + paginated grid
     04  Newsletter

   Pagination: URL-based (?page=N) so each page is crawlable, bookmarkable,
   and self-canonical. 12 posts per page = 4 rows of 3 on desktop, a fast
   server-rendered slice instead of dumping all ~94 posts on page 1.
   ===================================================================== */

export const revalidate = 60

const POSTS_PER_PAGE = 12

interface ResourcesPageProps {
  searchParams: Promise<{ page?: string }>
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
}

export async function generateMetadata({ searchParams }: ResourcesPageProps): Promise<Metadata> {
  const { page: pageParam } = await searchParams
  const page = parsePage(pageParam)
  const isPaged = page > 1

  return {
    title: isPaged
      ? `D&D & Fantasy Art Commission Guides — Page ${page} | Design Vortex`
      : 'D&D & Fantasy Art Commission Guides | Design Vortex',
    description:
      'Guides, tips & resources for commissioning D&D, RPG & fantasy character art. From pricing to reference sheets — everything a first-time client needs.',
    alternates: { canonical: isPaged ? `/resources?page=${page}` : '/resources' },
  }
}

/* Per-genre placeholder gradient — kept inline so /resources stays
 * self-contained. Same hues as the /pillars index page used. */
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

const PH_SCENE_BG =
  'radial-gradient(ellipse at 50% 80%, rgba(232,200,128,0.4), transparent 60%), linear-gradient(180deg, #1F4D3A 0%, #6B1F2A 60%, #1a130c 100%)'

function hueForSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
  return Math.abs(h) % 360
}

const ClockIcon = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
)
const ArrowRightSm = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

/* =====================================================================
   Page
   ===================================================================== */
export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const { page: pageParam } = await searchParams
  const requestedPage = parsePage(pageParam)

  const [featured, allGridPosts, categories, pillars, activeGenres] = await Promise.all([
    fetchFeaturedPost(),
    fetchGridPosts(),
    fetchCategoryCounts(),
    fetchAllPillars(),
    fetchActivePillarGenres(),
  ])

  /* Pagination math — clamp requested page to the valid range so weird URLs
   * (?page=999 or ?page=0) silently land on a real page instead of 404'ing. */
  const totalPages = Math.max(1, Math.ceil(allGridPosts.length / POSTS_PER_PAGE))
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages)
  const startIdx = (currentPage - 1) * POSTS_PER_PAGE
  const gridPosts = allGridPosts.slice(startIdx, startIdx + POSTS_PER_PAGE)
  const isFirstPage = currentPage === 1

  const activeSlugs = new Set(activeGenres.map((g) => g.slug))
  const pillarBySlug = new Map(pillars.map((p) => [p.pillarGenre!, p]))

  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-parchment-50">

        {/* 01 — Hero */}
        <PageHero
          eyebrow="Resources"
          title={
            <>
              Field notes &amp;{' '}
              <em className="font-display italic font-medium text-burgundy-700">deep dives</em>
            </>
          }
          description="One long-form genre guide per genre we paint, plus the studio notes — guides, walkthroughs, and process pieces. Start with a genre guide, explore the deep dives."
        />

        {/* 02 — Genre pillars */}
        <section className="pb-16 md:pb-20">
          <Container>
            <div className="mb-10 max-w-[640px]">
              <div className="text-[0.6875rem] uppercase tracking-[0.18em] font-semibold text-gold-700 mb-2">
                Genre Guides
              </div>
              <h2
                className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mb-3 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)' }}
              >
                The genres we <em>paint in</em>
              </h2>
              <p className="text-ink-500 leading-[1.65]">
                Cornerstone guides for every genre on the studio&rsquo;s slate. Live where written; the rest are in the queue.
              </p>
            </div>

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

        {/* 03 — Studio notes (blog feed) — on parchment-100 so the
            section break reads as a clean visual divider.
            id="field-notes" + scroll-mt-24 = pagination links append #field-notes
            so clicking a page number scrolls the user right back to this section
            (offset for the sticky SiteHeader) instead of dumping them at top. */}
        <section id="field-notes" className="bg-parchment-100 py-16 md:py-20 scroll-mt-24">
          <Container>
            <div className="mb-10 max-w-[640px]">
              <div className="text-[0.6875rem] uppercase tracking-[0.18em] font-semibold text-gold-700 mb-2">
                Studio notes
              </div>
              <h2
                className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mb-3 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)' }}
              >
                Field notes &amp; <em>process</em>
              </h2>
              <p className="text-ink-500 leading-[1.65]">
                Guides on commissioning art, walkthroughs of recent pieces, and the occasional studio dispatch.
              </p>
            </div>

            {/* Featured — only on page 1 (avoids duplication across paginated pages) */}
            {isFirstPage && featured && <FeaturedCard post={featured} />}

            {/* Category chips — all currently link back to /resources
                since the dedicated category archives were removed. */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {categories.map((cat) => {
                const isAll = cat.label === 'All'
                const href = '/resources'
                return (
                  <Link
                    key={cat.label}
                    href={href}
                    className={
                      isAll
                        ? 'px-4 py-2 rounded-full border border-burgundy-700 bg-burgundy-700 text-cream-50 font-body text-[0.8125rem] font-medium transition-colors'
                        : 'px-4 py-2 rounded-full border border-border-light bg-parchment-50 text-ink-700 font-body text-[0.8125rem] font-medium hover:bg-parchment-200 hover:border-border-medium transition-colors'
                    }
                  >
                    {cat.label} · {cat.count}
                  </Link>
                )
              })}
            </div>

            {/* Grid — current page slice (POSTS_PER_PAGE items max) */}
            {gridPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {gridPosts.map((post) => (
                  <GridCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-center text-ink-500 text-sm py-12">
                More articles on the way.
              </p>
            )}

            {/* Pagination — only render when there's more than one page */}
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            )}

            {/* Showing X of Y indicator */}
            {allGridPosts.length > 0 && (
              <p className="text-center text-[0.8125rem] text-ink-500 mt-6">
                Showing {startIdx + 1}–{startIdx + gridPosts.length} of {allGridPosts.length} articles
              </p>
            )}
          </Container>
        </section>

        {/* 04 — Newsletter */}
        <section className="py-16 md:py-24">
          <Container>
            <div className="bg-parchment-100 border border-border-light rounded-2xl p-7 md:p-12 grid md:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-block font-body text-[0.6875rem] font-bold tracking-[0.18em] uppercase text-gold-700 mb-3">
                  Studio dispatch
                </span>
                <h3 className="font-display text-[2rem] font-semibold text-ink-900 leading-[1.1] tracking-tight mb-3 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700">
                  New work &amp; new <em>thinking</em>, monthly
                </h3>
                <p className="text-[1.0625rem] text-ink-500 leading-[1.6]">
                  Every few weeks, a roundup of recent commissions, process notes, and slot openings. No spam, no marketing fluff — just the good stuff.
                </p>
              </div>

              <form action="/api/newsletter" method="POST" className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="your@email.com"
                    className="flex-1 min-w-0 bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-3 font-body text-[1.0625rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                  />
                  <Button type="submit" variant="primary" size="md">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-ink-500">
                  Unsubscribe with one click. We never share your email.
                </p>
              </form>
            </div>
          </Container>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}

/* =====================================================================
   Card components — inline so /resources stays self-contained.
   ===================================================================== */

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
            Read the guide <ArrowRightSm />
          </div>
        </div>
      </Link>
    )
  }

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
          Guide coming soon
        </h3>
        <p className="text-[0.875rem] text-ink-500 leading-[1.55]">
          We&rsquo;re writing the long-form on this one. In the meantime, see other commissioned work in our{' '}
          <Link href="/portfolio" className="text-burgundy-700 underline underline-offset-[3px] hover:text-burgundy-500">portfolio</Link>.
        </p>
      </div>
    </div>
  )
}

function FeaturedCard({ post }: { post: BlogPost }) {
  const hue = hueForSlug(post.slug)
  return (
    <Link
      href={`/resources/${post.slug}`}
      className="group block bg-parchment-50 border border-border-light rounded-2xl overflow-hidden mb-14 transition-shadow hover:shadow-[0_16px_40px_-8px_rgba(30,20,8,0.18)] hover:border-border-medium"
    >
      <div className="grid md:grid-cols-[1.1fr_1fr] gap-0">
        <div
          className="relative aspect-[16/9] md:aspect-[16/11]"
          style={
            post.featuredImage
              ? { backgroundImage: `url(${post.featuredImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: PH_SCENE_BG, filter: `hue-rotate(${hue}deg)` }
          }
        >
          <span className="absolute top-4 left-4 inline-block bg-parchment-50/[0.92] backdrop-blur-md border border-gold-300 text-gold-700 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-3 py-[5px] rounded-full">
            {post.category}
          </span>
          <span className="absolute top-4 right-4 inline-block bg-burgundy-700 text-cream-50 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-3 py-[5px] rounded-full">
            Featured
          </span>
        </div>

        <div className="p-7 sm:p-12 flex flex-col justify-center gap-4">
          <h3
            className="font-display font-semibold text-ink-900 leading-[1.15] tracking-tight [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
            style={{ fontSize: 'clamp(1.625rem, 3vw, 2.125rem)' }}
          >
            {post.title}
          </h3>
          <p className="text-[1.0625rem] text-ink-700 leading-[1.65]">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-2.5 mt-1">
            <span className="font-body text-[0.6875rem] font-bold tracking-[0.15em] uppercase text-gold-700">
              {post.dateLabel}
            </span>
            <span className="w-1 h-1 rounded-full bg-gold-500" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-500 tabular-nums">
              <ClockIcon className="w-3 h-3 text-ink-400" />
              {post.readMin} min read
            </span>
          </div>
          <span className="inline-flex items-center gap-2 mt-2 font-body text-[0.75rem] uppercase tracking-[0.12em] font-semibold text-burgundy-700 group-hover:gap-3 transition-all">
            Read the full guide <ArrowRightSm />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* =====================================================================
   Pagination — server-rendered URL-based numbered pagination.
   Shows Previous / 1 / 2 / ... / current ± 2 / ... / N / Next.
   For small page counts (≤ 7) shows every number (no ellipses).
   ===================================================================== */
function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  /* Always append #field-notes so the browser scrolls to the studio-notes
   * section after navigation. scroll-mt-24 on that section offsets for
   * the sticky header. Page 1 still resolves to /resources (canonical),
   * the hash is just a navigation aid. */
  const pageUrl = (p: number) => (p === 1 ? '/resources#field-notes' : `/resources?page=${p}#field-notes`)

  // Build the list of page numbers to render (with ellipses for big ranges).
  function buildPageList(): (number | 'ellipsis')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages: (number | 'ellipsis')[] = [1]
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    if (start > 2) pages.push('ellipsis')
    for (let p = start; p <= end; p++) pages.push(p)
    if (end < totalPages - 1) pages.push('ellipsis')
    pages.push(totalPages)
    return pages
  }
  const pageList = buildPageList()

  const linkBase =
    'inline-flex items-center justify-center min-w-[40px] h-10 px-3 rounded-md font-body text-[0.875rem] font-medium border transition-colors'
  const linkInactive =
    'bg-parchment-50 border-border-light text-ink-700 hover:bg-parchment-200 hover:border-border-medium'
  const linkActive =
    'bg-burgundy-700 border-burgundy-700 text-cream-50 pointer-events-none'

  return (
    <nav
      aria-label="Resource articles pagination"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={pageUrl(currentPage - 1)}
          rel="prev"
          aria-label="Previous page"
          className={cn(linkBase, linkInactive, 'gap-1.5')}
        >
          <ChevronLeft size={14} strokeWidth={2} />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(linkBase, 'opacity-40 cursor-not-allowed gap-1.5 border-border-light bg-parchment-50 text-ink-400')}
        >
          <ChevronLeft size={14} strokeWidth={2} />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      {/* Page numbers */}
      {pageList.map((p, i) =>
        p === 'ellipsis' ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden="true"
            className="inline-flex items-center justify-center min-w-[20px] text-ink-400"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageUrl(p)}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(linkBase, p === currentPage ? linkActive : linkInactive)}
          >
            {p}
          </Link>
        ),
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={pageUrl(currentPage + 1)}
          rel="next"
          aria-label="Next page"
          className={cn(linkBase, linkInactive, 'gap-1.5')}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} strokeWidth={2} />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={cn(linkBase, 'opacity-40 cursor-not-allowed gap-1.5 border-border-light bg-parchment-50 text-ink-400')}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={14} strokeWidth={2} />
        </span>
      )}
    </nav>
  )
}

function GridCard({ post }: { post: BlogPost }) {
  const hue = hueForSlug(post.slug)
  return (
    <Link
      href={`/resources/${post.slug}`}
      className="group block bg-parchment-50 border border-border-light rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] hover:border-border-medium"
    >
      <div
        className="relative aspect-[16/10] flex items-start p-3.5"
        style={
          post.featuredImage
            ? { backgroundImage: `url(${post.featuredImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: PH_SCENE_BG, filter: `hue-rotate(${hue}deg)` }
        }
      >
        <span className="inline-block bg-parchment-50/[0.92] backdrop-blur-md border border-gold-300 text-ink-900 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2.5 py-[5px] rounded-full">
          {post.category}
        </span>
      </div>

      <div className="px-6 pt-5 pb-6">
        <h4 className="font-display text-[1.375rem] font-bold text-ink-900 leading-[1.25] tracking-[-0.015em] mb-2.5 group-hover:text-burgundy-700 transition-colors">
          {post.title}
        </h4>
        <div className="flex items-center gap-2.5 mb-3.5">
          <span className="font-body text-[0.6875rem] font-bold tracking-[0.15em] uppercase text-gold-700">
            {post.dateLabel}
          </span>
          <span className="w-1 h-1 rounded-full bg-gold-500" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-500 tabular-nums">
            <ClockIcon className="w-3 h-3 text-ink-400" />
            {post.readMin} min
          </span>
        </div>
        <p className="text-[0.9375rem] text-ink-700 leading-[1.55]">
          {post.excerpt}
        </p>
      </div>
    </Link>
  )
}
