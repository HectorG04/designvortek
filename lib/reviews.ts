/* =====================================================================
   REVIEWS — Supabase-backed with in-memory fallback.

   Single source of truth for:
     - /reviews page (24 cards + aggregate + JSON-LD)
     - homepage Testimonials section (3-card row, filtered to featured)

   24 reviews snapshot below: 18 from the same commissioners as the
   portfolio pieces (so each review pairs to the artwork on /portfolio),
   plus 6 from new names for general studio praise. Server fetchers live
   in lib/reviews-server.ts (next/headers boundary).
   ===================================================================== */

export interface Review {
  /** Stable slug derived from name + counter — used as React keys and to
   *  deduplicate across seed re-runs. The DB has its own integer id; this
   *  slug is only used by the in-memory fallback. */
  key: string
  customerName: string
  /** Initials for the round avatar chip. 2 chars max. */
  initials: string
  /** "Character commission", "Party portrait · gift", "NPC pack · 5", etc. */
  role: string
  /** Markdown allowed — bold for the key beat of the review. */
  content: string
  rating: 1 | 2 | 3 | 4 | 5
  /** ISO date string (used to format "Mar 2026" on display). */
  date: string
  /** Show on homepage testimonials row + flagged in admin. */
  featured: boolean
  /** Portfolio slug this review references, if any. Used for cross-links
   *  later; not displayed yet. */
  portfolioSlug?: string
  /** Optional category tag — usually maps to the linked portfolio piece's
   *  category. Becomes the small chip under the review on /reviews. */
  serviceType?: string
}

/* ---------- 24 seeded reviews ---------- */
/* Order is roughly newest-first by date so the public grid reads as a
 * recent stream. Featured = top 6 by emotional impact / variety. */
