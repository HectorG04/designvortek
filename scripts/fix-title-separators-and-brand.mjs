/**
 * fix-title-separators-and-brand.mjs
 *
 * Two systemic fixes to all metadata across the app/ tree:
 *
 *  1. SEPARATOR HARDENING — replace ` · ` (U+00B7 with surrounding spaces)
 *     in metadata title strings with ` | ` (ASCII pipe). Middle-dot has
 *     a known double-encoding failure mode in some pipelines (Google's
 *     snippet engine showed "Mystic, Droid, Pilot Â· Portraits"). Pipe
 *     is pure ASCII — zero encoding risk, universally rendered.
 *
 *  2. BRAND NAME CORRECTION — replace any lingering "Design Vortek" with
 *     "Design Vortex". A stale memory note insisted on Vortek-with-K, so
 *     three pages (commercial, services/maps, subscription) shipped with
 *     wrong brand name. User confirmed it's always Vortex.
 *
 * Scope: only metadata title/description-bearing files. Skips:
 *   - node_modules, .next, .git
 *   - any content body (the middle-dot in body markdown is fine)
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Find every TSX/TS file under app/ that has metadata
const findCmd = process.platform === 'win32'
  ? `powershell -NoProfile -Command "Get-ChildItem -Recurse -Path '${join(ROOT, 'app')}' -Include *.tsx,*.ts -File | ForEach-Object { $_.FullName }"`
  : `find "${join(ROOT, 'app')}" -type f \\( -name '*.tsx' -o -name '*.ts' \\)`

const files = execSync(findCmd, { encoding: 'utf8' })
  .split(/\r?\n/)
  .filter(Boolean)

const middleDot = String.fromCharCode(0x00B7)
const summary = []

for (const file of files) {
  let content
  try {
    content = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  const before = content

  // (1) Replace ` · ` (space-middle-dot-space) ONLY inside template literals
  //     for metadata titles. Conservative: only target title lines.
  //     Pattern: lines containing `title:` or `title:` literal with backticks.
  //     We use a per-line approach so we don't accidentally hit body text.
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (
      (line.includes('title:') || line.includes('Title:')) &&
      line.includes(` ${middleDot} `)
    ) {
      lines[i] = line.split(` ${middleDot} `).join(' | ')
    }
  }
  content = lines.join('\n')

  // (2) Brand name correction — Vortek → Vortex (case-sensitive on "Design Vortek")
  content = content.split('Design Vortek').join('Design Vortex')

  if (content !== before) {
    writeFileSync(file, content, 'utf8')
    const rel = file.replace(ROOT + (process.platform === 'win32' ? '\\' : '/'), '')
    summary.push(rel)
  }
}

console.log(`Modified ${summary.length} files:`)
for (const f of summary) console.log('  -', f)
