'use client'

import { motion } from 'framer-motion'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import { PROCESS_STEPS } from '@/lib/constants'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function ProcessSteps() {
  return (
    <section className="bg-parchment-50 py-24 md:py-32">
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
            <SectionLabel>How it works</SectionLabel>
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
            From idea to artwork in <em className="font-display italic font-medium text-burgundy-700">four steps</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-ink-500 mt-4 leading-relaxed">
            Predictable, communicative, no surprises. You always know what&rsquo;s happening and when.
          </motion.p>
        </motion.div>

        {/* Steps with connecting gold line */}
        <div className="relative">
          {/* Horizontal connector line — desktop only */}
          <div
            className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px z-0"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--color-gold-300), var(--color-gold-500), var(--color-gold-300), transparent)',
            }}
            aria-hidden="true"
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
          >
            {PROCESS_STEPS.map((step) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className="text-center"
              >
                {/* Numbered circle */}
                <div className="w-14 h-14 rounded-full bg-parchment-50 border-[1.5px] border-gold-500 text-gold-700 inline-flex items-center justify-center mx-auto mb-5 font-display text-2xl font-semibold">
                  {step.num}
                </div>
                <h3 className="font-display text-2xl font-semibold text-ink-900 leading-[1.2] mb-2">
                  {step.title}
                </h3>
                <p className="text-[0.9375rem] text-ink-500 leading-[1.6] max-w-[22ch] mx-auto">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stat strip */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16 pt-8 border-t border-dashed border-border-light"
        >
          <span className="inline-flex items-baseline gap-2 text-[0.9375rem] text-ink-500">
            Average turnaround{' '}
            <strong className="font-display text-[1.25rem] font-semibold text-ink-900">7–14 days</strong>
          </span>
        </motion.div>
      </Container>
    </section>
  )
}
