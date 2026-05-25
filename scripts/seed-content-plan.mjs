/* Seed the `blog_posts` table from the content-plan directory.
 *
 * Walks content-plan/{pillars,games,spokes,evergreen} recursively, finds every
 * folder that contains BOTH `article.md` and `metadata.json`, and upserts a
 * row into blog_posts keyed by slug.
 *
 * Idempotent: existing rows are updated in place; new rows are inserted.
 *
 * Default behaviour: posts are seeded with `is_published = false` so they're
 * staged in the admin without going live. Toggle `is_published = true` on
 * each row in the admin UI (or in bulk via SQL) to publish.
 *
 * Usage:
 *   node scripts/seed-content-plan.mjs
 *   node scripts/seed-content-plan.mjs --publish    # seed with is_published=true
 *   node scripts/seed-content-plan.mjs --dry-run    # print what would happen, don't write
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

/* ----------------------------- env loader ----------------------------- */
const envPath = resolve(__dirname, '..', '.env.local')
try {
  const envText = readFileSync(envPath, 'utf-8')
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (key && !process.env[key]) process.env[key] = value
  }
} catch {
  /* fall through */
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

/* ----------------------------- CLI flags ----------------------------- */
const args = process.argv.slice(2)
const PUBLISH = args.includes('--publish')
const DRY_RUN = args.includes('--dry-run')

console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'WRITE'} | Publish: ${PUBLISH ? 'YES' : 'no (is_published=false)'}\n`)

/* ----------------------------- walker ----------------------------- */
const ROOT = resolve(__dirname, '..', 'content-plan')
const SECTIONS = ['pillars', 'games', 'spokes', 'evergreen']

function walkArticles(root) {
  const out = []
  for (const section of SECTIONS) {
    const top = join(root, section)
    if (!existsSync(top)) continue
    walk(top, out, section)
  }
  return out
}

function walk(dir, out, section) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (!statSync(full).isDirectory()) continue
    const articlePath = join(full, 'article.md')
    const metaPath = join(full, 'metadata.json')
    if (existsSync(articlePath) && existsSync(metaPath)) {
      out.push({ section, folder: full, articlePath, metaPath })
    } else {
      walk(full, out, section)
    }
  }
}

const articles = walkArticles(ROOT)
console.log(`Discovered ${articles.length} article folders under content-plan/\n`)

if (articles.length === 0) {
  console.log('Nothing to seed. Exiting.')
  process.exit(0)
}

/* ----------------------------- seed loop ----------------------------- */
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

let ok = 0
let err = 0
const slugs = new Set()

for (const item of articles) {
  let meta
  let content
  try {
    meta = JSON.parse(readFileSync(item.metaPath, 'utf-8'))
    content = readFileSync(item.articlePath, 'utf-8')
  } catch (e) {
    console.error(`✗ ${item.folder}: failed to read meta/article — ${e.message}`)
    err++
    continue
  }

  if (!meta.slug || !meta.title) {
    console.error(`✗ ${item.folder}: missing slug or title in metadata.json`)
    err++
    continue
  }

  if (slugs.has(meta.slug)) {
    console.error(`✗ ${item.folder}: duplicate slug "${meta.slug}" — skipping`)
    err++
    continue
  }
  slugs.add(meta.slug)

  /* Build the row matching the blog_posts schema. */
  const row = {
    slug: meta.slug,
    title: meta.title,
    excerpt: meta.excerpt ?? null,
    content: content.trim(),
    featured_image: meta.featured_image ?? null,
    category: meta.category ?? 'Guides',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    author_name: meta.author_name ?? 'Hector G. · Design Vortex founder',
    is_published: PUBLISH ? true : Boolean(meta.is_published),
    published_at: PUBLISH ? new Date().toISOString() : (meta.published_at ?? null),
    read_time_minutes: typeof meta.read_time_minutes === 'number' ? meta.read_time_minutes : null,
    seo_title: meta.seo_title ?? null,
    seo_description: meta.seo_description ?? null,
    is_pillar: Boolean(meta.is_pillar),
    pillar_genre: meta.pillar_genre ?? null,
  }

  if (DRY_RUN) {
    console.log(`· DRY ${row.slug.padEnd(60)} ${row.category.padEnd(18)} ${row.is_pillar ? '[PILLAR ' + row.pillar_genre + ']' : ''}`)
    ok++
    continue
  }

  /* Lookup, then update or insert. */
  const { data: existing, error: lookupError } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', meta.slug)
    .maybeSingle()

  if (lookupError) {
    console.error(`✗ ${meta.slug}: lookup — ${lookupError.message}`)
    err++
    continue
  }

  let dbErr
  if (existing) {
    const { error } = await supabase.from('blog_posts').update(row).eq('id', existing.id)
    dbErr = error
  } else {
    const { error } = await supabase.from('blog_posts').insert(row)
    dbErr = error
  }

  if (dbErr) {
    console.error(`✗ ${meta.slug}: ${dbErr.message}`)
    err++
  } else {
    console.log(`✓ ${meta.slug.padEnd(60)} ${row.category.padEnd(18)} ${row.is_pillar ? '[PILLAR ' + row.pillar_genre + ']' : ''}`)
    ok++
  }
}

console.log(`\nDone. ${ok} ok, ${err} errors.`)
if (err > 0) process.exit(1)