export const REVIEWS: Review[] = [
  {
    key: 'tess-r-vesper',
    customerName: 'Tess R.',
    initials: 'TR',
    role: 'Character commission · D&D',
    content:
      "Vesper turned out exactly as I had her in my head, which is the trick. The toe rings and the signet ring are there. The teeth look right. I have been playing her for years and now she looks back at me from the screen.",
    rating: 5,
    date: '2026-02-06',
    featured: true,
    portfolioSlug: 'vesper-goldclaw-feral-wizard',
    serviceType: 'Character Art',
  },
  {
    key: 'marcus-t-brielle',
    customerName: 'Marcus T.',
    initials: 'MT',
    role: 'Character commission',
    content:
      "Two-line brief, one specific ask, and they nailed it. Brielle reads as comfortable in her own body in a way I had never managed in my own sketches. The warmth in the painting is what I keep coming back to.",
    rating: 5,
    date: '2026-02-13',
    featured: false,
    portfolioSlug: 'aderall',
    serviceType: 'Character Art',
  },
  {
    key: 'davin-r-alex',
    customerName: 'Davin R.',
    initials: 'DR',
    role: 'Character commission · D&D',
    content:
      "I had three other artists try Alex before. None of them got the **simmering** part. This piece reads as a paladin who could snap, which is exactly who he is at our table. The red glow in the cape took two passes and the second pass was right.",
    rating: 5,
    date: '2026-01-25',
    featured: true,
    portfolioSlug: 'alex-evildoer',
    serviceType: 'Character Art',
  },
  {
    key: 'elena-v-amalura',
    customerName: 'Elena V.',
    initials: 'EV',
    role: 'Character commission',
    content:
      "Amalura is half ranger half death cleric and the brief asked for both halves to share a body without one swallowing the other. The pauldron wolf and the necrotic glow ended up doing that work. I have not stopped looking at the scales.",
    rating: 5,
    date: '2026-04-07',
    featured: false,
    portfolioSlug: 'amalura',
    serviceType: 'Character Art',
  },
  {
    key: 'sarah-k-ironhand',
    customerName: 'Sarah K.',
    initials: 'SK',
    role: 'Character commission · action',
    content:
      "Three rounds of lineart felt like a lot at the time. Looking at the final, it had to be three. The Ironhand reads as **mid-swing**, not posing. The graffiti on the wall behind him is the detail my players notice every session.",
    rating: 5,
    date: '2025-12-10',
    featured: false,
    portfolioSlug: 'bride-of-herne',
    serviceType: 'Character Art',
  },
  {
    key: 'mira-o-thalia',
    customerName: 'Mira O.',
    initials: 'MO',
    role: 'Character ref sheet',
    content:
      "I asked for a reference sheet because Thalia shows up in too many session photos to keep redrawing her. The scar across her face reads correctly in every pose. The Malar symbol on her armor looks hand-painted, which is exactly what I wanted.",
    rating: 5,
    date: '2026-02-18',
    featured: false,
    portfolioSlug: 'caracal-thalia',
    serviceType: 'Character Art',
  },
  {
    key: 'bren-h-corwin',
    customerName: 'Bren H.',
    initials: 'BH',
    role: 'Character commission · 6th',
    content:
      "Sixth piece for the same ranger over four campaigns. By now they know how he stands without me writing it down. Every Corwin painting feels like the same person, which is exactly the continuity I commission for.",
    rating: 5,
    date: '2026-03-31',
    featured: true,
    portfolioSlug: 'ebag-ranger',
    serviceType: 'Character Art',
  },
  {
    key: 'tova-l-thistle',
    customerName: 'Tova L.',
    initials: 'TL',
    role: 'Character commission · anthro',
    content:
      "Thistle is an anthropomorphic rabbit ranger with a polished sword he never actually fights with. The pose lands as welcoming and slightly smug, which is the whole character. The pink streaks in his fur shimmer like they should.",
    rating: 5,
    date: '2025-12-02',
    featured: false,
    portfolioSlug: 'thistle-quickpaw',
    serviceType: 'Character Art',
  },
  {
    key: 'magnus-v-gwyn',
    customerName: 'Magnus V.',
    initials: 'MV',
    role: 'Character commission · grimdark',
    content:
      "I had written this character for years before commissioning the painting. The brief had footnotes for the wolf head. They read every one of them. The grin on the trophy is small enough that people notice it on the second viewing, which is what I asked for.",
    rating: 5,
    date: '2025-12-10',
    featured: false,
    portfolioSlug: 'hammock-chaos-warrior',
    serviceType: 'Character Art',
  },
  {
    key: 'hayden-k-banner',
    customerName: 'Hayden K.',
    initials: 'HK',
    role: 'Custom · campaign banner',
    content:
      "I wanted atmosphere, not a portrait. The brief was four lines. The result is a temple interior at the right kind of cold that opens the campaign hub for my players. Worth every back-and-forth on the torch palette.",
    rating: 5,
    date: '2026-04-20',
    featured: false,
    portfolioSlug: 'hayden-banner',
    serviceType: 'Custom',
  },
  {
    key: 'petra-d-brann',
    customerName: 'Petra D.',
    initials: 'PD',
    role: 'Pathfinder character',
    content:
      "A jotunborn monk who is also a circus strongman is a weird brief. The purple glow under the skin landed as amethyst rather than neon, which made all the difference. The strongman moustache was a late add and I would not let them take it back out.",
    rating: 5,
    date: '2026-05-08',
    featured: true,
    portfolioSlug: 'jockey-jotunborn-monk',
    serviceType: 'Character Art',
  },
  {
    key: 'reyn-s-lexia',
    customerName: 'Reyn S.',
    initials: 'RS',
    role: 'PFP · D&D rogue',
    content:
      "Approved the first lineart in twelve minutes. The half-drow had the right age in her face, which is what I keep failing to get from other token artists. Works as a profile picture AND prints to mini face size cleanly.",
    rating: 5,
    date: '2026-04-01',
    featured: false,
    portfolioSlug: 'lexia-half-drow-rogue',
    serviceType: 'Tokens',
  },
  {
    key: 'wynn-o-desert-five',
    customerName: 'Wynn O.',
    initials: 'WO',
    role: 'Party portrait · 5 figures',
    content:
      "Five characters in one frame, weird west campaign, year-long Kingsley joke baked into the background. Every personality reads correctly without flattening anyone. Tara is still trying too hard, Xander is still effortless, and Maud is still smug over a fake gravestone.",
    rating: 5,
    date: '2026-05-11',
    featured: true,
    portfolioSlug: 'mouse-desert-five',
    serviceType: 'Portraits',
  },
  {
    key: 'idris-p-nangram',
    customerName: 'Idris P.',
    initials: 'IP',
    role: 'Character · body horror',
    content:
      "The concept was wolf into the bones of a human. They held the hunch through every revision and kept the chimplike feet I asked for. The tie dragging in his right hand does more storytelling than any of the teeth.",
    rating: 5,
    date: '2026-04-03',
    featured: false,
    portfolioSlug: 'nan-gram-were',
    serviceType: 'Character Art',
  },
  {
    key: 'corwin-b-trio',
    customerName: 'Corwin B.',
    initials: 'CB',
    role: 'TTRPG art · 3 characters',
    content:
      "Print-friendly black and white sci-fi trio for a homebrew RPG. The legal guardrails were strict and I went in nervous about how generic the result would feel. Instead I got three characters with personality that hold up at home laser printer resolution.",
    rating: 5,
    date: '2026-05-21',
    featured: false,
    portfolioSlug: 'natknight-sci-trio',
    serviceType: 'Portraits',
  },
  {
    key: 'wren-a-nerd',
    customerName: 'Wren A.',
    initials: 'WA',
    role: 'VTT token · Pathfinder',
    content:
      "Hobgoblin investigator token, designed so the crossbow grip can swap to a pistol later. They built that future-proofing in without me asking twice. Reads as ready, not aggressive, which was the only specific note in the brief.",
    rating: 4,
    date: '2026-04-05',
    featured: false,
    portfolioSlug: 'nerd-hobgoblin-token',
    serviceType: 'Tokens',
  },
  {
    key: 'jordan-w-palmer',
    customerName: 'Jordan W.',
    initials: 'JW',
    role: 'Character commission',
    content:
      "Two sentences and a folder of references. The piece came back as a wandering blade with quiet menace, which is somehow exactly what I had been failing to describe out loud. Sparse briefs are a gift if the references are good, apparently.",
    rating: 5,
    date: '2026-03-06',
    featured: false,
    portfolioSlug: 'palmerjwm-portrait',
    serviceType: 'Character Art',
  },
  {
    key: 'bram-h-pixel',
    customerName: 'Bram H.',
    initials: 'BH',
    role: 'Character commission',
    content:
      "One specific note in the entire brief: pink mohawk. Everything else was an old woman running. The result holds the joke AND the danger at once, which is what kept the bit alive at our table all year.",
    rating: 5,
    date: '2026-05-04',
    featured: false,
    portfolioSlug: 'pixel-runaway',
    serviceType: 'Character Art',
  },
  {
    key: 'laura-d-wedding',
    customerName: 'Laura D.',
    initials: 'LD',
    role: 'Custom · wedding avatars',
    content:
      "Chibi avatars for our wedding website. We tested a GPT mockup first and the shoulders were wrong on every render. This came back recognizable, flattering, and small enough to survive at navigation-bar size. The art has to last longer than the website, and it will.",
    rating: 5,
    date: '2026-03-18',
    featured: true,
    portfolioSlug: 'tharriq-laura-wedding',
    serviceType: 'Custom',
  },
  {
    key: 'reyes-k-truck',
    customerName: 'Reyes K.',
    initials: 'RK',
    role: 'Cyberpunk commission',
    content:
      "Cyberpunk runner with tech-hair, chemskin, and butterfly swords. First pass was warmer, second pass pulled the palette toward purple, and that is the one that ended up right. The first pass was correct and the second was right. Not always the same thing.",
    rating: 5,
    date: '2026-02-02',
    featured: false,
    portfolioSlug: 'truck-cyberpunk',
    serviceType: 'Character Art',
  },
  {
    key: 'mira-f-coral',
    customerName: 'Mira F.',
    initials: 'MF',
    role: 'D&D sorcerer · party',
    content:
      "Sailor moon with teeth was the only direction I gave them. Coral came back as manic-pixie horror with a quieter sadness behind the eyes, which is the character I have been playing for two years. The teeth are doing a lot of quiet work.",
    rating: 5,
    date: '2026-05-11',
    featured: false,
    portfolioSlug: 'truck2-shark-sorcerer',
    serviceType: 'Character Art',
  },
  {
    key: 'aldric-m-glaive',
    customerName: 'Aldric M.',
    initials: 'AM',
    role: 'Magic item card',
    content:
      "Three escalating stages of the same glaive, drawn so the silhouette stays consistent and only the bloom climbs. The engraving on the blade reveals itself at dawn, which was the exact behavior I needed for the item card.",
    rating: 5,
    date: '2026-03-22',
    featured: false,
    portfolioSlug: 'tyrannosaurus-glaive',
    serviceType: 'Custom',
  },
  {
    key: 'cassian-d-vergil',
    customerName: 'Cassian D.',
    initials: 'CD',
    role: 'Fan art commission',
    content:
      "Souls-style gothic horror was the brief and the brief did most of the heavy lifting. The age in the face reads as earned, which is the hardest part of an aging hunter to get right. The hands carry most of it. The hat does the rest.",
    rating: 5,
    date: '2026-04-18',
    featured: false,
    portfolioSlug: 'vergil-hunter',
    serviceType: 'Character Art',
  },
  {
    key: 'wolf-b-kenji',
    customerName: 'Wolf B.',
    initials: 'WB',
    role: 'Album cover art',
    content:
      "Cover art for an indie hip-hop release. The art had to hold up at album scale AND read clean cropped to a streaming thumbnail. The glasses survived the crop, which is the test I cared about most.",
    rating: 5,
    date: '2026-03-18',
    featured: false,
    portfolioSlug: 'wolf-shonen-fanart',
    serviceType: 'Anime',
  },

  /* ---------- General studio praise — no portfolio link ---------- */
  {
    key: 'aria-mendel-general',
    customerName: 'Aria Mendel',
    initials: 'AM',
    role: 'Returning client',
    content:
      "This is my fourth commission with the studio. I keep coming back because the **communication** is the same every time. Sketches every three days. Quote that does not move. Revisions baked in. Nothing I have to chase.",
    rating: 5,
    date: '2026-03-15',
    featured: true,
    serviceType: 'Character Art',
  },
  {
    key: 'priya-r-gift',
    customerName: 'Priya R.',
    initials: 'PR',
    role: 'Party portrait · gift',
    content:
      "Anniversary gift for my brother and his fiancée — both lifelong D&D players. The party portrait hangs above their mantel now and the photo of them seeing it for the first time is one of my favorites.",
    rating: 5,
    date: '2026-02-22',
    featured: true,
    serviceType: 'Portraits',
  },
  {
    key: 'james-t-drow',
    customerName: 'James T.',
    initials: 'JT',
    role: 'Character commission',
    content:
      "Four artists over five years failed to paint my drow ranger to my satisfaction. This is the one. The patience and care show in every brushstroke and you can feel it through the screen.",
    rating: 5,
    date: '2026-01-18',
    featured: false,
    serviceType: 'Character Art',
  },
  {
    key: 'rosa-c-fast',
    customerName: 'Rosa C.',
    initials: 'RC',
    role: 'Character commission',
    content:
      "Communication was thoughtful from the first email. The painting came back better than the mood board I sent. And it arrived a day early. I have nothing to nitpick.",
    rating: 5,
    date: '2025-12-22',
    featured: false,
    serviceType: 'Character Art',
  },
  {
    key: 'devon-l-cover',
    customerName: 'Devon L.',
    initials: 'DL',
    role: 'Book cover commission',
    content:
      "Indie game cover, three artists deep before this one. Got it on the second sketch. The print run sold out faster than I had stocked for. I sent them flowers.",
    rating: 5,
    date: '2025-11-28',
    featured: false,
    serviceType: 'Custom',
  },
  {
    key: 'emma-h-conversation',
    customerName: 'Emma H.',
    initials: 'EH',
    role: 'First-time client',
    content:
      "First commission I have ever ordered where the artist asked good questions back. Felt like a real conversation, not a transaction. I keep recommending them to my table.",
    rating: 4,
    date: '2025-11-12',
    featured: false,
    serviceType: 'Character Art',
  },
]

/* ---------- Aggregate rating ----------
 * Derived from REVIEWS so it stays in sync. Average rounded to one
 * decimal; counts grouped by rating. These numbers also feed the JSON-LD
 * AggregateRating on the /reviews page for SEO. */
export function computeAggregate(reviews: Review[]) {
  const total = reviews.length
  if (total === 0) {
    return {
      average: 0,
      total: 0,
      breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0, pct: 0 })),
    }
  }
  const sum = reviews.reduce((s, r) => s + r.rating, 0)
  const average = Math.round((sum / total) * 10) / 10
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length
    const pct = Math.round((count / total) * 100)
    return { stars, count, pct }
  })
  return { average, total, breakdown }
}

/* ---------- Sync helpers (client-safe fallback) ---------- */

/** All reviews, newest-first. */
export function getAllReviews(): Review[] {
  return [...REVIEWS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

/** Featured-only reviews for the homepage testimonials row. */
export function getFeaturedReviews(limit?: number): Review[] {
  const featured = getAllReviews().filter((r) => r.featured)
  return typeof limit === 'number' ? featured.slice(0, limit) : featured
}

/** Render-friendly date ("Mar 2026"). */
export function formatReviewDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
