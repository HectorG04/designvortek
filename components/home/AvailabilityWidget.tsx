'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'
import { CURRENT_AVAILABILITY } from '@/lib/constants'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function AvailabilityWidget() {
  const open = CURRENT_AVAILABILITY.slots.filter((s) => !s.booked).length
  const booked = CURRENT_AVAILABILITY.total - open

  return (
    <section className="relative bg-parchment-200 py-16 md:py-32 overflow-hidden">
      <PaperTexture variant="parchment" opacity={0.4} />

      <Container className="relative">
        {/* Section head */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="text-center max-w-[720px] mx-auto mb-16"
        >
          <motion.div variants={fadeUp} className="mb-4 flex justify-center">
            <SectionLabel>Availability</SectionLabel>
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
            Currently open for <em className="font-display italic font-medium text-burgundy-700">commissions</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-ink-500 mt-4 leading-relaxed">
            We take a fixed number of pieces each month so every commission gets the attention it deserves.
          </motion.p>
        </motion.div>

        {/* Slot card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="bg-parchment-50 border border-border-light rounded-3xl px-6 py-8 md:px-14 md:py-12 max-w-[760px] mx-auto"
          style={{ boxShadow: '0 4px 12px rgba(30, 20, 8, 0.08)' }}
        >
          {/* Month head */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-[10px] mb-2">
              <span className="h-px w-6 bg-burgundy-700" aria-hidden="true" />
              <span className="font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                {CURRENT_AVAILABILITY.month}
              </span>
            </div>
            <h3 className="font-display text-[2.5rem] font-semibold text-ink-900 leading-[1.05]">
              {open} {open === 1 ? 'slot' : 'slots'} remaining
            </h3>
          </div>

          {/* Slot row */}
          <div className="flex items-center justify-center gap-[14px] py-6" role="list">
            {CURRENT_AVAILABILITY.slots.map((slot, i) => {
              if (slot.booked) {
                return (
                  <div
                    key={slot.num}
                    role="listitem"
                    aria-label={`Slot ${slot.num}, booked`}
                    className="w-16 h-16 rounded-full bg-burgundy-700 text-cream-50 flex items-center justify-center flex-shrink-0"
                  >
                    <Check size={24} strokeWidth={2.4} />
                  </div>
                )
              }
              return (
                <motion.button
                  key={slot.num}
                  type="button"
                  aria-label={`Slot ${slot.num}, click to reserve`}
                  role="listitem"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{
                    boxShadow: [
                      '0 0 0 0 #F3D6D9',
                      '0 0 0 6px rgba(107, 31, 42, 0.06)',
                      '0 0 0 0 #F3D6D9',
                    ],
                    scale: [1, 1.04, 1],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: [0.22, 1, 0.36, 1], delay: i * 0.3 }}
                  className={cn(
                    'w-16 h-16 rounded-full flex-shrink-0',
                    'bg-transparent border-2 border-burgundy-700 text-burgundy-700',
                    'flex items-center justify-center font-display',
                    'hover:bg-burgundy-100 transition-colors cursor-pointer'
                  )}
                  onClick={() => {
                    window.location.href = '/order'
                  }}
                >
                  <span className="font-display text-[1.25rem] font-semibold">{slot.num}</span>
                </motion.button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="text-center text-ink-500 text-base pt-3 pb-6">
            {booked} of {CURRENT_AVAILABILITY.total} {CURRENT_AVAILABILITY.month.split(' ')[0]} slots booked · {open} remaining · June waitlist now open
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-[14px]">
            <Button href="/order" variant="gold" size="md">
              Reserve a {CURRENT_AVAILABILITY.month.split(' ')[0]} slot
            </Button>
            <Button href="/order" variant="outline" size="md">
              Join June waitlist
            </Button>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
