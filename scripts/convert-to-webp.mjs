/**
 * convert-to-webp.mjs
 * Converts all .png / .jpeg / .jpg images in public/blog-images/ to
 * .webp (quality 82, lossless=false) using sharp, removes originals,
 * and bulk-updates Supabase featured_image URLs.
 *
 * Safe to re-run — skips files that are already .webp.
 * Usage: node scripts/convert-to-webp.mjs
 */

import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import {
  readFileSync, writeFileSync, existsSync,
  readdirSync, unlinkSync,
} from 'fs'
import { join, dirname, extname, basename } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')
const DEST      = join(ROOT, 'public', 'blog-images')

// ── Load env ─────────────────────────────────────────────────────────────────
const envRaw = readFileSync(join(ROOT, '.env.local'), 'utf8')
const env = Object.fromEntries(
  envRaw.split('\n')
    .filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// ── Gather files to convert ───────────────────────────────────────────────────
const SOURCE_EXTS = new Set(['.png', '.jpeg', '.jpg'])
const files = readdirSync(DEST).filter(f => SOURCE_EXTS.has(extname(f).toLowerCase()))

if (files.length === 0) {
  console.log('✓ No .png / .jpeg files found — already all WebP.')
  process.exit(0)
}

console.log(`Found ${files.length} file(s) to convert…\n`)

const converted = []
const failed    = []

for (const file of files) {
  const srcPath  = join(DEST, file)
  const slug     = basename(file, extname(file))       // strip extension
  const destName = `${slug}.webp`
  const destPath = join(DEST, destName)
  const oldUrl   = `/blog-images/${file}`
  const newUrl   = `/blog-images/${destName}`

  // Skip if already converted (e.g. re-run after partial failure)
  if (existsSync(destPath)) {
    console.log(`  ↩  skip  ${file}  (webp already exists)`)
    // Still try to delete the original if it's a different file
    if (srcPath !== destPath) {
      try { unlinkSync(srcPath) } catch {}
    }
    converted.push({ file, slug, oldUrl, newUrl })
    continue
  }

  // Convert
  try {
    await sharp(srcPath)
      .webp({ quality: 82, effort: 4 })
      .toFile(destPath)

    const srcStat  = (await import('fs')).statSync(srcPath)
    const destStat = (await import('fs')).statSync(destPath)
    const pct      = ((1 - destStat.size / srcStat.size) * 100).toFixed(1)
    console.log(`  ✓ conv  ${file} → ${destName}  (−${pct}%)`)

    // Remove original
    unlinkSync(srcPath)

    // Update Supabase row
    const { error } = await supabase
      .from('blog_posts')
      .update({ featured_image: newUrl })
      .eq('featured_image', oldUrl)

    if (error) {
      console.log(`  ✗ supabase update failed for ${slug}: ${error.message}`)
    } else {
      console.log(`  ✓ db    ${oldUrl} → ${newUrl}`)
    }

    converted.push({ file, slug, oldUrl, newUrl })
  } catch (err) {
    console.log(`  ✗ FAILED ${file}: ${err.message}`)
    failed.push(file)
  }
}

// ── Git commit + push ─────────────────────────────────────────────────────────
if (converted.length > 0) {
  try {
    execSync(`git -C "${ROOT}" add public/blog-images/`, { stdio: 'inherit' })
    execSync(
      `git -C "${ROOT}" commit -m "Convert ${converted.length} blog images to WebP (quality 82)"`,
      { stdio: 'inherit' }
    )
    execSync(`git -C "${ROOT}" push`, { stdio: 'inherit' })
    console.log(`\n✓ Pushed ${converted.length} WebP image(s) to Vercel`)
  } catch (e) {
    console.log(`\n✗ git error: ${e.message}`)
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n  Converted : ${converted.length}`)
console.log(`  Failed    : ${failed.length}${failed.length ? '  ← ' + failed.join(', ') : ''}`)
