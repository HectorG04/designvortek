/**
 * fix-physical-media-language.mjs
 *
 * Surgical fixes for the 7 Supabase posts identified by the audit
 * as containing physical-media language. Each REPLACEMENTS entry
 * is a literal substring → new substring pair. This avoids regex
 * accidents on plurals or stems. All replacements run case-sensitive
 * because the content is in original casing.
 *
 * After substitutions, write each post back to Supabase.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const envText = readFileSync(join(ROOT, '.env.local'), 'utf8')
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^["']|["']$/g,'')] }),
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

/* Per-post substitution lists. Each pair runs in order on the content
 * field. We don't touch "canvas" or "easel" in figurative use — those
 * are legitimate digital-painter vocabulary. We only neutralise the
 * explicit oil-paint and pigment-name language. */
const FIXES = [
  // ─── anime-style-portrait-commission-guide ───────────────────────────────
  {
    slug: 'anime-style-portrait-commission-guide',
    subs: [
      // The H2/section heading "Painterly Anime: Closer to Oil Painting Than You Think"
      [
        'Painterly Anime: Closer to Oil Painting Than You Think',
        'Painterly Anime: Closer to Digital Painting Than You Think',
      ],
      // The anchor reference to that same heading inside the TOC
      [
        '#painterly-anime-closer-to-oil-painting-than-you-think',
        '#painterly-anime-closer-to-digital-painting-than-you-think',
      ],
      // Body phrases comparing to oil painting
      [
        'almost like an oil painting',
        'almost like a digital painterly portrait',
      ],
      [
        'oil painting of an anime character',
        'painterly digital rendering of an anime character',
      ],
      [
        'reads like a polished oil painting',
        'reads like a polished painterly render',
      ],
    ],
  },

  // ─── fantasy-color-palette-faction-warmth ────────────────────────────────
  {
    slug: 'fantasy-color-palette-faction-warmth',
    subs: [
      [
        'does not appear in oil paint without an enormous amount of intervention',
        'never works straight from the colour picker without an enormous amount of mixing',
      ],
      [
        'Pure white is a void in oil painting',
        'Pure white is a void in any painted image, digital included',
      ],
      // The literal pigment-name palette list
      [
        'four colours — ochre, umber, ivory black, lead white',
        'four base colours — ochre, umber, near-black, near-white',
      ],
      // Common follow-up phrasing
      [
        'ivory black',
        'near-black',
      ],
      [
        'lead white',
        'near-white',
      ],
    ],
  },

  // ─── cyberpunk-character-art-commission-guide ────────────────────────────
  {
    slug: 'cyberpunk-character-art-commission-guide',
    subs: [
      [
        'on top of an otherwise clean oil painting reads as a sticker',
        'on top of an otherwise clean painted figure reads as a sticker',
      ],
    ],
  },

  // ─── character-art-print-delivery-sizes-paper-framing ────────────────────
  {
    slug: 'character-art-print-delivery-sizes-paper-framing',
    subs: [
      [
        'the way a real oil painting does',
        'the way a textured paint surface does',
      ],
    ],
  },

  // ─── the-elf-spectrum-high-wood-drow-sea-eladrin ─────────────────────────
  {
    slug: 'the-elf-spectrum-high-wood-drow-sea-eladrin',
    subs: [
      [
        'oil paint sometimes muddies',
        'over-blending sometimes muddies',
      ],
    ],
  },

  // ─── sci-fi-armor-design-hardsuit-mech-softsuit ──────────────────────────
  {
    slug: 'sci-fi-armor-design-hardsuit-mech-softsuit',
    subs: [
      [
        'reflections need real paint to land',
        'reflections need real brushwork to land',
      ],
    ],
  },

  // ─── investigator-portrait-call-of-cthulhu-1920s ─────────────────────────
  {
    slug: 'investigator-portrait-call-of-cthulhu-1920s',
    subs: [
      // The pigment-named palette list — reframe as colour-mixing values
      [
        'yellow ochre and a whisper of cadmium red',
        'yellow ochre and a whisper of warm red',
      ],
      [
        'titanium white plus a touch of yellow ochre',
        'a near-white tone with a touch of yellow ochre',
      ],
      [
        'burnt umber with a touch of ultramarine',
        'a deep brown with a touch of ultramarine',
      ],
      [
        'cadmium red',
        'warm red',
      ],
      [
        'burnt umber',
        'deep umber brown',
      ],
      [
        'titanium white',
        'near-white',
      ],
    ],
  },

  // ─── world-of-darkness-clans-visual-cheat-sheet ──────────────────────────
  {
    slug: 'world-of-darkness-clans-visual-cheat-sheet',
    subs: [
      // "raw umber" → just "umber" (umber is fine as a color descriptor)
      [
        'earth tones, raw umber, moss green',
        'earth tones, umber, moss green',
      ],
    ],
  },
]

let updated = 0
const summary = []
for (const fix of FIXES) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, content')
    .eq('slug', fix.slug)
    .maybeSingle()
  if (error || !data) {
    console.error(`  ✗ ${fix.slug}: not found`)
    continue
  }
  let newContent = data.content
  const replaced = []
  for (const [from, to] of fix.subs) {
    if (newContent.includes(from)) {
      const before = newContent.length
      newContent = newContent.split(from).join(to)
      const occurrences = (data.content.match(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
      replaced.push({ from: from.slice(0, 50) + (from.length > 50 ? '…' : ''), occurrences })
    }
  }
  if (newContent === data.content) {
    console.log(`  • ${fix.slug}: no matches found (already fixed?)`)
    continue
  }
  const { error: updErr } = await supabase
    .from('blog_posts')
    .update({ content: newContent, updated_at: new Date().toISOString() })
    .eq('id', data.id)
  if (updErr) {
    console.error(`  ✗ ${fix.slug}: update failed — ${updErr.message}`)
    continue
  }
  console.log(`  ✓ ${fix.slug}: ${replaced.length} substitution(s) applied`)
  for (const r of replaced) console.log(`      "${r.from}"  ×${r.occurrences}`)
  updated++
  summary.push({ slug: fix.slug, count: replaced.length })
}
console.log(`\n${updated}/${FIXES.length} posts updated.`)
