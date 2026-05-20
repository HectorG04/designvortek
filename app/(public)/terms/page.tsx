import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The agreement between you and Design Vortek when you commission art. Plain English. Last updated May 1, 2026.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Legal" title="Terms of Service" />

        <section className="pb-24">
          <Container narrow>
            <p className="text-sm text-ink-500 mb-10">Last updated: May 1, 2026</p>

            <div className="prose-content space-y-6 text-ink-700 font-body leading-[1.75] max-w-prose">
              <p>
                These terms govern your use of the Design Vortek website and any commission you place with us.
                By submitting a commission brief or purchasing a service, you agree to them. They&rsquo;re written
                in plain English. If anything is unclear, email us — we&rsquo;ll explain.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">1. The service</h2>
              <p>
                Design Vortek is a small art studio producing custom illustrations, character art, VTT tokens,
                party portraits, and related work. We offer fixed-price commissions on a fixed-slot, monthly basis.
                We are a human-only studio: no AI generation is used in any part of our production process.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">2. Brief, quote, and approval</h2>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li>A submitted brief is not a contract — it&rsquo;s a request for a quote.</li>
                <li>Within 48 hours we send a fixed quote with timeline and a slot offer.</li>
                <li>Your slot is reserved once you pay the 25% deposit and confirm the brief in writing.</li>
                <li>Until you approve and pay the deposit, nothing is owed.</li>
              </ul>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">3. Payment terms</h2>
              <h3 className="font-display text-lg font-semibold text-ink-900 mt-5 mb-2">3.1 Deposit</h3>
              <p>
                A 25% non-binding deposit is due at booking. It is refundable until first sketch (see Refund Policy).
                Once the first sketch is sent, the deposit covers our sketch labor and becomes non-refundable.
              </p>
              <h3 className="font-display text-lg font-semibold text-ink-900 mt-5 mb-2">3.2 Balance</h3>
              <p>
                The remaining 75% is due on delivery of the final files. Files are watermarked until balance clears.
                We accept payment via Stripe (cards), and bank transfer for invoices over $500.
              </p>
              <h3 className="font-display text-lg font-semibold text-ink-900 mt-5 mb-2">3.3 Late payment</h3>
              <p>
                Invoices unpaid 14 days past the due date will be assessed a 5% surcharge per month.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">4. Revisions</h2>
              <p>
                Every commission includes <strong className="text-ink-900">two rounds of revisions</strong>:
                one at the sketch stage and one at the color/paint stage. Additional revisions are billable
                at $50 per round. Major scope changes (different character, swapped pose) reset the quote.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">5. Intellectual property &amp; usage</h2>
              <h3 className="font-display text-lg font-semibold text-ink-900 mt-5 mb-2">5.1 Personal use (included)</h3>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li>Print for yourself, gift to friends, frame on your wall.</li>
                <li>Use on your character sheet, personal social posts, profile pictures.</li>
                <li>Use as your VTT token in Roll20, Foundry, or similar platforms.</li>
              </ul>
              <h3 className="font-display text-lg font-semibold text-ink-900 mt-5 mb-2">5.2 Commercial use (add-on)</h3>
              <p>
                Books, paid streaming, merchandise, paid Patreon tiers, or any revenue-generating use requires a
                $150 commercial license per piece, or a bulk arrangement for larger projects.
              </p>
              <h3 className="font-display text-lg font-semibold text-ink-900 mt-5 mb-2">5.3 Studio rights</h3>
              <p>
                We retain the right to display the commissioned work in our portfolio, on social media, and in process posts.
                If you need a non-disclosure window (e.g. a surprise gift, book launch), let us know in the brief.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">6. Timeline</h2>
              <p>
                Quoted timelines are best-effort estimates from approved-brief date. Delays caused by client
                response time (revisions, references, approvals) extend the timeline by the equivalent amount.
                We notify proactively if any delay arises on our end.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">7. Cancellation</h2>
              <p>
                You may cancel at any time. Refund eligibility is governed by our <a href="/refunds" className="text-burgundy-700 hover:text-burgundy-500 underline underline-offset-2 decoration-gold-500">Refund Policy</a>.
                We may decline or terminate a project if the subject matter conflicts with our standards
                (we don&rsquo;t produce hateful content, non-consensual sexual content, or content depicting minors in adult contexts).
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">8. Limitation of liability</h2>
              <p>
                Our maximum liability under these terms is the amount you paid for the commission in question.
                We are not liable for indirect, incidental, or consequential damages. The art is delivered as a creative work,
                not a fit-for-particular-purpose product.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">9. Governing law</h2>
              <p>
                These terms are governed by the laws of the State of New York, United States. Disputes that cannot be resolved
                by good-faith conversation will be subject to the exclusive jurisdiction of the courts of New York County.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">10. Changes</h2>
              <p>
                We may update these terms occasionally. The version in effect when you submit your brief is the one that applies
                to your commission. The &ldquo;Last updated&rdquo; date at the top of this page is always current.
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
