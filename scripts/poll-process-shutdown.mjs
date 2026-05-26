/**
 * poll-process-shutdown.mjs
 *
 * Long-running orchestrator for the "94 cover images" batch generation:
 *
 *   1. Every 5 minutes: scan E:\Chrome Downloads\turboflow for numbered
 *      files (001.png, 002.png, ...) that landed after this script started.
 *   2. For each new file:
 *        - Map file number → slug via docs/seo/all-posts-inventory.json (in order)
 *        - Crop + resize to 1920×1080 via sharp (attention smart-crop)
 *        - WebP quality 82 → public/blog-images/<slug>.webp
 *        - Update blog_posts.featured_image in Supabase
 *   3. After each cycle that processed anything: git add + commit + push
 *      (one combined commit per cycle, not per file — avoids spam).
 *   4. Exit conditions:
 *        a. All 94 slugs processed → DONE (all done)
 *        b. 20 minutes pass with no new file → DONE (idle timeout)
 *   5. On exit: print a comprehensive summary, then run `shutdown /s /t 60`
 *      so the machine powers off 60 seconds later (user can `shutdown /a`
 *      to abort if needed).
 *
 * Resumable: state persists in .cover-batch-state.json so a crash + restart
 * picks up where it left off without re-processing.
 *
 * Designed to be run via Bash run_in_background and streamed via Monitor.
 * Output is one-line-per-event for easy parsing.
 */

import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import {
  readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync,
} from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SRC_DIR    = 'E:\\Chrome Downloads\\turboflow'
const DEST_DIR   = join(ROOT, 'public', 'blog-images')
const STATE_FILE = join(ROOT, '.cover-batch-state.json')
const INVENTORY  = join(ROOT, 'docs', 'seo', 'all-posts-inventory.json')

const POLL_INTERVAL_MS = 5 * 60 * 1000   // 5 minutes
const IDLE_TIMEOUT_MS  = 20 * 60 * 1000  // 20 minutes
const COVER_W = 1920
const COVER_H = 1080

// ─── one-shot helpers ───────────────────────────────────────────────────────
function log(msg) {
  const stamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
  console.log(`[${stamp}] ${msg}`)
}

function loadState() {
  if (!existsSync(STATE_FILE)) {
    return {
      sessionStartedAt: Date.now(),
      lastNewFileAt:    Date.now(),
      processedNumbers: [],
      processedSlugs:   [],
      totalProcessed:   0,
    }
  }
  return JSON.parse(readFileSync(STATE_FILE, 'utf8'))
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8')
}

