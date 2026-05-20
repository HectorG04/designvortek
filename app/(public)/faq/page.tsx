'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, ArrowRight } from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import Markdown from '@/components/ui/Markdown'
import { cn } from '@/lib/utils'

/* ============================================================
   FAQ data — answers stored as MARKDOWN STRINGS so inline
   emphasis (**bold** + [links](/url)) survives the data layer
   and renders through the branded Markdown component.
   ============================================================ */
const FAQ_CATEGORIES = [
  { id: 'pricing',       label: 'Pricing' },
  { id: 'process',       label: 'Process' },
  { id: 'revisions',     label: 'Revisions' },
  { id: 'licensing',     label: 'Licensing' },
  { id: 'cancellations', label: 'Cancellations' },
  { id: 'tech',          label: 'Tech & delivery' },
] as const

type CategoryId = typeof FAQ_CATEGORIES[number]['id']

interface FaqItem {
  q: string
  /** Markdown string — use `**bold**`, `*italic*`, `[text](/url)`. */
  a: string
  category: CategoryId
}

const FAQS: FaqItem[] = [
  {
    category: 'pricing',
    q: 'How much does a commission cost?',
    a: `Commissions range from **$80 for a single VTT token** to **$600+ for a full party portrait**. Character art starts at $180; NPC packs from $300. Every quote is fixed up front — no surprises, no add-ons mid-project.

See the full [pricing breakdown](/pricing) for every service tier.`,
  },
  {
    category: 'pricing',
    q: 'Why flat-rate instead of hourly?',
    a: `Hourly billing punishes care. You shouldn't pay more because we polished for an extra two hours. **Fixed scope, fixed price**, every time.`,
  },
  {
    category: 'pricing',
    q: 'How does payment work?',
    a: `A **25% deposit** holds your slot (refundable until first sketch). The remaining 75% is due on delivery. All payments through Stripe.`,
  },
  {
    category: 'pricing',
    q: 'Do you offer bulk discounts?',
    a: `Yes — **NPC packs of 5+** get a per-piece discount. VTT tokens in bulk drop to **$60 each at 8+**. Custom retainer arrangements are available for frequent collaborators.`,
  },
  {
    category: 'process',
    q: 'How long does a commission take?',
    a: `Most character portraits ship within **7–14 days** of brief approval. VTT tokens are faster (3–7 days). Party portraits and NPC packs take 2–4 weeks depending on figure count.

Rush turnaround is available for **+$50** on most services — reach out before booking.`,
  },
  {
    category: 'process',
    q: 'What happens after I submit a brief?',
    a: `Within **48 hours** we review the brief and send back a fixed quote with a timeline. You approve, pay a 25% deposit, and we begin. Sketches typically land within a week.`,
  },
  {
    category: 'process',
    q: 'Will I get updates during the painting?',
    a: `Yes — sketches, color blocks, and paint progress are shared **every three days**. You'll never wonder where things stand.`,
  },
  {
    category: 'process',
    q: 'Can I request a rush?',
    a: `Yes — **+$50** moves you to the front of the queue with a 3-day turnaround on Character and Token services. Reach out before booking to confirm we have rush capacity.`,
  },
  {
    category: 'revisions',
    q: 'How many revisions are included?',
    a: `Sketch revisions are **unlimited** — we get the foundation right before paint. **Two paint-stage revisions** are baked into every commission. Extra rounds are $40 each.`,
  },
  {
    category: 'revisions',
    q: 'What if I’m not happy with the result?',
    a: `In four years and **500+ commissions**, this has happened twice. If the piece is genuinely off the brief, we refund the balance beyond the 25% deposit (which covers our sketch work). Read the full [refund policy](/refunds).`,
  },
  {
    category: 'revisions',
    q: 'Do you use AI in any part of the process?',
    a: `**No.** Every piece is hand-painted from scratch by a human artist. No AI generation, no auto-fills, no traced-over outputs. That's the entire point of the studio.`,
  },
  {
    category: 'licensing',
    q: 'Can I use the art commercially?',
    a: `Personal use (prints, social posts, your character sheet) is **included** with every commission. **Commercial licensing** — books, merch, streaming, paid Patreons — is available as a **$150 add-on** per piece, or as a bulk arrangement for larger projects.`,
  },
  {
    category: 'licensing',
    q: 'Can you post my commission on your portfolio?',
    a: `By default, yes — this is how new clients find us. You can **opt out at any point before delivery**. Sensitive or NSFW commissions are never posted.`,
  },
  {
    category: 'licensing',
    q: 'Who owns the original file?',
    a: `You own the rendered piece and the rights described above. We retain the right to display it in our portfolio (unless you opt out) and the underlying brushes, references, and processes. See the full [terms of service](/terms).`,
  },
  {
    category: 'cancellations',
    q: 'What’s your refund policy?',
    a: `Before first sketch: **100% refundable**. After first sketch: deposit covers the sketch work. After paint begins: pro-rated by stage completed. Full [refund policy](/refunds).`,
  },
  {
    category: 'cancellations',
    q: 'Can I cancel mid-project?',
    a: `Yes — we'll pro-rate based on stage. You keep what's been delivered (sketches, color blocks) and we settle the balance.`,
  },
  {
    category: 'tech',
    q: 'What file formats do you deliver?',
    a: `Every commission ships with a **4K PNG**, a **4K JPG**, and a **print-ready 300 DPI file**. VTT tokens include 512px and 1024px transparent PNGs. Layered PSDs are available as a $30 add-on.`,
  },
  {
    category: 'tech',
    q: 'What payment methods do you accept?',
    a: `Credit/debit cards, Apple Pay, Google Pay, Link, and ACH transfers through **Stripe**. We don't accept crypto or PayPal.`,
  },
]

