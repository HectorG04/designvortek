/* Dump the SERVICES snapshot from lib/services.ts to JSON so the
 * .mjs seeder can consume it without a TypeScript loader.
 *
 * Run: npx tsx scripts/dump-services-snapshot.ts
 *
 * Same pattern as dump-portfolio-snapshot, dump-reviews-snapshot,
 * dump-blog-snapshot.
 */
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SERVICES } from '../lib/services'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(__dirname, 'services-snapshot.json')

writeFileSync(outPath, JSON.stringify(SERVICES, null, 2))
console.log(`Wrote ${SERVICES.length} services to ${outPath}`)
