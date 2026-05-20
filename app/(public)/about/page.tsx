import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'

/* =====================================================================
   ABOUT — literal port of About.html.

   Structure (matches design HTML exactly):
     1. Hero
     2. Artist intro (.ab-intro)  — 1fr 1.1fr grid, 4:5 portrait + bio
     3. Values (.ab-values)       — 3 cards on parchment-100
     4. Stats (.ab-stats)         — 4-up with vertical dividers
     5. Behind the scenes (.ab-bts) — 5-tile grid on parchment-100
     6. CTA strip                 — dark tome closer
   ===================================================================== */

export const metadata: Metadata = {
  title: 'About · Design Vortek',
  description:
    'The studio behind Design Vortek — a single artist, four years of commissions, 500+ characters brought to life. Meet the maker.',
  alternates: { canonical: '/about' },
}

/* ---------- Values (matches Values section in About.html) ---------- */
const VALUES = [
  {
    num: '01 · Passion',
    title: 'Passion first',
    body: "If a brief doesn't excite us, we don't take it. We'd rather turn down work than paint something we don't believe in. That's how every piece ends up portfolio-worthy.",
  },
  {
    num: '02 · Quality',
    title: 'Uncompromising craft',
    body: '4K final files. Two paint revisions. Process shared every three days. We treat each commission like the artwork is going on the wall of a gallery, because for our clients, it is.',
  },
  {
    num: '03 · Clarity',
    title: 'Honest communication',
    body: "Pricing is fixed up front. Timelines are honored. If something's running late, you'll hear from us before the deadline. No vanishing artists, no missing updates, no surprises.",
  },
]

/* ---------- Stats (literal numbers + units from design HTML) ---------- */
const STATS = [
  { num: '500', em: '+', label: 'Commissions delivered' },
  { num: '4.9', em: '★', label: 'Across 247 reviews' },
  { num: '48',  em: 'h', label: 'Average response time' },
  { num: '4',   em: 'yr', label: 'Studio anniversary' },
]

/* ---------- ds-ph-* gradients (from design-system.css) ---------- */
const PH_ANIME =
  'radial-gradient(ellipse at 50% 30%, rgba(243,214,217,0.6), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(201,160,74,0.4), transparent 60%), linear-gradient(160deg, #6B1F2A, #8A2A35 70%, #3e1218)'

const PH_SCENE =
  'radial-gradient(ellipse at 50% 80%, rgba(232,200,128,0.4), transparent 60%), linear-gradient(180deg, #1F4D3A 0%, #6B1F2A 60%, #1a130c 100%)'

const PH_CHARACTER =
  'radial-gradient(ellipse at 30% 20%, rgba(232,200,128,0.6), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(107,31,42,0.6), transparent 60%), linear-gradient(135deg, #2a1810, #3e1218 60%, #1a130c)'

/* ---------- BTS tiles (matches the 5-tile gallery) ---------- */
const BTS_TILES = [
  { label: 'THE DESK · STUDIO INTERIOR · 5:4', bg: PH_SCENE,     filter: 'none' },
  { label: 'SKETCH',                            bg: PH_CHARACTER, filter: 'grayscale(1) brightness(1.1)' },
  { label: 'COLOR BLOCK',                       bg: PH_CHARACTER, filter: 'saturate(0.4)' },
  { label: 'FINAL',                             bg: PH_CHARACTER, filter: 'none' },
  { label: 'REFERENCES',                        bg: PH_SCENE,     filter: 'hue-rotate(30deg)' },
]

