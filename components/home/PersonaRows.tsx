'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import { PERSONAS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const personaBgClasses: Record<string, string> = {
  'persona-player': 'bg-[radial-gradient(ellipse_at_35%_25%,rgba(232,200,128,0.65),transparent_55%),radial-gradient(ellipse_at_65%_75%,rgba(107,31,42,0.75),transparent_60%),linear-gradient(135deg,#2a1810,#3e1218_60%,#1a130c)]',
  'persona-dm':     'bg-[radial-gradient(ellipse_at_70%_30%,rgba(212,162,76,0.6),transparent_55%),radial-gradient(ellipse_at_30%_80%,rgba(31,77,58,0.65),transparent_60%),linear-gradient(160deg,#1F4D3A,#3e1218,#1a130c)]',
  'persona-gift':   'bg-[radial-gradient(ellipse_at_50%_30%,rgba(243,214,217,0.55),transparent_60%),radial-gradient(ellipse_at_30%_80%,rgba(201,160,74,0.5),transparent_60%),linear-gradient(160deg,#6B1F2A,#8A2A35_70%,#3e1218)]',
}

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
}

export default function PersonaRows() {
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
            <SectionLabel>Who we make art for</SectionLabel>
          </motion.div>
          <motion.h2 variants={fadeUp} className="font-display text-[2rem] md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
            Three kinds of <em className="font-display italic font-medium text-burgundy-700">storytellers</em>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-ink-500 mt-4 leading-[1.6]">
            We&rsquo;ve spent years working alongside the people who care most about their characters. Here&rsquo;s who usually finds us.
          </motion.p>
        </motion.div>

        {/* Persona rows */}
        <div className="flex flex-col gap-16 max-w-[1100px] mx-auto">
          {PERSONAS.map((p) => (
            <motion.div
              key={p.num}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className={cn(
                'grid grid-cols-1 gap-6 items-center lg:grid-cols-[1fr_1.1fr] lg:gap-14',
                p.reverse && 'lg:grid-cols-[1.1fr_1fr]'
              )}
            >
              {/* Image */}
              <motion.div
                variants={fadeUp}
                className={cn(
                  'relative rounded-2xl overflow-hidden aspect-[5/4] border border-border-light flex items-end p-5',
                  personaBgClasses[p.bg],
                  p.reverse && 'lg:order-2'
                )}
              >
                <span className="inline-block bg-tome-950/65 backdrop-blur-md border border-cream-50/15 text-cream-50 text-[0.6875rem] tracking-[0.1em] uppercase font-mono px-2.5 py-1.5 rounded-sm">
                  {p.tag}
                </span>
              </motion.div>

              {/* Text */}
              <motion.div variants={fadeUp} className={cn(p.reverse && 'lg:order-1')}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px w-7 bg-gold-500" aria-hidden="true" />
                  <span className="font-display text-[0.875rem] font-semibold text-gold-700 tracking-[0.15em]">{p.num}</span>
                </div>
                <h3 className="font-display text-[1.875rem] md:text-[2.25rem] font-semibold text-ink-900 leading-[1.1] tracking-tight mb-2">
                  {p.title}{' '}
                  <em className="font-display italic font-medium text-burgundy-700">{p.titleEm}</em>
                  {'titleAfter' in p && p.titleAfter ? p.titleAfter : ''}
                </h3>
                <p className="font-accent text-[1.375rem] text-burgundy-700 mb-4">{p.sub}</p>
                <p className="text-ink-700 leading-[1.7] mb-5 max-w-[52ch]">{p.body}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-[5px] px-2.5 py-1 rounded-full bg-parchment-100 border border-border-light text-[0.75rem] text-ink-700"
                    >
                      <Check size={11} strokeWidth={2} className="text-gold-700" />
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={p.href}
                  className="inline-flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 hover:text-burgundy-500 hover:gap-3.5 transition-all duration-150"
                >
                  {p.cta} <ArrowRight size={14} strokeWidth={1.8} />
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
