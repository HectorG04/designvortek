import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'

/* =====================================================================
   404 — literal port of 404.html + .nf-* rules from pages.css (2150+).

   Structure (matches design HTML exactly):
     - Transparent SiteHeader at top
     - .nf-page: min-h-screen, centered flex, parchment-50 bg
     - .nf-orbs: 2 blurred radial gradients (gold-500 top-left, burgundy-700
       bottom-right), 500×500, blur 80px, opacity 0.12
     - .nf-num: clamp(7rem, 18vw, 14rem) burgundy with italic gold-500 0
     - .nf-eyebrow "Page wandered off the path"
     - .nf-title with em-italic burgundy "wandered into the wilds"
     - .nf-body paragraph
     - .nf-links: 4-up grid (Home / Portfolio / Services / Contact) with
       exact custom inline SVGs from design HTML, parchment-100 bg,
       gold-500 hover border, gold-700 icons

   NOTE: Earlier version had buttons, search form, popular-pages list, and
   SiteFooter — none of which are in the design. Removed.

   All 4 destinations verified live: /, /portfolio, /services, /contact.
   ===================================================================== */

export const metadata = {
  title: 'Not found · Design Vortek',
  robots: { index: false, follow: false },
}

/* ---------- Custom SVG icons (verbatim from 404.html) ---------- */
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] text-gold-700" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12 L12 3 L21 12" />
    <path d="M5 10v10h14V10" />
  </svg>
)

const PortfolioIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] text-gold-700" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M21 16l-5-5-9 9" />
  </svg>
)

const ServicesIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] text-gold-700" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
  </svg>
)

const ContactIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] text-gold-700" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
)

const QUICK_LINKS = [
  { href: '/',          label: 'Home',      Icon: HomeIcon },
  { href: '/portfolio', label: 'Portfolio', Icon: PortfolioIcon },
  { href: '/services',  label: 'Services',  Icon: ServicesIcon },
  { href: '/contact',   label: 'Contact',   Icon: ContactIcon },
]

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      {/* .nf-page — min-h-screen, centered, parchment-50, padding 100px 24px 60px */}
      <main className="relative min-h-screen flex items-center justify-center bg-parchment-50 pt-[100px] px-6 pb-[60px] overflow-hidden">

        {/* .nf-orbs — gold-500 top-left + burgundy-700 bottom-right, 500x500 blur 80px opacity 0.12 */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div
            className="absolute rounded-full opacity-[0.12]"
            style={{
              width: '500px',
              height: '500px',
              top: '10%',
              left: '10%',
              background: 'var(--color-gold-500, #C9A04A)',
              filter: 'blur(80px)',
            }}
          />
          <div
            className="absolute rounded-full opacity-[0.12]"
            style={{
              width: '500px',
              height: '500px',
              bottom: '10%',
              right: '10%',
              background: 'var(--color-burgundy-700, #6B1F2A)',
              filter: 'blur(80px)',
            }}
          />
        </div>

        {/* .nf-inner — max-w 640px, centered text */}
        <div className="relative max-w-[640px] text-center">

          {/* .nf-num — clamp 7rem-14rem, burgundy, italic gold 0, line-height 0.9, tracking -0.04em */}
          <div
            className="font-display font-semibold text-burgundy-700 leading-[0.9] tracking-[-0.04em] mb-4 select-none"
            style={{ fontSize: 'clamp(7rem, 18vw, 14rem)' }}
          >
            4<em className="not-italic font-display italic text-gold-500">0</em>4
          </div>

          {/* .nf-eyebrow — label size, gold-700, 0.18em tracking */}
          <span className="inline-block font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-gold-700 mb-4">
            Page wandered off the path
          </span>

          {/* .nf-title — clamp 1.875rem-2.75rem display 600, em-italic burgundy "wandered into the wilds" */}
          <h1
            className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mb-4 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
            style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
          >
            This page <em>wandered into the wilds</em>.
          </h1>

          {/* .nf-body — body-lg, ink-500, leading 1.6, mb 36px */}
          <p className="text-lg text-ink-500 leading-[1.6] mb-9 mx-auto max-w-[52ch]">
            The link broke, the page moved, or it never existed. No villain to blame — just a wrong turn. Let&rsquo;s get you back on the trail.
          </p>

          {/* .nf-links — 4-col grid (2-col below 600px), gap 12px, max 540px */}
          <div className="mx-auto max-w-[540px] grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_LINKS.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 px-3 py-[18px] bg-parchment-100 border border-border-light rounded-lg hover:bg-parchment-50 hover:border-gold-500 hover:-translate-y-0.5 transition-all"
              >
                <Icon />
                <span className="font-body text-[0.8125rem] font-medium text-ink-700">
                  {label}
                </span>
              </Link>
            ))}
          </div>

        </div>
      </main>
    </>
  )
}
