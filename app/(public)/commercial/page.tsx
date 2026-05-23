/* =====================================================================
   COMMERCIAL — literal port of `Commercial.html` from
   `Claude Design Final/Claude designs New Screens and flow V2/`.

   Publisher entry point. B2B-tone "talk to us" framing.

   Structure (matches design HTML exactly):
     1. Hero with 3 reassurance pills
     2. Who this is for — 4 cards (.com-who)
     3. How it's priced — 3-row breakdown with +40% licensing math
        (.com-pricing-row · dashed-border separators · USD chip below)
     4. Retainer block — dark tome (.pr-custom)
     5. NDA reassurance card (.com-reassure — gold-left-border)
     6. Recent commercial work — 3 portfolio placeholder cards
     7. FAQ accordion (publishers' questions, 5 items)
     8. CTA strip — dark tome closer (.pg-cta-strip)
   ===================================================================== */

import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
import Button from '@/components/ui/Button'
import USDDisclaimer from '@/components/ui/USDDisclaimer'
import PaperTexture from '@/components/decor/PaperTexture'

export const metadata: Metadata = {
  title: 'Commercial & publisher commissions · Design Vortek',
  description:
    'Hand-painted illustration for tabletop publishers, indie games, Kickstarter campaigns, and merch. Commercial licensing handled transparently at +40% of the base job price.',
  alternates: { canonical: '/commercial' },
}

/* ---------- ds-ph-scene gradient (from design-system.css) ---------- */
const PH_SCENE =
  'radial-gradient(ellipse at 50% 80%, rgba(232,200,128,0.4), transparent 60%), linear-gradient(180deg, #1F4D3A 0%, #6B1F2A 60%, #1a130c 100%)'

/* ---------- Inline arrow used in CTAs and links ---------- */
const ArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    className="w-[13px] h-[13px] text-forest-500 flex-shrink-0"
    aria-hidden="true"
  >
    <path d="M5 12l5 5L20 7" />
  </svg>
)

/* ---------- Who this is for: 4 cards ---------- */
const WHO = [
  {
    title: 'Indie tabletop publishers',
    body: 'Cover art, interior illustration, faction iconography, and NPC galleries for printed and PDF rulebooks.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M4 19V5a2 2 0 012-2h11a3 3 0 013 3v14H7a3 3 0 01-3-3z" />
        <path d="M4 16h16" />
      </svg>
    ),
  },
  {
    title: 'Kickstarter campaigns',
    body: 'Hero art and stretch-goal pieces shaped to the campaign calendar. Tier reveal art and add-on illustrations welcome.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M12 2v6m0 0l-3 3m3-3l3 3M4 14l1 6h14l1-6" />
        <circle cx="12" cy="20" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Indie games & streaming',
    body: 'Promo art, marketing splashes, channel banners, animated streamer overlays based on hand-painted character pieces.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
        <rect x="3" y="5" width="18" height="13" rx="2" />
        <path d="M8 21h8M12 18v3" />
        <path d="M10 9l5 3-5 3z" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Merch & licensing',
    body: 'Apparel, prints, enamel pins, posters. Print-ready vector exports and licensing terms scoped to the run size.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M20 7H4l1 12h14z" />
        <path d="M9 7V5a3 3 0 016 0v2" />
      </svg>
    ),
  },
]

/* ---------- Pricing rows ---------- */
interface PricingRow {
  label: string
  em: string
  /** Description body — may include an inline link rendered as <a> */
  body: React.ReactNode
  value: React.ReactNode
}

const PRICING_ROWS: PricingRow[] = [
  {
    label: 'Base',
    em: 'standard studio rates',
    body: (
      <>
        The piece itself, quoted at the same rates you&rsquo;d find on{' '}
        <Link
          href="/pricing"
          className="text-burgundy-700 underline underline-offset-[3px] hover:text-burgundy-500"
        >
          our pricing page
        </Link>
        . Character art, party portraits, maps, and packs all start from their published tiers.
      </>
    ),
    value: <>Studio rate</>,
  },
  {
    label: 'License',
    em: 'commercial use, scope agreed',
    body: (
      <>
        A flat uplift on the base price that covers commercial use across the agreed scope: print run,
        region, format. No tiered upgrades, no surprise renegotiations halfway through the project.
      </>
    ),
    value: (
      <>
        <em className="font-display italic font-medium">+40%</em>
      </>
    ),
  },
  {
    label: 'Retainer',
    em: 'recurring, by inquiry',
    body: (
      <>
        Monthly arrangement for ongoing collaborations. Priority queue, best per-piece rate, and
        scheduled briefing windows. Priced per studio capacity.
      </>
    ),
    value: <>Custom quote</>,
  },
]

