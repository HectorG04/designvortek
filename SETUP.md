# Project setup

Everything you need to get **Design Vortex** running from a fresh clone — whether you're on a new laptop, a teammate's machine, or claude.ai/code.

---

## TL;DR

```bash
git clone https://github.com/HectorG04/designvortek.git
cd designvortek
npm install
cp .env.local.example .env.local
# fill in the values in .env.local (see "Environment variables" below)
npm run dev
```

Site runs at **http://localhost:3000**.

---

## Prerequisites

- **Node.js 20+** (recommended Node 22). Verify with `node --version`.
- **npm** (bundled with Node).
- **Git** for version control.
- A **Supabase project** (already provisioned for this codebase — see [Database](#database)).
- A **Vercel project** if you want deploys. The main branch auto-deploys to designvortex.co.

---

## 1. Clone & install

```bash
git clone https://github.com/HectorG04/designvortek.git
cd designvortek
npm install
```

Installation takes ~1–2 minutes on a fresh machine. Lockfile pins all versions, so what you install is what we tested.

---

## 2. Environment variables

Copy the example and fill in real values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

| Variable | What it is | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project URL | Supabase Dashboard → your project → Project Settings → API → "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe to ship to browser) | Same page → "Project API keys" → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server-side ONLY, bypasses RLS) | Same page → "Project API keys" → `service_role` `secret` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | `https://designvortex.co` for production, `http://localhost:3000` for dev |
| `RESEND_API_KEY` | Optional · transactional email | resend.com → API keys |
| `FROM_EMAIL` | Optional · "from" address on outgoing mail | e.g. `hello@designvortex.co` |
| `ADMIN_NOTIFY_EMAIL` | Optional · where admin alerts go | e.g. `designvortex04@gmail.com` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Optional · Search Console token | Google Search Console |

**Security notes:**
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Never expose it to the browser. The codebase only uses it in server-side files (`lib/supabase/server.ts`, server actions, API routes).
- `.env.local` is gitignored. Never commit it.

---

## 3. Database

The project uses Supabase (Postgres + Auth + RLS). The database is **already provisioned and seeded** — you don't need to recreate it. Just connect to it via the env vars above.

### Schema

All schema lives in version-controlled migrations:

```
supabase/migrations/
  0002_portfolio_meta.sql        # portfolio_pieces.meta jsonb + GIN index
  0003_blog_posts.sql            # blog_posts table + RLS
  0004_services_restructure.sql  # services restructure (drop + recreate)
  0005_order_custom_adjustment.sql  # commission_orders.adjustment_* columns
```

(Migrations `0001` and earlier created the original tables: `commission_orders`, `inquiries`, `customers`, `waitlist`, `portfolio_pieces`, `reviews`, `slots`.)

### Applying migrations (only needed if creating a fresh Supabase project)

```sql
-- In Supabase Dashboard → SQL Editor, paste and run each migration in order.
```

Or with the Supabase CLI:
```bash
supabase db push
```

### Seeding data

If your Supabase instance is empty, run the seed scripts. They're **idempotent** — safe to re-run.

```bash
# Portfolio (24 pieces)
node scripts/seed-portfolio.mjs

# Reviews (30 reviews)
node scripts/seed-reviews.mjs

# Blog (7 posts)
npx tsx scripts/dump-blog-snapshot.ts   # dump snapshot to JSON
node scripts/seed-blog.mjs              # seed the table

# Services (19 products across 6 buckets)
npx tsx scripts/dump-services-snapshot.ts
node scripts/seed-services.mjs
```

Each seed script reads `.env.local` automatically via an inline parser.

---

## 4. Run dev

```bash
npm run dev
```

Visit **http://localhost:3000**. ISR cadence is 60s — admin edits propagate to public pages within a minute without a rebuild.

### Useful routes

**Public:**
- `/` · `/portfolio` · `/services` · `/services/character-work` · `/pricing` · `/order` · `/subscription` · `/commercial` · `/services/maps` · `/blog` · `/faq` · `/terms` · `/refunds`

**Admin** (auth required):
- `/admin/login` (sign in with Supabase auth account)
- `/admin/orders` · `/admin/portfolio` · `/admin/reviews` · `/admin/blog` · `/admin/services` · `/admin/customers` · `/admin/inquiries` · `/admin/waitlist` · `/admin/availability` · `/admin/media` · `/admin/settings`

---

## 5. Build & deploy

### Local production build

```bash
npm run build   # next build
npm run start   # next start, serves the production build on 3000
```

### Deploy to Vercel

The `main` branch is connected to Vercel and **auto-deploys on push**. Just:

```bash
git push origin main
```

Vercel build takes ~2–3 minutes. The same env vars from `.env.local` need to be set in Vercel Project Settings → Environment Variables.

### Live URL

- **Production:** https://designvortex.co
- **Preview deployments:** auto-generated for every push to a non-main branch

---

## 6. Project structure (high-level)

```
designvortek-next/
  _design-source/              # Canonical HTML/CSS design files (reference only)
    V2Updated/                 # May 23, 2026 handoff — 53 files, source of truth
    README.md                  # How to use this folder

  app/                         # Next.js App Router
    (public)/                  # Public routes
    admin/                     # Admin routes (auth-gated)
    api/                       # Route handlers (order / inquiry / waitlist / newsletter)
    layout.tsx                 # Root layout — next/font setup
    globals.css                # Tailwind v4 @theme tokens, @layer base resets

  components/                  # Shared React components
    admin/                     # AdminShell, StatusPill
    home/                      # Homepage sections (Hero, ServicesPreview, FAQ, etc.)
    layout/                    # SiteHeader, SiteFooter, PageHero
    ui/                        # Button, Container, Markdown, USDDisclaimer, etc.
    decor/                     # PaperTexture, CompassDivider

  lib/                         # Pure data + helpers
    portfolio-pieces.ts        # client-safe snapshot + types
    portfolio-pieces-server.ts # server-only Supabase fetchers
    reviews.ts / reviews-server.ts
    blog.ts / blog-server.ts
    services.ts / services-server.ts
    constants.ts               # NAV_LINKS, FEATURED_SERVICES, FOOTER_LINKS, HOMEPAGE_FAQ
    supabase/                  # client.ts, server.ts, middleware.ts, types.ts

  scripts/                     # Seed + dump scripts (idempotent, .env.local-aware)
  supabase/migrations/         # Version-controlled SQL migrations
  public/                      # Static assets — images, fonts, og-default.png

  Services Brief/              # Original pricing brief + design handoff brief

  proxy.ts                     # Edge middleware (auth + rate limiting)
  next.config.ts
  tsconfig.json
  package.json
```

---

## 7. Working from claude.ai/code

To use this project from claude.ai's web Claude Code:

1. **Sign in to claude.ai** with the account that owns this repo's GitHub permissions
2. **Authorize GitHub** in Claude's connectors → grant access to `HectorG04/designvortek`
3. **Open the project** in a Claude Code workspace
4. **Add env vars** in the workspace settings (same list as above)
5. **You're set** — `npm install`, `npm run dev`, migrations, seed scripts all work the same

### Things to know

- Supabase is already cloud-hosted — accessible from any Claude environment
- Migrations are in `supabase/migrations/` so they travel with the code
- The `_design-source/` folder ships with the repo, so design audits work the same
- `.env.local` is per-environment — don't try to commit it
- ISR cache lives on Vercel, not your dev box, so edits made via claude.ai/code will show up on the live site within 60s of a push

---

## 8. Common tasks

### Add a new portfolio piece
1. Drop the image in `public/images/portfolio/` (use a webp, ~150 KB target)
2. Add a row in `lib/portfolio-pieces.ts` snapshot
3. Run `node scripts/seed-portfolio.mjs` to push to Supabase
4. Or just add directly via `/admin/portfolio/new`

### Add a new blog post
- Via admin: `/admin/blog/new` (recommended)
- Via code: add to `lib/blog.ts` snapshot, then run dump + seed

### Add a new service / product
- Via admin: `/admin/services/new/edit` (recommended)
- Via code: add to `lib/services.ts` snapshot, then dump + seed

### Update pricing globally
1. Edit `lib/services.ts` for snapshot fallback
2. Edit `lib/constants.ts` for homepage strip + meta description
3. Edit `app/(public)/pricing/page.tsx` for the per-bucket display
4. Update DB via admin or seed script

### Apply a new DB migration
1. Write the SQL in `supabase/migrations/0006_*.sql` (next number)
2. Paste it into Supabase Dashboard → SQL Editor and run
3. Update `lib/supabase/types.ts` to reflect new columns
4. Commit both

---

## 9. Troubleshooting

**`Module not found` after pulling new changes**
→ Re-run `npm install` (lockfile may have updated dependencies)

**`Failed to connect to Supabase`**
→ Check `.env.local` exists and has correct keys; check Supabase project isn't paused

**`Unauthorized` on admin pages**
→ Make sure you're signed in at `/admin/login` with a real Supabase auth account

**ISR not picking up admin edits**
→ Wait 60s, or hard-reload (Ctrl+F5). Pages have `export const revalidate = 60`

**Build fails on TypeScript**
→ Run `npx tsc --noEmit` to see errors. Common cause: schema change without updating `lib/supabase/types.ts`

**Vercel deploy fails on env vars**
→ Vercel Project Settings → Environment Variables. The same variables from `.env.local` need to be set there for the build + runtime

---

## 10. Conventions to keep

- **No bare element selectors** in CSS — always wrap in `@layer base { ... }` so Tailwind utilities outrank them
- **next/font** Cormorant Garamond declares `style: ['normal', 'italic']` so the italic face actually loads
- **Italic `<em>` in display headings** uses parent className `[&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700` (or `text-gold-glow` on dark backgrounds)
- **Brand tokens** come from `tokens.css` (committed in `_design-source/V2Updated/`) and are mirrored in `app/globals.css` via the Tailwind v4 `@theme` block. Never invent new colors / spacings / fonts
- **Literal port** convention — every page that came from a design HTML has a header comment noting which file it was ported from. Keep this convention when adding pages

That's the whole thing. Welcome aboard.
