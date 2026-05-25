import Link from 'next/link'
import { FOOTER_LINKS, SITE_NAME, KOFI_URL } from '@/lib/constants'
import Logo from './Logo'
import NewsletterForm from './NewsletterForm'

/* =============================================================================
   FOOTER — literal port of Homepage.html lines 734-793 + .hp-footer rules
   (homepage.css lines 817-924).

   .hp-footer        background parchment-200, border-top, padding 72px 0 28px
   .hp-footer-grid   1.6fr repeat(4, 1fr), gap 40px → 1fr 1fr below 900px
   .hp-footer-col    flex-col gap 6px
   .hp-footer-brand  burgundy-700 color, span ink-900
   .hp-footer-tag    0.875rem ink-500, leading 1.6, max-width 32ch, mb 18px
   .hp-footer-soc    36×36 round, parchment-50 bg, 1px border-light, ink-700
                     → hover burgundy-700 bg, cream-50 text
   .hp-footer-label  text-label uppercase, font-semibold, ink-500, mb 14px
   .hp-footer-col a  0.875rem ink-700, 3px y-padding, hover burgundy-700
   .hp-footer-bottom pt 24px, border-top, 0.8125rem ink-500, flex-wrap
   ============================================================================= */

// Inline SVGs match the design HTML EXACTLY (lines 749, 752, 755).
const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
)

const TwitterIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22 5.8a8.5 8.5 0 01-2.4.7 4.2 4.2 0 001.8-2.3 8.4 8.4 0 01-2.6 1 4.2 4.2 0 00-7.2 3.8A11.9 11.9 0 013 4.8a4.2 4.2 0 001.3 5.6 4.1 4.1 0 01-1.9-.5v.1a4.2 4.2 0 003.4 4.1 4.2 4.2 0 01-1.9.1 4.2 4.2 0 003.9 2.9A8.5 8.5 0 012 18.6 11.9 11.9 0 008.5 20.5c7.7 0 11.9-6.4 11.9-11.9v-.5A8.5 8.5 0 0022 5.8z" />
  </svg>
)

const EmailIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
)

const SOCIAL_LINKS = [
  { Icon: InstagramIcon, href: 'https://instagram.com',         label: 'Instagram' },
  { Icon: TwitterIcon,   href: 'https://twitter.com',           label: 'Twitter' },
  { Icon: EmailIcon,     href: 'mailto:hello@designvortex.co', label: 'Email' },
]

const LINK_COLUMNS: Array<keyof typeof FOOTER_LINKS> = ['Studio', 'Services', 'Resources']

// Match abbreviated labels used in the design (HTML line 789).
const BOTTOM_LABEL_MAP: Record<string, string> = {
  'Privacy Policy':   'Privacy',
  'Terms of Service': 'Terms',
  'Refund Policy':    'Refunds',
}
const BOTTOM_LINKS = FOOTER_LINKS.Legal

export default function SiteFooter() {
  return (
    <footer className="border-t border-border-light bg-parchment-200 pb-7 pt-[72px]">
      <div className="mx-auto w-full max-w-[1280px] px-6 md:px-12">

        {/* Top grid — 1.6fr + 4×1fr on desktop, 2-col on tablet, 1-col on mobile */}
        <div className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)] lg:gap-10">

          {/* Brand column */}
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
            <Logo className="mb-3 text-burgundy-700" textClassName="text-ink-900" />
            <p className="mb-[18px] max-w-[32ch] text-sm leading-[1.6] text-ink-500">
              Premium art commissions, since 2024. Every piece, by hand, by humans.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-light bg-parchment-50 text-ink-700 transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns: Studio · Services · Resources */}
          {LINK_COLUMNS.map((heading) => (
            <div key={heading} className="flex flex-col gap-1.5">
              <h4 className="mb-[14px] font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-ink-500">
                {heading}
              </h4>
              {FOOTER_LINKS[heading].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-[3px] text-sm text-ink-700 transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-burgundy-700"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          {/* Stay in touch column */}
          <div className="flex flex-col gap-1.5">
            <h4 className="mb-[14px] font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-ink-500">
              Stay in touch
            </h4>
            <a
              href="mailto:hello@designvortex.co"
              className="py-[3px] text-sm text-ink-700 transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-burgundy-700"
            >
              hello@designvortex.co
            </a>
            <NewsletterForm />
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-light pt-6 text-[0.8125rem] text-ink-500">
          <span>© {new Date().getFullYear()} {SITE_NAME} Studio. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* Tip jar — Ko-fi link, agency-feel pill. */}
            <a
              href={KOFI_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Support the studio on Ko-fi"
              className="group inline-flex items-center gap-1.5 rounded-full border border-gold-500/60 bg-parchment-50/70 px-3.5 py-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-ink-700 transition-all duration-150 hover:-translate-y-px hover:border-gold-500 hover:bg-gold-100 hover:text-burgundy-700 hover:shadow-[0_6px_18px_rgba(201,160,74,0.20)]"
            >
              <span aria-hidden="true" className="text-base leading-none transition-transform duration-150 group-hover:scale-110">☕</span>
              Support the studio
            </a>
            <span className="flex flex-wrap gap-6">
              {BOTTOM_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-ink-500 transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:text-burgundy-700"
                >
                  {BOTTOM_LABEL_MAP[link.label] ?? link.label}
                </Link>
              ))}
            </span>
          </div>
        </div>

      </div>
    </footer>
  )
}
