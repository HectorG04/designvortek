/* =====================================================================
   SERVICES — client-safe types + helpers + (empty) in-memory snapshot.

   This module is the type backbone for the new services / pricing
   restructure (per `Services Brief/Character-Art-Services-Brief.pdf`).
   It mirrors the pattern used by lib/portfolio-pieces.ts, lib/reviews.ts
   and lib/blog.ts:

   - Pure data + types here (no server-only imports, safe in client bundles)
   - lib/services-server.ts wraps Supabase reads and falls back to the
     snapshot below when the table is empty or unreachable.

   The SERVICES snapshot is intentionally EMPTY in Phase 1. It will be
   populated in Phase 2 (data seed) once we restructure the catalog into
   the 5 buckets + subscription. Public surfaces should NOT consume this
   module until Phase 3 — for now it exists only to define types and
   helpers the admin + Phase 2 seed depend on.
   ===================================================================== */

/* --------------------------------------------------------------------
   Buckets
   -------------------------------------------------------------------- */

export type ServiceBucket =
  | 'character-work'
  | 'party-work'
  | 'gm-world-building'
  | 'tokens'
  | 'subscription'

export interface BucketMeta {
  slug: ServiceBucket
  label: string
  tagline: string
  /** Whether this bucket appears in the public /services index. All 5
   *  buckets show on the index now that Commercial has been moved to a
   *  +40% add-on (seeded into `addons`) and a standalone /commercial
   *  landing page, per canonical HANDOFF v2. */
  showOnIndex: boolean
  /** Default order in nav menus / footer / index grid. */
  order: number
}

export const BUCKETS: readonly BucketMeta[] = [
  { slug: 'character-work',     label: 'Character work',     tagline: 'your hero, painted',     showOnIndex: true,  order: 1 },
  { slug: 'party-work',         label: 'Party work',         tagline: 'the whole gang',          showOnIndex: true,  order: 2 },
  { slug: 'gm-world-building',  label: 'GM & world-building', tagline: 'for the campaign',       showOnIndex: true,  order: 3 },
  { slug: 'tokens',             label: 'Tokens',             tagline: 'tabletop-ready',          showOnIndex: true,  order: 4 },
  { slug: 'subscription',       label: 'Subscription',       tagline: 'campaign companion',      showOnIndex: true,  order: 5 },
]

export function bucketLabel(slug: ServiceBucket): string {
  return BUCKETS.find((b) => b.slug === slug)?.label ?? slug
}

export function bucketTagline(slug: ServiceBucket): string {
  return BUCKETS.find((b) => b.slug === slug)?.tagline ?? ''
}

/* --------------------------------------------------------------------
   Pricing modes & payloads

   Every product picks one pricing mode. The payload shape lines up
   with the DB column `pricing` (jsonb). The discriminated union below
   makes downstream rendering exhaustive (TS forces every case).
   -------------------------------------------------------------------- */

export type PricingMode =
  | 'tiered'             // 3 tiers, e.g. Character Portrait $60 / $90 / $140
  | 'range'              // single card, "From $X to $Y" — Reference Sheet, Action Scene, Monster
  | 'per_extra'          // base + per-extra-member — Party Portrait + $80–120/extra
  | 'pack_with_qty'      // multiple pack sizes — NPC Pack 5 vs 10, Matched Party 4 vs 6
  | 'pct_uplift'         // percentage of base job — Commercial licensing +40%
  | 'monthly_recurring'  // subscription tier
  | 'quote_only'         // no fixed price, "request a quote" — Maps, Publisher retainer
  | 'flat'               // single price, no tiers — Token Pack 5 for $180, Convert-to-token $25

export interface PricingTier {
  name: string        // 'Basic' | 'Standard' | 'Premium' or product-specific
  price: number       // USD whole dollars
  note?: string       // 'bust shot' | 'half-body' | '4 tokens · $30 savings'
  features: string[]
  /** Highlight tier in the UI (gold ring, "most popular" flag). */
  featured?: boolean
  flag?: string       // 'Most popular' | 'Best value' etc.
}

export interface PricingRange       { low: number; high: number }
export interface PricingPerExtra    { base: number; extra_low: number; extra_high: number; extra_label?: string }
export interface PricingPack        { qty: number; price: number; label?: string }
export interface PricingPctUplift   { percent: number; label?: string }
export interface PricingMonthly     { monthly_price: number; included: string[]; cadence?: string }
export interface PricingQuote       { from_price?: number; cta_label?: string; cta_href?: string }
export interface PricingFlat        { price: number; label?: string }

export type PricingPayload =
  | { mode: 'tiered';             tiers: PricingTier[] }
  | { mode: 'range';              range: PricingRange }
  | { mode: 'per_extra';          per_extra: PricingPerExtra }
  | { mode: 'pack_with_qty';      pack: { packs: PricingPack[] } }
  | { mode: 'pct_uplift';         uplift: PricingPctUplift }
  | { mode: 'monthly_recurring';  monthly: PricingMonthly }
  | { mode: 'quote_only';         quote: PricingQuote }
  | { mode: 'flat';               flat: PricingFlat }

/* --------------------------------------------------------------------
   Product content shapes — used by detail pages
   -------------------------------------------------------------------- */

export interface IncludedItem { name: string; body: string }
export interface ExampleCard  { title: string; meta: string; gradient: string }
export interface FaqItem      { q: string; a: string }

/* --------------------------------------------------------------------
   Product interface
   -------------------------------------------------------------------- */

export interface ServiceProduct {
  slug: string
  name: string
  bucket: ServiceBucket
  eyebrow?: string

  lede?: string
  description?: string

  pricingMode: PricingMode
  pricing: PricingPayload

  turnaroundLowDays?: number
  turnaroundHighDays?: number
  revisionsIncluded?: number
  resolution?: string

  included: IncludedItem[]
  examples: ExampleCard[]
  faq: FaqItem[]

  bundleWithSlugs: string[]
  bundleUpliftCents?: number

  genreTags: string[]

  isPublished: boolean
  isFeaturedHomepage: boolean
  featuredOrder?: number

