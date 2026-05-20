'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Clock, Eye } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

/* =====================================================================
   PORTFOLIO INDEX — literal port of Claude Design Final/Portfolio.html.
   Client component for filter interactivity (AnimatePresence + layout).
   Note: metadata can't be exported from 'use client' files — SEO is
   handled by the parent layout + the H1 inside PageHero.
   ===================================================================== */

type Category = 'All' | 'Character Art' | 'Tokens' | 'Portraits' | 'Anime' | 'Custom'

interface PortfolioItem {
  id: number
  slug: string
  title: string
  category: Exclude<Category, 'All'>
  gradient: string
  /** Aspect-ratio hint to vary the masonry visual rhythm — 4:5 / 1:1 / 3:4 / 3:2 / 4:5. */
  aspect: 'tall' | 'square' | 'mid' | 'wide'
}

const CATEGORIES: { key: Category; count: number }[] = [
  { key: 'All',            count: 247 },
  { key: 'Character Art',  count: 142 },
  { key: 'Tokens',         count: 58 },
  { key: 'Portraits',      count: 24 },
  { key: 'Anime',          count: 16 },
  { key: 'Custom',         count: 7 },
]

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  { id: 1,  slug: 'lyra-vexweaver-tiefling-sorceror', title: 'Lyra Vexweaver · Tiefling Sorceror',  category: 'Character Art', gradient: 'from-violet-900 via-purple-700 to-indigo-600',  aspect: 'tall' },
  { id: 2,  slug: 'hooded-stranger-token',            title: 'The Hooded Stranger',                  category: 'Tokens',        gradient: 'from-stone-900 via-amber-900 to-yellow-700',    aspect: 'square' },
  { id: 3,  slug: 'kaeru-spring-duelist',             title: 'Kaeru — spring duelist',               category: 'Anime',         gradient: 'from-pink-900 via-rose-700 to-amber-500',       aspect: 'mid' },
  { id: 4,  slug: 'howling-crows-party',              title: 'The Howling Crows · level 9',          category: 'Portraits',     gradient: 'from-emerald-900 via-teal-700 to-cyan-600',     aspect: 'wide' },
  { id: 5,  slug: 'aldric-half-elf-paladin',          title: 'Aldric · half-elf paladin',            category: 'Character Art', gradient: 'from-amber-900 via-yellow-700 to-orange-600',   aspect: 'tall' },
  { id: 6,  slug: 'skyborn-druid-token',              title: 'Skyborn Druid',                        category: 'Tokens',        gradient: 'from-emerald-800 via-teal-600 to-cyan-500',     aspect: 'square' },
  { id: 7,  slug: 'mira-lantern-keeper',              title: 'Mira — lantern keeper',                category: 'Anime',         gradient: 'from-violet-800 via-indigo-600 to-blue-500',    aspect: 'tall' },
  { id: 8,  slug: 'drowned-captain-veska',            title: 'Drowned Captain Veska',                category: 'Character Art', gradient: 'from-slate-800 via-teal-700 to-emerald-600',    aspect: 'mid' },
  { id: 9,  slug: 'book-cover-ashes-of-caer',         title: 'Book cover — Ashes of Caer',           category: 'Custom',        gradient: 'from-stone-900 via-burgundy-700 to-amber-700',  aspect: 'wide' },
  { id: 10, slug: 'brennen-bardic-dropout',           title: 'Brennen — bardic college dropout',     category: 'Character Art', gradient: 'from-amber-800 via-rose-700 to-pink-600',       aspect: 'tall' },
  { id: 11, slug: 'forest-witch-token',               title: 'Forest Witch · NPC pack 04',           category: 'Tokens',        gradient: 'from-emerald-900 via-forest-700 to-amber-800',  aspect: 'square' },
  { id: 12, slug: 'wedding-priya-james',              title: 'Wedding gift · Priya & James',         category: 'Portraits',     gradient: 'from-forest-700 via-emerald-600 to-amber-700',  aspect: 'tall' },
  { id: 13, slug: 'eira-half-orc-paladin',            title: 'Eira the Half-Orc Paladin',            category: 'Character Art', gradient: 'from-amber-950 via-orange-800 to-yellow-700',   aspect: 'mid' },
  { id: 14, slug: 'cherry-blossom-samurai',           title: 'Cherry-Blossom Samurai',               category: 'Anime',         gradient: 'from-rose-900 via-pink-700 to-fuchsia-600',     aspect: 'tall' },
  { id: 15, slug: 'strahd-npc-pack',                  title: 'Strahd NPC Pack (8 portraits)',        category: 'Custom',        gradient: 'from-burgundy-900 via-red-800 to-rose-700',     aspect: 'square' },
  { id: 16, slug: 'stormwatch-adventuring-party',     title: 'Stormwatch Adventuring Party',         category: 'Portraits',     gradient: 'from-emerald-900 via-teal-700 to-cyan-600',     aspect: 'wide' },
]

