-- ============================================================
-- Design Vortex — Row Level Security (RLS) Policies
-- Run this AFTER schema.sql
-- ============================================================
-- Strategy:
--   - Public reads: portfolio_pieces, blog_posts, services, reviews (only published/approved)
--   - Public writes: waitlist, commission_orders, inquiries (insert only — visitor submissions)
--   - All other operations require authenticated admin (handled at app level using
--     SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS).
-- ============================================================

-- Enable RLS on all tables
alter table public.waitlist            enable row level security;
alter table public.commission_orders   enable row level security;
alter table public.portfolio_pieces    enable row level security;
alter table public.blog_posts          enable row level security;
alter table public.services            enable row level security;
alter table public.reviews             enable row level security;
alter table public.slots               enable row level security;
alter table public.inquiries           enable row level security;

-- ============================================================
-- WAITLIST — anyone can insert, no public read
-- ============================================================
drop policy if exists "anyone can join waitlist" on public.waitlist;
create policy "anyone can join waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);

-- ============================================================
-- COMMISSION_ORDERS — anyone can submit, no public read
-- ============================================================
drop policy if exists "anyone can submit order" on public.commission_orders;
create policy "anyone can submit order"
  on public.commission_orders for insert
  to anon, authenticated
  with check (true);

-- ============================================================
-- PORTFOLIO_PIECES — public read of published pieces only
-- ============================================================
drop policy if exists "published portfolio is public" on public.portfolio_pieces;
create policy "published portfolio is public"
  on public.portfolio_pieces for select
  to anon, authenticated
  using (is_published = true);

-- ============================================================
-- BLOG_POSTS — public read of published posts only
-- ============================================================
drop policy if exists "published blog posts are public" on public.blog_posts;
create policy "published blog posts are public"
  on public.blog_posts for select
  to anon, authenticated
  using (is_published = true);

-- ============================================================
-- SERVICES — public read of active services
-- ============================================================
drop policy if exists "active services are public" on public.services;
create policy "active services are public"
  on public.services for select
  to anon, authenticated
  using (is_active = true);

-- ============================================================
-- REVIEWS — public read of approved reviews
-- ============================================================
drop policy if exists "approved reviews are public" on public.reviews;
create policy "approved reviews are public"
  on public.reviews for select
  to anon, authenticated
  using (is_approved = true);

-- ============================================================
-- SLOTS — public read (so users can see availability)
-- ============================================================
drop policy if exists "slots are publicly viewable" on public.slots;
create policy "slots are publicly viewable"
  on public.slots for select
  to anon, authenticated
  using (true);

-- ============================================================
-- INQUIRIES — anyone can submit contact form, no public read
-- ============================================================
drop policy if exists "anyone can send inquiry" on public.inquiries;
create policy "anyone can send inquiry"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

-- ============================================================
-- NOTE: Admin operations (read/update/delete) are performed using the
-- SUPABASE_SERVICE_ROLE_KEY in API routes (server-side only).
-- This bypasses RLS entirely. The service role key MUST NEVER be exposed
-- to the browser.
-- ============================================================
