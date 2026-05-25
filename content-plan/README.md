# Design Vortex — Content Plan

Generated overnight. ~83 articles across the 9 genre verticals + 5 evergreens + 27 game/campaign/character pieces. All connected via internal links so the reader can land anywhere and naturally drift toward `/order`.

## What's in this folder

```
content-plan/
├── AGENT-CONTEXT.md          ← Canonical voice, banned-words, link map, skill chain
├── IMAGE-STYLE-GUIDE.md      ← Image prompt conventions (text-first, brand-matched)
├── KEYWORD-RECON.md          ← Free-tool keyword research (autocomplete, PAA, Reddit gaps)
├── README.md                 ← this file
├── quick-wins.md             ← SQL to re-tag the 7 existing posts as spokes
├── pillars/                  ← 9 long-form genre guides (~3,500w each)
│   ├── 01-fantasy/
│   ├── 02-dnd-5e/
│   ├── 03-sci-fi/
│   ├── 04-cyberpunk/
│   ├── 05-horror/
│   ├── 06-modern/
│   ├── 07-historical/
│   ├── 08-souls-anime/
│   └── 09-western/
├── games/                    ← 27 character/campaign/iconic articles (~1,800w each)
│   ├── fantasy/              ← 3 articles per genre
│   ├── dnd-5e/
│   ├── sci-fi/
│   ├── cyberpunk/
│   ├── horror/
│   ├── modern/
│   ├── historical/
│   ├── souls-anime/
│   └── western/
├── spokes/                   ← 41 long-tail spoke articles (~1,500w each)
│   └── ...one folder per genre, 4-6 articles each
└── evergreen/                ← 5 cross-cutting evergreen guides (~2,000w each)
    ├── character-art-commission-pricing/
    ├── vtt-tokens-vs-portraits-which-to-commission/
    ├── character-art-print-delivery-sizes-paper-framing/
    ├── commercial-licensing-for-commissioned-art/
    └── character-art-process-sketch-color-final/
```

Each leaf article folder contains:
- `article.md` — the markdown body that goes into `blog_posts.content`
- `metadata.json` — the row fields (slug, title, excerpt, tags, SEO, is_pillar, pillar_genre, etc.)
- `image-prompts.md` — three image-generation prompts (cover 16:9, inline mid 4:5, inline close 1:1) per IMAGE-STYLE-GUIDE.md

## How to publish

### Step 1 — Run the quick-wins SQL (60 seconds)

Paste the SQL from `quick-wins.md` into the Supabase SQL Editor. This re-tags the 7 existing posts so they appear as spokes under the relevant pillar pages.

### Step 2 — Seed the new content into Supabase

From the project root:

```bash
# Dry-run first to verify all articles parse correctly
node scripts/seed-content-plan.mjs --dry-run

# Then seed — leaves is_published=false so nothing goes live yet
node scripts/seed-content-plan.mjs

# Or seed AND publish immediately (use carefully)
node scripts/seed-content-plan.mjs --publish
```

The script walks `content-plan/{pillars,games,spokes,evergreen}` and upserts each article into `blog_posts` keyed by slug. Idempotent — running it again refreshes any edited articles in place.

### Step 3 — Generate and upload cover images

Each article's `image-prompts.md` has three ready-to-use prompts. Feed them into Midjourney / Imagen / Flux / Stable Diffusion. Upload the resulting cover image to `/public/images/blog/<slug>-cover.jpg` and set the `featured_image` column on the row to that path.

### Step 4 — Toggle posts live in the admin

In `/admin/blog`, flip `is_published = true` on the posts you want to publish. Recommended cadence in section "Ship order" below.

## Ship order — the 90-day publishing rhythm

All articles are written and ready. Publishing them all at once would feel firehose-y and confuse Google's crawler about your update cadence. Stagger them in revenue-priority order:

| Week | Publish | Why |
|---|---|---|
| 1 | `dnd-5e-character-art-commission-guide` (pillar) + 1 D&D spoke | Biggest converting audience first |
| 2 | 2 more D&D spokes + the existing Hero Forge / VTT-token posts re-surface | Reinforce the spoke ring |
| 3 | `character-art-commission-pricing` evergreen | High-volume non-genre query |
| 4 | `5e-warlock-player-guide` + `5e-paladin-painted` | D&D class deep-dives — funnel pieces |
| 5 | `anime-souls-fan-art-commission-guide` (pillar) + 1 souls-anime spoke | Highest search volume of the 9 |
| 6 | 2 more souls-anime spokes + `malenia-blade-of-miquella` character article | Reinforce |
| 7 | `vtt-tokens-vs-portraits-which-to-commission` evergreen | Underserved comparison query |
| 8 | `horror-character-art-commission-guide` (pillar) + tag Strahd-pack post + 1 horror spoke | Existing Strahd post = built-in authority |
| 9 | 2 more horror spokes + `strahd-von-zarovich` iconic profile | Reinforce + capitalize on October |
| 10 | `cyberpunk-character-art-commission-guide` (pillar) | Strong Google Images traffic |
| 11 | 2 cyberpunk spokes + 1 character article | Reinforce |
| 12 | `commercial-licensing-for-commissioned-art` evergreen | Highest-LTV converter |
| 13 | `sci-fi-character-art-commission-guide` (pillar) | |

After week 13, continue at 1 pillar + 2-3 spokes/character articles per week through the remaining four genres (Fantasy, Modern, Historical, Western). Total: about 6 months of weekly publishes with everything already written and waiting.

## What I did NOT do (by design)

- **Image generation** — only prompts, not images. You'll generate covers with the tool of your choice.
- **Affiliate links** — the user didn't enable monetization beyond commissions.
- **Programmatic SEO** — no class × race × genre cross-products that would create thin pages.
- **Local SEO** — studio is remote.
- **YouTube / video** — written content only.
- **Paid keyword tools** — DataForSEO not used; recon is all free signals.

## What's next

1. Generate cover images (~1 hour for the 9 pillars, then drip the rest)
2. Run `seed-content-plan.mjs` to load everything into Supabase
3. Run `quick-wins.md` SQL
4. Start publishing on the 13-week rhythm above
5. Set up Google Search Console (if not already) — by week 4 you'll have GSC data to refresh keywords with real query data
