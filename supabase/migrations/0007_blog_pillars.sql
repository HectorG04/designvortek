-- ============================================================
-- Migration 0007 — Pillar pages on blog_posts.
--
-- Adds two columns so a blog post can act as the SEO pillar
-- (authority page) for one genre:
--
--   is_pillar      bool   - this post is the pillar for its genre
--   pillar_genre   text   - which genre (slug), e.g. 'dnd-5e'
--
-- The pillar/spoke pattern is content-architecture only — no new
-- table. Spokes are any blog_posts whose `tags` array contains the
-- pillar's genre slug. /pillars/[genre] renders the pillar post
-- and lists the spokes underneath.
--
-- Index lets us look up a pillar by genre in O(1) (only indexes
-- the small number of pillar rows).
-- ============================================================

alter table public.blog_posts
  add column if not exists is_pillar     boolean not null default false,
  add column if not exists pillar_genre  text;

create index if not exists blog_posts_pillar_idx
  on public.blog_posts (pillar_genre)
  where is_pillar = true;

-- A pillar must have a pillar_genre, and only one post can be the
-- pillar for a given genre at a time. Enforce both with a partial
-- unique constraint.
create unique index if not exists blog_posts_pillar_genre_uniq
  on public.blog_posts (pillar_genre)
  where is_pillar = true;
