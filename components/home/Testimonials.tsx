'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import { TESTIMONIALS } from '@/lib/constants'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function Testimonials() {
  return (
    <section className="bg-parchment-100 py-24 md:py-32">
      <Container>
        {/* Section head */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="text-center max-w-[720px] mx-auto mb-16"
        >
          <motion.div variants={fadeUp} className="mb-4 flex justify-center">
            <SectionLabel>What clients say</SectionLabel>
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
            Words from the <em className="font-display italic font-medium text-burgundy-700">table</em>
          </motion.h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          {TESTIMONIALS.map((t) => (
            <motion.article
              key={t.name}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="bg-parchment-50 border border-border-light rounded-2xl p-8 flex flex-col hover:border-border-medium hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow"
            >
              {/* Quote glyph */}
              <Quote size={32} className="text-gold-300 mb-4" strokeWidth={1.5} />

              {/* Stars */}
              <div className="flex gap-px mb-4 text-gold-500">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-ink-700 text-[0.9375rem] leading-[1.7] mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="h-px bg-border-light mb-5" aria-hidden="true" />

              {/* Attribution */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-semibold text-cream-50 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, var(--color-burgundy-700), var(--color-burgundy-500))' }}
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-display text-base font-semibold text-ink-900 leading-tight">{t.name}</div>
                  <div className="text-xs text-ink-500 mt-0.5">{t.role}</div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
