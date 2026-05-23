# Services Restructure — Design Requirements

> Handoff brief for the Claude Design instance.
> Produces HTML mockups that will then be literal-ported into the Next.js codebase.

---

## 1. Context

The **Design Vortex** site (a premium hand-painted character art studio for TTRPG players, GMs, and publishers) is restructuring its services and pricing. Most of the public site can be restructured by reusing existing patterns. This brief covers **only the surfaces that need fresh design work**.

The companion brief at `Services Brief/Character-Art-Services-Brief.pdf` defines the new product catalog, pricing, tiers, buckets, and policies. **Read that first.** This document specifies the visual surfaces that need to be designed to support it.

### Decisions already locked in (do not re-litigate)

- **5 service buckets** + optional Subscription bucket: Character work · Party work · GM / world-building · Tokens (standalone) · Commercial / publisher · Subscription
- **Genre = filter, not a service.** Do not design per-genre pages.
- **Tiers = rendering complexity** (Basic / Standard / Premium), not subject matter.
- **Bundles are first-class.** Character + Token (+$25) is a real product, not a footnote.
- **Maps and Commercial are quote-only.** No fixed price displayed. CTA = "request a quote."
- **Convert client art to token** = $25 (was $15 in original brief).
- **Commercial licensing** = +40% of job price (flat), was +75–100% in original brief.
- **Deposit** = 30% upfront, non-refundable once sketches begin.
- **2 revisions** baked into every tier.
- **Turnaround** quoted as ranges (e.g. "2–4 weeks"), framed as handcrafted.
- **USD only** — disclaimer should appear near any prominent price.
- **Gift Giver persona stays** on the homepage. Brief's "Publisher" archetype is added without removing Gift Giver.

---

## 2. Design language (mandatory references)

Before drawing anything, study these files in the project:

| File / folder | What it is | Why it matters |
|---|---|---|
| `Claude Design Final/` | Canonical HTML for every existing page (Home, Order Form, Pricing, Service Detail, Blog, etc.) | This is the source of truth for studio aesthetic. Match it exactly. |
| `design-system.css` | Component classes, gradient placeholders (`.ds-ph-character`, `.ds-ph-anime`, `.ds-ph-scene` etc.), dashed borders, gold rails | Reuse these classes by name. Do not invent new tokens. |
| `tokens.css` | Color tokens (`--color-burgundy-700`, `--color-gold-500`, `--color-parchment-50`, `--color-ink-900`, etc.), font tokens, spacing | All color/spacing values come from these tokens. |
| `Claude Design Final/Pricing.html` | The current pricing layout — per-service tier blocks + dark tome custom-quote closer + add-ons grid + FAQ | The new pricing page reuses this exact pattern at the bucket level. |
| `Claude Design Final/Service Detail.html` | The current single-service detail template | The new bucket detail pages stack this template per product. |
| `Claude Design Final/Order Form.html` | The 4-step order form | Step 1 may need a service selector update; rest stays. |

### Brand snapshot

- **Display font:** Cormorant Garamond, often italic for emphasis (`<em>` tags inside h1/h2 get italic + medium weight + burgundy-700 color).
- **Body font:** Inter (or close).
- **Accent font:** Caveat (small handwritten subtitles like "your hero, painted").
- **Primary palette:**
  - Burgundy-700 (`#6B1F2A`) — primary accent, CTAs
  - Gold-500 (`#C9A04A`) — secondary accent, "featured" badges
  - Parchment-50 / 100 / 200 — background warmth (cream/off-white range)
  - Ink-900 / 700 / 500 — text hierarchy
  - Tome-950 (`#1a130c`) — dark "tome" sections (CTA closers, custom-quote blocks)
  - Forest-500 — sparingly, for "published / success" states
- **Border style:** `1.5px` solid for inputs and tier cards; dashed for "policy" divider lines inside cards; rounded radii are 0.75rem / 1rem / 1.5rem / pill.
- **Texture:** Subtle paper grain overlay on dark sections (`PaperTexture` component, opacity ~0.4–0.5).
- **Featured chips:** Gold-500 pill, tiny tracking-wide uppercase text.
- **Eyebrow style:** `text-[0.6875rem] font-bold tracking-[0.15em] uppercase text-gold-700` — appears above every page hero and section head.

