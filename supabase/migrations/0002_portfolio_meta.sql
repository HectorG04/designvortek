-- ============================================================
-- Migration 0002 — portfolio_pieces.meta JSONB
-- ============================================================
-- Adds a single JSONB column to portfolio_pieces that holds the rich
-- per-piece data the original schema didn't have a home for:
--
--   meta.paragraphs       : string[]  (2 description paragraphs as markdown)
--   meta.client           : string    (commissioner display name, e.g. "Tess R.")
--   meta.toolsText        : string    (formatted tool combo, "Procreate · Photoshop · Krita")
--   meta.hoursText        : string    ("16h across 12 days")
--   meta.styleText        : string    (style label like "Painterly · stoic noble")
--   meta.resolution       : string    ("4096 × 5120 px")
--   meta.revisions        : string    ("3 of 5 used")
--   meta.delivered        : string    ("February 06, 2026")
--   meta.artistNote       : string    (pull-quote markdown)
--   meta.gradient         : string    (Tailwind gradient classes for fallback bg)
--   meta.aspect           : string    ("4/5" | "3/4" | "3/2" | "1/1")
--   meta.processImages    : { src, label }[]   (process gallery thumbs)
--
-- Why JSONB rather than 11 new columns: every field above is display-only
-- (no queries filter on revisions, gradient, etc.). One JSONB column keeps
-- the schema readable AND lets us evolve the shape without future migrations.
--
-- HOW TO APPLY: paste the SQL below into Supabase Dashboard → SQL Editor.
-- Safe to re-run (uses IF NOT EXISTS).
-- ============================================================

alter table public.portfolio_pieces
  add column if not exists meta jsonb default '{}'::jsonb not null;

-- Help future queries on meta.aspect / meta.featured-equivalents if needed.
create index if not exists portfolio_meta_gin_idx
  on public.portfolio_pieces using gin (meta);
