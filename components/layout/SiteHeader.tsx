'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS, SERVICES_NAV } from '@/lib/constants'
import { cn } from '@/lib/utils'
import Logo from './Logo'
import Button from '@/components/ui/Button'

/* =============================================================================
   SITE HEADER — literal port of Homepage.html lines 20-39 and the
   .hp-header / .hp-header-brand / .hp-header-nav / .hp-header-cta rules
   in homepage.css (lines 57-132).

   STATE MATRIX
     on-hero (transparent + !scrolled)  → text cream-50, brand gold-glow,
                                          padding 20px 48px
     scrolled                           → bg parchment-50/0.92, blur 12,
                                          padding 14px 48px,
                                          shadow 0 1px 0 border-light + sm
     scrolled + on-hero                 → adopts ink-900 text colors
     mobile (<lg)                       → padding 16px 24px / scrolled 12px 24px,
                                          nav hidden, hamburger visible

   STRUCTURE (verbatim)
     <header>
       <a class="hp-header-brand">…Logo…</a>
       <nav class="hp-header-nav">…links…</nav>
       <div class="hp-header-cta"><button>Start commission</button></div>
     </header>
   ============================================================================= */

interface SiteHeaderProps {
  /** Start transparent over a dark hero; opaque on scroll. */
  transparent?: boolean
}

// Inline chevron-down — matches HTML line 30 verbatim.
const ChevronDownSvg = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
)

export default function SiteHeader({ transparent = false }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const pathname = usePathname()

  // Scroll-aware behavior (matches the design's vanilla JS script at bottom of HTML)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
    setServicesOpen(false)
  }, [pathname])

  // "on-hero" mode — transparent header sitting on the dark hero before scroll
  const onHero = transparent && !scrolled

  return (
    <>
      {/* Skip-to-content — keyboard-only, slides in on :focus.
          Uses inline-positioned styles rather than Tailwind's sr-only
          because sr-only's `clip-path: inset(50%)` was getting rendered
          visibly during route transitions in Next 16. Off-screen via
          transform; only the focus state moves it on. */}
      <a
        href="#main"
        className="fixed left-3 top-3 z-[100] bg-burgundy-700 text-cream-50 px-4 py-2 rounded-md text-sm font-semibold shadow-lg transition-transform duration-150 ease-out -translate-y-[200%] focus:translate-y-0 focus-visible:translate-y-0 focus:outline-2 focus:outline-gold-500 focus:outline-offset-2"
      >
        Skip to content
      </a>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={
          scrolled
            ? { boxShadow: '0 1px 0 var(--color-border-light), 0 1px 2px rgba(30, 20, 8, 0.05)' }
            : undefined
        }
        className={cn(
          'fixed left-0 right-0 top-0 z-50 flex items-center justify-between',
          'transition-[background-color,padding,box-shadow] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          // padding (mobile defaults → ≥1024 desktop)
          scrolled
            ? 'px-6 py-3 lg:px-12 lg:py-[14px]'
            : 'px-6 py-4 lg:px-12 lg:py-5',
          // background
          scrolled
            ? 'bg-parchment-50/[0.92] backdrop-blur-md'
            : transparent
              ? 'bg-transparent'
              : 'bg-parchment-50/[0.92] backdrop-blur-md'
        )}
      >
        {/* Brand */}
        <Logo
          className={onHero ? 'text-gold-glow' : 'text-burgundy-700'}
          textClassName={onHero ? 'text-cream-50' : 'text-ink-900'}
        />

        {/* Desktop nav — tighter gap (24px / 32px at xl) accommodates 8 items
            cleanly at the 1024px breakpoint without crowding. */}
        <nav
          className={cn(
            'hidden items-center gap-6 lg:flex xl:gap-8',
            onHero ? 'text-cream-50' : 'text-ink-700'
          )}
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + '/')

            if (link.hasDropdown) {
              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'relative inline-flex items-center gap-1 py-1 font-body text-[0.9375rem] opacity-[0.85]',
                      'transition-[color,opacity] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:opacity-100',
                      onHero ? 'hover:text-gold-glow' : 'hover:text-burgundy-700',
                      active &&
                        (onHero ? 'text-gold-glow opacity-100' : 'text-burgundy-700 opacity-100')
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        'inline-flex transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
                        servicesOpen && 'rotate-180'
                      )}
                    >
                      <ChevronDownSvg />
                    </span>
                  </Link>
                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute left-0 top-full pt-3"
                      >
                        <div className="min-w-[220px] rounded-xl border border-border-light bg-parchment-50 py-2 shadow-lg">
                          {SERVICES_NAV.map((s) => (
                            <Link
                              key={s.href}
                              href={s.href}
                              className="block px-5 py-2.5 text-sm text-ink-700 transition-colors hover:bg-parchment-100 hover:text-burgundy-700"
                            >
                              {s.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'py-1 font-body text-[0.9375rem] opacity-[0.85]',
                  'transition-[color,opacity] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:opacity-100',
                  onHero ? 'hover:text-gold-glow' : 'hover:text-burgundy-700',
                  active &&
                    (onHero ? 'text-gold-glow opacity-100' : 'text-burgundy-700 opacity-100')
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* CTA + mobile toggle */}
        <div className="flex items-center gap-3">
          <Button
            href="/order"
            variant="gold"
            size="sm"
            className="hidden md:inline-flex"
          >
            Start commission
          </Button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-150 lg:hidden',
              onHero
                ? 'text-cream-50 hover:bg-white/10'
                : 'text-ink-700 hover:bg-parchment-100'
            )}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed left-0 right-0 top-[64px] z-40 border-b border-border-light bg-parchment-50 shadow-lg lg:hidden"
          >
            <nav
              className="mx-auto flex max-w-[1280px] flex-col gap-1 px-6 py-6"
              aria-label="Mobile"
            >
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'block rounded-md px-4 py-3 font-display text-lg transition-colors',
                      pathname === link.href
                        ? 'bg-parchment-100 text-burgundy-700'
                        : 'text-ink-700 hover:bg-parchment-100'
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-2 border-t border-border-light pt-4"
              >
                <Button
                  href="/order"
                  variant="gold"
                  size="md"
                  className="w-full justify-center"
                >
                  Start commission
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
