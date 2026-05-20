import type { Metadata } from 'next'
import { ArrowRight, Brush, MessageCircle, Heart, Quote } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import GoldCorners from '@/components/decor/GoldCorners'
import CompassDivider from '@/components/decor/CompassDivider'

export const metadata: Metadata = {
  title: 'About the studio — DesignVortek',
  description:
    'The studio behind DesignVortek — a single artist, four years of commissions, 500+ characters painted by hand. Meet the maker.',
  alternates: { canonical: '/about' },
}

const STATS = [
  { num: '500+', label: 'Commissions delivered' },
  { num: '4.9★', label: 'Across 247 reviews' },
  { num: '4 years', label: 'Studio anniversary' },
  { num: '100%', label: 'Hand-painted · no AI' },
]

const PRINCIPLES = [
  {
    icon: Brush,
    num: '01',
    title: 'Craft',
    body: 'Every piece is hand-painted from scratch. No AI, no traces, no auto-fills. We turn down briefs we cannot do well rather than ship something we do not believe in.',
  },
  {
    icon: MessageCircle,
    num: '02',
    title: 'Communication',
    body: 'Pricing is fixed up front. Timelines are honored. Progress shared every three days. If something is running late, you hear it from us before the deadline.',
  },
  {
    icon: Heart,
    num: '03',
    title: 'Care',
    body: 'We treat each commission like it is going on the wall of a gallery, because for our clients, it is. Two paint revisions baked in. Layered files on request. Yours for keeps.',
  },
]

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          align="left"
          eyebrow="About the studio"
          title={<>We paint <em className="font-display italic font-medium text-burgundy-700">by hand</em>. Every piece.</>}
          description="Four years of painting characters for the people who care most about them. A single artist, a deliberate pace, and a refusal to outsource the parts that matter."
        />

        {/* Story — 2 column */}
        <section className="pb-20">
          <Container>
            <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
              {/* Portrait */}
              <div className="relative">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-burgundy-900 via-amber-800 to-gold-700">
                  <GoldCorners />
                  <div className="absolute bottom-5 left-5 inline-block bg-tome-950/65 backdrop-blur-md border border-cream-50/15 text-cream-50 text-[0.625rem] tracking-[0.18em] uppercase font-bold px-3 py-1.5 rounded-full">
                    The studio · 4:5
                  </div>
                </div>
                <div className="mt-4 font-accent text-2xl text-burgundy-700">
                  — Theo, founder &amp; artist
                </div>
              </div>

              {/* Text */}
              <div>
                <SectionLabel>Our story</SectionLabel>
                <h2 className="font-display text-3xl md:text-[2.5rem] font-semibold text-ink-900 leading-[1.15] tracking-tight mt-4 mb-6">
                  One rule: every piece, <em className="font-display italic font-medium text-burgundy-700">by hand</em>.
                </h2>
                <div className="space-y-5 text-ink-700 leading-[1.75]">
                  <p>
                    DesignVortek started in 2022, after a friend asked me to paint her D&amp;D character. She cried when she saw it. So did I. That commission became a side hustle. The side hustle became a studio.
                  </p>
                  <p>
                    Four years later I take five commissions a month — just enough to give each one the time and care it deserves, not so many that quality slips. I have been painting digitally for fourteen years, but every brushstroke on every piece still feels like the first one.
                  </p>
                  <p>
                    I do not use AI. I do not outsource the painting. I do not trace. Every commission begins with a careful read of your brief and ends with a piece that came from a human looking carefully at your character — the one you have spent years inhabiting.
                  </p>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* Stats strip */}
        <section className="bg-parchment-100 py-16 border-y border-border-light">
          <Container>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-4xl md:text-5xl font-semibold text-burgundy-700 leading-none mb-2 tracking-tight">
                    {s.num}
                  </div>
                  <div className="text-xs uppercase tracking-[0.15em] text-ink-500 font-semibold">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* How we work */}
        <section className="py-20 md:py-24">
          <Container>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="mb-4 flex justify-center">
                <SectionLabel>How we work</SectionLabel>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
                Three things we <em className="font-display italic font-medium text-burgundy-700">will not compromise</em> on
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PRINCIPLES.map((p) => {
                const Icon = p.icon
                return (
                  <article
                    key={p.title}
                    className="relative bg-parchment-50 border border-border-light rounded-2xl p-8 hover:border-border-medium hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-burgundy-100 text-burgundy-700 mb-6">
                      <Icon size={22} strokeWidth={1.5} />
                    </div>
                    <div className="text-[0.6875rem] uppercase tracking-[0.18em] font-semibold text-gold-700 mb-2">
                      {p.num} · {p.title}
                    </div>
                    <h3 className="font-display text-2xl font-semibold text-ink-900 mb-4 leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-ink-700 leading-relaxed">{p.body}</p>
                  </article>
                )
              })}
            </div>
          </Container>
        </section>

        <Container>
          <CompassDivider />
        </Container>

        {/* Behind the studio — artist card */}
        <section className="py-16 md:py-20">
          <Container>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>Behind the studio</SectionLabel>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
                Who&rsquo;s holding the <em className="font-display italic font-medium text-burgundy-700">brush</em>
              </h2>
            </div>

            <div className="max-w-4xl mx-auto bg-tome-950 rounded-2xl overflow-hidden">
              <div className="grid md:grid-cols-[1fr_1.3fr] gap-0">
                <div className="aspect-square md:aspect-auto md:min-h-[380px] bg-gradient-to-br from-burgundy-700 via-amber-800 to-gold-700 relative">
                  <GoldCorners />
                </div>
                <div className="p-8 md:p-12 text-cream-50">
                  <Quote size={28} strokeWidth={1.5} className="text-gold-glow mb-5" />
                  <p className="font-display italic text-2xl md:text-[1.75rem] leading-snug mb-8 text-cream-50">
                    &ldquo;Every character that comes through the studio has been alive in someone&rsquo;s head for months — sometimes years. My job is to meet them where they already exist, and put them on the page.&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold-500 text-ink-900 font-display text-xl font-semibold inline-flex items-center justify-center">
                      T
                    </div>
                    <div>
                      <div className="font-display text-lg font-semibold text-cream-50">Theo</div>
                      <div className="text-sm text-cream-200 uppercase tracking-[0.12em]">Founder &amp; artist</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* CTA closer */}
        <section className="bg-tome-950 text-cream-50 py-20 md:py-24">
          <Container>
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight mb-5" style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}>
                Want to work <em className="font-display italic font-medium text-gold-glow">together</em>?
              </h2>
              <p className="text-cream-200 leading-relaxed mb-8">
                Two May slots remain. June is full, July is opening. Brief us in three minutes — we&rsquo;ll send a quote within 48 hours.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-3">
                <Button href="/order" variant="gold" size="lg">
                  Start commission <ArrowRight size={14} strokeWidth={1.8} />
                </Button>
                <Button href="/contact" variant="outline-cream" size="lg">
                  Ask a question
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
