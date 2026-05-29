/**
 * update-pillar-links-in-content.mjs
 *
 * Scan every blog_posts.content field for inline `/pillars/...` markdown
 * links and rewrite to `/guides/...`. The route-level 308 redirect would
 * handle these anyway, but updating the source URLs avoids the extra
 * round-trip and keeps the content clean.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
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
  .select('id, slug, content')
  .eq('is_published', true)

if (error) { console.error(error); process.exit(1) }

console.log(`Scanning ${data.length} posts for /pillars/ references in markdown body...`)
let updated = 0
for (const post of data) {
  const before = post.content || ''
  // Replace bare `/pillars/<slug>` (in markdown links, parens, or text)
  const after = before.replace(/\/pillars\//g, '/guides/')
  if (after !== before) {
    const occurrences = (before.match(/\/pillars\//g) || []).length
    const { error: updErr } = await supabase
      .from('blog_posts')
      .update({ content: after, updated_at: new Date().toISOString() })
      .eq('id', post.id)
    if (updErr) {
      console.error(`  ✗ ${post.slug}: ${updErr.message}`)
      continue
    }
    console.log(`  ✓ ${post.slug}  (${occurrences} link${occurrences === 1 ? '' : 's'} rewritten)`)
    updated++
  }
}
console.log(`\n${updated}/${data.length} posts updated.`)
