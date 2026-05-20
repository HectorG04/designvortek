import type { Metadata } from 'next'
import { ArrowRight, Check, MessageSquare, Receipt, Brush, PackageCheck, Clock } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import CompassDivider from '@/components/decor/CompassDivider'

export const metadata: Metadata = {
  title: 'Process · Design Vortek',
  description:
    'From idea to artwork in four steps. Predictable, communicative, no surprises — see exactly how a Design Vortek commission unfolds from brief to delivery.',
}

const STEPS = [
  {
    num: '01',
    title: 'Discuss',
    icon: MessageSquare,
    body: 'Send us a brief through the commission form — or just an email. Tell us about the character, the campaign, the references that capture the vibe.',
    body2: 'We read carefully, ask the right follow-up questions, and only then start sketching ideas. Usually 24–48 hours to get back to you with thoughts.',
    deliverables: [
      'A read of your brief by a real human',
      'Follow-up questions that sharpen scope',
      'Reference suggestions if you’re stuck',
    ],
  },
  {
    num: '02',
    title: 'Quote',
    icon: Receipt,
    body: 'Within 48 hours of your brief, you get a fixed quote — not an estimate. Scope, timeline, total. A 25% deposit holds your slot (fully refundable until first sketch).',
    body2: 'The remaining 75% lands on delivery. No hourly games. No surprises. The price you approve is the price you pay.',
    deliverables: [
      'A fixed-rate quote within 48 hours',
      'A clear timeline with milestones',
      'Slot confirmation on deposit',
    ],
  },
  {
    num: '03',
    title: 'Create',
    icon: Brush,
    body: 'Sketch first — we get the pose, composition, and likeness right before any paint touches the canvas. Sketch revisions are unlimited. From there: color blocks, then final paint.',
    body2: 'Two paint-stage revisions baked into every commission. Updates every 3 days. You see the work as it grows.',
    deliverables: [
      'Initial sketch within 5 working days',
      'Color blocks for approval',
      'Two paint-stage revisions',
      'Progress updates every 3 days',
    ],
  },
  {
    num: '04',
    title: 'Deliver',
    icon: PackageCheck,
    body: 'Final files at 4K resolution — PNG, JPG, and a transparent-background version. Layered PSD optional. Yours to print, frame, share, treasure.',
    body2: 'We follow up two weeks later to make sure you love it. Most clients hang it on a wall. Some have it tattooed.',
    deliverables: [
      '4K PNG + JPG exports',
      'Transparent-background version',
      'Layered PSD on request',
      'Two-week follow-up check-in',
    ],
  },
] as const

const TIMELINE = [
  { range: 'Day 1',     title: 'Brief lands',      note: 'You send the form. We read it the same day, often within hours.' },
  { range: 'Day 2',     title: 'Quote returned',   note: 'Fixed quote, fixed timeline. Deposit secures your slot.' },
  { range: 'Day 3–5',   title: 'Sketch + review',  note: 'First sketch arrives. You respond. Composition gets locked.' },
  { range: 'Day 6–10',  title: 'Paint phase',      note: 'Color blocks, rendering, lighting. Updates every 3 days.' },
  { range: 'Day 11–14', title: 'Final delivery',   note: '4K exports, transparent PNG, every file you need. Final payment runs.' },
]

const PROCESS_FAQ = [
  { q: 'How soon can you start?',          a: 'Usually within 1–2 weeks of deposit. Current availability and our queue determine the exact start date — every slot is published on the Availability page.' },
  { q: 'What if I need it faster?',        a: 'Rush turnaround is available for +$50 on character art and tokens, bringing turnaround down to 3 days. Reach out before booking and we’ll confirm capacity.' },
  { q: 'What happens during revisions?',   a: 'You send written notes (or annotated screenshots). We make the changes and ship a new version within 2–3 days. Sketch revisions are unlimited and free; paint-stage revisions are capped at 2 per commission.' },
  { q: 'Can I see the work in progress?',  a: 'Yes — process updates land in your inbox every 3 days during paint. Sketches, color blocks, and rendering shots. You always know where the piece stands.' },
  { q: 'What if I’m not happy with the final?', a: 'Two paint-stage revisions are baked in — we usually nail it well within that. If the piece is genuinely not what you wanted at the end, we refund the balance beyond the 25% deposit (which covers sketch work).' },
]

