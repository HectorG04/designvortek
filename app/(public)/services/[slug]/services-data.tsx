/* =====================================================================
   SERVICES DATA — server-safe module (no 'use client').

   Why this file exists separately:
   The service detail route has a server entry (page.tsx) that needs to
   read SERVICES inside generateStaticParams() and generateMetadata().
   If SERVICES lives in a `'use client'` file (ServiceDetailView.tsx),
   Next.js puts the export behind the client-module boundary at build
   time — the server sees a client reference rather than the actual
   object, so `Object.keys(SERVICES)` is empty and `SERVICES[slug]` is
   undefined → 404 in production.

   Keeping data here (plain .tsx, no directive) lets both the server
   page.tsx AND the client ServiceDetailView.tsx import directly.

   JSX is allowed in this file because it's only rendered through React's
   normal tree — no runtime serialization across the RSC boundary needed.
   ===================================================================== */

export type Tier = {
  name: string
  best: string
  price: string
  priceNote: string
  features: string[]
  featured?: boolean
}

export type Example = {
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
