/**
 * audit-cover-prompts.mjs
 *
 * Smart banned-word audit for the combined cover prompts file. The naive
 * audit gives false positives because banned terms ARE allowed inside
 * "Negative:" prompt fields (where they tell the AI generator NOT to
 * render them). This audit scans positive fields only:
 *   - Subject, Background, Composition, Lighting, Mood, Style
 * If a banned term shows up there, it's a real issue.
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const FILE = join(ROOT, 'docs', 'seo', 'all-cover-prompts.md')

const BANNED = [
  'oil paint', 'oil painting', 'linseed', 'sable brush', 'easel',
  'palette knife', 'wet paint', 'paint tube', 'brush jar', 'gesso',
  'hand-painted', 'hand painted', 'hand-drawn', 'hand drawn',
  'alizarin', 'cadmium red', 'cadmium yellow', 'titanium white',
  'lead white', 'burnt umber', 'raw umber',
]

const POSITIVE_FIELDS = ['Subject:', 'Background:', 'Composition:', 'Lighting:', 'Mood:', 'Style:', 'Typography:', 'Kicker line:', 'Palette:']
const NEGATIVE_FIELD = 'Negative:'

const text = readFileSync(FILE, 'utf8')
const blocks = [...text.matchAll(/```\n([\s\S]*?)```/g)].map((m) => m[1])

console.log(`Scanning ${blocks.length} prompt blocks (positive fields only)...\n`)

let issues = 0
for (let i = 0; i < blocks.length; i++) {
  const block = blocks[i]
  // Split into lines, separate into positive vs negative regions
  const lines = block.split('\n')
  const positiveLines = []
  let inNegative = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith(NEGATIVE_FIELD)) {
      inNegative = true
      continue
    }
    if (POSITIVE_FIELDS.some((f) => trimmed.startsWith(f))) inNegative = false
    if (!inNegative) positiveLines.push(line)
  }
  const positiveText = positiveLines.join('\n').toLowerCase()

  for (const term of BANNED) {
    const re = new RegExp('\\b' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g')
    const matches = positiveText.match(re)
    if (matches) {
      // Extract context for each match (60 char window)
      for (const match of matches) {
        const idx = positiveText.indexOf(match)
        const snippet = positiveText.slice(Math.max(0, idx - 30), Math.min(positiveText.length, idx + match.length + 30))
        console.log(`  ❌ Block ${i + 1}: "${term}" in positive context`)
        console.log(`     …${snippet.replace(/\s+/g, ' ').trim()}…`)
      }
      issues++
    }
  }
}

console.log(`\n${issues === 0 ? '✅ All positive prompt fields are clean.' : `❌ ${issues} blocks have banned terms in POSITIVE context.`}`)
console.log('(Negative-field uses of these terms are expected and intentional.)')
