'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
import { PERSONAS } from '@/lib/constants'
import { cn } from '@/lib/utils'

/**
 * Persona image backgrounds — literal port of
 *   .hp-persona-img-player / -dm / -gift from homepage.css (lines 1079-1096)
 * Applied via inline style so Tailwind doesn't choke on the multi-layer gradient.
 */
const personaBackgrounds: Record<string, string> = {
  'persona-player':
    'radial-gradient(ellipse at 35% 25%, rgba(232,200,128,0.65), transparent 55%), radial-gradient(ellipse at 65% 75%, rgba(107,31,42,0.75), transparent 60%), linear-gradient(135deg, #2a1810, #3e1218 60%, #1a130c)',
  'persona-dm':
    'radial-gradient(ellipse at 70% 30%, rgba(212,162,76,0.6), transparent 55%), radial-gradient(ellipse at 30% 80%, rgba(31,77,58,0.65), transparent 60%), linear-gradient(160deg, #1F4D3A, #3e1218, #1a130c)',
  'persona-gift':
    'radial-gradient(ellipse at 50% 30%, rgba(243,214,217,0.55), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(201,160,74,0.5), transparent 60%), linear-gradient(160deg, #6B1F2A, #8A2A35 70%, #3e1218)',
}

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function PersonaRows() {
  return (
    <section className="bg-parchment-50 py-16 md:py-32">
      <Container>
        <SectionHead
          eyebrow="Who we make art for"
          title={<>Three kinds of <em>storytellers</em></>}
          description="We've spent years working alongside the people who care most about their characters. Here's who usually finds us."
        />

        {/* Rows: flex col gap 64, max 1100px centered */}
        <div className="flex flex-col gap-16 max-w-[1100px] mx-auto">
          {PERSONAS.map((p) => (
            <motion.div
              key={p.num}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className={cn(
                // Mobile: 1 col, gap 24px. Desktop (≥1024): asymmetric grid 1fr / 1.1fr, gap 56px
                'grid grid-cols-1 gap-6 items-center lg:gap-14',
                p.reverse
                  ? 'lg:grid-cols-[1.1fr_1fr]'
                  : 'lg:grid-cols-[1fr_1.1fr]'
              )}
            >
              {/* Image — aspect 5/4, rounded-2xl, 1px border, padding 20px */}
              <motion.div
                variants={fadeUp}
                className={cn(
                  'relative rounded-2xl overflow-hidden aspect-[5/4] border border-border-light flex items-end p-5',
                  p.reverse && 'lg:order-2'
                )}
                style={{ background: personaBackgrounds[p.bg] }}
              >
                <span className="inline-block font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-cream-50 bg-tome-950/[0.65] backdrop-blur-md border border-cream-50/[0.15] px-2.5 py-1.5 rounded-sm">
                  {p.tag}
                </span>
              </motion.div>

              {/* Text */}
              <motion.div
                variants={fadeUp}
                className={cn(p.reverse && 'lg:order-1')}
              >
                {/* Num: 28px gold-500 rule + label */}
                <div className="flex items-center gap-3 mb-3">
                  <span
                    aria-hidden="true"
                    className="h-px w-7 bg-gold-500"
                  />
                  <span className="font-display text-[0.875rem] font-semibold text-gold-700 tracking-[0.15em]">
                    {p.num}
                  </span>
                </div>

                {/* Title: 2.25rem font-display semibold ink-900, em italic burgundy-700 */}
                <h3 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-[1.1] tracking-tight mb-2">
                  {p.title}{' '}
                  <em className="font-display italic font-medium text-burgundy-700">
                    {p.titleEm}
                  </em>
                  {'titleAfter' in p && p.titleAfter ? p.titleAfter : ''}
                </h3>

                {/* Sub: Caveat italic 1.375rem burgundy-700 */}
                <p className="font-accent text-2xl text-burgundy-700 mb-4">
                  {p.sub}
                </p>

                {/* Body: text-body-md ink-700 line-height 1.7 max 52ch */}
                <p className="text-base text-ink-700 leading-[1.7] mb-5 max-w-[52ch]">
                  {p.body}
                </p>

                {/* Tag pills */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-parchment-100 border border-border-light text-xs text-ink-700"
                    >
                      <Check size={11} strokeWidth={2} className="text-gold-700" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* CTA: uppercase burgundy-700 with arrow */}
                <Link
                  href={p.href}
                  className="inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 hover:text-burgundy-500 hover:gap-3.5 transition-all duration-150"
                >
                  {p.cta} <ArrowRight size={14} strokeWidth={1.8} />
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
