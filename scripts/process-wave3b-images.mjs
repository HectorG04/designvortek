/**
 * process-wave3b-images.mjs
 *
 * Crop + optimize the 13 Wave 3b cover + inline images.
 * Sources: E:\Chrome Downloads\turboflow\NNN (1).png (numbered 001-013).
 * Outputs: public/blog-images/<slug>[-<slot>].webp
 *
 * Cover slot saves as <slug>.webp (matches existing featured_image convention).
 * Inline slots save as <slug>-mid.webp, <slug>-close.webp, <slug>-extra.webp.
 */

import sharp from 'sharp'
import { existsSync, mkdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC_DIR = 'E:\\Chrome Downloads\\turboflow'
const DEST_DIR = join(ROOT, 'public', 'blog-images')

const MAP = [
  { num: '001', slug: 'dnd-party-portrait-commission-guide',                      slot: 'cover' },
  { num: '002', slug: 'dnd-party-portrait-commission-guide',                      slot: 'mid'   },
  { num: '003', slug: 'dnd-party-portrait-commission-guide',                      slot: 'close' },
  { num: '004', slug: 'how-to-describe-dnd-character-to-artist',                  slot: 'cover' },
  { num: '005', slug: 'how-to-describe-dnd-character-to-artist',                  slot: 'mid'   },
  { num: '006', slug: 'how-to-describe-dnd-character-to-artist',                  slot: 'close' },
  { num: '007', slug: 'hand-painted-character-art-vs-ai',                         slot: 'cover' },
  { num: '008', slug: 'hand-painted-character-art-vs-ai',                         slot: 'mid'   },
  { num: '009', slug: 'hand-painted-character-art-vs-ai',                         slot: 'close' },
  { num: '010', slug: 'dnd-character-art-ai-vs-commissioned-vs-handpainted',      slot: 'cover' },
  { num: '011', slug: 'dnd-character-art-ai-vs-commissioned-vs-handpainted',      slot: 'mid'   },
  { num: '012', slug: 'dnd-character-art-ai-vs-commissioned-vs-handpainted',      slot: 'close' },
  { num: '013', slug: 'dnd-character-art-ai-vs-commissioned-vs-handpainted',      slot: 'extra' },
]

const SLOT_DIMS = {
  cover: { w: 1920, h: 1080 }, // 16:9
  mid:   { w: 1080, h: 1350 }, // 4:5
  close: { w: 1080, h: 1080 }, // 1:1
  extra: { w: 1080, h: 1350 }, // 4:5
}

if (!existsSync(DEST_DIR)) mkdirSync(DEST_DIR, { recursive: true })

let success = 0
for (const { num, slug, slot } of MAP) {
  const srcPath = join(SRC_DIR, `${num} (1).png`)
  if (!existsSync(srcPath)) {
    console.error(`  ✗ ${num}: not found at ${srcPath}`)
    continue
  }
  const destName = slot === 'cover' ? `${slug}.webp` : `${slug}-${slot}.webp`
  const destPath = join(DEST_DIR, destName)
  const { w, h } = SLOT_DIMS[slot]
  try {
    const meta = await sharp(srcPath).metadata()
    await sharp(srcPath)
      .resize(w, h, { fit: 'cover', position: 'attention' })
      .webp({ quality: 82 })
      .toFile(destPath)
    const kb = Math.round(statSync(destPath).size / 1024)
    console.log(`  ✓ ${num} → ${destName}  ${meta.width}x${meta.height} → ${w}x${h}  ${kb} KB`)
    success++
  } catch (err) {
    console.error(`  ✗ ${num}: ${err.message}`)
  }
}

console.log(`\n${success}/${MAP.length} Wave 3b images processed.`)
