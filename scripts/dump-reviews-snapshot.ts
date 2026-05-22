/* Dump the in-code REVIEWS array to JSON so the seeder can read it
 * without needing a TypeScript loader.
 *
 * Run: npx tsx scripts/dump-reviews-snapshot.ts
 */
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { REVIEWS } from '../lib/reviews'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(__dirname, 'reviews-snapshot.json')

writeFileSync(outPath, JSON.stringify(REVIEWS, null, 2))
console.log(`Wrote ${REVIEWS.length} reviews to ${outPath}`)
