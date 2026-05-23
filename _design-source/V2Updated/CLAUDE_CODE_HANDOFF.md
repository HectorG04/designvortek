# DesignVortek — Claude Code Handoff

> **Status:** Design phase complete. Ready to build.
> **Stack target:** Next.js 16 (App Router) · Tailwind v4 · Framer Motion · Supabase · Vercel
> **Source of truth:** This document + the HTML / CSS files in this directory

---

## 0 · TL;DR for Claude Code

You are building a **premium art commission studio website + admin CMS** in Next.js. The brand is "illuminated manuscript meets modern luxury portfolio" — warm parchment, burgundy CTAs, gold accents, occasional dark "tome" sections.

Everything is designed and ready to lift into React:
- **3 CSS token files** define the entire design language
- **19 public-site HTML pages** show every screen at hi-fi
- **17 admin CMS HTML pages** show every CRUD surface
- **All navigation is wired** — no broken links, no placeholder routes

Your job: port the HTML to React components, keep the CSS tokens, add real data via Supabase, deploy on Vercel.

---

## 1 · File inventory

### Design system (port these tokens 1:1)
| File | Purpose |
|---|---|
| `tokens.css` | All design tokens as CSS custom properties (colors, fonts, spacing, motion). **Map to Tailwind v4 `@theme`.** |
| `design-system.css` | Reusable component classes (`dv-btn`, `dv-input`, `dv-portfolio-card`, etc.). Each `dv-*` class = one React component. |
| `homepage.css` | Homepage-only layout (hero, persona rows, FAQ panel). |
| `order-form.css` | Multi-step order form chrome. |
| `pages.css` | Shared page chrome for Phase-4/5 pages (header, footer, section heads, CTA strips). |
| `admin.css` | All admin CMS styles (sidebar, tables, status pills, forms). |
| `Design System.html` | **Visual reference document** — every color, type scale, component, with specs. Open this when in doubt. |

### Public site (19 pages → Next.js routes)
| HTML file | Next.js route | Notes |
|---|---|---|
| `Homepage.html` | `/` | Hero (dark tome), services, personas (SEO), portfolio strip, process, testimonials, blog preview, availability, FAQ accordion, CTA closer |
| `Portfolio.html` | `/portfolio` | Sticky filter bar, masonry grid, Load More |
| `Portfolio Detail.html` | `/portfolio/[slug]` | Sticky info panel, sketch/block/revision thumbs, related grid |
| `Services.html` | `/services` | 5-card grid + comparison table |
| `Service Detail.html` | `/services/[slug]` | Hero, included list, style options, 3 tiers, examples, service FAQ |
| `Pricing.html` | `/pricing` | Per-service tiers, add-ons, custom-quote block |
| `Availability.html` | `/availability` | 3-month slot calendar + waitlist signup |
| `Process.html` | `/process` | 4-step detailed flow + timeline |
| `About.html` | `/about` | Artist intro, values, stats, BTS gallery |
| `Blog.html` | `/blog` | Featured post + category chips + grid + newsletter |
| `Blog Post.html` | `/blog/[slug]` | Drop cap, pull quotes, reading progress, author card, related |
| `Reviews.html` | `/reviews` | Rating summary card + filter chips + 9-card grid |
| `FAQ.html` | `/faq` | 5 categories, 22 questions, native `<details>` (ready for FAQPage schema) |
| `Contact.html` | `/contact` | 4 method cards + simple form |
| `Order Form.html` | `/order` | 4-step form with sticky reassurance sidebar + localStorage draft |
| `Order Success.html` | `/order/success` | Post-submit confirmation |
| `Privacy.html` | `/privacy` (also serves as template for `/terms`, `/refunds`) | Narrow legal layout |
| `404.html` | not-found page | Centered with brand orbs |