const ArrowRightSm = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        {/* Hero */}
        <PageHero
          eyebrow="About the studio"
          title={
            <>
              A single artist.{' '}
              <em className="font-display italic font-medium text-burgundy-700">500+ stories.</em>
            </>
          }
          description="Four years of painting characters for the people who care most about them. Here's how the studio came together — and why every commission still feels like the first."
        />

        {/* Artist intro — .ab-intro: 1fr 1.1fr grid, gap 64px, items-center */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-16 items-center">
              {/* Portrait — 4:5, ds-ph-anime gradient, label bottom-left */}
              <div
                className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border-light"
                style={{ background: PH_ANIME }}
              >
                <span
                  className="absolute bottom-5 left-5 px-2.5 py-1.5 rounded text-[0.6875rem] tracking-[0.1em] uppercase text-cream-50 bg-tome-950/65 backdrop-blur-md"
                  style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}
                >
                  THE ARTIST · STUDIO · 4:5
                </span>
              </div>

              {/* Text */}
              <div>
                <SectionLabel>Meet the maker</SectionLabel>
                <h2
                  className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mt-3 mb-4 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
                >
                  I started Design Vortek with one rule: <em>every piece, by hand</em>.
                </h2>
                <div className="font-accent text-2xl text-burgundy-700 mb-6">
                  — and stuck to it
                </div>
                <div className="space-y-4 max-w-[56ch]">
                  <p className="text-[1.0625rem] text-ink-700 leading-[1.75]">
                    I&apos;ve been painting digitally for fourteen years, but Design Vortek started in 2022 after a friend asked me to paint her D&amp;D character. She cried when she saw it. So did I.
                  </p>
                  <p className="text-[1.0625rem] text-ink-700 leading-[1.75]">
                    That commission became a side hustle. The side hustle became a studio. Four years later I take five commissions a month — just enough to give each one the time and care it deserves, not so many that quality slips.
                  </p>
                  <p className="text-[1.0625rem] text-ink-700 leading-[1.75]">
                    I don&apos;t use AI. I don&apos;t outsource. I don&apos;t trace. Every brushstroke on every piece comes from a human looking carefully at your reference, your description, and the character you&apos;ve spent years inhabiting.
                  </p>
                </div>
                <div className="font-accent text-[1.75rem] text-gold-700 mt-4">
                  — Theo, founder &amp; artist
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Values — bg parchment-100, 3-card grid */}
        <section className="bg-parchment-100 py-16 md:py-24">
          <Container>
            <div className="mb-12 max-w-[640px]">
              <SectionLabel>Why we do this</SectionLabel>
              <h2
                className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mt-3 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
              >
                Three things <em>we won&apos;t compromise on</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {VALUES.map((v) => (
                <article
                  key={v.num}
                  className="bg-parchment-50 border border-border-light rounded-2xl px-8 py-9"
                >
                  {/* Numbered label with gold-500 leading rule (matches ::before) */}
                  <div className="flex items-center gap-2.5 mb-3.5">
                    <span aria-hidden="true" className="block w-6 h-px bg-gold-500" />
                    <span className="font-display text-xs font-semibold tracking-[0.2em] uppercase text-gold-700">
                      {v.num}
                    </span>
                  </div>
                  <h3 className="font-display text-[1.75rem] font-semibold text-ink-900 leading-[1.2] mb-3">
                    {v.title}
                  </h3>
                  <p className="text-[1.0625rem] text-ink-700 leading-[1.65]">
                    {v.body}
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        {/* Stats — 4-up with vertical dividers, max-width 980px */}
        <section className="py-16 md:py-24">
          <Container>
            <div className="text-center mb-12">
              <div className="inline-block">
                <SectionLabel>By the numbers</SectionLabel>
              </div>
              <h2
                className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mt-3 max-w-[24ch] mx-auto [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
              >
                Four years, one studio, <em>a lot of brushstrokes</em>
              </h2>
            </div>

            <div className="mx-auto max-w-[980px] grid grid-cols-2 md:grid-cols-4 gap-y-8 text-center">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`px-4 md:px-6 ${
                    i === 0 ? '' : 'md:border-l md:border-ink-200/[0.12]'
                  } ${i === 2 ? '' : 'max-md:[&:nth-child(odd)]:border-l-0'}`}
                  style={{ borderLeftColor: 'rgba(0,0,0,0.1)' }}
                >
                  <div className="font-display font-medium text-burgundy-700 leading-none tracking-tight mb-3 inline-flex items-baseline gap-[2px]"
                       style={{ fontSize: 'clamp(2.25rem, 3.4vw, 3rem)' }}>
                    {s.num}
                    <em className="not-italic font-display italic text-gold-700 font-normal" style={{ fontSize: '0.5em', marginLeft: '0.04em' }}>
                      {s.em}
                    </em>
                  </div>
                  <div className="text-[0.7rem] font-semibold tracking-[0.15em] uppercase text-ink-500">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Behind the scenes — bg parchment-100, 5-tile gallery */}
        <section className="bg-parchment-100 py-16 md:py-24">
          <Container>
            <div className="mb-12 max-w-[640px]">
              <SectionLabel>Behind the scenes</SectionLabel>
              <h2
                className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mt-3 mb-3 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
              >
                Inside the <em>studio</em>
              </h2>
              <p className="text-[1.0625rem] text-ink-500 leading-[1.6] max-w-[56ch]">
                The desk, the tools, the sketches that didn&apos;t make it — the unglamorous truth behind every painted portrait.
              </p>
            </div>

            {/* .ab-bts — 1.4fr 1fr 1fr × 2 rows, first tile spans 2 rows */}
            <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr] md:grid-rows-2 md:[grid-auto-rows:200px] gap-3">
              {BTS_TILES.map((tile, i) => (
                <div
                  key={tile.label + i}
                  className={`relative rounded-lg overflow-hidden border border-border-light flex items-end p-3.5 min-h-[180px] md:min-h-0 ${
                    i === 0 ? 'md:row-span-2' : ''
                  }`}
                  style={{ background: tile.bg, filter: tile.filter }}
                >
                  <span
                    className="px-2 py-1 rounded-[3px] text-[0.625rem] tracking-[0.1em] uppercase text-cream-50 bg-tome-950/65 backdrop-blur-md"
                    style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}
                  >
                    {tile.label}
                  </span>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA strip — dark tome closer (matches .pg-cta-strip) */}
        <section className="relative bg-tome-950 text-cream-50 py-20 text-center overflow-hidden">
          <PaperTexture variant="cream" opacity={0.5} />
          <div className="relative">
            <Container>
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.15] tracking-tight mb-4 mx-auto max-w-[24ch] [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
              >
                Want to work <em>together</em>?
              </h2>
              <p className="text-base text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-7">
                Two May slots remain. June is full, July is opening. Brief us in three minutes.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-3">
                <Button href="/order" variant="gold" size="lg">
                  Start commission <ArrowRightSm />
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
