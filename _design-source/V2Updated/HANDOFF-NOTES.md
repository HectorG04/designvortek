# Handoff · May 23, 2026

DesignVortek services restructure — 7 new design surfaces plus 8 updated files.
All built on top of the existing design system. No new tokens invented.

---

## 1. New surfaces (7 files)

These are brand-new HTML files the engineer needs to port into the Next.js codebase.

| File | Route | Notes |
|---|---|---|
| `Subscription.html` | `/subscription` | Campaign Companion landing. 2 tiers ($30 Companion / $75 GM), cadence callout (15th of month), "not included" honesty cards, 6 FAQs |
| `Commercial.html` | `/commercial` | Publisher entry point. 4 "who this is for" cards, 3-row pricing breakdown with explicit +40% licensing math, retainer tome block, NDA card |
| `Maps.html` | `/services/maps` | Quote-only maps. 2 product cards (Battle/World), 4-factor pricing explainer, **editorial SEO content block** (replaces gallery — easy to fill with real copy later), embedded quote form |
| `Service Detail v2.html` | `/services/[bucket-slug]` | **Bucket detail template** showing the Character bucket (4 products: Portrait tiered, Full-body tiered, Reference Sheet range, Token bundle). Engineering appendix at the bottom demonstrates the 3 remaining pricing-card variants (Per-extra · Pack-with-qty · Quote-only) using Party Portrait, NPC Pack, Battle Map as examples |
| `Order Form v2 Step 1.html` | `/order` Step 1 | **Interactive progressive disclosure**: bucket → product → tier. Catalog lives in `CATALOG` const at top of inline script. Hidden form fields (`bucket`, `product`, `tier`) populate Steps 2–4. Steps 2/3/4 stay as currently designed in `Order Form.html` |
| `Admin Services List v2.html` | `/admin/services` | Bucket-grouped list. 6 groups, 17 products. Drag handles, pricing-mode chips ("Tiered", "Range", "Pack", "Bundle", "Quote only", "% Uplift", "Monthly", "Flat"), filter chips (All / Published / Drafts / Quote-only / Subscription) |
| `Admin Service Editor v2.html` | `/admin/services/[id]/edit` and `/admin/services/new` | **The big one.** 8 pricing-mode chips that swap the pricing input area via JS. All 8 panels live in the DOM (`.adm-mode-panel`). Right sticky sidebar: Visibility, Bundle linkage, Genre tags, SEO (collapsible), Danger zone. Shown in edit state for "Character Portrait" |

---

## 2. Modified existing surfaces (8 files)

These had real changes — not just the Services-link fix. Replace the engineer's
current versions with these.

| File | What changed |
|---|---|
| `Admin Order Detail.html` | New **Custom adjustment** row in the Quote builder (gold dashed border). Three fields: label shown to customer · internal admin-only note · ± amount. Lets admin negotiate / discount / surcharge without exposing it on the public site |
| `Order Form.html` | **Step 3** has a new optional "Anything else about your budget?" textarea below the budget cards. Catches returning client / student / multi-piece / charity context. Studio reads before quoting |
| `About.html` | Stats section refined — smaller numbers (3rem max), italic gold suffix glyphs (★, h, yr, +), hairline dividers, centered 980px max-width |
| `Homepage.html` | Services nav link now has valid `href="Services.html"` (was unclickable) |
| `Portfolio.html` | Same Services-link fix |
| `Portfolio Detail.html` | Same Services-link fix |
| `Pricing.html` | Same Services-link fix |
| `Availability.html` | Same Services-link fix |

---

## 3. CSS files (all 6 needed)

All HTML files in this folder reference these. Required as dependencies even if
unchanged.

| File | Status | Notes |
|---|---|---|
| `tokens.css` | Unchanged | Color tokens, font tokens, spacing, radii, shadows. **Read-only — never invent new tokens** |
| `design-system.css` | Unchanged | Component primitives (`.dv-btn`, `.ds-eyebrow`, `.ds-ph-*` gradient placeholders, etc.) |
| `pages.css` | **Modified** | New Phase 5 sections appended: USD disclaimer chip, Subscription/Commercial/Maps blocks, bucket-detail (`.bd-*`) classes |
| `order-form.css` | **Modified** | New Phase 5 section appended: Order Form v2 Step 1 bucket selector + progressive disclosure (`.of-bucket-*`, `.of-reveal-*`, `.of-tier-pick-*`) |
| `admin.css` | **Modified** | New sections appended: custom-adjustment row, services list v2 (grouped, `.adm-svc-*`), service editor v2 (`.adm-svce-*`, `.adm-mode-chip`, `.adm-tier-block`, etc.) |
| `homepage.css` | Unchanged | Required by Homepage.html only |

