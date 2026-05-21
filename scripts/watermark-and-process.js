/* One-shot pipeline that re-processes every client-artwork WebP file
 * with a baked-in DV monogram watermark (circle + DV serif text).
 *
 * Why bake into the file: the watermark is the only protection that
 * actually survives a screenshot or save-as. CSS overlays only deter
 * the browser, not the OS clipboard or DevTools. Baking it means the
 * mark stays on the image wherever it ends up.
 *
 * Watermark spec:
 *   - Position: bottom-right corner with proportional padding
 *   - Size: 10% of the image's smaller dimension
 *   - Style: circle outline + DV serif monogram, white
 *   - Opacity: 25% (subtle; deliberately understated per spec)
 *
 * Usage: node scripts/watermark-and-process.js
 *
 * Processes:
 *   1. All 24 portfolio projects (hero + process thumbs)
 *   2. The Vesper Goldclaw pilot (bill-nye folder, 4 files)
 *   3. Homepage hero thumbs (elgin, dusk, npc-character)
 *   4. Persona images (player-closeup, npc-zipperon, party-framed)
 *
 * All output paths overwrite existing WebPs. Source files in
 * public/artwork-upload/ are NEVER modified, so re-running this script
 * is idempotent and safe.
 */
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SRC_PROJECTS = 'public/artwork-upload/projects'
const SRC_ROOT = 'public/artwork-upload'
const DST = 'public/images/portfolio'

/* ---------- Watermark SVG generator ----------
 * Dual-tone watermark so it stays visible on every background.
 *
 * Single-color marks disappear when they match the underlying art
 * (white on a sky, black on a shadow). The fix is to render TWO
 * passes: a slightly thicker dark stroke underneath, then a thinner
 * white stroke + fill on top. On dark image areas the white shows,
 * on light areas the dark outline shows, on midtones both contribute.
 *
 * SVG `paint-order="stroke"` on the text draws the stroke first then
 * the fill paints over it, so the dark outline only peeks around the
 * letter edges — gives a clean stamped/embossed look.
 */
