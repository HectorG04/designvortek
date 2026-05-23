# DesignVortek · Complete Project

**Snapshot date:** May 23, 2026
**Status:** All design phases complete · ready for engineering

This zip contains the **entire DesignVortek HTML design system** — every page, every stylesheet, every admin surface. Updated pages contain only their latest version. Old versions have been overwritten.

---

## Quick start

1. Unzip the folder
2. Open any `.html` file in a modern browser (Chrome / Firefox recommended)
3. Start from `Homepage.html` to see the public site, or `Admin Dashboard.html` for the admin
4. All paths are relative — keep all files in the same folder

---

## What's in here (51 files)

### Public pages (22)
Homepage · About · Portfolio + Detail · Services + Detail (v1 & v2) · Pricing · Process · Availability · Blog + Post · Reviews · FAQ · Contact · Order Form + Order Form v2 Step 1 + Order Success · **Subscription** · **Commercial** · **Maps** · Privacy · 404

### Admin (15)
Dashboard · Orders + Order Detail · Customers + Detail · Inquiries · Portfolio + Editor · Blog + Editor · Services + **Services List v2** · Service Editor + **Service Editor v2** · Reviews · Availability · Media · Settings · Login

### Reference (3)
Design System · Brand Book · CLAUDE_CODE_HANDOFF.md

### Stylesheets (6)
tokens.css · design-system.css · pages.css · order-form.css · admin.css · homepage.css

### Handoff doc (1)
HANDOFF-NOTES.md — May 23 work specifically (what was new, what was modified, JS patterns to port)

---

## What changed on May 23, 2026

**7 new files** added:
- `Subscription.html` · `Commercial.html` · `Maps.html`
- `Service Detail v2.html` · `Order Form v2 Step 1.html`
- `Admin Services List v2.html` · `Admin Service Editor v2.html`

**8 existing files updated** (old versions replaced):
- `Admin Order Detail.html` — new "Custom adjustment" row in quote builder
- `Order Form.html` — new "Budget context" textarea in Step 3
- `About.html` — refined stats section
- `Homepage.html`, `Portfolio.html`, `Portfolio Detail.html`, `Pricing.html`, `Availability.html` — Services nav link fix
- `Design System.html` — updated to reflect v1.0 Complete status

**3 stylesheets updated** with new Phase 5 patterns appended:
- `pages.css` · `order-form.css` · `admin.css`

For the full story on each change — including JS port notes, route mappings, and CSS prefix conventions — see **HANDOFF-NOTES.md** in this folder.

---

## Tech stack reminder

- Plain HTML + CSS · no build step needed for the mockups
- One small `<script>` block per page where JS is needed (header scroll, Order Form v2 progressive disclosure, Service Editor mode-chip swap)
- Fonts loaded from Google Fonts (Cormorant Garamond, Inter, Caveat)
- All design tokens defined as CSS custom properties in `tokens.css`
- Class naming convention: prefixed per surface (`hp-*`, `pg-*`, `of-*`, `adm-*`, `dv-*`, `ds-*`, plus new Phase 5 prefixes `sub-*`, `com-*`, `map-*`, `bd-*`, `of-bucket-*`, `adm-svc-*`, `adm-svce-*`, `adm-mode-*`, `adm-adjust*`)

---

## Engineering port priorities

If implementing into Next.js, start in this order:

1. **Tokens → Tailwind config** — `tokens.css` defines the entire color/spacing/font/radius system
2. **Public chrome** — header, hero, footer, FAQ accordion, CTA strip (used everywhere)
3. **Order Form v2 Step 1** — most complex new interaction (`CATALOG` → bucket → product → tier branching)
4. **Admin Service Editor v2** — 8 pricing modes with panel swap
5. **Everything else** — repeat patterns of the above

*Designed with care · all patterns tested · ready to ship.*