### Admin CMS (17 screens → `/admin/*` routes, Supabase Auth protected)
| HTML file | Next.js route |
|---|---|
| `Admin Login.html` | `/admin/login` |
| `Admin Dashboard.html` | `/admin` |
| `Admin Orders.html` | `/admin/orders` |
| `Admin Order Detail.html` | `/admin/orders/[id]` |
| `Admin Portfolio.html` | `/admin/portfolio` |
| `Admin Portfolio Editor.html` | `/admin/portfolio/new` & `/admin/portfolio/[id]/edit` |
| `Admin Blog.html` | `/admin/blog` |
| `Admin Blog Editor.html` | `/admin/blog/new` & `/admin/blog/[id]/edit` |
| `Admin Services.html` | `/admin/services` |
| `Admin Service Editor.html` | `/admin/services/[id]/edit` |
| `Admin Reviews.html` | `/admin/reviews` (inline approve/feature/hide) |
| `Admin Availability.html` | `/admin/availability` |
| `Admin Inquiries.html` | `/admin/inquiries` |
| `Admin Customers.html` | `/admin/customers` |
| `Admin Customer Detail.html` | `/admin/customers/[id]` |
| `Admin Media.html` | `/admin/media` |
| `Admin Settings.html` | `/admin/settings` (tabs: site, profile, SMTP, SEO, legal) |

---

## 2 · Design tokens → Tailwind v4

### `app/globals.css`
```css
@import "tailwindcss";

@theme {
  /* === Parchment (surfaces) === */
  --color-parchment-50:  #FBF6E9;   /* page bg */
  --color-parchment-100: #F5EBD3;   /* card */
  --color-parchment-200: #EDDDB8;   /* section variation */
  --color-parchment-300: #E0CC9A;
  --color-parchment-400: #C8B07A;

  /* === Ink (text) === */
  --color-ink-900: #1E1408;   /* primary text */
  --color-ink-700: #3A2A1C;   /* body */
  --color-ink-500: #6B5A48;   /* muted */
  --color-ink-400: #9A8870;
  --color-ink-300: #C2B59A;

  /* === Burgundy (primary CTA) === */
  --color-burgundy-900: #3E1218;
  --color-burgundy-700: #6B1F2A;   /* default */
  --color-burgundy-500: #8A2A35;   /* hover */
  --color-burgundy-100: #F3D6D9;

  /* === Gold (accent) === */
  --color-gold-700: #9A7232;
  --color-gold-500: #C9A04A;
  --color-gold-300: #E8C880;
  --color-gold-100: #F8EBC4;
  --color-gold-glow: #D4A24C;   /* for dark sections */

  /* === Forest (secondary accent) === */
  --color-forest-700: #1F4D3A;
  --color-forest-500: #3D7256;

  /* === Tome (dark sections) === */
  --color-tome-950: #1A130C;
  --color-tome-900: #251A10;
  --color-tome-800: #3A2A1C;
  --color-cream-50:  #F4EAD3;
  --color-cream-200: #C8B89A;

  /* === System === */
  --color-success: #4A6B3A;
  --color-error:   #8A2A2A;

  /* === Fonts === */
  --font-display: var(--font-cormorant), Georgia, serif;
  --font-body:    var(--font-inter), system-ui, sans-serif;
  --font-accent:  var(--font-caveat), cursive;

  /* === Radius === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
}
```

