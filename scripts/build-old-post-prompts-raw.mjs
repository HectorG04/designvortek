/**
 * build-old-post-prompts-raw.mjs
 *
 * Reads docs/seo/image-prompts-old-posts.md, extracts every fenced
 * ```code block``` that holds a prompt, collapses each to a single line,
 * and writes them to docs/seo/image-prompts-old-posts-raw.txt — one
 * prompt per line, nothing else.
 *
 * Run:  node scripts/build-old-post-prompts-raw.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC = join(ROOT, 'docs', 'seo', 'image-prompts-old-posts.md')
const OUT = join(ROOT, 'docs', 'seo', 'image-prompts-old-posts-raw.txt')

const text = readFileSync(SRC, 'utf8')

// Match every fenced code block. The prompts use plain ``` (no language tag).
const blocks = [...text.matchAll(/```\n([\s\S]*?)```/g)].map((m) => m[1])

const lines = blocks.map((b) =>
  b
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim(),
)

writeFileSync(OUT, lines.join('\n') + '\n', 'utf8')
console.log(`Wrote ${lines.length} prompts to ${OUT.replace(ROOT, '.')}`)
