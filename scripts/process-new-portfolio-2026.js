/* Processes the 5 new portfolio additions:
 *   - Alex 4-Token Pack (Tokens)
 *   - Reborns Ray Gun (Weapons & Assets)
 *   - Reborns 2 Sidearm (Weapons & Assets)
 *   - Magnet Character Sheet (Character Sheets)
 *   - Celeste 10-Emote Pack (Emotes)
 *
 * Same watermark + WebP pipeline as scripts/watermark-and-process.js.
 * Run: node scripts/process-new-portfolio-2026.js
 */
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SRC = 'public/artwork-upload'
const DST = 'public/images/portfolio'

/* ---------- Dual-tone watermark (verbatim from watermark-and-process.js) ---------- */
function makeWatermarkSvg(size) {
  const center = size / 2
  const radius = size * 0.44
  const strokeWhite = size * 0.025
  const strokeDark = strokeWhite * 1.7
  const fontSize = size * 0.40
  const textStroke = fontSize * 0.06
  const opLight = 0.55
  const opDark = 0.30

  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="black" stroke-width="${strokeDark}" opacity="${opDark}"/>
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="white" stroke-width="${strokeWhite}" opacity="${opLight}"/>
      <text x="${center}" y="${center}" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="600"
        letter-spacing="-${fontSize * 0.03}"
        paint-order="stroke"
        fill="white" fill-opacity="${opLight}"
        stroke="black" stroke-width="${textStroke}" stroke-opacity="${opDark}">DV</text>
    </svg>`,
  )
}

async function processOne(src, dst, opts = {}) {
  const { quality = 86, maxWidth = null } = opts
  if (!fs.existsSync(src)) return { error: `MISSING: ${src}` }

  const meta = await sharp(src).metadata()
  let outputW = meta.width
  let outputH = meta.height
  if (maxWidth && meta.width > maxWidth) {
    outputW = maxWidth
    outputH = Math.round(meta.height * (maxWidth / meta.width))
  }

  const watermarkSize = Math.round(Math.min(outputW, outputH) * 0.10)
  const padding = Math.round(watermarkSize * 0.4)
  const wmBuf = makeWatermarkSvg(watermarkSize)

  let pipeline = sharp(src)
  if (maxWidth && meta.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
  }

  const dstDir = path.dirname(dst)
  if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true })

  const r = await pipeline
    .composite([{ input: wmBuf, top: outputH - watermarkSize - padding, left: outputW - watermarkSize - padding }])
    .webp({ quality, effort: 6 })
    .toFile(dst)

  return { dst, w: r.width, h: r.height, kb: (r.size / 1024).toFixed(1) }
}

/* ---------- Tasks ---------- */
const TASKS = [
  // Alex's 4-Token Pack — Minion (Phyrexian Processor) render as hero
  { src: `${SRC}/Tokens/PHYREXIANRenderV1.png`,  dst: `${DST}/alex-token-pack/hero.webp`,      maxWidth: 1400 },
  { src: `${SRC}/Tokens/zombieRenderV1.png`,     dst: `${DST}/alex-token-pack/process-1.webp`, quality: 82, maxWidth: 900 },
  { src: `${SRC}/Tokens/soldierRenderV1.png`,    dst: `${DST}/alex-token-pack/process-2.webp`, quality: 82, maxWidth: 900 },
  { src: `${SRC}/Tokens/angelSketchV1.png`,      dst: `${DST}/alex-token-pack/process-3.webp`, quality: 82, maxWidth: 900 },

  // Reborns — Ray Gun (patent blueprint)
  { src: `${SRC}/Weapons & assets/Reborns 1/RebornColorV1.png`,  dst: `${DST}/reborns-ray-gun/hero.webp`,      maxWidth: 1400 },
  { src: `${SRC}/Weapons & assets/Reborns 1/RebornSketchV1.png`, dst: `${DST}/reborns-ray-gun/process-1.webp`, quality: 82, maxWidth: 900 },

  // Reborns 2 — Sidearm
  { src: `${SRC}/Weapons & assets/Reborns 2/Reborn_2FinalWeapon.png`, dst: `${DST}/reborns-weapon-2/hero.webp`,      maxWidth: 1400 },
  { src: `${SRC}/Weapons & assets/Reborns 2/Reborn_2.png`,           dst: `${DST}/reborns-weapon-2/process-1.webp`, quality: 82, maxWidth: 900 },

  // Magnet — Character Sheet
  { src: `${SRC}/Character sheet/MagnetColorsV4.png`,   dst: `${DST}/magnet-character-sheet/hero.webp`,      maxWidth: 1400 },
  { src: `${SRC}/Character sheet/Magnet Sketch V1.png`, dst: `${DST}/magnet-character-sheet/process-1.webp`, quality: 82, maxWidth: 900 },

  // Celeste — 10-Emote Pack (sketch sheet as hero, 3 emoji samples as process)
  { src: `${SRC}/Emotes/celeste_emoteSketchesV1.png`, dst: `${DST}/celeste-emote-pack/hero.webp`,      maxWidth: 1400 },
  { src: `${SRC}/Emotes/emoji1.png`,                  dst: `${DST}/celeste-emote-pack/process-1.webp`, quality: 82, maxWidth: 600 },
  { src: `${SRC}/Emotes/emoji5.png`,                  dst: `${DST}/celeste-emote-pack/process-2.webp`, quality: 82, maxWidth: 600 },
  { src: `${SRC}/Emotes/emoji8.png`,                  dst: `${DST}/celeste-emote-pack/process-3.webp`, quality: 82, maxWidth: 600 },
]

;(async () => {
  console.log('Processing 5 new portfolio additions with watermark...\n')
  let ok = 0
  let err = 0
  for (const t of TASKS) {
    const r = await processOne(t.src, t.dst, t)
    if (r.error) {
      console.log(`✗ ${t.dst}: ${r.error}`)
      err++
    } else {
      const rel = path.relative(DST, t.dst)
      console.log(`✓ ${rel.padEnd(40)} ${r.w}x${r.h}  ${r.kb} KB`)
      ok++
    }
  }
  console.log(`\nDone. ${ok} ok, ${err} errors.`)
  if (err > 0) process.exit(1)
})()