### Fonts via `next/font/google`
```ts
// app/layout.tsx
import { Cormorant_Garamond, Inter, Caveat } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400","500","600","700"],
  style: ["normal","italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["400","500","600","700"],
  variable: "--font-inter",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400","700"],
  variable: "--font-caveat",
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${caveat.variable}`}>
      <body className="font-body bg-parchment-50 text-ink-900">{children}</body>
    </html>
  );
}
```

---

## 3 · Component → file mapping

Lift each `dv-*` class in `design-system.css` into a React component:

| `.dv-*` class | Component path |
|---|---|
| `.dv-btn` (+ variants) | `components/ui/Button.tsx` |
| `.dv-input` `.dv-textarea` `.dv-select` `.dv-check` | `components/ui/Field.tsx` |
| `.dv-portfolio-card` | `components/cards/PortfolioCard.tsx` |
| `.dv-service-card` | `components/cards/ServiceCard.tsx` |
| `.dv-testimonial-card` | `components/cards/TestimonialCard.tsx` |
| `.dv-blog-card` | `components/cards/BlogCard.tsx` |
| `.dv-slot-card` + `.dv-slot` | `components/SlotWidget.tsx` |
| `.dv-pill` `.dv-chip` | `components/ui/Pill.tsx` `Chip.tsx` |
| `.dv-modal` + `.dv-toast` | Use Radix UI Dialog + Toast, themed |
| `.ds-compass-divider` | `components/decor/CompassDivider.tsx` |
| `.ds-corner` (4 gold corners) | `components/decor/GoldCorners.tsx` |
| `.hp-header` / `.pg-header` | `components/layout/SiteHeader.tsx` (scroll-aware) |
| `.pg-footer` | `components/layout/SiteFooter.tsx` |
| `.adm-sidebar` + `.adm-nav` | `components/admin/AdminSidebar.tsx` |
| `.adm-table` | `components/admin/DataTable.tsx` |
| `.adm-status` (status pills) | `components/admin/StatusPill.tsx` |
| `.adm-stat` | `components/admin/StatCard.tsx` |

**Decorative principle:** only 2 flourishes in the system — compass rose dividers (between sections) and gold corner flourishes (on featured portfolio cards). Don't add more.

---

## 4 · Recommended libraries

| Library | Use |
|---|---|
| **Framer Motion** | Hero stagger animations, section reveals, hover lifts, modal enter/exit, slot pulse |
| **Radix UI** | Dialog, Dropdown, Tabs, Toast — skin to brand using `dv-*` styles |
| **Lucide React** | All icons. Set `strokeWidth={1.5}` globally. |
| **Tiptap** or **Lexical** | Blog editor rich text (see `Admin Blog Editor.html` for toolbar reference) |
| **react-hook-form + zod** | Multi-step order form validation (per-step schema) |
| **next/image** | Every image, lazy-loaded below fold, WebP + JPG fallback |
| **@supabase/ssr** | Auth + DB |
| **Resend** | Transactional email (quote, confirmation, status updates) |
| **Stripe** | Payments (25% deposit + final 75%) |

---

## 5 · Supabase schema sketch

```sql
-- ORDERS (commission briefs + lifecycle)
create table orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,            -- DV-YYYY-MMDD-XXXX
  customer_id uuid references customers(id),
  service_slug text not null,                -- character-art | vtt-token | ...
  tier text,                                  -- standard | deluxe | premium
  style text,                                 -- painterly | anime | ...
  description text not null,
  references jsonb default '[]',              -- string[]
  deadline date,
  quantity text,
  notes text,
  budget_range text,
  source text,                                -- Reddit | Twitter | ...
  status text not null default 'pending',     -- pending | reviewing | in_progress | delivered | closed
  quote_amount numeric,
  internal_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CUSTOMERS (deduped from orders by email)
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  source text,
  tags text[] default '{}',
  internal_notes text,
  created_at timestamptz default now()
);

-- PORTFOLIO PIECES
create table portfolio_pieces (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,                     -- character-art | vtt-tokens | ...
  style text,
  description text,
  tags text[] default '{}',
  images jsonb not null default '[]',         -- [{url, alt, order}]
  client_first_name text,
  specs jsonb,                                -- {tools, hours, days, resolution, revisions, delivered_at}
  status text default 'draft',                -- draft | published
  featured boolean default false,
  meta_title text,
  meta_description text,
  alt_text text,
  order_id uuid references orders(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- BLOG POSTS
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text,                              -- guides | behind-the-scenes | dnd | studio-news
  body_html text,                             -- rich-text editor output
  featured_image_url text,
  excerpt text,
  read_minutes int,
  tags text[] default '{}',
  status text default 'draft',                -- draft | published | scheduled
  scheduled_for timestamptz,
  published_at timestamptz,
  meta_title text,
  meta_description text,
  featured boolean default false,
  views int default 0,
  author_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- REVIEWS
create table reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  order_id uuid references orders(id),
  service_slug text,
  rating int check (rating >= 1 and rating <= 5),
  body text not null,
  status text default 'pending',              -- pending | approved | featured | hidden
  created_at timestamptz default now()
);

-- SLOTS (5 per month)
create table slots (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  month int not null check (month >= 1 and month <= 12),
  slot_number int not null check (slot_number >= 1 and slot_number <= 5),
  status text default 'open',                 -- open | booked | held | unavailable
  order_id uuid references orders(id),
  note text,
  unique (year, month, slot_number)
);

-- WAITLIST
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  service_slug text,
  for_month text,                             -- 'June 2026'
  position int,
  joined_at timestamptz default now()
);

