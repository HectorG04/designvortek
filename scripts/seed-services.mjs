/* One-shot seed for the `services` table.
 *
 * Usage:
 *   1. Apply supabase/migrations/0004_services_restructure.sql in the
 *      Supabase Dashboard SQL editor (or via CLI).
 *   2. Dump the snapshot:  npx tsx scripts/dump-services-snapshot.ts
 *   3. Run the seed:        node scripts/seed-services.mjs
 *
 * Idempotent: matches existing rows by slug, updates in place. Admin-
 * authored rows whose slugs aren't in the snapshot are left untouched.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from
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
  /* env vars may already be set in the shell */
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

const snapshotPath = resolve(__dirname, 'services-snapshot.json')
const SNAPSHOT = JSON.parse(readFileSync(snapshotPath, 'utf-8'))

console.log(`Seeding ${SNAPSHOT.length} services across 6 buckets...\n`)

let ok = 0
let err = 0

for (const product of SNAPSHOT) {
  /* Convert TS camelCase → DB snake_case. The pricing payload column
   * stores the entire { mode, …data } object so the discriminator
   * survives the round trip. */
  const row = {
    slug: product.slug,
    name: product.name,
    bucket: product.bucket,
    eyebrow: product.eyebrow ?? null,
    lede: product.lede ?? null,
    description: product.description ?? null,

    pricing_mode: product.pricingMode,
    pricing: product.pricing,

    turnaround_low_days: product.turnaroundLowDays ?? null,
    turnaround_high_days: product.turnaroundHighDays ?? null,
    revisions_included: product.revisionsIncluded ?? 2,
    resolution: product.resolution ?? null,

    included: product.included ?? [],
    examples: product.examples ?? [],
    faq: product.faq ?? [],

    bundle_with_slugs: product.bundleWithSlugs ?? [],
    bundle_uplift_cents: product.bundleUpliftCents ?? null,

    genre_tags: product.genreTags ?? [],

    is_published: product.isPublished ?? true,
    is_featured_homepage: product.isFeaturedHomepage ?? false,
    featured_order: product.featuredOrder ?? null,

    seo_title: product.seoTitle ?? null,
    seo_description: product.seoDescription ?? null,

    sort_order: product.sortOrder ?? 0,
  }

  const { data: existing, error: lookupError } = await supabase
    .from('services')
    .select('id')
    .eq('slug', product.slug)
    .maybeSingle()

  if (lookupError) {
    console.error(`✗ ${product.slug}: lookup failed — ${lookupError.message}`)
    err++
    continue
  }

  let dbErr
  if (existing) {
    const { error } = await supabase
      .from('services')
      .update(row)
      .eq('id', existing.id)
    dbErr = error
  } else {
    const { error } = await supabase.from('services').insert(row)
    dbErr = error
  }

  if (dbErr) {
    console.error(`✗ ${product.slug}: ${dbErr.message}`)
    err++
  } else {
    const flag = product.isFeaturedHomepage ? '★' : ' '
    console.log(`${flag} ${product.slug.padEnd(36)} [${product.bucket.padEnd(20)}] ${product.pricingMode}`)
    ok++
  }
}

console.log(`\nDone. ${ok} ok, ${err} errors.`)
if (err > 0) process.exit(1)
