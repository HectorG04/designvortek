/* One-shot image processor for the May 2026 portfolio batch.
 * Walks each project folder, picks the hero + 3 process stage files
 * (matching the catalog agents' inference), runs them through sharp to
 * WebP @ q82-86. Outputs to public/images/portfolio/<slug>/.
 *
 * Usage: node scripts/process-portfolio-batch.js
 *
 * After running once successfully, this script is safe to delete or to
 * re-run idempotently (it overwrites outputs). It's intentionally kept
 * inside scripts/ rather than the build pipeline since image processing
 * is a one-time content op, not part of CI.
 */
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const SRC = 'public/artwork-upload/projects'
const DST = 'public/images/portfolio'

/* Per-project map. Order of process[] is: lineart/sketch -> color/block -> final/render.
 * Hero is always the most-finished file. Slug names match the eventual portfolio
 * entry slugs (some folders get renamed for in-fiction character display). */
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

const STAGE_LABELS = ['LINEART', 'COLOR', 'RENDER', 'FINAL']

async function processOne(p) {
  const srcDir = path.join(SRC, p.folder)
  const dstDir = path.join(DST, p.slug)
  if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true })

  const heroSrc = path.join(srcDir, p.hero)
  if (!fs.existsSync(heroSrc)) {
    return { slug: p.slug, error: `MISSING HERO: ${heroSrc}` }
  }
  const heroOut = path.join(dstDir, 'hero.webp')
  const heroStats = fs.statSync(heroSrc)
  const heroResult = await sharp(heroSrc)
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 86, effort: 6 })
    .toFile(heroOut)

  const processResults = []
  for (let i = 0; i < p.process.length && i < 3; i++) {
    const fname = p.process[i]
    const psrc = path.join(srcDir, fname)
    if (!fs.existsSync(psrc)) {
      processResults.push({ name: fname, error: 'missing' })
      continue
    }
    const pout = path.join(dstDir, `process-${i + 1}.webp`)
    const r = await sharp(psrc).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 82, effort: 6 }).toFile(pout)
    processResults.push({ name: fname, w: r.width, h: r.height, kb: (r.size / 1024).toFixed(1) })
  }

  return {
    slug: p.slug,
    folder: p.folder,
    heroDate: heroStats.mtime.toISOString().slice(0, 10),
    heroSize: `${heroResult.width}x${heroResult.height}, ${(heroResult.size / 1024).toFixed(1)} KB`,
    processCount: processResults.length,
    processOK: processResults.filter(r => !r.error).length,
    processErrors: processResults.filter(r => r.error),
  }
}

;(async () => {
  console.log(`Processing ${PROJECTS.length} projects...\n`)
  const results = []
  for (const p of PROJECTS) {
    try {
      const r = await processOne(p)
      results.push(r)
      if (r.error) console.log(`✗ ${p.slug}: ${r.error}`)
      else console.log(`✓ ${r.slug.padEnd(30)} hero ${r.heroSize.padEnd(28)} + ${r.processOK}/${r.processCount} thumbs ${r.heroDate}`)
    } catch (e) {
      console.log(`✗ ${p.slug}: ${e.message}`)
      results.push({ slug: p.slug, error: e.message })
    }
  }
  console.log(`\nDone. ${results.filter(r => !r.error).length}/${PROJECTS.length} ok.`)
  /* Write delivery dates as JSON for the copy-writing agents to read. */
  const dates = {}
  for (const r of results) if (r.heroDate) dates[r.slug] = r.heroDate
  fs.writeFileSync('scripts/portfolio-dates.json', JSON.stringify(dates, null, 2))
  console.log('Wrote scripts/portfolio-dates.json')
})()
