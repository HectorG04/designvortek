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
   SERVICES INDEX — literal port of Services.html.
   Static (server component). Structure matches the design HTML exactly:
   - .pg-hero  → eyebrow "Services", h1 "Five ways to <em>commission</em>"
   - .sv-grid  → 5 image-top cards (NO features list, NO icon-top variant)
   - .sv-compare-card → 5×5 comparison table
   - .pg-cta-strip → dark tome closer
   No "Common to every service" strip, no CompassDivider — those were
   not in the design and have been removed.
   ===================================================================== */

export const metadata: Metadata = {
  title: 'Services · Design Vortex',
  description:
    'Five signature services — character art, VTT tokens, party portraits, NPC packs, and custom projects. Painterly craft, predictable timelines, transparent pricing.',
}

/** Design-spec gradients matching .ds-ph-* from design-system.css */
const GRADIENTS = {
  character:
    'radial-gradient(ellipse at 30% 20%, rgba(232,200,128,0.6), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(107,31,42,0.6), transparent 60%), linear-gradient(135deg, #2a1810, #3e1218 60%, #1a130c)',
  token:
    'radial-gradient(circle at 50% 50%, rgba(212,162,76,0.5), transparent 50%), radial-gradient(circle at 50% 50%, rgba(107,31,42,0.8), transparent 70%), linear-gradient(135deg, #1a130c, #251A10)',
  party:
    'radial-gradient(ellipse at 20% 40%, rgba(201,160,74,0.5), transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(31,77,58,0.6), transparent 55%), linear-gradient(160deg, #3e1218, #6B1F2A, #1F4D3A)',
  anime:
    'radial-gradient(ellipse at 50% 30%, rgba(243,214,217,0.6), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(201,160,74,0.4), transparent 60%), linear-gradient(160deg, #6B1F2A, #8A2A35 70%, #3e1218)',
  scene:
    'radial-gradient(ellipse at 50% 80%, rgba(232,200,128,0.4), transparent 60%), linear-gradient(180deg, #1F4D3A 0%, #6B1F2A 60%, #1a130c 100%)',
} as const

/** Custom inline SVG icons from the design HTML (verbatim paths) */
const Icon = {
  character: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
    </svg>
  ),
  token: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  party: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="9" cy="8" r="3" />
      <circle cx="15" cy="8" r="3" />
      <path d="M4 20c0-3 2-5 5-5s5 2 5 5M15 20c0-2 1-4 3-4s2 1 2 4" />
    </svg>
  ),
  npcPack: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="4" width="18" height="6" rx="1" />
      <rect x="3" y="14" width="18" height="6" rx="1" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  ),
  custom: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 20l9-9-3-3-9 9v3z" />
      <path d="M16 8l-3-3" />
    </svg>
  ),
}

const ArrowRightSm = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3 h-3">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const ArrowRightMd = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-3.5 h-3.5">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

interface Service {
  slug: string
  title: string
  sub: string
  desc: string
  price: string
  priceLabel: 'From' | 'Custom'
  linkText: string
  IconCmp: () => React.ReactElement
  gradient: string
}

const SERVICES: Service[] = [
  {
    slug: 'character-art',
    title: 'Character Art',
    sub: 'your hero, painted',
    desc: 'Single-character portraits at portfolio quality. Detailed rendering, expressive poses, dramatic lighting. Perfect for D&D players who want their PC immortalised.',
    price: '$180',
    priceLabel: 'From',
    linkText: 'Learn more',
    IconCmp: Icon.character,
    gradient: GRADIENTS.character,
  },
  {
    slug: 'vtt-tokens',
    title: 'VTT Tokens',
    sub: 'for the virtual tabletop',
    desc: 'Circular character tokens optimised for Roll20 and Foundry. Rich color, decorative borders, perfect at every zoom level your DM throws at them.',
    price: '$80',
    priceLabel: 'From',
    linkText: 'Learn more',
    IconCmp: Icon.token,
    gradient: GRADIENTS.token,
  },
  {
    slug: 'party-portraits',
    title: 'Party Portraits',
    sub: 'the whole gang',
    desc: 'Group illustrations — adventuring parties, weddings, gifts. Consistent style across every figure in the frame, no awkward composites.',
    price: '$400',
    priceLabel: 'From',
    linkText: 'Learn more',
    IconCmp: Icon.party,
    gradient: GRADIENTS.party,
  },
  {
    slug: 'npc-packs',
    title: 'NPC Packs',
    sub: 'for the campaign',
    desc: "5+ NPCs delivered in matching style, on a schedule you can plan sessions around. The DM's secret weapon for immersion at the table.",
    price: '$300',
    priceLabel: 'From',
    linkText: 'Learn more',
    IconCmp: Icon.npcPack,
    gradient: GRADIENTS.anime,
  },
  {
    slug: 'custom-projects',
    title: 'Custom Projects',
    sub: "whatever you're dreaming up",
    desc: "Book covers, indie game assets, merch design, concept art. If it needs painting and we've got the bandwidth, we'll quote it honestly.",
    price: 'Quote',
    priceLabel: 'Custom',
    linkText: 'Discuss',
    IconCmp: Icon.custom,
    gradient: GRADIENTS.scene,
  },
]

const COMPARE_ROWS: Array<{ label: string; values: [string, string, string, string, string]; pricey?: boolean }> = [
  { label: 'Starting at', values: ['$180', '$80', '$400', '$300', 'Quote'], pricey: true },
  { label: 'Turnaround', values: ['7–14 days', '3–7 days', '14–21 days', '3–6 weeks', 'By scope'] },
  { label: 'Revisions', values: ['2 included', '1 included', '2 included', '2 per piece', 'Negotiated'] },
  { label: 'Resolution', values: ['4K final', '512 + 1024 px', '4K + print', '4K + tokens', 'By scope'] },
  { label: 'Best for', values: ['Single PC portrait', 'Tabletop play', 'Groups, gifts', 'DMs, campaigns', 'Books, games, merch'] },
]

