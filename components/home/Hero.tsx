'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Star, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'
import { HERO_THUMBS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

const thumbIn = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-tome-950 text-cream-50 pt-[140px] pb-20 flex items-center">

      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[100px] -left-[150px] w-[600px] h-[600px] rounded-full bg-gold-500 blur-[80px] opacity-[0.18]"
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-[200px] -right-[200px] w-[700px] h-[700px] rounded-full bg-burgundy-700 blur-[80px] opacity-[0.18]"
        />
      </div>

      {/* Cream-toned grain overlay */}
      <PaperTexture variant="cream" opacity={0.5} />

      <div className="relative z-10 w-full mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Text column */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-[10px]">
              <span className="h-px w-6 bg-gold-glow" aria-hidden="true" />
              <span className="font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-gold-glow">
                Premium Art Commissions · Since 2022
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-display font-semibold leading-[1.02] mb-6 text-cream-50"
              style={{ fontSize: 'clamp(2.75rem, 6vw, 5rem)', letterSpacing: '-0.025em' }}
            >
              Painterly portraits for{' '}
              <em className="not-italic font-display italic font-medium text-gold-glow">your character.</em>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="text-lg text-cream-200 leading-[1.65] max-w-[52ch] mb-9"
            >
              Hand-crafted character art, VTT tokens, party portraits and bespoke illustrations
              for D&amp;D players, DMs, indie creators and the wider TTRPG community. From $80.
              7–14 day turnaround. 2 revisions included.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3.5 mb-10">
              <Button href="/order" variant="gold" size="md">
                Start Commission
                <ArrowRight size={14} />
              </Button>
              <Button href="/portfolio" variant="outline-cream" size="md">
                See Portfolio
              </Button>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-6 pt-6 border-t border-cream-50/12 text-sm text-cream-200"
            >
              <div className="inline-flex items-center gap-2">
                <span className="font-display text-2xl font-semibold text-gold-glow leading-none">500+</span>
                <span>commissions delivered</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="font-display text-2xl font-semibold text-gold-glow leading-none">4.9</span>
                <span className="flex gap-px text-gold-glow">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </span>
                <span>across 247 reviews</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="font-display text-2xl font-semibold text-gold-glow leading-none">48h</span>
                <span>average response</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Artwork column */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { delayChildren: 0.2, staggerChildren: 0.12 } } }}
            className="relative"
          >
            {/* Floating availability badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -top-3 -right-3 z-20 inline-flex items-center gap-[10px] bg-burgundy-700 text-cream-50 rounded-full px-[18px] py-[10px] pl-[14px] border border-gold-glow/35"
              style={{ boxShadow: '0 8px 24px rgba(62, 18, 24, 0.4)' }}
            >
              <span className="relative inline-block w-2 h-2 rounded-full bg-gold-glow">
                <motion.span
                  animate={{ scale: [0.8, 2.2], opacity: [0.5, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-[-4px] rounded-full bg-gold-glow"
                />
              </span>
              <span className="text-[0.8125rem] font-medium leading-none">
                <span className="font-display text-base font-semibold text-gold-glow mr-1">2 of 5</span>
                slots open · June
              </span>
            </motion.div>

            {/* 2x2 thumb grid with offset rhythm */}
            <div className="grid grid-cols-2 gap-4">
              {HERO_THUMBS.map((thumb, i) => {
                const isOffset = i === 1 || i === 2 // 2nd and 3rd thumb shifted down 36px
                return (
                  <motion.div
                    key={thumb.label}
                    variants={thumbIn}
                    whileHover={{ y: -4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className={cn(
                      'relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer',
                      'border border-gold-glow/[0.18] hover:border-gold-glow/40',
                      'transition-shadow duration-250',
                      'hover:shadow-[0_8px_24px_rgba(201,160,74,0.32)]',
                      `bg-gradient-to-br ${thumb.gradient}`,
                      isOffset && 'mt-9'
                    )}
                  >
                    {/* Painterly placeholder content */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-25">
                      <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm" />
                    </div>

                    {/* Badge */}
                    <div className="absolute top-3.5 left-3.5">
                      <span className="inline-block bg-tome-950/70 backdrop-blur-md border border-gold-glow/30 text-cream-50 text-[0.625rem] font-bold uppercase tracking-[0.15em] px-2.5 py-1.5 rounded-full">
                        {thumb.label}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream-200/60"
        aria-hidden="true"
      >
        <span className="font-body text-[0.6rem] tracking-[0.25em] uppercase">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} className="text-gold-glow/60" />
        </motion.span>
      </motion.div>
    </section>
  )
}
