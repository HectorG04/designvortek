'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import { PORTFOLIO_CATEGORIES, PORTFOLIO_FEATURED } from '@/lib/constants'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function PortfolioStrip() {
  const [active, setActive] = useState<string>('All')

  const filtered = active === 'All'
    ? PORTFOLIO_FEATURED
    : PORTFOLIO_FEATURED.filter((p) => p.category === active)

  return (
    <section className="bg-parchment-100 py-24 md:py-32">
      <Container>
        {/* Section head */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="text-center max-w-[720px] mx-auto mb-12"
        >
          <motion.div variants={fadeUp} className="mb-4 flex justify-center">
            <SectionLabel>Recent work</SectionLabel>
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
            Crafted with <em className="font-display italic font-medium text-burgundy-700">care</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-ink-500 mt-4 leading-relaxed">
            A small slice of the last few months. Each piece took 2&ndash;4 weeks of close collaboration with the client.
          </motion.p>
        </motion.div>

        {/* Filter chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center flex-wrap gap-2 mb-12"
        >
          {PORTFOLIO_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-xs uppercase tracking-[0.12em] font-semibold transition-all',
                active === cat
                  ? 'bg-burgundy-700 text-cream-50 shadow-sm'
                  : 'bg-parchment-50 text-ink-700 border border-border-light hover:border-burgundy-700 hover:text-burgundy-700'
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                whileHover={{ y: -3 }}
                className={cn(
                  'group relative rounded-xl overflow-hidden border border-border-light cursor-pointer',
                  'hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow',
                  item.tall && 'row-span-2',
                  `bg-gradient-to-br ${item.gradient}`,
                  item.tall ? 'aspect-[4/10]' : 'aspect-[4/5]'
                )}
              >
                {/* Placeholder content */}
                <div className="absolute inset-0 flex items-center justify-center opacity-15">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm" />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-tome-950/85 via-tome-950/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <div className="text-[0.625rem] uppercase tracking-[0.15em] font-bold text-gold-glow mb-1">
                    {item.category}
                  </div>
                  <div className="font-display text-base lg:text-lg font-semibold text-cream-50 leading-tight">
                    {item.title}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button href="/portfolio" variant="outline" size="md">
            See full gallery <ArrowRight size={14} strokeWidth={1.8} />
          </Button>
        </div>
      </Container>
    </section>
  )
}
