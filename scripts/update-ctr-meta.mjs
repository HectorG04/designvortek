/**
 * update-ctr-meta.mjs
 *
 * Targeted CTR optimization for the 8 highest-impression Supabase posts
 * that have ZERO clicks. Goal: rewrite seo_title + seo_description so
 * Google's snippet pulls visitors in.
 *
 * Each change applies the same principles:
 *  - Lead with the query intent (what people are typing)
 *  - Front-load numerals (prices, counts, dates) — they catch the eye
 *  - Drop ambiguous "hand-painted" / "hand-drawn" everywhere
 *  - Promise something specific in the description
 *  - Stay under 60 chars (title) and 158 chars (description)
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

const UPDATES = [
  {
    slug: 'dnd-character-art-commission-prices-2026',
    seo_title: 'D&D Character Art Prices 2026 — Real Studio Numbers',
    seo_description:
      'Bust $60. Half-body $120. Full-body $180. Party portraits, NPC packs, VTT tokens — every D&D commission price in 2026, from a studio doing it since 2024.',
  },
  {
    slug: 'character-art-commission-pricing',
    seo_title: 'Character Art Commission Cost — What Actually Drives It',
    seo_description:
      "Why one quote is $80 and another's $400 for the same character. The 6 levers — style tier, complexity, rush, licensing — explained by a working studio.",
  },
  {
    slug: 'dnd-party-portrait-commission-guide',
    seo_title: 'D&D Party Portrait Commission Guide — Pricing & Timeline',
    seo_description:
      'What a 4-person D&D party portrait actually costs ($240+), how long it takes (3-6 weeks), and the two-pass brief that keeps every character distinct.',
  },
  {
    slug: 'dnd-class-by-class-portrait-inspiration',
    seo_title: 'D&D 5e Class Portrait Ideas — All 12 Classes (Painter\'s Guide)',
    seo_description:
      'Barbarian to wizard — the visual hook that makes each D&D class portrait land. Briefing guide from a studio that has painted them all.',
  },
  {
    slug: 'vtt-token-deserves-more',
    seo_title: "VTT Token Art — Why a Clipped Headshot Isn't Enough",
    seo_description:
      'The case for purpose-painted VTT tokens at 512px and 1024px. Plus what separates a real token from a screenshot crop.',
  },
  {
    slug: 'strahd-npc-pack-six-weeks',
    seo_title: 'Curse of Strahd NPC Portraits — 8-Piece Pack Walkthrough',
    seo_description:
      'Strahd, Ireena, Madam Eva and 5 more NPCs — how a Barovia portrait pack stays stylistically consistent across six weeks of work.',
  },
  {
    slug: 'playing-a-tiefling-lineage-paint-hooks',
    seo_title: 'Tiefling Portrait Guide — Horns, Skin Tones, Lineage Cues',
    seo_description:
      'Tiefling commission brief that reads infernal but still human. Horns, skin tones, subtype cues, eye colors — from 40+ tiefling portraits.',
  },
  {
    slug: 'world-of-darkness-clans-visual-cheat-sheet',
    seo_title: 'Vampire V5 Clans — Visual Portrait Brief Cheat Sheet',
    seo_description:
      'Per-clan palette, posture, and accessory for a Vampire the Masquerade V5 portrait that reads without a caption. All 13 clans, one page.',
  },
]

let updated = 0
for (const u of UPDATES) {
  const { data: before } = await supabase
    .from('blog_posts')
    .select('id, seo_title, seo_description')
    .eq('slug', u.slug)
    .maybeSingle()
  if (!before) { console.log(`  ✗ ${u.slug}: not found`); continue }

  const { error } = await supabase
    .from('blog_posts')
    .update({
      seo_title: u.seo_title,
      seo_description: u.seo_description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', before.id)
  if (error) { console.log(`  ✗ ${u.slug}: ${error.message}`); continue }

  console.log(`  ✓ ${u.slug}`)
  console.log(`    title: ${u.seo_title.length} chars`)
  console.log(`    desc:  ${u.seo_description.length} chars`)
  updated++
}

console.log(`\n${updated}/${UPDATES.length} posts updated.`)
console.log('Note: changes go live within the next ISR cycle (~60s) and Google re-crawls within 1-7 days.')
