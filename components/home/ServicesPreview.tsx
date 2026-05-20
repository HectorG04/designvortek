'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Star, Circle, Users } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import { FEATURED_SERVICES } from '@/lib/constants'

const ICONS = {
  star:  Star,
  token: Circle,
  party: Users,
} as const

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function ServicesPreview() {
  return (
    <section className="bg-parchment-50 py-16 md:py-32">
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
            <SectionLabel>What we create</SectionLabel>
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-[2rem] md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
            Three signature <em className="font-display italic font-medium text-burgundy-700">services</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-ink-500 mt-4 leading-[1.6]">
            Painterly portraits, virtual tokens, and group illustrations — each held to the same craft. Choose what fits, or commission something custom.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-1 min-[901px]:grid-cols-3 gap-6"
        >
          {FEATURED_SERVICES.map((service) => {
            const Icon = ICONS[service.icon]
            return (
              <motion.article
                key={service.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="group bg-parchment-50 border border-border-light rounded-2xl p-8 flex flex-col gap-3.5 hover:border-border-medium hover:shadow-gold transition-[box-shadow,border-color]"
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-lg bg-gold-100 flex items-center justify-center text-gold-700 mb-1">
                  <Icon size={22} strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h4 className="font-display text-2xl font-semibold text-ink-900 leading-[1.2]">{service.title}</h4>

                {/* Sub */}
                <p className="font-accent text-lg text-burgundy-700 -mt-1">{service.sub}</p>

                {/* Body */}
                <p className="text-ink-700 leading-[1.6] text-base">{service.body}</p>

                {/* Features */}
                <ul className="flex flex-col gap-2 list-none p-0 m-0">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[0.9375rem] text-ink-700">
                      <Check size={14} strokeWidth={2} className="text-gold-700 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Footer: price + link */}
                <div className="mt-auto pt-4 border-t border-border-light flex items-center justify-between gap-3 flex-nowrap">
                  <div className="inline-flex items-baseline gap-2.5 min-w-0">
                    <span className="font-body text-[0.625rem] font-bold uppercase tracking-[0.15em] text-gold-700 whitespace-nowrap">Starting at</span>
                    <span className="font-display text-[1.625rem] font-semibold text-ink-900 leading-none -tracking-[0.01em]">{service.price}</span>
                  </div>
                  <Link
                    href={service.href}
                    className="group/link inline-flex items-center gap-1.5 text-[0.75rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 hover:text-burgundy-500 hover:gap-2.5 transition-all duration-150"
                  >
                    Explore <ArrowRight size={12} strokeWidth={1.8} />
                  </Link>
                </div>
              </motion.article>
            )
          })}
        </motion.div>

        {/* Footer link */}
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 hover:text-burgundy-500 hover:gap-3.5 transition-all duration-150"
          >
            See all five services <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </div>
      </Container>
    </section>
  )
}
