'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowRight } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Markdown from '@/components/ui/Markdown'
import { HOMEPAGE_FAQ } from '@/lib/constants'

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  // FAQPage JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOMEPAGE_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        // Strip basic markdown for SEO schema (Google wants plain text)
        text: item.a.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'),
      },
    })),
  }

  return (
    <section className="bg-parchment-50 py-16 md:py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 max-w-[1080px] mx-auto">
          {/* Side column */}
          <div>
            <div className="mb-3">
              <SectionLabel>Common questions</SectionLabel>
            </div>
            <h2 className="font-display text-[2rem] md:text-[clamp(2rem,4vw,3rem)] font-semibold text-ink-900 leading-[1.1] tracking-tight mb-4 [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700">
              Quick answers, no <em>fluff</em>
            </h2>
            <p className="text-base text-ink-500 leading-[1.65] mb-5">
              The questions clients ask most. Don&apos;t see yours? Send a note &mdash; we usually reply within 48 hours.
            </p>
            <Link
              href="/faq"
              className="group inline-flex items-center gap-2 font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 transition-[gap] duration-150 hover:gap-[14px]"
            >
              See full FAQ
              <ArrowRight size={14} strokeWidth={1.8} />
            </Link>
          </div>

          {/* Accordion list */}
          <div className="flex flex-col gap-3">
            {HOMEPAGE_FAQ.map((item, i) => {
              const isOpen = openIdx === i
              return (
                <div
                  key={item.q}
                  className={`overflow-hidden rounded-xl border transition-[background-color,border-color,box-shadow] duration-150 ${
                    isOpen
                      ? 'bg-parchment-50 border-border-medium shadow-sm'
                      : 'bg-parchment-100 border-border-light hover:border-border-medium'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer font-display text-xl font-semibold text-ink-900 leading-[1.3]"
                  >
                    <span>{item.q}</span>
                    <span
                      aria-hidden="true"
                      className={`w-8 h-8 rounded-full inline-flex items-center justify-center flex-shrink-0 transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isOpen
                          ? 'bg-burgundy-700 text-cream-50 border border-burgundy-700 rotate-45'
                          : 'bg-parchment-50 text-burgundy-700 border border-border-medium'
                      }`}
                    >
                      <Plus size={14} strokeWidth={2.2} />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="px-6 pb-5 text-base text-ink-700 leading-[1.7] max-w-[64ch]">
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
  )
}