/* ---------- Recent commercial work (3 placeholder cards, .ds-ph-scene) ---------- */
const RECENT_WORK = [
  {
    title: 'Hollow Crowns — cover & chapter art',
    meta: 'Greyhawk Press · 14 interior pieces · 2025',
    badge: 'Cover · indie RPG',
    filter: 'none',
  },
  {
    title: 'Ironroot — stretch-goal illustrations',
    meta: 'Client name held under NDA · 2025',
    badge: 'Kickstarter',
    filter: 'hue-rotate(40deg)',
  },
  {
    title: 'Twin Moons apparel run',
    meta: 'Riverpine Studio · 6 designs · 2024',
    badge: 'Merch line',
    filter: 'hue-rotate(-50deg) saturate(1.1)',
  },
]

/* ---------- Commercial FAQ (publishers' questions) ---------- */
const FAQ = [
  {
    q: "What's included in commercial licensing?",
    a: 'The +40% uplift covers commercial use within the scope you agree to in writing. That typically means the named product, the named region, and the named print or digital run. Need a wider scope later, the license can be expanded without redoing the art.',
  },
  {
    q: "Can I commission work in someone else's IP?",
    a: "For commercial use of someone else's IP the studio needs written permission from the rights holder. Personal fan art is fine on the retail side of the studio. Licensed commercial work needs the paperwork.",
  },
  {
    q: 'How long does a typical commercial project take?',
    a: 'A single commercial piece runs roughly the same as a retail commission, 2 to 4 weeks depending on tier. Multi-piece projects scale: a 12-piece interior usually books 3 to 4 months end to end. Retainer arrangements move faster after the first cycle.',
  },
  {
    q: 'Do you do exclusivity?',
    a: 'Time-bound exclusivity within a market or product category is possible, scoped per project. Full perpetual exclusivity is rare and priced separately. Most clients find a scoped license covers what they actually need.',
  },
  {
    q: 'Do you bill USD only?',
    a: "Yes. The studio bills in USD. International clients are welcome and most cards convert at the rate on the day of charge. For larger contracts we'll send a USD invoice that your finance team can wire.",
  },
]

