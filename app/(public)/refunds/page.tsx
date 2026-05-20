import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Our deposit, refund, and revision policy in plain English. Last updated May 1, 2026.',
  alternates: { canonical: '/refunds' },
}

export default function RefundsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Legal" title="Refund Policy" />

        <section className="pb-24">
          <Container narrow>
            <p className="text-sm text-ink-500 mb-10">Last updated: May 1, 2026</p>

            <div className="prose-content space-y-6 text-ink-700 font-body leading-[1.75] max-w-prose">
              <p>
                We make art by hand, one commission at a time, and we want you to love the result. This page explains
                exactly when a refund applies, when it doesn&rsquo;t, and how to request one. Written in plain English.
                If anything feels unfair, email us — we&rsquo;ll talk it through.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">1. Deposit policy</h2>
              <p>
                Every commission begins with a 25% non-binding deposit. The deposit holds your slot in the month&rsquo;s schedule
                and reserves our time. It is:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li><strong className="text-ink-900">Fully refundable</strong> any time before the first sketch is delivered.</li>
                <li><strong className="text-ink-900">Non-refundable</strong> once the first sketch is delivered — it covers our sketch labor.</li>
              </ul>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">2. The revision process</h2>
              <p>
                Two rounds of revisions are baked into every commission — one at the sketch stage and one at the color/paint stage.
                Most pieces nail it well within that budget. If we&rsquo;re mid-revision and the direction has gone sideways,
                pause and email us. We&rsquo;d rather have an honest conversation than a frustrated client.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">3. Refund eligibility</h2>

              <h3 className="font-display text-lg font-semibold text-ink-900 mt-5 mb-2">3.1 Full refund</h3>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li>Any time before the first sketch is sent.</li>
                <li>If we&rsquo;re unable to start your commission within the quoted timeline due to studio reasons.</li>
                <li>If we cancel the project for any reason on our end.</li>
              </ul>

              <h3 className="font-display text-lg font-semibold text-ink-900 mt-5 mb-2">3.2 Partial refund (balance only)</h3>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li>
                  After the first sketch but before final delivery, the deposit is retained but the remaining
                  balance is refunded if you choose to cancel.
                </li>
                <li>
                  If at the final delivery stage the piece is genuinely not what you wanted — and the two included
                  revisions have not resolved it — we will refund the balance above the 25% deposit.
                </li>
              </ul>

              <h3 className="font-display text-lg font-semibold text-ink-900 mt-5 mb-2">3.3 Not eligible for refund</h3>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li>The completed and approved piece (where final files have been delivered).</li>
                <li>
                  Cancellation after the 2 included revisions, where the revisions are within the original brief.
                </li>
                <li>Delays caused by the client (slow approvals, unresponsiveness over 14 days, scope changes).</li>
              </ul>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">4. How to request a refund</h2>
              <p>Email <a href="mailto:hello@designvortek.com" className="text-burgundy-700 hover:text-burgundy-500 underline underline-offset-2 decoration-gold-500">hello@designvortek.com</a> with:</p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li>Your name and commission reference (e.g. DV-2026-0518-1234).</li>
                <li>A short note describing why you&rsquo;d like to cancel.</li>
              </ul>
              <p>
                We will acknowledge within 48 hours and process eligible refunds within 7 business days via the original payment method.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">5. Disputes</h2>
              <p>
                If you&rsquo;re dissatisfied with our refund decision, please reply to our refund email and explain — most disputes
                resolve in a single back-and-forth. If we can&rsquo;t reach agreement, the matter is governed by the dispute clause
                in our <a href="/terms" className="text-burgundy-700 hover:text-burgundy-500 underline underline-offset-2 decoration-gold-500">Terms of Service</a>.
              </p>
              <p>
                We&rsquo;ve had to invoke this policy formally twice in 500+ commissions over four years. We mention it not because
                it happens often, but because clear rules make for honest conversations.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">6. Chargebacks</h2>
              <p>
                If you have a concern about a commission, please contact us first. Chargebacks filed without prior contact may
                result in our refusal to work with the same client again, and we will dispute them with documentation of work delivered.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">7. Changes</h2>
              <p>
                We may update this policy. The version in effect when you book is the one that governs your commission.
              </p>

              <p>
                Questions?{' '}
                <a href="mailto:hello@designvortek.com" className="text-burgundy-700 hover:text-burgundy-500 underline underline-offset-2 decoration-gold-500">
                  hello@designvortek.com
                </a>
                .
              </p>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
