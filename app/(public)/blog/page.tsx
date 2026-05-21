import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'

/* =====================================================================
   BLOG INDEX — literal port of Blog.html.

   Structure (matches design HTML exactly):
     1. Hero (Studio Notes eyebrow + "Field notes & process" title)
     2. Featured post card (.bl-featured)
     3. Category chips (.bl-cat-chips) — All · 24, Guides · 9, etc.
     4. 6-card grid (.bl-grid) — ds-ph-scene gradient with hue-rotate variants
     5. Load 6 more button (outline burgundy)
     6. Newsletter card (.bl-newsletter) — Studio dispatch + email form

   NOTE: Earlier version had pagination dots + invented "Process" category +
   AI/lighting articles that aren't in the design. Removed.
   ===================================================================== */

export const metadata: Metadata = {
  title: 'Studio Notes · Design Vortex Blog',
  description:
    'Guides on commissioning art, process walkthroughs, and thoughts on what makes a good character portrait. Updated weekly.',
  alternates: { canonical: '/blog' },
}

/* ---------- Featured post ---------- */
const FEATURED = {
  slug: 'commission-brief-that-works',
  category: 'Guides',
  title: 'How to write a commission brief that <em>actually</em> gets you the art you want',
  excerpt:
    "The difference between \"tiefling sorcerer\" and a brief I can paint from. A working checklist with examples from real client briefs — what worked, what missed, and the words that always make the artist's job easier.",
  date: 'Mar 12 · 2026',
  readTime: '8 min read',
}

/* ---------- 6 grid posts (literal from Blog.html) ---------- */
interface Post {
  slug: string
  category: string
  title: string
  date: string
  readMin: string
  excerpt: string
  /** hue-rotate filter value applied to the ds-ph-scene gradient */
  hue: number
}

const POSTS: Post[] = [
  {
    slug: 'three-weeks-with-lyra',
    category: 'Behind the scenes',
    title: "Three weeks with Lyra: from a player's note to a final painting",
    date: 'Feb 28 · 2026',
    readMin: '12 min',
    excerpt:
      'Sketches, color blocks, and the revision where everything clicked. A full process walkthrough.',
    hue: 40,
  },
  {
    slug: 'vtt-token-headshot',
    category: 'D&D',
    title: 'Why your VTT token deserves more than a clipped headshot',
    date: 'Feb 11 · 2026',
    readMin: '5 min',
    excerpt:
      'A defense of the round portrait at 512px. Plus three tokens that earned their pixel budget.',
    hue: -30,
  },
  {
    slug: 'hero-forge-to-handpainted',
    category: 'Guides',
    title: 'Hero Forge to hand-painted: a starter guide for D&D players',
    date: 'Jan 22 · 2026',
    readMin: '6 min',
    excerpt:
      'What translates from Hero Forge to a painted portrait, and what we sketch around.',
    hue: 120,
  },
  {
    slug: 'first-art-fair-booth',
    category: 'Behind the scenes',
    title: "What I packed for my first art-fair booth (and what I'd cut)",
    date: 'Jan 9 · 2026',
    readMin: '7 min',
    excerpt:
      'Prints, palette samples, and the one thing I should have left at home.',
    hue: 200,
  },
  {
    slug: 'strahd-npc-pack-six-weeks',
    category: 'D&D',
    title: 'The Curse of Strahd NPC pack, painted over six weeks',
    date: 'Dec 19 · 2025',
    readMin: '10 min',
    excerpt:
      'Strahd, Ireena, Madam Eva, and the other six. How we kept style consistent across eight portraits.',
    hue: -80,
  },
  {
    slug: 'choosing-a-commission-style',
    category: 'Guides',
    title: 'Choosing a commission style: painterly vs anime vs lineart',
    date: 'Dec 4 · 2025',
    readMin: '9 min',
    excerpt:
      'What each style is best for, side-by-side examples, and how to decide for your character.',
    hue: 160,
  },
]

/* ---------- Category chips (counts literal from design) ---------- */
const CATEGORIES = [
  { label: 'All', count: 24, active: true },
  { label: 'Guides', count: 9, active: false },
  { label: 'Behind the scenes', count: 7, active: false },
  { label: 'D&D', count: 6, active: false },
  { label: 'Studio news', count: 2, active: false },
]

/* ---------- ds-ph-scene gradient (matches design-system.css) ---------- */
const PH_SCENE_BG =
  'radial-gradient(ellipse at 50% 80%, rgba(232,200,128,0.4), transparent 60%), linear-gradient(180deg, #1F4D3A 0%, #6B1F2A 60%, #1a130c 100%)'

/* ---------- Inline icons ---------- */
const ClockIcon = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
)

