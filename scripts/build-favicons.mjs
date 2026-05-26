/**
 * build-favicons.mjs
 *
 * Render every raster favicon variant from the master SVG monogram.
 * Pads each PNG with the brand parchment so the mark stays legible on
 * dark browser tabs and OS tile colours.
 *
 * Outputs:
 *   app/apple-icon.png                  180×180 (Apple-touch convention)
 *   public/android-chrome-192x192.png   192×192 (PWA Android)
 *   public/android-chrome-512x512.png   512×512 (PWA Android, splash)
 *   public/favicon-32x32.png             32×32  (legacy fallback)
 *   public/favicon-16x16.png             16×16  (legacy fallback)
 *
 * Note: `app/icon.svg` already covers modern SVG-aware browsers via
 * Next.js automatic conventions, so the PNGs above are belt-and-braces
 * coverage for older clients + iOS/Android home-screen.
 *
 * Run: node scripts/build-favicons.mjs
 */

import sharp from 'sharp'
import { readFileSync, mkdirSync, existsSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC = join(ROOT, 'public', 'logo', 'monogram.svg')

const OUTPUTS = [
  { path: join(ROOT, 'app', 'apple-icon.png'),                 size: 180 },
  { path: join(ROOT, 'public', 'android-chrome-192x192.png'),  size: 192 },
  { path: join(ROOT, 'public', 'android-chrome-512x512.png'),  size: 512 },
  { path: join(ROOT, 'public', 'favicon-32x32.png'),           size: 32  },
  { path: join(ROOT, 'public', 'favicon-16x16.png'),           size: 16  },
]

// Parchment-100 background ensures the burgundy + gold mark always has
// contrast even on dark mode browser chrome / OS tile colours.
const BG = { r: 245, g: 235, b: 211, alpha: 1 }

const svgBuffer = readFileSync(SRC)

for (const { path, size } of OUTPUTS) {
  // Ensure parent dir exists (app/ + public/ always do, but defensive)
  const parent = dirname(path)
  if (!existsSync(parent)) mkdirSync(parent, { recursive: true })

  await sharp(svgBuffer)
    .resize(size, size, { fit: 'contain', background: BG })
    .png({ compressionLevel: 9 })
    .toFile(path)

  const kb = Math.round(statSync(path).size / 1024)
  const rel = path.replace(ROOT + '\\', '').replace(ROOT + '/', '')
  console.log(`  ✓ ${size}x${size}  ${rel}  ${kb} KB`)
}

console.log(`\n${OUTPUTS.length}/${OUTPUTS.length} favicon variants written.`)
