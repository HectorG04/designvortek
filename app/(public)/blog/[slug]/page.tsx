import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, ChevronRight, ArrowRight } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import Markdown from '@/components/ui/Markdown'
import { SITE_URL } from '@/lib/constants'
import { cn } from '@/lib/utils'
import {
  fetchAllSlugs,
  fetchPostBySlug,
  fetchRelatedPosts,
  STUDIO_AUTHOR,
  type BlogPost,
} from '@/lib/blog-server'

/* =====================================================================
   BLOG POST — CMS-backed.

   Reads from Supabase via lib/blog-server.ts; falls back to the snapshot
   in lib/blog.ts. ISR re-renders within `revalidate` seconds so admin
   edits land on the public page without a deploy.

   generateStaticParams unions DB slugs with snapshot slugs so the build
   pre-renders every known post; new posts created in admin get rendered
   on first request via fallback: blocking (Next default for dynamic
   segments not returned from generateStaticParams).
   ===================================================================== */

export const revalidate = 60

const PH_SCENE_BG =
  'radial-gradient(ellipse at 50% 80%, rgba(232,200,128,0.4), transparent 60%), linear-gradient(180deg, #1F4D3A 0%, #6B1F2A 60%, #1a130c 100%)'

function hueForSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
  return Math.abs(h) % 360
}

export async function generateStaticParams() {
  const slugs = await fetchAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)
  if (!post) return { title: 'Article not found · Design Vortex' }

  const title = post.seoTitle ?? `${post.title} · Design Vortex Blog`
  const description = post.seoDescription ?? post.excerpt

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      publishedTime: post.date,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)
  if (!post) notFound()

  const related = await fetchRelatedPosts(post.slug, 3)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.authorName },
    publisher: { '@type': 'Organization', name: 'Design Vortex' },
    image: post.featuredImage ? [post.featuredImage] : undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  }

  const hue = hueForSlug(post.slug)

  return (
    <>
      <SiteHeader />
      <main>
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
              <Link href="/blog" className="hover:text-burgundy-700 transition-colors">Blog</Link>
              <ChevronRight size={12} strokeWidth={1.5} className="text-ink-400" />
              <span aria-current="page" className="text-ink-700 truncate max-w-[280px] md:max-w-none">
                {post.title}
              </span>
            </nav>
          </Container>
        </div>

        {/* Article header */}
        <article>
          <header className="pt-6 pb-10">
            <Container>
              <div className="max-w-3xl mx-auto text-center">
                <span className="inline-block bg-burgundy-100 text-burgundy-700 text-[0.625rem] tracking-[0.18em] uppercase font-bold px-3 py-1.5 rounded-full mb-6">
                  {post.category}
                </span>
                <h1
                  className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mb-6"
                  style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
                >
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-ink-500">
                  <span className="font-semibold text-ink-700">{post.authorName}</span>
                  <span className="w-1 h-1 rounded-full bg-ink-400" aria-hidden="true" />
                  <time dateTime={post.date}>{post.dateLabel}</time>
                  <span className="w-1 h-1 rounded-full bg-ink-400" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} strokeWidth={1.8} />
                    {post.readMin} min read
                  </span>
                </div>
              </div>
            </Container>
          </header>

          {/* Featured image */}
          <Container>
            <div
              className="max-w-4xl mx-auto aspect-[16/9] rounded-2xl overflow-hidden mb-12 md:mb-16"
              style={
                post.featuredImage
                  ? { backgroundImage: `url(${post.featuredImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
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
                  '[&_h2]:font-display [&_h2]:text-3xl md:[&_h2]:text-[2rem] [&_h2]:font-semibold [&_h2]:text-ink-900 [&_h2]:leading-tight [&_h2]:mt-12 [&_h2]:mb-5 [&_h2]:tracking-tight',
                  '[&_h3]:font-display [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-ink-900 [&_h3]:leading-snug [&_h3]:mt-10 [&_h3]:mb-4 [&_h3]:tracking-tight',
                  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul]:space-y-2.5 [&_ul]:marker:text-burgundy-700',
                  '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol]:space-y-2.5 [&_ol]:marker:text-burgundy-700',
                  '[&_blockquote]:my-10 [&_blockquote]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-gold-500 [&_blockquote]:font-display [&_blockquote]:italic [&_blockquote]:text-2xl md:[&_blockquote]:text-[1.75rem] [&_blockquote]:leading-snug [&_blockquote]:text-ink-900',
                )}
              >
                <Markdown>{post.body}</Markdown>
              </div>
            </Container>
          </div>

          {/* Author bio */}
          <div className="pb-16">
            <Container>
              <div className="max-w-3xl mx-auto">
                <div className="h-px bg-border-light mb-10" />
                <aside className="flex flex-col sm:flex-row gap-5 items-start bg-parchment-50 border border-border-light rounded-2xl p-6 md:p-8">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-burgundy-700 to-gold-700 text-cream-50 font-display text-2xl font-semibold inline-flex items-center justify-center">
                    {STUDIO_AUTHOR.initials}
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-semibold text-ink-900 mb-2">{post.authorName}</h4>
                    <p className="text-sm text-ink-700 leading-relaxed">{STUDIO_AUTHOR.bio}</p>
                  </div>
                </aside>
              </div>
            </Container>
          </div>
        </article>

        {/* More articles */}
        {related.length > 0 && (
          <section className="bg-parchment-100 py-20">
            <Container>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-tight tracking-tight">
                  More <em className="font-display italic font-medium text-burgundy-700">articles</em>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {related.map((p) => (
                  <RelatedCard key={p.slug} post={p} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Button href="/blog" variant="outline" size="md">
                  All articles <ArrowRight size={14} strokeWidth={1.8} />
                </Button>
              </div>
            </Container>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}

function RelatedCard({ post }: { post: BlogPost }) {
  const hue = hueForSlug(post.slug)
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-parchment-50 border border-border-light rounded-2xl overflow-hidden hover:border-border-medium hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow"
    >
      <div
        className="aspect-[16/10] flex items-end p-4"
        style={
          post.featuredImage
            ? { backgroundImage: `url(${post.featuredImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: PH_SCENE_BG, filter: `hue-rotate(${hue}deg)` }
        }
      >
        <span className="inline-block bg-tome-950/65 backdrop-blur-md border border-cream-50/15 text-cream-50 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2.5 py-1 rounded-full">
          {post.category}
        </span>
      </div>
      <div className="p-6">
        <h4 className="font-display text-lg font-semibold text-ink-900 leading-snug mb-3 group-hover:text-burgundy-700 transition-colors line-clamp-3">
          {post.title}
        </h4>
        <p className="text-sm text-ink-700 leading-relaxed line-clamp-2">{post.excerpt}</p>
      </div>
    </Link>
  )
}
