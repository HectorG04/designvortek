'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowRight } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import { HOMEPAGE_FAQ } from '@/lib/constants'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function FAQ() {
  // First item open by default
  const [open, setOpen] = useState<number | null>(0)

  // FAQPage JSON-LD schema (SEO)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOMEPAGE_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a.join(' '),
      },
    })),
  }

  return (
    <section className="bg-parchment-50 py-24 md:py-32">
      {/* JSON-LD for FAQPage schema (Google rich result eligible) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 max-w-[1080px] mx-auto">

          {/* Side column */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.div variants={fadeUp} className="mb-3">
              <SectionLabel>Common questions</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight mb-4"
            >
              Quick answers, no <em className="font-display italic font-medium text-burgundy-700">fluff</em>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-ink-500 leading-relaxed mb-5">
              The questions clients ask most. Don&rsquo;t see yours? Send a note — we usually reply within 48 hours.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 hover:text-burgundy-500 hover:gap-3.5 transition-all"
              >
                See full FAQ <ArrowRight size={14} strokeWidth={1.8} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Accordion list */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="flex flex-col gap-3"
          >
            {HOMEPAGE_FAQ.map((item, idx) => {
              const isOpen = open === idx
              return (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className={cn(
                    'rounded-xl border transition-colors',
                    isOpen
                      ? 'bg-parchment-50 border-border-medium shadow-sm'
                      : 'bg-parchment-100 border-border-light hover:border-border-medium'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="font-display text-lg md:text-xl font-semibold text-ink-900 leading-snug">
                      {item.q}
                    </span>
                    <span
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-all duration-250',
                        isOpen
                          ? 'bg-burgundy-700 text-cream-50 rotate-45'
                          : 'bg-parchment-50 text-burgundy-700 border border-border-medium'
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
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="px-6 pb-5 text-ink-700 leading-[1.7] max-w-[64ch] space-y-3">
                          {item.a.map((para, i) => (
                            <p key={i}>{para}</p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </motion.div>

        </div>
      </Container>
    </section>
  )
}
