/**
 * split-inventory-into-batches.mjs
 *
 * Takes docs/seo/all-posts-inventory.json and splits it into 8 batch
 * input files at docs/seo/all-covers/inputs/batch-NN.json. Each agent
 * gets exactly one batch file to consume.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const all = JSON.parse(readFileSync(join(ROOT, 'docs', 'seo', 'all-posts-inventory.json'), 'utf8'))
const N_BATCHES = 8
const perBatch = Math.ceil(all.length / N_BATCHES)

const dir = join(ROOT, 'docs', 'seo', 'all-covers', 'inputs')
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

for (let i = 0; i < N_BATCHES; i++) {
  const start = i * perBatch
  const end = Math.min(start + perBatch, all.length)
  const batch = all.slice(start, end)
  const path = join(dir, `batch-${String(i + 1).padStart(2, '0')}.json`)
  writeFileSync(path, JSON.stringify(batch, null, 2), 'utf8')
  console.log(`  batch-${String(i + 1).padStart(2, '0')}: ${batch.length} posts (#${start + 1}–#${end})`)
}

console.log(`\nWrote ${N_BATCHES} batch files to ${dir.replace(ROOT, '.')}`)
