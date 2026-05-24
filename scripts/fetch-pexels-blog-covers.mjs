/* =====================================================================
   fetch-pexels-blog-covers.mjs

   One-shot automation: for each of the 7 seeded blog posts, search
   Pexels with a curated query and write the first matching photo's
   URL into the post's `featured_image` column in Supabase.

   Requirements (env vars from .env.local):
     PEXELS_API_KEY                 — free at https://www.pexels.com/api/
     NEXT_PUBLIC_SUPABASE_URL
     SUPABASE_SERVICE_ROLE_KEY

   Usage:
     node scripts/fetch-pexels-blog-covers.mjs

   Idempotent: re-running picks a different photo from the same search
   (pseudo-random pick from the top 10 results). Already-set covers
   are skipped unless you pass --force.

   License notes:
     Pexels images are free for commercial use, no attribution required
     under the Pexels License (https://www.pexels.com/license/). We
     store the photographer + photo_url in the per-row console log so
     you can credit voluntarily if you ever want to.
   ===================================================================== */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/* ---------- env ---------- */
try {
  const envText = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
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
  /* env vars may already be set in the shell */
}

const PEXELS_API_KEY = process.env.PEXELS_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const FORCE = process.argv.includes('--force')

if (!PEXELS_API_KEY) {
  console.error(
    'Missing PEXELS_API_KEY in .env.local. Grab a free key at https://www.pexels.com/api/',
  )
  process.exit(1)
}
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/* ---------- curated queries per blog post ---------- */
/* Each entry has a primary query + a fallback in case the primary
 * returns no results. The orientation hint biases the search toward
 * landscape (better for hero cards). */
const POST_QUERIES = [
  {
    slug: 'how-to-write-commission-brief',
    primary: 'notebook pen desk creative',
    fallback: 'writing journal coffee',
  },
  {
    slug: 'three-weeks-with-lyra',
    primary: 'digital art tablet stylus',
    fallback: 'artist drawing tablet workspace',
  },
  {
    slug: 'vtt-token-deserves-more',
    primary: 'tabletop dice dungeons dragons',
    fallback: 'd20 polyhedral dice',
  },
  {
    slug: 'hero-forge-to-handpainted',
    primary: 'character sketch concept art',
    fallback: 'sketchbook drawing pencil',
  },
  {
    slug: 'first-art-fair-booth',
    primary: 'art fair market booth',
    fallback: 'art prints display gallery',
  },
  {
    slug: 'strahd-npc-pack-six-weeks',
    primary: 'gothic candle dark atmosphere',
    fallback: 'vintage portrait dark moody',
  },
  {
    slug: 'choosing-a-commission-style',
    primary: 'paint brushes palette art supplies',
    fallback: 'watercolor brush sketch',
  },
]

/* ---------- helpers ---------- */
async function searchPexels(query) {
  const url = new URL('https://api.pexels.com/v1/search')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', '10')
  url.searchParams.set('orientation', 'landscape')
  const res = await fetch(url, {
    headers: { Authorization: PEXELS_API_KEY },
  })
  if (!res.ok) throw new Error(`Pexels ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.photos ?? []
}

function pickRandom(photos) {
  if (photos.length === 0) return null
  return photos[Math.floor(Math.random() * Math.min(photos.length, 10))]
}

/* ---------- run ---------- */
console.log(`Fetching covers for ${POST_QUERIES.length} blog posts${FORCE ? ' (forcing overwrite)' : ''}...\n`)

let ok = 0
let skip = 0
let err = 0

for (const entry of POST_QUERIES) {
  // Check current state
  const { data: existing, error: readError } = await supabase
    .from('blog_posts')
    .select('id, slug, featured_image')
    .eq('slug', entry.slug)
    .maybeSingle()

  if (readError) {
    console.error(`✗ ${entry.slug}: lookup error — ${readError.message}`)
    err++
    continue
  }
  if (!existing) {
    console.warn(`- ${entry.slug}: post not found in Supabase (run seed-blog first)`)
    skip++
    continue
  }
  if (existing.featured_image && !FORCE) {
    console.log(`· ${entry.slug.padEnd(36)} already has a cover (use --force to overwrite)`)
    skip++
    continue
  }

  // Search Pexels — try primary, then fallback
  let photos = []
  try {
    photos = await searchPexels(entry.primary)
    if (photos.length === 0) {
      console.log(`  → primary "${entry.primary}" empty, trying fallback "${entry.fallback}"`)
      photos = await searchPexels(entry.fallback)
    }
  } catch (pe) {
    console.error(`✗ ${entry.slug}: Pexels error — ${pe.message}`)
    err++
    continue
  }

  const photo = pickRandom(photos)
  if (!photo) {
    console.warn(`- ${entry.slug}: no Pexels results for either query`)
    skip++
    continue
  }

  // Use `large` size (940px wide) — good balance of quality + bandwidth
  const imageUrl = photo.src?.large ?? photo.src?.medium
  if (!imageUrl) {
    console.warn(`- ${entry.slug}: photo has no usable size`)
    skip++
    continue
  }

  const { error: updateError } = await supabase
    .from('blog_posts')
    .update({
      featured_image: imageUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)

  if (updateError) {
    console.error(`✗ ${entry.slug}: update error — ${updateError.message}`)
    err++
    continue
  }

  ok++
  console.log(
    `✓ ${entry.slug.padEnd(36)} → ${imageUrl}\n    by ${photo.photographer} (${photo.url})`,
  )
}

console.log(`\nDone. ${ok} updated, ${skip} skipped, ${err} errors.`)
if (err > 0) process.exit(1)
