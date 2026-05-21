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

/* ============================================================
   Blog post type — body is a single MARKDOWN STRING that the
   `<Markdown>` renderer handles end-to-end (headings, lists,
   blockquotes, inline emphasis, internal + external links).
   This is the biggest place where the markdown-content rule
   applies; storing body as a block array loses inline links.
   ============================================================ */
type Post = {
  slug: string
  title: string
  category: string
  date: string
  isoDate: string
  readTime: string
  excerpt: string
  gradient: string
  author: { name: string; initials: string; bio: string }
  featureGradient?: string
  body: string
}

const POSTS: Post[] = [
  {
    slug: 'how-to-write-commission-brief',
    title: 'How to write a commission brief that gets the art you actually want',
    category: 'Guides',
    date: 'Mar 12, 2026',
    isoDate: '2026-03-12',
    readTime: '8 min read',
    excerpt: 'The difference between "tiefling sorcerer" and a brief I can paint from. A working checklist with examples.',
    gradient: 'from-violet-900 via-burgundy-700 to-amber-800',
    author: {
      name: 'Theo · Design Vortex founder',
      initials: 'T',
      bio: "Fourteen years painting characters, four years running this studio. Writes here about commissioning art, the painting process, and the occasional studio update.",
    },
    body: `Every commission begins with a brief. Some briefs read like a screenplay — vivid, specific, layered with the kind of detail that gives a painter somewhere to stand. Others read like a Google form filled out in a hurry. **Both are valid**, but the first kind almost always ends up with better art.

This isn't because the second kind is bad. It's because the artist ends up filling in the gaps from their own imagination — and your character lives in *your* imagination, not theirs. The closer your brief gets to the picture in your head, the closer the final piece will land.

So here's what fourteen years of taking briefs has taught me: the questions to answer, the parts to skip, and the words that always make the artist's job easier.

## Start with the one-line pitch

Before anything else, write one sentence that captures the character. Not their backstory, not their stats — the *essential vibe*. "A tired paladin who has stopped praying." "A bard who became a librarian." "A drow ranger who hates the surface but lives there anyway."

That one sentence is the lens. Everything that follows should reinforce it.

## The five details that matter most

After the pitch, lock down these five specifics. If you can answer all of them, you have a great brief. If you can't answer three, ask the artist what to add.

- **Species, build, age range.** "Half-elf, tall and lean, late thirties" beats "fantasy person."
- **Skin, hair, and eye specifics.** Hex codes are welcome. "Soft purple skin with darker freckles" is plenty.
- **Outfit and key items.** One distinctive piece is enough — "tattered violet robe with silver constellations stitched in" — not a full inventory.
- **Mood and lighting.** "Melancholy but powerful, warm dramatic lighting" gives the artist a tonal palette.
- **Pose or moment.** Standing, in motion, mid-spell, holding something? Pick one. Vagueness here is what makes characters feel generic.

> A great brief isn't long. It's specific in the right places and silent on the rest.

## References are gold. Mood boards are diamonds.

If you only do one extra thing, **send 3 to 5 reference images**. Not "draw this exactly" — references for vibe, lighting, color palette, similar species or outfit, even movie stills that capture the energy you want.

A Pinterest board with fifteen carefully-chosen images is more useful than a 2,000-word description. It lets the artist *see* what you see.

## What to leave out

Backstory longer than three paragraphs. The character's full stat block. Lists of every adventure they have ever been on. Every accessory they have ever owned.

All beautiful for your campaign. None of it makes the painting better.

## Closing the loop

The best briefs treat the commission as a collaboration. You bring the character. The artist brings the craft. The brief is the bridge. Get it right and the piece will feel like both of you painted it — which, in a way, you did.

If you've got a character waiting, [start a brief](/order). Or read more about [how character art commissions work](/services/character-art). Either way: the sooner you write that one-line pitch, the sooner your character ends up on the wall.`,
  },
  {
    slug: 'three-weeks-with-lyra',
    title: "Three weeks with Lyra: from a player's note to a final painting",
    category: 'Behind the scenes',
    date: 'Feb 28, 2026',
    isoDate: '2026-02-28',
    readTime: '12 min read',
    excerpt: 'Sketches, color blocks, and the revision where everything clicked. A full process walkthrough.',
    gradient: 'from-amber-900 via-orange-700 to-rose-700',
    author: {
      name: 'Theo · Design Vortex founder',
      initials: 'T',
      bio: "Fourteen years painting characters, four years running this studio. Writes here about commissioning art, the painting process, and the occasional studio update.",
    },
    body: `Lyra Vexweaver arrived in my inbox on a Tuesday in February, in a brief Aria had clearly spent her lunch hour writing. By the time I closed my laptop **three weeks later**, the painting was done. Here is what happened in between.

## Week one — sketches

I always start with **three thumbnail sketches** at low resolution. Different poses, different framings. The point is not to be precious; the point is to find the version that snaps into focus for both of us.

Aria picked the second thumbnail — Lyra mid-step, glass orb cupped in one hand, looking somewhere off-frame. We refined it over two passes.

## Week two — color block

Color blocks are where the painting starts to feel inevitable. Big shapes of color, no detail, just temperature and value. This stage often surprises clients — it looks like a watercolor study, not a finished portrait. But it locks the mood.

> The color block is the bones. If the bones are wrong, no amount of polish will save it.

## Week three — paint and polish

Paint is the longest stage but also the most predictable. Layers of detail, working from large to small, eyes always last. I sent Aria three progress shots across five days.

### The revision that mattered

On the second-to-last day, Aria asked if Lyra could be looking *slightly* higher — not at the orb, but past it. Five minutes of paint. Different painting.

That is the value of **two paint revisions** baked into every commission. Most clients use only one. But when the second one matters, it really matters.

Want to see how it works for your character? [Start a brief](/order) or browse the [portfolio](/portfolio) for more before-and-afters.`,
  },
  {
    slug: 'vtt-token-deserves-more',
    title: 'Why your VTT token deserves more than a clipped headshot',
    category: 'D&D',
    date: 'Feb 11, 2026',
    isoDate: '2026-02-11',
    readTime: '5 min read',
    excerpt: 'A defense of the round portrait at 512px. Plus three tokens that earned their pixel budget.',
    gradient: 'from-emerald-900 via-teal-700 to-burgundy-700',
    author: {
      name: 'Theo · Design Vortex founder',
      initials: 'T',
      bio: "Fourteen years painting characters, four years running this studio. Writes here about commissioning art, the painting process, and the occasional studio update.",
    },
    body: `Most VTT tokens are *crops*. A square portrait gets a circular mask slapped on top, the head ends up too small, and the corners look awkward at any zoom level. There is a better way.

## Design for the circle from the start

A purpose-painted token uses the round frame as composition. The head fills more of the canvas. The shoulders curve into the edge. **Decorative borders pull the eye inward**.

## Three tokens that earned their pixel budget

- A **wraith** with smoke that breaks the circle slightly — only visible at hover zoom.
- A **dwarf cleric** whose hammer rests across the lower third, giving the token visual weight.
- A **drow ranger** with two glowing eyes that read clearly at 64 pixels — token-first detailing.

At 512 pixels, every choice matters. A token that was a full portrait first will always look like a portrait someone clipped. A token painted as a token reads at every zoom.

Browse our [VTT token service](/services/vtt-tokens) or start a [commission](/order) for your party.`,
  },
]

