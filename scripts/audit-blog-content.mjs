/**
 * audit-blog-content.mjs
 *
 * One-shot audit of the public-facing blog_posts in Supabase:
 *   - Which posts are missing a featured_image
 *   - Word count of each post's `content` field
 *   - Flag any post under 1000 words (likely "thin content")
 *
 * Run:  node scripts/audit-blog-content.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Load .env.local manually so we don't depend on dotenv
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

const URL = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing SUPABASE env vars in .env.local')
  process.exit(1)
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

const { data, error } = await supabase
  .from('blog_posts')
  .select('id,slug,title,featured_image,content,is_published,published_at')
  .eq('is_published', true)
  .order('slug', { ascending: true })

if (error) {
  console.error('Query failed:', error.message)
  process.exit(1)
}

const wc = (s) => (s || '').split(/\s+/).filter(Boolean).length

const noImage = data.filter((p) => !p.featured_image)
const short = data.filter((p) => wc(p.content) < 1000)

console.log(`\nTotal published posts in Supabase: ${data.length}`)
console.log(`Posts without featured_image:       ${noImage.length}`)
console.log(`Posts under 1000 words:             ${short.length}\n`)

console.log('=== Posts WITHOUT featured image ===')
for (const p of noImage) {
  console.log(`  [${wc(p.content).toString().padStart(5)} words]  ${p.slug}`)
  console.log(`         "${p.title}"`)
}

console.log('\n=== Posts UNDER 1000 words (thin content) ===')
for (const p of short.sort((a, b) => wc(a.content) - wc(b.content))) {
  console.log(`  [${wc(p.content).toString().padStart(5)} words]  ${p.slug}`)
}

console.log('\n=== Word count distribution ===')
const buckets = { '0-499': 0, '500-999': 0, '1000-1499': 0, '1500-1999': 0, '2000-2499': 0, '2500-2999': 0, '3000+': 0 }
for (const p of data) {
  const w = wc(p.content)
  if (w < 500) buckets['0-499']++
  else if (w < 1000) buckets['500-999']++
  else if (w < 1500) buckets['1000-1499']++
  else if (w < 2000) buckets['1500-1999']++
  else if (w < 2500) buckets['2000-2499']++
  else if (w < 3000) buckets['2500-2999']++
  else buckets['3000+']++
}
for (const [range, count] of Object.entries(buckets)) {
  console.log(`  ${range.padEnd(12)}  ${count}`)
}
