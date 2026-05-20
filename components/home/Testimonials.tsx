'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
import { TESTIMONIALS } from '@/lib/constants'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function Testimonials() {
  return (
    <section className="bg-parchment-100 py-16 md:py-32">
      <Container>
        <SectionHead
          eyebrow="What clients say"
          title={<>Words from the <em>table</em></>}
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          {TESTIMONIALS.map((t) => (
            <motion.article
              key={t.name}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="relative rounded-2xl border border-border-light p-8 flex flex-col hover:border-border-medium hover:shadow-md transition-[box-shadow,border-color] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                background:
                  'linear-gradient(155deg, var(--color-parchment-100), var(--color-parchment-50))',
              }}
            >
              {/* Quote glyph */}
              <svg
                viewBox="0 0 32 32"
                width="28"
                height="28"
                className="text-gold-500 mb-3"
                aria-hidden="true"
              >
                <path
                  d="M6 22 Q6 14 14 10 L13 13 Q9 15 9 22 Z M18 22 Q18 14 26 10 L25 13 Q21 15 21 22 Z"
                  fill="currentColor"
                />
              </svg>

              {/* Stars */}
              <div className="flex gap-0.5 text-gold-500 mb-[14px]">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} strokeWidth={0} fill="currentColor" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="font-display italic text-[1.125rem] text-ink-900 leading-[1.55] flex-1 m-0">
                {t.quote}
              </blockquote>

              {/* Divider */}
              <div className="w-8 h-px bg-gold-500 my-5" />

              {/* Attribution */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-burgundy-700 text-cream-50 flex items-center justify-center flex-shrink-0 font-display text-[0.875rem] font-semibold">
                  {t.initials}
                </div>
                <div>
                  <div className="text-[0.9375rem] font-semibold text-ink-900 leading-tight">
                    {t.name}
                  </div>
                  <div className="text-[0.8125rem] text-ink-500 mt-0.5">{t.role}</div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}
