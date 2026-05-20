import Link from 'next/link'
import { Home, Image as ImageIcon, Sparkles, Mail, Search, ArrowRight } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Container from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/Button'
import SectionLabel from '@/components/ui/SectionLabel'

const POPULAR = [
  { href: '/portfolio',                  label: 'Portfolio — recent work' },
  { href: '/services/character-art',     label: 'Character Art commissions' },
  { href: '/services/vtt-tokens',        label: 'VTT Token packs' },
  { href: '/availability',               label: 'Current availability' },
  { href: '/order',                      label: 'Start a commission' },
] as const

const QUICK_LINKS = [
  { href: '/',          label: 'Home',      Icon: Home },
  { href: '/portfolio', label: 'Portfolio', Icon: ImageIcon },
  { href: '/services',  label: 'Services',  Icon: Sparkles },
  { href: '/contact',   label: 'Contact',   Icon: Mail },
] as const

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[calc(100vh-200px)] bg-parchment-50 pt-[140px] pb-24 relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(201,160,74,0.4) 0%, rgba(107,31,42,0.2) 40%, transparent 70%)',
          }}
        />

        <Container className="relative">
          <div className="text-center max-w-2xl mx-auto">

            {/* Big 404 with italic middle 0 */}
            <p
              className="font-display font-semibold text-burgundy-700 leading-none mb-6 select-none"
              style={{ fontSize: 'clamp(7rem, 18vw, 14rem)' }}
            >
              4<em className="italic font-medium text-gold-500">0</em>4
            </p>

            <div className="mb-4 flex justify-center">
              <SectionLabel>Page wandered off the path</SectionLabel>
            </div>

            <h1
              className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              This page <em className="italic font-medium text-burgundy-700">wandered off the map</em>.
            </h1>

            <p className="text-lg text-ink-500 leading-[1.65] mt-4 mx-auto max-w-[52ch]">
              The link broke, the page moved, or it never existed. No villain to blame — just a wrong turn.
              Let&rsquo;s get you back on the trail.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <LinkButton href="/" variant="primary" size="md">
                Back to home
              </LinkButton>
              <LinkButton href="/portfolio" variant="outline" size="md">
                Browse portfolio
              </LinkButton>
            </div>

            {/* Search placeholder (visual only — no search route yet) */}
            <form
              action="/portfolio"
              method="get"
              className="mt-10 mx-auto max-w-md flex items-center gap-2 bg-parchment-50 border border-border-light rounded-full px-2 pl-5 py-1.5 shadow-sm focus-within:border-burgundy-500 transition-colors"
            >
              <Search size={16} strokeWidth={1.6} className="text-ink-400 shrink-0" />
              <input
                type="search"
                name="q"
                placeholder="Search for portraits, tokens, services…"
                className="flex-1 bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none py-2"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-burgundy-700 text-cream-50 text-xs font-semibold uppercase tracking-wider hover:bg-burgundy-500 transition-colors"
              >
                Go
              </button>
            </form>

            {/* Quick links grid */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
              {QUICK_LINKS.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-2 p-4 bg-parchment-50 border border-border-light rounded-xl hover:border-burgundy-700 hover:text-burgundy-700 transition-colors text-ink-700"
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span className="text-sm">{label}</span>
                </Link>
              ))}
            </div>

            {/* Popular links list */}
            <div className="mt-14 max-w-md mx-auto text-left">
              <h2 className="text-[0.7rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 mb-3 text-center">
                Or try these popular pages
              </h2>
              <ul className="bg-parchment-50 border border-border-light rounded-xl divide-y divide-border-light">
                {POPULAR.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-ink-700 hover:text-burgundy-700 hover:bg-parchment-100 transition-colors"
                    >
                      <span>{label}</span>
                      <ArrowRight size={14} strokeWidth={1.6} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
