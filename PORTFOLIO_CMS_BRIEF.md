# Portfolio CMS wire-up — what's done, what you need to do

## What I did

Wired the public portfolio surfaces to read from Supabase's `portfolio_pieces` table, with a fallback to the in-memory snapshot data so the site never breaks. ISR rebuilds the affected pages every 60 seconds, so admin edits become visible without a deploy.

Touched:

| File | Change |
|---|---|
| `lib/portfolio-pieces.ts` | Kept the 24-piece snapshot + sync helpers as fallback. Server-only fetchers were moved out (see next row). |
| `lib/portfolio-pieces-server.ts` | NEW — `'server-only'` module with `fetchAllPieces / fetchFeaturedPieces / fetchAllSlugs / fetchPieceBySlug / fetchCategoryCounts`. Tries Supabase first, falls back to the snapshot on empty/error. |
| `app/(public)/portfolio/page.tsx` | NEW server entry — fetches from Supabase, passes to client masonry, exports metadata, sets `revalidate = 60`. |
| `app/(public)/portfolio/_PortfolioMasonryClient.tsx` | RENAMED from page.tsx — now takes `pieces` and `counts` as props. All filter/search/sort interactivity preserved. |
| `app/(public)/portfolio/[slug]/page.tsx` | `generateStaticParams` and the page both `await` the server fetchers. `revalidate = 60`. |
| `app/(public)/page.tsx` (homepage) | Now `async`, fetches 8 featured pieces, passes to `<PortfolioStrip>`. `revalidate = 60`. |
| `app/(public)/v2/page.tsx` (preview) | Same treatment. |
| `components/home/PortfolioStrip.tsx` | Drops internal `useMemo + getFeaturedPieces` — accepts pieces as a prop now. |
| `app/sitemap.ts` | `async` — slugs come from `fetchAllSlugs()` so the sitemap picks up new admin-added pieces automatically. |
| `supabase/migrations/0002_portfolio_meta.sql` | NEW — adds a `meta jsonb` column to `portfolio_pieces` for rich fields the original schema didn't have a home for (paragraphs, processImages, gradient, aspect, resolution, revisions, delivered, artistNote, etc.). |
| `scripts/seed-portfolio.mjs` | NEW — one-shot seeder that upserts the 24 current pieces into Supabase from a JSON snapshot. |
| `scripts/dump-portfolio-snapshot.ts` + `scripts/portfolio-snapshot.json` | NEW — dump script + the resulting 50KB JSON the seeder reads from. |

## Two manual steps to flip the switch

Until you do these, the public site still reads the in-memory snapshot (so nothing breaks, but admin edits won't show on public surfaces yet).

### Step 1 — apply the SQL migration

Open Supabase Dashboard → SQL Editor → New query. Paste this and run:

```sql
alter table public.portfolio_pieces
  add column if not exists meta jsonb default '{}'::jsonb not null;

create index if not exists portfolio_meta_gin_idx
  on public.portfolio_pieces using gin (meta);
```

The same SQL is saved as `supabase/migrations/0002_portfolio_meta.sql` in the repo. Safe to re-run.

### Step 2 — seed the 24 pieces

From the project root:

```
node scripts/seed-portfolio.mjs
```

You should see 24 ✓ lines and "Done. 24 ok, 0 errors." It reads from `scripts/portfolio-snapshot.json` (already in the repo) and upserts on `slug`, so re-running it overwrites any admin edits with the snapshot. Use it only for the initial seed (or to reset).

After both steps, the public surfaces start reading from Supabase. Edits in `/admin/portfolio` appear within 60 seconds (ISR window).

## How it falls back

`lib/portfolio-pieces-server.ts` tries Supabase first. If:
- The table is empty (0 rows) — falls back to in-memory snapshot.
- Supabase throws (network, RLS, missing column) — falls back to in-memory snapshot.
- The query succeeds but a row is malformed (missing required fields) — that row is filtered out; the rest render.

So the site keeps working through any of: pre-migration state, pre-seed state, Supabase outage, or a partial admin save.

## What admin can edit today vs. tomorrow

The existing `/admin/portfolio` form already edits all the core columns (title, slug, category, description, image_url, additional_images, tags, commissioned_by, tools_used, style, is_featured, is_published, sort_order, SEO meta).

What it **doesn't** edit yet — fields that now live in `meta jsonb`:
- description paragraphs (the array)
- processImages with labels
- gradient, aspect, resolution, revisions, delivered, artistNote, hoursText

Editing the description text-field still works (it gets split on blank lines for the public render). Other meta fields will fall back to defaults until the admin form is extended to expose them. That's its own session — flag it whenever you want.

## Images

`heroImage` and `processImages.src` paths stay as `/images/portfolio/<slug>/hero.webp` etc. — they're in the public folder, not Supabase Storage. When you add a new piece via admin today, you need to drop image files into the public folder manually (Supabase Storage upload is a future enhancement; the column accepts any URL).

## File sanity

Build passes. All 73 routes generate. No new runtime dependencies added. Snapshot JSON is ~50KB so the bundle stays small.