### Patterns to mirror, not reinvent

| Pattern | Where to see it | Use it for |
|---|---|---|
| **PageHero** (eyebrow + h1 with `<em>` italic + lede paragraph) | Top of every existing page | Top of every new page |
| **Tier card** (name, "best for" sub, big dashed-border price, check-marked feature list, CTA) | `Pricing.html` | All tier displays |
| **Dark tome custom-quote block** (gold-glow eyebrow, h3 with gold-glow `<em>`, copy, gold CTA + cream-outline secondary CTA) | Pricing.html footer | Subscription CTA closer, commercial quote block |
| **Included grid** (6 short cards: name + 1-sentence body) | `Service Detail.html` | New product detail templates |
| **Example cards** (3 gradient placeholders with title + meta) | Service Detail.html | New product detail templates |
| **FAQ accordion** (native `<details>` with rotating + icon, branded) | Pricing.html | Subscription FAQ, commercial FAQ |
| **Bucket card** (image-top, body, icon, footer with price + arrow) | `Services.html` index | Bucket selector if needed |
| **Dashed-border price line** (top + bottom dashed borders around the price block in a tier card) | `Pricing.html` | All tier price displays |

---

## 3. Surfaces to produce — overview

| # | Surface | URL | Priority | Type |
|---|---|---|---|---|
| 1 | **Subscription landing page** | `/subscription` | Required | Public page |
| 2 | **Commercial / publisher landing page** | `/commercial` | Required | Public page |
| 3 | **Maps "request a quote" page or section** | `/services/maps` or embedded | Required | Public page or component |
| 4 | **Services bucket detail template** | `/services/[bucket-slug]` | Required | Public page template |
| 5 | **Order form Step 1 — service selector update** | `/order` Step 1 | Required | Form step |
| 6 | **Admin: Services list view (refresh)** | `/admin/services` | Required | Admin page |
| 7 | **Admin: Service / product editor (full restructure)** | `/admin/services/[id]/edit` | Required | Admin page |
| 8 | USD-only disclaimer chip / badge pattern | Reused near every price | Required | Small component |

Everything else (`/services` index card refresh, `/pricing` per-bucket sections, homepage strip update, `/faq` / `/terms` / `/refunds` policy text updates) the engineer will restructure solo using existing patterns. **Do not redesign those.**

---

## 4. Page-by-page requirements

### 4.1 Subscription landing page

**URL:** `/subscription`
**Purpose:** Convert GMs into recurring monthly customers. The studio offers 2 subscription tiers; the page sells the convenience + cost-savings of monthly delivery vs ad-hoc commissions.

**Tone:** Confident but honest. Subscriptions are positioned as "campaign companion" for active GMs, not as a discount mechanism. Emphasize hand-painted craft is preserved, not assembly-line.

**Sections (top to bottom):**

1. **PageHero** — eyebrow "Campaign companion · Subscription", h1 with italic emphasis (e.g. "Your campaign's <em>steady supply</em>"), lede explaining the model in one paragraph.
2. **"How it works" strip** — 4 short steps, each with a small numbered circle. Steps: (1) Pick a tier; (2) Send your campaign brief; (3) We deliver each month on a fixed cadence; (4) Pause or cancel any time before the next cycle. Echo the `PROCESS_STEPS` pattern from the homepage but in a horizontal strip, not full cards.
3. **Two tier cards (Companion · GM)** — side by side on desktop, stacked on mobile.
   - **Companion** — $30/mo · 10 tokens + 2 NPCs per month. "Best for" eyebrow: "Active GMs with a token-hungry table."
   - **GM tier** (featured) — $75/mo · tokens + NPCs + 1 map per month. "Best for" eyebrow: "Long-form campaigns that need a steady drip."
   - Show the dashed-border price block, then a bulleted "what's included" list, then a checkmark list of policies (cancel anytime, pause for a month, swap items mid-cycle, no rollover).
   - Featured tier carries a gold "Most picked" flag (reuse the `flag` pattern from `Pricing.html`).
