import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, ChevronRight, ArrowRight } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Container from '@/components/ui/Container'
import Markdown from '@/components/ui/Markdown'
import {
  fetchPillarByGenre,
  fetchPostsByGenre,
  fetchActivePillarGenres,
  genreBySlug,
  STUDIO_AUTHOR,
  type BlogPost,
} from '@/lib/blog-server'
import { SITE_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'

/* =====================================================================
   /pillars/[genre] — single pillar page.
   Layout: breadcrumbs · genre eyebrow · pillar title · meta · feature
   image · markdown body · spoke roundup ("More on {genre}").
   ===================================================================== */

export const revalidate = 60

interface PageProps {
  params: Promise<{ genre: string }>
}

export async function generateStaticParams() {
  const genres = await fetchActivePillarGenres()
  return genres.map((g) => ({ genre: g.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { genre: genreSlug } = await params
  const genre = genreBySlug(genreSlug)
  const pillar = await fetchPillarByGenre(genreSlug)
  if (!genre || !pillar) {
    return { title: 'Guide not found · Design Vortex' }
  }
  const title = pillar.seoTitle ?? `${pillar.title} · Design Vortex`
  const description = pillar.seoDescription ?? pillar.excerpt
  return {
    title,
    description,
    alternates: { canonical: `/pillars/${genreSlug}` },
    openGraph: {
      type: 'article',
      title: pillar.title,
      description,
      publishedTime: pillar.date,
      images: pillar.featuredImage ? [pillar.featuredImage] : undefined,
    },
  }
}

const PH_SCENE_BG =
  'radial-gradient(ellipse at 50% 80%, rgba(232,200,128,0.4), transparent 60%), linear-gradient(180deg, #1F4D3A 0%, #6B1F2A 60%, #1a130c 100%)'

function hueForSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
  return Math.abs(h) % 360
}

export default async function PillarPage({ params }: PageProps) {
  const { genre: genreSlug } = await params
  const genre = genreBySlug(genreSlug)
  if (!genre) notFound()

  const [pillar, spokes] = await Promise.all([
    fetchPillarByGenre(genreSlug),
    fetchPostsByGenre(genreSlug, { excludePillar: true }),
  ])
  if (!pillar) notFound()

  /* Article + CollectionPage schema so Google reads this as the
   * authority page for the genre, with the spoke posts as the linked set. */
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: pillar.title,
    description: pillar.excerpt,
    datePublished: pillar.date,
    author: { '@type': 'Person', name: pillar.authorName },
    publisher: { '@type': 'Organization', name: 'Design Vortex' },
    image: pillar.featuredImage ? [pillar.featuredImage] : undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/pillars/${genreSlug}` },
    about: genre.label,
  }

  const hue = hueForSlug(pillar.slug)

  return (
    <>
      <SiteHeader />
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />

        {/* Breadcrumbs */}
        <div className="pt-[120px] pb-4">
          <Container>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
              <Link href="/" className="hover:text-burgundy-700 transition-colors">Home</Link>
              <ChevronRight size={12} strokeWidth={1.5} className="text-ink-400" />
              <Link href="/resources" className="hover:text-burgundy-700 transition-colors">Guides</Link>
              <ChevronRight size={12} strokeWidth={1.5} className="text-ink-400" />
              <span aria-current="page" className="text-ink-700 truncate max-w-[280px] md:max-w-none">
                {genre.label}
              </span>
            </nav>
          </Container>
        </div>

        {/* Article header */}
        <article>
          <header className="pt-6 pb-10">
            <Container>
              <div className="max-w-[760px] mx-auto text-center">
                <span className="inline-block bg-burgundy-100 text-burgundy-700 text-[0.75rem] tracking-[0.15em] uppercase font-semibold px-3 py-1 rounded-full mb-3">
                  {genre.label} · Genre Guide
                </span>
                <div className="font-accent text-[1.375rem] text-burgundy-700 mb-3">
                  {genre.tagline}
                </div>
                <h1
                  className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mb-6 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
                >
                  {pillar.title}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-ink-500">
                  <span className="font-semibold text-ink-700">{pillar.authorName}</span>
                  <span className="w-1 h-1 rounded-full bg-ink-400" aria-hidden="true" />
                  <time dateTime={pillar.date}>{pillar.dateLabel}</time>
                  <span className="w-1 h-1 rounded-full bg-ink-400" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} strokeWidth={1.8} />
                    {pillar.readMin} min read
                  </span>
                </div>
              </div>
            </Container>
          </header>

          {/* Featured image */}
          <Container>
            <div
              className="max-w-[960px] mx-auto aspect-[16/9] rounded-xl border border-border-light overflow-hidden mb-12 md:mb-16"
              style={
                pillar.featuredImage
                  ? { backgroundImage: `url(${pillar.featuredImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: PH_SCENE_BG, filter: `hue-rotate(${hue}deg)` }
              }
            />
          </Container>

          {/* Body */}
          <div className="pb-16">
            <Container>
              <div
                className={cn(
                  'max-w-prose mx-auto font-body text-ink-700 leading-[1.8] text-[1.0625rem]',
                  '[&_p]:mb-5',
                  '[&_h2]:font-display [&_h2]:text-[2rem] [&_h2]:font-semibold [&_h2]:text-ink-900 [&_h2]:leading-[1.2] [&_h2]:mt-[2em] [&_h2]:mb-[0.5em] [&_h2]:tracking-tight',
                  '[&_h3]:font-display [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-ink-900 [&_h3]:leading-snug [&_h3]:mt-[1.75em] [&_h3]:mb-4 [&_h3]:tracking-tight',
                  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2 [&_ul]:marker:text-burgundy-700',
                  '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2 [&_ol]:marker:text-burgundy-700',
                  '[&_blockquote]:my-[2em] [&_blockquote]:px-10 [&_blockquote]:py-8 [&_blockquote]:bg-gold-100 [&_blockquote]:border-l-[3px] [&_blockquote]:border-gold-500 [&_blockquote]:rounded-md [&_blockquote]:font-display [&_blockquote]:italic [&_blockquote]:text-2xl [&_blockquote]:leading-[1.45] [&_blockquote]:text-ink-900',
                )}
              >
                <Markdown>{pillar.body}</Markdown>
              </div>
            </Container>
          </div>

          {/* Author bio */}
          <div className="pb-12">
            <Container>
              <div className="max-w-[680px] mx-auto">
                <aside className="flex flex-col sm:flex-row gap-5 items-start bg-parchment-100 border border-border-light rounded-xl p-8">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-burgundy-700 to-gold-700 text-cream-50 font-display text-2xl font-semibold inline-flex items-center justify-center">
                    {STUDIO_AUTHOR.initials}
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-semibold text-ink-900 mb-1">{pillar.authorName}</h4>
                    <p className="text-[0.9375rem] text-ink-500 leading-[1.55]">{STUDIO_AUTHOR.bio}</p>
                  </div>
                </aside>
              </div>
            </Container>
          </div>
        </article>

        {/* Spoke roundup — every other post tagged with this genre */}
        {spokes.length > 0 && (
          <section className="bg-parchment-100 py-20">
            <Container>
              <div className="max-w-[1080px] mx-auto">
                <div className="mb-10">
                  <div className="text-[0.6875rem] uppercase tracking-[0.18em] font-semibold text-gold-700 mb-2">
                    More on {genre.label}
                  </div>
                  <h2
                    className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                    style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)' }}
                  >
                    Guides &amp; case studies <em>across this genre</em>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {spokes.map((post) => (
                    <SpokeCard key={post.slug} post={post} />
                  ))}
                </div>

                <div className="text-center mt-10">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:gap-3 transition-all"
                  >
                    Every studio note <ArrowRight size={14} strokeWidth={1.8} />
                  </Link>
                </div>
              </div>
            </Container>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}

function SpokeCard({ post }: { post: BlogPost }) {
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
        <h4 className="font-display text-[1.25rem] font-bold text-ink-900 leading-[1.25] tracking-[-0.015em] mb-2 group-hover:text-burgundy-700 transition-colors">
          {post.title}
        </h4>
        <div className="flex items-center gap-2.5 mb-3 text-[0.8125rem] text-ink-500">
          <time dateTime={post.date} className="font-body text-[0.6875rem] font-bold tracking-[0.15em] uppercase text-gold-700">
            {post.dateLabel}
          </time>
          <span className="w-1 h-1 rounded-full bg-gold-500" aria-hidden="true" />
          <span className="inline-flex items-center gap-1.5">
            <Clock size={12} strokeWidth={1.6} />
            {post.readMin} min
          </span>
        </div>
        <p className="text-[0.9375rem] text-ink-700 leading-[1.55] line-clamp-3">
          {post.excerpt}
        </p>
      </div>
    </Link>
  )
}
