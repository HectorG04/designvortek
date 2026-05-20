'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Eye } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

/* NOTE: page metadata is set via root layout fallback since this file is a Client
   Component. SEO-critical fields are handled by the page chrome and the H1
   inside PageHero. */

type Category = 'All' | 'Character Art' | 'Tokens' | 'Portraits' | 'Anime' | 'Custom'

interface PortfolioItem {
  id: number
  slug: string
  title: string
  category: Exclude<Category, 'All'>
  gradient: string
}

const CATEGORIES: Category[] = ['All', 'Character Art', 'Tokens', 'Portraits', 'Anime', 'Custom']

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  { id: 1,  slug: 'lyra-vexweaver-tiefling-sorceror', title: 'Lyra Vexweaver, Tiefling Sorceror', category: 'Character Art', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
  { id: 2,  slug: 'eira-half-orc-paladin',            title: 'Eira the Half-Orc Paladin',         category: 'Character Art', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
  { id: 3,  slug: 'wraith-vtt-token-set',             title: 'Wraith VTT Token Set',              category: 'Tokens',        gradient: 'from-stone-900 via-amber-900 to-yellow-700' },
  { id: 4,  slug: 'stormwatch-adventuring-party',     title: 'Stormwatch Adventuring Party',      category: 'Portraits',     gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
  { id: 5,  slug: 'cherry-blossom-samurai',           title: 'Cherry-Blossom Samurai',            category: 'Anime',         gradient: 'from-rose-900 via-pink-700 to-fuchsia-600' },
  { id: 6,  slug: 'strahd-npc-pack',                  title: 'Strahd NPC Pack (8 portraits)',     category: 'Custom',        gradient: 'from-burgundy-900 via-red-800 to-rose-700' },
  { id: 7,  slug: 'drow-ranger-direwolf',             title: 'Drow Ranger with Direwolf',         category: 'Character Art', gradient: 'from-slate-900 via-violet-800 to-purple-700' },
  { id: 8,  slug: 'wedding-party-adventurers',        title: 'Wedding Party as Adventurers',      category: 'Portraits',     gradient: 'from-forest-700 via-emerald-600 to-amber-700' },
  { id: 9,  slug: 'kaeru-spring-duelist',             title: 'Kaeru, Spring Duelist',             category: 'Anime',         gradient: 'from-pink-900 via-rose-700 to-amber-500' },
  { id: 10, slug: 'aldric-half-elf-paladin',          title: 'Aldric, Half-Elf Paladin',          category: 'Character Art', gradient: 'from-amber-900 via-yellow-700 to-orange-600' },
  { id: 11, slug: 'skyborn-druid-token',              title: 'Skyborn Druid Token',               category: 'Tokens',        gradient: 'from-emerald-800 via-teal-600 to-cyan-500' },
  { id: 12, slug: 'mira-lantern-keeper',              title: 'Mira, Lantern Keeper',              category: 'Anime',         gradient: 'from-violet-800 via-indigo-600 to-blue-500' },
  { id: 13, slug: 'drowned-captain-veska',            title: 'Drowned Captain Veska',             category: 'Character Art', gradient: 'from-slate-800 via-teal-700 to-emerald-600' },
  { id: 14, slug: 'book-cover-ashes-of-caer',         title: 'Book Cover, Ashes of Caer',         category: 'Custom',        gradient: 'from-stone-900 via-burgundy-700 to-amber-700' },
  { id: 15, slug: 'brennen-bardic-dropout',           title: 'Brennen, Bardic Dropout',           category: 'Character Art', gradient: 'from-amber-800 via-rose-700 to-pink-600' },
  { id: 16, slug: 'forest-witch-token',               title: 'Forest Witch, NPC Pack 04',         category: 'Tokens',        gradient: 'from-emerald-900 via-forest-700 to-amber-800' },
]

export default function PortfolioPage() {
  const [active, setActive] = useState<Category>('All')

  const filtered = active === 'All'
    ? PORTFOLIO_ITEMS
    : PORTFOLIO_ITEMS.filter((p) => p.category === active)

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Portfolio"
          title={<>Five hundred pieces. <em className="font-display italic font-medium text-burgundy-700">One craft.</em></>}
          description="Every commission since 2022 — character portraits, VTT tokens, NPC packs, party portraits, and the occasional book cover."
          stat={<><span className="font-display text-burgundy-700 font-semibold">500+ pieces</span> · updated weekly · last update May 18, 2026</>}
        />

        {/* Filter + Gallery */}
        <section className="bg-parchment-50 pb-24 md:pb-32">
          <Container>
            {/* Filter chips */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex justify-center flex-wrap gap-2 mb-12"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs uppercase tracking-[0.12em] font-semibold transition-all',
                    active === cat
                      ? 'bg-burgundy-700 text-cream-50 shadow-sm'
                      : 'bg-parchment-100 text-ink-700 border border-border-light hover:border-burgundy-700 hover:text-burgundy-700',
                  )}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* Grid */}
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filtered.map((item, i) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -3 }}
                  >
                    <Link
                      href={`/portfolio/${item.slug}`}
                      className={cn(
                        'group relative block rounded-xl overflow-hidden border border-border-light',
                        'aspect-[4/5] bg-gradient-to-br',
                        item.gradient,
                        'hover:shadow-[0_12px_32px_rgba(30,20,8,0.10)] transition-shadow',
                      )}
                    >
                      {/* Soft placeholder mark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-15">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm" />
                      </div>

                      {/* Quick view icon */}
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

            {/* Load more */}
            <div className="text-center mt-16">
              <Button variant="outline" size="md">
                Load 24 more <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
              <div className="text-xs text-ink-500 mt-3">Showing {filtered.length} of 247</div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
