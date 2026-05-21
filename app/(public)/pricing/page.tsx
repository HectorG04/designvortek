import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import SectionHead from '@/components/ui/SectionHead'
import Markdown from '@/components/ui/Markdown'
import PaperTexture from '@/components/decor/PaperTexture'
import { cn } from '@/lib/utils'

/* =====================================================================
   PRICING — literal port of Pricing.html.

   Structure (matches design HTML exactly):
     1. Hero
     2. Per-service tier blocks (3 services × 3 tiers — .pr-service-block + .sd-tiers)
     3. Add-ons section (6-card grid — .pr-addons)
     4. Custom quote block (dark tome — .pr-custom)
     5. Pricing FAQ (3 questions — .hp-faq-layout pattern)

   The design does NOT include: "8 things always included" block, dark
   pg-cta-strip closer, or NPC Pack tier breakdowns (NPC packs route
   through the Custom block).
   ===================================================================== */

export const metadata: Metadata = {
  title: 'Pricing · Design Vortex',
  description:
    "Transparent pricing. No surprises. Flat-rate quotes for character art, VTT tokens, and party portraits — plus add-ons and custom projects.",
}

const Check = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-gold-700 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-gold-700" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
)

const ArrowRightMd = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

interface Tier {
  name: string
  best: string
  priceNum: string
  priceNote: string
  features: string[]
  featured?: boolean
  flag?: string
  cta: string
}

interface ServiceBlock {
  name: string
  sub: string
  turnaround: string
  tiers: [Tier, Tier, Tier]
}

const SERVICES: ServiceBlock[] = [
  {
    name: 'Character Art',
    sub: 'your hero, painted',
    turnaround: '7–14 days',
    tiers: [
      {
        name: 'Standard',
        best: 'your first commission',
        priceNum: '$180',
        priceNote: 'bust shot',
        features: ['Head & shoulders', '1 revision', 'Solid background', '4K PNG & JPG'],
        cta: 'Choose Standard',
      },
      {
        name: 'Deluxe',
        best: 'the sweet spot',
        priceNum: '$320',
        priceNote: 'half-body',
        features: ['Waist-up portrait', '2 revisions', 'Detailed background', 'Transparent export'],
        featured: true,
        flag: 'Most popular',
        cta: 'Choose Deluxe',
      },
      {
        name: 'Premium',
        best: 'the heirloom piece',
        priceNum: '$520',
        priceNote: 'full body',
        features: ['Full body, head to toe', '3 revisions', 'Cinematic scene', '6K + layered PSD'],
        cta: 'Choose Premium',
      },
    ],
  },
  {
    name: 'VTT Tokens',
    sub: 'for the virtual tabletop',
    turnaround: '3–7 days',
    tiers: [
      {
        name: 'Single',
        best: 'one perfect token',
        priceNum: '$80',
        priceNote: '1 token',
        features: ['512 + 1024 px exports', 'Transparent PNG', '1 revision'],
        cta: 'Choose Single',
      },
      {
        name: 'Party',
        best: 'your whole table',
        priceNum: '$280',
        priceNote: '4 tokens',
        features: ['4 matching tokens', 'Consistent border style', '1 revision each', '$30 savings vs single'],
        featured: true,
        flag: 'Best value',
        cta: 'Choose Party',
      },
      {
        name: 'Bulk',
        best: 'DM stockpile',
        priceNum: '$60',
        priceNote: 'per token · 8+',
        features: ['8+ tokens, $60 each', 'Matching style guaranteed', 'Custom border template', 'Schedule-friendly delivery'],
        cta: 'Choose Bulk',
      },
    ],
  },
  {
    name: 'Party Portraits',
    sub: 'the whole gang',
    turnaround: '14–21 days',
    tiers: [
      {
        name: 'Trio',
        best: 'small parties',
        priceNum: '$400',
        priceNote: '3 figures',
        features: ['3 figures, half-body', 'Simple background', '2 revisions'],
        cta: 'Choose Trio',
      },
      {
        name: 'Adventurers',
        best: 'classic D&D party',
        priceNum: '$680',
        priceNote: '4–5 figures',
        features: ['4–5 figures, half-body', 'Detailed scene background', '2 revisions', 'Print-ready files'],
        featured: true,
        flag: 'Most parties',
        cta: 'Choose Adventurers',
      },
      {
        name: 'Epic',
        best: 'groups + scenes',
        priceNum: '$980',
        priceNote: '6–8 figures',
        features: ['6–8 figures, full body', 'Cinematic scene', '3 revisions', 'Print + layered PSD'],
        cta: 'Choose Epic',
      },
    ],
  },
]

/* ---------- Add-ons (custom inline SVGs from design HTML) ---------- */
const RushIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M13 2L3 14h7l-1 8L19 10h-7z" />
  </svg>
)
const LayersIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 3v18" />
  </svg>
)
const LicenseIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 11.5a8.4 8.4 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.4 8.4 0 01-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.4 8.4 0 013.8-.9h.5a8.5 8.5 0 018 8z" />
  </svg>
)
const RevisionIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
  </svg>
)
const TokenIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
  </svg>
)
const PrintIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
)

