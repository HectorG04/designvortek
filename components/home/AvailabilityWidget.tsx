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
    <section className="relative bg-parchment-200 py-24 md:py-32 overflow-hidden">
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
          className="bg-parchment-50 border border-border-light rounded-3xl p-8 md:p-14 max-w-[760px] mx-auto"
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
            <h3 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.05]">
              {open} {open === 1 ? 'slot' : 'slots'} remaining
            </h3>
          </div>

          {/* Slot row */}
          <div className="flex items-center justify-center gap-3 py-6" role="list">
            {CURRENT_AVAILABILITY.slots.map((slot, i) => {
              if (slot.booked) {
                return (
                  <div
                    key={slot.num}
                    role="listitem"
                    aria-label={`Slot ${slot.num}, booked`}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-burgundy-700 text-cream-50 flex items-center justify-center"
                  >
                    <Check size={22} strokeWidth={2.4} />
                  </div>
                )
              }
              return (
                <motion.button
                  key={slot.num}
                  type="button"
                  aria-label={`Slot ${slot.num}, click to reserve`}
                  role="listitem"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(201, 160, 74, 0.45)',
                      '0 0 0 14px rgba(201, 160, 74, 0)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: i * 0.4 }}
                  className={cn(
                    'w-14 h-14 md:w-16 md:h-16 rounded-full',
                    'bg-parchment-50 border-[2px] border-gold-500 text-ink-900',
                    'flex items-center justify-center font-display text-xl font-semibold',
                    'hover:bg-gold-100 hover:border-gold-700 transition-colors cursor-pointer'
                  )}
                  onClick={() => {
                    window.location.href = '/order'
                  }}
                >
                  {slot.num}
                </motion.button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="text-center text-ink-500 text-[0.9375rem] mb-6">
            <span className="font-semibold text-ink-700">{booked} of {CURRENT_AVAILABILITY.total} {CURRENT_AVAILABILITY.month.split(' ')[0]} slots booked</span>
            {' '} · {open} remaining · June waitlist now open
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-3">
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
