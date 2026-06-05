/**
 * gsc-snapshot.mjs
 *
 * Pulls a snapshot from Google Search Console for designvortex.co:
 *   - Indexation count (how many pages Google has in its index)
 *   - Total impressions / clicks / CTR / avg position for the last 28 days
 *   - Top 15 queries by impressions
 *   - Top 15 pages by clicks
 *   - "Hidden gems" — pages with impressions but zero clicks (title/desc fix candidates)
 *
 * Run:  node scripts/gsc-snapshot.mjs
 * Or:   node scripts/gsc-snapshot.mjs --days 7   (last 7 days instead of 28)
 */

import { google } from 'googleapis'
import { GSC_SITE_URL, daysAgo, today, printTable } from './lib/google-auth.mjs'

const DAYS = (() => {
  const i = process.argv.indexOf('--days')
  if (i < 0) return 28
  const n = Number(process.argv[i + 1])
  return Number.isFinite(n) && n > 0 ? n : 28
})()

const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
})
const searchconsole = google.searchconsole({ version: 'v1', auth })

const startDate = daysAgo(DAYS)
const endDate   = today()

console.log(`\n📊 GSC snapshot for ${GSC_SITE_URL}  ·  ${startDate} → ${endDate}\n`)

/* Overall totals */
const totals = await searchconsole.searchanalytics.query({
  siteUrl: GSC_SITE_URL,
  requestBody: { startDate, endDate, dimensions: [] },
})
const t = totals.data.rows?.[0]
if (!t) {
  console.log('  (no data yet — site likely just indexed)')
} else {
  console.log(`  Clicks:      ${t.clicks}`)
  console.log(`  Impressions: ${t.impressions}`)
  console.log(`  CTR:         ${(t.ctr * 100).toFixed(2)}%`)
  console.log(`  Avg pos:     ${t.position.toFixed(1)}`)
}

/* Top queries */
console.log(`\n=== Top 15 queries by impressions ===`)
const queries = await searchconsole.searchanalytics.query({
  siteUrl: GSC_SITE_URL,
  requestBody: {
    startDate,
    endDate,
    dimensions: ['query'],
    rowLimit: 15,
  },
})
const qRows = (queries.data.rows ?? []).map((r) => [
  r.keys[0],
  String(r.impressions),
  String(r.clicks),
  `${(r.ctr * 100).toFixed(1)}%`,
  r.position.toFixed(1),
])
if (qRows.length === 0) console.log('  (no queries yet)')
else printTable(['Query', 'Impr', 'Clicks', 'CTR', 'Pos'], qRows)

/* Top pages */
console.log(`\n=== Top 15 pages by clicks ===`)
const pages = await searchconsole.searchanalytics.query({
  siteUrl: GSC_SITE_URL,
  requestBody: {
    startDate,
    endDate,
    dimensions: ['page'],
    rowLimit: 15,
  },
})
const pRows = (pages.data.rows ?? []).map((r) => [
  r.keys[0].replace(/^https?:\/\/[^/]+/, ''),
  String(r.impressions),
  String(r.clicks),
  `${(r.ctr * 100).toFixed(1)}%`,
  r.position.toFixed(1),
])
if (pRows.length === 0) console.log('  (no pages with traffic yet)')
else printTable(['Page', 'Impr', 'Clicks', 'CTR', 'Pos'], pRows)

/* Hidden gems — impressions but zero clicks (title/description fix candidates) */
console.log(`\n=== Hidden gems (impressions but 0 clicks) — title/meta fix candidates ===`)
const gems = (pages.data.rows ?? []).filter((r) => r.impressions >= 5 && r.clicks === 0)
if (gems.length === 0) {
  console.log('  (none — either no impressions yet, or every page that gets impressions also gets clicks)')
} else {
  const gemRows = gems.slice(0, 10).map((r) => [
    r.keys[0].replace(/^https?:\/\/[^/]+/, ''),
    String(r.impressions),
    r.position.toFixed(1),
  ])
  printTable(['Page', 'Impr', 'Avg pos'], gemRows)
}

console.log('')
