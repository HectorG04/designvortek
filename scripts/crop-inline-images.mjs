/**
 * crop-inline-images.mjs
 *
 * Crop + optimize inline blog images from a single 16:9 source.
 * For every entry in the CONFIG array below:
 *   - Reads the source file from the SRC_DIR (or absolute path)
 *   - Smart-crops to the target ratio using sharp's attention algorithm
 *   - Writes WebP quality 82 to public/blog-images/<slug>-<position>.webp
 *   - Optionally updates Supabase if you set `inline_images` jsonb field
 *
 * Target ratios per position:
 *   mid    → 4:5  portrait (1080×1350)  — placed after H2 #2 or #3
 *   close  → 1:1  square   (1080×1080)  — placed before final CTA
 *   cover  → 16:9 wide     (1920×1080)  — already handled by process-old-post-covers.mjs
 *
 * If the smart crop loses something important, override with `position: 'top'`,
 * `'center'`, or `'bottom'` (for 4:5 cropping) — sharp interprets these as
 * literal alignment. By default we use 'attention' (smart saliency crop).
 *
 * Run: node scripts/crop-inline-images.mjs
 */

import sharp from 'sharp'
import { existsSync, mkdirSync, statSync, readdirSync } from 'fs'
import { join, dirname, isAbsolute } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DEST_DIR = join(ROOT, 'public', 'blog-images')

// Default source folder — where you drop generated 16:9 inline images.
const SRC_DIR = 'E:\\Chrome Downloads\\turboflow'

// ── Edit this array per batch ───────────────────────────────────────────────
// `src`      : filename inside SRC_DIR, OR absolute path
// `slug`     : matches blog_posts.slug
// `position` : 'mid' (→ 4:5) or 'close' (→ 1:1)
// `crop`     : optional override — 'attention' (default), 'center', 'top', 'bottom'
const CONFIG = [
  // example entries — replace with your real mappings when generating inlines:
  // { src: 'mid-001.png',   slug: 'best-gifts-for-dnd-players-2026', position: 'mid' },
  // { src: 'close-001.png', slug: 'best-gifts-for-dnd-players-2026', position: 'close' },
]

// ── Ratio table ─────────────────────────────────────────────────────────────
const TARGETS = {
  mid:   { w: 1080, h: 1350, label: '4:5 portrait' }, //   0.80 ratio
  close: { w: 1080, h: 1080, label: '1:1 square'   }, //   1.00 ratio
  cover: { w: 1920, h: 1080, label: '16:9 wide'    }, //   1.78 ratio
}

if (!existsSync(DEST_DIR)) mkdirSync(DEST_DIR, { recursive: true })

if (CONFIG.length === 0) {
  console.log('CONFIG is empty.')
  console.log('Edit scripts/crop-inline-images.mjs and add entries like:')
  console.log("  { src: 'mid-001.png', slug: 'your-slug', position: 'mid' }")
  console.log('Then re-run.\n')
  console.log('Available source files in', SRC_DIR + ':')
  try {
    for (const f of readdirSync(SRC_DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))) {
      console.log('  -', f)
    }
  } catch (e) {
    console.log('  (could not read source dir:', e.message + ')')
  }
  process.exit(0)
}

let success = 0
for (const entry of CONFIG) {
  const { src, slug, position, crop = 'attention' } = entry
  const target = TARGETS[position]
  if (!target) {
    console.error(`  ✗ ${slug}: invalid position "${position}" (use mid, close, or cover)`)
    continue
  }

  const srcPath = isAbsolute(src) ? src : join(SRC_DIR, src)
  if (!existsSync(srcPath)) {
    console.error(`  ✗ ${slug}/${position}: source not found at ${srcPath}`)
    continue
  }

  const destName = `${slug}-${position}.webp`
  const destPath = join(DEST_DIR, destName)

  try {
    const meta = await sharp(srcPath).metadata()
    await sharp(srcPath)
      .resize(target.w, target.h, { fit: 'cover', position: crop })
      .webp({ quality: 82 })
      .toFile(destPath)
    const outSize = statSync(destPath).size
    console.log(
      `  ✓ ${slug}-${position}.webp  ${meta.width}x${meta.height} → ${target.w}x${target.h} (${target.label}, crop=${crop})  ${Math.round(outSize / 1024)} KB`,
    )
    success++
  } catch (err) {
    console.error(`  ✗ ${slug}/${position}: ${err.message}`)
  }
}

console.log(`\n${success}/${CONFIG.length} inline images processed.`)
console.log(`Reference them in blog post markdown as:`)
console.log(`  ![alt text](/blog-images/<slug>-<position>.webp)`)
