import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Markdown from '@/components/ui/Markdown'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Design Vortex collects, uses, and protects your information. Plain English. Last updated May 1, 2026.',
  alternates: { canonical: '/privacy' },
}

/* Legal copy is stored as a single MARKDOWN STRING so bold key
   terms, inline links, and headings survive the data layer. The
   Markdown component renders headings, lists, and inline emphasis
   through branded element selectors below. */
const BODY = `Design Vortex ("we", "us", "the studio") is a small art commission practice. We collect the minimum information we need to deliver your commission and run the studio. **We don't sell your data, ever.** This page explains exactly what we collect and why — in plain English.

## 1. What we collect

When you submit a commission brief or contact form, we collect:

- **Your name and email address** — so we can reply and deliver files.
- **Phone number** (optional) — only if you provide one.
- **Project details and references** — what you wrote in the brief, links you shared.
- **Payment information** — processed by Stripe; we never see your card number.
- **Communication history** — emails, messages, revisions exchanged during your commission.

## 2. How we use it

Exclusively for these purposes:

- Replying to your inquiry and delivering your commission.
- Sending revision updates and the final files.
- **Tax compliance** — required by law (US: invoices retained 7 years).
- The occasional studio dispatch newsletter, only if you've opted in. Unsubscribe link in every email.

## 3. What we don't do

This list is deliberately short and absolute:

- We don't sell your information. Ever. To anyone.
- We don't share your brief, references, or descriptions with third parties.
- We don't post your character publicly without consent (and yes, we ask).
- We don't run ad retargeting. No Facebook pixel, no Google Ads remarketing.

## 4. Sharing & third parties

To operate the studio, we use these services. Each handles only what's required:

- **Stripe** — payment processing. Sees your card details, not your project info.
- **Resend** — transactional email. Sees your email address and message contents (encrypted in transit).
- **Vercel** — hosting. May log IP addresses for security purposes (retained 30 days).
- **Supabase** — secure database for your brief and contact submissions.
- **Plausible Analytics** — privacy-respecting site analytics. No cookies, no personal data, no tracking across sites.

All of the above are GDPR-compliant. We don't use any other third-party services that process your data.

## 5. Cookies & analytics

We use exactly two cookies:

- A **session cookie** that keeps your commission brief draft saved locally if you close the tab. Cleared on submission.
- A **preferences cookie** that remembers if you've dismissed the cookie banner.

That's it. No third-party cookies. No tracking pixels. No fingerprinting.

## 6. Your rights

Whether you're in the EU, UK, California, or anywhere else, you can:

- **Request a copy** of all data we have on you (we'll send it within 30 days).
- **Request deletion** of your data (except tax records we're legally required to keep).
- **Correct anything** that's wrong.
- **Opt out** of the newsletter or any other communication.

Email [hello@designvortex.co](mailto:hello@designvortex.co) and we'll handle it personally. No tickets, no forms, no chatbots.

## 7. Children's privacy

Design Vortex doesn't knowingly collect information from anyone under 13. If you're a parent who discovers your child has provided information, email us and we'll delete it immediately.

## 8. Changes & contact

We may update this policy occasionally — usually because we've added a new tool or simplified a process. Material changes will be announced via the studio dispatch and updated on this page. The "Last updated" date at the top of this page is always current.

Questions, requests, concerns — email [hello@designvortex.co](mailto:hello@designvortex.co). A real human will reply within 48 hours.`

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Legal" title="Privacy Policy" />

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
