import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import { BLOG_PREVIEW } from '@/lib/constants'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Studio notes — DesignVortek Blog',
  description:
    'Guides on commissioning art, walkthroughs of recent commissions, and field notes from a hand-painted studio. Updated weekly.',
  alternates: { canonical: '/blog' },
}

/* ---------- Demo articles (3 from constants + 6 extras) ---------- */
const EXTRA_POSTS = [
  {
    slug: 'hero-forge-to-handpainted',
    title: 'Hero Forge to hand-painted: a starter guide for D&D players',
    category: 'Guides',
    date: 'Jan 22 · 2026',
    readTime: '6 min read',
    excerpt: 'What translates from a Hero Forge mini to a painted portrait, and what we sketch around instead.',
    gradient: 'from-amber-900 via-orange-700 to-rose-700',
  },
  {
    slug: 'first-art-fair-booth',
    title: 'What I packed for my first art-fair booth (and what I would cut)',
    category: 'Behind the scenes',
    date: 'Jan 9 · 2026',
    readTime: '7 min read',
    excerpt: 'Prints, palette samples, and the one thing that should have stayed home.',
    gradient: 'from-emerald-900 via-teal-700 to-amber-700',
  },
  {
    slug: 'strahd-npc-pack-six-weeks',
    title: 'The Curse of Strahd NPC pack, painted over six weeks',
    category: 'D&D',
    date: 'Dec 19 · 2025',
    readTime: '10 min read',
    excerpt: 'Strahd, Ireena, Madam Eva, and the other five. Keeping style consistent across eight portraits.',
    gradient: 'from-stone-900 via-burgundy-700 to-rose-700',
  },
  {
    slug: 'choosing-a-commission-style',
    title: 'Choosing a commission style: painterly vs anime vs lineart',
    category: 'Guides',
    date: 'Dec 4 · 2025',
    readTime: '9 min read',
    excerpt: 'What each style is best for, side-by-side examples, and how to decide for your character.',
    gradient: 'from-rose-900 via-pink-700 to-fuchsia-600',
  },
  {
    slug: 'why-we-dont-use-ai',
    title: 'Why we do not use AI — and what that costs us',
    category: 'Process',
    date: 'Nov 15 · 2025',
    readTime: '6 min read',
    excerpt: 'Honesty about the trade-offs of a fully hand-painted studio in an automated industry.',
    gradient: 'from-slate-900 via-violet-800 to-purple-700',
  },
  {
    slug: 'lighting-a-fantasy-portrait',
    title: 'Lighting a fantasy portrait: three setups that always work',
    category: 'Process',
    date: 'Oct 28 · 2025',
    readTime: '8 min read',
    excerpt: 'Rim light from behind, candle warmth from below, moonlight from above — what each one says.',
    gradient: 'from-violet-950 via-indigo-800 to-amber-700',
  },
] as const

const ALL_POSTS = [...BLOG_PREVIEW, ...EXTRA_POSTS]
const FEATURED = ALL_POSTS[0]
const REST = ALL_POSTS.slice(1)

const CATEGORIES = [
  { label: 'All', count: ALL_POSTS.length, active: true },
  { label: 'Guides', count: 4 },
  { label: 'Behind the scenes', count: 2 },
  { label: 'D&D', count: 2 },
  { label: 'Process', count: 2 },
]

export default function BlogIndexPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Studio notes"
          title={<>Field notes &amp; <em className="font-display italic font-medium text-burgundy-700">process</em></>}
          description="Guides on commissioning art, walkthroughs of recent pieces, and occasional thoughts on what makes a portrait worth keeping."
        />

        {/* Featured post */}
        <section className="pb-8">
          <Container>
            <Link
              href={`/blog/${FEATURED.slug}`}
              className="group block bg-parchment-50 border border-border-light rounded-2xl overflow-hidden hover:border-border-medium hover:shadow-[0_16px_40px_-8px_rgba(30,20,8,0.18)] transition-all"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className={cn('relative aspect-[16/10] md:aspect-auto md:min-h-[420px] flex items-end p-6', `bg-gradient-to-br ${FEATURED.gradient}`)}>
                  <span className="absolute top-5 left-5 inline-block bg-gold-500 text-ink-900 text-[0.625rem] tracking-[0.18em] uppercase font-bold px-3 py-1.5 rounded-full">
                    Featured
                  </span>
                  <span className="inline-block bg-tome-950/65 backdrop-blur-md border border-cream-50/15 text-cream-50 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2.5 py-1 rounded-full">
                    {FEATURED.category}
                  </span>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-[1.15] tracking-tight mb-4 group-hover:text-burgundy-700 transition-colors">
                    {FEATURED.title}
                  </h2>
                  <p className="text-ink-700 leading-relaxed mb-5 max-w-[55ch]">
                    {FEATURED.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-ink-500 mb-6">
                    <span>{FEATURED.date}</span>
                    <span className="w-1 h-1 rounded-full bg-ink-400" aria-hidden="true" />
                    <span className="inline-flex items-center gap-1">
                      <Clock size={11} strokeWidth={1.8} />
                      {FEATURED.readTime}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 group-hover:gap-3.5 transition-all">
                    Read the full guide <ArrowRight size={14} strokeWidth={1.8} />
                  </span>
                </div>
              </div>
            </Link>
          </Container>
        </section>

        {/* Category chips */}
        <section className="py-8">
          <Container>
            <div className="flex flex-wrap gap-2.5 justify-center">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.75rem] uppercase tracking-[0.12em] font-semibold transition-all border',
                    cat.active
                      ? 'bg-burgundy-700 text-cream-50 border-burgundy-700'
                      : 'bg-parchment-50 text-ink-700 border-border-light hover:border-border-medium hover:text-burgundy-700'
                  )}
                >
                  {cat.label}
                  <span className={cn('text-[0.6875rem] opacity-70', cat.active && 'opacity-90')}>· {cat.count}</span>
                </button>
              ))}
            </div>
          </Container>
        </section>

        {/* Article grid */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {REST.map((post) => (
                <article key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block bg-parchment-50 border border-border-light rounded-2xl overflow-hidden hover:border-border-medium hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow h-full"
                  >
                    <div className={cn('relative aspect-[16/10] flex items-end p-4', `bg-gradient-to-br ${post.gradient}`)}>
                      <span className="inline-block bg-tome-950/65 backdrop-blur-md border border-cream-50/15 text-cream-50 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2.5 py-1 rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-6 flex flex-col">
                      <h4 className="font-display text-xl font-semibold text-ink-900 leading-snug mb-3 group-hover:text-burgundy-700 transition-colors line-clamp-3">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-ink-500 mb-3">
                        <span>{post.date}</span>
                        <span className="w-1 h-1 rounded-full bg-ink-400" aria-hidden="true" />
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} strokeWidth={1.8} />
                          {post.readTime}
                        </span>
                      </div>
                      <p className="text-sm text-ink-700 leading-relaxed">{post.excerpt}</p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-16 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border-light text-ink-400 cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} strokeWidth={1.8} />
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={cn(
                    'inline-flex items-center justify-center w-10 h-10 rounded-full font-body text-sm font-semibold transition-colors',
                    n === 1
                      ? 'bg-burgundy-700 text-cream-50'
                      : 'bg-parchment-50 text-ink-700 border border-border-light hover:border-border-medium hover:text-burgundy-700'
                  )}
                >
                  {n}
                </button>
              ))}
              <span className="text-ink-400 px-2">…</span>
              <button
                type="button"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border-light text-ink-700 hover:border-border-medium hover:text-burgundy-700 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} strokeWidth={1.8} />
              </button>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
