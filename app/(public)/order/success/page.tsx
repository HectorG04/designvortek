import type { Metadata } from 'next'
import { Check, Clock, Mail, Sparkles } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Container from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'
import SectionLabel from '@/components/ui/SectionLabel'
import Markdown from '@/components/ui/Markdown'

export const metadata: Metadata = {
  title: 'Brief received',
  description: 'Your commission brief has been received. We will reply within 48 hours with a quote.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/order/success' },
}

/* Each step body is a markdown string so bold time markers ("**Within 24 hours**") +
   optional inline links survive the data layer. Renders via Markdown component. */
const NEXT_STEPS = [
  {
    when: 'Within 24 hours',
    strong: 'Check your inbox',
    body: `A confirmation just landed. If you don't see it in **ten minutes**, peek in spam â€” or email us directly at [hello@designvortex.co](mailto:hello@designvortex.co).`,
    Icon: Mail,
  },
  {
    when: 'Within 48 hours',
    strong: 'We review and reply',
    body: `You'll receive a **fixed quote**, a proposed timeline, and any clarifying questions if needed.`,
    Icon: Clock,
  },
  {
    when: 'Within 5 days',
    strong: 'Sketches begin',
    body: `Once you approve and the **30% deposit** lands, first sketches usually arrive in under a week.`,
    Icon: Sparkles,
  },
] as const

export default function OrderSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-[calc(100vh-200px)] flex items-center pt-[140px] pb-24 bg-parchment-50">
        <Container className="text-center">
          {/* Big check mark in green circle */}
          <div className="mx-auto mb-8 w-24 h-24 rounded-full bg-success/15 border-2 border-success flex items-center justify-center">
            <Check size={44} strokeWidth={2.2} className="text-success" />
          </div>

          <div className="mb-4 flex justify-center">
            <SectionLabel>Brief received</SectionLabel>
          </div>
          <h1
            className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)' }}
          >
            Brief received.
          </h1>
          <p className="text-lg text-ink-500 leading-[1.65] mt-4 mx-auto max-w-[60ch]">
            Your commission brief is in our inbox. We&rsquo;ll review within 48 hours, send a quote with timeline,
            and a 30% deposit holds your slot — refundable until the first sketch.
          </p>

          {/* 3-step timeline â€” body copy via Markdown for bold time markers + email link */}
          <div className="mt-14 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {NEXT_STEPS.map(({ when, strong, body, Icon }, i) => (
              <div
                key={i}
                className="bg-parchment-50 border border-border-light rounded-2xl p-6 shadow-sm relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex w-10 h-10 rounded-full bg-gold-100 text-gold-700 items-center justify-center">
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <span className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700">
                    {when}
                  </span>
                </div>
                <div className="font-display text-xl font-semibold text-ink-900 leading-tight mb-1">
                  {strong}
                </div>
                <div className="text-sm text-ink-500 leading-snug">
                  <Markdown>{body}</Markdown>
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <LinkButton href="/" variant="primary" size="md">
              Back to studio
            </LinkButton>
            <LinkButton href="/portfolio" variant="outline" size="md">
              View portfolio
            </LinkButton>
          </div>

          <p className="mt-10 text-xs text-ink-500">
            Questions in the meantime?{' '}
            <a href="mailto:hello@designvortex.co" className="text-burgundy-700 hover:text-burgundy-500 underline underline-offset-2 decoration-gold-500">
              hello@designvortex.co
            </a>
          </p>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
