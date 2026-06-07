import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
import Button from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'

/* =====================================================================
   SERVICES — curated 5-card marketing index.

   Literal port of `Latest 23 may 2026/Services.html` per the canonical
   HANDOFF v2 §4.1. This page is intentionally **not** 1:1 with the
   bucket data model — it surfaces the 5 hero categories (Character Art,
   VTT Tokens, Party Portraits, NPC Packs, Custom Projects) in a curated
   marketing grid. Cards link to the underlying bucket detail pages.

   Order of sections:
     01  Hero — "Five ways to commission"
     02  5-card grid (sv-grid → sv-card)
     03  Comparison table (sv-compare-card → sv-compare-table)
     04  Dark CTA strip (pg-cta-strip)
   ===================================================================== */

export const revalidate = 60

export const metadata: Metadata = {
  title: 'RPG & Fantasy Art Commission Services | Design Vortex',
  description:
    'D&D & RPG art commission services from $25 (VTT token) to $900+ (action scene). Character portraits, party scenes, NPC packs, custom maps. Hand-painted, no AI.',
  alternates: { canonical: '/services' },
}

/* =====================================================================
   The 5 curated cards. Hardcoded by design — see file header note.
   ===================================================================== */

interface ServiceCard {
  title: string
  sub: string
  desc: string
  priceLabel: string         // "From" | "Custom"
  priceValue: string         // "$60" | "Quote"
  href: string
  ctaLabel: string           // "Learn more" | "Discuss"
  icon: React.ReactNode
  gradient: string
}

/* Gradient backgrounds — match .ds-ph-* from design-system.css. */
const GRAD_CHARACTER =
  'radial-gradient(ellipse at 30% 20%, rgba(232,200,128,0.6), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(107,31,42,0.6), transparent 60%), linear-gradient(135deg, #2a1810, #3e1218 60%, #1a130c)'
const GRAD_TOKEN =
  'radial-gradient(circle at 50% 50%, rgba(212,162,76,0.5), transparent 50%), radial-gradient(circle at 50% 50%, rgba(107,31,42,0.8), transparent 70%), linear-gradient(135deg, #1a130c, #251A10)'
const GRAD_PARTY =
  'radial-gradient(ellipse at 20% 40%, rgba(201,160,74,0.5), transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(31,77,58,0.6), transparent 55%), linear-gradient(160deg, #3e1218, #6B1F2A, #1F4D3A)'
const GRAD_NPC =
  'radial-gradient(ellipse at 50% 80%, rgba(232,200,128,0.4), transparent 60%), linear-gradient(180deg, #1F4D3A 0%, #6B1F2A 60%, #1a130c 100%)'
const GRAD_CUSTOM =
  'radial-gradient(ellipse at 70% 30%, rgba(232,200,128,0.5), transparent 55%), radial-gradient(ellipse at 30% 70%, rgba(138,42,53,0.55), transparent 60%), linear-gradient(135deg, #2a1810 0%, #3e1218 50%, #251A10 100%)'

/* Inline icon SVGs — preserve canonical stroke shapes from Services.html. */
const IconStar = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
  </svg>
)
const IconToken = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
)
const IconParty = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <circle cx="9" cy="8" r="3" />
    <circle cx="15" cy="8" r="3" />
    <path d="M4 20c0-3 2-5 5-5s5 2 5 5M15 20c0-2 1-4 3-4s2 1 2 4" />
  </svg>
)
const IconNpcStack = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <rect x="3" y="4" width="18" height="6" rx="1" />
    <rect x="3" y="14" width="18" height="6" rx="1" />
    <path d="M7 7h.01M7 17h.01" />
  </svg>
)
const IconBrush = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="w-5 h-5">
    <path d="M12 20l9-9-3-3-9 9v3z" />
    <path d="M16 8l-3-3" />
  </svg>
)

