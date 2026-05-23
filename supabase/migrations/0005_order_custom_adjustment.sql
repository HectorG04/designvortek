-- ============================================================
-- Migration 0005 — commission_orders custom adjustment columns.
--
-- Adds the "Custom adjustment" row to the admin Quote builder
-- (see Admin Order Detail v2.html). Lets the studio apply a
-- discount or surcharge during the quote process without
-- changing the public-facing pricing.
--
-- Three columns:
--   - adjustment_label   : short text shown on the customer's
--                          quote email (e.g. "Returning client",
--                          "Multi-piece bundle", "Loyalty rate").
--   - adjustment_amount  : numeric, can be negative for discount.
--                          Stored in whole dollars (USD).
--   - adjustment_reason  : internal-only note explaining the
--                          adjustment to future-admin-you.
--
-- Total quote = quoted_price + adjustment_amount.
-- ============================================================

alter table public.commission_orders
  add column if not exists adjustment_label text,
  add column if not exists adjustment_amount integer,
  add column if not exists adjustment_reason text;

-- No index needed; this column is only used per-order in the
-- admin detail view (already indexed by id PK).