const ArrowRightSm = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export default function BlogIndexPage() {
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

        {/* Featured + grid section */}
        <section className="pb-16 md:pb-20">
          <Container>

            {/* Featured post — .bl-featured */}
            <Link
              href={`/blog/${FEATURED.slug}`}
              className="group block bg-parchment-100 border border-border-light rounded-2xl overflow-hidden mb-14 transition-shadow hover:shadow-[0_16px_40px_-8px_rgba(30,20,8,0.18)] hover:border-border-medium"
            >
              <div className="grid lg:grid-cols-[1.1fr_1fr] gap-0">
                {/* Image — ds-ph-scene gradient with cat chip top-left + Featured flag top-right */}
                <div
                  className="relative aspect-[16/9] lg:aspect-[16/11]"
                  style={{ background: PH_SCENE_BG }}
                >
                  {/* Category — parchment-50/92 bg, gold-300 border, gold-700 text */}
                  <span className="absolute top-4 left-4 inline-block bg-parchment-50/[0.92] backdrop-blur-md border border-gold-300 text-gold-700 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-3 py-[5px] rounded-full">
                    {FEATURED.category}
                  </span>
                  {/* Featured flag — burgundy-700 bg, cream-50 text */}
                  <span className="absolute top-4 right-4 inline-block bg-burgundy-700 text-cream-50 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-3 py-[5px] rounded-full">
                    Featured
                  </span>
                </div>

                {/* Body — padding 48px, gap 16px column */}
                <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-center gap-4">
                  <h2
                    className="font-display font-semibold text-ink-900 leading-[1.15] tracking-tight [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                    style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)' }}
                    dangerouslySetInnerHTML={{ __html: FEATURED.title }}
                  />
                  <p className="text-[1.0625rem] text-ink-700 leading-[1.65]">
                    {FEATURED.excerpt}
                  </p>
                  {/* Meta */}
                  <div className="flex items-center gap-2.5 mt-1">
                    <span className="font-body text-[0.6875rem] font-bold tracking-[0.15em] uppercase text-gold-700">
                      {FEATURED.date}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gold-500" aria-hidden="true" />
                    <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-500 tabular-nums">
                      <ClockIcon className="w-3 h-3 text-ink-400" />
                      {FEATURED.readTime}
                    </span>
                  </div>
                  {/* Link */}
                  <span className="inline-flex items-center gap-2 mt-2 font-body text-[0.75rem] uppercase tracking-[0.12em] font-semibold text-burgundy-700 group-hover:gap-3 transition-all">
                    Read the full guide <ArrowRightSm />
                  </span>
                </div>
              </div>
            </Link>

            {/* Category chips — .bl-cat-chips */}
            <div className="flex flex-wrap gap-2 justify-center mb-10">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  className={
                    cat.active
                      ? 'px-4 py-2 rounded-full border border-burgundy-700 bg-burgundy-700 text-cream-50 font-body text-[0.8125rem] font-medium transition-colors'
                      : 'px-4 py-2 rounded-full border border-border-light bg-parchment-100 text-ink-700 font-body text-[0.8125rem] font-medium hover:bg-parchment-200 hover:border-border-medium transition-colors'
                  }
                >
                  {cat.label} · {cat.count}
                </button>
              ))}
            </div>

            {/* Grid — .bl-grid: 3 cols desktop, 2 tablet, 1 mobile, gap 20px */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {POSTS.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block bg-parchment-50 border border-border-light rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] hover:border-border-medium"
                >
                  {/* Image — ds-ph-scene with hue-rotate filter */}
                  <div
                    className="relative aspect-[16/10] flex items-start p-3.5"
                    style={{
                      background: PH_SCENE_BG,
                      filter: `hue-rotate(${post.hue}deg)`,
                    }}
                  >
                    {/* Category chip — parchment-50/92 bg, gold-300 border, ink-900 text */}
                    <span className="inline-block bg-parchment-50/[0.92] backdrop-blur-md border border-gold-300 text-ink-900 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2.5 py-[5px] rounded-full">
                      {post.category}
                    </span>
                  </div>

                  {/* Body — padding 20px 24px 24px */}
                  <div className="px-6 pt-5 pb-6">
                    <h4 className="font-display text-[1.375rem] font-bold text-ink-900 leading-[1.25] tracking-[-0.015em] mb-2.5 group-hover:text-burgundy-700 transition-colors">
                      {post.title}
                    </h4>
                    {/* Meta */}
                    <div className="flex items-center gap-2.5 mb-3.5">
                      <span className="font-body text-[0.6875rem] font-bold tracking-[0.15em] uppercase text-gold-700">
                        {post.date}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gold-500" aria-hidden="true" />
                      <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-500 tabular-nums">
                        <ClockIcon className="w-3 h-3 text-ink-400" />
                        {post.readMin}
                      </span>
                    </div>
                    <p className="text-[0.9375rem] text-ink-700 leading-[1.55]">
                      {post.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load more — outline burgundy */}
            <div className="text-center">
              <Button variant="outline" size="md">
                Load 6 more articles
              </Button>
            </div>

          </Container>
        </section>

        {/* Newsletter — .bl-newsletter */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="bg-parchment-100 border border-border-light rounded-2xl p-7 md:p-12 grid md:grid-cols-2 gap-10 items-center">
              {/* Left — eyebrow + h3 + p */}
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

              {/* Right — form */}
              <form
                action="/api/newsletter"
                method="POST"
                className="flex flex-col gap-2"
              >
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
