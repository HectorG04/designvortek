'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ChevronRight, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import Markdown from '@/components/ui/Markdown'
import GoldCorners from '@/components/decor/GoldCorners'
import { cn } from '@/lib/utils'

/* =====================================================================
   SERVICE DETAIL VIEW — literal port of Service Detail.html sections.
   Client component because of FAQ accordion + tier selection.

   Markdown is used for:
     • `lede` (hero description) — surfaces price emphasis like **$180**
     • `faq.a` (FAQ answers) — **bold $ amounts** + [refund policy](/refunds)

   See globals → CRITICAL Content-modeling rule (Phase B spec).
   ===================================================================== */

type Tier = {
  name: string
  best: string
  price: string
  priceNote: string
  features: string[]
  featured?: boolean
}

type Example = {
  title: string
  meta: string
  gradient: string
}

export type ServiceData = {
  slug: string
  title: string
  titleHtml: React.ReactNode
  eyebrow: string
  /** Hero lede — stored as MARKDOWN (supports **$XXX** emphasis & [links]). */
  lede: string
  metaDescription: string
  startingPrice: string
  turnaround: string
  resolution: string
  delivered: string
  heroGradient: string
  included: { name: string; body: string }[]
  tiers: [Tier, Tier, Tier]
  examples: Example[]
  /** FAQ answers stored as MARKDOWN strings — most contain **$ amounts** or
   *  inline links. Rendered via the <Markdown> wrapper. */
  faq: { q: string; a: string }[]
}

