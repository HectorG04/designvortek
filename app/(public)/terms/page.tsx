import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Markdown from '@/components/ui/Markdown'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The agreement between you and Design Vortex when you commission art. Plain English. Last updated May 1, 2026.',
  alternates: { canonical: '/terms' },
}

const BODY = `These terms govern your use of the Design Vortex website and any commission you place with us. By submitting a commission brief or purchasing a service, you agree to them. They're written in plain English. If anything is unclear, email us and we'll explain.

## 1. The service

Design Vortex is a small art studio producing custom illustrations: character art, VTT tokens, party portraits, NPC packs, maps, monsters and items, plus commercial and publisher work. We offer **fixed-price commissions** on a slot-limited basis. We are a human-only studio. **No AI generation** is used in any part of our production process.

## 2. Brief, quote, and approval

- A submitted brief is not a contract. It's a request for a quote.
- Within **48 hours** we send a fixed quote with timeline and a slot offer.
- Your slot is reserved once you pay the 30% deposit and confirm the brief in writing.
- Until you approve and pay the deposit, nothing is owed.

## 3. Payment terms

### 3.1 Deposit

A **30% non-binding deposit** is due at booking. It is refundable until first sketch (see [Refund Policy](/refunds)). Once the first sketch is sent, the deposit covers our sketch labor and becomes non-refundable.

### 3.2 Balance

The remaining 70% is due on delivery of the final files. Files are watermarked until balance clears. We accept payment via Stripe (cards, Apple Pay, Google Pay, Link, ACH).

### 3.3 Currency

All pricing is in **United States Dollars (USD)**. International cards are billed at the current exchange rate by your card provider. We do not invoice in any other currency.

### 3.4 Late payment

Invoices unpaid 14 days past the due date will be assessed a **5% surcharge per month**.

## 4. Revisions

Every commission includes **two rounds of revisions**: one at the sketch stage and one at the color/paint stage. Sketch revisions before the first paint pass are unlimited. Major scope changes (different character, swapped pose, new subject) reset the quote.

## 5. Intellectual property & usage

### 5.1 Personal use (included)

- Print for yourself, gift to friends, frame on your wall.
- Use on your character sheet, personal social posts, profile pictures.
- Use as your VTT token in Roll20, Foundry, or similar platforms.

### 5.2 Commercial use

Books, paid streaming, merchandise, paid Patreon tiers, indie game assets, and any revenue-generating use require **commercial licensing**. The licensing uplift is **+40% of the base job price (flat)** and covers the scope agreed in writing before paint starts. See [/commercial](/commercial) for retainer arrangements.

### 5.3 Studio rights

We retain the right to display the commissioned work in our portfolio, on social media, and in process posts. If you need a non-disclosure window (e.g. a surprise gift, book launch, unreleased IP), let us know in the brief. NDAs are signed free of charge.

### 5.4 Subscription terms

Subscription tiers ([Campaign Companion](/subscription) at **$75/month** and the GM tier at **$150/month**) carry a **6-month minimum commitment** so the studio can reserve a steady cadence of work for your campaign. The first month is paid upfront in full (no deposit model) and each subsequent cycle bills on the same day.

Within the 6-month window you may **pause up to 2 cycles** if your campaign goes on hiatus — the minimum is paid cycles, not calendar months. After the sixth paid cycle the subscription becomes month-to-month: cancel before the **10th of the month** to skip the next cycle. Style guides are held for **12 months** after the last paid cycle.

## 6. Timeline

Quoted timelines are best-effort estimates from approved-brief date. Delays caused by client response time (revisions, references, approvals) extend the timeline by the equivalent amount. We notify proactively if any delay arises on our end.

## 7. Cancellation

You may cancel at any time. Refund eligibility is governed by our [Refund Policy](/refunds). We may decline or terminate a project if the subject matter conflicts with our standards (we don't produce hateful content, non-consensual sexual content, or content depicting minors in adult contexts).

## 8. Limitation of liability

Our maximum liability under these terms is the amount you paid for the commission in question. We are not liable for indirect, incidental, or consequential damages. The art is delivered as a creative work, not a fit-for-particular-purpose product.

## 9. Governing law

These terms are governed by the laws of the **State of New York**, United States. Disputes that cannot be resolved by good-faith conversation will be subject to the exclusive jurisdiction of the courts of New York County.

## 10. Changes

We may update these terms occasionally. The version in effect when you submit your brief is the one that applies to your commission. The "Last updated" date at the top of this page is always current.

Questions? [hello@designvortex.co](mailto:hello@designvortex.co).`

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <PageHero eyebrow="Legal" title="Terms of Service" />

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
