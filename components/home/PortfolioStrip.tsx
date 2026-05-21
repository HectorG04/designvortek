'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
import Button from '@/components/ui/Button'
import { PORTFOLIO_CATEGORIES } from '@/lib/constants'
import { getFeaturedPieces } from '@/lib/portfolio-pieces'
import { cn } from '@/lib/utils'

/* =====================================================================
   PORTFOLIO STRIP — homepage section that surfaces 8 featured pieces
   from the centralized portfolio data. Visitor can filter by category
   chip. Each card links straight to the detail page.

   Hand the same 8 cards to the homepage and the /portfolio masonry
   reads the rest, so the strip is the curated subset (featured = true)
   and the masonry is the full archive.
   ===================================================================== */

const FEATURED_LIMIT = 8

export default function PortfolioStrip() {
  const [active, setActive] = useState<string>('All')

  /* Featured-only pieces, capped at FEATURED_LIMIT. Memoized so the
   * filter chip toggle doesn't re-sort the whole list each click. */
  const pieces = useMemo(() => getFeaturedPieces(FEATURED_LIMIT), [])

  const filtered =
    active === 'All' ? pieces : pieces.filter((p) => p.category === active)

  return (
    <section className="bg-parchment-100 py-16 md:py-32">
      <Container>
        <SectionHead
          eyebrow="Recent work"
          title={<>Crafted with <em>care</em></>}
          description="A small slice of recent commissions. Each piece took a couple of weeks of close collaboration with the client."
        />

        {/* Filter chips — .dv-chip pattern */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center flex-wrap gap-2 mb-12"
        >
          {PORTFOLIO_CATEGORIES.map((cat) => {
            const isActive = active === cat
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={cn(
                  'px-4 py-2 rounded-full border font-body text-[0.8125rem] font-medium cursor-pointer transition-all duration-150',
                  isActive
                    ? 'bg-burgundy-700 border-burgundy-700 text-cream-50'
                    : 'bg-parchment-100 border-border-light text-ink-700 hover:bg-parchment-200 hover:border-border-medium'
                )}
              >
                {cat}
              </button>
            )
          })}
        </motion.div>

        {/* Grid: 2-col mobile, 4-col desktop, gap 16. Each card links to
            the matching detail page so the hover preview becomes a click. */}
        <motion.div
          layout
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((piece, i) => (
              <motion.div
                key={piece.slug}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                whileHover={{ y: -3 }}
              >
                <Link
                  href={`/portfolio/${piece.slug}`}
                  className={cn(
                    'group relative block rounded-lg overflow-hidden border border-border-light cursor-pointer aspect-[4/5]',
                    'hover:shadow-lg transition-shadow duration-250',
                    'bg-gradient-to-br',
                    piece.gradient
                  )}
                >
                  {/* Real artwork via next/image. object-cover so the 4:5
                      card stays edge-to-edge even for wider source pieces. */}
                  <Image
                    src={piece.heroImage}
                    alt={piece.title}
                    fill
                    sizes="(min-width: 1024px) 280px, 45vw"
                    className="object-cover"
                  />

                  {/* Hover overlay — linear-gradient transparent → tome 85% */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col justify-end p-5"
                    style={{
                      background:
                        'linear-gradient(180deg, transparent 50%, rgba(26, 19, 12, 0.85) 100%)',
                    }}
                  >
                    <div className="text-[0.625rem] uppercase tracking-[0.15em] font-bold text-gold-glow mb-1">
                      {piece.category}
                    </div>
                    <div className="font-display text-[1.125rem] font-semibold text-cream-50 leading-[1.2]">
                      {piece.title}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA — .hp-portfolio-foot */}
        <div className="text-center mt-12">
          <Button href="/portfolio" variant="outline" size="md">
            View full gallery <ArrowRight size={14} strokeWidth={1.8} />
          </Button>
        </div>
      </Container>
    </section>
  )
}
