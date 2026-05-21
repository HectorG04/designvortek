'use client'

import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'
import ProtectedImage from '@/components/ui/ProtectedImage'
import { HERO_THUMBS } from '@/lib/constants'
import { cn } from '@/lib/utils'

/* =============================================================================
   HERO — literal port of Homepage.html lines 41-116 and the .hp-hero* rules in
   homepage.css (lines 137-461).

   Section:    min-h-screen, tome-950 bg, overflow-hidden, padding 140px 0 80px,
               flex items-center, color cream-50
   Orbs:       600×600 gold-500 top-left @ blur-80 opacity-0.18  (14s drift)
               700×700 burgundy-700 bottom-right same             (18s drift)
   Grain:      PaperTexture variant=cream opacity={0.5}
   Grid:       relative z-1, max-w 1280, px 48 / 24 mobile,
               2 cols desktop, 1 col below 1024, gap 80→56→40
   Title:      Cormorant 600, clamp(2.75rem, 6vw, 5rem),
               letter-spacing -0.025em, line-height 1.02
   Title em:   italic, gold-glow, weight 500
   Subtitle:   text-body-lg (1.125rem) cream-200, leading 1.65, max-w 52ch, mb 36
   Trust:      flex gap 24, pt 24, border-top cream-50/[0.12], text 0.875rem cream-200
   Trust num:  Cormorant 1.5rem 600 gold-glow, leading 1
   Thumbs:     2×2 grid, gap 16, aspect 4/5, 1px gold-glow/[0.18] border, radius-xl,
               nth(2,3) margin-top 36px (offset rhythm)
   Thumb badge: bg tome-950/0.7, 1px gold-glow/0.3, 5/10 padding, full radius
   Avail badge: -top-3 -right-3, burgundy-700, cream-50, 10/18 padding (pl 14),
                gold-glow/0.35 border, shadow gold burgundy glow
   Dot:        8×8 gold-glow circle, ::after pulses scale 0.8→2.2 over 1.8s
   Scroll ind: bottom 32px, label letter-spacing 0.2em uppercase,
               1px line, linear-gradient transparent→gold-glow, scaleY pulse
   ============================================================================= */

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}

const thumbIn = {
  hidden:  { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
}

// 5-pointed star (HTML lines 73-77 — viewBox 0 0 24 24, single path)
const StarSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
  </svg>
)

