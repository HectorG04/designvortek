/* One-shot: dump the in-code PORTFOLIO_PIECES data to JSON so the seed
 * script (which is plain Node ESM) can read it without needing TypeScript.
 *
 * Run: npx tsx scripts/dump-portfolio-snapshot.ts
 */
import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllPieces } from '../lib/portfolio-pieces'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(__dirname, 'portfolio-snapshot.json')

const pieces = getAllPieces()
writeFileSync(outPath, JSON.stringify(pieces, null, 2))
console.log(`Wrote ${pieces.length} pieces to ${outPath}`)
