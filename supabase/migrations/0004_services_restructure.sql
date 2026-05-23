-- ============================================================
-- Migration 0004 — Services restructure.
--
-- Drops the existing `services` table and recreates it with a
-- flexible schema that supports all 8 pricing modes from the
-- Services Restructure Brief:
--   tiered | range | per_extra | pack_with_qty | pct_uplift
--   | monthly_recurring | quote_only | flat
--
-- The previous schema (slug/title/starting_price/tier_data) had
-- no live data — the admin editor was hard-coded with DEMO_DEFAULTS
-- and nothing was ever seeded to the DB. Safe to drop and recreate.
--
-- Public surfaces consume via lib/services-server.ts with snapshot
-- fallback (lib/services.ts).
-- ============================================================

drop table if exists public.services cascade;

create table public.services (
  id                     bigserial primary key,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  -- identity
  slug                   text not null unique,
  name                   text not null,
  bucket                 text not null,            -- character-work / party-work / gm-world-building / tokens / commercial / subscription
  eyebrow                text,                     -- caveat-style subtitle ("your hero, painted")

  -- copy
  lede                   text,                     -- one-paragraph intro, markdown supported
  description            text,                     -- longer markdown for product detail page

  -- pricing
  pricing_mode           text not null default 'tiered',
                                                   -- tiered | range | per_extra | pack_with_qty
                                                   -- | pct_uplift | monthly_recurring | quote_only | flat
  pricing                jsonb not null default '{}'::jsonb,
                                                   -- payload shape varies by pricing_mode:
                                                   --   tiered:            { tiers: [{ name, price, note?, features:[] }, ...] }
                                                   --   range:             { range: { low, high } }
                                                   --   per_extra:         { per_extra: { base, extra_low, extra_high, extra_label? } }
                                                   --   pack_with_qty:     { pack: { packs: [{ qty, price, label? }, ...] } }
                                                   --   pct_uplift:        { uplift: { percent, label? } }
                                                   --   monthly_recurring: { monthly: { monthly_price, included:[], cadence? } }
                                                   --   quote_only:        { quote: { from_price?, cta_label?, cta_href? } }
                                                   --   flat:              { flat: { price, label? } }

  -- delivery
  turnaround_low_days    integer,                  -- nullable for quote-only & subscription
  turnaround_high_days   integer,                  -- ditto
  revisions_included     integer default 2,
  resolution             text,                     -- "4K", "512+1024 px", "By scope"

  -- product detail content
  included               jsonb not null default '[]'::jsonb, -- [{ name, body }, ...]
  examples               jsonb not null default '[]'::jsonb, -- [{ title, meta, gradient }, ...]
  faq                    jsonb not null default '[]'::jsonb, -- [{ q, a }, ...]

  -- bundle linkage (Character + Token = +$25)
  bundle_with_slugs      text[] not null default '{}'::text[],
  bundle_uplift_cents    integer,

  -- attributes
  genre_tags             text[] not null default '{}'::text[],

  -- visibility & order
  is_published           boolean not null default false,
  is_featured_homepage   boolean not null default false,
  featured_order         integer,                  -- sort within homepage strip; null = not on home
  sort_order             integer not null default 0, -- sort within bucket

  -- seo
  seo_title              text,
  seo_description        text
);

-- Indexes for the queries the public + admin surfaces actually make:
create index if not exists services_bucket_idx
  on public.services (bucket);

create index if not exists services_published_sort_idx
  on public.services (is_published, bucket, sort_order);

create index if not exists services_featured_idx
  on public.services (is_featured_homepage, featured_order)
  where is_featured_homepage = true;

create index if not exists services_genre_idx
  on public.services using gin (genre_tags);

create index if not exists services_bundle_idx
  on public.services using gin (bundle_with_slugs);

-- ------------------------------------------------------------
-- updated_at trigger
-- ------------------------------------------------------------
create or replace function public.set_services_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_services_updated_at on public.services;

create trigger trg_services_updated_at
before update on public.services
for each row
execute function public.set_services_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
alter table public.services enable row level security;

drop policy if exists "services public read"       on public.services;
drop policy if exists "services service role full" on public.services;

create policy "services public read"
  on public.services
  for select
  to anon, authenticated
  using (is_published = true);

create policy "services service role full"
  on public.services
  for all
  to service_role
  using (true)
  with check (true);
