/**
 * clean-next-types.mjs
 *
 * Removes Next.js's auto-generated validator type files in `.next/types/`
 * and `.next/dev/types/`. These get stale when routes are deleted
 * (e.g. when the /blog/* tree was removed), causing local tsc to fail
 * with "Cannot find module" errors that don't reflect actual code.
 *
 * Next.js regenerates these on the next `next dev` or `next build`, so
 * cleaning is always safe.
 *
 * Used by `npm run typecheck` to give a true local match of Vercel's check.
 */

import { rmSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const TARGETS = [
  join(ROOT, '.next', 'types'),
  join(ROOT, '.next', 'dev', 'types'),
]

let cleaned = 0
for (const target of TARGETS) {
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true })
    console.log(`  cleaned ${target.replace(ROOT, '.')}`)
    cleaned++
  }
}

if (cleaned === 0) {
  console.log('  (no stale .next/types to clean)')
}
