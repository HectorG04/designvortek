import Link from 'next/link'
import { FOOTER_LINKS, SITE_NAME } from '@/lib/constants'
import Logo from './Logo'
import NewsletterForm from './NewsletterForm'

// Inline SVGs matching the design HTML exactly. (lucide-react v1.x doesn't
// ship Instagram/Twitter brand icons, so we use the canonical glyphs here.)
const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
)

const TwitterIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 5.8a8.5 8.5 0 01-2.4.7 4.2 4.2 0 001.8-2.3 8.4 8.4 0 01-2.6 1 4.2 4.2 0 00-7.2 3.8A11.9 11.9 0 013 4.8a4.2 4.2 0 001.3 5.6 4.1 4.1 0 01-1.9-.5v.1a4.2 4.2 0 003.4 4.1 4.2 4.2 0 01-1.9.1 4.2 4.2 0 003.9 2.9A8.5 8.5 0 012 18.6 11.9 11.9 0 008.5 20.5c7.7 0 11.9-6.4 11.9-11.9v-.5A8.5 8.5 0 0022 5.8z" />
  </svg>
)

const EmailIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
)

const SOCIAL_LINKS = [
  { Icon: InstagramIcon, href: 'https://instagram.com',         label: 'Instagram' },
  { Icon: TwitterIcon,   href: 'https://twitter.com',           label: 'Twitter' },
  { Icon: EmailIcon,     href: 'mailto:hello@designvortek.com', label: 'Email' },
]

const LINK_COLUMNS: Array<keyof typeof FOOTER_LINKS> = ['Studio', 'Services', 'Resources']

const BOTTOM_LABEL_MAP: Record<string, string> = {
  'Privacy Policy':    'Privacy',
  'Terms of Service':  'Terms',
  'Refund Policy':     'Refunds',
}
const BOTTOM_LINKS = FOOTER_LINKS.Legal.filter((l) => l.label !== 'Contact')

export default function SiteFooter() {
  return (
    <footer className="bg-parchment-200 border-t border-border-light pt-[72px] pb-7">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">

        {/* Top grid: brand (1.6fr) + 4 link cols (1fr each) on desktop. 2 cols at <900px. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 min-[901px]:[grid-template-columns:1.6fr_repeat(4,1fr)] gap-8 min-[901px]:gap-10 mb-12">

          {/* Brand column */}
          <div className="sm:col-span-2 min-[901px]:col-span-1 flex flex-col gap-1.5">
            <Logo className="text-burgundy-700 mb-3" textClassName="text-ink-900" />
            <p className="text-ink-500 text-sm leading-[1.6] max-w-[32ch] mb-[18px]">
              Premium art commissions, since 2022. Every piece, by hand, by humans.
            </p>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="w-9 h-9 rounded-full bg-parchment-50 border border-border-light text-ink-700 inline-flex items-center justify-center hover:bg-burgundy-700 hover:text-cream-50 hover:border-burgundy-700 transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns: Studio, Services, Resources */}
          {LINK_COLUMNS.map((heading) => (
            <div key={heading} className="flex flex-col gap-1.5">
              <h4 className="font-body text-[0.75rem] tracking-[0.15em] uppercase font-semibold text-ink-500 mb-[14px]">
                {heading}
              </h4>
              {FOOTER_LINKS[heading].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-ink-700 hover:text-burgundy-700 py-[3px] transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          {/* "Stay in touch" column */}
          <div className="flex flex-col gap-1.5">
            <h4 className="font-body text-[0.75rem] tracking-[0.15em] uppercase font-semibold text-ink-500 mb-[14px]">
              Stay in touch
            </h4>
            <a
              href="mailto:hello@designvortek.com"
              className="text-sm text-ink-700 hover:text-burgundy-700 py-[3px] transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]"
            >
              hello@designvortek.com
            </a>
            <NewsletterForm />
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border-light flex flex-wrap items-center justify-between gap-3 text-[0.8125rem] text-ink-500">
          <span>© {new Date().getFullYear()} {SITE_NAME} Studio. All rights reserved.</span>
          <span className="flex gap-6">
            {BOTTOM_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink-500 hover:text-burgundy-700 transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]"
              >
                {BOTTOM_LABEL_MAP[link.label] ?? link.label}
              </Link>
            ))}
          </span>
        </div>

      </div>
    </footer>
  )
}