const POST_MAP = new Map(POSTS.map((p) => [p.slug, p]))

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = POST_MAP.get(slug)
  if (!post) return { title: 'Article not found' }
  return {
    title: `${post.title} — Design Vortex Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.isoDate,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = POST_MAP.get(slug)
  if (!post) notFound()

  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.isoDate,
    author: { '@type': 'Person', name: 'Theo' },
    publisher: { '@type': 'Organization', name: 'Design Vortex' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  }

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
              <span aria-current="page" className="text-ink-700 truncate max-w-[280px] md:max-w-none">{post.title}</span>
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
                  <span className="font-semibold text-ink-700">{post.author.name}</span>
                  <span className="w-1 h-1 rounded-full bg-ink-400" aria-hidden="true" />
                  <time dateTime={post.isoDate}>{post.date}</time>
                  <span className="w-1 h-1 rounded-full bg-ink-400" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} strokeWidth={1.8} />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </Container>
          </header>

          {/* Featured image */}
          <Container>
            <div className={cn('max-w-4xl mx-auto aspect-[16/9] rounded-2xl overflow-hidden mb-12 md:mb-16', `bg-gradient-to-br ${post.gradient}`)} />
          </Container>

          {/* Body — single markdown string rendered through branded Markdown component.
              Tailwind utilities target h2/h3/ul/blockquote via [&_…] selectors so
              react-markdown's plain tags still get the Cormorant + gold-rail treatment. */}
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
                    {post.author.initials}
                  </div>
                  <div>
                    <h4 className="font-display text-xl font-semibold text-ink-900 mb-2">{post.author.name}</h4>
                    <p className="text-sm text-ink-700 leading-relaxed">{post.author.bio}</p>
                  </div>
                </aside>
              </div>
            </Container>
          </div>
        </article>

        {/* More articles */}
        <section className="bg-parchment-100 py-20">
          <Container>
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-tight tracking-tight">
                More <em className="font-display italic font-medium text-burgundy-700">articles</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group block bg-parchment-50 border border-border-light rounded-2xl overflow-hidden hover:border-border-medium hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow"
                >
                  <div className={cn('aspect-[16/10] flex items-end p-4', `bg-gradient-to-br ${p.gradient}`)}>
                    <span className="inline-block bg-tome-950/65 backdrop-blur-md border border-cream-50/15 text-cream-50 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2.5 py-1 rounded-full">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h4 className="font-display text-lg font-semibold text-ink-900 leading-snug mb-3 group-hover:text-burgundy-700 transition-colors line-clamp-3">
                      {p.title}
                    </h4>
                    <p className="text-sm text-ink-700 leading-relaxed line-clamp-2">{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button href="/blog" variant="outline" size="md">
                All articles <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
