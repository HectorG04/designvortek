import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import {
  fetchFeaturedPost,
  fetchGridPosts,
  fetchCategoryCounts,
  categoryToSlug,
  type BlogPost,
} from '@/lib/blog-server'

/* =====================================================================
   BLOG INDEX — CMS-backed.

   Reads from Supabase via lib/blog-server.ts; falls back to the
   in-memory snapshot in lib/blog.ts when the table is empty. ISR
   re-renders at most once a minute so admin edits propagate without
   a deploy.

   Structure ports Blog.html:
     1. Hero
     2. Featured post card
     3. Category chips → /blog/category/[slug]
     4. 3-column grid
     5. Newsletter card
   The "Load 6 more" button is dropped until we add pagination — the
   current archive is small enough to ship in one render.
   ===================================================================== */

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Studio Notes · Design Vortex Blog',
  description:
    'Guides on commissioning art, process walkthroughs, and thoughts on what makes a good character portrait. Updated regularly.',
  alternates: { canonical: '/blog' },
}

/* ds-ph-scene gradient — used as the fallback when a post has no
 * featured_image. Per-card hue rotation gives variation across the grid. */
const PH_SCENE_BG =
  'radial-gradient(ellipse at 50% 80%, rgba(232,200,128,0.4), transparent 60%), linear-gradient(180deg, #1F4D3A 0%, #6B1F2A 60%, #1a130c 100%)'

/* Stable hue rotation per slug so the grid stays visually varied between
 * revalidations. Hash a few char codes; modulo 360. */
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

export default async function BlogIndexPage() {
  const [featured, gridPosts, categories] = await Promise.all([
    fetchFeaturedPost(),
    fetchGridPosts(),
    fetchCategoryCounts(),
  ])

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        {/* Hero */}
        <PageHero
          eyebrow="Studio Notes"
          title={
            <>
              Field notes &amp;{' '}
              <em className="font-display italic font-medium text-burgundy-700">process</em>
            </>
          }
          description="Guides on commissioning art, walkthroughs of recent pieces, and occasional thoughts on what makes a portrait worth keeping."
        />

        <section className="pb-16 md:pb-20">
          <Container>

            {/* Featured post */}
            {featured && <FeaturedCard post={featured} />}

            {/* Category chips → /blog/category/[slug]. "All" links back
                here. Counts come from the live data so they reflect the
                published archive in real time. */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {categories.map((cat) => {
                const isAll = cat.label === 'All'
                const href = isAll ? '/blog' : `/blog/category/${categoryToSlug(cat.label)}`
                return (
                  <Link
                    key={cat.label}
                    href={href}
                    className={
                      isAll
                        ? 'px-4 py-2 rounded-full border border-burgundy-700 bg-burgundy-700 text-cream-50 font-body text-[0.8125rem] font-medium transition-colors'
                        : 'px-4 py-2 rounded-full border border-border-light bg-parchment-100 text-ink-700 font-body text-[0.8125rem] font-medium hover:bg-parchment-200 hover:border-border-medium transition-colors'
                    }
                  >
                    {cat.label} · {cat.count}
                  </Link>
                )
              })}
            </div>

            {/* Grid */}
            {gridPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
                {gridPosts.map((post) => (
                  <GridCard key={post.slug} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-center text-ink-500 text-sm py-12">
                More articles on the way.
              </p>
            )}

          </Container>
        </section>

        {/* Newsletter */}
        <section className="pb-16 md:pb-24">
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
                  Every few weeks, a roundup of recent commissions, process notes, and slot openings. No spam, no marketing fluff &mdash; just the good stuff.
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

/* ------------ Featured post card (large hero) ------------ */
function FeaturedCard({ post }: { post: BlogPost }) {
  const hue = hueForSlug(post.slug)
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-parchment-100 border border-border-light rounded-2xl overflow-hidden mb-14 transition-shadow hover:shadow-[0_16px_40px_-8px_rgba(30,20,8,0.18)] hover:border-border-medium"
    >
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-0">
        <div
          className="relative aspect-[16/9] lg:aspect-[16/11]"
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

        <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-center gap-4">
          <h2
            className="font-display font-semibold text-ink-900 leading-[1.15] tracking-tight"
            style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)' }}
          >
            {post.title}
          </h2>
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

/* ------------ Grid card ------------ */
function GridCard({ post }: { post: BlogPost }) {
  const hue = hueForSlug(post.slug)
  return (
    <Link
      href={`/blog/${post.slug}`}
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
