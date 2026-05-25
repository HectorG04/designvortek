/**
 * generate-image-map.mjs
 * Produces image-map.json: { "001": "slug-name", "002": "slug-name", ... }
 * Must mirror the exact walk order of build-prompt-list.mjs.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CONTENT = join(ROOT, 'content-plan')

function walk(dir) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) results.push(...walk(full))
    else if (entry.name === 'image-prompts.md') results.push(dirname(full))
  }
  return results
}

// The 8 missing articles (same order as build-prompt-list.mjs)
const MISSING_SLUGS = [
  'character-art-process-sketch-color-final',
  'eleanor-of-aquitaine-queen-portrait-commission',
  'call-of-cthulhu-1920s-investigator-archetype',
  'tarnished-oc-painting-your-own-elden-ring-character',
  'cybernetic-limb-face-design-references',
  'dnd-subspecies-lineage-character-art',
  'cyberware-vs-bioware-visual-language',
  'western-firearms-reference-painting',
]

const dirs = walk(CONTENT)
const map = {}

let lineNum = 1
for (const dir of dirs) {
  const metaPath = join(dir, 'metadata.json')
  if (!existsSync(metaPath)) { lineNum++; continue }
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
  const key = String(lineNum).padStart(3, '0')
  map[key] = meta.slug
  lineNum++
}

for (const slug of MISSING_SLUGS) {
  const key = String(lineNum).padStart(3, '0')
  map[key] = slug
  lineNum++
}

const outPath = join(ROOT, 'scripts', 'image-map.json')
writeFileSync(outPath, JSON.stringify(map, null, 2), 'utf8')
console.log(`Written ${Object.keys(map).length} entries to scripts/image-map.json`)
Object.entries(map).forEach(([k, v]) => console.log(`  ${k} → ${v}`))
