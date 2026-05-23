-- ============================================================
-- Migration 0006 — Canonical v2 schema rollout.
--
-- Aligns the DB with the canonical HANDOFF.md (v2) spec:
--   • adds the missing lifecycle / payment columns to commission_orders
--   • introduces customers, order_status_log, order_messages
--   • introduces subscriptions + subscription_cycles
--   • introduces addons (with the 6 canonical rows seeded)
--   • adds a generator for the DV-YYYY-MMDD-XXXX order number
--   • keeps the existing `services` (jsonb) shape as the source of
--     truth — the Catalog API will derive bucket/product/tier views
--     from it. No services table change needed.
--   • leaves the existing `slots`, `waitlist`, `inquiries` tables
--     in place. Phase 7 of the rollout will migrate them.
--
-- All commission_orders additions are nullable, so existing data
-- and existing /api/orders writes keep working unchanged.
-- ============================================================

-- ------------------------------------------------------------
-- 1) customers — first-class customer record, FK-able from orders
--    and subscriptions. The studio currently stores name/email/
--    phone inline on commission_orders; we add this table for
--    canonical addressability + lifetime stats without disrupting
--    that path. Order writes can backfill via a unique-email upsert.
-- ------------------------------------------------------------
create table if not exists public.customers (
  id              bigserial primary key,
  email           text not null unique,
  name            text,
  phone           text,
  source          text,                              -- 'Reddit', 'Instagram', 'Friend referral', ...
  notes           text,                              -- internal admin notes
  first_seen_at   timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists customers_email_idx on public.customers (lower(email));

create or replace function public.set_customers_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;
drop trigger if exists trg_customers_updated_at on public.customers;
create trigger trg_customers_updated_at
  before update on public.customers
  for each row execute function public.set_customers_updated_at();

alter table public.customers enable row level security;
drop policy if exists "customers service role full" on public.customers;
create policy "customers service role full"
  on public.customers for all to service_role using (true) with check (true);
-- No public select policy — customers are admin-only.

-- ------------------------------------------------------------
-- 2) commission_orders — lifecycle, payment, and brief columns
-- ------------------------------------------------------------
alter table public.commission_orders
  add column if not exists order_number            text,
  add column if not exists customer_id             bigint references public.customers(id),
  -- canonical bucket → product → tier (slug refs, kept loose for snapshot fallback)
  add column if not exists bucket_slug             text,
  add column if not exists product_slug            text,
  add column if not exists tier_slug               text,
  -- brief extras (canonical fields not yet captured)
  add column if not exists style_tags              text[] default '{}'::text[],
  add column if not exists reference_urls          text[] default '{}'::text[],
  add column if not exists quantity                text,
  add column if not exists budget_range            text,
  add column if not exists budget_context          text,
  add column if not exists extras_count            integer default 0,         -- Party Portrait per-extra
  add column if not exists bundle_token            boolean default false,     -- Character + Token bundle flag
  -- quote breakdown
  add column if not exists quote_base_cents        integer,
  add column if not exists quote_addons            jsonb default '[]'::jsonb, -- [{slug, label, cents}, ...]
  add column if not exists commercial_uplift       boolean default false,     -- +40% on base
  add column if not exists quote_total_cents       integer,
  -- payment (Stripe)
  add column if not exists stripe_session_id           text,                  -- deposit checkout session
  add column if not exists stripe_payment_intent       text,                  -- deposit PI
  add column if not exists stripe_balance_session_id   text,                  -- balance checkout session
  add column if not exists stripe_balance_payment_intent text,                -- balance PI
  add column if not exists deposit_cents               integer,               -- 30% of quote_total_cents
  add column if not exists deposit_paid_at             timestamptz,
  add column if not exists balance_paid_at             timestamptz;

-- order_number unique (allow nulls until backfilled)
create unique index if not exists commission_orders_order_number_uniq
  on public.commission_orders (order_number)
  where order_number is not null;

create index if not exists commission_orders_customer_idx
  on public.commission_orders (customer_id);

create index if not exists commission_orders_status_idx
  on public.commission_orders (status);

-- ------------------------------------------------------------
-- 3) order_number generator — DV-YYYY-MMDD-XXXX (XXXX = 4 digits)
-- ------------------------------------------------------------
create or replace function public.generate_order_number()
returns text language plpgsql as $$
declare
  candidate text;
  attempts  int := 0;
begin
  loop
    candidate := 'DV-' || to_char(now() at time zone 'utc', 'YYYY-MMDD') || '-'
                 || lpad((floor(random() * 10000))::int::text, 4, '0');
    -- ensure uniqueness; retry up to 5 times
    if not exists (select 1 from public.commission_orders where order_number = candidate) then
      return candidate;
    end if;
    attempts := attempts + 1;
    if attempts >= 5 then
      -- fall back to a longer suffix; effectively never collides
      candidate := 'DV-' || to_char(now() at time zone 'utc', 'YYYY-MMDD') || '-'
                   || lpad((floor(random() * 1000000))::int::text, 6, '0');
      return candidate;
    end if;
  end loop;
end;
$$;

-- Default + auto-assign on insert if not provided.
alter table public.commission_orders
  alter column order_number set default public.generate_order_number();

create or replace function public.set_order_number_on_insert()
returns trigger language plpgsql as $$
begin
  if new.order_number is null then
    new.order_number := public.generate_order_number();
  end if;
  return new;
end;
$$;
drop trigger if exists trg_commission_orders_number on public.commission_orders;
create trigger trg_commission_orders_number
  before insert on public.commission_orders
  for each row execute function public.set_order_number_on_insert();

-- Backfill existing rows that have no order_number.
update public.commission_orders
   set order_number = public.generate_order_number()
 where order_number is null;

