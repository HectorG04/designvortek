'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import { NAV_LINKS, SERVICES_NAV } from '@/lib/constants'
import { cn } from '@/lib/utils'
import Logo from './Logo'
import Button from '@/components/ui/Button'

interface SiteHeaderProps {
  /**
   * When true, header starts transparent (over hero) and goes opaque on scroll.
   * When false, header is always opaque (parchment with backdrop blur).
   */
  transparent?: boolean
}

export default function SiteHeader({ transparent = false }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const pathname = usePathname()

  // Scroll-aware behavior
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll() // initial check
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setServicesOpen(false) }, [pathname])

  // Is the header in "on-hero" mode (transparent, cream colors)?
  const onHero = transparent && !scrolled

  return (
    <>
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
          'fixed top-0 left-0 right-0 z-50 transition-[background-color,padding,box-shadow] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
          scrolled
            ? 'bg-parchment-50/[0.92] backdrop-blur-md py-3 min-[901px]:py-[14px]'
            : transparent
              ? 'bg-transparent py-4 min-[901px]:py-5'
              : 'bg-parchment-50/[0.92] backdrop-blur-md py-4 min-[901px]:py-5'
        )}
      >
        <div className="mx-auto max-w-[1280px] px-6 min-[901px]:px-12 flex items-center justify-between">

          {/* Logo */}
          <Logo
            className={onHero ? 'text-gold-glow' : 'text-burgundy-700'}
            textClassName={onHero ? 'text-cream-50' : 'text-ink-900'}
          />

          {/* Desktop nav */}
          <nav
            className={cn(
              'hidden min-[901px]:flex items-center gap-9',
              onHero ? 'text-cream-200' : 'text-ink-700'
            )}
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')

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
                        'inline-flex items-center gap-1 text-[0.9375rem] py-1 transition-[color,opacity] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
                        'opacity-[0.85] hover:opacity-100',
                        onHero ? 'hover:text-gold-glow' : 'hover:text-burgundy-700',
                        active && (onHero ? 'text-gold-glow opacity-100' : 'text-burgundy-700 opacity-100')
                      )}
                    >
                      {link.label}
                      <ChevronDown
                        size={12}
                        className={cn('transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]', servicesOpen && 'rotate-180')}
                      />
                    </Link>
                    <AnimatePresence>
                      {servicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.18, ease: 'easeOut' }}
                          className="absolute top-full left-0 pt-3"
                        >
                          <div className="bg-parchment-50 border border-border-light rounded-xl shadow-lg py-2 min-w-[220px]">
                            {SERVICES_NAV.map((s) => (
                              <Link
                                key={s.href}
                                href={s.href}
                                className="block px-5 py-2.5 text-sm text-ink-700 hover:text-burgundy-700 hover:bg-parchment-100 transition-colors"
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
                    'text-[0.9375rem] py-1 transition-[color,opacity] duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]',
                    'opacity-[0.85] hover:opacity-100',
                    onHero ? 'hover:text-gold-glow' : 'hover:text-burgundy-700',
                    active && (onHero ? 'text-gold-glow opacity-100' : 'text-burgundy-700 opacity-100')
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
              variant={onHero ? 'outline-cream' : 'primary'}
              size="sm"
              className="hidden md:inline-flex"
            >
              Start Commission
            </Button>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'min-[901px]:hidden inline-flex items-center justify-center w-10 h-10 rounded-md transition-colors duration-150',
                onHero ? 'text-cream-50 hover:bg-white/10' : 'text-ink-700 hover:bg-parchment-100'
              )}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

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
            className="fixed top-[64px] left-0 right-0 z-40 min-[901px]:hidden bg-parchment-50 border-b border-border-light shadow-lg"
          >
            <nav className="mx-auto max-w-[1280px] px-6 py-6 flex flex-col gap-1" aria-label="Mobile">
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
                      'block px-4 py-3 rounded-md font-display text-lg transition-colors',
                      pathname === link.href
                        ? 'text-burgundy-700 bg-parchment-100'
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
                className="pt-4 mt-2 border-t border-border-light"
              >
                <Button href="/order" variant="primary" size="md" className="w-full justify-center">
                  Start Commission
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
