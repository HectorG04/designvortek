import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import CompassDivider from '@/components/decor/CompassDivider'

/* =====================================================================
   SERVICES INDEX — literal port of Services.html.
   Static (server component). Five-card grid using the `.dv-service-card`
   pattern from design-system.css, plus the "common to every service"
   strip + a CTA closer.
   ===================================================================== */

export const metadata: Metadata = {
  title: 'Services · Design Vortek',
  description:
    'Five signature services — character art, VTT tokens, party portraits, NPC packs, and custom projects. Painterly craft, predictable timelines, transparent pricing.',
}

const SERVICES = [
  {
    slug: 'character-art',
    title: 'Character Art',
    sub: 'your hero, painted',
    body: 'Single-character portraits at portfolio quality. Detailed rendering, expressive poses, dramatic lighting. Perfect for D&D players who want their PC immortalised.',
    features: ['2 revisions included', '7–14 day turnaround', '4K final delivery'],
    price: '$180',
    icon: Sparkles,
  },
  {
    slug: 'vtt-tokens',
    title: 'VTT Tokens',
    sub: 'for the virtual tabletop',
    body: 'Circular character tokens optimised for Roll20 and Foundry. Rich color, decorative borders, perfect at every zoom level your DM throws at them.',
    features: ['512px & 1024px exports', 'Transparent PNG ready', 'Bulk discounts (4+)'],
    price: '$80',
    icon: Target,
  },
  {
    slug: 'party-portraits',
    title: 'Party Portraits',
    sub: 'the whole gang',
    body: 'Group illustrations — adventuring parties, weddings, gifts. Consistent style across every figure in the frame, no awkward composites.',
    features: ['3–8 figure groups', 'Optional scene background', 'Print-ready files'],
    price: '$400',
    icon: Users,
  },
  {
    slug: 'npc-packs',
    title: 'NPC Packs',
    sub: 'consistent cast for your campaign',
    body: '5+ NPCs delivered in matching style, on a schedule you can plan sessions around. The DM’s secret weapon for immersion at the table.',
    features: ['5–20 portrait packs', 'Matching style guarantee', 'VTT tokens included'],
    price: '$600',
    icon: BookOpen,
  },
  {
    slug: 'custom-projects',
    title: 'Custom Projects',
    sub: 'whatever you’re dreaming up',
    body: 'Book covers, indie game assets, merch design, concept art. If it needs painting and we’ve got the bandwidth, we’ll quote it honestly.',
    features: ['Bespoke scoping', 'Retainer options', 'Commercial licensing'],
    price: 'Quote',
    icon: Compass,
  },
] as const

const COMMON_FEATURES = [
  { label: 'Revisions baked in', detail: '2 paint-stage revisions included on every commission, sketch revisions are always free.' },
  { label: '7–14 day baseline', detail: 'Most pieces ship inside two weeks. Tokens are faster, party portraits a touch slower.' },
  { label: '4K final delivery', detail: 'PNG and JPG exports at 4K, transparent versions where they make sense, layered PSD on request.' },
  { label: 'No AI, ever', detail: 'Every piece hand-painted by a human artist. Updates every three days. Total transparency.' },
]

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">
        <PageHero
          eyebrow="What we make"
          title={
            <>
              Five signature <em className="font-display italic font-medium text-burgundy-700">services</em>.
            </>
          }
          description="Whether it's a single character or a whole campaign's worth of NPCs, every piece gets the same craft. Pick what fits — we'll handle the rest."
        />

        {/* Service cards — 5-card grid: 1 col mobile, 2 col sm, 3 col lg */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICES.map((service) => {
                const Icon = service.icon
                return (
                  <article
                    key={service.slug}
                    className="group bg-parchment-100 border border-border-light rounded-2xl p-8 flex flex-col hover:border-border-medium hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-all"
                  >
                    {/* 44x44 gold icon */}
                    <div className="w-11 h-11 rounded-xl bg-gold-100 border border-gold-300 text-gold-700 flex items-center justify-center mb-6 group-hover:border-gold-500 transition-colors">
                      <Icon size={22} strokeWidth={1.5} />
                    </div>

                    <h2 className="font-display text-2xl font-semibold text-ink-900 leading-tight">
                      {service.title}
                    </h2>
                    <p className="font-accent text-xl text-burgundy-700 italic mt-1 mb-4">
                      {service.sub}
                    </p>

                    <p className="text-ink-700 leading-relaxed mb-5">{service.body}</p>

                    <ul className="space-y-2 mb-6">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                          <Check size={14} strokeWidth={2.4} className="text-forest-700 mt-1 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-5 border-t border-border-light flex items-center justify-between">
                      <div>
                        <div className="text-[0.7rem] uppercase tracking-[0.15em] font-semibold text-ink-500">
                          Starting at
                        </div>
                        <div className="font-display text-2xl font-semibold text-burgundy-700">
                          {service.price}
                        </div>
                      </div>
                      <Link
                        href={`/services/${service.slug}`}
                        className="inline-flex items-center gap-1.5 text-[0.75rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 hover:text-burgundy-500 transition-all hover:gap-2.5"
                      >
                        Explore <ArrowRight size={14} strokeWidth={1.8} />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </Container>
        </section>

        <CompassDivider />

        {/* "Common to every service" strip */}
        <section className="bg-parchment-100 py-20 md:py-28 border-y border-border-light">
          <Container>
            <div className="text-center max-w-[720px] mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>Common to every service</SectionLabel>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
                Same craft, <em className="font-display italic font-medium text-burgundy-700">every service</em>
              </h2>
              <p className="text-lg text-ink-500 mt-4 leading-relaxed">
                Whichever service you pick, these four promises ride along.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-[1100px] mx-auto">
              {COMMON_FEATURES.map((item) => (
                <div
                  key={item.label}
                  className="bg-parchment-50 border border-border-light rounded-xl p-6"
                >
                  <div className="w-9 h-9 rounded-full bg-gold-100 border border-gold-300 text-gold-700 inline-flex items-center justify-center mb-4">
                    <Check size={16} strokeWidth={2.2} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink-900 mb-2">
                    {item.label}
                  </h3>
                  <p className="text-sm text-ink-500 leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button href="/pricing" variant="outline" size="md">
                See full pricing <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
            </div>
          </Container>
        </section>

        {/* CTA closer — dark tome */}
        <section className="bg-tome-950 text-cream-50 py-20 md:py-28 text-center">
          <Container>
            <h2
              className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}
            >
              Know what you <em className="font-display italic font-medium text-gold-glow">need</em>?
            </h2>
            <p className="text-lg text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-8">
              Send a brief in three minutes — we&rsquo;ll send a fixed quote within 48 hours.
            </p>
            <div className="inline-flex flex-wrap justify-center gap-3.5">
              <Button href="/order" variant="gold" size="lg">
                Start commission <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
              <Button href="/portfolio" variant="outline-cream" size="lg">
                See portfolio
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
