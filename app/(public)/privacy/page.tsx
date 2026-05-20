import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Design Vortek collects, uses, and protects your information. Plain English. Last updated May 1, 2026.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Legal" title="Privacy Policy" />

        <section className="pb-24">
          <Container narrow>
            <p className="text-sm text-ink-500 mb-10">Last updated: May 1, 2026</p>

            <div className="prose-content space-y-6 text-ink-700 font-body leading-[1.75] max-w-prose">
              <p>
                Design Vortek (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;the studio&rdquo;) is a small art commission practice.
                We collect the minimum information we need to deliver your commission and run the studio. We don&rsquo;t sell your data.
                This page explains exactly what we collect and why, in plain English.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">1. What we collect</h2>
              <p>When you submit a commission brief or contact form, we collect:</p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li><strong className="text-ink-900">Your name and email address</strong> — so we can reply and deliver files.</li>
                <li><strong className="text-ink-900">Phone number</strong> (optional) — only if you provide one.</li>
                <li><strong className="text-ink-900">Project details and references</strong> — what you wrote in the brief, links you shared.</li>
                <li><strong className="text-ink-900">Payment information</strong> — processed by Stripe; we never see your card number.</li>
                <li><strong className="text-ink-900">Communication history</strong> — emails, messages, revisions exchanged during your commission.</li>
              </ul>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">2. How we use it</h2>
              <p>Exclusively for these purposes:</p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li>Replying to your inquiry and delivering your commission.</li>
                <li>Sending revision updates and the final files.</li>
                <li>Tax compliance — required by law (US: invoices retained 7 years).</li>
                <li>The occasional studio dispatch newsletter, only if you&rsquo;ve opted in. Unsubscribe link in every email.</li>
              </ul>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">3. What we don&rsquo;t do</h2>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li>We don&rsquo;t sell your information. Ever. To anyone.</li>
                <li>We don&rsquo;t share your brief, references, or descriptions with third parties.</li>
                <li>We don&rsquo;t post your character publicly without consent — and yes, we ask.</li>
                <li>We don&rsquo;t run ad retargeting. No Facebook pixel, no Google Ads remarketing.</li>
              </ul>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">4. Third-party services</h2>
              <p>To operate the studio, we use these services. Each handles only what&rsquo;s required:</p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li><strong className="text-ink-900">Supabase</strong> — secure database for your brief and contact submissions. Hosted in the EU.</li>
                <li><strong className="text-ink-900">Vercel</strong> — hosting and edge delivery. May log IP addresses for security (retained 30 days).</li>
                <li><strong className="text-ink-900">Resend</strong> — transactional email. Sees your email address and message contents (encrypted in transit).</li>
                <li><strong className="text-ink-900">Stripe</strong> — payment processing. Sees your card details, not your project info.</li>
              </ul>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">5. Cookies &amp; analytics</h2>
              <p>We use a small set of cookies:</p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li>A <strong className="text-ink-900">session cookie</strong> that keeps your commission brief draft saved locally.</li>
                <li>A <strong className="text-ink-900">preferences cookie</strong> that remembers if you&rsquo;ve dismissed the cookie banner.</li>
              </ul>
              <p>No third-party cookies. No tracking pixels. No fingerprinting.</p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">6. Your rights</h2>
              <p>Whether you&rsquo;re in the EU, UK, California, or anywhere else, you can:</p>
              <ul className="list-disc pl-6 space-y-1.5 marker:text-burgundy-700">
                <li><strong className="text-ink-900">Request a copy</strong> of all data we have on you (we&rsquo;ll send it within 30 days).</li>
                <li><strong className="text-ink-900">Request deletion</strong> of your data (except tax records we&rsquo;re legally required to keep).</li>
                <li><strong className="text-ink-900">Correct</strong> anything that&rsquo;s wrong.</li>
                <li><strong className="text-ink-900">Opt out</strong> of the newsletter or any communication.</li>
              </ul>
              <p>
                Email <a href="mailto:hello@designvortek.com" className="text-burgundy-700 hover:text-burgundy-500 underline underline-offset-2 decoration-gold-500">hello@designvortek.com</a> and we&rsquo;ll handle it personally.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">7. Children&rsquo;s privacy</h2>
              <p>
                Design Vortek doesn&rsquo;t knowingly collect information from anyone under 13. If you&rsquo;re a parent
                who discovers your child has provided information, email us and we&rsquo;ll delete it immediately.
              </p>

              <h2 className="font-display text-2xl font-semibold text-ink-900 mt-10 mb-3">8. Changes &amp; contact</h2>
              <p>
                We may update this policy occasionally — usually because we&rsquo;ve added a new tool or simplified a process.
                Material changes will be announced via the studio dispatch and updated on this page.
              </p>
              <p>
                Questions, requests, concerns — email{' '}
                <a href="mailto:hello@designvortek.com" className="text-burgundy-700 hover:text-burgundy-500 underline underline-offset-2 decoration-gold-500">
                  hello@designvortek.com
                </a>
                . A real human will reply within 48 hours.
              </p>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
