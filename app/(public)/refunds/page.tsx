import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Markdown from '@/components/ui/Markdown'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description:
    'Our deposit, refund, and revision policy in plain English. Last updated May 1, 2026.',
  alternates: { canonical: '/refunds' },
}

const BODY = `We make art by hand, one commission at a time, and we want you to love the result. This page explains exactly when a refund applies, when it doesn't, and how to request one. **Written in plain English.** If anything feels unfair, email us and we'll talk it through.

## 1. Deposit policy

Every commission begins with a **30% non-binding deposit**. The deposit holds your slot in the schedule and reserves our time. It is:

- **Fully refundable** any time before the first sketch is delivered.
- **Non-refundable** once the first sketch is delivered. It covers our sketch labor.

## 2. The revision process

Two rounds of revisions are baked into every commission across every tier. One at the sketch stage and one at the color/paint stage. Most pieces nail it well within that budget. If we're mid-revision and the direction has gone sideways, pause and email us. We'd rather have an honest conversation than a frustrated client.

## 3. Refund eligibility

### 3.1 Full refund

- Any time before the first sketch is sent.
- If we're unable to start your commission within the quoted timeline due to studio reasons.
- If we cancel the project for any reason on our end.

### 3.2 Partial refund (balance only)

- After the first sketch but before final delivery, the deposit is retained but the **remaining balance is refunded** if you choose to cancel.
- If at the final delivery stage the piece is genuinely not what you wanted and the two included revisions have not resolved it, we will refund the balance above the 30% deposit.

### 3.3 Not eligible for refund

- The completed and approved piece (where final files have been delivered).
- Cancellation after the 2 included revisions, where the revisions are within the original brief.
- Delays caused by the client (slow approvals, unresponsiveness over 14 days, scope changes).

### 3.4 Subscriptions

Subscription tiers ([Campaign Companion](/subscription) and the GM tier) are **paid monthly upfront**. There is no deposit refund model. To stop billing, cancel before the **10th of the month** and the next cycle will not charge. Already-paid months are not refunded once the month's drop has begun.

## 4. How to request a refund

Email [hello@designvortex.co](mailto:hello@designvortex.co) with:

- Your name and commission reference (e.g. **DV-2026-0518-1234**).
- A short note describing why you'd like to cancel.

We will acknowledge within 48 hours and process eligible refunds within **7 business days** via the original payment method.

## 5. Disputes

If you're dissatisfied with our refund decision, please reply to our refund email and explain — most disputes resolve in a single back-and-forth. If we can't reach agreement, the matter is governed by the dispute clause in our [Terms of Service](/terms).

We've had to invoke this policy formally **twice in 500+ commissions** over four years. We mention it not because it happens often, but because clear rules make for honest conversations.

## 6. Chargebacks

If you have a concern about a commission, **please contact us first**. Chargebacks filed without prior contact may result in our refusal to work with the same client again, and we will dispute them with documentation of work delivered.

## 7. Changes

We may update this policy. The version in effect when you book is the one that governs your commission.

Questions? [hello@designvortex.co](mailto:hello@designvortex.co).`

export default function RefundsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Legal" title="Refund Policy" />

        <section className="pb-24">
          <Container narrow>
            <p className="text-sm text-ink-500 mb-10">Last updated: May 1, 2026</p>

            <div
              className={
                'font-body text-ink-700 leading-[1.75] max-w-prose ' +
                '[&_p]:mb-5 ' +
                '[&_h2]:font-display [&_h2]:text-2xl md:[&_h2]:text-[1.75rem] [&_h2]:font-semibold [&_h2]:text-ink-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:tracking-tight ' +
                '[&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink-900 [&_h3]:mt-6 [&_h3]:mb-2 ' +
                '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ul]:mb-5 [&_ul]:marker:text-burgundy-700'
              }
            >
              <Markdown>{BODY}</Markdown>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