function makeWatermarkSvg(size, _opacity = 0.25) {
  const center = size / 2
  const radius = size * 0.44
  const strokeWhite = size * 0.025
  const strokeDark = strokeWhite * 1.7  // slightly thicker so it peeks
  const fontSize = size * 0.40
  const textStroke = fontSize * 0.06
  const opLight = 0.55  // white layer
  const opDark = 0.30   // dark layer

  return Buffer.from(
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Dark base layer: provides contrast against light backgrounds -->
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="black" stroke-width="${strokeDark}" opacity="${opDark}"/>
      <!-- White overlay: provides contrast against dark backgrounds -->
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="white" stroke-width="${strokeWhite}" opacity="${opLight}"/>
      <!-- DV text: white fill with dark stroke behind (paint-order:stroke) -->
      <text x="${center}" y="${center}" text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" font-weight="600"
        letter-spacing="-${fontSize * 0.03}"
        paint-order="stroke"
        fill="white" fill-opacity="${opLight}"
        stroke="black" stroke-width="${textStroke}" stroke-opacity="${opDark}">DV</text>
    </svg>`,
  )
}

/* ---------- Resize + watermark pipeline ---------- */
async function process(src, dst, opts = {}) {
  const { quality = 86, maxWidth = null, watermarkOpacity = 0.25 } = opts

  if (!fs.existsSync(src)) {
    return { error: `MISSING SOURCE: ${src}` }
  }

  const meta = await sharp(src).metadata()
  let outputW = meta.width
  let outputH = meta.height
  if (maxWidth && meta.width > maxWidth) {
    outputW = maxWidth
    outputH = Math.round(meta.height * (maxWidth / meta.width))
  }

  const watermarkSize = Math.round(Math.min(outputW, outputH) * 0.10)
  const padding = Math.round(watermarkSize * 0.4)
  const wmBuf = makeWatermarkSvg(watermarkSize, watermarkOpacity)

  let pipeline = sharp(src)
  if (maxWidth && meta.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true })
  }

  const dstDir = path.dirname(dst)
  if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true })

  const r = await pipeline
    .composite([
      {
        input: wmBuf,
        top: outputH - watermarkSize - padding,
        left: outputW - watermarkSize - padding,
      },
    ])
    .webp({ quality, effort: 6 })
    .toFile(dst)

  return { dst, w: r.width, h: r.height, kb: (r.size / 1024).toFixed(1) }
}

/* ---------- 24 portfolio projects ---------- */
const PROJECTS = [
  { folder: 'Aderall',         slug: 'aderall',                hero: 'AnderallFinal.jpg',                process: ['AndreallSketchV1.png'] },
  { folder: 'Alex Evildoer',   slug: 'alex-evildoer',          hero: 'ColorWithHelmet_BG.png',           process: ['V1.png', 'V1.2.png', 'ColorNoHelmet_BG.png'] },
  { folder: 'Amalura',         slug: 'amalura',                hero: 'AmaRenderFinal.jpeg',              process: ['AmaSketchV1.jpeg', 'AmaFlatsV1.jpeg'] },
  { folder: 'Bride of herne',  slug: 'bride-of-herne',         hero: 'BrideOfHerneColorV1R.jpg',         process: ['LineartV1.jpg', 'LineartV2.jpg', 'LineartV3.jpg'] },
  { folder: 'Caracal',         slug: 'caracal-thalia',         hero: 'CaracalSheetV1.png',               process: ['SketchV1.png', 'SketchV2.png'] },
  { folder: 'EBAG',            slug: 'ebag-ranger',            hero: 'ebag6CharacterSceneRenderV1.png',  process: ['ebag6CharacterSceneSketchV1.png'] },
  { folder: 'Grellden',        slug: 'thistle-quickpaw',       hero: 'FinalArt.jpg',                     process: ['SketchV1.jpg', 'SketchV2.jpg', 'SketchV3.jpg'] },
  { folder: 'Hammock',         slug: 'hammock-chaos-warrior',  hero: 'Hammock_ColorV1.jpg',              process: ['LineartV2.png', 'Sketch_LineartV2.jpg'] },
  { folder: 'Hayden',          slug: 'hayden-banner',          hero: 'HaYDENbANNERcOLORED.png',          process: ['HaydenBannerSketchV1.png'] },
  { folder: 'Jockey',          slug: 'jockey-jotunborn-monk',  hero: 'JocetRenderFinal3.png',            process: ['JockeyLineartV1.png', 'JockeyBaseV1.2.png', 'JocetRenderFinal2.png'] },
  { folder: 'Lexia',           slug: 'lexia-half-drow-rogue',  hero: 'LexiaRenderV1.jpeg',               process: ['LexiaLineartV1.jpeg', 'LexiaLineartV1.1Revision.jpeg', 'LexiaFlatsV1.jpeg'] },
  { folder: 'Mouse',           slug: 'mouse-desert-five',      hero: 'MouseGroupArtColorsV2.png',        process: ['MouseGroupArt.png', 'MouseGroupArtColorsV1.png'] },
  { folder: 'Nan Gram',        slug: 'nan-gram-were',          hero: 'Nan_gramColorV2.png',              process: ['Nan_gramSketchV1.png', 'Nan_gramColor.png'] },
  { folder: 'Natknight',       slug: 'natknight-sci-trio',     hero: 'Natknightgroupart.jpg',            process: ['jediSketchV1.png', 'ladyarmyB&Wv1.0.png', 'robotSketchB&WV1.png'] },
  { folder: 'Nerd',            slug: 'nerd-hobgoblin-token',   hero: 'NerdTokenArtRendersV1.png',        process: ['NerdTokenArtSetchV1.png'] },
  { folder: 'Palmerjwm',       slug: 'palmerjwm-portrait',     hero: 'FinalUpdated.jpg',                 process: ['Palm2SketchV1.png', 'BaseColor.png', 'RenderV1.png'] },
  { folder: 'Pixel',           slug: 'pixel-runaway',          hero: 'Pixel Renders.png',                process: ['Pixel Line Art.png', 'Pixel Line Art V2.png'] },
  { folder: 'Tharriq Tarjin',  slug: 'tharriq-laura-wedding',  hero: 'coupleFinal.png',                  process: ['TharriqTarjinSketchV1.png', 'TharriqTarjinColorV1.png', 'lauraColorV1.png'] },
  { folder: 'Truck',           slug: 'truck-cyberpunk',        hero: 'TruckColoredV2RevisedPurple.png',  process: ['TruckSketchV1.png', 'TruckColoredV1.png'] },
  { folder: 'Truck 2',         slug: 'truck2-shark-sorcerer',  hero: 'Character1ColorV2.png',            process: ['Character1SketchV1.png', 'Character1SketchV2.png', 'Character1ColorV1.png'] },
  { folder: 'Tyrannosaurus',   slug: 'tyrannosaurus-glaive',   hero: 'Glaive_form1ColorV1.2.png',        process: ['Glaive_form1Sketch1.png', 'Glaive_form1ColorV1.png', 'Glaive_form1ColorV1.1.png'] },
  { folder: 'Vergil',          slug: 'vergil-hunter',          hero: 'VergilPSD.jpg',                    process: ['VergilSketch V1.png', 'VergilColor V1.png'] },
  { folder: 'Wolf',            slug: 'wolf-shonen-fanart',     hero: 'wolfColorV2WithBG.png',            process: ['WolfLineartV1.png', 'wolfColorV1.png', 'wolfColorV2.png'] },
]

/* ---------- Standalone files (pilot + homepage hero + personas) ---------- */
const STANDALONE = [
  // Vesper Goldclaw pilot (BillNye source — kept in its own folder)
  { src: `${SRC_PROJECTS}/BillNye/BillNyeFullBG.png`, dst: `${DST}/bill-nye/hero.webp`,      quality: 86 },
  { src: `${SRC_PROJECTS}/BillNye/Lineart.png`,       dst: `${DST}/bill-nye/lineart.webp`,   quality: 84 },
  { src: `${SRC_PROJECTS}/BillNye/Greyscale.png`,     dst: `${DST}/bill-nye/greyscale.webp`, quality: 84 },
  { src: `${SRC_PROJECTS}/BillNye/ColorV1.png`,       dst: `${DST}/bill-nye/color.webp`,     quality: 84 },
  // Homepage hero thumbs (top-level upload folder)
  { src: `${SRC_ROOT}/Elgin Render V1.jpeg`,          dst: `${DST}/elgin-character.webp`,   quality: 82, maxWidth: 720 },
  { src: `${SRC_ROOT}/DuskColorV1.3.png`,             dst: `${DST}/dusk-character.webp`,    quality: 82, maxWidth: 720 },
  { src: `${SRC_ROOT}/EchoRenderV1.png`,              dst: `${DST}/echo-character.webp`,    quality: 82, maxWidth: 720 },
  { src: `${SRC_ROOT}/NPC Character.jpg`,             dst: `${DST}/npc-character.webp`,     quality: 82, maxWidth: 720 },
  // Personas (top-level upload folder)
  { src: `${SRC_ROOT}/CloseupDND.png`,                dst: `${DST}/player-closeup.webp`,    quality: 84, maxWidth: 1100 },
  { src: `${SRC_ROOT}/Zipperon- FinalArt.jpg`,        dst: `${DST}/npc-zipperon.webp`,      quality: 84, maxWidth: 1280 },
  { src: `${SRC_ROOT}/PartyFramed2.jpeg`,             dst: `${DST}/party-framed.webp`,      quality: 84, maxWidth: 1024 },
]

/* ---------- Run ---------- */
;(async () => {
  console.log('Processing 24 portfolio projects + standalone artwork with watermark...\n')

  let okCount = 0
  let errCount = 0

  // 24 projects: each = hero + up to 3 process thumbs
  for (const p of PROJECTS) {
    const heroSrc = path.join(SRC_PROJECTS, p.folder, p.hero)
    const heroDst = path.join(DST, p.slug, 'hero.webp')
    const r = await process(heroSrc, heroDst, { quality: 86, maxWidth: 1400 })
    if (r.error) {
      console.log(`✗ ${p.slug}/hero: ${r.error}`)
      errCount++
    } else {
      console.log(`✓ ${p.slug.padEnd(30)} hero.webp        ${r.w}x${r.h}  ${r.kb} KB`)
      okCount++
    }

    for (let i = 0; i < p.process.length && i < 3; i++) {
      const psrc = path.join(SRC_PROJECTS, p.folder, p.process[i])
      const pdst = path.join(DST, p.slug, `process-${i + 1}.webp`)
      const pr = await process(psrc, pdst, { quality: 82, maxWidth: 900 })
      if (pr.error) {
        console.log(`  ✗ process-${i + 1}: ${pr.error}`)
        errCount++
      } else {
        okCount++
      }
    }
  }

  // Standalone files
  console.log('\nProcessing standalone artwork...')
  for (const f of STANDALONE) {
    const r = await process(f.src, f.dst, f)
    if (r.error) {
      console.log(`✗ ${f.dst}: ${r.error}`)
      errCount++
    } else {
      console.log(`✓ ${path.relative(DST, f.dst).padEnd(36)} ${r.w}x${r.h}  ${r.kb} KB`)
      okCount++
    }
  }

  console.log(`\nDone. ${okCount} ok, ${errCount} errors.`)
})()
