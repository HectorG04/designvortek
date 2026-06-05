/**
 * ga4-snapshot.mjs
 *
 * Pulls a snapshot from GA4 for designvortex.co:
 *   - Active users / sessions / engagement / avg duration last N days
 *   - Top 15 landing pages
 *   - Traffic by source/medium
 *   - Event counts (form submits, page views, etc.)
 *
 * Run:  node scripts/ga4-snapshot.mjs
 * Or:   node scripts/ga4-snapshot.mjs --days 7
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { GA4_PROPERTY_ID, daysAgo, today, printTable } from './lib/google-auth.mjs'

const DAYS = (() => {
  const i = process.argv.indexOf('--days')
  if (i < 0) return 28
  const n = Number(process.argv[i + 1])
  return Number.isFinite(n) && n > 0 ? n : 28
})()

const client = new BetaAnalyticsDataClient()
const property = `properties/${GA4_PROPERTY_ID}`
const startDate = daysAgo(DAYS)
const endDate   = today()

console.log(`\n📈 GA4 snapshot for property ${GA4_PROPERTY_ID}  ·  ${startDate} → ${endDate}\n`)

/* Overall traffic totals */
const [overall] = await client.runReport({
  property,
  dateRanges: [{ startDate, endDate }],
  metrics: [
    { name: 'activeUsers' },
    { name: 'sessions' },
    { name: 'engagedSessions' },
    { name: 'averageSessionDuration' },
    { name: 'eventCount' },
  ],
})
const totals = overall.rows?.[0]?.metricValues
if (!totals || Number(totals[1].value) === 0) {
  console.log('  (no traffic yet — site likely just launched)')
} else {
  console.log(`  Active users:        ${totals[0].value}`)
  console.log(`  Sessions:            ${totals[1].value}`)
  console.log(`  Engaged sessions:    ${totals[2].value}`)
  console.log(`  Avg session length:  ${Number(totals[3].value).toFixed(1)}s`)
  console.log(`  Total events:        ${totals[4].value}`)
}

/* Top landing pages */
console.log(`\n=== Top 15 landing pages ===`)
const [landing] = await client.runReport({
  property,
  dateRanges: [{ startDate, endDate }],
  dimensions: [{ name: 'landingPagePlusQueryString' }],
  metrics: [
    { name: 'sessions' },
    { name: 'engagedSessions' },
    { name: 'averageSessionDuration' },
  ],
  orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  limit: 15,
})
const lRows = (landing.rows ?? []).map((r) => [
  r.dimensionValues[0].value,
  r.metricValues[0].value,
  r.metricValues[1].value,
  Number(r.metricValues[2].value).toFixed(0) + 's',
])
if (lRows.length === 0) console.log('  (no landing pages yet)')
else printTable(['Page', 'Sessions', 'Engaged', 'Avg time'], lRows)

/* Traffic by source/medium */
console.log(`\n=== Traffic source / medium ===`)
const [sources] = await client.runReport({
  property,
  dateRanges: [{ startDate, endDate }],
  dimensions: [{ name: 'sessionSourceMedium' }],
  metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }],
  orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  limit: 10,
})
const sRows = (sources.rows ?? []).map((r) => [
  r.dimensionValues[0].value,
  r.metricValues[0].value,
  r.metricValues[1].value,
])
if (sRows.length === 0) console.log('  (no sessions yet)')
else printTable(['Source / medium', 'Sessions', 'Engaged'], sRows)

/* Event breakdown */
console.log(`\n=== Top events ===`)
const [events] = await client.runReport({
  property,
  dateRanges: [{ startDate, endDate }],
  dimensions: [{ name: 'eventName' }],
  metrics: [{ name: 'eventCount' }],
  orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
  limit: 10,
})
const eRows = (events.rows ?? []).map((r) => [
  r.dimensionValues[0].value,
  r.metricValues[0].value,
])
if (eRows.length === 0) console.log('  (no events yet)')
else printTable(['Event', 'Count'], eRows)

console.log('')
