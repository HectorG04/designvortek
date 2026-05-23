-- ============================================================
-- Migration 0003 — blog_posts table for the CMS-driven blog.
--
-- The admin form (app/admin/blog/_BlogForm.tsx) and server
-- actions (app/admin/blog/_actions.ts) already target this
-- schema. Public surfaces (/blog, /blog/[slug],
-- /blog/category/[category]) read via lib/blog-server.ts.
--
-- Safe to re-run: every CREATE uses IF NOT EXISTS and the
-- trigger drops itself before recreate. RLS allows admin
-- service-role writes; public reads are gated to is_published
-- with published_at <= now() so scheduled posts stay hidden
-- until their time.
-- ============================================================

create table if not exists public.blog_posts (
  id                  bigserial primary key,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- core content
  title               text        not null,
  slug                text        not null unique,
  excerpt             text,
  content             text        not null default '',
  featured_image      text,

  -- taxonomy
  category            text        not null default 'Guides',
  tags                text[]      not null default '{}'::text[],

  -- byline
  author_name         text        not null default 'Studio',

  -- publish state
  is_published        boolean     not null default false,
  published_at        timestamptz,

  -- meta
  read_time_minutes   integer,
  seo_title           text,
  seo_description     text
);

-- Indexes for the queries the public surfaces actually make:
-- 1) list approved posts by published_at DESC
-- 2) lookup by slug for detail pages
-- 3) filter by category
create index if not exists blog_posts_published_idx
  on public.blog_posts (is_published, published_at desc);

create index if not exists blog_posts_category_idx
  on public.blog_posts (category);

-- GIN index on tags so tag filters stay cheap once we add them.
create index if not exists blog_posts_tags_idx
  on public.blog_posts using gin (tags);

-- ------------------------------------------------------------
-- updated_at maintenance trigger
-- ------------------------------------------------------------
create or replace function public.set_blog_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;

create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.set_blog_posts_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
--   Service role bypasses RLS (used by admin server actions
--   via createAdminClient). Anonymous + authenticated public
--   reads are scoped to posts that are published AND past
--   their scheduled publish time.
-- ------------------------------------------------------------
alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts public read"            on public.blog_posts;
drop policy if exists "blog_posts service role full"      on public.blog_posts;

create policy "blog_posts public read"
  on public.blog_posts
  for select
  to anon, authenticated
  using (
    is_published = true
    and (published_at is null or published_at <= now())
  );

create policy "blog_posts service role full"
  on public.blog_posts
  for all
  to service_role
  using (true)
  with check (true);
