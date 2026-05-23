'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import Button, { LinkButton } from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'

const TRUST = [
  'No commitment',
  '100% satisfaction focus',
  'Secure payments',
]

export default function CTACloser() {
  return (
    <section className="relative overflow-hidden bg-tome-950 text-cream-50 py-16 md:py-32 text-center">
      {/* Orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          className="absolute -top-[100px] left-[10%] w-[500px] h-[500px] rounded-full bg-gold-500 opacity-[0.18] blur-[80px]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-[150px] right-[10%] w-[500px] h-[500px] rounded-full bg-burgundy-700 opacity-[0.18] blur-[80px]"
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <PaperTexture variant="cream" opacity={0.4} />

      <div className="relative z-[1] max-w-[720px] mx-auto px-6">
        {/* Compass mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex w-14 h-14 items-center justify-center rounded-full border border-gold-glow/[0.35] text-gold-glow mb-8"
          aria-hidden="true"
        >
          <svg viewBox="0 0 32 32" width="28" height="28">
            <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <path
              d="M16 3 L18 16 L16 29 L14 16 Z M3 16 L16 14 L29 16 L16 18 Z"
              fill="currentColor"
            />
            <circle cx="16" cy="16" r="1.6" className="fill-tome-950" />
          </svg>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight mb-5 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)' }}
        >
          Ready to bring your <em>vision</em> to life?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="text-lg text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-8"
        >
          Tell us about the character, the campaign, or the gift. We&apos;ll send a quote within 48 hours &mdash; no commitment until you&apos;re ready.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="inline-flex flex-wrap justify-center gap-[14px] mb-8"
        >
          <LinkButton href="/order" variant="gold" size="lg">
            Start commission
            <ArrowRight size={14} strokeWidth={1.8} />
          </LinkButton>
          <Button variant="outline-cream" size="lg">
            Ask a question
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="inline-flex flex-wrap justify-center gap-6 pt-6 border-t border-cream-50/[0.12] text-sm text-cream-200"
        >
          {TRUST.map((label) => (
            <span key={label} className="inline-flex items-center gap-2">
              <Check size={14} strokeWidth={1.8} className="text-gold-glow" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
