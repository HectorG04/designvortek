/**
 * list-all-posts-for-prompts.mjs
 *
 * Dumps every published blog post's slug + title + category + tags into a
 * JSON file the prompt-writer agents can consume. Used as the source of
 * truth for the "regenerate all cover images" pass.
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

const { data, error } = await supabase
  .from('blog_posts')
  .select('slug, title, category, tags, excerpt, is_pillar, pillar_genre')
  .eq('is_published', true)
  .order('slug', { ascending: true })

if (error) { console.error(error); process.exit(1) }

const out = join(ROOT, 'docs', 'seo', 'all-posts-inventory.json')
writeFileSync(out, JSON.stringify(data, null, 2), 'utf8')

console.log(`${data.length} posts written to docs/seo/all-posts-inventory.json`)
console.log('')
console.log('Distribution by category:')
const byCat = {}
for (const p of data) {
  const c = p.category || '(none)'
  byCat[c] = (byCat[c] || 0) + 1
}
for (const [c, n] of Object.entries(byCat).sort((a,b) => b[1] - a[1])) {
  console.log(`  ${n.toString().padStart(3)}  ${c}`)
}
console.log('')
console.log('Pillars:')
for (const p of data.filter((x) => x.is_pillar)) {
  console.log(`  - ${p.slug}  (${p.pillar_genre})`)
}
