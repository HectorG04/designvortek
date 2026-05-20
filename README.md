# Design Vortex

Premium art commission studio — Next.js 16 + Supabase + Vercel.

> **Status:** Coming soon. Public homepage shows a waitlist capture page. Admin scaffolding exists but is intentionally minimal until visual designs land.

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **Animation:** [Framer Motion](https://motion.dev)
- **Database / Auth:** [Supabase](https://supabase.com)
- **Email:** [Resend](https://resend.com)
- **Hosting:** [Vercel](https://vercel.com)
- **Fonts:** Cormorant Garamond (display) · Inter (body) · Caveat (accent)

---

## Project Structure

```
designvortek-next/
├── app/
│   ├── (public)/              Route group — marketing site
│   │   ├── _components/       Page-local components (coming soon)
│   │   ├── layout.tsx         Public layout
│   │   └── page.tsx           Homepage (coming soon page)
│   ├── admin/                 Admin CMS (auth-protected via middleware)
│   │   ├── login/             Sign-in page
│   │   ├── layout.tsx
│   │   └── page.tsx           Dashboard
│   ├── api/                   Server API routes
│   │   └── waitlist/          Waitlist signup endpoint
│   ├── globals.css            Design tokens (parchment palette)
│   ├── layout.tsx             Root layout (fonts, metadata)
│   ├── sitemap.ts             Dynamic sitemap.xml
│   ├── robots.ts              robots.txt
│   └── not-found.tsx          404 page
├── lib/
│   ├── supabase/
│   │   ├── client.ts          Browser Supabase client
│   │   ├── server.ts          Server + admin (service role) clients
│   │   ├── middleware.ts      Auth session refresh helper
│   │   └── types.ts           Database types
│   └── utils.ts               `cn()` helper
├── supabase/
│   ├── schema.sql             Database DDL (run once in Supabase)
│   └── policies.sql           Row Level Security policies
├── middleware.ts              Route protection for /admin/*
├── .env.local.example         Environment variable template
├── DEPLOYMENT.md              Step-by-step Vercel + Supabase + DNS setup
└── README.md                  This file
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.local.example .env.local
# (PowerShell) Copy-Item .env.local.example .env.local

# 3. Fill in your Supabase keys (see DEPLOYMENT.md)

# 4. Run dev server
npm run dev
# → http://localhost:3000
```

---

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for full step-by-step:
1. Supabase project + schema setup
2. GitHub repo
3. Vercel deployment
4. GoDaddy DNS → Vercel
5. Custom domain SSL
6. Environment variables

---

## Database

The Supabase schema is at [`supabase/schema.sql`](./supabase/schema.sql). It defines:

- **`waitlist`** — coming-soon email capture
- **`commission_orders`** — full commission inquiry pipeline
- **`portfolio_pieces`** — gallery
- **`blog_posts`** — articles
- **`services`** — service catalog
- **`reviews`** — testimonials
- **`slots`** — slot availability widget data
- **`inquiries`** — contact form messages

RLS policies are in [`supabase/policies.sql`](./supabase/policies.sql).

---

## License

Private / proprietary. © Design Vortex.