4. **Delivery cadence callout** — single dark tome card: "Every subscription tier ships on the **15th of the month**. New subscriptions started after the 10th roll over to the next cycle." Set expectations clearly.
5. **What's NOT in a subscription** — 3-card row (parchment background, burgundy heading). Cards: (1) Full party portraits (different scope), (2) Battle maps over standard size (we'll quote separately), (3) Commercial licensing (handled per piece). Keeps expectations honest.
6. **FAQ accordion** — 5 questions: "Can I pause my subscription?" "What if I don't use my monthly allotment?" "Can I swap a token for an NPC?" "What happens if I have a complex month?" "How do I cancel?"
7. **CTA closer** — dark tome block, "Start your campaign companion" gold CTA + "Ask a question first" cream-outline secondary CTA.

**Things to include:**
- USD-only disclaimer near each price (tiny note: "Prices in USD. International cards billed at current exchange rate.").
- 30% deposit doesn't apply to subscriptions — first month is paid upfront in full. State this in FAQ.
- Cancel-anytime language must be visible above the fold, not buried in FAQ.

---

### 4.2 Commercial / publisher landing page

**URL:** `/commercial`
**Purpose:** B2B entry point. Publishers, indie game studios, Kickstarter creators, streaming platforms, merch lines. Different tone from retail commission pages — less emotional, more "talk to us."

**Tone:** Confident professional. No hard sell. Emphasize the studio takes commercial work seriously, signs NDAs, handles retainers, and prices commercial scope honestly via the +40% uplift.

**Sections (top to bottom):**

1. **PageHero** — eyebrow "Commercial · Publisher · Studios", h1 with italic emphasis (e.g. "For the work that <em>ships</em>"), lede explaining the studio takes commercial illustration commissions, with commercial licensing handled transparently.
2. **Who this is for** — 4-card row (parchment cards, burgundy heading per card). Cards: (1) Indie tabletop publishers, (2) Kickstarter campaigns, (3) Indie video games & streaming, (4) Merchandise & licensing. Each card has a small icon (reuse existing icon system) + 1-sentence description.
3. **How commercial pricing works** — single explainer card with a clean breakdown:
   - Base: your project quoted at standard studio rates (link to `/pricing`).
   - License: +40% of the job price (flat) covers commercial use across the agreed scope.
   - Retainer: monthly arrangement with priority queue + best per-piece rate. By inquiry.
   - Use a 3-row table with `dashed-border` separators.
4. **Retainer block** — dark tome panel. Headline: "Long-running collaborations." Body: explain retainer model in 2 paragraphs. Two CTAs: "Discuss a retainer" (gold) and "Email designvortex04@gmail.com" (cream outline).
5. **NDA + scope** — short reassurance card (parchment): "We sign mutual NDAs whenever a client requests one, at no charge. Standard for pre-launch indie titles, unreleased IP, and competitive work."
6. **Recent commercial work** — 3 example cards (gradient placeholders for now, can be swapped to real screenshots later). Each shows: project name, client (or "client name held under NDA"), short description.
7. **FAQ accordion** — 4 questions: "What's included in commercial licensing?" "Can I commission work in someone else's IP?" "How long does a typical commercial project take?" "Do you do exclusivity?"
8. **CTA closer** — dark tome block with two CTAs: "Request a commercial quote" (gold), "See standard pricing" (cream outline → `/pricing`).

