/**
 * audit-physical-media-language.mjs
 *
 * Scans every published blog_posts.content field in Supabase for
 * phrases that imply physical (oil-paint / canvas / easel) media
 * when the studio actually does digital painting.
 *
 * Reports by post: which phrases appear, how often, with snippets.
 *
 * Run: node scripts/audit-physical-media-language.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const envText = readFileSync(join(ROOT, '.env.local'), 'utf8')
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    }),
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

/* Phrases that strongly imply traditional / physical media.
 * Tiered by certainty so we can prioritise fixes. */
const PHRASES = [
  // TIER 1 — definitive physical-media tells. These almost always need replacement.
  { phrase: 'oil paint',         tier: 1 },
  { phrase: 'oil painting',      tier: 1 },
  { phrase: 'oil-painting',      tier: 1 },
  { phrase: 'oil-painted',       tier: 1 },
  { phrase: 'linseed',           tier: 1 },
  { phrase: 'sable brush',       tier: 1 },
  { phrase: 'sable brushes',     tier: 1 },
  { phrase: 'easel',             tier: 1 },
  { phrase: 'palette knife',     tier: 1 },
  { phrase: 'palette knives',    tier: 1 },
  { phrase: 'wet paint',         tier: 1 },
  { phrase: 'paint tube',        tier: 1 },
  { phrase: 'paint tubes',       tier: 1 },
  { phrase: 'brush jar',         tier: 1 },
  { phrase: 'paint rag',         tier: 1 },
  { phrase: 'gesso',             tier: 1 },
  { phrase: 'turpentine',        tier: 1 },
  { phrase: 'studio bench',      tier: 1 },
  { phrase: "painter's bench",   tier: 1 },

  // TIER 2 — physical pigment names. These read as oil-paint vocabulary.
  // (They're also used as color names in digital painting, so context matters.)
  { phrase: 'alizarin crimson',  tier: 2 },
  { phrase: 'cadmium red',       tier: 2 },
  { phrase: 'cadmium yellow',    tier: 2 },
  { phrase: 'ivory black',       tier: 2 },
  { phrase: 'lead white',        tier: 2 },
  { phrase: 'titanium white',    tier: 2 },
  { phrase: 'ultramarine blue',  tier: 2 },
  { phrase: 'burnt umber',       tier: 2 },
  { phrase: 'raw umber',         tier: 2 },

  // TIER 3 — ambiguous. "Canvas" is sometimes legit ("canvas size in Photoshop")
  // but often implies a physical canvas. "Brushwork" / "brushstroke" are
  // valid in digital art. We flag these for manual review only.
  { phrase: 'canvas',            tier: 3 },
  { phrase: 'on canvas',         tier: 3 },
  { phrase: 'stretched canvas',  tier: 3 },
  { phrase: 'priming the canvas', tier: 3 },
  { phrase: 'oils',              tier: 3 }, // "in oils" / "with oils" — sometimes a metaphor

  // TIER 4 — the word "painted" / "hand-painted" itself is FINE in digital
  // art context. We don't flag it. But we do track "physically painted",
  // "real paint", etc.
  { phrase: 'real paint',        tier: 1 },
  { phrase: 'physical paint',    tier: 1 },
  { phrase: 'physically painted',tier: 1 },
]

const { data, error } = await supabase
  .from('blog_posts')
  .select('id, slug, title, content')
  .eq('is_published', true)
  .order('slug', { ascending: true })

if (error) {
  console.error('Query failed:', error.message)
  process.exit(1)
}

console.log(`Scanning ${data.length} published posts for ${PHRASES.length} problematic phrases…\n`)

const byPost = []        // [{ slug, title, hits: [{phrase, tier, count, snippets}] }]
const globalCounts = {}  // { phrase: totalCount }

for (const p of data) {
  const content = (p.content || '').toLowerCase()
  const hits = []
  for (const { phrase, tier } of PHRASES) {
    // Word-boundary regex to avoid partial matches (e.g., "canvas" in "scanvas").
    const re = new RegExp('\\b' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g')
    const matches = content.match(re)
    if (!matches) continue
    const count = matches.length

    // Capture one snippet per phrase (first occurrence, 80-char window).
    const idx = content.indexOf(phrase)
    const snippet =
      content.slice(Math.max(0, idx - 30), Math.min(content.length, idx + phrase.length + 30))
        .replace(/\s+/g, ' ')
        .trim()

    hits.push({ phrase, tier, count, snippet })
    globalCounts[phrase] = (globalCounts[phrase] || 0) + count
  }
  if (hits.length > 0) {
    byPost.push({ slug: p.slug, title: p.title, hits })
  }
}

/* ──────────────────────────────────────────────────────────────────────── */
console.log(`=== SUMMARY ===`)
console.log(`Affected posts: ${byPost.length} / ${data.length}`)
console.log(`Unaffected:     ${data.length - byPost.length}\n`)

console.log(`=== GLOBAL PHRASE COUNTS (across all posts) ===`)
const sortedPhrases = Object.entries(globalCounts).sort((a, b) => b[1] - a[1])
const tierOf = (p) => (PHRASES.find((x) => x.phrase === p) || {}).tier
const tierLabel = (t) =>
  t === 1 ? 'T1 definite' : t === 2 ? 'T2 pigment-name' : t === 3 ? 'T3 ambiguous' : 'T?'
for (const [phrase, count] of sortedPhrases) {
  console.log(`  ${count.toString().padStart(4)}  [${tierLabel(tierOf(phrase))}]  "${phrase}"`)
}

console.log(`\n=== BY POST (top 30 by hit count) ===`)
const sortedPosts = byPost
  .map((p) => ({ ...p, total: p.hits.reduce((s, h) => s + h.count, 0) }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 30)

for (const p of sortedPosts) {
  console.log(`\n${p.slug}  [${p.total} hits]`)
  console.log(`  "${p.title}"`)
  for (const h of p.hits) {
    console.log(`    [T${h.tier}] x${h.count}  "${h.phrase}"`)
    console.log(`           …${h.snippet}…`)
  }
}

if (byPost.length > 30) {
  console.log(`\n…and ${byPost.length - 30} more posts with fewer hits.`)
}

/* Tier-1 only count — the "definitely need to fix" cohort. */
const tier1Posts = byPost.filter((p) => p.hits.some((h) => h.tier === 1))
console.log(`\n=== TIER-1 COHORT (definite physical-media language) ===`)
console.log(`Posts with at least one Tier-1 hit: ${tier1Posts.length}`)
const tier1TotalHits = tier1Posts.reduce(
  (s, p) => s + p.hits.filter((h) => h.tier === 1).reduce((s, h) => s + h.count, 0),
  0,
)
console.log(`Total Tier-1 phrase occurrences: ${tier1TotalHits}`)
