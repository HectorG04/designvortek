/**
 * seo-weekly.mjs
 *
 * Combined weekly SEO + analytics report. Runs both gsc-snapshot and
 * ga4-snapshot back-to-back with a 7-day window so we get a coherent
 * Monday-morning briefing.
 *
 * Run manually: node scripts/seo-weekly.mjs
 * Or schedule it as a cron task.
 */

import { spawn } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function run(script) {
  return new Promise((resolve) => {
    const p = spawn('node', [join(__dirname, script), '--days', '7'], { stdio: 'inherit' })
    p.on('close', () => resolve())
  })
}

console.log('═══════════════════════════════════════════════')
console.log('       DESIGN VORTEX — WEEKLY SEO BRIEFING     ')
console.log(`       ${new Date().toLocaleDateString()}                              `)
console.log('═══════════════════════════════════════════════')

await run('gsc-snapshot.mjs')
await run('ga4-snapshot.mjs')

console.log('═══════════════════════════════════════════════')
console.log('  Briefing complete.')
console.log('═══════════════════════════════════════════════\n')