-- ------------------------------------------------------------
-- 4) order_status_log — audit trail of every status transition.
-- ------------------------------------------------------------
create table if not exists public.order_status_log (
  id          bigserial primary key,
  order_id    bigint not null references public.commission_orders(id) on delete cascade,
  status      text not null,
  by_user     text,                              -- admin email | 'customer' | 'system' | 'stripe'
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists order_status_log_order_idx on public.order_status_log (order_id, created_at desc);

alter table public.order_status_log enable row level security;
drop policy if exists "status_log service role full" on public.order_status_log;
create policy "status_log service role full"
  on public.order_status_log for all to service_role using (true) with check (true);

-- ------------------------------------------------------------
-- 5) order_messages — inbound + outbound communications per order.
-- ------------------------------------------------------------
create table if not exists public.order_messages (
  id          bigserial primary key,
  order_id    bigint not null references public.commission_orders(id) on delete cascade,
  direction   text not null check (direction in ('inbound','outbound')),
  channel     text not null check (channel in ('email','admin_note','system')),
  subject     text,
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists order_messages_order_idx on public.order_messages (order_id, created_at desc);

alter table public.order_messages enable row level security;
drop policy if exists "order_messages service role full" on public.order_messages;
create policy "order_messages service role full"
  on public.order_messages for all to service_role using (true) with check (true);

-- ------------------------------------------------------------
-- 6) subscriptions + subscription_cycles
-- ------------------------------------------------------------
create table if not exists public.subscriptions (
  id                       bigserial primary key,
  customer_id              bigint not null references public.customers(id) on delete cascade,
  tier_slug                text not null check (tier_slug in ('subscription-companion','subscription-gm')),
  stripe_subscription_id   text not null unique,
  stripe_customer_id       text,
  status                   text not null check (status in ('active','paused','cancelled')) default 'active',
  next_bill_date           date,
  cycle_anchor_day         integer not null default 15,         -- ships the Nth of each month
  notes                    text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create index if not exists subscriptions_customer_idx on public.subscriptions (customer_id);
create index if not exists subscriptions_status_idx   on public.subscriptions (status);

create or replace function public.set_subscriptions_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;
drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_subscriptions_updated_at();

alter table public.subscriptions enable row level security;
drop policy if exists "subscriptions service role full" on public.subscriptions;
create policy "subscriptions service role full"
  on public.subscriptions for all to service_role using (true) with check (true);

create table if not exists public.subscription_cycles (
  id               bigserial primary key,
  subscription_id  bigint not null references public.subscriptions(id) on delete cascade,
  cycle_start      date not null,
  ships_on         date not null,                            -- 15th of cycle month
  items_planned    jsonb not null default '{}'::jsonb,       -- {'tokens': 10, 'npcs': 2, 'map': false}
  items_delivered  jsonb not null default '{}'::jsonb,
  status           text not null check (status in ('upcoming','sketching','painting','shipped','skipped'))
                       default 'upcoming',
  notes            text,
  created_at       timestamptz not null default now()
);
create index if not exists subscription_cycles_sub_idx on public.subscription_cycles (subscription_id, cycle_start desc);

alter table public.subscription_cycles enable row level security;
drop policy if exists "sub_cycles service role full" on public.subscription_cycles;
create policy "sub_cycles service role full"
  on public.subscription_cycles for all to service_role using (true) with check (true);

-- ------------------------------------------------------------
-- 7) addons — the 6 canonical add-ons (rush/psd/commercial/revision/token/print)
-- ------------------------------------------------------------
create table if not exists public.addons (
  id              bigserial primary key,
  slug            text not null unique,
  name            text not null,
  description     text,
  flat_cents      integer,
  percent_uplift  integer,                            -- e.g. 40 for commercial
  display_text    text not null,                      -- '+$50', '+40% on base', 'From $60'
  sort_order      integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create or replace function public.set_addons_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;
drop trigger if exists trg_addons_updated_at on public.addons;
create trigger trg_addons_updated_at
  before update on public.addons
  for each row execute function public.set_addons_updated_at();

alter table public.addons enable row level security;
drop policy if exists "addons public read" on public.addons;
drop policy if exists "addons service role full" on public.addons;
create policy "addons public read"
  on public.addons for select to anon, authenticated using (is_active = true);
create policy "addons service role full"
  on public.addons for all to service_role using (true) with check (true);

-- Seed the 6 canonical rows (idempotent via on conflict).
insert into public.addons (slug, name, description, flat_cents, percent_uplift, display_text, sort_order)
values
  ('rush',       'Rush delivery',     'Cuts portrait & token turnaround to 3 days.',                5000, null, '+$50',            10),
  ('psd',        'Layered PSD',       'Source file with separated layers.',                         3000, null, '+$30',            20),
  ('commercial', 'Commercial license','Books, merch, paid streaming, paid Patreon, indie game assets, Kickstarter rewards.', null, 40, '+40% on base', 30),
  ('revision',   'Extra revision',    'Third paint-stage revision round beyond the 2 included.',    4000, null, '+$40',            40),
  ('token',      'Matching VTT token','Round, transparent PNG of the character. Ordered with or after a portrait.', 2500, null, '+$25', 50),
  ('print',      'Print delivery',    '11×14 or 16×20 giclée print, via partner studio.',           6000, null, 'From $60',        60)
on conflict (slug) do update set
  name           = excluded.name,
  description    = excluded.description,
  flat_cents     = excluded.flat_cents,
  percent_uplift = excluded.percent_uplift,
  display_text   = excluded.display_text,
  sort_order     = excluded.sort_order,
  updated_at     = now();
