export const SITE_NAME = 'Design Vortex'
export const SITE_URL = 'https://designvortex.co'
export const SITE_TAGLINE = 'Premium Art Commissions'
export const SITE_DESCRIPTION =
  'Hand-painted TTRPG character portraits, VTT tokens, party illustrations, NPC packs, maps and bespoke art. Commissions from $25. Genre-agnostic, hand-drawn, never AI.'

/* Primary nav order — Home first (universal convention), then content
 * sections in the design order (Portfolio → Blog), Contact last so the
 * reach-out actions stay grouped on the right next to the CTA button. */
export const NAV_LINKS = [
  { label: 'Home',      href: '/' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'Services',  href: '/services', hasDropdown: true },
  { label: 'Process',   href: '/process' },
  { label: 'Pricing',   href: '/pricing' },
  { label: 'About',     href: '/about' },
  { label: 'Pillars',   href: '/pillars' },
  { label: 'Blog',      href: '/blog' },
  { label: 'Contact',   href: '/contact' },
]

/* Services dropdown — points at the new bucket detail routes
 * (/services/[bucket-slug]). Buckets match lib/services.ts BUCKETS,
 * minus the Commercial bucket which lives at /commercial. */
export const SERVICES_NAV = [
  { label: 'Character work',      href: '/services/character-work' },
  { label: 'Party work',          href: '/services/party-work' },
  { label: 'GM & world-building', href: '/services/gm-world-building' },
  { label: 'Maps',                href: '/services/maps' },
  { label: 'Tokens',              href: '/services/tokens' },
  { label: 'Subscription',        href: '/subscription' },
  { label: 'Commercial',          href: '/commercial' },
]

