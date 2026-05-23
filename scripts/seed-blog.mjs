/* One-shot seed for the `blog_posts` table.
 *
 * Usage:
 *   1. Apply supabase/migrations/0003_blog_posts.sql in the Supabase
 *      Dashboard SQL editor (or via the CLI).
 *   2. Dump the snapshot:  npx tsx scripts/dump-blog-snapshot.ts
 *   3. Run the seed:        node scripts/seed-blog.mjs
 *
 * Idempotent: matches existing rows by slug and updates them in place.
 * Re-running just refreshes the snapshot content; admin-authored rows
 * not in the snapshot are left untouched.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
 * .env.local via an inline parser (no dotenv dependency).
 */
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

/* Inline .env.local parser. */
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
  /* fall through — env vars may already be set in the shell */
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const snapshotPath = resolve(__dirname, 'blog-snapshot.json')
const SNAPSHOT = JSON.parse(readFileSync(snapshotPath, 'utf-8'))

console.log(`Seeding ${SNAPSHOT.length} blog posts...\n`)

let ok = 0
let err = 0

for (const post of SNAPSHOT) {
  /* date in the snapshot is YYYY-MM-DD. The DB stores ISO timestamptz.
   * Anchor to noon UTC so the day reads consistently in every TZ. */
  const publishedIso = new Date(`${post.date}T12:00:00Z`).toISOString()

  const row = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? null,
    content: post.body ?? '',
    featured_image: post.featuredImage ?? null,
    category: post.category ?? 'Guides',
    tags: post.tags ?? [],
    author_name: post.authorName ?? 'Studio',
    is_published: true,
    published_at: publishedIso,
    read_time_minutes: typeof post.readMin === 'number' ? post.readMin : null,
    seo_title: post.seoTitle ?? null,
    seo_description: post.seoDescription ?? null,
  }

  const { data: existing, error: lookupError } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('slug', post.slug)
    .maybeSingle()

  if (lookupError) {
    console.error(`✗ ${post.slug}: lookup failed — ${lookupError.message}`)
    err++
    continue
  }

  let dbErr
  if (existing) {
    const { error } = await supabase
      .from('blog_posts')
      .update(row)
      .eq('id', existing.id)
    dbErr = error
  } else {
    const { error } = await supabase.from('blog_posts').insert(row)
    dbErr = error
  }

  if (dbErr) {
    console.error(`✗ ${post.slug}: ${dbErr.message}`)
    err++
  } else {
    console.log(`✓ ${post.slug.padEnd(40)} ${post.category.padEnd(20)} ${post.readMin}m`)
    ok++
  }
}

console.log(`\nDone. ${ok} ok, ${err} errors.`)
if (err > 0) process.exit(1)