  seoTitle?: string
  seoDescription?: string

  sortOrder: number
}

/* --------------------------------------------------------------------
   Snapshot — 17 products across 5 buckets (canonical HANDOFF v2).

   Pricing, turnaround, and policy values reflect the locked decisions
   from `Services Brief/Character-Art-Services-Brief.pdf` plus user
   amendments:
     - Convert client art to token = $25 (was $15)
     - Commercial licensing = +40% flat (now seeded as an addon row,
       not as a product; see migration 0006 and /commercial landing)
     - 30% deposit, non-refundable after sketches
     - USD only

   Bundle product (Character + Token) links to vtt-token-single via
   bundleWithSlugs + bundleUpliftCents=2500 (+$25).

   Three products are flagged for the homepage strip:
     featuredOrder 1 → character-art-full-body
     featuredOrder 2 → vtt-token-single
     featuredOrder 3 → party-portrait
   -------------------------------------------------------------------- */

export const SERVICES: readonly ServiceProduct[] = [
  /* =====================================================================
     Bucket 1 — CHARACTER WORK
     ===================================================================== */
  {
    slug: 'character-portrait-bust',
    name: 'Character Portrait (bust)',
    bucket: 'character-work',
    eyebrow: 'head and shoulders',
    lede: 'Head-and-shoulders portrait of a single character. The fastest way to put a real face to the PC who has been living in your campaign for the last forty sessions.',
    pricingMode: 'tiered',
    pricing: {
      mode: 'tiered',
      tiers: [
        { name: 'Basic',    price: 60,  note: 'line + flat color',  features: ['Clean line art', 'Flat color', 'Plain background', '1 revision'] },
        { name: 'Standard', price: 90,  note: 'full rendering',     features: ['Light and shadow', 'Textured materials', 'Suggested setting', '2 revisions'], featured: true, flag: 'Most picked' },
        { name: 'Premium',  price: 140, note: 'detailed setting',   features: ['High detail', 'Atmospheric background', 'Effects and magic', '2 revisions'] },
      ],
    },
    turnaroundLowDays: 5,
    turnaroundHighDays: 10,
    revisionsIncluded: 2,
    resolution: '4K · 4096×4096',
    included: [
      { name: 'Clean reference handling', body: 'We work from your Hero Forge, sketches, or written brief.' },
      { name: '4K final delivery',        body: 'PNG and JPG at 4K, suitable for print up to 16×16 at 300dpi.' },
      { name: 'Transparent background',   body: 'Cut-out version included on Standard and Premium.' },
      { name: '2 revisions baked in',     body: 'Two paint-stage rounds plus unlimited sketch tweaks.' },
    ],
    examples: [
      { title: 'Aldric · half-elf paladin', meta: 'Standard · Mar 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
      { title: 'Drowned Captain Veska',     meta: 'Premium · Feb 2026',  gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Tess · tiefling sorcerer',  meta: 'Basic · Feb 2026',    gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
    ],
    faq: [
      { q: "What's the difference between Basic and Standard?", a: 'Basic is clean line art with flat color and a simple background. Standard adds full rendering, light and shadow, textured materials, and a suggested setting that fits the character.' },
      { q: 'Can I add a token to this?',                        a: 'Yes. The Character + Token bundle adds a matching VTT-ready token for +$25.' },
      { q: 'How many references should I send?',                a: '3 to 5 is the sweet spot. A Hero Forge link plus 2 or 3 mood images covers most briefs.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 1,
  },

  {
    slug: 'character-art-full-body',
    name: 'Full-body Character Art',
    bucket: 'character-work',
    eyebrow: 'your hero, painted',
    lede: 'Full-figure portrait, head to toe. Painterly rendering, dramatic lighting, the character in their world. The studio\'s signature offering.',
    pricingMode: 'tiered',
    pricing: {
      mode: 'tiered',
      tiers: [
        { name: 'Basic',    price: 120, note: 'standing pose',        features: ['Standing pose', 'Flat-rendered background', 'Simple gear detail', '1 revision'] },
        { name: 'Standard', price: 180, note: 'dynamic + scene',      features: ['Dynamic pose', 'Detailed background scene', 'Materials and textures', '2 revisions'], featured: true, flag: 'Most picked' },
        { name: 'Premium',  price: 280, note: 'cinematic + layered',  features: ['Cinematic composition', 'Atmospheric background', 'Lighting effects', '2 revisions', 'Layered PSD'] },
      ],
    },
    turnaroundLowDays: 7,
    turnaroundHighDays: 14,
    revisionsIncluded: 2,
    resolution: '4K · 4096×5120',
    included: [
      { name: 'Sketch stage before paint', body: 'We lock pose and composition with you before any color goes down.' },
      { name: '4K final delivery',         body: 'PNG and JPG, plus a 300dpi print-ready master.' },
      { name: 'Transparent background',    body: 'Cut-out version on Standard and Premium for VTT use.' },
      { name: 'Process updates',           body: 'Sketches, color blocks, progress shots every few days.' },
    ],
    examples: [
      { title: 'Lyra · tiefling sorcerer',  meta: 'Standard · Mar 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
      { title: 'Brielle · half-elf paladin', meta: 'Premium · Feb 2026',  gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Veska · drowned captain',   meta: 'Standard · Feb 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
    ],
    faq: [
      { q: 'What references work best?',    a: 'A Hero Forge screenshot or rough sketch, plus 2 or 3 mood images for palette and lighting. See our [briefing guide](/blog/how-to-write-commission-brief).' },
      { q: 'How long for the Premium tier?', a: 'Usually toward the high end of the 7 to 14 day range, plus a day or two for revisions.' },
      { q: 'Do you do non-D&D characters?',  a: 'Yes. Pathfinder, World of Darkness, original settings, homebrew species, sci-fi PCs. Send the brief.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: true,
    featuredOrder: 1,
    sortOrder: 2,
  },

  {
    slug: 'character-reference-sheet',
    name: 'Character Reference Sheet',
    bucket: 'character-work',
    eyebrow: 'the full turnaround',
    lede: 'Three to four views of the same character — front, side, three-quarter, plus expressions and detail call-outs. The asset you ship to other artists or use as your own canon reference.',
    pricingMode: 'range',
    pricing: { mode: 'range', range: { low: 250, high: 450 } },
    turnaroundLowDays: 10,
    turnaroundHighDays: 21,
    revisionsIncluded: 2,
    resolution: '4K master · all views',
    included: [
      { name: '3 to 4 angles delivered', body: 'Front, side, three-quarter standard. Add a back view or alt outfit at the top of the range.' },
      { name: 'Expression call-outs',    body: 'Two to four small head studies showing the character\'s emotional range.' },
      { name: 'Detail break-outs',       body: 'Close-ups of gear, magic items, or jewelry, labeled.' },
    ],
    examples: [
      { title: 'Lyra · sorcerer sheet',  meta: 'Mar 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
      { title: 'Aldric · paladin sheet', meta: 'Feb 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Veska · captain sheet',  meta: 'Jan 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
    ],
    faq: [
      { q: 'Why the range in price?',                                       a: '$250 is the floor with three views and a single expression. $450 adds extra angles, multiple expressions, and detail breakouts. We quote your specific brief inside that range.' },
      { q: 'Can I commission this for an existing character art piece?',    a: 'Yes. If you commissioned a portrait from us already, the reference sheet can use it as the anchor view and we will build the other angles to match.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 3,
  },

  {
    slug: 'character-token-bundle',
    name: 'Character + Token Bundle',
    bucket: 'character-work',
    eyebrow: 'matching token added',
    lede: 'Add a circular, VTT-ready token built from the same painting to any character portrait commission. Same palette, same lighting, instant table use.',
    pricingMode: 'flat',
    pricing: { mode: 'flat', flat: { price: 25, label: 'added to any portrait tier' } },
    revisionsIncluded: 1,
    resolution: '512 + 1024 px',
    included: [
      { name: 'Matching style',        body: 'Token is built from the same painting, so palette and lighting line up exactly.' },
      { name: 'Two export sizes',      body: '512px and 1024px transparent PNG, ready for Roll20 and Foundry.' },
      { name: 'Decorative border',     body: 'Painted token frame, simple or themed to match the character.' },
    ],
    examples: [
      { title: 'Lyra + matching token',   meta: 'Bundle · Mar 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
      { title: 'Aldric + matching token', meta: 'Bundle · Feb 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Veska + matching token',  meta: 'Bundle · Feb 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
    ],
    faq: [
      { q: 'When do I add this?',                                a: 'At order time. Tick the bundle box on any character portrait commission.' },
      { q: 'Can I add a token to a portrait I already ordered?', a: 'Yes, as a follow-up. Use the [convert-to-token](/services/tokens) flow if you have the art already, or order a [single token](/services/tokens) painted from scratch.' },
    ],
    bundleWithSlugs: ['character-portrait-bust', 'character-art-full-body'],
    bundleUpliftCents: 2500,
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 4,
  },

  /* =====================================================================
     Bucket 2 — PARTY WORK
     ===================================================================== */
  {
    slug: 'party-portrait',
    name: 'Party Portrait',
    bucket: 'party-work',
    eyebrow: 'the whole gang',
    lede: 'Group illustration of an adventuring party, family, or wedding party. Up to 4 figures in one composition at the base tier. Add extras up to 8 figures total.',
    pricingMode: 'tiered',
    pricing: {
      mode: 'tiered',
      tiers: [
        { name: 'Standard', price: 350, note: '4 figures, half-body',  features: ['Up to 4 figures', 'Half-body framing', 'Simple background', '2 revisions'] },
        { name: 'Premium',  price: 600, note: '4 figures, full scene', features: ['Up to 4 figures', 'Full-body figures', 'Detailed scene background', '2 revisions'], featured: true, flag: 'Most picked' },
      ],
    },
    turnaroundLowDays: 14,
    turnaroundHighDays: 21,
    revisionsIncluded: 2,
    resolution: '4K + 300dpi print master',
    included: [
      { name: 'Up to 4 figures included',  body: 'Add up to 4 more figures at $80 to $120 each, depending on detail level.' },
      { name: 'Composition sketch first',  body: 'We sketch the group layout before any face is painted, and you approve it.' },
      { name: 'Print-ready files',         body: 'Delivered at 4K plus a 300dpi master, sized for canvas prints up to 24 inches.' },
      { name: 'Surprise-friendly process', body: 'Gift commissions handled discreetly through a co-conspirator at the table.' },
    ],
    examples: [
      { title: 'Stormwatch party · 5 figures',     meta: 'Premium · Mar 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
      { title: 'Wedding party as adventurers',     meta: 'Premium · Feb 2026', gradient: 'from-amber-700 via-burgundy-700 to-tome-900' },
      { title: 'Twilight trio · 3 figures',        meta: 'Standard · Feb 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
    ],
    faq: [
      { q: 'How many figures total?',                   a: 'Up to 4 included in the base tier. Up to 8 with extras, at $80 to $120 per additional figure.' },
      { q: 'Can I order this as a surprise gift?',      a: 'Yes. We coordinate references with someone else at the table to keep it secret.' },
      { q: 'Do you do wedding party portraits?',        a: 'Often. Wedding parties as adventurers are one of our most-loved commissions.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: true,
    featuredOrder: 3,
    sortOrder: 1,
  },

  {
    slug: 'matched-party-set',
    name: 'Matched Party Set',
    bucket: 'party-work',
    eyebrow: 'separate portraits, unified style',
    lede: 'Individual portraits of each party member, painted to a shared style guide. Best for tables that want personal pieces but want them to feel like one campaign.',
    pricingMode: 'pack_with_qty',
    pricing: {
      mode: 'pack_with_qty',
      pack: {
        packs: [
          { qty: 4, price: 220, label: '4 portraits · matching style' },
          { qty: 6, price: 320, label: '6 portraits · pack discount' },
        ],
      },
    },
    turnaroundLowDays: 21,
    turnaroundHighDays: 35,
    revisionsIncluded: 2,
    resolution: '4K each',
    included: [
      { name: 'Style guide kickoff',  body: 'We agree palette, era, and lighting up front, then every portrait holds that line.' },
      { name: 'Independent portraits', body: 'Each piece is its own canvas, suited for character sheets, social, and prints.' },
      { name: 'Per-piece revisions',  body: 'Two revisions on each portrait, not pooled across the set.' },
    ],
    examples: [
      { title: 'Saltbound crew · 4 PCs',   meta: '4-pack · Mar 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
      { title: 'Mistveil cabal · 6 PCs',   meta: '6-pack · Feb 2026', gradient: 'from-burgundy-900 via-red-800 to-rose-700' },
      { title: 'Hexcrown company · 4 PCs', meta: '4-pack · Jan 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
    ],
    faq: [
      { q: "What's the difference vs. a Party Portrait?", a: 'Party Portrait is one composition with everyone in it. Matched Set is separate pieces with a shared visual language.' },
      { q: 'Can we add a player mid-set?',                a: 'Yes, at the per-piece rate of your tier. We hold the style guide so the new addition fits.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 2,
  },

  {
    slug: 'action-scene',
    name: 'Action / Scene Illustration',
    bucket: 'party-work',
    eyebrow: 'mid-encounter, mid-scene',
    lede: 'Your party in the middle of something. A boss fight, a heist, the council meeting before the war. Story-driven illustration with background, lighting, and momentum.',
    pricingMode: 'range',
    pricing: { mode: 'range', range: { low: 400, high: 900 } },
    turnaroundLowDays: 21,
    turnaroundHighDays: 35,
    revisionsIncluded: 2,
    resolution: '4K + 300dpi print master',
    included: [
      { name: 'Story brief intake',        body: 'We sit with the moment first, then sketch toward what it actually is.' },
      { name: 'Composition value studies', body: 'Multiple thumbnails before paint, so the storytelling lands.' },
      { name: 'Cinematic lighting',        body: 'Lighting designed to read the moment, not just illuminate the figures.' },
    ],
    examples: [
      { title: 'The Hexcrown last stand',     meta: 'Mar 2026', gradient: 'from-burgundy-900 via-red-800 to-rose-700' },
      { title: 'Council of the Salt Throne',  meta: 'Feb 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Cliffside summoning',         meta: 'Jan 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
    ],
    faq: [
      { q: 'Why the price range?',     a: 'Scope. $400 is a focused 2 to 3 figure scene with a suggested background. $900 is a cinematic moment with full environmental detail and multiple figures interacting.' },
      { q: 'Can this be a campaign cover?', a: 'Yes. Talk to us about commercial licensing if it is going to ship publicly. See [/commercial](/commercial).' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 3,
  },

  /* =====================================================================
     Bucket 3 — GM / WORLD-BUILDING
     ===================================================================== */
  {
    slug: 'npc-pack',
    name: 'NPC Pack',
    bucket: 'gm-world-building',
    eyebrow: "your campaign's cast",
    lede: 'A bench of supporting characters painted in matching style. The most efficient way to give a published module or homebrew world a face.',
    pricingMode: 'pack_with_qty',
    pricing: {
      mode: 'pack_with_qty',
      pack: {
        packs: [
          { qty: 5,  price: 220, label: '5 NPCs · matching style' },
          { qty: 10, price: 400, label: '10 NPCs · pack discount' },
        ],
      },
    },
    turnaroundLowDays: 21,
    turnaroundHighDays: 42,
    revisionsIncluded: 2,
    resolution: '4K each + matching tokens',
    included: [
      { name: 'Matching style guarantee', body: 'Every NPC shares the same palette, paper texture, and lighting language.' },
      { name: 'Kickoff style call',       body: 'Half-hour video call to lock palette, era, and tone before week one.' },
      { name: 'VTT tokens bundled',       body: 'Each NPC ships with a matching circular token. Normally a +$25 add-on per piece.' },
      { name: 'Schedule-friendly delivery', body: 'We commit to a cadence you can plan sessions around, usually 1 to 2 NPCs per week.' },
    ],
    examples: [
      { title: 'Strahd · 8-NPC pack',      meta: '10-pack · Mar 2026', gradient: 'from-burgundy-900 via-red-800 to-rose-700' },
      { title: 'Saltmarsh townsfolk',      meta: '5-pack · Feb 2026',  gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
      { title: 'Waterdeep nobles',         meta: '10-pack · Jan 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
    ],
    faq: [
      { q: 'Can I extend a 5-pack to 10 later?', a: 'Yes. We hold your style notes for 12 months, and the extra NPCs ship at the same per-piece rate.' },
      { q: 'Do you do published-module casts?', a: 'Often. Curse of Strahd, Saltmarsh, Storm King\'s Thunder, Waterdeep, plus homebrew. See our [Strahd pack walkthrough](/blog/strahd-npc-pack-six-weeks).' },
      { q: 'Are tokens really included?',       a: 'Yes. Every NPC in a pack gets a matching token at no extra cost.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 1,
  },

  {
    slug: 'monster-creature',
    name: 'Monster / Creature Art',
    bucket: 'gm-world-building',
    eyebrow: 'the things in the dark',
    lede: 'Creatures, monsters, and beasts. From a single beholder portrait to a custom homebrew big-bad ready for the table.',
    pricingMode: 'range',
    pricing: { mode: 'range', range: { low: 90, high: 250 } },
    turnaroundLowDays: 5,
    turnaroundHighDays: 14,
    revisionsIncluded: 2,
    resolution: '4K + token cut',
    included: [
      { name: 'Original or canon',     body: 'Painting D&D monsters, Pathfinder beasts, your homebrew abomination, all fair game.' },
      { name: 'Token cut included',    body: 'Circular VTT token from the same art, at no extra cost on this product.' },
      { name: 'Scale callout option',  body: 'If you want a human silhouette in-frame for scale, we will include one.' },
    ],
    examples: [
      { title: 'Bone naga',                   meta: 'Jan 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Sea-troll commander',         meta: 'Feb 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
      { title: 'Custom homebrew big bad',     meta: 'Mar 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
    ],
    faq: [
      { q: 'Why the price range?',                   a: '$90 is a single-monster bust with a simple background. $250 is a full creature with environmental detail, scale reference, and multiple poses if needed.' },
      { q: 'Can I commission a copyrighted monster?', a: 'For personal table use, yes (fan art). For commercial use, we would need the rights holder\'s permission. See [terms](/terms).' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 2,
  },

  {
    slug: 'item-artifact',
    name: 'Item / Artifact Illustrations',
    bucket: 'gm-world-building',
    eyebrow: 'the magic in the bag',
    lede: 'Magic items, artifacts, weapons, jewelry, scrolls. Single illustration or 6-piece bundles for an entire loot table.',
    pricingMode: 'pack_with_qty',
    pricing: {
      mode: 'pack_with_qty',
      pack: {
        packs: [
          { qty: 1, price: 30,  label: 'single item'  },
          { qty: 6, price: 150, label: '6-pack bundle' },
        ],
      },
    },
    turnaroundLowDays: 3,
    turnaroundHighDays: 14,
    revisionsIncluded: 1,
    resolution: '2K + transparent',
    included: [
      { name: 'Single or bundle',      body: '$30 for one item, $150 for six. The bundle is the better deal once you cross three items.' },
      { name: 'Transparent background', body: 'Drop into handouts, loot cards, character sheets.' },
      { name: 'Detail callouts (bundle)', body: 'On 6-packs, we will lay them out on a single sheet if you want a hand-out format.' },
    ],
    examples: [
      { title: 'Hex-lantern set · 6 items',    meta: '6-pack · Mar 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Sword of the dawnbringer',     meta: 'Single · Feb 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
      { title: 'Saltbound relic bundle',       meta: '6-pack · Jan 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
    ],
    faq: [
      { q: 'Is the bundle 6 separate images or one sheet?', a: 'Six separate images by default. We can lay them out on a single sheet at no extra charge if you ask.' },
      { q: 'How fast for a single item?',                   a: 'Usually 3 to 5 days. Bundles take 7 to 14 days depending on detail.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 3,
  },

  {
    slug: 'battle-map',
    name: 'Battle Map',
    bucket: 'gm-world-building',
    eyebrow: 'hand-drawn, gridded, VTT-ready',
    lede: 'Encounter maps painted by hand for in-person or virtual tabletop play. Gridded or ungridded, color or black & white, sized to your needs.',
    pricingMode: 'quote_only',
    pricing: {
      mode: 'quote_only',
      quote: { from_price: 150, cta_label: 'Request a map quote', cta_href: '/services/maps' },
    },
    revisionsIncluded: 2,
    resolution: 'Sized to brief',
    included: [
      { name: 'Hand-drawn aesthetic', body: 'Old cartography feel, hand-lettered labels available, paper-texture overlays.' },
      { name: 'VTT-ready exports',    body: 'Roll20 and Foundry-compatible PNG at the right pixel-per-square count.' },
      { name: 'Color or B&W',         body: 'We do both. B&W reads cleaner at small print sizes, color reads better on screen.' },
    ],
    examples: [
      { title: 'The dock fight · 30×40 grid', meta: 'Mar 2026', gradient: 'from-burgundy-900 via-red-800 to-rose-700' },
      { title: 'Hexcrown council hall',       meta: 'Feb 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Cliffside ritual ground',     meta: 'Jan 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
    ],
    faq: [
      { q: 'Why is this quote-only?',                 a: 'Maps vary enormously in scope. A small ambush map is different from a 60×80 city-block fight. We quote per brief.' },
      { q: 'Do you do digital labels or hand-lettered?', a: 'Both. Hand-lettered for the medieval feel, digital for legibility at small sizes.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 4,
  },

  {
    slug: 'world-region-map',
    name: 'World / Region Map',
    bucket: 'gm-world-building',
    eyebrow: 'decorative, stylized, campaign-anchoring',
    lede: 'Region or full-world map for homebrew campaigns and modules. Stylized, decorative, the kind that gets pinned to the wall behind the GM screen.',
    pricingMode: 'quote_only',
    pricing: {
      mode: 'quote_only',
      quote: { from_price: 300, cta_label: 'Request a map quote', cta_href: '/services/maps' },
    },
    revisionsIncluded: 2,
    resolution: 'Print + digital master',
    included: [
      { name: 'Stylized cartography', body: 'Painted, not procedural. Decorative compass roses, sea monsters in the corners, gilded borders if you want them.' },
      { name: 'Labels and place names', body: 'Hand-lettered or typeset, your call. Up to 30 named places at the floor of the price range.' },
      { name: 'Print-ready master',   body: 'Sized for canvas or paper print as well as digital.' },
    ],
    examples: [
      { title: 'The Hexcrown Coast',       meta: 'Mar 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Saltbound Archipelago',    meta: 'Feb 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
      { title: 'The Inverted Realm',       meta: 'Jan 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
    ],
    faq: [
      { q: 'How many places can I name on a $300 map?',                a: 'Up to 30 named places at the floor. More places, more rivers, more icons all add cost.' },
      { q: 'Can I commission a region map first and a world map later?', a: 'Yes. We hold the style notes so the world map will match if you scale up.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 5,
  },

  /* =====================================================================
     Bucket 4 — TOKENS (standalone)
     ===================================================================== */
  {
    slug: 'vtt-token-single',
    name: 'Single Custom Token',
    bucket: 'tokens',
    eyebrow: 'table-ready',
    lede: 'A single character token painted from scratch for the virtual tabletop. Built for the circular frame, not cropped from a square portrait.',
    pricingMode: 'range',
    pricing: { mode: 'range', range: { low: 40, high: 60 } },
    turnaroundLowDays: 3,
    turnaroundHighDays: 7,
    revisionsIncluded: 1,
    resolution: '512 + 1024 px',
    included: [
      { name: 'Designed for the circle', body: 'Head and shoulders sized to fill the round frame. No clipped corners.' },
      { name: 'Two export sizes',        body: '512px for the table, 1024px for hover and inspect.' },
      { name: 'Decorative border',       body: 'Painted frame: ornate, simple, or themed to fit the character.' },
      { name: 'Transparent PNG',         body: 'Drop into Roll20, Foundry, Owlbear Rodeo, anywhere a round PNG belongs.' },
    ],
    examples: [
      { title: 'Drow ranger token',  meta: 'Mar 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
      { title: 'Dwarf cleric token', meta: 'Feb 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Wraith token',       meta: 'Jan 2026', gradient: 'from-burgundy-900 via-red-800 to-rose-700' },
    ],
    faq: [
      { q: 'Why the price range?',                       a: '$40 is a clean token with a simple border. $60 adds glow effects, more elaborate frames, or animated-feeling design.' },
      { q: 'Can you match an existing portrait of mine?', a: 'Yes. Send the portrait and we will build a matching token. Mention "matching portrait" in your brief.' },
      { q: 'Do you do animated tokens?',                 a: 'Not yet. Static PNG only. Animation is on the roadmap.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: true,
    featuredOrder: 2,
    sortOrder: 1,
  },

  {
    slug: 'vtt-token-pack-5',
    name: 'Token Pack (5 originals)',
    bucket: 'tokens',
    eyebrow: 'your whole table',
    lede: 'Five custom tokens painted in matching style. The cheapest way to get the whole party on the screen at once.',
    pricingMode: 'flat',
    pricing: { mode: 'flat', flat: { price: 180, label: '5 original tokens' } },
    turnaroundLowDays: 7,
    turnaroundHighDays: 14,
    revisionsIncluded: 1,
    resolution: '512 + 1024 px each',
    included: [
      { name: 'Matching border style',  body: 'All five tokens share a frame design, so the party reads as one set.' },
      { name: 'Bulk discount baked in', body: 'Per-token is $36 in a 5-pack vs $40 to $60 individually.' },
      { name: 'Mixed PCs and NPCs fine', body: 'Use the five slots however you want.' },
    ],
    examples: [
      { title: 'Adventuring party · 5 tokens', meta: 'Mar 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
      { title: 'Mixed party + NPC set',        meta: 'Feb 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Cult of the Salt Throne',      meta: 'Jan 2026', gradient: 'from-burgundy-900 via-red-800 to-rose-700' },
    ],
    faq: [
      { q: 'Can I order 4 tokens instead of 5?', a: 'Order four individual tokens. The 5-pack is a discount that activates at 5 tokens.' },
      { q: 'Can I get more than 5 in a pack?',   a: 'We quote 8+ token sets individually since the per-token rate keeps dropping. Reach out.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 2,
  },

  {
    slug: 'convert-to-token',
    name: 'Convert Client Art to Token',
    bucket: 'tokens',
    eyebrow: 'from your existing art',
    lede: 'You have a portrait already. We turn it into a clean, circular VTT-ready token with a decorative border. No repainting, just expert cropping and token design.',
    pricingMode: 'flat',
    pricing: { mode: 'flat', flat: { price: 25, label: 'per token' } },
    turnaroundLowDays: 2,
    turnaroundHighDays: 5,
    revisionsIncluded: 1,
    resolution: '512 + 1024 px',
    included: [
      { name: 'Smart crop',         body: 'We crop and reframe so the head fills the circle properly, not a clipped square.' },
      { name: 'Decorative border',  body: 'Painted frame that suits the character. Choose simple, ornate, or themed.' },
      { name: 'Transparent PNG',    body: 'Drop-in ready for Roll20, Foundry, anywhere round PNGs go.' },
    ],
    examples: [
      { title: 'Half-orc paladin token', meta: 'Mar 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Drow rogue token',       meta: 'Feb 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
      { title: 'Half-elf bard token',    meta: 'Jan 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
    ],
    faq: [
      { q: 'What art can I send?',                          a: "Anything you have the right to use. A portrait from us, from another artist (with their OK), or from yourself. We don't convert AI-generated art." },
      { q: "What if the original art doesn't crop well?",   a: 'We will flag it before charging you. Some pieces need a partial repaint, which we would quote at single-token rates instead.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 3,
  },

  /* =====================================================================
     Bucket 5 — SUBSCRIPTION
     (Commercial is no longer a bucket: see /commercial landing page and
     the +40% addon row seeded in migration 0006.)
     ===================================================================== */
  {
    slug: 'subscription-companion',
    name: 'Campaign Companion',
    bucket: 'subscription',
    eyebrow: 'monthly drip',
    lede: 'Ten tokens plus two NPCs every month, painted to a campaign style guide we set up once. For GMs whose tables eat through references between sessions. Six-month minimum commitment so the studio can plan a steady cadence.',
    pricingMode: 'monthly_recurring',
    pricing: {
      mode: 'monthly_recurring',
      monthly: {
        monthly_price: 75,
        included: ['10 tokens', '2 NPCs'],
        cadence: 'Ships on the 15th of each month · 6 months minimum',
      },
    },
    revisionsIncluded: 1,
    resolution: '512 + 1024 px tokens · 4K NPCs',
    included: [
      { name: '10 tokens + 2 NPCs / month',  body: 'Mix of player tokens, NPC tokens, and supporting character portraits.' },
      { name: 'Locked style guide',          body: 'We set palette, era, and lighting in your first month and hold the line on every later piece.' },
      { name: '6 months minimum',            body: "Subscriptions run for six full cycles so the studio can plan a steady cadence. You can pause within that window if life happens, but cancellation comes after the sixth paid cycle." },
      { name: 'First-month payment upfront', body: 'No deposit model. You pay the month, you get the month\'s drop.' },
    ],
    examples: [
      { title: 'Active subscriber: Hexcrown table',    meta: 'Started Q4 2025', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Active subscriber: Saltbound campaign', meta: 'Started Q1 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
      { title: 'Active subscriber: Vesper home game',  meta: 'Started Q1 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
    ],
    faq: [
      { q: "What if I don't use my monthly allotment?", a: "Unused slots don't roll over. Use them or lose them. Most subscribers use 80% or more each month." },
      { q: 'Can I swap a token for an NPC?',            a: 'Yes. One NPC counts as roughly 3 tokens of slot. We work it out at your monthly check-in.' },
      { q: 'Why a 6-month minimum?',                    a: 'Subscriptions exist so the studio can reserve a steady cadence of work for your table. Six months lets us lock in the style guide, hold capacity, and keep per-piece rates low. After the sixth cycle you can pause or cancel any time.' },
      { q: 'Can I pause during the 6 months?',          a: 'Yes — pause up to two cycles within the commitment window if your campaign goes on hiatus. The minimum is paid cycles, not calendar months.' },
      { q: 'How do I cancel after the 6 months?',       a: 'Email us before the 10th of the month and your next cycle will not bill.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 1,
  },

  {
    slug: 'subscription-gm',
    name: 'Campaign Companion · GM Tier',
    bucket: 'subscription',
    eyebrow: 'the campaign keeper',
    lede: 'Tokens, NPCs, and one battle map every month. Built for long-form campaigns that need a steady drip of art without thinking about it. Six-month minimum commitment so the studio can plan a steady cadence.',
    pricingMode: 'monthly_recurring',
    pricing: {
      mode: 'monthly_recurring',
      monthly: {
        monthly_price: 150,
        included: ['~15 tokens', '3 NPCs', '1 battle map'],
        cadence: 'Ships on the 15th of each month · 6 months minimum',
      },
    },
    revisionsIncluded: 1,
    resolution: '512 + 1024 px tokens · 4K NPCs · standard battle map',
    included: [
      { name: 'Everything in Companion plus more', body: 'Bigger token and NPC allotment, plus a standard battle map every month.' },
      { name: 'Map size baseline',                 body: '30×40 or smaller fits the included scope. Larger maps quoted separately at retainer-friendly rates.' },
      { name: '6 months minimum',                  body: "Subscriptions run for six full cycles so the studio can plan a steady cadence. Pause up to two cycles within the window if your campaign goes on hiatus. Cancellation comes after the sixth paid cycle." },
      { name: 'Same style guide model',            body: 'Set up once. Every piece stays in style for the duration of your campaign.' },
    ],
    examples: [
      { title: 'Active subscriber: Strahd long-form', meta: 'Started Q3 2025', gradient: 'from-burgundy-900 via-red-800 to-rose-700' },
      { title: 'Active subscriber: Hexcrown saga',    meta: 'Started Q4 2025', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
      { title: 'Active subscriber: Saltmarsh GM',     meta: 'Started Q1 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
    ],
    faq: [
      { q: "What counts as a 'battle map'?",                 a: 'Standard battle map up to 30×40 squares. Larger maps come out of separate retainer-friendly quotes.' },
      { q: 'Can the GM tier replace a custom NPC pack?',     a: 'Often, yes. Three NPCs per month is close to a 6-month custom NPC pack at a fraction of the upfront cost.' },
      { q: 'Why a 6-month minimum?',                         a: 'GM tier reserves a meaningful chunk of monthly studio capacity, including a battle map. Six months lets us plan around your campaign so quality stays consistent. After the sixth cycle you can pause or cancel any time.' },
      { q: 'Can I pause during the 6 months?',               a: 'Yes — pause up to two cycles within the commitment window. The minimum is paid cycles, not calendar months.' },
      { q: 'Can I pause without losing my style guide?',     a: 'Yes. We hold style guides for 12 months after the last paid cycle.' },
    ],
    bundleWithSlugs: [],
    genreTags: [],
    isPublished: true,
    isFeaturedHomepage: false,
    sortOrder: 2,
  },
]

/* --------------------------------------------------------------------
   Synchronous accessors over the snapshot
   -------------------------------------------------------------------- */

function sortByBucketThenSort(a: ServiceProduct, b: ServiceProduct): number {
  const aOrder = BUCKETS.find((x) => x.slug === a.bucket)?.order ?? 999
  const bOrder = BUCKETS.find((x) => x.slug === b.bucket)?.order ?? 999
  if (aOrder !== bOrder) return aOrder - bOrder
  return a.sortOrder - b.sortOrder
}

export function getAllProducts(): ServiceProduct[] {
  return [...SERVICES].filter((s) => s.isPublished).sort(sortByBucketThenSort)
}

export function getProductsByBucket(bucket: ServiceBucket): ServiceProduct[] {
  return SERVICES
    .filter((s) => s.bucket === bucket && s.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getProductBySlug(slug: string): ServiceProduct | undefined {
  return SERVICES.find((s) => s.slug === slug)
}

export function getFeaturedHomepageProducts(limit = 3): ServiceProduct[] {
  return SERVICES
    .filter((s) => s.isPublished && s.isFeaturedHomepage)
    .sort((a, b) => (a.featuredOrder ?? 9999) - (b.featuredOrder ?? 9999))
    .slice(0, limit)
}

/** Bucket → products map, used by the services index + bucket detail
 *  pages. Empty buckets remain as keys so consumers can render an
 *  "empty state" without special-casing. */
export function getBucketProducts(): Record<ServiceBucket, ServiceProduct[]> {
  const out = {} as Record<ServiceBucket, ServiceProduct[]>
  for (const b of BUCKETS) out[b.slug] = []
  for (const s of getAllProducts()) out[s.bucket].push(s)
  return out
}

/* --------------------------------------------------------------------
   Display helpers — used by tier card / pricing pill renderers
   -------------------------------------------------------------------- */

/** USD price line for a card chip. Returns short forms suited for
 *  small surfaces (homepage strip, /services bucket card). */
export function formatPriceLine(p: ServiceProduct): string {
  const pp = p.pricing
  switch (pp.mode) {
    case 'tiered': {
      if (pp.tiers.length === 0) return 'Quote'
      const min = Math.min(...pp.tiers.map((t) => t.price))
      return `From $${min}`
    }
    case 'range':
      return `From $${pp.range.low}`
    case 'per_extra':
      return `From $${pp.per_extra.base}`
    case 'pack_with_qty': {
      if (pp.pack.packs.length === 0) return 'Quote'
      const min = Math.min(...pp.pack.packs.map((q) => q.price))
      return `From $${min}`
    }
    case 'pct_uplift':
      return `+${pp.uplift.percent}%`
    case 'monthly_recurring':
      return `$${pp.monthly.monthly_price}/mo`
    case 'quote_only':
      return pp.quote.from_price != null ? `From $${pp.quote.from_price}` : 'Quote'
    case 'flat':
      return `$${pp.flat.price}`
  }
}

/** Longer USD label used on tier cards and price pages. */
export function formatPriceDetail(p: ServiceProduct): string {
  const pp = p.pricing
  switch (pp.mode) {
    case 'tiered': {
      if (pp.tiers.length === 0) return 'Quote'
      const min = Math.min(...pp.tiers.map((t) => t.price))
      const max = Math.max(...pp.tiers.map((t) => t.price))
      return min === max ? `$${min}` : `$${min} – $${max}`
    }
    case 'range':
      return `From $${pp.range.low} to $${pp.range.high}`
    case 'per_extra':
      return `From $${pp.per_extra.base} · +$${pp.per_extra.extra_low}–${pp.per_extra.extra_high} per extra`
    case 'pack_with_qty': {
      if (pp.pack.packs.length === 0) return 'Quote'
      return pp.pack.packs.map((q) => `$${q.price} (${q.qty})`).join(' · ')
    }
    case 'pct_uplift':
      return `+${pp.uplift.percent}% of base job`
    case 'monthly_recurring':
      return `$${pp.monthly.monthly_price} / month`
    case 'quote_only':
      return pp.quote.from_price != null ? `From $${pp.quote.from_price} · Custom quote` : 'Custom quote'
    case 'flat':
      return `$${pp.flat.price}${pp.flat.label ? ` · ${pp.flat.label}` : ''}`
  }
}

/** Turnaround label like "2–4 weeks" / "7–14 days" / "By scope". */
export function formatTurnaround(p: ServiceProduct): string {
  const lo = p.turnaroundLowDays
  const hi = p.turnaroundHighDays
  if (lo == null && hi == null) return 'By scope'
  if (lo != null && hi != null) {
    // If both are >= 14, render as weeks for readability.
    if (lo >= 14 && hi >= 14 && lo % 7 === 0 && hi % 7 === 0) {
      return `${lo / 7}–${hi / 7} weeks`
    }
    return `${lo}–${hi} days`
  }
  return `${lo ?? hi} days`
}

/** Plain-text bundle uplift label, e.g. "+$25". */
export function formatBundleUplift(p: ServiceProduct): string | null {
  if (p.bundleUpliftCents == null) return null
  return `+$${(p.bundleUpliftCents / 100).toFixed(0)}`
}

/* --------------------------------------------------------------------
   Turnaround summary — computed live from the actual product data so
   every "average turnaround" stat on the site stays factual as the
   catalog evolves.
   -------------------------------------------------------------------- */

export interface TurnaroundSummary {
  /** Tokens (single, pack, convert). */
  tokens: string
  /** Character work (portrait, full-body, reference sheet) — excludes
   *  the token-bundle add-on which has no turnaround of its own. */
  portraits: string
  /** Group + NPC work: party portraits, matched sets, action scenes,
   *  NPC packs, monsters, items. */
  partyAndPacks: string
  /** Quote-only items (maps). */
  maps: string
  /** Short one-line inline summary for stat strips, e.g.
   *  "Tokens 2-7 days · Portraits 5-21 days · Party & NPC packs 2-6 weeks". */
  inline: string
  /** Single-bucket lookup, useful in feature lists. */
  byBucket: Record<ServiceBucket, string>
}

/* Renders a {low, high} day range as either "X-Y days" or "X-Y weeks"
 * depending on whether both ends cleanly divide by 7 in the weeks band. */
function fmtRange(low: number, high: number): string {
  if (!Number.isFinite(low) || !Number.isFinite(high)) return 'By scope'
  if (low >= 14 && high >= 14) {
    const lowW = Math.round(low / 7)
    const highW = Math.round(high / 7)
    return `${lowW} to ${highW} weeks`
  }
  return `${low} to ${high} days`
}

function computeRange(products: readonly ServiceProduct[]) {
  const lows = products
    .map((p) => p.turnaroundLowDays)
    .filter((n): n is number => typeof n === 'number')
  const highs = products
    .map((p) => p.turnaroundHighDays)
    .filter((n): n is number => typeof n === 'number')
  if (lows.length === 0 || highs.length === 0) return null
  return { low: Math.min(...lows), high: Math.max(...highs) }
}

export function getTurnaroundSummary(): TurnaroundSummary {
  const tokens     = SERVICES.filter((s) => s.bucket === 'tokens')
  const portraits  = SERVICES.filter((s) => s.bucket === 'character-work')
  const partyAndPacks = SERVICES.filter(
    (s) =>
      (s.bucket === 'party-work' || s.bucket === 'gm-world-building') &&
      s.pricingMode !== 'quote_only',
  )

  const tRange = computeRange(tokens)
  const pRange = computeRange(portraits)
  const gRange = computeRange(partyAndPacks)

  const tokensStr     = tRange ? fmtRange(tRange.low, tRange.high) : 'By scope'
  const portraitsStr  = pRange ? fmtRange(pRange.low, pRange.high) : 'By scope'
  const partyStr      = gRange ? fmtRange(gRange.low, gRange.high) : 'By scope'

  /* Per-bucket short label (used in card feature lists). */
  const byBucket = {} as Record<ServiceBucket, string>
  for (const b of BUCKETS) {
    const bucketProducts = SERVICES.filter(
      (s) => s.bucket === b.slug && s.pricingMode !== 'quote_only' && s.pricingMode !== 'monthly_recurring',
    )
    const r = computeRange(bucketProducts)
    byBucket[b.slug] = r ? fmtRange(r.low, r.high) : b.slug === 'subscription' ? 'Ships the 15th' : 'By scope'
  }

  return {
    tokens: tokensStr,
    portraits: portraitsStr,
    partyAndPacks: partyStr,
    maps: 'quoted per brief',
    inline: `Tokens ${tokensStr} · Portraits ${portraitsStr} · Party & NPC packs ${partyStr} · Maps quoted per brief`,
    byBucket,
  }
}
