'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import ProtectedImage from '@/components/ui/ProtectedImage'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
import Button from '@/components/ui/Button'
import { PORTFOLIO_CATEGORIES } from '@/lib/constants'
import type { PortfolioPiece } from '@/lib/portfolio-pieces'
import { cn } from '@/lib/utils'

/* =====================================================================
   PORTFOLIO STRIP — homepage section that surfaces 8 featured pieces
   from the centralized portfolio data. Visitor can filter by category
   chip. Each card links straight to the detail page.

   Hand the same 8 cards to the homepage and the /portfolio masonry
   reads the rest, so the strip is the curated subset (featured = true)
   and the masonry is the full archive.
   ===================================================================== */

export interface PortfolioStripProps {
  /** Featured pieces fetched by the parent server component. Already
   *  filtered to featured=true and capped at the desired limit. */
  pieces: PortfolioPiece[]
}

export default function PortfolioStrip({ pieces }: PortfolioStripProps) {
  const [active, setActive] = useState<string>('All')

  /* Only show filter chips for categories that actually have at least one
   * piece in the current `pieces` set. Preserves the canonical PORTFOLIO_CATEGORIES
   * order so chip layout stays predictable. 'All' is always shown when there's
   * any piece at all. Avoids the empty-state UX where clicking a chip silently
   * removes every card from the grid. */
  const availableCategories = useMemo(() => {
    if (pieces.length === 0) return []
    const populated = new Set(pieces.map((p) => p.category as string))
    return PORTFOLIO_CATEGORIES.filter((c) => c === 'All' || populated.has(c))
  }, [pieces])

  /* If the active chip is no longer in the available list (e.g. pieces changed),
   * fall back to 'All' so we never show an empty grid. */
  const effectiveActive = availableCategories.includes(active) ? active : 'All'

  const filtered =
    effectiveActive === 'All' ? pieces : pieces.filter((p) => p.category === effectiveActive)

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
          {availableCategories.map((cat) => {
            const isActive = effectiveActive === cat
            // Show count next to each non-All chip for at-a-glance density.
            const count =
              cat === 'All' ? pieces.length : pieces.filter((p) => p.category === cat).length
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
                {cat} <span className="opacity-60 ml-0.5">{count}</span>
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
                    'hover:shadow-lg transition-shadow duration-[250ms]',
                    'bg-gradient-to-br',
                    piece.gradient
                  )}
                >
                  {/* Real artwork via ProtectedImage (next/image + right-click +
                      drag deterrents). object-cover so the 4:5 card stays
                      edge-to-edge even for wider source pieces. */}
                  <ProtectedImage
                    src={piece.heroImage}
                    alt={piece.title}
                    fill
                    sizes="(min-width: 1024px) 280px, 45vw"
                    className="object-cover"
                  />

                  {/* Hover overlay — linear-gradient transparent → tome 85% */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[250ms] flex flex-col justify-end p-5"
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
