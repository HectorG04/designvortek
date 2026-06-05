/**
 * fetch-ctr-targets.mjs
 *
 * Pulls the current SEO title + description for the URLs that are ranking
 * but not getting clicks (from GSC data). Output goes to docs/seo/ctr-targets.json
 * so we can review and write better versions.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const envText = readFileSync(join(ROOT, '.env.local'), 'utf8')
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^["']|["']$/g,'')] }),
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Resources posts with impressions but zero clicks (highest impact first)
const SLUGS = [
  'dnd-character-art-commission-prices-2026',
  'character-art-commission-pricing',
  'dnd-party-portrait-commission-guide',
  'dnd-class-by-class-portrait-inspiration',
  'vtt-token-deserves-more',
  'strahd-npc-pack-six-weeks',
  'playing-a-tiefling-lineage-paint-hooks',
  'world-of-darkness-clans-visual-cheat-sheet',
]

const { data, error } = await supabase
  .from('blog_posts')
  .select('slug, title, seo_title, seo_description, excerpt')
  .in('slug', SLUGS)

if (error) { console.error(error); process.exit(1) }

const out = SLUGS.map((s) => data.find((d) => d.slug === s)).filter(Boolean)
const path = join(ROOT, 'docs', 'seo', 'ctr-targets.json')
writeFileSync(path, JSON.stringify(out, null, 2), 'utf8')
console.log(`Wrote ${out.length} posts to ${path.replace(ROOT, '.')}`)
console.log('')
for (const p of out) {
  console.log(`─── ${p.slug} ───`)
  console.log(`  title:        ${p.title}`)
  console.log(`  seo_title:    ${p.seo_title ?? '(not set — falls back to title)'}`)
  console.log(`  seo_desc:     ${p.seo_description ?? '(not set — falls back to excerpt)'}`)
  console.log(`  excerpt:      ${p.excerpt}`)
  console.log('')
}