// Arrow-right (HTML line 61)
const ArrowRightSvg = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export default function Hero() {
  return (
    <section
      className="relative flex min-h-screen items-center overflow-hidden bg-tome-950 pb-20 pt-[140px] text-cream-50"
      aria-label="Hero"
    >
      {/* === Ambient gradient orbs (.hp-hero-orbs) === */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <motion.div
          animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-[150px] -top-[100px] h-[600px] w-[600px] rounded-full bg-gold-500 opacity-[0.18] blur-[80px]"
        />
        <motion.div
          animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-[200px] -right-[200px] h-[700px] w-[700px] rounded-full bg-burgundy-700 opacity-[0.18] blur-[80px]"
        />
      </div>

      {/* === Aged paper grain overlay (.hp-hero-grain) === */}
      <PaperTexture variant="cream" opacity={0.5} />

      {/* === Grid (.hp-hero-grid) === */}
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-center gap-10 md:gap-14 lg:grid-cols-2 lg:gap-20">

          {/* ============ LEFT: Text column ============ */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {/* Eyebrow (.ds-eyebrow with ::before dash) */}
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-[10px] text-gold-glow"
            >
              <span aria-hidden="true" className="h-px w-6 bg-gold-glow" />
              <span className="font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em]">
                Premium Art Commissions · Since 2022
              </span>
            </motion.div>

            {/* Title — clamp(2.75rem, 6vw, 5rem) · -0.025em · 1.02 */}
            <motion.h1
              variants={fadeUp}
              className="mb-6 font-display font-semibold leading-[1.02] text-cream-50"
              style={{ fontSize: 'clamp(2.75rem, 6vw, 5rem)', letterSpacing: '-0.025em' }}
            >
              Bring your<br />
              <em className="font-display font-medium italic text-gold-glow">character</em> to life.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mb-9 max-w-[52ch] text-[1.125rem] leading-[1.65] text-cream-200"
            >
              Painterly TTRPG portraits, VTT tokens, and party illustrations. Crafted by hand,
              by humans &mdash; not generated, never traced.
            </motion.p>

            {/* CTAs (.hp-hero-ctas — flex gap 14, mb 40) */}
            <motion.div variants={fadeUp} className="mb-10 flex flex-wrap gap-[14px]">
              <Button href="/order" variant="gold" size="lg">
                Start commission
                <ArrowRightSvg />
              </Button>
              <Button href="/portfolio" variant="outline-cream" size="lg">
                View portfolio
              </Button>
            </motion.div>

            {/* Trust strip (.hp-hero-trust) */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-6 border-t border-cream-50/[0.12] pt-6 text-[0.875rem] text-cream-200"
            >
              <div className="inline-flex items-center gap-2">
                <span className="font-display text-[1.5rem] font-semibold leading-none text-gold-glow">
                  500+
                </span>
                <span>commissions delivered</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="font-display text-[1.5rem] font-semibold leading-none text-gold-glow">
                  4.9
                </span>
                <span className="flex gap-px text-gold-glow">
                  <StarSvg /><StarSvg /><StarSvg /><StarSvg /><StarSvg />
                </span>
                <span>across 247 reviews</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="font-display text-[1.5rem] font-semibold leading-none text-gold-glow">
                  48h
                </span>
                <span>average response</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ============ RIGHT: Artwork column ============ */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { delayChildren: 0.2, staggerChildren: 0.12 } },
            }}
            className="relative"
          >
            {/* Floating availability badge (.hp-hero-avail) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              role="status"
              className="absolute -right-3 -top-3 z-20 inline-flex items-center gap-[10px] rounded-full border border-gold-glow/[0.35] bg-burgundy-700 py-[10px] pl-[14px] pr-[18px] font-body text-[0.8125rem] font-medium text-cream-50"
              style={{ boxShadow: '0 8px 24px rgba(62, 18, 24, 0.4)' }}
            >
              <span className="relative inline-block h-2 w-2 rounded-full bg-gold-glow">
                <motion.span
                  animate={{ scale: [0.8, 2.2], opacity: [0.5, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-[-4px] rounded-full bg-gold-glow"
                />
              </span>
              <span className="leading-none">
                <span className="mr-1 font-display text-[1rem] font-semibold text-gold-glow">
                  2
                </span>
                slots open · May 2026
              </span>
            </motion.div>

            {/* 2×2 thumb grid (.hp-hero-thumbs) — nth(2,3) margin-top 36px */}
            <div className="grid grid-cols-2 gap-4">
              {HERO_THUMBS.map((thumb, i) => {
                const isOffset = i === 1 || i === 2
                return (
                  <motion.div
                    key={thumb.label}
                    variants={thumbIn}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    className={cn(
                      'relative aspect-[4/5] cursor-pointer overflow-hidden rounded-xl',
                      'flex items-start p-[14px]',
                      'border border-gold-glow/[0.18] hover:border-gold-glow/40',
                      'transition-[box-shadow,border-color] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
                      'hover:shadow-[0_8px_24px_rgba(201,160,74,0.18)]',
                      `bg-gradient-to-br ${thumb.gradient}`,
                      isOffset && 'mt-9'
                    )}
                  >
                    {/* Real artwork overlay — fills the thumb, gradient
                        stays behind for any transparent edges */}
                    {thumb.image ? (
                      <ProtectedImage
                        src={thumb.image}
                        alt={thumb.alt ?? thumb.label}
                        fill
                        sizes="(min-width: 1024px) 280px, 45vw"
                        className="pointer-events-none object-cover"
                        priority={i === 0}
                      />
                    ) : (
                      /* Fallback painterly placeholder mass for thumbs
                         without an image yet */
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
                        <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm" />
                      </div>
                    )}
                    {/* badge (.hp-hero-badge) — sits above the image */}
                    <span className="relative z-10 inline-block rounded-full border border-gold-glow/30 bg-tome-950/70 px-[10px] py-[5px] font-body text-[0.625rem] font-bold uppercase tracking-[0.15em] text-cream-50 backdrop-blur-md">
                      {thumb.label}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

        </div>
      </div>

      {/* === Scroll indicator (.hp-hero-scroll) === */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-cream-200"
      >
        <span>Scroll</span>
        <motion.span
          animate={{ scaleY: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '1px',
            height: '36px',
            background: 'linear-gradient(180deg, transparent, var(--color-gold-glow))',
            transformOrigin: 'top',
          }}
        />
      </motion.div>
    </section>
  )
}
