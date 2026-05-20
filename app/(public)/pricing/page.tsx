import type { Metadata } from 'next'
import { ArrowRight, Check, Clock, Zap, Layers, Award, Printer, RotateCcw, Circle } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Pricing · Design Vortek',
  description:
    'Transparent flat-rate pricing across all five services. Character art from $180, VTT tokens from $80, party portraits from $400. No hourly games.',
}

type ServiceBlock = {
  slug: string
  name: string
  sub: string
  turnaround: string
  rows: { feature: string; standard: string; deluxe: string; premium: string }[]
  tierNames: [string, string, string]
}

const SERVICES: ServiceBlock[] = [
  {
    slug: 'character-art',
    name: 'Character Art',
    sub: 'your hero, painted',
    turnaround: '7–14 days',
    tierNames: ['Standard', 'Deluxe', 'Premium'],
    rows: [
      { feature: 'Starting price',  standard: '$180',            deluxe: '$320',                premium: '$520' },
      { feature: 'Framing',         standard: 'Bust shot',       deluxe: 'Half-body',           premium: 'Full body' },
      { feature: 'Background',      standard: 'Solid color',     deluxe: 'Detailed scene',      premium: 'Cinematic scene' },
      { feature: 'Revisions',       standard: '1 included',      deluxe: '2 included',          premium: '3 included' },
      { feature: 'Final resolution',standard: '4K PNG + JPG',    deluxe: '4K + transparent',    premium: '6K + layered PSD' },
      { feature: 'Best for',        standard: 'First commission',deluxe: 'The sweet spot',      premium: 'Heirloom piece' },
    ],
  },
  {
    slug: 'vtt-tokens',
    name: 'VTT Tokens',
    sub: 'for the virtual tabletop',
    turnaround: '3–7 days',
    tierNames: ['Single', 'Party', 'Bulk'],
    rows: [
      { feature: 'Starting price',  standard: '$80',         deluxe: '$280',           premium: '$60 / token' },
      { feature: 'Tokens included', standard: '1 token',     deluxe: '4 tokens',       premium: '8+ tokens' },
      { feature: 'Resolution',      standard: '512 + 1024px',deluxe: '512 + 1024px',   premium: '512 + 1024px' },
      { feature: 'Revisions',       standard: '1 included',  deluxe: '1 per token',    premium: '1 per token' },
      { feature: 'Border style',    standard: 'Default',     deluxe: 'Consistent set', premium: 'Custom template' },
      { feature: 'Best for',        standard: 'One PC token',deluxe: 'Whole party',    premium: 'DM stockpile' },
    ],
  },
  {
    slug: 'party-portraits',
    name: 'Party Portraits',
    sub: 'the whole gang',
    turnaround: '14–21 days',
    tierNames: ['Trio', 'Adventurers', 'Epic'],
    rows: [
      { feature: 'Starting price',  standard: '$400',         deluxe: '$680',                  premium: '$980' },
      { feature: 'Figures',         standard: '3 figures',    deluxe: '4–5 figures',           premium: '6–8 figures' },
      { feature: 'Framing',         standard: 'Half-body',    deluxe: 'Half-body',             premium: 'Full body' },
      { feature: 'Background',      standard: 'Simple',       deluxe: 'Detailed scene',        premium: 'Cinematic' },
      { feature: 'Revisions',       standard: '2 included',   deluxe: '2 included',            premium: '3 included' },
      { feature: 'Deliverables',    standard: '4K PNG + JPG', deluxe: 'Print-ready files',     premium: 'Print + layered PSD' },
    ],
  },
  {
    slug: 'npc-packs',
    name: 'NPC Packs',
    sub: 'consistent cast for your campaign',
    turnaround: '3–6 weeks',
    tierNames: ['Starter', 'Campaign', 'Saga'],
    rows: [
      { feature: 'Starting price',  standard: '$600',                deluxe: '$1,400',                  premium: '$2,800' },
      { feature: 'NPCs included',   standard: '5 portraits',         deluxe: '12 portraits',            premium: '20+ portraits' },
      { feature: 'VTT tokens',      standard: '5 included',          deluxe: '12 included',             premium: '20+ included' },
      { feature: 'Style guide',     standard: 'Style notes',         deluxe: 'Kickoff call',            premium: 'Custom style guide' },
      { feature: 'Revisions',       standard: '2 per piece',         deluxe: '2 per piece',             premium: '3 per piece' },
      { feature: 'Best for',        standard: 'Short arc',           deluxe: 'Full season',             premium: 'Long-form world' },
    ],
  },
  {
    slug: 'custom-projects',
    name: 'Custom Projects',
    sub: 'bespoke illustration projects',
    turnaround: 'By scope',
    tierNames: ['Small', 'Project', 'Retainer'],
    rows: [
      { feature: 'Starting price',  standard: 'From $500',      deluxe: 'From $2k',            premium: 'From $4k/mo' },
      { feature: 'Scope',           standard: 'Single piece',   deluxe: '3–10 pieces',         premium: 'Dedicated slots' },
      { feature: 'License',         standard: 'Commercial inc.',deluxe: 'Commercial inc.',     premium: 'Commercial inc.' },
      { feature: 'NDA',             standard: 'On request',     deluxe: 'On request',          premium: 'Standard' },
      { feature: 'Source files',    standard: 'Layered PSD',    deluxe: 'Style guide + PSD',   premium: 'All source files' },
      { feature: 'Best for',        standard: 'One-off piece',  deluxe: 'Multi-piece project', premium: 'Ongoing work' },
    ],
  },
]

