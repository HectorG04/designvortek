import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import ContactFormCard from './_ContactFormCard'

/* =====================================================================
   CONTACT — literal port of Contact.html.

   Structure (matches design HTML exactly):
     1. Hero — eyebrow "Contact", title "Say <em>hello</em>"
     2. .ct-grid: 1fr 1.2fr two-column
        - Left: eyebrow "Get in touch" + h3 "Four ways to reach us" + 4
                .ct-method cards (Email, Commission brief, Instagram,
                Twitter/X) + response-time note
        - Right: .ct-form-card with name + email + topic select + message
                 + Send button + ct-redirect block

   NOTE: Earlier version had inverted columns (form-left, info-right), a
   "Get in touch" hero (not "Say hello"), 3-icon grid for socials, stats
   cards, and an FAQ teaser block — none of which are in the design.
   ===================================================================== */

export const metadata: Metadata = {
  title: 'Contact · Design Vortek',
  description:
    'Ask a question, send a note, or start a conversation. We reply within 48 hours, every weekday.',
  alternates: { canonical: '/contact' },
}

/* ---------- Inline icons matching design HTML exactly ---------- */
const EmailIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
)

const BriefIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20l9-9-3-3-9 9v3z" />
    <path d="M16 8l-3-3" />
  </svg>
)

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
)

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 5.8a8.5 8.5 0 01-2.4.7 4.2 4.2 0 001.8-2.3 8.4 8.4 0 01-2.6 1 4.2 4.2 0 00-7.2 3.8A11.9 11.9 0 013 4.8a4.2 4.2 0 001.3 5.6 4.1 4.1 0 01-1.9-.5v.1a4.2 4.2 0 003.4 4.1 4.2 4.2 0 01-1.9.1 4.2 4.2 0 003.9 2.9A8.5 8.5 0 012 18.6 11.9 11.9 0 008.5 20.5c7.7 0 11.9-6.4 11.9-11.9v-.5A8.5 8.5 0 0022 5.8z" />
  </svg>
)

/* ---------- Methods (4 .ct-method blocks from Contact.html) ---------- */
interface Method {
  Icon: () => React.ReactElement
  href: string
  title: string
  body: string
  value: string
  external?: boolean
}

const METHODS: Method[] = [
  {
    Icon: EmailIcon,
    href: 'mailto:hello@designvortek.com',
    title: 'Email',
    body: 'Best for detailed questions, project ideas, or anything that needs more than a tweet.',
    value: 'hello@designvortek.com',
  },
  {
    Icon: BriefIcon,
    href: '/order',
    title: 'Commission brief',
    body: 'The fastest way to start a project. Four short steps, three minutes, fixed quote in 48 hours.',
    value: 'Start the brief →',
  },
  {
    Icon: InstagramIcon,
    href: 'https://instagram.com/designvortek',
    title: 'Instagram',
    body: 'Recent work, process clips, and the occasional DM. Quick questions land here best.',
    value: '@designvortek',
    external: true,
  },
  {
    Icon: TwitterIcon,
    href: 'https://twitter.com/designvortek',
    title: 'Twitter / X',
    body: 'Studio updates and TTRPG community discussion. We reply to mentions and DMs.',
    value: '@designvortek',
    external: true,
  },
]

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        {/* Hero */}
        <PageHero
          eyebrow="Contact"
          title={
            <>
              Say{' '}
              <em className="font-display italic font-medium text-burgundy-700">hello</em>
            </>
          }
          description="Got a question, an idea, or just want to talk shop? Drop us a line. We reply within 48 hours on weekdays."
        />

        {/* Methods + Form — .ct-grid 1fr 1.2fr, max 1080px */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="mx-auto max-w-[1080px] grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-14 items-start">

              {/* LEFT: contact methods */}
              <div>
                <SectionLabel>Get in touch</SectionLabel>
                <h3 className="font-display text-[2rem] font-semibold text-ink-900 leading-[1.1] mt-2 mb-6">
                  Four ways to reach us
                </h3>

                <div className="flex flex-col gap-3">
                  {METHODS.map((m) => {
                    const Wrapper = ({ children }: { children: React.ReactNode }) =>
                      m.external ? (
                        <a
                          href={m.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block bg-parchment-100 border border-border-light rounded-xl p-6 hover:border-border-medium hover:shadow-sm hover:-translate-y-0.5 transition-all"
                        >
                          {children}
                        </a>
                      ) : m.href.startsWith('mailto:') ? (
                        <a
                          href={m.href}
                          className="group block bg-parchment-100 border border-border-light rounded-xl p-6 hover:border-border-medium hover:shadow-sm hover:-translate-y-0.5 transition-all"
                        >
                          {children}
                        </a>
                      ) : (
                        <Link
                          href={m.href}
                          className="group block bg-parchment-100 border border-border-light rounded-xl p-6 hover:border-border-medium hover:shadow-sm hover:-translate-y-0.5 transition-all"
                        >
                          {children}
                        </Link>
                      )

                    return (
                      <Wrapper key={m.title}>
                        <div className="flex gap-4 items-start">
                          {/* Icon — 44×44 rounded-md gold-100 bg + gold-700 text */}
                          <span className="inline-flex w-11 h-11 rounded-md bg-gold-100 text-gold-700 items-center justify-center flex-shrink-0">
                            <m.Icon />
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-display text-[1.125rem] font-semibold text-ink-900 mb-1 leading-tight">
                              {m.title}
                            </h4>
                            <p className="text-[0.9375rem] text-ink-500 leading-[1.5] mb-1.5">
                              {m.body}
                            </p>
                            <span className="font-body text-[0.9375rem] text-burgundy-700 font-medium">
                              {m.value}
                            </span>
                          </div>
                        </div>
                      </Wrapper>
                    )
                  })}
                </div>

                {/* Response time note — parchment-200 box */}
                <div className="mt-6 px-5 py-4 bg-parchment-200 rounded-md text-sm text-ink-700 leading-[1.55]">
                  <strong className="font-display text-ink-900">Response time:</strong>{' '}
                  within 48 hours, Mon–Fri. Based in EST. We sleep on weekends — usually.
                </div>
              </div>

              {/* RIGHT: form card (client component for interactivity) */}
              <ContactFormCard />

            </div>
          </Container>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}