/** Strip basic markdown for plain-text JSON-LD answer. */
function stripMarkdown(md: string): string {
  return md
    .replace(/\*\*([^*]+)\*\*/g, '$1')          // **bold**
    .replace(/\*([^*]+)\*/g, '$1')              // *italic*
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')    // [text](url)
    .replace(/\n+/g, ' ')                       // newlines → space
    .trim()
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId | 'all'>('all')
  const [open, setOpen] = useState<number | null>(0)
  const [search, setSearch] = useState('')

  const filtered = FAQS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const q = search.trim().toLowerCase()
    const matchesSearch = !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  // Schema uses full unfiltered list + stripped markdown plain text
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: stripMarkdown(item.a) },
    })),
  }

  return (
    <>
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        <PageHero
          eyebrow="Frequently asked"
          title={<>Quick answers, no <em className="font-display italic font-medium text-burgundy-700">fluff</em></>}
          description="Pricing, process, revisions, licensing, refunds. If you've thought it, someone's asked it — and the answer's here."
        />

        {/* Search bar */}
        <section className="pb-12">
          <Container>
            <div className="max-w-2xl mx-auto relative">
              <Search
                size={18}
                strokeWidth={1.8}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the FAQ&hellip;"
                className="w-full bg-parchment-50 border border-border-light hover:border-border-medium focus:border-burgundy-700 focus:outline-none focus:ring-0 rounded-full pl-14 pr-6 py-4 text-base text-ink-900 placeholder:text-ink-400 transition-colors"
                aria-label="Search FAQ"
              />
            </div>
          </Container>
        </section>

        {/* FAQ layout */}
        <section className="pb-20 md:pb-28">
          <Container>
            <div className="grid lg:grid-cols-[220px_1fr] gap-12 lg:gap-16 max-w-5xl mx-auto">
              {/* Sticky category nav */}
              <aside className="lg:sticky lg:top-28 self-start">
                <div className="text-[0.6875rem] uppercase tracking-[0.18em] font-semibold text-gold-700 mb-4">
                  Categories
                </div>
                <nav className="flex lg:flex-col gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => { setActiveCategory('all'); setOpen(null) }}
                    className={cn(
                      'text-left px-4 py-2.5 rounded-lg font-body text-sm transition-colors',
                      activeCategory === 'all'
                        ? 'bg-burgundy-100 text-burgundy-700 font-semibold'
                        : 'text-ink-700 hover:bg-parchment-100 hover:text-burgundy-700'
                    )}
                  >
                    All questions
                  </button>
                  {FAQ_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => { setActiveCategory(cat.id); setOpen(null) }}
                      className={cn(
                        'text-left px-4 py-2.5 rounded-lg font-body text-sm transition-colors',
                        activeCategory === cat.id
                          ? 'bg-burgundy-100 text-burgundy-700 font-semibold'
                          : 'text-ink-700 hover:bg-parchment-100 hover:text-burgundy-700'
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </nav>
              </aside>

              {/* Accordion */}
              <div className="flex flex-col gap-3">
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-ink-500 bg-parchment-50 border border-border-light rounded-xl">
                    No questions match your search.
                  </div>
                )}
                {filtered.map((item, idx) => {
                  const isOpen = open === idx
                  return (
                    <div
                      key={`${item.category}-${idx}`}
                      className={cn(
                        'rounded-xl border transition-colors',
                        isOpen
                          ? 'bg-parchment-50 border-border-medium shadow-sm'
                          : 'bg-parchment-100 border-border-light hover:border-border-medium'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <span className="font-display text-lg md:text-xl font-semibold text-ink-900 leading-snug">
                          {item.q}
                        </span>
                        <span
                          className={cn(
                            'flex-shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-all duration-250',
                            isOpen
                              ? 'bg-burgundy-700 text-cream-50 rotate-45'
                              : 'bg-parchment-50 text-burgundy-700 border border-border-medium'
                          )}
                        >
                          <Plus size={14} strokeWidth={2.2} />
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            style={{ overflow: 'hidden' }}
                          >
                            {/* Answer rendered through Markdown component — inline links and bold survive */}
                            <div className="px-6 pb-5 text-ink-700 leading-[1.7] max-w-[64ch]">
                              <Markdown>{item.a}</Markdown>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          </Container>
        </section>

        {/* Still have questions */}
        <section className="bg-parchment-100 py-20 border-t border-border-light">
          <Container>
            <div className="max-w-3xl mx-auto bg-parchment-50 border border-border-light rounded-2xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
              <div>
                <div className="text-[0.6875rem] uppercase tracking-[0.18em] font-semibold text-gold-700 mb-3">
                  Still wondering?
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 leading-snug mb-3">
                  Have a question we <em className="font-display italic font-medium text-burgundy-700">missed</em>?
                </h3>
                <p className="text-ink-700 leading-relaxed max-w-[48ch]">
                  Send a note — we usually reply within 48 hours, and the answer often becomes a new FAQ entry.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Button href="/contact" variant="primary" size="md">
                  Send a message <ArrowRight size={14} strokeWidth={1.8} />
                </Button>
                <Button href="/order" variant="outline" size="md">
                  Start a commission
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
