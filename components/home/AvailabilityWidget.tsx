'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
import SectionLabel from '@/components/ui/SectionLabel'
import PaperTexture from '@/components/decor/PaperTexture'
import { LinkButton } from '@/components/ui/Button'
import { CURRENT_AVAILABILITY } from '@/lib/constants'

export default function AvailabilityWidget() {
  const openSlots = CURRENT_AVAILABILITY.slots.filter((s) => !s.booked)
  const bookedCount = CURRENT_AVAILABILITY.slots.filter((s) => s.booked).length
  const remaining = openSlots.length

  return (
    <section className="relative overflow-hidden bg-parchment-200 py-16 md:py-32">
      <PaperTexture variant="parchment" opacity={0.4} />

      <Container className="relative">
        <SectionHead
          eyebrow="Availability"
          title={<>Currently open for <em>commissions</em></>}
          description="We take a fixed number of pieces each month so every commission gets the attention it deserves."
        />

        {/* Slot card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-parchment-50 border border-border-light rounded-3xl max-w-[760px] mx-auto shadow-md px-6 py-8 md:px-14 md:py-12"
        >
          {/* Month head */}
          <div className="text-center mb-6">
            <div className="mb-3 flex justify-center">
              <SectionLabel>{CURRENT_AVAILABILITY.month}</SectionLabel>
            </div>
            <h3 className="font-display text-[2.5rem] font-semibold text-ink-900 leading-[1.05]">
              {remaining} slots remaining
            </h3>
          </div>

          {/* Slot row */}
          <div
            className="flex items-center justify-center gap-[14px] py-6"
            role="list"
          >
            {CURRENT_AVAILABILITY.slots.map((slot, i) => {
              if (slot.booked) {
                return (
                  <div
                    key={slot.num}
                    role="listitem"
                    aria-label={`Slot ${slot.num}, booked`}
                    className="w-16 h-16 rounded-full flex-shrink-0 bg-burgundy-700 text-cream-50 flex items-center justify-center"
                  >
                    <Check size={24} strokeWidth={2.4} />
                  </div>
                )
              }
              return (
                <motion.button
                  key={slot.num}
                  role="listitem"
                  aria-label={`Slot ${slot.num}, click to reserve`}
                  className="w-16 h-16 rounded-full flex-shrink-0 bg-transparent border-2 border-burgundy-700 text-burgundy-700 flex items-center justify-center cursor-pointer transition-colors hover:bg-burgundy-100"
                  animate={{
                    boxShadow: [
                      '0 0 0 0 rgba(214,196,178,1)',
                      '0 0 0 6px rgba(107,31,42,0.06)',
                      '0 0 0 0 rgba(214,196,178,1)',
                    ],
                    scale: [1, 1.04, 1],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: [0.22, 1, 0.36, 1],
                    delay: i * 0.3,
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="font-display text-[1.25rem] font-semibold">
                    {slot.num}
                  </span>
                </motion.button>
              )
            })}
          </div>

          {/* Footer line */}
          <div className="text-center text-base text-ink-500 px-3 pt-3 pb-6">
            <strong className="text-ink-700 font-semibold">{bookedCount} of {CURRENT_AVAILABILITY.total}</strong> {CURRENT_AVAILABILITY.month.split(' ')[0]} slots booked &middot; {remaining} remaining &middot; June waitlist now open
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-center gap-[14px]">
            <LinkButton href="/order" variant="gold" size="md">
              Reserve a May slot
            </LinkButton>
            <LinkButton href="/order" variant="outline" size="md">
              Join June waitlist
            </LinkButton>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
