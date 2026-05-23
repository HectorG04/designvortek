/* Dump the lib/blog.ts snapshot to scripts/blog-snapshot.json so the
 * seed script can consume it as plain JSON (no TS compilation needed).
 *
 * Usage:  npx tsx scripts/dump-blog-snapshot.ts
 *
 * Same pattern as scripts/dump-reviews-snapshot.ts and
 * scripts/dump-portfolio-snapshot.ts.
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { POSTS } from '../lib/blog'

const __dirname = dirname(fileURLToPath(import.meta.url))
const out = resolve(__dirname, 'blog-snapshot.json')

writeFileSync(out, JSON.stringify(POSTS, null, 2), 'utf-8')
console.log(`Wrote ${POSTS.length} posts → ${out}`)
