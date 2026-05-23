import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import {
  fetchPostsByCategory,
  fetchCategoryCounts,
  categoryToSlug,
  slugToCategory,
  type BlogPost,
} from '@/lib/blog-server'

/* =====================================================================
   BLOG CATEGORY ARCHIVE — /blog/category/[slug]

   Filters the public archive to a single category. Slug is the lower-
   case, dash-separated form of the category label (e.g. "behind-the-
   scenes" → "Behind the scenes"). When the slug doesn't resolve, 404.

   Same ISR cadence as the rest of the blog so admin re-categorisations
   propagate within ~60s.
   ===================================================================== */

export const revalidate = 60

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

interface PageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  const cats = await fetchCategoryCounts()
  return cats
    .filter((c) => c.label !== 'All')
    .map((c) => ({ category: categoryToSlug(c.label) }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params
  const label = slugToCategory(slug)
  if (!label) {
    return {
      title: 'Category not found · Design Vortex Blog',
      robots: { index: false, follow: false },
    }
  }
  return {
    title: `${label} · Design Vortex Blog`,
    description: `Articles tagged ${label}. Studio notes, guides, and process walkthroughs from Design Vortex.`,
    alternates: { canonical: `/blog/category/${slug}` },
  }
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category: slug } = await params
  const label = slugToCategory(slug)
  if (!label) notFound()

  const [posts, categories] = await Promise.all([
    fetchPostsByCategory(label),
    fetchCategoryCounts(),
  ])

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        <PageHero
          eyebrow={`Studio Notes / ${label}`}
          title={
            <>
              Posts in{' '}
              <em className="font-display italic font-medium text-burgundy-700">{label}</em>
            </>
          }
          description={`${posts.length} ${posts.length === 1 ? 'article' : 'articles'} in this category. Same craft, narrower lens.`}
        />

        <section className="pb-16 md:pb-24">
          <Container>

            {/* Category chips — same shape as /blog */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {categories.map((cat) => {
                const isAll = cat.label === 'All'
                const isActive = !isAll && categoryToSlug(cat.label) === slug
                const href = isAll ? '/blog' : `/blog/category/${categoryToSlug(cat.label)}`
                return (
                  <Link
                    key={cat.label}
                    href={href}
                    className={
                      isActive
                        ? 'px-4 py-2 rounded-full border border-burgundy-700 bg-burgundy-700 text-cream-50 font-body text-[0.8125rem] font-medium transition-colors'
                        : 'px-4 py-2 rounded-full border border-border-light bg-parchment-100 text-ink-700 font-body text-[0.8125rem] font-medium hover:bg-parchment-200 hover:border-border-medium transition-colors'
                    }
                  >
                    {cat.label} · {cat.count}
                  </Link>
                )
              })}
            </div>

            {posts.length === 0 ? (
              <p className="text-center text-ink-500 text-sm py-20">
                No posts in this category yet. <Link href="/blog" className="text-burgundy-700 hover:text-burgundy-500">Back to all articles →</Link>
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <GridCard key={post.slug} post={post} />
                ))}
              </div>
            )}

          </Container>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}

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
        <p className="text-[0.9375rem] text-ink-700 leading-[1.55]">{post.excerpt}</p>
      </div>
    </Link>
  )
}
