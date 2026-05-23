# Design source · V2Updated (May 23, 2026 handoff)

Canonical HTML/CSS mockups from Claude Design. Everything in this folder is the **source of truth** for the visual design of the Next.js port.

## Why this folder is in the repo

Without these files, design audits can't compare implementation against the spec. With them committed, anyone working on this project — locally, on a fresh machine, or via claude.ai/code — has the same reference material the original implementation was built from.

## How to use

When implementing or refining a surface:

1. Open the relevant HTML file (e.g. `V2Updated/Service Detail v2.html`)
2. Read it top to bottom
3. Cross-reference the CSS files (`tokens.css`, `design-system.css`, `pages.css`, `order-form.css`, `admin.css`, `homepage.css`) for class definitions
4. Translate to JSX + Tailwind utilities, matching the brand tokens defined in `app/globals.css`
5. Use `tokens.css` as the read-only single source of truth for colors, spacing, fonts, radii, shadows

## What's in here

**Public pages** (22):
Homepage, About, Portfolio + Detail, Services + Service Detail (v1 & v2), Pricing, Process, Availability, Blog + Post, Reviews, FAQ, Contact, Order Form (v1 & v2 Step 1) + Order Success, Subscription, Commercial, Maps, Privacy, 404

**Admin** (15):
Dashboard, Orders + Order Detail, Customers + Detail, Inquiries, Portfolio + Editor, Blog + Editor, Services + Services List v2, Service Editor + Service Editor v2, Reviews, Availability, Media, Settings, Login

**Reference** (3):
Design System, Brand Book, CLAUDE_CODE_HANDOFF.md

**Stylesheets** (6):
tokens.css, design-system.css, pages.css, order-form.css, admin.css, homepage.css

**Handoff notes** (1):
HANDOFF-NOTES.md — what was new vs modified in the May 23 batch, JS patterns to port, route mappings, CSS prefix conventions

## Convention

- Never invent new color, spacing, font, or radius tokens. Pull from `tokens.css`.
- Class naming convention (prefixes): `hp-*`, `pg-*`, `of-*`, `adm-*`, `dv-*`, `ds-*`, plus Phase 5 prefixes `sub-*`, `com-*`, `map-*`, `bd-*`, `of-bucket-*`, `adm-svc-*`, `adm-svce-*`, `adm-mode-*`, `adm-adjust*`, `dv-usd`.
- Italic `<em>` in display headings → parent uses `[&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700` (or `text-gold-glow` on dark backgrounds).
- Element selectors in CSS go inside `@layer base { }` so Tailwind utilities outrank them.
- next/font Cormorant Garamond declares `style: ['normal', 'italic']` explicitly so the italic face actually loads.

## Don't ship these to production

The `_` prefix on the folder name keeps Next.js from treating it as a route. The folder is reference material only — no JSX file imports from it, no runtime dependency. Safe to delete if you ever decide you no longer need the design audits.
