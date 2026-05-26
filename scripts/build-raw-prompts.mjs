/**
 * build-raw-prompts.mjs
 *
 * Generic markdown → raw-text prompt extractor. Reads any markdown file
 * that contains fenced ```code``` blocks holding image prompts, collapses
 * each block to a single line, and writes the result one prompt per line.
 *
 * Usage:
 *   node scripts/build-raw-prompts.mjs <input.md> [output.txt]
 *
 * If output is omitted, it writes alongside the input with -raw.txt suffix.
 * Replaces the earlier build-old-post-prompts-raw.mjs (which only handled
 * the cover-prompt file) — this one works for cover, inline, and any
 * future prompt batches.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, extname, basename, dirname, join } from 'path'

const [, , inputArg, outputArg] = process.argv

if (!inputArg) {
  console.error('Usage: node scripts/build-raw-prompts.mjs <input.md> [output.txt]')
  process.exit(1)
}

const inputPath = resolve(inputArg)
const text = readFileSync(inputPath, 'utf8')

// Match every fenced code block. Prompts use plain ``` (no language tag).
const blocks = [...text.matchAll(/```\n([\s\S]*?)```/g)].map((m) => m[1])

const lines = blocks.map((b) =>
  b
    .split('\n')
    .map((l) => l.trim())
    // Strip agent-internal comment lines like `# Approach: B — Single iconic object`
    // and any HTML-style `<!-- ... -->` blocks. These are metadata, not prompt content.
    .filter((l) => l.length > 0 && !l.startsWith('# ') && !l.startsWith('// '))
    .join(' ')
    .replace(/\s{2,}/g, ' ')
    .trim(),
)

const outputPath = outputArg
  ? resolve(outputArg)
  : join(dirname(inputPath), basename(inputPath, extname(inputPath)) + '-raw.txt')

writeFileSync(outputPath, lines.join('\n') + '\n', 'utf8')
console.log(`Wrote ${lines.length} prompts → ${outputPath}`)
