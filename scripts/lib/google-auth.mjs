/**
 * google-auth.mjs
 *
 * Shared auth setup for the GSC + GA4 query scripts. Reads env vars:
 *   GOOGLE_APPLICATION_CREDENTIALS — absolute path to service account JSON
 *   GA4_PROPERTY_ID                — numeric GA4 property ID (not the G-XXX measurement ID)
 *   GSC_SITE_URL                   — sc-domain:designvortex.co (DNS verified)
 *                                    or https://designvortex.co/ (URL prefix)
 *
 * The service account (claude-seo@charging-station-radar-app...) must have:
 *   - GSC: Restricted (read) permission on the property
 *   - GA4: Viewer role on the property
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')

// Load .env.local manually (avoids needing dotenv as a runtime dep)
function loadEnv() {
  const envPath = join(ROOT, '.env.local')
  if (!existsSync(envPath)) throw new Error('.env.local not found')
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith('#') || !line.includes('=')) continue
    const i = line.indexOf('=')
    const k = line.slice(0, i).trim()
    const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    if (!(k in process.env)) process.env[k] = v
  }
}
loadEnv()

export function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var ${name} in .env.local`)
  return v
}

export const GA4_PROPERTY_ID = requireEnv('GA4_PROPERTY_ID')
export const GSC_SITE_URL    = requireEnv('GSC_SITE_URL')
export const GCP_CREDS_PATH  = requireEnv('GOOGLE_APPLICATION_CREDENTIALS')

if (!existsSync(GCP_CREDS_PATH)) {
  throw new Error(`Service account JSON not found at ${GCP_CREDS_PATH}`)
}

// Last-N-days helper used by both GSC + GA4 scripts
export function daysAgo(n) {
  const d = new Date(Date.now() - n * 86400 * 1000)
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}
export function today() {
  return new Date().toISOString().slice(0, 10)
}

/** Pretty-print a table to console — headers + rows of strings. */
export function printTable(headers, rows) {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i] ?? '').length)))
  const fmt = (cells) => cells.map((c, i) => String(c ?? '').padEnd(widths[i])).join('  ')
  console.log(fmt(headers))
  console.log(widths.map((w) => '─'.repeat(w)).join('  '))
  for (const r of rows) console.log(fmt(r))
}
