# Session handoff — what got done while you were away

**Last commit on `main`:** `067c542` · everything is pushed, Vercel is redeploying.

This note covers the two waves of work in this session: the **canonical v2 rollout** (8 phases of infrastructure work) and the **per-page audit sweep** (every public page vs `Latest 23 may 2026` HTMLs).

---

## Wave 1 — Canonical v2 rollout (8 phases, 1 commit: `91fbbf7`)

You confirmed migration 0006 applied to Supabase and asked me to push everything live with Resend + Stripe deferred until launch. All 8 phases shipped:

| Phase | What landed |
|---|---|
| 1 — Schema | Migration 0006: `customers`, `order_status_log`, `order_messages`, `subscriptions`, `subscription_cycles`, `addons` (+ 6 canonical rows seeded). Added 25+ columns to `commission_orders` (stripe_*, deposit_*, balance_*, quote_addons jsonb, order_number generator). Collapsed 6 buckets → 5, 19 products → 17 (commercial moved to +40% addon). |
| 2 — Catalog API | `GET /api/catalog` returns {buckets, products, addons} tree. `lib/addons.ts` + `lib/addons-server.ts` with snapshot fallback. Pricing helpers (`resolveAddons`, `depositFor`). |
| 3 — Resend | `lib/email/` with branded HTML layout + 16 templates (13 canonical + 3 carry-overs). Graceful no-op when `RESEND_API_KEY` missing. `/api/order`, `/api/inquiry`, `/api/waitlist` migrated. |
| 4 — Order lifecycle | Quote builder gains **Commercial +40% checkbox**. `sendQuote` persists base/commercial/total/deposit cents, writes audit logs, sends quote email. New actions: `sendSketch`, `sendUpdate`, `sendDelivery`, `sendRelease`. |
| 5 — Stripe one-off | `lib/stripe.ts` (deposit, balance, subscription sessions). `POST /api/orders/[id]/approve` + `pay-balance` endpoints. `POST /api/webhooks/stripe` handles 8 event types. Customer-facing `/order/[id]/approve` + `/pay-balance` pages. |
| 6 — Stripe Subscriptions | `POST /api/subscriptions/checkout`. `SubscribeButton` wired into `/subscription` tier cards. `/subscription/success` page. Webhook creates `subscription_cycles` on `invoice.paid`. |
| 7 — Admin surfaces | Verified all 13 canonical admin routes exist + auth guard via `proxy.ts`. Commercial bucket dropped from admin/services maps. |
| 8 — A11y + RLS + env | Skip-to-content link in SiteHeader. `id="main"` added to 22 public `<main>` elements. RLS audited: new tables admin-only. `.env.local.example` documents 5 new Stripe vars. |

---

## Wave 2 — Per-page audit vs `Latest 23 may 2026/*.html`

You asked me to compare each public page against the new canonical HTMLs one-by-one. Here's where every page landed.

### Substantive fixes committed
| Page | Commit | What changed |
|---|---|---|
| `/services` | `5b13e64` | **Full rewrite** — from 5-bucket grid to canonical 5-card curated marketing index (Character Art, VTT Tokens, Party Portraits, NPC Packs, Custom Projects) + 5×5 comparison table + dark CTA strip. |
| `/` (homepage) | `e92b51a` | Meta title + description aligned to canonical. Added 2nd compass divider between Personas and Portfolio. ServicesPreview footer link "Browse every service bucket" → "See all five services". ServicesPreview description aligned. CTACloser "Ask a question" wired to `/contact`. |
| `/pricing` | `4bd99ce` | **Full rewrite** — from 5-bucket layout to canonical 2-bucket structure (one-off + subscription). Added "At a glance" 8-card index strip, "Add-ons" grid (6 cards), "Something bigger?" custom quote block. Battle Map + Reference Sheet + NPC Pack use `.bd-card` layout. Party Portrait per-extra footnote. |
| `/process` | `6001c54` | Step 2 deposit copy: **25% → 30%** (matches canonical + pricing). |
| `/faq` | `b59ee4b` | Hero eyebrow "Frequently asked" → "FAQ". Title "Quick answers, no fluff" → "Every question, answered". |
| `/order/success` | `067c542` | Two `25% deposit` references → `30% deposit`. |