export default function ProcessPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="How it works"
          title={
            <>
              From idea to artwork in <em className="font-display italic font-medium text-burgundy-700">four steps</em>
            </>
          }
          description="Predictable, communicative, no surprises. You always know what's happening and when — here's exactly how each commission unfolds."
        />

        {/* Four step rows */}
        <section className="bg-parchment-50 py-12 md:py-20">
          <Container narrow>
            <div className="flex flex-col gap-16 md:gap-20">
              {STEPS.map((step) => {
                const Icon = step.icon
                return (
                  <article
                    key={step.num}
                    className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-10 items-start"
                  >
                    {/* Large numbered circle + icon */}
                    <div className="flex md:flex-col items-center md:items-start gap-4">
                      <div
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-parchment-50 border-[1.5px] border-gold-500 text-gold-700 flex items-center justify-center font-display font-semibold leading-none flex-shrink-0"
                        style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
                      >
                        {step.num}
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-parchment-100 border border-border-light text-burgundy-700 inline-flex items-center justify-center">
                        <Icon size={22} strokeWidth={1.5} />
                      </div>
                    </div>

                    <div>
                      <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-tight tracking-tight mb-3">
                        {step.title}
                      </h2>
                      <p className="text-lg text-ink-700 leading-[1.7] mb-3 max-w-[60ch]">
                        {step.body}
                      </p>
                      <p className="text-ink-500 leading-relaxed mb-6 max-w-[60ch]">
                        {step.body2}
                      </p>

                      <div className="bg-parchment-100 border border-border-light rounded-xl p-5 max-w-[60ch]">
                        <div className="text-[0.7rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 mb-3">
                          What you’ll receive
                        </div>
                        <ul className="space-y-2">
                          {step.deliverables.map((d) => (
                            <li key={d} className="flex items-start gap-2 text-sm text-ink-700">
                              <Check size={14} strokeWidth={2.4} className="text-forest-700 mt-1 flex-shrink-0" />
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </Container>
        </section>

        <div className="bg-parchment-50">
          <CompassDivider />
        </div>

        {/* Day-by-day timeline */}
        <section className="bg-parchment-100 border-y border-border-light py-20 md:py-28">
          <Container>
            <div className="text-center max-w-[720px] mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>Day by day</SectionLabel>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
                What happens, <em className="font-display italic font-medium text-burgundy-700">when</em>
              </h2>
              <p className="text-lg text-ink-500 mt-4 leading-relaxed">
                A typical character commission, mapped to the calendar. Tokens compress this; party portraits stretch it.
              </p>
            </div>

            <div className="max-w-[860px] mx-auto">
              <ol className="relative border-l-[1.5px] border-dashed border-gold-500/60 ml-3">
                {TIMELINE.map((row) => (
                  <li key={row.range} className="relative pl-10 pb-10 last:pb-0">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gold-500 border-[3px] border-parchment-100" />
                    <div className="font-accent text-xl text-burgundy-700 leading-none mb-1">
                      {row.range}
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-semibold text-ink-900 leading-tight mb-2">
                      {row.title}
                    </h3>
                    <p className="text-ink-500 leading-relaxed max-w-[55ch]">{row.note}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-14 max-w-[720px] mx-auto bg-parchment-50 border border-border-light rounded-2xl p-8 text-center">
              <div className="inline-flex items-center gap-2 text-burgundy-700 mb-3">
                <Clock size={16} strokeWidth={1.5} />
                <span className="text-[0.75rem] uppercase tracking-[0.15em] font-semibold">Average turnaround</span>
              </div>
              <div className="font-display text-3xl md:text-4xl font-semibold text-ink-900 mb-2">
                <em className="font-display italic font-medium text-burgundy-700">7 to 14 days</em> from brief approval
              </div>
              <p className="text-ink-500 max-w-[52ch] mx-auto leading-relaxed">
                Tokens ship in 3–7 days. Party portraits and NPC packs run 2–4 weeks depending on figure count.
              </p>
            </div>
          </Container>
        </section>

        {/* Common questions */}
        <section className="bg-parchment-50 py-20 md:py-28">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 max-w-[1080px] mx-auto">
              <div>
                <div className="mb-3">
                  <SectionLabel>Process questions</SectionLabel>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight mb-4">
                  How it actually <em className="font-display italic font-medium text-burgundy-700">works</em>
                </h2>
                <p className="text-ink-500 leading-relaxed">
                  The questions clients ask before booking. Don’t see yours? Send a note — we usually reply within 48 hours.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {PROCESS_FAQ.map((item, idx) => (
                  <details
                    key={idx}
                    className="group bg-parchment-100 border border-border-light rounded-xl open:border-border-medium open:bg-parchment-50 open:shadow-sm transition-colors"
                  >
                    <summary className="px-6 py-5 flex items-center justify-between gap-4 cursor-pointer list-none">
                      <span className="font-display text-lg md:text-xl font-semibold text-ink-900 leading-snug">
                        {item.q}
                      </span>
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-parchment-50 text-burgundy-700 border border-border-medium inline-flex items-center justify-center group-open:bg-burgundy-700 group-open:text-cream-50 group-open:border-transparent group-open:rotate-45 transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <p className="px-6 pb-5 text-ink-700 leading-[1.7] max-w-[64ch]">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* CTA closer */}
        <section className="bg-tome-950 text-cream-50 py-20 md:py-28 text-center">
          <Container>
            <h2
              className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}
            >
              Ready to <em className="font-display italic font-medium text-gold-glow">begin</em>?
            </h2>
            <p className="text-lg text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-8">
              Three minutes to brief. Quote within 48 hours. First sketch within a week.
            </p>
            <div className="inline-flex flex-wrap justify-center gap-3.5">
              <Button href="/order" variant="gold" size="lg">
                Start commission <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
              <Button href="/contact" variant="outline-cream" size="lg">
                Ask a question
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