**Things to include:**
- USD-only disclaimer.
- Explicit +40% licensing math callout (so it's not buried).
- "Talk to us" framing throughout — no add-to-cart, no quick-buy.

---

### 4.3 Maps "request a quote" page

**URL:** `/services/maps` (preferred — gives the surface a named home and a real URL for the site map)
**Purpose:** Showcase battle maps + region maps as offered services, without committing to fixed prices. Convert visitors to a quote request.

**Tone:** Cartographic, slightly atmospheric. Maps are a different kind of work from character art and the page should feel a little different — older, more "guild ledger" energy. Still within the studio's tome aesthetic.

**Sections (top to bottom):**

1. **PageHero** — eyebrow "GM / world-building · Maps", h1 with italic emphasis (e.g. "Maps that <em>your players will steal</em>"), lede explaining hand-drawn battle maps and region/world maps.
2. **Two product cards (Battle Map · World Map)** — side by side. Each card has:
   - Aspect-ratio gradient placeholder (use `.ds-ph-scene` with a different hue for each)
   - Product name + 1-line eyebrow
   - 3-bullet "what you get" list
   - Price range: "From $150" (Battle Map) / "From $300" (World Map)
   - "Request a quote" gold CTA
3. **Pricing depends on…** — explainer card with 3-4 factors: size, complexity, color vs B&W, hand-lettered labels vs digital labels, gridded vs ungridded, VTT-ready exports. This sets expectation that pricing varies legitimately.
4. **Examples gallery** — 6-card grid of past maps (gradient placeholders for now). Each card: title, scale ("16×20 inches at 300dpi" or "Region: 12 settlements"), meta date.
5. **Quote request form** — embedded form (parchment card, big enough to feel intentional). Fields:
   - Map type (radio: Battle map / Region map / World map / Not sure)
   - Estimated size or scope (free text)
   - Tone (radio: Classic fantasy / Sci-fi / Horror / Modern / Other)
   - Deadline (date)
   - Description (textarea)
   - Reference URLs (textarea, optional)
   - Email + name
   - Submit button: "Send map brief"
6. **FAQ accordion** — 4 questions: "How long does a battle map take?" "Can you match my existing campaign art?" "Do you do digital labels or hand-lettered?" "What VTT formats do you export?"

**Things to include:**
- USD-only disclaimer near the price range.
- No fixed prices anywhere except the "From $X" anchor on each product card.
- Quote form should post to the existing `/api/inquiry` endpoint (or the engineer can swap to a new one — leave a placeholder action attribute).

---

### 4.4 Services bucket detail template

**URL pattern:** `/services/[bucket-slug]` where bucket-slug ∈ {character-work, party-work, gm-world-building, tokens, commercial, subscription}

**Why a new design is needed:** The current `/services/[slug]` template assumes ONE product per page (with 3 tiers). The new structure has **multiple products per bucket** (e.g. Character bucket has Portrait, Full-body, Reference Sheet, Bundle = 4 distinct products, each with its own tiers).

**Required structure for a bucket page:**

1. **PageHero** — eyebrow showing bucket name, h1 with italic emphasis (e.g. "Character work, every <em>tier of finish</em>"), lede paragraph.
2. **Bucket-level "what's true across this bucket"** — small strip (2-3 short cards or a single inline pill list) with: included revisions (2), turnaround range, what's always delivered. Avoids repeating these across each product block.
3. **Per-product sections** — repeated block, one per product in the bucket. Each block contains:
   - Product name (h2, Cormorant)
   - One-line "best for" subtitle (Caveat, burgundy)
   - 1-paragraph description
   - Tier grid (3 tier cards: Basic / Standard / Premium — matching the existing `Pricing.html` tier card pattern). For products without 3 tiers (e.g. Reference Sheet is a range), show ONE card with the range pricing.
   - Optional: "Pick your style" row (Character bucket only — reuse the 4-card style picker from current `Service Detail.html`)
   - Bottom dashed divider between products
4. **Examples gallery** — single 3-card row showing the best example from each major product in the bucket.
5. **FAQ accordion** — bucket-level FAQ (4-5 questions covering the whole bucket).
6. **CTA closer** — dark tome block with "Start a commission" gold CTA + "Browse portfolio" cream outline.

**Per-product variations to design for:**

- **Tiered product** (3 tier cards) — Character Portrait, Full-body Character, Party Portrait, NPC Pack, Single Token, etc.
- **Range product** (1 card with "From $X to $Y") — Reference Sheet, Action Scene, Monster, Battle Map, World Map.
- **Per-extra-member product** (1 card with base + "extra member +$X" footnote) — Party Portrait extras.
- **Pack-with-quantity product** (1 card with 2-3 quantity options stacked) — NPC Pack (5 vs 10), Matched Party Set (4 vs 6), Item/Artifact (single vs 6-pack).
- **Bundle product** (1 card with linkage callout: "Add a matching token to any portrait for +$25") — Character + Token bundle.
- **Quote-only product** (1 card with no price, "request a quote" CTA) — Maps, Commercial.

**Show all six variations as a key on the design page** so the engineer can map each real product to a card variation.

---

### 4.5 Order form Step 1 — service selector update

**URL:** `/order` Step 1 only. **Other steps stay as designed in `Order Form.html`.**

**Why a new design is needed:** Current Step 1 has 4 service-type radio cards (Character Art / VTT Tokens / Party Portrait / NPC Pack). The new catalog has ~12 products across 5 buckets. Showing 12 flat radio cards is too many.

**Required structure:**

Two-step selection pattern within Step 1:

1. **Bucket selector** (5 large cards in a 2-3-2 or 3-2 grid): Character / Party / GM / Tokens / Subscription. Commercial doesn't appear here — commercial-intent users land on `/commercial` directly. Each card shows: bucket name, 1-line description, icon, list of products inside.
2. **After bucket selected**, the page reveals (animated in or just expanded below) a **product picker** scoped to that bucket — radio chips listing the products in that bucket (e.g. selecting Character reveals: Portrait / Full-body / Reference Sheet / Bundle as 4 chips).
3. **Tier picker** appears below the product picker once a product with tiers is selected.

Keep the form Step indicator at the top consistent with existing 4-step pattern.

**Things to include:**
- Don't break the existing Steps 2/3/4 — they continue to handle description, refs, deadline, budget, contact details, terms.
- The selection state from Step 1 (bucket + product + tier) populates a hidden field that the order API consumes.
- Visual treatment of bucket cards should reuse the existing service card pattern from `Services.html`.

---

### 4.6 Admin: Services list view (refresh)

**URL:** `/admin/services`

**Why a new design is needed:** Current admin services list shows the 5 flat services as a simple list. New structure has ~12 products grouped under 5 buckets. The list view needs to handle nesting.

**Required structure:**

1. **Admin shell** — reuse existing `AdminShell` component (header with user avatar, sidebar nav, breadcrumbs).
2. **Page title:** "Services" with subtitle "5 buckets · 12 products · 1 draft" (counts are dynamic).
3. **Actions:** "New product" button (gold pill, top-right).
4. **Filter chips** — All / Published / Drafts / Quote-only / Subscription. Same chip pattern as `/admin/blog`.
5. **Grouped list** — products grouped by bucket, with bucket as a sub-heading row. Each product row shows:
   - Drag handle (for reordering within bucket)
   - Product name + bucket badge
   - Pricing summary (e.g. "$60 / $90 / $140" or "From $250" or "Quote only")
   - Tier count
   - Status badge (Published / Draft)
   - Last edited timestamp
   - Edit button (pencil icon)
6. **Empty state** — when no products yet, big card prompting "Add your first product."

Match the visual treatment of `/admin/blog` and `/admin/portfolio` list views — they're the canonical reference.

---

### 4.7 Admin: Service / product editor — full restructure

**URL:** `/admin/services/new` and `/admin/services/[id]/edit`

**Why a new design is needed:** This is the big one. The new product catalog has 6 different pricing shapes, plus tier management, plus bundle linkage, plus quote-only flow, plus subscription cadence. The current editor is a single-shape form. Needs to flex per pricing mode.

**Required structure:**

**Left column (main editor):**

1. **Breadcrumb** — Services › [Bucket] › [Product name]
2. **Title input** — Cormorant, large, prominent (matches `/admin/blog` editor pattern).
3. **Slug input** — auto-derived from title, editable, with `/services/[bucket]/` prefix shown.
4. **Bucket selector** — dropdown: Character / Party / GM / Tokens / Commercial / Subscription.
5. **Eyebrow / one-line subtitle** — small text input ("your hero, painted").
6. **Lead paragraph** — short markdown textarea.
7. **Pricing mode selector** — radio chip row with 6 options:
   - Tiered (Basic/Standard/Premium with prices)
   - Range (From $X to $Y)
   - Per-extra (Base + per-extra-member)
   - Pack-with-quantity (rows of qty + price)
   - Percentage uplift (+X% of base job)
   - Monthly recurring ($X/mo)
   - Quote only (no price, CTA target instead)
8. **Pricing input area — changes based on mode:**
   - **Tiered:** 3 collapsible blocks, each with name / price / "best for" / price note / feature checklist
   - **Range:** Low price + high price inputs side by side
   - **Per-extra:** Base price + per-extra add + extra-pricing range (e.g. $80–120)
   - **Pack-with-quantity:** Add/remove rows of {quantity, price, label}
   - **Percentage uplift:** Single number input + "of base job price" label
   - **Monthly recurring:** Monthly price + "what's included" textarea + cadence note
   - **Quote only:** "CTA label" input + "CTA target URL" input (e.g. `/commercial` or `/services/maps`)
9. **Turnaround range** — two inputs (low, high) + unit dropdown (days / weeks)
10. **Revisions included** — number input (default 2)
11. **Resolution / delivery** — short text
12. **Included grid editor** — repeatable list of {name, body} cards (matches the "Included" 6-card pattern on existing service detail pages)
13. **Examples editor** — 3 example cards: each with {title, meta, gradient picker}. Future enhancement: image upload.
14. **FAQ editor** — repeatable list of {question, markdown answer}
15. **Long description (optional)** — full markdown textarea for richer product page body

**Right sidebar (sticky):**

1. **Visibility panel:**
   - Status toggle: Draft / Published
   - Show on homepage strip toggle (only top N picked)
   - Featured order number (sort within bucket)
2. **Bundle linkage panel:**
   - "This product is part of a bundle" toggle
   - If on: dropdown to pick the partner product(s) and bundle uplift price
3. **SEO panel (collapsible):**
   - Meta title
   - Meta description
4. **Genre tags** — multi-select chip input (defer the actual genre list; field exists for future filling).
5. **Save buttons:**
   - "Publish" (gold pill)
   - "Save as draft" (burgundy outline)
   - "Preview" (placeholder for now)
6. **Danger zone** (edit mode only) — red-themed delete button at the bottom.

Match the visual treatment of `/admin/blog/[id]/edit` and `/admin/portfolio/[id]/edit` editors — they're the canonical reference for layout, spacing, color use.

---

### 4.8 USD-only disclaimer chip

**Purpose:** Tiny visual element that appears near any prominent price on the public site. Sets the expectation that the studio bills in USD without making it a hard-block to international customers.

**Required structure:**

- Pill-style chip, parchment-200 background, ink-500 text, very small (~0.6875rem), with optional info icon.
- Text: "USD · International cards billed at current exchange rate."
- Should fit cleanly under tier price displays, under "From $X" lines, and inside the order form near the budget step.
- Provide 2 variants: inline (very small, single-line) and block (slightly larger, sits as its own row).

---

## 5. Out of scope (do not redesign these)

The engineer handles these solo using existing patterns. Do not produce HTML for:

- `/services` index page (5 bucket cards — reuses existing card pattern)
- `/pricing` per-bucket section layout (reuses existing tier block pattern)
- `/order` Steps 2, 3, 4 (description, budget, contact, terms — all stay)
- Homepage strip update (3 cards, same shape, new content)
- `/faq` content updates
- `/terms` and `/refunds` policy updates
- `lib/constants.ts` value updates
- Portfolio module (untouched)
- Reviews module (untouched)
- Blog module (untouched)
- Admin shell, sidebar, header (untouched)
- Other admin pages (Inquiries, Orders, Customers, Waitlist, Settings)

---

## 6. Deliverable format

- One HTML file per surface, placed in `Claude Design Final/`.
- File naming: `Subscription.html`, `Commercial.html`, `Maps.html`, `Service Detail v2.html` (bucket template), `Order Form v2 Step 1.html` (partial — just step 1), `Admin Services List v2.html`, `Admin Service Editor v2.html`.
- Each file must be self-contained (linked to the existing `tokens.css` + `design-system.css` + `pages.css` — do not re-define tokens).
- HTML must be valid, semantic, and use the existing class naming conventions.
- Include 2-3 sentence comment blocks at the top of each file pointing at which Next.js route(s) the design maps to.
- Where copy is needed, write real copy (humanizer rules apply — no em-dashes, no rule-of-three, no AI-tell words). The engineer will keep the copy as-is unless the user explicitly asks for revisions.

---

## 7. Acceptance criteria

For each surface:

- ✅ Reuses existing tokens (no new colors invented)
- ✅ Matches existing typographic hierarchy (Cormorant for display, Caveat for accent subtitles, Inter for body, gold-700 eyebrows)
- ✅ Mobile-responsive at 360px / 768px / 1024px / 1440px
- ✅ Accessible: real `<button>` for buttons, real `<form>` for forms, alt text on placeholder images, keyboard-navigable tier toggles
- ✅ Includes the USD-only disclaimer wherever a price is displayed
- ✅ References real product names / prices from `Character-Art-Services-Brief.pdf` (with the amendments locked in section 1 of this doc)

For the admin editor specifically:

- ✅ Pricing mode selector visibly changes the pricing input area without page reload (use a hidden-class toggle in the mockup — JS not required, just the HTML/CSS states)
- ✅ Includes both "create" and "edit" states (or notes the difference clearly)
- ✅ Danger zone is visually distinct (burgundy-tinted border, separate from the main form)

---

## 8. Reference cheatsheet — what each new product type looks like in tier cards

| Product | Pricing mode | Card variant to use |
|---|---|---|
| Character Portrait (bust) | Tiered | 3 tier cards: $60 / $90 / $140 |
| Full-body Character | Tiered | 3 tier cards: $120 / $180 / $280 |
| Reference Sheet | Range | 1 card: "From $250 to $450" |
| Character + Token Bundle | Bundle add-on | 1 callout card: "+$25 added to any portrait tier" |
| Party Portrait | Tiered + per-extra | 2 tier cards ($350 / $600) + footnote: "+$80–120 per additional member" |
| Matched Party Set | Pack-with-qty | 1 card with 2 stacked rows: 4 portraits $220 / 6 portraits $320 |
| Action Scene | Range | 1 card: "From $400 to $900" |
| NPC Pack | Pack-with-qty | 1 card with 2 stacked rows: 5 NPCs $220 / 10 NPCs $400 |
| Monster / Creature | Range | 1 card: "From $90 to $250" |
| Item / Artifact | Pack-with-qty | 1 card with 2 stacked rows: single $30 / 6-pack $150 |
| Battle Map | Quote only | 1 card: "From $150 · request a quote" |
| World / Region Map | Quote only | 1 card: "From $300 · request a quote" |
| Single Token | Range | 1 card: "From $40 to $60" |
| Token Pack (5 originals) | Flat | 1 card: "$180 · 5 originals" |
| Convert client art to token | Flat | 1 card: "$25 per token" |
| Commercial licensing | % uplift | 1 callout card: "+40% of job price" |
| Publisher retainer | Quote only | 1 card: "Custom quote · monthly retainer" |
| Subscription · Companion | Monthly recurring | 1 card: "$30/month · 10 tokens + 2 NPCs" |
| Subscription · GM tier | Monthly recurring | 1 card: "$75/month · tokens + NPCs + 1 map" |

---

## 9. Questions / decisions for the designer to make (not the engineer)

Designer is empowered to decide:

- Specific icon choices for new product cards (use the existing inline SVG icon system from `Services.html`)
- Exact gradient hue rotations for example cards (use `.ds-ph-scene` base + rotate)
- Spacing rhythm between product blocks on bucket detail pages (suggestion: 5rem desktop, 3rem mobile)
- Whether to use accordion or always-expanded for the per-product blocks on bucket detail pages (suggestion: always expanded for first product, accordion for the rest — or all expanded if the page isn't too long)
- Animation choices for the order form bucket → product → tier reveal (suggestion: simple opacity + 8px translate, 200ms)

Designer should NOT decide:

- Pricing (locked in section 1 + brief PDF + section 8 cheatsheet)
- Policies (deposit, revisions, turnaround — locked in section 1)
- Which surfaces exist (locked in section 3)
- Brand colors / typography (locked in tokens.css)

---

*End of brief. Hand this file off to the Claude Design instance along with `Character-Art-Services-Brief.pdf` and read access to the project's `Claude Design Final/` folder, `tokens.css`, and `design-system.css`.*
