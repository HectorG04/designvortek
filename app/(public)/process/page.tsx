import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import Markdown from '@/components/ui/Markdown'
import PaperTexture from '@/components/decor/PaperTexture'

/* =====================================================================
   PROCESS — literal port of Process.html.

   Structure (matches design HTML exactly):
     1. Hero
     2. 4 steps stacked (80px circle + content article)
     3. Timeline callout box (parchment-100 card)
     4. pg-cta-strip — dark tome closer

   NOTE: Earlier version had a 5-question FAQ + day-by-day timeline +
   average-turnaround card. None of those exist in the design. Removed.
   ===================================================================== */

export const metadata: Metadata = {
  title: 'Process · Design Vortex',
  description:
    "How we work, end to end. Discuss, quote, create, deliver — four steps. Predictable, communicative, no surprises.",
}

interface Step {
  num: '01' | '02' | '03' | '04'
  title: string
  /** Primary body paragraph — markdown so inline emphasis/links survive */
  body: string
  /** Smaller secondary line below — also markdown */
  note: string
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Discuss',
    body: 'Send us a brief through the [commission form](/order) — or just an email. Tell us about the character, the campaign, the references that capture the vibe. We read carefully, ask the right follow-up questions, and only then start sketching ideas.',
    note: '**Usually 24–48 hours** to get back to you with thoughts.',
  },
  {
    num: '02',
    title: 'Quote',
    body: 'Within 48 hours of your brief, you get a **fixed quote** — not an estimate. Scope, timeline, total. A 30% deposit holds your slot (fully refundable until first sketch). The remaining 70% lands on delivery.',
    note: 'No hourly games. No surprises. The price you approve is the price you pay.',
  },
  {
    num: '03',
    title: 'Create',
    body: 'Sketch first — we get the pose, composition, and likeness right before any paint touches the canvas. Sketch revisions are unlimited. From there: color blocks, then final paint. Two paint-stage revisions baked into every commission.',
    note: 'Updates every 3 days. You see the work as it grows.',
  },
  {
    num: '04',
    title: 'Deliver',
    body: 'Final files at 4K resolution — PNG, JPG, and a transparent-background version. Layered PSD optional. Yours to print, frame, share, treasure. We follow up two weeks later to make sure you love it.',
    note: 'Most clients hang it on a wall. Some have it tattooed.',
  },
]

const ArrowRightMd = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export default function ProcessPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-parchment-50">

        {/* Hero */}
        <PageHero
          eyebrow="How it works"
          title={
            <>
              From idea to artwork in{' '}
              <em className="font-display italic font-medium text-burgundy-700">four steps</em>
            </>
          }
          description="Predictable, communicative, no surprises. You always know what's happening and when — here's exactly how each commission unfolds."
        />

        {/* 4 steps in detail */}
        <section className="pb-16 md:pb-24">
          <div className="mx-auto max-w-[920px] px-6 md:px-12">

            <div className="flex flex-col gap-16">
              {STEPS.map((step) => (
                <article
                  key={step.num}
                  className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 sm:gap-8 items-start"
                >
                  {/* Number circle: 80×80 rounded-full parchment-50 + 1.5px gold border + gold-700 text */}
                  <div className="w-20 h-20 rounded-full bg-parchment-50 border-[1.5px] border-gold-500 text-gold-700 inline-flex items-center justify-center flex-shrink-0 font-display text-[2rem] font-semibold">
                    {step.num}
                  </div>

                  {/* Content */}
                  <div>
                    <h2 className="font-display text-[2rem] font-semibold text-ink-900 leading-[1.1] tracking-tight mb-3">
                      {step.title}
                    </h2>

                    {/* Primary body — markdown for inline links + bold */}
                    <div className="text-[1.125rem] text-ink-700 leading-[1.7] mb-3 max-w-[55ch] [&_p]:mb-0">
                      <Markdown>{step.body}</Markdown>
                    </div>

                    {/* Secondary note — markdown for inline bold */}
                    <div className="text-base text-ink-500 leading-[1.6] max-w-[55ch] [&_p]:mb-0 [&_strong]:text-ink-700 [&_strong]:font-semibold">
                      <Markdown>{step.note}</Markdown>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Timeline callout box */}
            <div className="mt-16 p-8 bg-parchment-100 border border-border-light rounded-2xl text-center">
              <SectionLabel>Timeline</SectionLabel>
              <div className="font-display text-[2rem] font-semibold text-ink-900 leading-[1.1] tracking-tight mt-2 mb-3">
                Average turnaround &mdash;{' '}
                <em className="font-display italic font-medium text-burgundy-700">7 to 14 days</em>
              </div>
              <p className="text-ink-500 max-w-[50ch] mx-auto leading-[1.6]">
                From brief approval to final delivery. Tokens are faster (3&ndash;7 days). Party portraits and NPC packs take 2&ndash;4 weeks.
              </p>
            </div>

          </div>
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
                Ready to <em>begin</em>?
              </h2>
              <p className="text-base text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-7">
                Three minutes to brief. Quote within 48 hours. First sketch within a week.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-3">
                <Button href="/order" variant="gold" size="lg">
                  Start commission <ArrowRightMd />
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
