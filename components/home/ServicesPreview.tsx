'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Star, Circle, Users } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
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
        <SectionHead
          eyebrow="What we create"
          title={<>Three signature <em>services</em></>}
          description="Hand-painted character art, VTT tokens, and party illustrations. Each held to the same craft. Browse all buckets for NPC packs, maps, subscriptions, and commercial work."
        />

        {/* Cards grid — .hp-services-grid: 3-col → 1-col under 900px */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {FEATURED_SERVICES.map((service) => {
            const Icon = ICONS[service.icon]
            return (
              <motion.article
                key={service.title}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="group bg-parchment-50 border border-border-light rounded-2xl p-8 flex flex-col gap-3.5 hover:border-border-medium hover:shadow-md transition-[box-shadow,border-color]"
              >
                {/* Icon: 44×44 rounded-md bg-gold-100 color gold-700 */}
                <div className="w-11 h-11 rounded-lg bg-gold-100 flex items-center justify-center text-gold-700 mb-1">
                  <Icon size={22} strokeWidth={1.5} />
                </div>

                {/* Title: font-display 1.5rem semibold ink-900 */}
                <h4 className="font-display text-2xl font-semibold text-ink-900 leading-[1.2]">
                  {service.title}
                </h4>

                {/* Sub: Caveat italic 1.125rem burgundy-700, margin-top -4px */}
                <p className="font-accent text-xl text-burgundy-700 -mt-1">
                  {service.sub}
                </p>

                {/* Body: text-body-md ink-700 1.6 line-height */}
                <p className="text-base text-ink-700 leading-relaxed">
                  {service.body}
                </p>

                {/* Feature list: gap-2, 0.9375rem ink-700, gold-700 check 14px */}
                <ul className="flex flex-col gap-2 list-none p-0 m-0">
                  {service.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-[0.9375rem] text-ink-700"
                    >
                      <Check
                        size={14}
                        strokeWidth={2.4}
                        className="text-gold-700 flex-shrink-0"
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Footer: pt-4 border-t — price + Explore link */}
                <div className="mt-auto pt-5 border-t border-border-light flex items-center justify-between gap-3 flex-nowrap">
                  <div className="inline-flex items-baseline gap-2.5 min-w-0">
                    <span className="font-body text-[0.625rem] font-bold uppercase tracking-[0.18em] text-ink-500 whitespace-nowrap">
                      Starting at
                    </span>
                    <span className="font-display text-[1.625rem] font-semibold text-ink-900 leading-none -tracking-[0.01em]">
                      {service.price}
                    </span>
                  </div>
                  <Link
                    href={service.href}
                    className="inline-flex items-center gap-1.5 text-[0.75rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 hover:text-burgundy-500 hover:gap-2.5 transition-all duration-150"
                  >
                    Explore <ArrowRight size={12} strokeWidth={1.8} />
                  </Link>
                </div>
              </motion.article>
            )
          })}
        </motion.div>

        {/* Footer link — .hp-services-foot */}
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 hover:text-burgundy-500 hover:gap-3.5 transition-all duration-150"
          >
            Browse every service bucket <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </div>
      </Container>
    </section>
  )
}
