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
            <SectionLabel>What we create</SectionLabel>
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
            Three signature <em className="font-display italic font-medium text-burgundy-700">services</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-ink-500 mt-4 leading-relaxed">
            Painterly portraits, virtual tokens, and group illustrations — each held to the same craft. Choose what fits, or commission something custom.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {FEATURED_SERVICES.map((service) => {
            const Icon = ICONS[service.icon]
            return (
              <motion.article
                key={service.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="group bg-parchment-100 border border-border-light rounded-2xl p-8 flex flex-col hover:border-border-medium hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-parchment-50 border border-border-light flex items-center justify-center mb-6 text-burgundy-700 group-hover:border-gold-500 transition-colors">
                  <Icon size={22} strokeWidth={1.5} />
                </div>

                {/* Title + sub */}
                <h4 className="font-display text-2xl font-semibold text-ink-900 leading-tight">{service.title}</h4>
                <p className="font-accent text-xl text-burgundy-700 mt-1 mb-4">{service.sub}</p>

                {/* Body */}
                <p className="text-ink-700 leading-relaxed mb-5">{service.body}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                      <Check size={14} strokeWidth={2.4} className="text-forest-700 mt-1 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Footer: price + link */}
                <div className="mt-auto pt-5 border-t border-border-light flex items-center justify-between">
                  <div>
                    <div className="text-[0.7rem] uppercase tracking-[0.15em] font-semibold text-ink-500">Starting at</div>
                    <div className="font-display text-2xl font-semibold text-burgundy-700">{service.price}</div>
                  </div>
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-1.5 text-[0.75rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 hover:text-burgundy-500 transition-all hover:gap-2.5"
                  >
                    Explore <ArrowRight size={14} strokeWidth={1.8} />
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
            className="inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 hover:text-burgundy-500 transition-all hover:gap-3.5"
          >
            See all five services <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </div>
      </Container>
    </section>
  )
}
