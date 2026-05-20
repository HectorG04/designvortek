-- ============================================================
-- Design Vortex — Supabase Database Schema
-- Run this in Supabase SQL Editor (one-time setup)
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE: waitlist
-- For coming-soon page email/phone capture
-- ============================================================
create table if not exists public.waitlist (
  id              bigint generated always as identity primary key,
  created_at      timestamptz default now() not null,
  email           text not null,
  name            text,
  phone           text,
  source          text,                   -- where they came from (e.g., 'coming-soon-page')
  interested_in   text,                   -- e.g., 'character-art', 'tokens', 'party-portraits'
  notes           text,
  unique (email)
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

-- ============================================================
-- TABLE: commission_orders
-- ============================================================
create type order_status as enum (
  'pending',     -- just submitted
  'reviewing',   -- artist looking it over
  'quoted',      -- quote sent to customer
  'accepted',    -- customer accepted, awaiting payment
  'in_progress', -- artwork being created
  'delivered',   -- artwork delivered
  'closed',      -- closed/completed
  'cancelled'    -- cancelled by either party
);

create table if not exists public.commission_orders (
  id              bigint generated always as identity primary key,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null,
  customer_name   text not null,
  customer_email  text not null,
  customer_phone  text,
  service_type    text not null,
  style           text,
  description     text not null,
  references      text,
  budget          text,
  deadline        date,
  status          order_status default 'pending' not null,
  quoted_price    numeric(10, 2),
  internal_notes  text
);

create index if not exists commission_orders_status_idx on public.commission_orders (status);
create index if not exists commission_orders_created_at_idx on public.commission_orders (created_at desc);
create index if not exists commission_orders_email_idx on public.commission_orders (customer_email);

-- ============================================================
-- TABLE: portfolio_pieces
-- ============================================================
create table if not exists public.portfolio_pieces (
  id                  bigint generated always as identity primary key,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null,
  slug                text not null unique,
  title               text not null,
  category            text not null,
  description         text,
  image_url           text not null,
  thumbnail_url       text,
  additional_images   text[],
  tags                text[],
  commissioned_by     text,
  tools_used          text,
  hours_spent         integer,
  style               text,
  is_featured         boolean default false not null,
  is_published        boolean default true not null,
  seo_title           text,
  seo_description     text,
  sort_order          integer default 0 not null
);

create index if not exists portfolio_category_idx on public.portfolio_pieces (category);
create index if not exists portfolio_featured_idx on public.portfolio_pieces (is_featured) where is_featured = true;
create index if not exists portfolio_published_idx on public.portfolio_pieces (is_published) where is_published = true;
create index if not exists portfolio_slug_idx on public.portfolio_pieces (slug);

-- ============================================================
-- TABLE: blog_posts
-- ============================================================
create table if not exists public.blog_posts (
  id                  bigint generated always as identity primary key,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null,
  published_at        timestamptz,
  slug                text not null unique,
  title               text not null,
  excerpt             text,
  content             text not null,
  featured_image      text,
  category            text not null,
  tags                text[],
  author_name         text not null,
  is_published        boolean default false not null,
  read_time_minutes   integer,
  seo_title           text,
  seo_description     text
);

create index if not exists blog_category_idx on public.blog_posts (category);
create index if not exists blog_published_idx on public.blog_posts (is_published, published_at desc) where is_published = true;
create index if not exists blog_slug_idx on public.blog_posts (slug);

-- ============================================================
-- TABLE: services
-- ============================================================
create table if not exists public.services (
  id                bigint generated always as identity primary key,
  created_at        timestamptz default now() not null,
  updated_at        timestamptz default now() not null,
  slug              text not null unique,
  title             text not null,
  subtitle          text,
  description       text not null,
  icon_name         text,
  features          text[] default '{}' not null,
  starting_price    numeric(10, 2) not null,
  turnaround_days   text,
  tier_data         jsonb,                -- {standard: {...}, deluxe: {...}, premium: {...}}
  hero_image        text,
  sort_order        integer default 0 not null,
  is_active         boolean default true not null
);

create index if not exists services_slug_idx on public.services (slug);

-- ============================================================
-- TABLE: reviews
-- ============================================================
create table if not exists public.reviews (
  id              bigint generated always as identity primary key,
  created_at      timestamptz default now() not null,
  customer_name   text not null,
  customer_role   text,
  content         text not null,
  rating          integer check (rating between 1 and 5) not null,
  service_type    text,
  is_approved     boolean default false not null,
  is_featured     boolean default false not null,
  avatar_url      text
);

create index if not exists reviews_approved_idx on public.reviews (is_approved) where is_approved = true;
create index if not exists reviews_featured_idx on public.reviews (is_featured) where is_featured = true;

-- ============================================================
-- TABLE: slots
-- For slot booking / availability widget
-- ============================================================
create type slot_status as enum ('open', 'reserved', 'booked', 'unavailable');

create table if not exists public.slots (
  id              bigint generated always as identity primary key,
  created_at      timestamptz default now() not null,
  slot_month      date not null,          -- first of month, e.g. '2026-05-01'
  slot_number     integer not null,       -- 1..N within month
  status          slot_status default 'open' not null,
  reserved_email  text,
  reserved_name   text,
  reserved_phone  text,
  order_id        bigint references public.commission_orders(id) on delete set null,
  notes           text,
  unique (slot_month, slot_number)
);

create index if not exists slots_month_idx on public.slots (slot_month);
create index if not exists slots_status_idx on public.slots (status);

-- ============================================================
-- TABLE: inquiries (contact form messages)
-- ============================================================
create table if not exists public.inquiries (
  id              bigint generated always as identity primary key,
  created_at      timestamptz default now() not null,
  name            text not null,
  email           text not null,
  message         text not null,
  is_read         boolean default false not null,
  is_archived     boolean default false not null
);

create index if not exists inquiries_unread_idx on public.inquiries (is_read) where is_read = false;
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_orders on public.commission_orders;
create trigger set_updated_at_orders before update on public.commission_orders
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_portfolio on public.portfolio_pieces;
create trigger set_updated_at_portfolio before update on public.portfolio_pieces
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_blog on public.blog_posts;
create trigger set_updated_at_blog before update on public.blog_posts
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_services on public.services;
create trigger set_updated_at_services before update on public.services
  for each row execute function public.set_updated_at();
