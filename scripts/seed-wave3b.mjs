/**
 * seed-wave3b.mjs
 *
 * Reads each content-plan/wave3b/<slug>/{article.md, metadata.json}
 * and upserts as a blog_posts row in Supabase. Sets published_at to now.
 *
 * Upsert by slug so re-runs replace rather than duplicate.
 *
 * Run: node scripts/seed-wave3b.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const WAVE_DIR = join(ROOT, 'content-plan', 'wave3b')

const envText = readFileSync(join(ROOT, '.env.local'), 'utf8')
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^["']|["']$/g,'')] }),
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const slugs = readdirSync(WAVE_DIR).filter((f) => {
  const stat = readdirSync(join(WAVE_DIR, f), { withFileTypes: true }).length
  return existsSync(join(WAVE_DIR, f, 'article.md')) && existsSync(join(WAVE_DIR, f, 'metadata.json'))
})

console.log(`Found ${slugs.length} Wave 3b articles to seed:`)
slugs.forEach((s) => console.log('  -', s))
console.log('')

let inserted = 0
for (const slug of slugs) {
  const articlePath = join(WAVE_DIR, slug, 'article.md')
  const metaPath = join(WAVE_DIR, slug, 'metadata.json')
  const content = readFileSync(articlePath, 'utf8')
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'))

  // Sanity: confirm slug matches
  if (meta.slug !== slug) {
    console.error(`  ✗ ${slug}: metadata slug "${meta.slug}" mismatch — skipping`)
    continue
  }

  // Compose the row. published_at = now() so it's immediately public.
  const now = new Date().toISOString()
  const row = {
    slug: meta.slug,
    title: meta.title,
    excerpt: meta.excerpt,
    content,
    category: meta.category,
    tags: meta.tags,
    author_name: meta.author_name,
    read_time_minutes: meta.read_time_minutes,
    seo_title: meta.seo_title,
    seo_description: meta.seo_description,
    featured_image: meta.featured_image,
    is_published: meta.is_published ?? true,
    published_at: now,
    updated_at: now,
  }

  // Check if a row already exists for this slug
  const { data: existing } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    // Update
    const { error } = await supabase
      .from('blog_posts')
      .update(row)
      .eq('id', existing.id)
    if (error) {
      console.error(`  ✗ ${slug}: UPDATE failed — ${error.message}`)
      continue
    }
    console.log(`  ↻ ${slug}: updated existing row #${existing.id}`)
  } else {
    // Insert
    const { data, error } = await supabase
      .from('blog_posts')
      .insert(row)
      .select('id')
      .single()
    if (error) {
      console.error(`  ✗ ${slug}: INSERT failed — ${error.message}`)
      continue
    }
    console.log(`  ✓ ${slug}: inserted as row #${data.id}`)
  }
  inserted++
}

console.log(`\n${inserted}/${slugs.length} Wave 3b posts seeded.`)