interface AddOn { Icon: () => React.ReactElement; name: string; desc: string; price: string }

const ADDONS: AddOn[] = [
  { Icon: RushIcon,     name: 'Rush delivery',        desc: 'Move to the front of the queue. 3-day turnaround on Character & Token services.', price: '+$50' },
  { Icon: LayersIcon,   name: 'Layered PSD',          desc: 'Source files with separated layers. Edit the background, change colors, build variations.', price: '+$30' },
  { Icon: LicenseIcon,  name: 'Commercial license',   desc: 'For books, merch, paid streaming, Patreon. Personal use is included by default.', price: '+$150 per piece' },
  { Icon: RevisionIcon, name: 'Extra revision',       desc: 'A 3rd round of paint revisions, if your character needs the polish.', price: '+$40' },
  { Icon: TokenIcon,    name: 'Matching VTT token',   desc: 'A token version of your portrait, cropped and bordered for tabletop play.', price: '+$40' },
  { Icon: PrintIcon,    name: 'Print delivery',       desc: 'Museum-quality giclée print, 11×14 or 16×20, shipped from our partner studio.', price: 'From $60' },
]

/* ---------- FAQ ---------- */
const FAQ: { q: string; a: string }[] = [
  {
    q: 'Why flat-rate instead of hourly?',
    a: "Because you deserve to know the price before we start. Hourly billing punishes care — the artist who polishes for an extra two hours shouldn't cost you more. Fixed scope, fixed price, every time.",
  },
  {
    q: 'How does payment work?',
    a: '**25% deposit** to hold your slot (refundable until first sketch). The remaining **75% on delivery**. All payments through Stripe — cards, Apple Pay, Google Pay, all common methods.',
  },
  {
    q: 'What if I need to cancel?',
    a: 'Before first sketch: **100% refundable**. After first sketch: deposit covers sketch work. After paint begins: pro-rated based on stage completed. See full [refund policy](/refunds).',
  },
]

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        {/* Hero */}
        <PageHero
          eyebrow="Pricing"
          title={
            <>
              Transparent pricing.<br />
              <em className="font-display italic font-medium text-burgundy-700">No surprises.</em>
            </>
          }
          description="Flat-rate quotes, fixed scopes, no hourly games. Every price below is what you'll actually pay — the quote you approve is the price we charge."
        />

        {/* Per-service tier blocks (.pr-services) */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="flex flex-col gap-20">
              {SERVICES.map((svc) => (
                <div key={svc.name}>
                  {/* Service head */}
                  <div className="flex flex-wrap justify-between items-end gap-4 pb-4 mb-7 border-b border-border-light">
                    <div>
                      <div className="font-display text-[2rem] font-semibold text-ink-900 leading-[1.1]">
                        {svc.name}
                      </div>
                      <div className="font-accent text-[1.25rem] text-burgundy-700">
                        {svc.sub}
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 text-[0.875rem] text-ink-500">
                      <ClockIcon />
                      <span>
                        Turnaround{' '}
                        <strong className="font-display text-ink-900 font-semibold">{svc.turnaround}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Tiers — 3-col desktop, 1-col mobile */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {svc.tiers.map((tier) => (
                      <div
                        key={tier.name}
                        className={cn(
                          'relative rounded-2xl p-7 md:p-8 flex flex-col gap-3.5',
                          'transition-transform duration-250 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1 hover:shadow-md',
                          tier.featured
                            ? 'bg-parchment-50 border border-gold-500 shadow-[0_8px_24px_rgba(201,160,74,0.18)]'
                            : 'bg-parchment-100 border border-border-light',
                        )}
                      >
                        {/* Featured flag */}
                        {tier.flag && (
                          <span className="absolute -top-2.5 right-6 bg-gold-500 text-ink-900 font-body text-[0.625rem] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">
                            {tier.flag}
                          </span>
                        )}

                        {/* Name + best-for */}
                        <div>
                          <div className="font-display text-2xl font-semibold text-ink-900">
                            {tier.name}
                          </div>
                          <div className="font-accent text-base text-burgundy-700 -mt-2">
                            {tier.best}
                          </div>
                        </div>

                        {/* Price — dashed borders top + bottom */}
                        <div className="flex items-baseline gap-2 py-3 border-y border-dashed border-border-light">
                          <span className="font-display text-[2.75rem] font-semibold text-ink-900 leading-none tracking-[-0.02em]">
                            {tier.priceNum}
                          </span>
                          <span className="text-[0.875rem] text-ink-500">
                            {tier.priceNote}
                          </span>
                        </div>

                        {/* Feature list */}
                        <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                          {tier.features.map((f) => (
                            <li key={f} className="flex gap-2.5 items-start text-[0.9375rem] text-ink-700 leading-[1.4]">
                              <Check />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        <Link
                          href="/order"
                          className={cn(
                            'mt-2 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-body text-[0.75rem] font-semibold uppercase tracking-[0.12em] transition-all',
                            tier.featured
                              ? 'bg-burgundy-700 text-cream-50 hover:bg-burgundy-500'
                              : 'border-[1.5px] border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50',
                          )}
                        >
                          {tier.cta}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Add-ons (.pr-addons) */}
        <section className="pt-8 pb-16 md:pb-24">
          <Container>
            <SectionHead
              eyebrow="Add-ons"
              title={
                <>
                  Optional <em className="font-display italic font-medium text-burgundy-700">extras</em>
                </>
              }
              description="Tweaks and upgrades available on any commission."
            />

            <div className="bg-parchment-100 border border-border-light rounded-3xl p-7 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {ADDONS.map((addon) => {
                  const Icon = addon.Icon
                  return (
                    <div
                      key={addon.name}
                      className="bg-parchment-50 border border-border-light rounded-xl px-[22px] py-5 flex gap-4 items-start"
                    >
                      <span className="w-10 h-10 rounded-md bg-gold-100 text-gold-700 flex items-center justify-center flex-shrink-0">
                        <Icon />
                      </span>
                      <div>
                        <div className="font-display text-[1.125rem] font-semibold text-ink-900 mb-0.5">
                          {addon.name}
                        </div>
                        <div className="text-[0.875rem] text-ink-500 leading-[1.5] mb-2">
                          {addon.desc}
                        </div>
                        <div className="font-display text-[1.125rem] font-semibold text-burgundy-700">
                          {addon.price}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Container>
        </section>

        {/* Custom quote block — dark tome (.pr-custom) */}
        <section className="pt-8 pb-16 md:pb-24">
          <Container>
            <div className="relative bg-tome-950 text-cream-50 rounded-3xl px-7 py-12 md:px-12 md:py-14 grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-8 items-center overflow-hidden">
              <PaperTexture variant="cream" opacity={0.4} />
              <div className="relative">
                <div className="inline-flex items-center gap-[10px] mb-4">
                  <span className="h-px w-6 bg-gold-glow" aria-hidden="true" />
                  <span className="font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-gold-glow">
                    Custom projects
                  </span>
                </div>
                <h3
                  className="font-display font-semibold leading-[1.1] tracking-tight text-cream-50 mb-3 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                  style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)' }}
                >
                  Something <em>bigger</em>?
                </h3>
                <p className="text-cream-200 text-base leading-[1.6] max-w-[52ch]">
                  Book covers, indie game asset packs, merch design, concept art, or commissions over $1,000 — let&rsquo;s talk. Custom scopes get custom quotes, and frequent collaborators get retainer arrangements.
                </p>
              </div>
              <div className="relative flex flex-col gap-2.5 md:self-end">
                <Link
                  href="/order"
                  className="inline-flex items-center justify-center gap-2 bg-gold-500 text-ink-900 px-9 py-[18px] rounded-full font-body text-[0.8125rem] font-semibold uppercase tracking-[0.12em] hover:bg-gold-300 hover:-translate-y-px transition-all whitespace-nowrap"
                >
                  Request a custom quote <ArrowRightMd />
                </Link>
                <a
                  href="mailto:hello@designvortex.co"
                  className="inline-flex items-center justify-center gap-2 border-[1.5px] border-cream-200 text-cream-50 px-9 py-[18px] rounded-full font-body text-[0.8125rem] font-semibold uppercase tracking-[0.12em] hover:bg-cream-50 hover:text-ink-900 hover:border-cream-50 transition-all whitespace-nowrap"
                >
                  Email hello@designvortex.co
                </a>
              </div>
            </div>
          </Container>
        </section>

        {/* Pricing FAQ (reuses .hp-faq-layout pattern) */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 max-w-[1080px] mx-auto">

              {/* Side column */}
              <div>
                <div className="mb-3">
                  <SectionLabel>Pricing questions</SectionLabel>
                </div>
                <h2
                  className="font-display font-semibold leading-[1.1] tracking-tight text-ink-900 mb-4 [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  The fine <em>print</em>
                </h2>
                <p className="text-ink-500 leading-[1.65] mb-5">
                  Common questions about payment, refunds, and what&rsquo;s covered.
                </p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:gap-3.5 transition-all"
                >
                  Full FAQ <ArrowRightMd />
                </Link>
              </div>

              {/* Accordion list — native details/summary, server-rendered */}
              <div className="flex flex-col gap-3">
                {FAQ.map((item, i) => (
                  <details
                    key={i}
                    open={i === 0}
                    className="group bg-parchment-100 border border-border-light rounded-xl open:bg-parchment-50 open:border-border-medium open:shadow-sm transition-colors"
                  >
                    <summary className="list-none cursor-pointer flex items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-display text-xl font-semibold text-ink-900 leading-[1.3]">
                        {item.q}
                      </span>
                      <span className="flex-shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] bg-parchment-50 text-burgundy-700 border border-border-medium group-open:bg-burgundy-700 group-open:text-cream-50 group-open:border-burgundy-700 group-open:rotate-45">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-5 text-base text-ink-700 leading-[1.7] max-w-[64ch]">
                      <Markdown>{item.a}</Markdown>
                    </div>
                  </details>
                ))}
              </div>

            </div>
          </Container>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}