const ADDONS = [
  { icon: Zap,     name: 'Rush delivery',      desc: 'Move to the front of the queue. 3-day turnaround on Character & Token services.',                    price: '+$50' },
  { icon: Layers,  name: 'Layered PSD',        desc: 'Source files with separated layers. Edit the background, change colors, build variations.',          price: '+$30' },
  { icon: Award,   name: 'Commercial license', desc: 'For books, merch, paid streaming, Patreon. Personal use is included by default.',                    price: '+$150 / piece' },
  { icon: RotateCcw, name: 'Extra revision',   desc: 'A 3rd round of paint revisions, if your character needs the polish.',                                price: '+$40' },
  { icon: Circle,  name: 'Matching VTT token', desc: 'A token version of your portrait, cropped and bordered for tabletop play.',                          price: '+$40' },
  { icon: Printer, name: 'Print delivery',     desc: 'Museum-quality giclée print, 11×14 or 16×20, shipped from our partner studio.',                      price: 'From $60' },
]

const ALWAYS_INCLUDED = [
  '2 paint-stage revisions on every commission',
  'Sketch revisions are always free, no limit',
  '4K final delivery (PNG + JPG)',
  'Process updates every 3 days',
  'Personal use rights baked in',
  'Fixed-rate quote — no hourly games',
  'Hand-painted by humans, no AI ever',
  '48-hour quote turnaround on every brief',
]

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Pricing"
          title={
            <>
              Honest prices, <em className="font-display italic font-medium text-burgundy-700">no surprises</em>
            </>
          }
          description="Flat-rate quotes, fixed scopes, no hourly games. Every price below is what you'll actually pay — the quote you approve is the price we charge."
        />

        {/* Per-service comparison tables */}
        <section className="bg-parchment-50 py-12 md:py-20">
          <Container>
            <div className="flex flex-col gap-16 md:gap-24">
              {SERVICES.map((service) => (
                <article key={service.slug}>
                  {/* Service head */}
                  <div className="flex flex-wrap items-end justify-between gap-4 mb-6 pb-5 border-b border-border-light">
                    <div>
                      <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-tight tracking-tight">
                        {service.name}
                      </h2>
                      <p className="font-accent text-xl text-burgundy-700 mt-1">{service.sub}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-parchment-100 border border-border-light text-ink-700 text-sm">
                      <Clock size={14} strokeWidth={1.5} />
                      Turnaround <strong className="font-display text-base text-ink-900">{service.turnaround}</strong>
                    </div>
                  </div>

                  {/* Horizontal scroll container on mobile */}
                  <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                    <table className="w-full min-w-[640px] bg-parchment-100 border border-border-light rounded-2xl overflow-hidden">
                      <thead>
                        <tr className="bg-parchment-50 border-b border-border-light">
                          <th className="text-left px-5 py-4 text-[0.7rem] uppercase tracking-[0.15em] font-semibold text-ink-500 w-[28%]">
                            Feature
                          </th>
                          {service.tierNames.map((name, i) => (
                            <th
                              key={name}
                              className={cn(
                                'text-left px-5 py-4 font-display text-lg font-semibold text-ink-900',
                                i === 1 && 'bg-gold-100/40',
                              )}
                            >
                              {name}
                              {i === 1 && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-gold-500 text-ink-900 text-[0.6rem] uppercase tracking-[0.15em] font-semibold">
                                  Popular
                                </span>
                              )}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {service.rows.map((row, idx) => (
                          <tr
                            key={row.feature}
                            className={cn(
                              'border-b border-border-light last:border-b-0',
                              idx % 2 === 1 && 'bg-parchment-50/40',
                            )}
                          >
                            <td className="px-5 py-4 text-sm font-semibold text-ink-700 align-top">
                              {row.feature}
                            </td>
                            <td className={cn('px-5 py-4 text-sm text-ink-700 align-top', row.feature === 'Starting price' && 'font-display text-xl text-burgundy-700 font-semibold')}>
                              {row.standard}
                            </td>
                            <td className={cn('px-5 py-4 text-sm text-ink-700 align-top bg-gold-100/30', row.feature === 'Starting price' && 'font-display text-xl text-burgundy-700 font-semibold')}>
                              {row.deluxe}
                            </td>
                            <td className={cn('px-5 py-4 text-sm text-ink-700 align-top', row.feature === 'Starting price' && 'font-display text-xl text-burgundy-700 font-semibold')}>
                              {row.premium}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* CTA row */}
                  <div className="mt-5 flex flex-wrap gap-3 justify-end">
                    <Button href={`/services/${service.slug}`} variant="outline" size="sm">
                      Service details
                    </Button>
                    <Button href="/order" variant="primary" size="sm">
                      Commission this <ArrowRight size={14} strokeWidth={1.8} />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>

        {/* Add-ons */}
        <section className="bg-parchment-100 border-y border-border-light py-20 md:py-28">
          <Container>
            <div className="text-center max-w-[720px] mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>Add-ons</SectionLabel>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
                Optional <em className="font-display italic font-medium text-burgundy-700">extras</em>
              </h2>
              <p className="text-lg text-ink-500 mt-4 leading-relaxed">
                Tweaks and upgrades available on any commission.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ADDONS.map((addon) => {
                const Icon = addon.icon
                return (
                  <div
                    key={addon.name}
                    className="bg-parchment-50 border border-border-light rounded-xl p-6 flex gap-4 hover:border-border-medium transition-colors"
                  >
                    <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-parchment-100 border border-border-light text-burgundy-700 inline-flex items-center justify-center">
                      <Icon size={20} strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-semibold text-ink-900 leading-tight mb-1">
                        {addon.name}
                      </h3>
                      <p className="text-sm text-ink-500 leading-relaxed mb-3">{addon.desc}</p>
                      <div className="font-display text-lg font-semibold text-burgundy-700">
                        {addon.price}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Container>
        </section>

        {/* What's always included */}
        <section className="bg-parchment-50 py-20 md:py-28">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 max-w-[1080px] mx-auto items-start">
              <div>
                <div className="mb-3">
                  <SectionLabel>Always included</SectionLabel>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight mb-4">
                  Eight things <em className="font-display italic font-medium text-burgundy-700">in every quote</em>
                </h2>
                <p className="text-ink-500 leading-relaxed">
                  Whichever tier, whichever service — these eight promises ride along with every commission, no upcharge, no asterisk.
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALWAYS_INCLUDED.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 bg-parchment-100 border border-border-light rounded-xl px-5 py-4"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-forest-700 text-cream-50 inline-flex items-center justify-center mt-px">
                      <Check size={14} strokeWidth={2.4} />
                    </span>
                    <span className="text-ink-700 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        {/* CTA closer */}
        <section className="bg-tome-950 text-cream-50 py-20 md:py-28 text-center">
          <Container>
            <h2
              className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}
            >
              Ready for a <em className="font-display italic font-medium text-gold-glow">fixed quote</em>?
            </h2>
            <p className="text-lg text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-8">
              Three minutes to brief. Quote within 48 hours. No commitment until you’re ready.
            </p>
            <div className="inline-flex flex-wrap justify-center gap-3.5">
              <Button href="/order" variant="gold" size="lg">
                Start commission <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
              <Button href="/services" variant="outline-cream" size="lg">
                Browse services
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
