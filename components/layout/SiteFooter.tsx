import Link from 'next/link'
import { Mail, Camera, AtSign, Send } from 'lucide-react'
import { FOOTER_LINKS, SITE_NAME } from '@/lib/constants'
import Logo from './Logo'
import NewsletterForm from './NewsletterForm'

const SOCIAL_LINKS = [
  { Icon: Camera, href: 'https://instagram.com',     label: 'Instagram' },
  { Icon: AtSign, href: 'https://twitter.com',       label: 'Twitter / X' },
  { Icon: Send,   href: 'https://discord.com',       label: 'Discord' },
  { Icon: Mail,   href: 'mailto:hello@designvortek.com', label: 'Email' },
]

export default function SiteFooter() {
  return (
    <footer className="relative bg-parchment-200 border-t border-border-light">
      {/* Decorative compass-rose top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-parchment-50 rounded-full border border-border-light flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-gold-500">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="mx-auto max-w-[1280px] px-6 md:px-12 pt-20 pb-12">

        {/* Top grid: brand + 4 link columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-16">

          {/* Brand column — takes 2 columns on lg */}
          <div className="col-span-2">
            <Logo className="text-burgundy-700 mb-5" textClassName="text-ink-900" />
            <p className="text-ink-500 text-sm leading-relaxed max-w-xs mb-6">
              Bespoke art commissions for the TTRPG community and beyond. Painterly portraits, VTT tokens, and custom illustrations — crafted by hand.
            </p>

            {/* Newsletter signup */}
            <NewsletterForm />

            {/* Social */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith('mailto') ? undefined : '_blank'}
                  rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="w-9 h-9 rounded-md border border-border-light text-ink-700 inline-flex items-center justify-center hover:border-burgundy-700 hover:text-burgundy-700 hover:bg-parchment-50 transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-body text-[0.7rem] tracking-[0.18em] uppercase font-semibold text-burgundy-700 mb-5">
                {heading}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-ink-500 hover:text-ink-900 text-sm transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border-light/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-ink-500 text-xs">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-ink-500 text-xs font-accent text-base">
            Crafted with care · Painterly TTRPG art &amp; beyond
          </p>
        </div>

      </div>
    </footer>
  )
}
