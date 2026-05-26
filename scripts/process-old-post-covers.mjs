/**
 * process-old-post-covers.mjs
 *
 * One-shot pipeline for the 10 AI-generated cover images:
 *   1. Read 001.png … 010.png (or .jpeg) from E:\Chrome Downloads\turboflow
 *   2. Resize + center-crop to 1920×1080 (true 16:9), strip metadata
 *   3. Convert to WebP at quality 82
 *   4. Save to public/blog-images/<slug>.webp
 *   5. Update Supabase blog_posts.featured_image for each slug
 *
 * Numbered file → slug mapping mirrors the order in
 * docs/seo/image-prompts-old-posts.md.
 *
 * Run: node scripts/process-old-post-covers.mjs
 */

import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC_DIR = 'E:\\Chrome Downloads\\turboflow'
const DEST_DIR = join(ROOT, 'public', 'blog-images')

// ── Load .env.local ─────────────────────────────────────────────────────────
const envText = readFileSync(join(ROOT, '.env.local'), 'utf8')
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    }),
)
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL || !KEY) {
  console.error('Missing SUPABASE env vars in .env.local')
  process.exit(1)
}
const supabase = createClient(URL, KEY, { auth: { persistSession: false } })

// ── Numbered-file → slug map (order matches image-prompts-old-posts.md) ─────
const MAP = [
  { num: '001', slug: 'best-gifts-for-dnd-players-2026' },
  { num: '002', slug: 'choosing-a-commission-style' },
  { num: '003', slug: 'dnd-character-art-commission-prices-2026' },
  { num: '004', slug: 'first-art-fair-booth' },
  { num: '005', slug: 'hero-forge-to-handpainted' },
  { num: '006', slug: 'how-to-commission-dnd-character-art' },
  { num: '007', slug: 'how-to-write-commission-brief' },
  { num: '008', slug: 'strahd-npc-pack-six-weeks' },
  { num: '009', slug: 'three-weeks-with-lyra' },
  { num: '010', slug: 'vtt-token-deserves-more' },
]

if (!existsSync(DEST_DIR)) {
  mkdirSync(DEST_DIR, { recursive: true })
  console.log(`Created ${DEST_DIR}`)
}

// ── Find the source file for a given number (tolerates .png .jpg .jpeg) ─────
function findSrc(num) {
  const candidates = readdirSync(SRC_DIR)
  return candidates.find((f) => f.startsWith(num + '.'))
}

// ── Process each image ──────────────────────────────────────────────────────
const COVER_W = 1920
const COVER_H = 1080
const QUALITY = 82

let success = 0
for (const { num, slug } of MAP) {
  const srcName = findSrc(num)
  if (!srcName) {
    console.error(`  ✗ ${num} → ${slug}: source file not found in ${SRC_DIR}`)
    continue
  }

  const srcPath = join(SRC_DIR, srcName)
  const destPath = join(DEST_DIR, `${slug}.webp`)

  try {
    const meta = await sharp(srcPath).metadata()
    await sharp(srcPath)
      .resize(COVER_W, COVER_H, { fit: 'cover', position: 'attention' })
      .webp({ quality: QUALITY })
      .toFile(destPath)

    const outSize = statSync(destPath).size
    console.log(
      `  ✓ ${num} → ${slug}.webp  ${meta.width}x${meta.height} → ${COVER_W}x${COVER_H}  ${Math.round(outSize / 1024)} KB`,
    )

    // Update Supabase
    const featuredImageUrl = `/blog-images/${slug}.webp`
    const { error } = await supabase
      .from('blog_posts')
      .update({ featured_image: featuredImageUrl, updated_at: new Date().toISOString() })
      .eq('slug', slug)

    if (error) {
      console.error(`    ! Supabase update failed for ${slug}:`, error.message)
    } else {
      console.log(`    ✓ Supabase featured_image set to ${featuredImageUrl}`)
      success++
    }
  } catch (err) {
    console.error(`  ✗ ${num} → ${slug}: ${err.message}`)
  }
}

console.log(`\n${success}/${MAP.length} images processed and Supabase rows updated.`)
console.log('Next: git add public/blog-images/*.webp && git commit && git push')