const ArrowRightSm = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="w-3 h-3">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const ArrowRightMd = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" className="w-3.5 h-3.5">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const SERVICE_CARDS: ServiceCard[] = [
  {
    title: 'Character Art',
    sub: 'your hero, painted',
    desc:
      "Hire a character artist for single-character portraits at portfolio quality. D&D PCs, OCs, book covers, fan art. Detailed rendering, expressive poses, dramatic lighting. Human-painted, never AI.",
    priceLabel: 'From',
    priceValue: '$60',
    href: '/services/character-work',
    ctaLabel: 'Learn more',
    icon: IconStar,
    gradient: GRAD_CHARACTER,
  },
  {
    title: 'VTT Tokens',
    sub: 'for the virtual tabletop',
    desc:
      'Circular character tokens optimised for Roll20 and Foundry. Rich color, decorative borders, perfect at every zoom level your DM throws at them.',
    priceLabel: 'From',
    priceValue: '$25',
    href: '/services/tokens',
    ctaLabel: 'Learn more',
    icon: IconToken,
    gradient: GRAD_TOKEN,
  },
  {
    title: 'Party Portraits',
    sub: 'the whole gang',
    desc:
      'Group illustrations — adventuring parties, weddings, gifts. Consistent style across every figure in the frame, no awkward composites.',
    priceLabel: 'From',
    priceValue: '$350',
    href: '/services/party-work',
    ctaLabel: 'Learn more',
    icon: IconParty,
    gradient: GRAD_PARTY,
  },
  {
    title: 'NPC Packs',
    sub: 'for the campaign',
    desc:
      "5+ NPCs delivered in matching style, on a schedule you can plan sessions around. The DM's secret weapon for immersion at the table.",
    priceLabel: 'From',
    priceValue: '$220',
    href: '/services/gm-world-building',
    ctaLabel: 'Learn more',
    icon: IconNpcStack,
    gradient: GRAD_NPC,
  },
  {
    title: 'Custom Projects',
    sub: "whatever you're dreaming up",
    desc:
      "Book covers, indie game assets, merch design, concept art. If it needs painting and we've got the bandwidth, we'll quote it honestly.",
    priceLabel: 'Custom',
    priceValue: 'Quote',
    href: '/commercial',
    ctaLabel: 'Discuss',
    icon: IconBrush,
    gradient: GRAD_CUSTOM,
  },
]

/* =====================================================================
   Comparison table data
   ===================================================================== */

const COMPARE_HEADERS = ['Character Art', 'VTT Tokens', 'Party Portrait', 'NPC Pack', 'Custom'] as const

const COMPARE_ROWS: Array<{ label: string; values: string[]; price?: boolean }> = [
  { label: 'Starting at', values: ['$60', '$25', '$350', '$220', 'Quote'], price: true },
  { label: 'Turnaround',  values: ['7–14 days', '3–7 days', '14–21 days', '3–6 weeks', 'By scope'] },
  { label: 'Revisions',   values: ['2 included', '1 included', '2 included', '2 per piece', 'Negotiated'] },
  { label: 'Resolution',  values: ['4K final', '512 + 1024 px', '4K + print', '4K + tokens', 'By scope'] },
  { label: 'Best for',    values: ['Single PC portrait', 'Tabletop play', 'Groups, gifts', 'DMs, campaigns', 'Books, games, merch'] },
]

/* =====================================================================
   Page
   ===================================================================== */

