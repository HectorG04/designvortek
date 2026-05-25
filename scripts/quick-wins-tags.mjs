import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')
const env = readFileSync(envPath, 'utf8')
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => {
  const idx = l.indexOf('=')
  return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
}))

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY)

const updates = [
  { slug: 'hero-forge-to-handpainted',     addTags: ['dnd-5e', 'commissioning'] },
  { slug: 'vtt-token-deserves-more',        addTags: ['dnd-5e'] },
  { slug: 'strahd-npc-pack-six-weeks',      addTags: ['horror', 'dnd-5e'] },
  { slug: 'three-weeks-with-lyra',          addTags: ['fantasy', 'dnd-5e'] },
  { slug: 'choosing-a-commission-style',    addTags: ['fantasy','dnd-5e','sci-fi','cyberpunk','horror','modern','historical','souls-anime','western'] },
  { slug: 'how-to-write-commission-brief',  addTags: ['fantasy','dnd-5e','sci-fi','cyberpunk','horror','modern','historical','souls-anime','western'] },
  { slug: 'first-art-fair-booth',           addTags: ['studio'] },
]

for (const { slug, addTags } of updates) {
  const { data, error } = await supabase.from('blog_posts').select('tags').eq('slug', slug).single()
  if (error) { console.log(`⚠  ${slug}: ${error.message}`); continue }
  const existing = data?.tags ?? []
  const merged = [...new Set([...existing, ...addTags])]
  const { error: upErr } = await supabase.from('blog_posts').update({ tags: merged }).eq('slug', slug)
  if (upErr) { console.log(`✗  ${slug}: ${upErr.message}`) }
  else        { console.log(`✓  ${slug} → [${merged.join(', ')}]`) }
}
console.log('\nDone.')
