/* One-shot seed — populates `reviews` with the 30 snapshot reviews from
 * lib/reviews.ts. Idempotent on customer_name + content (upserts).
 *
 * Usage:  node scripts/seed-reviews.mjs
 *
 * Reads .env.local for the Supabase service role key. Safe to re-run —
 * uses ON CONFLICT (composite key) so re-runs just refresh the same rows
 * instead of duplicating them.
 */
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

/* Minimal .env.local parser — no dotenv dependency. */
const envPath = resolve(__dirname, '..', '.env.local')
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/* Read the reviews snapshot. We dump lib/reviews.ts via the companion
 * dump script before running this — keeps the seed script plain ESM. */
const snapshotPath = resolve(__dirname, 'reviews-snapshot.json')
const SNAPSHOT = JSON.parse(readFileSync(snapshotPath, 'utf-8'))

console.log(`Seeding ${SNAPSHOT.length} reviews...\n`)

/* Strategy: delete existing rows where customer_name + content matches,
 * then insert fresh. Simpler than building a stable unique constraint
 * server-side and keeps the snapshot the single source of truth on every
 * re-run. Admin-edited reviews not in the snapshot are left untouched. */
let ok = 0
let err = 0
for (const r of SNAPSHOT) {
  /* Try to find an existing row to update by customer_name + first chars
   * of content (so re-seeds replace the snapshot version cleanly). */
  const matchContent = r.content.slice(0, 60)
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('customer_name', r.customerName)
    .ilike('content', `${matchContent}%`)
    .limit(1)

  const row = {
    customer_name: r.customerName,
    customer_role: r.role,
    content: r.content,
    rating: r.rating,
    service_type: r.serviceType ?? null,
    is_approved: true,
    is_featured: r.featured,
    avatar_url: null,
    created_at: new Date(r.date).toISOString(),
  }

  let dbErr
  if (existing && existing.length > 0) {
    const { error } = await supabase
      .from('reviews')
      .update(row)
      .eq('id', existing[0].id)
    dbErr = error
  } else {
    const { error } = await supabase.from('reviews').insert(row)
    dbErr = error
  }

  if (dbErr) {
    console.error(`✗ ${r.customerName}: ${dbErr.message}`)
    err++
  } else {
    console.log(`✓ ${r.customerName.padEnd(20)} ${r.featured ? '★' : ' '}  ${r.rating}/5  ${r.role}`)
    ok++
  }
}

console.log(`\nDone. ${ok} ok, ${err} errors.`)
if (err > 0) process.exit(1)