### Pages audited and confirmed already aligned (no fix needed)
- `/about` — hero, artist intro, 3 values, 4 stats, BTS gallery, CTA all match canonical
- `/contact` — 4 contact methods + form card + response time note
- `/blog` — Studio Notes hero, featured card, category chips with counts, grid
- `/blog/[slug]` — breadcrumbs, header, feature image, markdown body with pullquote styling, author bio
- `/portfolio` — hero "Five hundred pieces. One craft.", sticky filter bar, masonry
- `/portfolio/[slug]` — gallery + sticky info + specs dl + artist note + related
- `/reviews` — hero "What clients actually say" + rating summary + filter chips + grid
- `/availability` — hero + 3-month calendar + explainer + waitlist
- `/commercial` — hero + 4 who-this-is-for cards + 3-line pricing breakdown + retainer + NDA
- `/subscription` — hero + how-it-works + 2 tier cards + cadence callout + not-included + FAQ
- `/services/[slug]` — bucket detail with Pick Your Style (character bucket only) + per-product blocks + bucket FAQ
- `/services/maps` — quote-only landing with 2 products + 4-factor pricing + form
- `/privacy`, `/terms`, `/refunds` — all reference 30% deposit correctly, structure matches Privacy.html template
- `/order` (the multi-step form) — was already touched in phases 4 + 5, structurally aligned

### One intentional deviation from canonical
- **PortfolioStrip filter chips** — you added 3 new categories recently (Weapons & Assets, Character Sheets, Emotes). Canonical has 6 chips, ours has 9. Kept as-is per your direction.

---

## Where things stand

### ✅ Code: all on `main`, deployed
Every audit fix is committed and pushed. Vercel will redeploy automatically.

### ⏸ Resend — deferred (you'll wire at launch)
Without `RESEND_API_KEY`, every email send is a console-log no-op. Order pipeline still works end-to-end. When you're ready: add the key + `FROM_EMAIL` + `ADMIN_NOTIFY_EMAIL` to Vercel env.

### ⏸ Stripe — deferred (you'll wire at launch)
`/api/orders/[id]/approve` and `/api/subscriptions/checkout` will throw a descriptive "STRIPE_SECRET_KEY not set" error until you add keys. When ready:
1. Create the two recurring prices in Stripe Dashboard ($30 Companion, $75 GM tier)
2. Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_COMPANION`, `STRIPE_PRICE_GM_TIER`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to Vercel
3. Register the webhook at `https://designvortex.co/api/webhooks/stripe` and subscribe to: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.{deleted,paused,resumed}`

See `.env.local.example` for the full list.

### 🔴 Service role key rotation — still pending
You said you'd rotate it later. Don't forget — anyone with the leaked key can read/write the entire Supabase project.

---

## What you can verify on the live site after Vercel redeploys

The biggest visible changes from this session:

1. **`/services`** — now the curated 5-card marketing grid (Character Art / VTT Tokens / Party Portraits / NPC Packs / Custom Projects) instead of bucket cards. Comparison table + dark CTA strip below.
2. **`/pricing`** — now structured as One-off commissions + Monthly subscription (2 sections) with 8-card index at top, 6 add-on cards, and a "Something bigger?" custom block. 17 products rendered from the database.
3. **`/admin/services`** — 5 buckets, 17 products (commercial bucket removed)
4. **`/admin/orders/[id]`** — quote builder has the Commercial +40% toggle + shows 30% deposit beneath the total
5. **`/subscription`** — "Start Companion" / "Start GM tier" buttons now expand to email-collection forms that wire to Stripe (will error until Stripe keys are added)
6. **Hero / process / order-success pages** — all references to deposit are 30% (was 25% in a couple of places)

---

## Recent commit log (most recent first)

```
067c542 Order success — fix deposit copy (25% -> 30%) to match canonical
b59ee4b FAQ page — align hero eyebrow + title with canonical FAQ.html
6001c54 Process page — fix deposit copy (25%/75% -> 30%/70%) to match canonical
4bd99ce Pricing page — match canonical Pricing.html 1:1
e92b51a Homepage audit — align with canonical Homepage.html
5b13e64 Services page — match canonical Services.html 1:1
91fbbf7 Canonical v2 HANDOFF rollout — Stripe, Resend, subscriptions, schema
```

All 7 of these commits are from this session.

---

## What's left to do before launch (your 2-week runway)

1. **Add Stripe keys** to Vercel + register the webhook
2. **Add `RESEND_API_KEY`** (+ verify the sending domain in Resend)
3. **Rotate the Supabase service role key**
4. **End-to-end test** the order flow:
   - Submit a brief at `/order` → check `commission_orders` has `order_number` populated
   - Send quote from admin with Commercial toggle on → customer gets quote email with +40% line
   - Click approve link → Stripe Checkout for 30% → webhook flips status to `accepted`
   - Admin send-delivery → balance pay link → second Stripe Checkout for 70%
   - Subscription signup at `/subscription` → row in `subscriptions` table
5. **Optional polish** I noticed but didn't fix:
   - Homepage PortfolioStrip has 9 filter chips vs canonical 6 — your call whether to reduce
   - Order form (53KB) wasn't deep-audited this session; it was structurally touched in phases 4-5 but a fresh pass against canonical might catch minor copy drift

That's the lot. Everything's on `main` and deploying. Send me a list when you come back and I'll knock through whatever's left.