-- INQUIRIES (contact form messages)
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text,
  message text not null,
  status text default 'unread',               -- unread | read | archived
  reply_body text,
  replied_at timestamptz,
  created_at timestamptz default now()
);

-- SERVICES (5 fixed, content-editable)
create table services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  caveat_subtitle text,
  description text,
  features jsonb default '[]',                -- string[]
  tiers jsonb default '[]',                   -- [{name, price, revisions, best_for}]
  hero_image_url text,
  turnaround_min_days int,
  turnaround_max_days int,
  is_active boolean default true,
  meta_title text,
  meta_description text,
  display_order int
);

-- MEDIA library
create table media (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  url text not null,
  size_bytes int,
  width int,
  height int,
  mime_type text,
  used_in jsonb default '[]',                 -- [{type:'portfolio|blog', id}]
  uploaded_at timestamptz default now()
);

-- SETTINGS (single row)
create table site_settings (
  id int primary key default 1,
  site_name text default 'DesignVortek',
  tagline text,
  logo_url text,
  favicon_url text,
  footer_text text,
  socials jsonb default '{}',                 -- {instagram, twitter, artstation}
  public_email text,
  slots_per_month int default 5,
  deposit_pct int default 25,
  response_window_hours int default 48,
  accepting_commissions boolean default true,
  smtp_provider text default 'resend',
  smtp_from_email text,
  smtp_from_name text,
  default_meta_title text,
  default_meta_description text,
  analytics_id text,
  check (id = 1)
);
```

**Row-level security:** all admin tables `where auth.role() = 'admin'`. Public reads on `portfolio_pieces (status='published')`, `blog_posts (status='published')`, `reviews (status in ('approved','featured'))`, `services (is_active=true)`.

---

## 6 · API routes (App Router)

```
app/api/
├── orders/route.ts                POST (public submit) · GET (admin list)
├── orders/[id]/route.ts            GET · PATCH (status, quote) · DELETE
├── orders/[id]/email/route.ts      POST (send templated email)
├── portfolio/route.ts              GET (public published) · POST (admin)
├── portfolio/[id]/route.ts         GET · PATCH · DELETE
├── blog/route.ts                   GET · POST (admin)
├── blog/[id]/route.ts              GET · PATCH · DELETE
├── reviews/route.ts                GET (public approved) · POST (admin moderate)
├── inquiries/route.ts              POST (public contact form) · GET (admin)
├── slots/route.ts                  GET (public 3 months) · PATCH (admin set state)
├── slots/reserve/route.ts          POST (public — creates held slot + order)
├── waitlist/route.ts               POST (public join) · GET (admin)
├── media/route.ts                  POST (upload to Supabase Storage) · GET (admin)
├── stripe/webhook/route.ts         POST (deposit/balance events → update order)
└── auth/[...nextauth]/route.ts     Supabase Auth handlers
```

Edge runtime for public reads. Node runtime for Stripe + Resend webhooks.

---

## 7 · Critical UX behaviors to preserve

These are deliberate decisions in the design — keep them in the React build:

1. **Slot widget pulses gently** (1.0 → 1.05, 1.5s loop) on open slots only. Stops on hover. Use Framer Motion `animate`/`whileHover`.
2. **Section reveals trigger once** on scroll-in (fade + 20px translate-up). Use `useInView({ once: true })`.
3. **Order form persists draft** in localStorage. See `Order Form.html` JS for the structure — port to a `useLocalStorageForm` hook with react-hook-form.
4. **Hero stagger:** thumb grid items animate in 80–120ms apart; the diagonal pair (2nd and 3rd thumbs) starts 36px lower for asymmetric rhythm.
5. **Header is scroll-aware:** transparent on dark hero, becomes opaque parchment with backdrop-blur after 20px scroll.
6. **Blog Post reading progress bar** at top of page — keep it; users love it.
7. **Admin tables: row click = navigate to detail.** Cells with onclick handlers (action buttons) call `event.stopPropagation()`.
8. **Respect `prefers-reduced-motion`** — disable scroll animations, keep functional ones (loading spinners). Already handled in tokens.css.

---

## 8 · SEO

- All slugs use lowercase hyphens (`/portfolio/lyra-vexweaver-tiefling-sorceror`).
- Every page exports `generateMetadata` with title (50–60ch), description (140–160ch), OpenGraph image, canonical URL, twitter card.
- **Structured data (JSON-LD)** on:
  - Homepage: `Organization`, `WebSite` with `SearchAction`
  - Portfolio detail: `CreativeWork`, `ImageObject`
  - Blog post: `Article` + `Person`
  - FAQ page: `FAQPage` (the `<details>` accordion in `FAQ.html` is ready for this)
  - Reviews: `AggregateRating` + array of `Review`
  - All pages: `BreadcrumbList`
- **Sitemap:** dynamic `app/sitemap.ts` pulling portfolio + blog slugs.
- **Robots:** `app/robots.ts` — disallow `/admin/*` and `/order/success`.
- **Rendering strategy:**
  - SSG: homepage, services, process, about, FAQ, legal pages
  - ISR (revalidate 1h): blog index + posts
  - ISR (revalidate 24h): portfolio
  - Dynamic: `/admin/*`, `/order`

---

## 9 · Build phases (recommended order)

1. **Setup** — Next.js scaffold, `app/globals.css` with `@theme`, fonts via `next/font`, Supabase client, shadcn/ui-style base components from `dv-*` classes.
2. **Public layout** — SiteHeader (scroll-aware) + SiteFooter + page shell wrappers. Get Homepage rendering with all sections.
3. **Static content pages** — About, Process, Pricing, Privacy, FAQ, Contact, 404. No DB yet — content lives in MDX/TS for now.
4. **Portfolio + Services + Blog** — schema + admin editors first, then public read pages.
5. **Order Form** — multi-step with zod schemas, localStorage draft, submit to `/api/orders`, email confirmation via Resend.
6. **Availability + Slot widget** — public 3-month view + reservation modal + admin month management.
7. **Reviews + Inquiries** — moderation flow in admin + public reviews page.
8. **Settings + Media library** — admin config + Supabase Storage integration.
9. **Stripe** — deposit/balance flow, webhook handling.
10. **Polish + SEO** — structured data, sitemap, OG images, Vercel deploy.

---

## 10 · Anti-patterns to avoid (per brand brief)

- ❌ Pure black backgrounds (always `ink-900` or `tome-950`)
- ❌ Emojis as icons (use Lucide, stroke-width 1.5)
- ❌ Pitch-black dark mode default (parchment is the brand)
- ❌ Fleur-de-lis bullets, rune numerals, hand-drawn underlines, dice as bullets, scroll-shaped buttons
- ❌ AI/generative imagery talk on customer-facing copy (the entire brand position is "by hand, by humans")
- ❌ Hourly pricing UI (everything is flat-rate by tier — already designed this way)

---

## 11 · Brand voice reminder

| Trait | Example |
|---|---|
| Warm | "We'd love to bring your character to life" (not "Schedule a consultation") |
| Confident | "Commissions from $80" (not "Affordable prices") |
| Insider | "Tieflings &amp; half-orcs welcome" |
| Clear | "7–14 day turnaround. 2 revisions included." |
| Personal | "We" / "the studio" / "I" (never "the team", "platform") |

Avoid: "synergy / leverage / unlock", exclamation marks, emojis, filler.

---

## 12 · What's NOT included in this design phase

The following exist in the brief but were deliberately not mocked — they're either out of scope, integration-only, or content the user will provide:

- Real portfolio imagery (placeholders use tonal gradients with monospace labels)
- Real testimonials and customer names (demo content shown)
- Stripe checkout pages (use Stripe-hosted checkout — no design needed)
- Email templates (transactional via Resend — write per `Order Form.html` confirmation copy)
- Analytics integration (brief says "later — Plausible/Vercel embed")
- 2FA, password reset flow (Supabase Auth UI defaults are fine)

---

## 13 · Open this when you're stuck

1. **Don't know what a thing looks like?** → Open `Design System.html` — it has every component with specs.
2. **Don't know how a page is structured?** → Open the corresponding HTML file. It's authoritative.
3. **Token value missing?** → Check `tokens.css`. If not there, it doesn't exist in the system.
4. **Component pattern unclear?** → Search the `.dv-*` class in `design-system.css`.
5. **Admin pattern unclear?** → Search the `.adm-*` class in `admin.css`.

---

**End of handoff document.**

Build well. Ship clean. Every brushstroke matters.
