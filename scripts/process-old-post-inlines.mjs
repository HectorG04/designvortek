/**
 * process-old-post-inlines.mjs
 *
 * One-shot pipeline for the 20 inline images for the 10 older posts:
 *   1. Read 001-020.png from E:\Chrome Downloads\turboflow
 *   2. Crop to the slot's target ratio (mid → 4:5, close → 1:1, extra → 4:5) via
 *      sharp attention-based smart crop, WebP quality 82
 *   3. Save to public/blog-images/<slug>-<slot>.webp
 *   4. Inject markdown image references into each post's `content` field
 *      at structurally appropriate H2 boundaries, then UPDATE the
 *      blog_posts row in Supabase
 *
 * Run: node scripts/process-old-post-inlines.mjs
 */

import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, mkdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC_DIR = 'E:\\Chrome Downloads\\turboflow'
const DEST_DIR = join(ROOT, 'public', 'blog-images')

// ── Load env ────────────────────────────────────────────────────────────────
const envText = readFileSync(join(ROOT, '.env.local'), 'utf8')
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^["']|["']$/g,'')] }),
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// ── File-number → (slug, slot) mapping (matches image-prompts-old-posts-inline.md) ──
const MAP = [
  { num: '001', slug: 'best-gifts-for-dnd-players-2026',         slot: 'mid'   },
  { num: '002', slug: 'best-gifts-for-dnd-players-2026',         slot: 'close' },
  { num: '003', slug: 'choosing-a-commission-style',             slot: 'mid'   },
  { num: '004', slug: 'choosing-a-commission-style',             slot: 'close' },
  { num: '005', slug: 'choosing-a-commission-style',             slot: 'extra' },
  { num: '006', slug: 'dnd-character-art-commission-prices-2026', slot: 'mid'  },
  { num: '007', slug: 'dnd-character-art-commission-prices-2026', slot: 'close'},
  { num: '008', slug: 'first-art-fair-booth',                    slot: 'mid'   },
  { num: '009', slug: 'first-art-fair-booth',                    slot: 'close' },
  { num: '010', slug: 'hero-forge-to-handpainted',               slot: 'mid'   },
  { num: '011', slug: 'hero-forge-to-handpainted',               slot: 'close' },
  { num: '012', slug: 'how-to-commission-dnd-character-art',     slot: 'mid'   },
  { num: '013', slug: 'how-to-commission-dnd-character-art',     slot: 'close' },
  { num: '014', slug: 'how-to-write-commission-brief',           slot: 'mid'   },
  { num: '015', slug: 'how-to-write-commission-brief',           slot: 'close' },
  { num: '016', slug: 'strahd-npc-pack-six-weeks',               slot: 'mid'   },
  { num: '017', slug: 'strahd-npc-pack-six-weeks',               slot: 'close' },
  { num: '018', slug: 'strahd-npc-pack-six-weeks',               slot: 'extra' },
  { num: '019', slug: 'three-weeks-with-lyra',                   slot: 'mid'   },
  { num: '020', slug: 'vtt-token-deserves-more',                 slot: 'mid'   },
]

const SLOT_RATIOS = {
  mid:   { w: 1080, h: 1350, label: '4:5' },
  close: { w: 1080, h: 1080, label: '1:1' },
  extra: { w: 1080, h: 1350, label: '4:5' },
}

const SLOT_ALT = {
  mid:   (title) => `${title} — studio reference image`,
  close: (title) => `${title} — detail crop`,
  extra: (title) => `${title} — additional reference`,
}

if (!existsSync(DEST_DIR)) mkdirSync(DEST_DIR, { recursive: true })

// ── Step 1: crop + write all 20 WebPs ───────────────────────────────────────
console.log('— Cropping and writing inline images —')
const generatedBySlug = {} // { slug: [{slot, url}] }
for (const { num, slug, slot } of MAP) {
  const srcPath = join(SRC_DIR, `${num}.png`)
  if (!existsSync(srcPath)) {
    console.error(`  ✗ ${num}: source not found`)
    continue
  }
  const target = SLOT_RATIOS[slot]
  const destPath = join(DEST_DIR, `${slug}-${slot}.webp`)
  try {
    const meta = await sharp(srcPath).metadata()
    await sharp(srcPath)
      .resize(target.w, target.h, { fit: 'cover', position: 'attention' })
      .webp({ quality: 82 })
      .toFile(destPath)
    const sizeKB = Math.round(statSync(destPath).size / 1024)
    console.log(`  ✓ ${num} → ${slug}-${slot}.webp  ${meta.width}x${meta.height} → ${target.w}x${target.h} (${target.label})  ${sizeKB} KB`)
    if (!generatedBySlug[slug]) generatedBySlug[slug] = []
    generatedBySlug[slug].push({ slot, url: `/blog-images/${slug}-${slot}.webp` })
  } catch (err) {
    console.error(`  ✗ ${num} → ${slug}-${slot}: ${err.message}`)
  }
}

// ── Step 2: for each post, inject image markdown into the content field ─────
console.log('\n— Updating Supabase content with inline image refs —')

/**
 * Insert markdown image refs into a post's content at structurally
 * appropriate H2 boundaries. Returns the new content string.
 *
 * Placement rules per the IMAGE-STYLE-GUIDE:
 *   mid (4:5)   → after section 2  (= insert before the 3rd H2)
 *   close (1:1) → before final CTA (= insert before the last H2)
 *   extra (4:5) → middle           (= insert before the middle H2)
 *
 * If there aren't enough H2s, we use proportional positions through the content.
 */
function injectImages(content, slug, title, images) {
  // Skip if already has inline image references for this slug
  const alreadyHas = images.some((img) => content.includes(img.url))
  if (alreadyHas) {
    return { content, skipped: true }
  }

  // Find all H2 line positions
  const h2Lines = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) h2Lines.push(i)
  }

  // Map slot → target line index (where to insert BEFORE)
  const insertionPlan = {}
  if (h2Lines.length >= 3) {
    const midSlot   = images.find((i) => i.slot === 'mid')
    const closeSlot = images.find((i) => i.slot === 'close')
    const extraSlot = images.find((i) => i.slot === 'extra')
    if (midSlot)   insertionPlan[h2Lines[Math.max(1, Math.floor(h2Lines.length * 0.30))]] = midSlot
    if (extraSlot) insertionPlan[h2Lines[Math.max(2, Math.floor(h2Lines.length * 0.55))]] = extraSlot
    if (closeSlot) insertionPlan[h2Lines[Math.max(h2Lines.length - 1, Math.floor(h2Lines.length * 0.85))]] = closeSlot
  } else if (h2Lines.length >= 1) {
    // Few H2s — just put mid after the first H2 section
    const midSlot   = images.find((i) => i.slot === 'mid')
    const closeSlot = images.find((i) => i.slot === 'close')
    if (midSlot && h2Lines[0] !== undefined)   insertionPlan[h2Lines[0] + 1] = midSlot
    if (closeSlot && h2Lines[h2Lines.length - 1] !== undefined) insertionPlan[h2Lines[h2Lines.length - 1]] = closeSlot
  } else {
    // No H2s at all (very short manifesto-style posts) — append near the end
    const lastLineIdx = lines.length - 1
    const midSlot = images.find((i) => i.slot === 'mid')
    if (midSlot) insertionPlan[Math.max(1, Math.floor(lastLineIdx * 0.5))] = midSlot
  }

  // Sort insertions by line index DESCENDING so we can splice without shifting earlier indices
  const insertionsSorted = Object.entries(insertionPlan)
    .map(([idx, img]) => ({ idx: parseInt(idx, 10), img }))
    .sort((a, b) => b.idx - a.idx)

  for (const { idx, img } of insertionsSorted) {
    const alt = SLOT_ALT[img.slot](title)
    const block = ['', `![${alt}](${img.url})`, '']
    lines.splice(idx, 0, ...block)
  }

  return { content: lines.join('\n'), skipped: false }
}

let updated = 0
for (const slug of Object.keys(generatedBySlug)) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, content')
    .eq('slug', slug)
    .maybeSingle()
  if (error || !data) {
    console.error(`  ✗ ${slug}: fetch failed — ${error?.message ?? 'no row'}`)
    continue
  }
  const images = generatedBySlug[slug]
  const { content: newContent, skipped } = injectImages(data.content, slug, data.title, images)

  if (skipped) {
    console.log(`  • ${slug}: already has inline refs — skipped`)
    continue
  }

  const { error: updErr } = await supabase
    .from('blog_posts')
    .update({ content: newContent, updated_at: new Date().toISOString() })
    .eq('id', data.id)
  if (updErr) {
    console.error(`  ✗ ${slug}: update failed — ${updErr.message}`)
    continue
  }
  console.log(`  ✓ ${slug}: injected ${images.length} inline ref(s), content updated`)
  updated++
}

console.log(`\nDone. ${updated} posts updated with inline images.`)