export default function CommercialPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        {/* 01 Hero */}
        <PageHero
          eyebrow="Commercial · Publisher · Studios"
          title={
            <>
              For the work that{' '}
              <em className="font-display italic font-medium text-burgundy-700">
                ships
              </em>
              .
            </>
          }
          description="Hand-painted illustration for tabletop publishers, indie games, Kickstarter campaigns, and merch lines. Same studio, same craft, with commercial licensing priced honestly at a flat +40%."
        >
          {/* .dv-reassure pill row */}
          <div className="flex flex-wrap gap-2.5 justify-center mt-2">
            {['NDAs at no charge', 'Retainer arrangements', 'Flat licensing math'].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-700 bg-parchment-50 border border-border-light rounded-full px-3 py-1.5"
              >
                <CheckIcon />
                {item}
              </span>
            ))}
          </div>
        </PageHero>

        {/* 02 Who this is for */}
        <section className="pb-16 md:pb-24">
          <Container>
            <SectionHead
              eyebrow="Who this is for"
              title={<>Four kinds of <em>commercial brief</em></>}
              description="If you're publishing, selling, or streaming the work, this is the right entry point. Personal commissions live on the rest of the site."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {WHO.map((card) => (
                <div
                  key={card.title}
                  className="bg-parchment-50 border border-border-light rounded-xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="w-10 h-10 rounded-md bg-burgundy-700 text-cream-50 inline-flex items-center justify-center mb-4">
                    {card.icon}
                  </div>
                  <h4 className="font-display text-[1.1875rem] font-semibold text-burgundy-700 leading-[1.2] mb-1">
                    {card.title}
                  </h4>
                  <p className="text-[0.875rem] text-ink-500 leading-[1.55]">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* 03 How it's priced — 3-row breakdown with +40% math */}
        <section className="bg-parchment-100 py-16 md:py-24">
          <Container>
            <SectionHead
              eyebrow="How it's priced"
              title={<>Three line items, <em>no surprises</em></>}
              description="Commercial work prices in three honest layers. You see all of them in your quote."
            />

            <div className="bg-parchment-100 border border-border-light rounded-2xl px-7 md:px-11 py-7 md:py-10">
              {PRICING_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={
                    'grid gap-3 md:gap-7 py-4 md:py-[22px] items-baseline ' +
                    'grid-cols-1 md:grid-cols-[180px_1fr_auto] ' +
                    (i < PRICING_ROWS.length - 1
                      ? 'border-b border-dashed border-border-light'
                      : '')
                  }
                >
                  {/* Label + accent em (Caveat font, burgundy) */}
                  <div className="font-display text-xl font-semibold text-ink-900 leading-tight">
                    {row.label}
                    <em className="block font-accent not-italic text-[0.9375rem] text-burgundy-700 font-normal mt-0.5">
                      {row.em}
                    </em>
                  </div>

                  {/* Body description */}
                  <div className="text-[0.9375rem] text-ink-700 leading-[1.6]">
                    {row.body}
                  </div>

                  {/* Value (right-aligned price label) */}
                  <div className="font-display text-[1.375rem] font-semibold text-gold-700 whitespace-nowrap [&_em]:italic [&_em]:font-medium">
                    {row.value}
                  </div>
                </div>
              ))}
            </div>

            {/* USD disclaimer below the breakdown */}
            <div className="flex justify-center mt-7">
              <USDDisclaimer variant="block" />
            </div>
          </Container>
        </section>

        {/* 04 Retainer block — dark tome (.pr-custom) */}
        <section className="py-16 md:py-24">
          <Container>
            <div className="relative overflow-hidden bg-tome-950 text-cream-50 rounded-3xl px-7 py-9 md:px-12 md:py-14 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
              <PaperTexture variant="cream" opacity={0.4} />

              <div className="relative">
                <div className="mb-3">
                  <span className="inline-flex items-center gap-2.5 font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-gold-glow">
                    <span aria-hidden="true" className="h-px w-6 bg-gold-glow" />
                    Retainers
                  </span>
                </div>
                <h3
                  className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight mb-3 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                  style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)' }}
                >
                  Long-running <em>collaborations</em>
                </h3>
                <p className="text-cream-200 text-base leading-[1.6] mb-4">
                  Most retainer clients come back monthly with a few pieces per cycle, sometimes more. The
                  arrangement is a fixed monthly fee that buys priority queue, a standing briefing window,
                  and the studio&rsquo;s best per-piece rate.
                </p>
                <p className="text-cream-200 text-base leading-[1.6]">
                  Good fit if your project ships in waves, your team needs predictable turnaround, or
                  you&rsquo;re going to need more than ten commercial pieces over the next year. Send a
                  note describing the project and the cadence you&rsquo;re imagining.
                </p>
              </div>

              <div className="relative flex flex-col gap-2.5 lg:self-end">
                <Button href="/contact" variant="gold" size="lg">
                  Discuss a retainer <ArrowRight />
                </Button>
                <Button
                  href="mailto:designvortex04@gmail.com"
                  variant="outline-cream"
                  size="md"
                >
                  Email the studio
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* 05 NDA + scope reassurance card */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="bg-parchment-100 border border-border-light border-l-4 border-l-gold-500 rounded-xl px-6 py-7 md:px-8 md:py-7 flex flex-col sm:flex-row gap-5 sm:gap-[22px] items-start">
              <div className="w-11 h-11 rounded-full bg-gold-100 inline-flex items-center justify-center flex-shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-gold-700"
                  aria-hidden="true"
                >
                  <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h4 className="font-display text-xl font-semibold text-ink-900 leading-tight mb-1.5">
                  NDAs at no charge
                </h4>
                <p className="text-[0.9375rem] text-ink-700 leading-[1.6] max-w-[60ch]">
                  The studio signs mutual NDAs whenever a client asks, at no charge. Standard for
                  pre-launch indie titles, unreleased IP, and competitive work. Send your form or use
                  the studio template.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* 06 Recent commercial work */}
        <section className="bg-parchment-100 py-16 md:py-24">
          <Container>
            <SectionHead
              eyebrow="Recent commercial work"
              title={<>A few <em>shipped pieces</em></>}
              description="Released titles below. A handful of current projects sit under NDA and aren't shown."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {RECENT_WORK.map((work) => (
                <article
                  key={work.title}
                  className="relative bg-parchment-100 border border-border-light rounded-2xl overflow-hidden transition-all duration-250 hover:-translate-y-1 hover:shadow-lg hover:border-border-medium"
                >
                  {/* Placeholder image area — ds-ph-scene gradient + badge */}
                  <div
                    className="relative flex items-start p-3 aspect-[4/3]"
                    style={{ background: PH_SCENE, filter: work.filter }}
                  >
                    <span className="inline-block font-body text-[0.625rem] font-bold tracking-[0.15em] uppercase text-ink-900 bg-parchment-50/[0.92] backdrop-blur-md border border-gold-300 px-3 py-[5px] rounded-full">
                      {work.badge}
                    </span>
                  </div>
                  <div className="px-5 pt-4 pb-5">
                    <h4 className="font-display text-xl font-medium text-ink-900 leading-[1.3]">
                      {work.title}
                    </h4>
                    <div className="text-[0.8125rem] text-ink-500 mt-1.5">
                      {work.meta}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button href="/portfolio" variant="outline" size="md">
                See more from the studio <ArrowRight />
              </Button>
            </div>
          </Container>
        </section>

        {/* 07 Commercial FAQ */}
        <section className="py-16 md:py-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8 lg:gap-16 max-w-[1080px] mx-auto">
              {/* Side: heading + CTA */}
              <div>
                <div className="mb-3">
                  <span className="inline-flex items-center gap-2.5 font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                    <span aria-hidden="true" className="h-px w-6 bg-burgundy-700" />
                    Commercial FAQ
                  </span>
                </div>
                <h2
                  className="font-display font-semibold leading-[1.1] tracking-tight text-ink-900 mb-4 [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  The questions <em>publishers ask</em>
                </h2>
                <p className="text-ink-500 leading-[1.65] mb-5">
                  Quick answers on scope, IP, timelines, and exclusivity. Reach out for anything not
                  covered.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:gap-3.5 transition-all"
                >
                  Talk to the studio <ArrowRight />
                </Link>
              </div>

              {/* Accordion */}
              <div className="flex flex-col gap-3">
                {FAQ.map((item, i) => (
                  <details
                    key={item.q}
                    open={i === 0}
                    className="group bg-parchment-100 border border-border-light rounded-xl open:bg-parchment-50 open:border-border-medium open:shadow-sm transition-colors"
                  >
                    <summary className="list-none cursor-pointer flex items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-display text-xl font-semibold text-ink-900 leading-[1.3]">
                        {item.q}
                      </span>
                      <span className="flex-shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] bg-parchment-50 text-burgundy-700 border border-border-medium group-open:bg-burgundy-700 group-open:text-cream-50 group-open:border-burgundy-700 group-open:rotate-45">
                        <svg
                          viewBox="0 0 24 24"
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-5 text-ink-700 leading-[1.7] max-w-[64ch]">
                      <p>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* 08 CTA strip — dark tome closer */}
        <section className="relative bg-tome-950 text-cream-50 py-16 md:py-20 text-center overflow-hidden">
          <PaperTexture variant="cream" opacity={0.5} />
          <div className="relative">
            <Container>
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.15] tracking-tight mb-4 mx-auto max-w-[24ch] [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
              >
                Tell us about <em>the project</em>
              </h2>
              <p className="text-base text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-7">
                Short brief, scope and timeline, what you&rsquo;d like the license to cover. Quote back
                within 48 hours.
              </p>
              <div className="inline-flex flex-wrap gap-3 justify-center">
                <Button href="/contact" variant="gold" size="lg">
                  Request a commercial quote <ArrowRight />
                </Button>
                <Button href="/pricing" variant="outline-cream" size="lg">
                  See standard pricing
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