export default async function ServicesIndexPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-parchment-50">

        {/* 01 — Hero */}
        <PageHero
          eyebrow="Services"
          title={
            <>
              Five ways to <em className="font-display italic font-medium text-burgundy-700">commission</em>.
            </>
          }
          description="Whether it's a single character or a whole campaign's worth of NPCs, every piece gets the same craft. Pick what fits — we'll handle the rest."
        />

        {/* 02 — Service cards (5-card grid, .sv-grid → .sv-card) */}
        <section className="pb-12 md:pb-16">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SERVICE_CARDS.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group bg-parchment-50 border border-border-light rounded-3xl overflow-hidden flex flex-col transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:border-border-medium hover:shadow-[0_8px_24px_rgba(201,160,74,0.18)]"
                >
                  {/* Card image — aspect 4/3 with gradient placeholder */}
                  <div
                    className="aspect-[4/3] relative"
                    style={{ background: card.gradient }}
                    aria-hidden="true"
                  />

                  {/* Card body */}
                  <div className="p-7 flex-1 flex flex-col gap-3">
                    {/* Icon tile */}
                    <div className="w-[38px] h-[38px] rounded-md bg-gold-100 text-gold-700 inline-flex items-center justify-center">
                      {card.icon}
                    </div>

                    {/* Title + sub */}
                    <h3 className="font-display text-2xl font-semibold text-ink-900 leading-[1.2]">
                      {card.title}
                    </h3>
                    <div className="font-accent text-[1.125rem] text-burgundy-700 -mt-2">
                      {card.sub}
                    </div>

                    {/* Description */}
                    <p className="text-[0.9375rem] text-ink-700 leading-[1.55]">
                      {card.desc}
                    </p>

                    {/* Foot — price + link, separated by border-top */}
                    <div className="flex items-center justify-between pt-3.5 border-t border-border-light mt-auto">
                      <span className="font-body text-[0.625rem] font-bold uppercase tracking-[0.15em] text-gold-700">
                        {card.priceLabel}{' '}
                        <strong className="font-display text-2xl font-semibold text-ink-900 ml-2 normal-case tracking-normal">
                          {card.priceValue}
                        </strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5 font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                        {card.ctaLabel} {ArrowRightSm}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>

        {/* 03 — Comparison table */}
        <section className="pt-8 pb-16 md:pb-24">
          <Container>
            <SectionHead
              eyebrow="At a glance"
              title={<>Side-by-side <em>comparison</em></>}
              description="Same craft, different scopes. Here's how the services stack up."
            />

            <div className="bg-parchment-100 border border-border-light rounded-xl overflow-hidden md:overflow-visible overflow-x-auto">
              <table className="w-full border-collapse font-body min-w-[720px] md:min-w-0">
                <thead>
                  <tr>
                    <th className="text-left px-5 py-4 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-700 bg-parchment-200 border-b border-border-light"></th>
                    {COMPARE_HEADERS.map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-4 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-700 bg-parchment-200 border-b border-border-light whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, rowIdx) => (
                    <tr
                      key={row.label}
                      className="group hover:[&_td]:bg-parchment-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-base font-display font-semibold text-ink-900 border-b border-border-light last:border-b-0 w-[22%] whitespace-nowrap">
                        {row.label}
                      </td>
                      {row.values.map((value, i) => (
                        <td
                          key={i}
                          className={
                            'px-5 py-4 text-[0.875rem] text-ink-700 border-b border-border-light whitespace-nowrap ' +
                            (rowIdx === COMPARE_ROWS.length - 1 ? 'border-b-0 ' : '')
                          }
                        >
                          {row.price ? (
                            <span className="font-display text-[1.125rem] font-semibold text-burgundy-700">
                              {value}
                            </span>
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-center mt-8">
              <Button href="/pricing" variant="outline" size="md">
                See full pricing {ArrowRightMd}
              </Button>
            </div>
          </Container>
        </section>

        {/* 04 — Dark CTA strip (pg-cta-strip) */}
        <section className="relative overflow-hidden bg-tome-950 text-cream-50 py-20 md:py-24 text-center">
          <PaperTexture variant="cream" />
          <div className="relative">
            <Container>
              <h2
                className="font-display font-semibold leading-[1.15] tracking-tight mx-auto mb-4 max-w-[24ch] [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
              >
                Know what you <em>need</em>?
              </h2>
              <p className="text-cream-200 max-w-[52ch] mx-auto mb-7 text-base leading-[1.65]">
                Send a brief in three minutes — we&apos;ll send a fixed quote within 48 hours.
              </p>
              <div className="inline-flex flex-wrap gap-3 justify-center">
                <Button href="/order" variant="gold" size="lg">
                  Start commission {ArrowRightMd}
                </Button>
                <Button href="/portfolio" variant="outline-cream" size="lg">
                  See portfolio
                </Button>
              </div>
            </Container>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}