All new class prefixes (so they're easy to find):
- `.dv-usd` — USD disclaimer chip
- `.sub-*` — Subscription page specifics
- `.com-*` — Commercial page specifics
- `.map-*` — Maps page specifics
- `.bd-*` — Bucket detail (Service Detail v2)
- `.of-bucket-*`, `.of-reveal-*`, `.of-product-chip`, `.of-tier-pick` — Order form v2
- `.adm-svc-*` — Admin services list v2
- `.adm-svce-*`, `.adm-mode-*`, `.adm-tier-block`, `.adm-tag-chip`, `.adm-danger` — Admin service editor v2
- `.adm-adjust*` — Admin Order Detail custom adjustment

---

## 4. JavaScript notes for the engineer

Three places carry interactive JS that should be ported to React patterns:

### Order Form v2 Step 1 — progressive disclosure
- The `CATALOG` const at the top of the inline `<script>` is the source of truth
  for bucket → product → tier mapping. In production this should come from the
  API (`/api/services` grouped by bucket).
- Products have a `mode` field with values: `tiered`, `range`, `flat`, `pack`,
  `per-extra`, `bundle`, `monthly`, `quote`. The render logic branches on mode.
- Quote-only products redirect via `href` instead of advancing the form.
- localStorage key: `designvortek-order-draft-v2`. Saves on every state change.
- Animation spec: opacity + 8px translate, 280ms, `cubic-bezier(.4,.0,.2,1)`.

### Admin Service Editor v2 — pricing mode swap
- 8 chips in `.adm-mode-grid`. Each has `data-mode="<key>"`.
- 8 panels in the DOM with `data-panel="<key>"`. The active one has
  `.is-active`.
- Switching is a 5-line click handler at the bottom of the file. Port directly
  to React state.
- Modes correspond 1:1 to the catalog modes used by Order Form v2.

### Admin Order Detail — custom adjustment
- No JS yet. The amount input accepts negative numbers ("−50") for discounts.
- The total quote line should recalc reactively as: `base + addons + adjustment`.

---

## 5. Source-of-truth references

- Brief: `uploads/Design-Requirements-Handoff.md` (services restructure design brief)
- Pricing brief: `uploads/Character-Art-Services-Brief.pdf` (canonical catalog)
- Pricing amendments locked in brief §1:
  - Commercial licensing: **+40%** of job (not 75–100%)
  - Convert art to token: **$25** (not $15)
  - Deposit: **30%** upfront, non-refundable after sketches begin
  - **2 revisions** baked into every tier

---

## 6. Things deliberately not done

Per the brief §5, these are engineer-handled solo and were not redesigned:

- `/services` index page (uses existing card pattern)
- `/pricing` per-bucket sections (uses existing tier block pattern)
- Order Form Steps 2/3/4 (kept as designed in `Order Form.html`)
- Homepage strip update
- `/faq`, `/terms`, `/refunds` policy text updates
- `lib/constants.ts` value updates
- Portfolio, Reviews, Blog modules

---

## 7. Open work for future iterations

These were discussed but consciously deferred:

- **Logged-in "Returning customer arrangement" path** — discussed in the negotiation flow conversation. Worth adding only if 30%+ of revenue is repeat customers and the CMS knows who's logged in
- **Real images** for Maps gallery, Commercial example cards, Service Detail v2 examples — currently using gradient placeholders (`.ds-ph-*`)
- **Pricing-mode "Subscription" panel** in the Admin Service Editor uses the Monthly mode — fine for now, but the editor doesn't yet handle cadence-day (the 15th-of-month rule) as a structured field

---

*All designs follow the existing brand system. No new tokens, no new fonts, no
new colors. Match the typographic hierarchy (Cormorant display, Inter body,
Caveat accent) and the burgundy/gold/parchment/tome palette exactly as in
`tokens.css`.*
