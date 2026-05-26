/**
 * verify-wave3b-language.mjs
 * Live audit of the 4 Wave 3b articles in Supabase. Reports:
 *   - How many times "hand-painted" appears (this is OK, just for transparency)
 *   - How many times any physical-media term appears (these are NOT OK)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env.local'), 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^["']|["']$/g,'')] }),
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const SLUGS = [
  'dnd-party-portrait-commission-guide',
  'how-to-describe-dnd-character-to-artist',
  'hand-painted-character-art-vs-ai',
  'dnd-character-art-ai-vs-commissioned-vs-handpainted',
]

const OK_PHRASES = ['hand-painted', 'hand painted', 'digitally hand-painted', 'painted by a human']
const BANNED = [
  'oil paint', 'oil painting', 'linseed', 'sable brush', 'easel', 'palette knife',
  'wet paint', 'paint tube', 'brush jar', 'gesso', 'turpentine', 'varnish',
  'alizarin', 'cadmium red', 'cadmium yellow', 'ivory black', 'lead white',
  'titanium white', 'burnt umber', 'raw umber', 'ultramarine blue',
  'real paint', 'physical paint', "painter's bench", 'studio bench',
]

function countOccurrences(haystack, needle) {
  const re = new RegExp('\\b' + needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi')
  return (haystack.match(re) || []).length
}

const { data } = await supabase
  .from('blog_posts')
  .select('slug, content, title')
  .in('slug', SLUGS)

console.log('=== Wave 3b live-content audit ===\n')

for (const slug of SLUGS) {
  const post = data.find((p) => p.slug === slug)
  if (!post) { console.log(`  ✗ ${slug}: NOT FOUND in Supabase`); continue }

  console.log(`📄 ${slug}`)
  console.log(`   "${post.title}"`)

  // OK phrases (informational, not flagged)
  let okHits = []
  for (const phrase of OK_PHRASES) {
    const c = countOccurrences(post.content, phrase)
    if (c > 0) okHits.push(`${phrase}×${c}`)
  }
  console.log(`   ✅ OK phrases (digital-art term — intentional): ${okHits.join(', ') || 'none'}`)

  // Banned phrases (must be zero)
  let bannedHits = []
  for (const phrase of BANNED) {
    const c = countOccurrences(post.content, phrase)
    if (c > 0) bannedHits.push(`${phrase}×${c}`)
  }
  if (bannedHits.length === 0) {
    console.log(`   ✅ Banned phrases: ZERO`)
  } else {
    console.log(`   ❌ BANNED PHRASES FOUND: ${bannedHits.join(', ')}`)
  }
  console.log('')
}