const COMPARE_HEADS = ['Character Art', 'VTT Tokens', 'Party Portrait', 'NPC Pack', 'Custom'] as const

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        {/* Hero — matches .pg-hero in pages.css */}
        <PageHero
          eyebrow="Services"
          title={
            <>
              Five ways to <em className="font-display italic font-medium text-burgundy-700">commission</em>.
            </>
          }
          description="Whether it's a single character or a whole campaign's worth of NPCs, every piece gets the same craft. Pick what fits — we'll handle the rest."
        />

        {/* Service cards — .sv-grid : 3-col desktop, 2-col tablet, 1-col mobile */}
        <section className="pb-12 md:pb-16">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {SERVICES.map((service) => {
                const Cmp = service.IconCmp
                return (
                  <Link
                    key={service.slug}
                    href={`/services/${service.slug}`}
                    className="group bg-parchment-50 border border-border-light rounded-3xl overflow-hidden flex flex-col transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:border-border-medium hover:shadow-[0_8px_24px_rgba(201,160,74,0.18)]"
                  >
                    {/* Image — aspect 4/3, gradient placeholder per design's .ds-ph-* */}
                    <div
                      className="aspect-[4/3] relative"
                      style={{ background: service.gradient }}
                      aria-hidden="true"
                    />

                    {/* Body — padding 28px, flex column gap 12px */}
                    <div className="p-7 flex-1 flex flex-col gap-3">
                      {/* Icon — 38×38 rounded-md gold-100 bg gold-700 text */}
                      <div className="w-[38px] h-[38px] rounded-md bg-gold-100 text-gold-700 inline-flex items-center justify-center">
                        <Cmp />
                      </div>

                      {/* Title — h3 Cormorant 1.5rem 600 */}
                      <h3 className="font-display text-2xl font-semibold text-ink-900 leading-[1.2]">
                        {service.title}
                      </h3>

                      {/* Sub — Caveat 1.125rem burgundy-700 with -8px top margin */}
                      <div className="font-accent text-[1.125rem] text-burgundy-700 -mt-2">
                        {service.sub}
                      </div>

                      {/* Description */}
                      <p className="text-base text-ink-700 leading-[1.55]">
                        {service.desc}
                      </p>

                      {/* Footer — flex between, top border, push to bottom */}
                      <div className="flex items-center justify-between pt-3.5 border-t border-border-light mt-auto">
                        <span className="font-body text-[0.625rem] font-bold uppercase tracking-[0.15em] text-gold-700">
                          {service.priceLabel}{' '}
                          <strong className="font-display text-2xl font-semibold text-ink-900 ml-2">
                            {service.price}
                          </strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5 font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                          {service.linkText} <ArrowRightSm />
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Container>
        </section>

        {/* Comparison table — .sv-compare-card */}
        <section className="pt-8 pb-16 md:pb-24">
          <Container>
            <SectionHead
              eyebrow="At a glance"
              title={
                <>
                  Side-by-side <em className="font-display italic font-medium text-burgundy-700">comparison</em>
                </>
              }
              description="Same craft, different scopes. Here's how the services stack up."
            />

            <div className="bg-parchment-100 border border-border-light rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse font-body">
                  <thead>
                    <tr className="bg-parchment-200">
                      <th className="px-5 py-4 text-left text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-ink-700 border-b border-border-light whitespace-nowrap" />
                      {COMPARE_HEADS.map((h) => (
                        <th
                          key={h}
                          className="px-5 py-4 text-left text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-ink-700 border-b border-border-light whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_ROWS.map((row, rIdx) => (
                      <tr
                        key={row.label}
                        className="transition-colors hover:bg-parchment-50"
                      >
                        <td
                          className={
                            'px-5 py-4 font-display text-base font-semibold text-ink-900 w-[22%] whitespace-nowrap ' +
                            (rIdx === COMPARE_ROWS.length - 1
                              ? ''
                              : 'border-b border-border-light')
                          }
                        >
                          {row.label}
                        </td>
                        {row.values.map((v, i) => (
                          <td
                            key={i}
                            className={
                              'px-5 py-4 text-[0.875rem] text-ink-700 whitespace-nowrap ' +
                              (rIdx === COMPARE_ROWS.length - 1
                                ? ''
                                : 'border-b border-border-light')
                            }
                          >
                            {row.pricey ? (
                              <span className="font-display text-[1.125rem] font-semibold text-burgundy-700">
                                {v}
                              </span>
                            ) : (
                              v
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button href="/pricing" variant="outline" size="md">
                See full pricing <ArrowRightMd />
              </Button>
            </div>
          </Container>
        </section>

        {/* CTA closer — .pg-cta-strip, dark tome bg with cream grain overlay */}
        <section className="relative bg-tome-950 text-cream-50 py-20 text-center overflow-hidden">
          <PaperTexture variant="cream" opacity={0.5} />
          <div className="relative">
            <Container>
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.15] tracking-tight mb-4 mx-auto max-w-[24ch] [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
              >
                Know what you <em>need</em>?
              </h2>
              <p className="text-base text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-7">
                Send a brief in three minutes — we&rsquo;ll send a fixed quote within 48 hours.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-3">
                <Button href="/order" variant="gold" size="lg">
                  Start commission <ArrowRightMd />
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