export const FOOTER_LINKS = {
  Studio: [
    { label: 'About',        href: '/about' },
    { label: 'Process',      href: '/process' },
    { label: 'Pricing',      href: '/pricing' },
    { label: 'Availability', href: '/availability' },
  ],
  Services: SERVICES_NAV,
  Resources: [
    { label: 'Pillars',        href: '/pillars' },
    { label: 'Blog',           href: '/blog' },
    { label: 'FAQ',            href: '/faq' },
    { label: 'Reviews',        href: '/reviews' },
    { label: 'Subscription',   href: '/subscription' },
    { label: 'Commercial',     href: '/commercial' },
    { label: 'Order Form',     href: '/order' },
    { label: 'Contact',        href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy',    href: '/privacy' },
    { label: 'Terms of Service',  href: '/terms' },
    { label: 'Refund Policy',     href: '/refunds' },
  ],
}

/** Homepage hero 2×2 thumb collage. `image` is optional — when set, an
 *  <Image> renders on top of the gradient (gradient becomes a tinted
 *  backdrop behind any transparent edges). `alt` describes the piece. */
export const HERO_THUMBS: Array<{
  label: string
  gradient: string
  image?: string
  alt?: string
}> = [
  {
    label: 'Character Art',
    gradient: 'from-violet-950 via-purple-800 to-indigo-700',
    image: '/images/portfolio/elgin-character.webp',
    alt: 'Elgin — a hand-painted character commission in the studio’s signature painterly style.',
  },
  {
    label: 'D&D Character Art',
    gradient: 'from-amber-950 via-orange-800 to-yellow-700',
    image: '/images/portfolio/dusk-character.webp',
    alt: 'Dusk — a hand-painted D&D character commission in the studio’s signature painterly style.',
  },
  {
    label: 'Halfbody Character',
    gradient: 'from-rose-950 via-pink-800 to-fuchsia-700',
    image: '/images/portfolio/echo-character.webp',
    alt: 'Echo — a half-body painted character commission in the studio’s signature painterly style.',
  },
  {
    label: 'NPC',
    gradient: 'from-emerald-950 via-teal-800 to-cyan-700',
    image: '/images/portfolio/npc-character.webp',
    alt: 'A hand-painted campaign NPC portrait in the studio’s signature painterly style.',
  },
]

/* =====================================================================
   SERVICES PREVIEW — 3 featured cards on the homepage strip.

   Values mirror the products flagged `is_featured_homepage = true` in
   the services table (see lib/services.ts SERVICES). Kept here as a
   simple constant so the homepage strip stays a static client
   component. If we later want admin to drive the strip live, swap
   ServicesPreview to fetch via fetchFeaturedHomepageProducts().
   ===================================================================== */
export const FEATURED_SERVICES = [
  {
    icon: 'star',
    title: 'Full-body Character Art',
    sub: 'your hero, painted',
    body: 'Full-figure portrait, head to toe. Painterly rendering, dramatic lighting, the character in their world.',
    features: ['Basic · Standard · Premium tiers', '7 to 14 day turnaround', '4K final delivery'],
    price: '$120',
    href: '/services/character-work',
  },
  {
    icon: 'token',
    title: 'Single Custom Token',
    sub: 'table-ready',
    body: 'A single character token painted from scratch for the virtual tabletop. Built for the circle, not cropped.',
    features: ['512 + 1024 px exports', 'Transparent PNG ready for Roll20 & Foundry', 'Bulk + bundle discounts'],
    price: '$40',
    href: '/services/tokens',
  },
  {
    icon: 'party',
    title: 'Party Portrait',
    sub: 'the whole gang',
    body: 'Group illustration of an adventuring party, family, or wedding party. Up to 8 figures, consistent style.',
    features: ['Up to 4 figures included', '14 to 21 day turnaround', 'Print-ready files'],
    price: '$350',
    href: '/services/party-work',
  },
] as const

/* =====================================================================
   PERSONAS (SEO content blocks)
   ===================================================================== */

/** Persona row entry. `image` / `imageFit` / `alt` are optional — set
 *  them on the entries that have real artwork; entries without them fall
 *  back to the gradient placeholder defined by `bg`. */
export interface Persona {
  tag: string
  num: string
  title: string
  titleEm: string
  titleAfter?: string
  sub: string
  body: string
  tags: readonly string[]
  cta: string
  href: string
  bg: string
  reverse: boolean
  image?: string
  imageFit?: 'cover' | 'contain'
  alt?: string
}

export const PERSONAS: readonly Persona[] = [
  {
    tag: 'D&D PLAYER · CLOSE-UP · 5:4',
    num: '01 · The Player',
    title: 'For your weekly',
    titleEm: 'D&D character',
    sub: 'your hero deserves a portrait',
    body: "You've played them for sixty sessions. You know their backstory better than your own. A cheap fiverr sketch or AI mash-up won't do them justice — a real painterly portrait will. We commission tieflings, half-orcs, drow rangers, gnome wizards, every flavor of fantasy character.",
    tags: ['Tabletop RPG portraits', 'D&D 5e & Pathfinder', 'All species welcome'],
    cta: 'See character portraits',
    href: '/portfolio',
    bg: 'persona-player',
    /* Portrait close-up source pre-cropped to 5:4 with top anchor so the
     * face stays in frame; uses object-cover to fill the slot edge-to-edge. */
    image: '/images/portfolio/player-closeup.webp',
    imageFit: 'cover' as const,
    alt: 'A hand-painted close-up D&D character portrait — intimate framing, painterly rendering, dramatic warm light.',
    reverse: false,
  },
  {
    tag: 'NPC PACK · ZIPPERON · 5:4',
    num: '02 · The Dungeon Master',
    title: 'For the',
    titleEm: 'campaign',
    titleAfter: " you've built",
    sub: 'consistent NPCs, ready for the table',
    body: "Running a long-form campaign? You need a cast that feels real — not stock art mashups that break the table's immersion. We do NPC packs in matching style: 5 to 20 portraits delivered to a schedule you can plan sessions around. Strahd campaigns, homebrew worlds, Curse of Strahd, Storm King's Thunder — we've illustrated for them all.",
    tags: ['NPC packs (5–20)', 'Matching style guarantee', 'VTT tokens included'],
    cta: 'See NPC packs',
    href: '/services/gm-world-building',
    bg: 'persona-dm',
    /* Wide 16:9 NPC scene — uses object-contain so the full composition
     * stays visible against the forest-burgundy gradient backdrop. */
    image: '/images/portfolio/npc-zipperon.webp',
    imageFit: 'contain' as const,
    alt: 'Zipperon — a hand-painted campaign NPC in the studio’s signature painterly style, ready for the table.',
    reverse: true,
  },
  {
    tag: 'PARTY PORTRAIT · HEIRLOOM · 5:4',
    num: '03 · The Gift Giver',
    title: 'For an',
    titleEm: '1800s heirloom',
    titleAfter: ' portrait',
    sub: 'their party, framed like family history',
    body:
      "Wedding, anniversary, retirement, milestone birthday — for the friend who's played D&D every Sunday for the last decade. We paint their adventuring party as a 19th-century family portrait: central oval cameo of the main party, supporting NPCs in smaller medallions around the edges, ornate gilded borders, the works. The kind of painting that gets passed down, not just hung. Surprise-friendly process — you brief us, we coordinate references with a co-conspirator at the table, you approve at every step.",
    tags: ['1800s heirloom style', 'Up to 8 figures', 'Surprise-friendly process'],
    cta: 'See party portraits',
    href: '/services/party-work',
    bg: 'persona-gift',
    /* Wide framed-piece artwork — uses object-contain so the gilded frame
     * + side medallions stay fully visible against the gradient backdrop.
     * Source is 16:9-ish, slot is 5:4, so letter-boxing is intentional. */
    image: '/images/portfolio/party-framed.webp',
    imageFit: 'contain' as const,
    alt: 'The Adventurers — a hand-painted party portrait in a 19th-century family-portrait composition: central oval cameo of the main party with supporting NPCs in smaller medallions, framed in gilded borders.',
    reverse: false,
  },
]

/* =====================================================================
   PORTFOLIO STRIP — category filter chips for the homepage strip.
   The actual piece data lives in lib/portfolio-pieces.ts; PortfolioStrip
   pulls the 8 featured pieces from there directly. Keep this list
   aligned with the `category` literal union in PortfolioPiece.
   ===================================================================== */
export const PORTFOLIO_CATEGORIES = [
  'All',
  'Character Art',
  'Tokens',
  'Portraits',
  'Anime',
  'Custom',
  'Weapons & Assets',
  'Character Sheets',
  'Emotes',
]

/* =====================================================================
   PROCESS STEPS
   ===================================================================== */
export const PROCESS_STEPS = [
  { num: '01', title: 'Discuss',  body: "Share your character, references, and vibe. We talk through what'll make the piece feel right." },
  { num: '02', title: 'Quote',    body: 'Within 48 hours, a clear quote with timeline. 30% deposit to hold your slot.' },
  { num: '03', title: 'Create',   body: 'Sketches, then color blocks, then final paint. Two rounds of revisions baked in.' },
  { num: '04', title: 'Deliver',  body: '4K final files, layered PSD if you want it. Yours to use, print, frame, share.' },
] as const

/* =====================================================================
   TESTIMONIALS
   ===================================================================== */
export const TESTIMONIALS = [
  {
    quote: "Lyra came back better than I could have pictured. Every revision sharpened the piece. This isn't a transaction — it's a collaboration.",
    name: 'Aria Mendel',
    initials: 'AM',
    role: 'D&D player · character commission',
    rating: 5,
  },
  {
    quote: 'Eight NPCs for Curse of Strahd, all in matching style, delivered on a schedule I could plan sessions around. Worth every dollar.',
    name: 'Marcus K.',
    initials: 'MK',
    role: 'Dungeon Master · NPC pack',
    rating: 5,
  },
  {
    quote: 'A wedding party portrait for my brother and his fiancée. They cried. I cried. The piece hangs above their mantel now.',
    name: 'Priya R.',
    initials: 'PR',
    role: 'Gift commission · party portrait',
    rating: 5,
  },
] as const

/* =====================================================================
   BLOG PREVIEW
   ===================================================================== */
export const BLOG_PREVIEW = [
  {
    slug: 'how-to-write-commission-brief',
    title: 'How to write a commission brief that gets the art you actually want',
    category: 'Guides',
    date: 'Mar 12 · 2026',
    readTime: '8 min read',
    excerpt: 'The difference between "tiefling sorcerer" and a brief I can paint from. A working checklist with examples.',
    gradient: 'from-violet-900 via-burgundy-700 to-amber-800',
  },
  {
    slug: 'three-weeks-with-lyra',
    title: "Three weeks with Lyra: from a player's note to a final painting",
    category: 'Behind the scenes',
    date: 'Feb 28 · 2026',
    readTime: '12 min read',
    excerpt: 'Sketches, color blocks, and the revision where everything clicked. A full process walkthrough.',
    gradient: 'from-amber-900 via-orange-700 to-rose-700',
  },
  {
    slug: 'vtt-token-deserves-more',
    title: 'Why your VTT token deserves more than a clipped headshot',
    category: 'D&D',
    date: 'Feb 11 · 2026',
    readTime: '5 min read',
    excerpt: 'A defense of the round portrait at 512px. Plus three tokens that earned their pixel budget.',
    gradient: 'from-emerald-900 via-teal-700 to-burgundy-700',
  },
] as const

/* =====================================================================
   AVAILABILITY (slot widget data)
   ===================================================================== */
export const CURRENT_AVAILABILITY = {
  month: 'May 2026',
  total: 5,
  slots: [
    { num: '01', booked: true },
    { num: '02', booked: true },
    { num: '03', booked: true },
    { num: '04', booked: false },
    { num: '05', booked: false },
  ],
} as const

/* =====================================================================
   FAQ (FAQPage schema)
   ===================================================================== */
/**
 * FAQ answers stored as MARKDOWN STRINGS so inline emphasis (**bold**, [links](/url))
 * survives the data layer. Rendered via <Markdown> wrapper component.
 * See memory/feedback-css-cascade-rules.md Rule 3.
 */
export const HOMEPAGE_FAQ = [
  {
    q: 'How much does a commission cost?',
    a: `Commissions range from **$25 for a converted VTT token** to **$900+ for an action scene illustration**. Character portraits start at $60 (bust) or $120 (full-body). NPC packs from $220 for five. Every quote is fixed up front, no surprises, no add-ons mid-project.

Prices in USD. See the full [pricing breakdown](/pricing) for every service.`,
  },
  {
    q: 'How long does a commission take?',
    a: `Turnaround is quoted as a range per tier, not a fixed date. Character bust portraits ship in **5 to 10 days**. Full-body character art runs **7 to 14 days**. VTT tokens are 3 to 7 days. NPC packs and party portraits run 2 to 6 weeks depending on figure count.

We frame these as ranges because everything is handcrafted, slot-limited, and revision-friendly.`,
  },
  {
    q: "What's included with every commission?",
    a: `Every commission includes **2 rounds of revisions**, the final piece at 4K (where applicable), PNG and JPG exports, and a transparent-background version where it makes sense. Sketch revisions are always free.`,
  },
  {
    q: 'Can I use the art commercially?',
    a: `Personal use (prints, social posts, your character sheet) is included with every commission. **Commercial licensing** for books, merch, streaming, or paid Patreons is **+40% of the base job price (flat)**. See [/commercial](/commercial) for retainer and publisher arrangements.`,
  },
  {
    q: 'Do you use AI in any part of the process?',
    a: `**No.** Every piece is hand-painted from scratch by a human artist. No AI generation, no auto-fills, no traced-over outputs. That's the entire point of the studio.

If you want to see the process, we share work-in-progress sketches and color blocks for every commission.`,
  },
  {
    q: "What if I'm not happy with the result?",
    a: `Two revisions are baked into every commission and we usually nail it well within that. If the piece is genuinely not what you wanted at the end, we refund the balance beyond the **30% deposit** (which covers our sketch work).

In two years and 200+ commissions, this has happened twice. Full [refund policy](/refunds).`,
  },
] as const