// ─── env + supabase ─────────────────────────────────────────────────────────
const envText = readFileSync(join(ROOT, '.env.local'), 'utf8')
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^["']|["']$/g,'')] }),
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// ─── inventory: file-# → slug mapping ───────────────────────────────────────
const inventory = JSON.parse(readFileSync(INVENTORY, 'utf8'))
// Inventory order = file order: index 0 → file 001, index 1 → file 002, ...
const slugByNumber = {}
for (let i = 0; i < inventory.length; i++) {
  const num = String(i + 1).padStart(3, '0')
  slugByNumber[num] = inventory[i].slug
}
const TOTAL_TARGET = inventory.length

// ─── prep ───────────────────────────────────────────────────────────────────
if (!existsSync(DEST_DIR)) mkdirSync(DEST_DIR, { recursive: true })
const state = loadState()
log(`SESSION START — target: ${TOTAL_TARGET} slugs, already processed: ${state.totalProcessed}`)

// ─── find new files ─────────────────────────────────────────────────────────
function findNewFiles() {
  let entries
  try {
    entries = readdirSync(SRC_DIR)
  } catch (e) {
    log(`ERROR reading src dir: ${e.message}`)
    return []
  }
  const found = []
  for (const name of entries) {
    // Match "NNN.png" / "NNN.jpg" / "NNN.jpeg" with no parentheticals — the user
    // confirmed they cleared the folder, so the "001 (1).png" variants from
    // earlier batches won't reappear.
    const m = name.match(/^(\d{3})\.(?:png|jpg|jpeg|webp)$/i)
    if (!m) continue
    const num = m[1]
    if (state.processedNumbers.includes(num)) continue   // already done
    if (Number(num) > TOTAL_TARGET) continue              // out of range
    const full = join(SRC_DIR, name)
    let s
    try { s = statSync(full) } catch { continue }
    // Only treat as "this session" if mtime is after sessionStartedAt - 10min
    // (gives a small grace window for files generated just before the script started)
    if (s.mtimeMs < state.sessionStartedAt - 10 * 60 * 1000) continue
    found.push({ num, name, full, mtimeMs: s.mtimeMs })
  }
  // Process oldest first (matches generation order)
  found.sort((a, b) => a.mtimeMs - b.mtimeMs)
  return found
}

// ─── process a single file ─────────────────────────────────────────────────
async function processOne(file) {
  const slug = slugByNumber[file.num]
  if (!slug) {
    log(`SKIP ${file.num}: no slug mapping (file # > inventory)`)
    return { ok: false }
  }
  const destName = `${slug}.webp`
  const destPath = join(DEST_DIR, destName)
  const featuredUrl = `/blog-images/${destName}`

  try {
    const meta = await sharp(file.full).metadata()
    await sharp(file.full)
      .resize(COVER_W, COVER_H, { fit: 'cover', position: 'attention' })
      .webp({ quality: 82 })
      .toFile(destPath)
    const kb = Math.round(statSync(destPath).size / 1024)
    log(`  ✓ ${file.num} → ${destName}  ${meta.width}×${meta.height} → ${COVER_W}×${COVER_H}  ${kb} KB`)
  } catch (e) {
    log(`  ✗ ${file.num} sharp error: ${e.message}`)
    return { ok: false }
  }

  // Supabase update
  try {
    const { error } = await supabase
      .from('blog_posts')
      .update({ featured_image: featuredUrl, updated_at: new Date().toISOString() })
      .eq('slug', slug)
    if (error) {
      log(`  ✗ ${file.num} supabase update failed: ${error.message}`)
      return { ok: false }
    }
  } catch (e) {
    log(`  ✗ ${file.num} supabase exception: ${e.message}`)
    return { ok: false }
  }

  return { ok: true, slug, destName }
}

// ─── one full polling cycle ────────────────────────────────────────────────
async function runCycle(cycleNum) {
  const newFiles = findNewFiles()
  if (newFiles.length === 0) {
    log(`CYCLE ${cycleNum}: 0 new files`)
    return { processed: 0 }
  }
  log(`CYCLE ${cycleNum}: ${newFiles.length} new file(s)`)
  const successSlugs = []
  for (const f of newFiles) {
    const r = await processOne(f)
    if (r.ok) {
      state.processedNumbers.push(f.num)
      state.processedSlugs.push(r.slug)
      state.totalProcessed++
      successSlugs.push(r.slug)
    }
  }
  if (successSlugs.length > 0) {
    state.lastNewFileAt = Date.now()
    saveState(state)
    // Git: stage all new cover files for these slugs, commit, push
    try {
      const args = successSlugs.map((s) => `"public/blog-images/${s}.webp"`).join(' ')
      execSync(`git add ${args}`, { cwd: ROOT, stdio: 'pipe' })
      const msg = `feat(blog): ${successSlugs.length} new cover image(s) (cycle ${cycleNum}, ${state.totalProcessed}/${TOTAL_TARGET})`
      execSync(`git commit -m "${msg}"`, { cwd: ROOT, stdio: 'pipe' })
      execSync(`git push origin main`, { cwd: ROOT, stdio: 'pipe' })
      log(`  ↑ pushed ${successSlugs.length} image(s) to main`)
    } catch (e) {
      log(`  ! git step warning: ${e.message.split('\n')[0]}`)
    }
  }
  return { processed: successSlugs.length }
}

// ─── main loop ──────────────────────────────────────────────────────────────
let cycleNum = 0
async function mainLoop() {
  // First cycle runs immediately so we grab anything already on disk
  while (true) {
    cycleNum++
    const result = await runCycle(cycleNum)

    // Exit condition 1: all done
    if (state.totalProcessed >= TOTAL_TARGET) {
      log(`DONE: all ${TOTAL_TARGET} covers processed`)
      finalSummaryAndShutdown('all-done')
      return
    }

    // Exit condition 2: idle timeout
    const idleMs = Date.now() - state.lastNewFileAt
    if (idleMs >= IDLE_TIMEOUT_MS) {
      log(`DONE: idle timeout (${Math.round(idleMs / 60000)} min since last new file)`)
      finalSummaryAndShutdown('idle-timeout')
      return
    }

    const nextIn = Math.round(POLL_INTERVAL_MS / 1000)
    log(`SLEEP ${nextIn}s — ${state.totalProcessed}/${TOTAL_TARGET} done, ${Math.round(idleMs / 60000)}min since last find`)
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
}

function finalSummaryAndShutdown(reason) {
  log(``)
  log(`╔══════════════════════════════════════════╗`)
  log(`║  FINAL SUMMARY                           ║`)
  log(`╚══════════════════════════════════════════╝`)
  log(`Reason:           ${reason}`)
  log(`Covers processed: ${state.totalProcessed} / ${TOTAL_TARGET}`)
  log(`Session duration: ${Math.round((Date.now() - state.sessionStartedAt) / 60000)} min`)
  log(`Cycles run:       ${cycleNum}`)
  if (state.totalProcessed < TOTAL_TARGET) {
    const missing = []
    for (let i = 1; i <= TOTAL_TARGET; i++) {
      const num = String(i).padStart(3, '0')
      if (!state.processedNumbers.includes(num)) missing.push(`${num}=${slugByNumber[num]}`)
    }
    log(`Missing (${missing.length}):`)
    for (const m of missing.slice(0, 20)) log(`  - ${m}`)
    if (missing.length > 20) log(`  ... and ${missing.length - 20} more`)
  }
  log(``)
  log(`SHUTDOWN: scheduled in 60s (run 'shutdown /a' to abort)`)
  try {
    execSync('shutdown /s /t 60 /c "Cover batch complete. Shutting down in 60s. Run shutdown /a to abort."', { stdio: 'pipe' })
  } catch (e) {
    log(`SHUTDOWN command failed: ${e.message}`)
  }
}

mainLoop().catch((e) => {
  log(`FATAL: ${e.stack || e.message}`)
  process.exit(1)
})