export const SERVICES = {
  'character-art': {
    slug: 'character-art',
    title: 'Character Art',
    titleHtml: (
      <>
        Your D&amp;D character,
        <br />
        <em className="font-display italic font-medium text-burgundy-700">painted</em>.
      </>
    ),
    eyebrow: 'Character Art · from $180',
    lede: 'Single-character portraits at portfolio quality. **Painterly rendering**, expressive poses, dramatic lighting. Tieflings, half-orcs, drow rangers, gnome wizards — every flavor of fantasy character is welcome.',
    metaDescription:
      'Painterly D&D character portraits from $180. 7–14 day turnaround, 4K delivery, 2 revisions included. Tieflings, half-elves, every species welcome.',
    startingPrice: '$180+',
    turnaround: '7–14 days',
    resolution: '4K',
    delivered: '142',
    heroGradient: 'from-violet-950 via-purple-800 to-indigo-700',
    included: [
      { name: '2 rounds of revisions',  body: 'Sketch revisions are free. Two paint-stage revisions baked in — we usually nail it well within that.' },
      { name: '4K final delivery',       body: '4096 × 5120 pixel PNG & JPG, suitable for print up to 16×20 inches at 300dpi.' },
      { name: 'Transparent background',  body: 'A version with the background removed, ready to drop onto your character sheet or VTT.' },
      { name: 'Process updates',         body: 'Sketches, color blocks, and progress shots shared every 3 days. Total transparency.' },
      { name: 'Personal use rights',     body: 'Use it anywhere personal — character sheet, social, prints, frame it on the wall.' },
      { name: 'Fixed pricing',           body: 'Quote up front, no surprises. The price you approve is the price you pay.' },
    ],
    tiers: [
      { name: 'Standard', best: 'your first commission', price: '$180', priceNote: 'bust shot · 4K final',
        features: ['Head & shoulders', '1 revision included', 'Solid background', '4K PNG & JPG'] },
      { name: 'Deluxe', best: 'the sweet spot', price: '$320', priceNote: 'half-body · 4K + transparent',
        features: ['Waist-up portrait', '2 revisions included', 'Detailed background', '4K PNG & JPG', 'Transparent BG export'], featured: true },
      { name: 'Premium', best: 'the heirloom piece', price: '$520', priceNote: 'full body · all the works',
        features: ['Full body, head to toe', '3 revisions included', 'Cinematic scene', '6K final resolution', 'Layered PSD source'] },
    ] as [Tier, Tier, Tier],
    examples: [
      { title: 'Lyra · Tiefling Sorceror',   meta: 'Deluxe · Mar 2026',   gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
      { title: 'Aldric · half-elf paladin',  meta: 'Premium · Mar 2026',  gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Drowned Captain Veska',      meta: 'Deluxe · Feb 2026',   gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
      { title: 'Maelis · drow ranger',       meta: 'Standard · Jan 2026', gradient: 'from-slate-900 via-violet-800 to-purple-700' },
    ],
    faq: [
      { q: 'What species and classes do you cover?',                a: 'Every **D&D 5e** species and class is on the table — tieflings, drow, dragonborn, kobolds, custom homebrew species, you name it. Same for Pathfinder, World of Darkness, or your own setting. Send us a description and we’ll paint it.' },
      { q: 'Can you work from a Hero Forge screenshot?',            a: 'Absolutely. Hero Forge screenshots, minis, sketches, even rough scribbles work as a starting reference. The more material you send, the closer the first sketch will land.' },
      { q: 'What if my character changes during the process?',      a: 'The sketch stage is where major changes are easy and free. Once we move to paint, **structural changes** (different pose, different species) become a new commission. Smaller adjustments fit within your included revisions.' },
      { q: 'Can I commission a copyrighted character?',             a: 'For personal use only (your private collection, your character sheet), we’ll usually do fan art. For **commercial use** of someone else’s IP, we’d need written permission from the rights holder. See full [terms](/terms).' },
    ],
  },
  'vtt-tokens': {
    slug: 'vtt-tokens',
    title: 'VTT Tokens',
    titleHtml: (
      <>
        Tokens that earn their <em className="font-display italic font-medium text-burgundy-700">pixel budget</em>.
      </>
    ),
    eyebrow: 'VTT Tokens · from $80',
    lede: 'Circular character tokens optimised for **Roll20 and Foundry**. Rich color, decorative borders, perfect at every zoom level your DM throws at them.',
    metaDescription:
      'VTT tokens for Roll20 and Foundry from $80. 512 + 1024px transparent PNG, decorative borders, bulk discounts for 4+ tokens.',
    startingPrice: '$80+',
    turnaround: '3–7 days',
    resolution: '512 + 1024px',
    delivered: '380',
    heroGradient: 'from-amber-950 via-orange-800 to-yellow-700',
    included: [
      { name: 'Dual exports',          body: '512px for table use and 1024px for high-DPI inspections — both delivered.' },
      { name: 'Transparent PNG',       body: 'Drop-in ready for Roll20, Foundry, FoundryVTT, Owlbear Rodeo, or anywhere a round PNG belongs.' },
      { name: 'Decorative border',     body: 'Painted border that suits the character — choose ornate, simple, or themed.' },
      { name: '1 revision included',   body: 'One paint-stage revision baked in. Sketch tweaks always free.' },
      { name: 'Bulk discounts',        body: 'Buy four or more and the per-token price drops. Eight or more drops it further.' },
      { name: 'Process updates',       body: 'Token sketches reviewed before paint. You always see what’s coming.' },
    ],
    tiers: [
      { name: 'Single', best: 'one perfect token', price: '$80', priceNote: '1 token',
        features: ['512 + 1024 px exports', 'Transparent PNG', '1 revision included', 'Decorative border'] },
      { name: 'Party',  best: 'your whole table',   price: '$280', priceNote: '4 tokens · $30 savings',
        features: ['4 matching tokens', 'Consistent border style', '1 revision each', 'Bulk discount applied'], featured: true },
      { name: 'Bulk',   best: 'DM stockpile',       price: '$60',  priceNote: 'per token · 8+',
        features: ['8+ tokens, $60 each', 'Matching style guaranteed', 'Custom border template', 'Schedule-friendly delivery'] },
    ] as [Tier, Tier, Tier],
    examples: [
      { title: 'Wraith VTT Token Set',      meta: 'Party · Mar 2026',  gradient: 'from-stone-900 via-amber-900 to-yellow-700' },
      { title: 'Strahd Vassals · 8 tokens', meta: 'Bulk · Feb 2026',   gradient: 'from-burgundy-900 via-red-800 to-rose-700' },
      { title: 'Pirate Crew · 6 tokens',    meta: 'Bulk · Jan 2026',   gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
      { title: 'Solo Goblin Token',         meta: 'Single · Jan 2026', gradient: 'from-slate-900 via-violet-800 to-purple-700' },
    ],
    faq: [
      { q: 'Will the tokens look right in Roll20 / Foundry?', a: 'Yes — we test every token at the actual table sizes (**70px and 140px** on grid) before delivery. The color, contrast, and border are all chosen to read clearly at low zoom.' },
      { q: 'Can you match an existing portrait?',             a: 'Absolutely. If you already have a portrait — from us or elsewhere — we can build a matching token from it. Add the "matching VTT token" add-on (**+$40**) at checkout.' },
      { q: 'What about NPC tokens for a campaign?',           a: 'Use the **Bulk** tier (8+ tokens at $60 each) and you get matching borders across the whole pack. We’ve done a 20-token Strahd campaign that way.' },
      { q: 'Do you offer animated tokens?',                   a: 'Not yet — every token is a single still PNG. Animation is on the roadmap but we want to get it right before launching it.' },
    ],
  },
  'party-portraits': {
    slug: 'party-portraits',
    title: 'Party Portraits',
    titleHtml: (
      <>
        The whole gang, <em className="font-display italic font-medium text-burgundy-700">one canvas</em>.
      </>
    ),
    eyebrow: 'Party Portraits · from $400',
    lede: 'Group illustrations — **adventuring parties, weddings, gifts**. Consistent style across every figure in the frame, no awkward composites.',
    metaDescription:
      'Hand-painted party portraits from $400. Up to 8 figures in matching style, scene backgrounds, print-ready files. D&D groups, weddings, and gifts.',
    startingPrice: '$400+',
    turnaround: '14–21 days',
    resolution: '4K + print',
    delivered: '48',
    heroGradient: 'from-emerald-900 via-teal-700 to-cyan-600',
    included: [
      { name: 'Up to 8 figures',        body: 'Adventuring parties, wedding parties, families — everyone in matching style.' },
      { name: 'Scene background',       body: 'A backdrop that ties the group together: tavern, battlefield, cliffside, your call.' },
      { name: '2 revisions included',   body: 'Two paint-stage rounds across the whole composition.' },
      { name: 'Print-ready files',      body: 'Delivered at sizes suitable for canvas prints up to 24 inches.' },
      { name: 'Composition planning',   body: 'We sketch the group layout before any face is painted — and you approve it first.' },
      { name: 'Surprise-friendly',      body: 'Gift commissions handled discreetly. We coordinate refs from a co-conspirator.' },
    ],
    tiers: [
      { name: 'Trio',         best: 'small parties',      price: '$400', priceNote: '3 figures',
        features: ['3 figures, half-body', 'Simple background', '2 revisions included', '4K final delivery'] },
      { name: 'Adventurers',  best: 'classic D&D party',  price: '$680', priceNote: '4–5 figures',
        features: ['4–5 figures, half-body', 'Detailed scene background', '2 revisions included', 'Print-ready files'], featured: true },
      { name: 'Epic',         best: 'groups + scenes',    price: '$980', priceNote: '6–8 figures',
        features: ['6–8 figures, full body', 'Cinematic scene', '3 revisions included', 'Print + layered PSD'] },
    ] as [Tier, Tier, Tier],
    examples: [
      { title: 'Stormwatch Adventuring Party', meta: 'Adventurers · Mar 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
      { title: 'Wedding Party as Adventurers', meta: 'Epic · Feb 2026',        gradient: 'from-forest-700 via-emerald-600 to-amber-700' },
      { title: 'Twilight Trio',                meta: 'Trio · Feb 2026',        gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
      { title: 'Saltwind Crew (7 figures)',    meta: 'Epic · Jan 2026',        gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
    ],
    faq: [
      { q: 'How many figures can you fit in one piece?',          a: 'Up to **8 figures** keeps everyone readable. Beyond that, faces start getting small for the canvas — we’ll suggest splitting into two pieces.' },
      { q: 'Can I order a party portrait as a surprise gift?',    a: 'Yes — we work **surprise-friendly**. We’ll coordinate with a co-conspirator (usually the DM or another party member) to gather references and approvals without spoiling the surprise.' },
      { q: 'Do you do wedding portraits in fantasy style?',       a: 'Often. Adventuring-party-style wedding portraits are one of our most-loved commissions. Send a few photos of the couple and the vibe; we’ll suggest a scene.' },
      { q: 'What if one figure needs more revisions than others?', a: 'Revisions are **pooled across the piece**, not per-figure. If one face needs three tweaks and the rest are perfect, that’s fine.' },
    ],
  },
  'npc-packs': {
    slug: 'npc-packs',
    title: 'NPC Packs',
    titleHtml: (
      <>
        Your campaign’s <em className="font-display italic font-medium text-burgundy-700">cast</em>, painted.
      </>
    ),
    eyebrow: 'NPC Packs · from $600',
    lede: '**5+ NPCs** delivered in matching style, on a schedule you can plan sessions around. The DM’s secret weapon for immersion at the table.',
    metaDescription:
      'NPC pack illustrations from $600. 5+ portraits in matching style, VTT tokens included, schedule-friendly delivery for D&D campaigns.',
    startingPrice: '$600+',
    turnaround: '3–6 weeks',
    resolution: '4K + tokens',
    delivered: '62',
    heroGradient: 'from-burgundy-900 via-red-800 to-rose-700',
    included: [
      { name: 'Matching style across pack',    body: 'Every NPC in the same visual language. No mismatched stock-art breakdowns.' },
      { name: 'VTT tokens included',            body: 'Each NPC also gets a circular token export, ready for Roll20 or Foundry.' },
      { name: 'Schedule-friendly delivery',     body: 'We commit to a delivery cadence you can plan sessions around — usually 1–2 NPCs per week.' },
      { name: '2 revisions per piece',          body: 'Two paint-stage rounds for each NPC. Sketch revisions always free.' },
      { name: 'Campaign brief planning',        body: 'A kickoff call to align on world tone, style references, and pack composition.' },
      { name: 'Add-ons mid-campaign',           body: 'Need another NPC later? We hold your style notes and can add to the pack at the same rate.' },
    ],
    tiers: [
      { name: 'Starter',  best: 'one-shot or short arc',     price: '$600',   priceNote: '5 NPCs · matching style',
        features: ['5 portraits, half-body', 'Matching style guaranteed', '5 VTT tokens included', '2 revisions per piece'] },
      { name: 'Campaign', best: 'full season of play',       price: '$1,400', priceNote: '12 NPCs · pack discount',
        features: ['12 portraits, half-body', 'Schedule-friendly delivery', '12 VTT tokens included', 'Kickoff style call'], featured: true },
      { name: 'Saga',     best: 'long-form world building',  price: '$2,800', priceNote: '20+ NPCs · retainer',
        features: ['20+ portraits delivered', 'Custom style guide', 'Add-ons at same rate', 'Layered PSDs included'] },
    ] as [Tier, Tier, Tier],
    examples: [
      { title: 'Strahd NPC Pack (8 portraits)', meta: 'Campaign · Mar 2026', gradient: 'from-burgundy-900 via-red-800 to-rose-700' },
      { title: 'Saltmarsh Townsfolk · 6 NPCs',  meta: 'Starter · Feb 2026',  gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
      { title: 'Waterdeep Nobles · 12 NPCs',    meta: 'Campaign · Jan 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Underdark Cabal · 5 NPCs',      meta: 'Starter · Dec 2025',  gradient: 'from-slate-900 via-violet-800 to-purple-700' },
    ],
    faq: [
      { q: 'How long does a full NPC pack take?',           a: 'A **5-NPC starter pack** runs 3–4 weeks. A **12-NPC campaign pack** runs 5–8 weeks. We deliver on a published cadence so you can plan sessions around it.' },
      { q: 'Can the style match my existing campaign art?', a: 'Yes — send references of the art that’s already in your campaign, and we’ll match tone, palette, and finish. We’ve picked up where other artists left off before.' },
      { q: 'What if I need an extra NPC mid-campaign?',     a: 'Easy. We hold your style notes for **12 months** after pack delivery, and we can add NPCs at the per-piece rate from your tier.' },
      { q: 'Do the included tokens cost extra?',            a: 'No — every NPC in a pack ships with a matching VTT token included. That’s normally a **$40 add-on per piece**; it’s free in the pack.' },
    ],
  },
  'custom-projects': {
    slug: 'custom-projects',
    title: 'Custom Projects',
    titleHtml: (
      <>
        Bespoke illustration <em className="font-display italic font-medium text-burgundy-700">on demand</em>.
      </>
    ),
    eyebrow: 'Custom Projects · by inquiry',
    lede: 'Book covers, indie game assets, merch design, concept art. If it needs painting and we’ve got the bandwidth, **we’ll quote it honestly**.',
    metaDescription:
      'Custom illustration commissions for book covers, indie games, merch, and concept art. Bespoke quotes, commercial licensing, retainer arrangements.',
    startingPrice: 'Quote',
    turnaround: 'By scope',
    resolution: 'By scope',
    delivered: '30+',
    heroGradient: 'from-amber-700 via-burgundy-700 to-tome-900',
    included: [
      { name: 'Bespoke scoping',                  body: 'A real conversation about what you need — not a checklist. We scope to your actual project.' },
      { name: 'Commercial licensing built in',    body: 'For books, merch, games and streaming, we bake the license into the quote up front.' },
      { name: 'Retainer arrangements',            body: 'Long-term collaborations get monthly retainer rates with priority in our queue.' },
      { name: 'NDA on request',                   body: 'Comfortable signing NDAs for pre-launch indie games, unannounced books, and similar.' },
      { name: 'Multiple revision rounds',         body: 'Negotiated up front based on scope. We won’t cap revisions on a $5k brief at two rounds.' },
      { name: 'Source files included',            body: 'Layered PSDs delivered with every custom commission — no separate charge.' },
    ],
    tiers: [
      { name: 'Small',    best: 'one bespoke piece',         price: 'From $500',    priceNote: 'single illustration',
        features: ['1 illustration · negotiated brief', 'Commercial license included', 'Layered PSD delivered', 'Negotiated revisions'] },
      { name: 'Project',  best: 'multi-piece engagement',    price: 'From $2k',     priceNote: 'multi-piece scope',
        features: ['3–10 pieces in matching style', 'Style guide deliverable', 'NDA on request', 'Priority queue placement'], featured: true },
      { name: 'Retainer', best: 'ongoing collaboration',     price: 'From $4k/mo',  priceNote: 'monthly retainer',
        features: ['Dedicated monthly slots', 'Best per-piece rate', 'Direct artist access', 'Priority on all requests'] },
    ] as [Tier, Tier, Tier],
    examples: [
      { title: 'Indie game cover · The Hollow', meta: 'Project · Mar 2026',  gradient: 'from-amber-700 via-burgundy-700 to-tome-900' },
      { title: 'Novel cover · Saltbound',       meta: 'Small · Feb 2026',    gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
      { title: 'Merch line · 5 designs',        meta: 'Project · Jan 2026',  gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Game studio retainer',          meta: 'Retainer · ongoing',  gradient: 'from-slate-900 via-violet-800 to-purple-700' },
    ],
    faq: [
      { q: 'What kinds of custom projects do you take?',       a: '**Book covers**, indie video game key art, tabletop game illustrations, merch designs, concept art for personal projects, large-format prints — anything that needs painting and isn’t covered by our standard services.' },
      { q: 'How does pricing work for custom work?',           a: 'Every custom project is quoted from scratch. We start with a 30-minute scoping call to understand the deliverables, timeline, and license needs, then send a **fixed-rate quote within 48 hours**.' },
      { q: 'Can you sign an NDA before discussing details?',   a: 'Yes — we sign **mutual NDAs** whenever a client requests one, no charge. Standard for pre-launch indie projects and unreleased IP.' },
      { q: 'Do you do retainers for ongoing work?',            a: 'Yes, starting around **$4k/month**. Retainers buy dedicated capacity, priority queue placement, and our best per-piece rate. Best for studios shipping a steady stream of art.' },
    ],
  },
} as const satisfies Record<string, ServiceData>

export type ServiceSlug = keyof typeof SERVICES

/* ---------------- Component ---------------- */

export default function ServiceDetailView({ data }: { data: ServiceData }) {
  const [activeTier, setActiveTier] = useState(1)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">
        {/* Breadcrumbs */}
        <div className="pt-[120px] pb-2">
          <Container>
            <nav aria-label="Breadcrumb" className="text-sm text-ink-500 flex items-center gap-2 flex-wrap">
              <Link href="/" className="hover:text-burgundy-700 transition-colors">Home</Link>
              <ChevronRight size={14} strokeWidth={1.5} />
              <Link href="/services" className="hover:text-burgundy-700 transition-colors">Services</Link>
              <ChevronRight size={14} strokeWidth={1.5} />
              <span className="text-ink-900">{data.title}</span>
            </nav>
          </Container>
        </div>

        {/* Hero (split) */}
        <section className="pt-6 pb-16 md:pb-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-4">
                  <SectionLabel>{data.eyebrow}</SectionLabel>
                </div>
                <h1
                  className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
                >
                  {data.titleHtml}
                </h1>

                {/* Lede via Markdown — surfaces **emphasis** + [links] */}
                <div className="text-lg text-ink-500 leading-[1.65] mt-5 max-w-[55ch] [&_p]:mb-0 [&_strong]:text-ink-700">
                  <Markdown>{data.lede}</Markdown>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button href="/order" variant="primary" size="lg">
                    Start commission <ArrowRight size={14} strokeWidth={1.8} />
                  </Button>
                  <Button href="/portfolio" variant="outline" size="lg">
                    See examples
                  </Button>
                </div>

                {/* 4-stat row (Starting / Turnaround / Resolution / Delivered) */}
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-5 pt-6 border-t border-dashed border-border-light">
                  {[
                    { v: data.startingPrice, l: 'Starting price' },
                    { v: data.turnaround,    l: 'Turnaround' },
                    { v: data.resolution,    l: 'Resolution' },
                    { v: data.delivered,     l: 'Pieces delivered' },
                  ].map((s) => (
                    <div key={s.l}>
                      <div className="font-display text-xl font-semibold text-ink-900">{s.v}</div>
                      <div className="text-[0.7rem] uppercase tracking-[0.15em] font-semibold text-ink-500 mt-1">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero image (gradient placeholder) */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-border-medium shadow-[0_16px_40px_-8px_rgba(30,20,8,0.25)]">
                <div className={cn('absolute inset-0 bg-gradient-to-br', data.heroGradient)} />
                <GoldCorners size={20} />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tome-950/60 backdrop-blur-sm border border-cream-50/20 text-cream-50 text-[0.7rem] uppercase tracking-[0.15em] font-semibold">
                  Featured · {data.title}
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* What's included — 6-card grid */}
        <section className="bg-parchment-100 border-y border-border-light py-20 md:py-28">
          <Container>
            <div className="text-center max-w-[720px] mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>What’s included</SectionLabel>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
                Six things in every <em className="font-display italic font-medium text-burgundy-700">commission</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
              {data.included.map((item) => (
                <div
                  key={item.name}
                  className="bg-parchment-50 border border-border-light rounded-xl p-6 flex gap-4"
                >
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-forest-700 text-cream-50 inline-flex items-center justify-center">
                    <Check size={16} strokeWidth={2.4} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-ink-500 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Pricing tiers — Standard / Deluxe (dark tome featured) / Premium */}
        <section className="bg-parchment-50 py-20 md:py-28">
          <Container>
            <div className="text-center max-w-[720px] mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>Pricing tiers</SectionLabel>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
                Three levels, <em className="font-display italic font-medium text-burgundy-700">your call</em>
              </h2>
              <p className="text-lg text-ink-500 mt-4 leading-relaxed">
                Same care across all three — the differences are scope, finish, and what’s included.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1100px] mx-auto">
              {data.tiers.map((tier, idx) => {
                const isActive = activeTier === idx
                const isFeatured = tier.featured
                return (
                  <button
                    key={tier.name}
                    type="button"
                    onClick={() => setActiveTier(idx)}
                    className={cn(
                      'relative text-left rounded-2xl p-8 border transition-all flex flex-col cursor-pointer',
                      isFeatured
                        ? 'bg-tome-950 text-cream-50 border-gold-500 shadow-[0_20px_48px_-12px_rgba(30,20,8,0.4)] md:-translate-y-2'
                        : isActive
                          ? 'bg-parchment-100 border-burgundy-700 shadow-[0_12px_32px_rgba(30,20,8,0.10)]'
                          : 'bg-parchment-100 border-border-light hover:border-border-medium hover:shadow-sm',
                    )}
                  >
                    {isFeatured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold-500 text-ink-900 text-[0.65rem] uppercase tracking-[0.18em] font-semibold whitespace-nowrap">
                        Most popular
                      </span>
                    )}

                    <div className={cn('font-display text-2xl font-semibold', isFeatured ? 'text-cream-50' : 'text-ink-900')}>
                      {tier.name}
                    </div>
                    <div className={cn('font-accent text-lg mt-1 mb-5', isFeatured ? 'text-gold-glow' : 'text-burgundy-700')}>
                      {tier.best}
                    </div>

                    <div className={cn('pb-5 mb-5 border-b', isFeatured ? 'border-cream-50/15' : 'border-border-light')}>
                      <div className={cn('font-display text-4xl font-semibold', isFeatured ? 'text-cream-50' : 'text-burgundy-700')}>
                        {tier.price}
                      </div>
                      <div className={cn('text-xs uppercase tracking-[0.12em] mt-1', isFeatured ? 'text-cream-200' : 'text-ink-500')}>
                        {tier.priceNote}
                      </div>
                    </div>

                    <ul className="space-y-2.5 mb-7 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className={cn('flex items-start gap-2 text-sm', isFeatured ? 'text-cream-200' : 'text-ink-700')}>
                          <Check size={14} strokeWidth={2.4} className={cn('mt-1 flex-shrink-0', isFeatured ? 'text-gold-glow' : 'text-forest-700')} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/order"
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        'mt-auto inline-flex items-center justify-center gap-2 px-7 py-[14px] rounded-full text-xs font-semibold uppercase tracking-[0.12em] border-[1.5px] transition-all',
                        isFeatured
                          ? 'bg-gold-500 border-transparent text-ink-900 hover:bg-gold-300'
                          : 'bg-transparent border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50',
                      )}
                    >
                      Choose {tier.name}
                    </Link>
                  </button>
                )
              })}
            </div>
          </Container>
        </section>

        {/* Example gallery — 4-card grid */}
        <section className="bg-parchment-100 border-y border-border-light py-20 md:py-28">
          <Container>
            <div className="text-center max-w-[720px] mx-auto mb-12">
              <div className="mb-4 flex justify-center">
                <SectionLabel>Recent {data.title.toLowerCase()}</SectionLabel>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight">
                Pieces from the <em className="font-display italic font-medium text-burgundy-700">last quarter</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {data.examples.map((ex) => (
                <article
                  key={ex.title}
                  className="group bg-parchment-50 border border-border-light rounded-xl overflow-hidden hover:border-border-medium hover:shadow-md transition-all"
                >
                  <div className={cn('aspect-[4/5] relative bg-gradient-to-br', ex.gradient)}>
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-tome-950/60 backdrop-blur-sm border border-cream-50/20 text-cream-50 text-[0.65rem] uppercase tracking-[0.15em] font-semibold">
                      {data.title}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-ink-900 leading-snug mb-1">
                      {ex.title}
                    </h3>
                    <div className="text-xs text-ink-500">{ex.meta}</div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button href="/portfolio" variant="outline" size="md">
                See all {data.title.toLowerCase()} <ArrowRight size={14} strokeWidth={1.8} />
              </Button>
            </div>
          </Container>
        </section>

        {/* Service-specific FAQ — answers via Markdown for **$ amounts** + [links] */}
        <section className="bg-parchment-50 py-20 md:py-28">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 max-w-[1080px] mx-auto">
              <div>
                <div className="mb-3">
                  <SectionLabel>About this service</SectionLabel>
                </div>
                <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 leading-[1.1] tracking-tight mb-4">
                  {data.title}, <em className="font-display italic font-medium text-burgundy-700">specifically</em>
                </h2>
                <p className="text-ink-500 leading-relaxed">
                  Common questions about the {data.title.toLowerCase()} process — what’s possible, what isn’t, and where the limits land.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {data.faq.map((item, idx) => {
                  const isOpen = openFaq === idx
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'rounded-xl border transition-colors',
                        isOpen
                          ? 'bg-parchment-50 border-border-medium shadow-sm'
                          : 'bg-parchment-100 border-border-light hover:border-border-medium',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        aria-expanded={isOpen}
                        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <span className="font-display text-lg md:text-xl font-semibold text-ink-900 leading-snug">
                          {item.q}
                        </span>
                        <span
                          className={cn(
                            'flex-shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-all',
                            isOpen
                              ? 'bg-burgundy-700 text-cream-50 rotate-45'
                              : 'bg-parchment-50 text-burgundy-700 border border-border-medium',
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
                            transition={{
                              duration: 0.28,
                              ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                            }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="px-6 pb-5 text-ink-700 leading-[1.7] max-w-[64ch] [&_p]:mb-0">
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

        {/* CTA closer — dark tome */}
        <section className="bg-tome-950 text-cream-50 py-20 md:py-28 text-center">
          <Container>
            <h2
              className="font-display font-semibold text-cream-50 leading-[1.1] tracking-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3rem)' }}
            >
              Ready to <em className="font-display italic font-medium text-gold-glow">commission</em>?
            </h2>
            <p className="text-lg text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-8">
              Three minutes to brief. Quote within 48 hours. First sketch within a week.
            </p>
            <div className="inline-flex flex-wrap justify-center gap-3.5">
              <Button href="/order" variant="gold" size="lg">
                Commission {data.title.toLowerCase()} <ArrowRight size={14} strokeWidth={1.8} />
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
