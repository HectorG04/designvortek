'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import Markdown from '@/components/ui/Markdown'
import { cn } from '@/lib/utils'
import type { ServiceData, TierFeature } from './services-data'

/* =====================================================================
   SERVICE DETAIL VIEW — literal port of Service Detail.html + .sd-*
   rules from pages.css (808-1032) and .hp-faq-* (1034+).

   Sections, in design order:
     01. Breadcrumbs           (.pd-breadcrumbs)
     02. Hero split            (.sd-hero-grid) — text left, ds-ph-character
                                image right with "Featured · NAME" badge
     03. What's included       (.sd-included parchment-100 card, 2-col,
                                burgundy-100 check chips)
     04. Pick your style       (.sd-styles — bg parchment-100, 4 cards)
     05. Pricing tiers         (.sd-tiers — 3 cards; featured = parchment-50
                                + gold-500 border + gold shadow + flag chip)
     06. Recent <service>      (.pd-related-grid — 3 cards, hue-rotated
                                ds-ph-character placeholders)
     07. About this service FAQ (.hp-faq-layout — 1fr 1.8fr split, plus-icon
                                 details accordion, "See full FAQ →" link)
     08. CTA strip dark tome   (.pg-cta-strip)

   NOTE: SERVICES data + types live in ./services-data.tsx (server-safe).
   See that file for the reasoning.
   ===================================================================== */

/* ---------- ds-ph-* gradients (verbatim from design-system.css) ---------- */
const PH_CHARACTER =
  'radial-gradient(ellipse at 30% 20%, rgba(232,200,128,0.6), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(107,31,42,0.6), transparent 60%), linear-gradient(135deg, #2a1810, #3e1218 60%, #1a130c)'

const PH_ANIME =
  'radial-gradient(ellipse at 50% 30%, rgba(243,214,217,0.6), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(201,160,74,0.4), transparent 60%), linear-gradient(160deg, #6B1F2A, #8A2A35 70%, #3e1218)'

const phFor = (key: 'character' | 'anime') => (key === 'anime' ? PH_ANIME : PH_CHARACTER)

/* ---------- Inline SVG icons (verbatim from Service Detail.html) ---------- */
const CheckIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn('w-3.5 h-3.5', className)} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
)

const CheckIconThin = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={cn('w-3.5 h-3.5', className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
)

const ArrowRightSm = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const ChevronRightSm = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-ink-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
)

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

/* Normalize TierFeature (string | { text, muted? }) to object form. */
const normalizeFeature = (f: TierFeature) =>
  typeof f === 'string' ? { text: f, muted: false } : { text: f.text, muted: !!f.muted }

