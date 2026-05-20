'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

const TRUST_ITEMS = [
  'No commitment',
  '100% satisfaction focus',
  'Secure payments',
]

export default function CTACloser() {
  return (
    <section className="relative bg-tome-950 text-cream-50 py-16 md:py-32 overflow-hidden">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[100px] left-[10%] w-[500px] h-[500px] rounded-full bg-gold-500 blur-[80px] opacity-[0.18]"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-[150px] right-[10%] w-[500px] h-[500px] rounded-full bg-burgundy-700 blur-[80px] opacity-[0.18]"
        />
      </div>

      <PaperTexture variant="cream" opacity={0.4} />

      <div className="relative z-[1] max-w-[720px] mx-auto px-6 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {/* Compass mark */}
          <motion.div
            variants={fadeUp}
            className="inline-flex w-14 h-14 items-center justify-center rounded-full border border-gold-glow/35 text-gold-glow mb-8"
          >
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="0.8" />
              <path d="M16 3 L18 16 L16 29 L14 16 Z M3 16 L16 14 L29 16 L16 18 Z" fill="currentColor" />
              <circle cx="16" cy="16" r="1.6" fill="var(--color-tome-950, #1A130C)" />
            </svg>
          </motion.div>

          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight mb-5"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}
          >
            Ready to bring your <em className="font-display italic font-medium text-gold-glow">vision</em> to life?
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-lg text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-8"
          >
            Tell us about the character, the campaign, or the gift. We&rsquo;ll send a quote within 48 hours — no commitment until you&rsquo;re ready.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="inline-flex flex-wrap justify-center gap-[14px] mb-8">
            <Button href="/order" variant="gold" size="lg">
              Start commission <ArrowRight size={14} strokeWidth={1.8} />
            </Button>
            <Button href="/contact" variant="outline-cream" size="lg">
              Ask a question
            </Button>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            variants={fadeUp}
            className="inline-flex flex-wrap justify-center gap-6 pt-6 border-t border-cream-50/[0.12] text-sm text-cream-200"
          >
            {TRUST_ITEMS.map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <Check size={14} strokeWidth={1.8} className="text-gold-glow" />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