const ASPECT_CLASS: Record<PortfolioItem['aspect'], string> = {
  tall:   'aspect-[4/5]',
  square: 'aspect-square',
  mid:    'aspect-[3/4]',
  wide:   'aspect-[3/2]',
}

export default function PortfolioPage() {
  const [active, setActive] = useState<Category>('All')

  const filtered = active === 'All'
    ? PORTFOLIO_ITEMS
    : PORTFOLIO_ITEMS.filter((p) => p.category === active)

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">
        <PageHero
          eyebrow="Portfolio"
          title={
            <>
              Five hundred pieces.<br />
              <em className="font-display italic font-medium text-burgundy-700">One craft.</em>
            </>
          }
          description="Every commission since 2022 — character portraits, VTT tokens, NPC packs, party portraits, and the occasional book cover."
          stat={
            <>
              <Clock size={14} strokeWidth={1.8} className="text-burgundy-700" />
              <span>
                <strong className="font-semibold text-ink-900">500+ pieces</strong> · updated weekly · last update May 18, 2026
              </span>
            </>
          }
        />

        {/* Filter chips + gallery */}
        <section className="pb-24 md:pb-32">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex justify-center flex-wrap gap-2 mb-12"
            >
              {CATEGORIES.map(({ key, count }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(key)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs uppercase tracking-[0.12em] font-semibold transition-all cursor-pointer',
                    active === key
                      ? 'bg-burgundy-700 text-cream-50 shadow-sm'
                      : 'bg-parchment-100 text-ink-700 border border-border-light hover:border-burgundy-700 hover:text-burgundy-700',
                  )}
                >
                  {key} · {count}
                </button>
              ))}
            </motion.div>

            {/* Masonry-ish grid: 2 col mobile, 4 col desktop, varied aspect */}
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
                    transition={{
                      duration: 0.35,
                      delay: i * 0.03,
                      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                    }}
                    whileHover={{ y: -3 }}
                  >
                    <Link
                      href={`/portfolio/${item.slug}`}
                      className={cn(
                        'group relative block rounded-xl overflow-hidden border border-border-light bg-gradient-to-br',
                        ASPECT_CLASS[item.aspect],
                        item.gradient,
                        'hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow',
                      )}
                    >
                      {/* Soft placeholder mark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm" />
                      </div>

                      {/* Quick view icon (top-right) */}
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-tome-950/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye size={14} strokeWidth={1.6} className="text-cream-50" />
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
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load more — visual placeholder, no real pagination */}
            <div className="text-center mt-16">
              <Button variant="outline" size="md">
                Load 24 more <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
              <div className="text-xs text-ink-500 mt-3">
                Showing {filtered.length} of {CATEGORIES.find((c) => c.key === active)?.count ?? filtered.length}
              </div>
            </div>
          </Container>
        </section>

        {/* CTA strip */}
        <section className="bg-tome-950 text-cream-50 py-20 md:py-28 text-center">
          <Container>
            <h2
              className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}
            >
              Seen something you{' '}
              <em className="font-display italic font-medium text-gold-glow">love</em>?
            </h2>
            <p className="text-lg text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-8">
              Every portrait above was a collaboration. Yours can be next.
            </p>
            <div className="inline-flex flex-wrap justify-center gap-3.5">
              <Button href="/order" variant="gold" size="lg">
                Start commission <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
              <Button href="/contact" variant="outline-cream" size="lg">
                Ask a question
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
