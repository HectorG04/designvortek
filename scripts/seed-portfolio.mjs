/* One-shot seed — populates portfolio_pieces with the 24 current pieces.
 *
 * PRE-REQUISITE: migration 0002_portfolio_meta.sql must be applied first.
 * Paste supabase/migrations/0002_portfolio_meta.sql into Supabase Dashboard
 * → SQL Editor → Run. Then come back and run this script.
 *
 * Usage:  node scripts/seed-portfolio.mjs
 *
 * Idempotent: upserts on slug, so re-running overwrites rows cleanly. Safe
 * to run after admin edits if you ever want to reset to the snapshot.
 */

import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

/* Minimal .env.local parser so we don't pull in dotenv just for this. */
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

/* Read the PORTFOLIO_PIECES object out of lib/portfolio-pieces.ts as text and
 * parse manually-ish: it's TypeScript-with-JSX, so we can't import it from a
 * .mjs script. Instead we evaluate the file's structure by importing a
 * dedicated JSON snapshot we keep alongside. */
const snapshotPath = resolve(__dirname, 'portfolio-snapshot.json')
const SNAPSHOT = JSON.parse(readFileSync(snapshotPath, 'utf-8'))

console.log(`Seeding ${SNAPSHOT.length} pieces from snapshot...\n`)

let ok = 0
let err = 0
for (let i = 0; i < SNAPSHOT.length; i++) {
  const p = SNAPSHOT[i]
  const row = {
    slug: p.slug,
    title: p.title,
    category: p.category,
    description: p.description.join('\n\n'),
    image_url: p.heroImage,
    thumbnail_url: p.heroImage,
    additional_images: (p.processImages ?? []).map((pi) => pi.src),
    tags: p.tags ?? [],
    commissioned_by: p.client ?? null,
    tools_used: p.tools ?? null,
    hours_spent: null,
    style: p.style ?? null,
    is_featured: !!p.featured,
    is_published: true,
    sort_order: i,
    seo_title: null,
    seo_description: null,
    meta: {
      paragraphs: p.description,
      client: p.client,
      toolsText: p.tools,
      hoursText: p.hours,
      styleText: p.style,
      resolution: p.resolution,
      revisions: p.revisions,
      delivered: p.delivered,
      artistNote: p.artistNote,
      gradient: p.gradient,
      aspect: p.aspect,
      processImages: p.processImages ?? [],
    },
  }

  const { error } = await supabase
    .from('portfolio_pieces')
    .upsert(row, { onConflict: 'slug' })

  if (error) {
    console.error(`✗ ${p.slug}: ${error.message}`)
    err++
  } else {
    console.log(`✓ ${p.slug.padEnd(34)} (sort_order=${i})`)
    ok++
  }
}

console.log(`\nDone. ${ok} ok, ${err} errors.`)
if (err > 0) {
  console.error('\nIf you see "column meta does not exist", run the migration first:')
  console.error('  supabase/migrations/0002_portfolio_meta.sql → Supabase Dashboard → SQL Editor')
  process.exit(1)
}
