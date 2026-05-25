/**
 * process-images.mjs
 * Scans E:\Chrome Downloads\turboflow for numbered images (001.jpg etc.),
 * copies them to public/blog-images/{slug}.{ext},
 * updates Supabase (featured_image + is_published + published_at),
 * then git-adds, commits, and pushes anything new.
 *
 * Safe to run repeatedly — tracks processed items in scripts/image-progress.json.
 * Usage: node scripts/process-images.mjs
 */

import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname, extname, basename } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')
const TURBOFLOW = 'E:\\Chrome Downloads\\turboflow'
const DEST      = join(ROOT, 'public', 'blog-images')
const MAP_PATH  = join(__dirname, 'image-map.json')
const PROG_PATH = join(__dirname, 'image-progress.json')

// ── Load config ──────────────────────────────────────────────────────────────
const envRaw = readFileSync(join(ROOT, '.env.local'), 'utf8')
const env = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

const MAP      = JSON.parse(readFileSync(MAP_PATH, 'utf8'))           // { "001": "slug", ... }
const PROGRESS = existsSync(PROG_PATH)
  ? JSON.parse(readFileSync(PROG_PATH, 'utf8'))
  : { processed: {} }                                                 // { processed: { "001": "slug.jpg" } }

mkdirSync(DEST, { recursive: true })

// ── Scan turboflow folder ─────────────────────────────────────────────────────
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp'])
let files = []
try {
  files = readdirSync(TURBOFLOW).filter(f => {
    const ext = extname(f).toLowerCase()
    return IMAGE_EXTS.has(ext)
  })
} catch (e) {
  console.log(`⚠  Cannot read ${TURBOFLOW}: ${e.message}`)
  process.exit(0)
}

// Match filename to a number key (e.g. "001.jpg", "1.jpg", "image001.jpg")
function parseNum(filename) {
  const m = filename.match(/(\d{1,3})(?:\.\w+)?$/)
  if (!m) return null
  return String(parseInt(m[1], 10)).padStart(3, '0')
}

const newlyProcessed = []

for (const file of files) {
  const numKey = parseNum(basename(file, extname(file))) || parseNum(file)
  if (!numKey) continue
  if (!MAP[numKey]) { console.log(`  ⚠  No slug for key ${numKey} (${file}), skipping`); continue }
  if (PROGRESS.processed[numKey]) continue  // already done

  const slug     = MAP[numKey]
  const destName = `${slug}.webp`                      // always store as WebP
  const destPath = join(DEST, destName)
  const srcPath  = join(TURBOFLOW, file)
  const imageUrl = `/blog-images/${destName}`
  const now      = new Date().toISOString()

  // 1. Convert to WebP (quality 82) and save
  try {
    await sharp(srcPath).webp({ quality: 82, effort: 4 }).toFile(destPath)
  } catch (convErr) {
    console.log(`  ✗ conversion failed for ${file}: ${convErr.message}`)
    continue
  }
  console.log(`  ✓ webp    ${file} → public/blog-images/${destName}`)

  // 2. Update Supabase
  const { error } = await supabase
    .from('blog_posts')
    .update({ featured_image: imageUrl, is_published: true, published_at: now })
    .eq('slug', slug)

  if (error) {
    console.log(`  ✗ supabase error for ${slug}: ${error.message}`)
    continue
  }
  console.log(`  ✓ published ${slug}`)

  // 3. Track
  PROGRESS.processed[numKey] = destName
  newlyProcessed.push({ numKey, slug, destName })
}

// ── Save progress ─────────────────────────────────────────────────────────────
writeFileSync(PROG_PATH, JSON.stringify(PROGRESS, null, 2), 'utf8')

// ── Git commit + push if anything new ────────────────────────────────────────
if (newlyProcessed.length > 0) {
  const slugList = newlyProcessed.map(x => x.slug).join(', ')
  try {
    execSync(`git -C "${ROOT}" add public/blog-images/ scripts/image-progress.json`, { stdio: 'inherit' })
    execSync(
      `git -C "${ROOT}" commit -m "Publish ${newlyProcessed.length} image(s): ${slugList.slice(0,120)}"`,
      { stdio: 'inherit' }
    )
    execSync(`git -C "${ROOT}" push`, { stdio: 'inherit' })
    console.log(`\n  ✓ pushed ${newlyProcessed.length} new image(s) to Vercel`)
  } catch (e) {
    console.log(`  ✗ git error: ${e.message}`)
  }
} else {
  console.log('  — no new images this run')
}

// ── Summary ───────────────────────────────────────────────────────────────────
const done  = Object.keys(PROGRESS.processed).length
const total = Object.keys(MAP).length
console.log(`\n  Progress: ${done}/${total} images published`)
if (done < total) {
  const remaining = Object.keys(MAP).filter(k => !PROGRESS.processed[k])
  console.log(`  Still waiting: ${remaining.slice(0,10).map(k => `${k}→${MAP[k]}`).join(', ')}${remaining.length > 10 ? ` … +${remaining.length-10} more` : ''}`)
}
process.exit(0)