export default function ServiceDetailView({ data }: { data: ServiceData }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        {/* 01. Breadcrumbs — .pd-breadcrumbs, padding-top 108px (header offset) */}
        <div className="pt-[108px] pb-2">
          <Container>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 flex-wrap text-sm text-ink-500">
              <Link href="/" className="hover:text-burgundy-700 transition-colors">Home</Link>
              <ChevronRightSm />
              <Link href="/services" className="hover:text-burgundy-700 transition-colors">Services</Link>
              <ChevronRightSm />
              <span className="text-ink-900">{data.title}</span>
            </nav>
          </Container>
        </div>

        {/* 02. Hero split — .sd-hero-grid: 1fr 1fr, gap 56px, items-center */}
        <section className="pt-6 pb-16 md:pb-20">
          <Container>
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
              {/* TEXT */}
              <div>
                <SectionLabel>{data.eyebrow}</SectionLabel>
                <h1
                  className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight mt-4 mb-4 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)' }}
                >
                  {data.titleHtml}
                </h1>

                {/* Lede — Markdown for **emphasis** + [links] */}
                <div className="text-[1.0625rem] text-ink-700 leading-[1.65] mb-6 max-w-[55ch] [&_p]:mb-0 [&_strong]:text-ink-900 [&_strong]:font-semibold">
                  <Markdown>{data.lede}</Markdown>
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <Button href="/order" variant="primary" size="lg">
                    Start commission <ArrowRightSm />
                  </Button>
                  <Button href="/portfolio" variant="outline" size="lg">
                    See examples
                  </Button>
                </div>

                {/* 4-stat strip — flex-wrap gap-32px, border-top dashed */}
                <div className="flex flex-wrap gap-8 pt-6 border-t border-border-light">
                  {[
                    { v: data.startingPrice, l: 'Starting price' },
                    { v: data.turnaround,    l: 'Turnaround' },
                    { v: data.resolution,    l: 'Resolution' },
                    { v: data.delivered,     l: 'Pieces delivered' },
                  ].map((s) => (
                    <div key={s.l} className="flex flex-col">
                      <strong className="font-display text-2xl font-semibold text-ink-900">{s.v}</strong>
                      <span className="text-[0.8125rem] text-ink-500 mt-0.5">{s.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* IMAGE — .sd-hero-img: 4:5, ds-ph-character, "Featured · NAME" badge */}
              <div
                className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border-light"
                style={{ background: PH_CHARACTER }}
              >
                <span className="absolute top-4 left-4 inline-block bg-tome-950/60 backdrop-blur-md border border-cream-50/20 text-cream-50 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-3 py-1.5 rounded-full">
                  Featured · {data.featuredExample ?? data.title}
                </span>
              </div>
            </div>
          </Container>
        </section>

        {/* 03. What's included — .sd-included parchment-100 card with 2-col grid */}
        <section className="pb-16 md:pb-20">
          <Container>
            <div className="text-center max-w-[640px] mx-auto mb-10">
              <SectionLabel>What&apos;s included</SectionLabel>
              <h2
                className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mt-3 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
              >
                Six things in every <em>commission</em>
              </h2>
            </div>

            {/* .sd-included card */}
            <div className="bg-parchment-100 border border-border-light rounded-2xl p-7 md:p-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
                {data.included.map((item) => (
                  <div key={item.name} className="flex gap-3.5 items-start">
                    {/* .sd-included-check — 28×28 burgundy-100 circle, burgundy-700 check */}
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-burgundy-100 text-burgundy-700 inline-flex items-center justify-center">
                      <CheckIcon />
                    </span>
                    <div>
                      <h4 className="font-display text-[1.125rem] font-semibold text-ink-900 leading-tight mb-1">
                        {item.name}
                      </h4>
                      <p className="text-[0.9375rem] text-ink-500 leading-[1.55]">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* 04. Pick your style — .sd-styles, bg parchment-100. Only renders if styles defined */}
        {data.styles && data.styles.length > 0 && (
          <section className="bg-parchment-100 py-16 md:py-20">
            <Container>
              <div className="text-center max-w-[640px] mx-auto mb-10">
                <SectionLabel>Pick your style</SectionLabel>
                <h2
                  className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mt-3 mb-3 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
                >
                  Four styles, <em>one craft</em>
                </h2>
                <p className="text-[1.0625rem] text-ink-500 leading-[1.6]">
                  Each style has its own personality. Not sure? Send references — we&apos;ll suggest what fits.
                </p>
              </div>

              {/* .sd-styles — repeat(4,1fr) desktop, 2-col tablet, gap 16px */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {data.styles.map((style) => (
                  <div
                    key={style.name}
                    className="group bg-parchment-50 border border-border-light rounded-lg overflow-hidden hover:-translate-y-0.5 hover:border-border-medium hover:shadow-md transition-all cursor-pointer"
                  >
                    {/* .sd-style-img — 4:5 ratio, ds-ph-* gradient + optional filter */}
                    <div
                      className="aspect-[4/5]"
                      style={{ background: phFor(style.ph), filter: style.filter }}
                    />
                    {/* .sd-style-body — padding 14px 18px 18px */}
                    <div className="px-[18px] pt-3.5 pb-[18px]">
                      <div className="font-display text-[1.125rem] font-semibold text-ink-900 leading-tight mb-0.5">
                        {style.name}
                      </div>
                      <div className="text-[0.8125rem] text-ink-500">{style.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* 05. Pricing tiers — .sd-tiers, 3-col, featured = parchment-50 + gold-500 border + gold shadow */}
        <section className="py-16 md:py-20">
          <Container>
            <div className="text-center max-w-[640px] mx-auto mb-12">
              <SectionLabel>Pricing tiers</SectionLabel>
              <h2
                className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mt-3 mb-3 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
              >
                Three levels, <em>your call</em>
              </h2>
              <p className="text-[1.0625rem] text-ink-500 leading-[1.6]">
                Same care across all three — the differences are scope, finish, and what&apos;s included.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {data.tiers.map((tier) => {
                const isFeatured = !!tier.featured
                return (
                  <div
                    key={tier.name}
                    className={cn(
                      'relative rounded-xl px-7 py-8 flex flex-col gap-4 border transition-all hover:-translate-y-1 hover:shadow-md',
                      isFeatured
                        ? 'bg-parchment-50 border-gold-500 shadow-[0_8px_24px_rgba(201,160,74,0.32)]'
                        : 'bg-parchment-100 border-border-light',
                    )}
                  >
                    {/* .sd-tier-flag — gold-500 chip pinned top-right */}
                    {isFeatured && (
                      <span className="absolute -top-2.5 right-6 inline-block bg-gold-500 text-ink-900 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2.5 py-1 rounded-full">
                        Most popular
                      </span>
                    )}

                    {/* Name */}
                    <div className="font-display text-2xl font-semibold text-ink-900">
                      {tier.name}
                    </div>

                    {/* Best for — caveat burgundy, -mt-2 */}
                    <div className="font-accent text-base text-burgundy-700 -mt-3">
                      {tier.best}
                    </div>

                    {/* Price block — dashed border above & below */}
                    <div className="flex items-baseline gap-2 py-3 border-y border-dashed border-border-light">
                      <span className="font-display text-[2.75rem] font-semibold text-ink-900 leading-none tracking-tight">
                        {tier.price}
                      </span>
                      <span className="text-sm text-ink-500">{tier.priceNote}</span>
                    </div>

                    {/* Features list — 6 items max, .muted lines strike through */}
                    <ul className="flex-1 flex flex-col gap-2.5">
                      {tier.features.map((rawFeature, idx) => {
                        const feature = normalizeFeature(rawFeature)
                        return (
                          <li
                            key={idx}
                            className={cn(
                              'flex items-start gap-2.5 text-[0.9375rem] leading-[1.4]',
                              feature.muted ? 'text-ink-400 line-through' : 'text-ink-700',
                            )}
                          >
                            <CheckIconThin
                              className={cn(
                                'flex-shrink-0 mt-1',
                                feature.muted ? 'text-ink-300' : 'text-gold-700',
                              )}
                            />
                            <span>{feature.text}</span>
                          </li>
                        )
                      })}
                    </ul>

                    {/* CTA — primary on featured, outline otherwise */}
                    <div className="mt-2">
                      <Button
                        href="/order"
                        variant={isFeatured ? 'primary' : 'outline'}
                        size="md"
                        className="w-full"
                      >
                        Choose {tier.name}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Container>
        </section>

        {/* 06. Recent <service> — .pd-related-grid 3-col, bg parchment-100 */}
        <section className="bg-parchment-100 py-16 md:py-20">
          <Container>
            <div className="text-center max-w-[640px] mx-auto mb-10">
              <SectionLabel>Recent {data.title.toLowerCase()}</SectionLabel>
              <h2
                className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mt-3 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
              >
                Pieces from the <em>last quarter</em>
              </h2>
            </div>

            {/* 3-col grid (matches design's explicit grid-template-columns:repeat(3,1fr)) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.examples.slice(0, 3).map((ex, i) => (
                <article
                  key={ex.title}
                  className="group bg-parchment-50 border border-border-light rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-md hover:border-border-medium transition-all"
                >
                  {/* Image — ds-ph-character with hue-rotate variations (matches design lines 248/252/256) */}
                  <div
                    className="relative aspect-[4/5]"
                    style={{
                      background: PH_CHARACTER,
                      filter: i === 1 ? 'hue-rotate(20deg)' : i === 2 ? 'hue-rotate(-40deg)' : undefined,
                    }}
                  >
                    {/* Painterly badge — top-right, parchment-50/92 + gold-300 border */}
                    <span className="absolute top-3 right-3 inline-block bg-parchment-50/[0.92] backdrop-blur-md border border-gold-300 text-gold-700 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2.5 py-1 rounded-full">
                      Painterly
                    </span>
                  </div>
                  {/* Body */}
                  <div className="p-5">
                    <h4 className="font-display text-[1.125rem] font-semibold text-ink-900 leading-snug mb-1">
                      {ex.title}
                    </h4>
                    <div className="text-[0.8125rem] text-ink-500">{ex.meta}</div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button href="/portfolio" variant="outline" size="md">
                See all {data.title.toLowerCase()} <ArrowRightSm />
              </Button>
            </div>
          </Container>
        </section>

        {/* 07. FAQ — .hp-faq-layout 1fr 1.8fr split, plus-icon details accordion */}
        <section className="py-16 md:py-20">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 max-w-[1080px] mx-auto">
              {/* LEFT: eyebrow + h2 + p + "See full FAQ →" link */}
              <div>
                <SectionLabel>About this service</SectionLabel>
                <h2
                  className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mt-3 mb-4 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(1.875rem, 3.5vw, 2.5rem)' }}
                >
                  {data.title}, <em>specifically</em>
                </h2>
                <p className="text-[1.0625rem] text-ink-500 leading-[1.6] mb-6">
                  Common questions about the {data.title.toLowerCase()} process — what&apos;s possible, what isn&apos;t, and where the limits land.
                </p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.12em] font-semibold text-burgundy-700 hover:gap-3 transition-all"
                >
                  See full FAQ <ArrowRightSm />
                </Link>
              </div>

              {/* RIGHT: accordion */}
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
                        <span className="font-display text-[1.125rem] md:text-[1.25rem] font-semibold text-ink-900 leading-snug">
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
                          <PlusIcon />
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

        {/* 08. CTA strip — dark tome closer (.pg-cta-strip) */}
        <section className="bg-tome-950 text-cream-50 py-20 text-center">
          <Container>
            <h2
              className="font-display font-semibold text-cream-50 leading-[1.15] tracking-tight mb-4 mx-auto max-w-[28ch] [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
              style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
            >
              Ready to <em>commission</em> a {data.title.toLowerCase().endsWith('s') ? data.title.toLowerCase().slice(0, -1) : data.title.toLowerCase()}?
            </h2>
            <p className="text-base text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-7">
              Three minutes to brief. Quote within 48 hours. First sketch within a week.
            </p>
            <div className="inline-flex flex-wrap justify-center gap-3">
              <Button href="/order" variant="gold" size="lg">
                Commission {data.title.toLowerCase()} <ArrowRightSm />
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
