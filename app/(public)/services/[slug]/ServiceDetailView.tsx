'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ChevronRight, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import Markdown from '@/components/ui/Markdown'
import GoldCorners from '@/components/decor/GoldCorners'
import { cn } from '@/lib/utils'
import type { ServiceData } from './services-data'

/* =====================================================================
   SERVICE DETAIL VIEW â€” literal port of Service Detail.html sections.
   Client component because of FAQ accordion + tier selection.

   Markdown is used for:
     â€¢ `lede` (hero description) â€” surfaces price emphasis like **$180**
     â€¢ `faq.a` (FAQ answers) â€” **bold $ amounts** + [refund policy](/refunds)

   NOTE: SERVICES data + types live in ./services-data.tsx (server-safe,
   no 'use client' directive) so that page.tsx's generateStaticParams +
   generateMetadata can read them. If SERVICES lived here, the client
   module boundary would hide the export from the server build and every
   /services/<slug> route would 404 in production.
   ===================================================================== */

/* ---------------- Component ---------------- */

export default function ServiceDetailView({ data }: { data: ServiceData }) {
  const [activeTier, setActiveTier] = useState(1)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">
        {/* Breadcrumbs */}
        <div className="pt-[120px] pb-2">
          <Container>
            <nav aria-label="Breadcrumb" className="text-sm text-ink-500 flex items-center gap-2 flex-wrap">
              <Link href="/" className="hover:text-burgundy-700 transition-colors">Home</Link>
              <ChevronRight size={14} strokeWidth={1.5} />
              <Link href="/services" className="hover:text-burgundy-700 transition-colors">Services</Link>
              <ChevronRight size={14} strokeWidth={1.5} />
              <span className="text-ink-900">{data.title}</span>
            </nav>
          </Container>
        </div>

        {/* Hero (split) */}
        <section className="pt-6 pb-16 md:pb-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-4">
                  <SectionLabel>{data.eyebrow}</SectionLabel>
                </div>
                <h1
                  className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
                >
                  {data.titleHtml}
                </h1>

                {/* Lede via Markdown â€” surfaces **emphasis** + [links] */}
                <div className="text-lg text-ink-500 leading-[1.65] mt-5 max-w-[55ch] [&_p]:mb-0 [&_strong]:text-ink-700">
                  <Markdown>{data.lede}</Markdown>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/order" variant="primary" size="lg">
                    Start commission <ArrowRight size={14} strokeWidth={1.8} />
                  </Button>
                  <Button href="/portfolio" variant="outline" size="lg">
                    See examples
                  </Button>
                </div>

                {/* 4-stat row (Starting / Turnaround / Resolution / Delivered) */}
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-5 pt-6 border-t border-dashed border-border-light">
                  {[
                    { v: data.startingPrice, l: 'Starting price' },
                    { v: data.turnaround,    l: 'Turnaround' },
                    { v: data.resolution,    l: 'Resolution' },
                    { v: data.delivered,     l: 'Pieces delivered' },
                  ].map((s) => (
                    <div key={s.l}>
                      <div className="font-display text-xl font-semibold text-ink-900">{s.v}</div>
                      <div className="text-[0.7rem] uppercase tracking-[0.15em] font-semibold text-ink-500 mt-1">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero image (gradient placeholder) */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border-medium shadow-[0_16px_40px_-8px_rgba(30,20,8,0.25)]">
                <div className={cn('absolute inset-0 bg-gradient-to-br', data.heroGradient)} />
                <GoldCorners size={20} />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tome-950/60 backdrop-blur-sm border border-cream-50/20 text-cream-50 text-[0.7rem] uppercase tracking-[0.15em] font-semibold">
                  Featured Â· {data.title}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* What's included â€” 6-card grid */}
        <section className="bg-parchment-100 border-y border-border-light py-20 md:py-28">
          <Container>
            <div className="text-center max-w-[720px] mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>Whatâ€™s included</SectionLabel>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
                Six things in every <em className="font-display italic font-medium text-burgundy-700">commission</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
              {data.included.map((item) => (
                <div
                  key={item.name}
                  className="bg-parchment-50 border border-border-light rounded-xl p-6 flex gap-4"
                >
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-forest-700 text-cream-50 inline-flex items-center justify-center">
                    <Check size={16} strokeWidth={2.4} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-ink-500 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Pricing tiers â€” Standard / Deluxe (dark tome featured) / Premium */}
        <section className="bg-parchment-50 py-20 md:py-28">
          <Container>
            <div className="text-center max-w-[720px] mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>Pricing tiers</SectionLabel>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
                Three levels, <em className="font-display italic font-medium text-burgundy-700">your call</em>
              </h2>
              <p className="text-lg text-ink-500 mt-4 leading-relaxed">
                Same care across all three â€” the differences are scope, finish, and whatâ€™s included.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
              {data.tiers.map((tier, idx) => {
                const isActive = activeTier === idx
                const isFeatured = tier.featured
                return (
                  <button
                    key={tier.name}
                    type="button"
                    onClick={() => setActiveTier(idx)}
                    className={cn(
                      'relative text-left rounded-2xl p-8 border transition-all flex flex-col cursor-pointer',
                      isFeatured
                        ? 'bg-tome-950 text-cream-50 border-gold-500 shadow-[0_20px_48px_-12px_rgba(30,20,8,0.4)] md:-translate-y-2'
                        : isActive
                          ? 'bg-parchment-100 border-burgundy-700 shadow-[0_12px_32px_rgba(30,20,8,0.10)]'
                          : 'bg-parchment-100 border-border-light hover:border-border-medium hover:shadow-sm',
                    )}
                  >
                    {isFeatured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold-500 text-ink-900 text-[0.65rem] uppercase tracking-[0.18em] font-semibold whitespace-nowrap">
                        Most popular
                      </span>
                    )}

                    <div className={cn('font-display text-2xl font-semibold', isFeatured ? 'text-cream-50' : 'text-ink-900')}>
                      {tier.name}
                    </div>
                    <div className={cn('font-accent text-lg mt-1 mb-5', isFeatured ? 'text-gold-glow' : 'text-burgundy-700')}>
                      {tier.best}
                    </div>

                    <div className={cn('pb-5 mb-5 border-b', isFeatured ? 'border-cream-50/15' : 'border-border-light')}>
                      <div className={cn('font-display text-4xl font-semibold', isFeatured ? 'text-cream-50' : 'text-burgundy-700')}>
                        {tier.price}
                      </div>
                      <div className={cn('text-xs uppercase tracking-[0.12em] mt-1', isFeatured ? 'text-cream-200' : 'text-ink-500')}>
                        {tier.priceNote}
                      </div>
                    </div>

                    <ul className="space-y-2.5 mb-7 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className={cn('flex items-start gap-2 text-sm', isFeatured ? 'text-cream-200' : 'text-ink-700')}>
                          <Check size={14} strokeWidth={2.4} className={cn('mt-1 flex-shrink-0', isFeatured ? 'text-gold-glow' : 'text-forest-700')} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/order"
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        'mt-auto inline-flex items-center justify-center gap-2 px-7 py-[14px] rounded-full text-xs font-semibold uppercase tracking-[0.12em] border-[1.5px] transition-all',
                        isFeatured
                          ? 'bg-gold-500 border-transparent text-ink-900 hover:bg-gold-300'
                          : 'bg-transparent border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50',
                      )}
                    >
                      Choose {tier.name}
                    </Link>
                  </button>
                )
              })}
            </div>
          </Container>
        </section>

        {/* Example gallery â€” 4-card grid */}
        <section className="bg-parchment-100 border-y border-border-light py-20 md:py-28">
          <Container>
            <div className="text-center max-w-[720px] mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>Recent {data.title.toLowerCase()}</SectionLabel>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
                Pieces from the <em className="font-display italic font-medium text-burgundy-700">last quarter</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {data.examples.map((ex) => (
                <article
                  key={ex.title}
                  className="group bg-parchment-50 border border-border-light rounded-xl overflow-hidden hover:border-border-medium hover:shadow-md transition-all"
                >
                  <div className={cn('aspect-[4/5] relative bg-gradient-to-br', ex.gradient)}>
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-tome-950/60 backdrop-blur-sm border border-cream-50/20 text-cream-50 text-[0.65rem] uppercase tracking-[0.15em] font-semibold">
                      {data.title}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-ink-900 leading-snug mb-1">
                      {ex.title}
                    </h3>
                    <div className="text-xs text-ink-500">{ex.meta}</div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button href="/portfolio" variant="outline" size="md">
                See all {data.title.toLowerCase()} <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
            </div>
          </Container>
        </section>

        {/* Service-specific FAQ â€” answers via Markdown for **$ amounts** + [links] */}
        <section className="bg-parchment-50 py-20 md:py-28">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 max-w-[1080px] mx-auto">
              <div>
                <div className="mb-3">
                  <SectionLabel>About this service</SectionLabel>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight mb-4">
                  {data.title}, <em className="font-display italic font-medium text-burgundy-700">specifically</em>
                </h2>
                <p className="text-ink-500 leading-relaxed">
                  Common questions about the {data.title.toLowerCase()} process â€” whatâ€™s possible, what isnâ€™t, and where the limits land.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {data.faq.map((item, idx) => {
                  const isOpen = openFaq === idx
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'rounded-xl border transition-colors',
                        isOpen
                          ? 'bg-parchment-50 border-border-medium shadow-sm'
                          : 'bg-parchment-100 border-border-light hover:border-border-medium',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <span className="font-display text-lg md:text-xl font-semibold text-ink-900 leading-snug">
                          {item.q}
                        </span>
                        <span
                          className={cn(
                            'flex-shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-all',
                            isOpen
                              ? 'bg-burgundy-700 text-cream-50 rotate-45'
                              : 'bg-parchment-50 text-burgundy-700 border border-border-medium',
                          )}
                        >
                          <Plus size={14} strokeWidth={2.2} />
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.28,
                              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                            }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="px-6 pb-5 text-ink-700 leading-[1.7] max-w-[64ch] [&_p]:mb-0">
                              <Markdown>{item.a}</Markdown>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          </Container>
        </section>

        {/* CTA closer â€” dark tome */}
        <section className="bg-tome-950 text-cream-50 py-20 md:py-28 text-center">
          <Container>
            <h2
              className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}
            >
              Ready to <em className="font-display italic font-medium text-gold-glow">commission</em>?
            </h2>
            <p className="text-lg text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-8">
              Three minutes to brief. Quote within 48 hours. First sketch within a week.
            </p>
            <div className="inline-flex flex-wrap justify-center gap-3.5">
              <Button href="/order" variant="gold" size="lg">
                Commission {data.title.toLowerCase()} <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
              <Button href="/contact" variant="outline-cream" size="lg">
                Ask a question
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
