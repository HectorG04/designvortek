# Deployment Guide

End-to-end setup: **Supabase → GitHub → Vercel → GoDaddy DNS**.

Estimated time: ~30 minutes total.

---

## Step 1 — Supabase Project Setup (10 min)

### 1.1 Create the project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Settings:
   - **Name:** `design-vortex`
   - **Database password:** Generate a strong one — **save it somewhere safe** (you'll need it later if you migrate)
   - **Region:** Pick closest to your customers (US East, EU West, etc.)
4. Click **Create new project** and wait ~2 minutes for provisioning

### 1.2 Run the schema

1. In your Supabase project, click **SQL Editor** (left sidebar)
2. Click **New query**
3. Open the file `supabase/schema.sql` in your project — copy ALL contents
4. Paste into the SQL Editor and click **Run**
5. You should see "Success. No rows returned" — that means tables were created
6. Repeat for `supabase/policies.sql`:
   - New query → paste contents of `policies.sql` → Run

### 1.3 Verify tables exist

1. Click **Table Editor** (left sidebar)
2. You should see: `waitlist`, `commission_orders`, `portfolio_pieces`, `blog_posts`, `services`, `reviews`, `slots`, `inquiries`

### 1.4 Get your API keys

1. Click **Project Settings** (gear icon at bottom left) → **API**
2. You'll see three values you need:
   - **Project URL** → goes to `NEXT_PUBLIC_SUPABASE_URL`
   - **`anon` `public` key** → goes to `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **`service_role` `secret` key** → goes to `SUPABASE_SERVICE_ROLE_KEY` *(NEVER expose this client-side)*

### 1.5 Create your admin user

1. **Authentication** (left sidebar) → **Users**
2. Click **Add user** → **Create new user**
3. Enter your email + a strong password (save it)
4. Check **Auto Confirm User**
5. Click **Create user**

This is the account you'll use to log into `/admin/login`.

### 1.6 Set up local env

1. In your project directory, copy the template:
   ```powershell
   Copy-Item .env.local.example .env.local
   ```
2. Open `.env.local` and paste in the three Supabase values from step 1.4
3. Test locally: `npm run dev` → visit `http://localhost:3000` → submit a waitlist email → check Supabase Table Editor → `waitlist` table — your entry should be there

---

## Step 2 — GitHub Repository (5 min)

### 2.1 Initialize the repo locally

From inside the `designvortek-next/` directory:

```powershell
git init
git add .
git commit -m "Initial commit: coming soon + Supabase + admin scaffold"
git branch -M main
```

### 2.2 Create the repo on GitHub

1. Go to [github.com/new](https://github.com/new) (logged in as **HectorG04**)
2. Settings:
   - **Repository name:** `designvortek` (or whatever you prefer)
   - **Private** (recommended — this includes business code)
   - **Do NOT** check "Add README" or "Add .gitignore" (we already have them)
3. Click **Create repository**

### 2.3 Push your code

GitHub will show you commands. Use these:

```powershell
git remote add origin https://github.com/HectorG04/designvortek.git
git push -u origin main
```

If git asks for credentials, use a [Personal Access Token](https://github.com/settings/tokens) as the password (not your GitHub password).

---

## Step 3 — Vercel Deployment (5 min)

### 3.1 Import the project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Find `HectorG04/designvortek` → click **Import**
4. Settings:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

### 3.2 Add environment variables

In the "Environment Variables" section before deploying, add these (paste in from your `.env.local`):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-ref.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...your anon key` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...your service role key` |
| `NEXT_PUBLIC_SITE_URL` | `https://designvortek.com` |

Apply to **Production**, **Preview**, and **Development**.

### 3.3 Deploy

Click **Deploy** → wait ~2 minutes.

You'll get a temporary URL like `designvortek-xxx.vercel.app`. Visit it — your coming soon page should be live.

---

## Step 4 — GoDaddy DNS → Vercel (10 min)

### 4.1 Add domain in Vercel

1. In your Vercel project → **Settings** → **Domains**
2. Type `designvortek.com` → click **Add**
3. Vercel will show you DNS records you need to add at GoDaddy

You'll typically need:
- **A record:** `@` → `76.76.21.21` (Vercel's IP)
- **CNAME:** `www` → `cname.vercel-dns.com`

*(Exact values shown in your Vercel dashboard — use what they show, not the example here.)*

### 4.2 Update DNS at GoDaddy

1. Log into [GoDaddy](https://godaddy.com)
2. **My Products** → find `designvortek.com` → **DNS** (or "Manage DNS")
3. **Delete** any existing A records or CNAMEs pointing elsewhere (back them up first if unsure)
4. **Add** the records Vercel showed you:
   - Type: **A** · Name: `@` · Value: `76.76.21.21` · TTL: 600
   - Type: **CNAME** · Name: `www` · Value: `cname.vercel-dns.com` · TTL: 600
5. **Save**

### 4.3 Wait for DNS propagation

- Usually 5–30 minutes
- Sometimes up to 48 hours (rare)
- Check status: [whatsmydns.net](https://www.whatsmydns.net/#A/designvortek.com)
- Vercel will auto-detect propagation and provision SSL — when ready, your domain shows ✅ in the Vercel dashboard

### 4.4 Set canonical domain

In Vercel domains settings, mark `designvortek.com` as the primary (or `www.designvortek.com`, whichever you prefer). The other will redirect to the canonical one.

---

## Step 5 — Verify Everything Works (5 min)

Once your domain is live:

- [ ] `https://designvortek.com` → coming soon page loads
- [ ] SSL padlock is green (no warnings)
- [ ] Submit a waitlist email → check Supabase `waitlist` table → entry exists
- [ ] `https://designvortek.com/sitemap.xml` → returns valid XML
- [ ] `https://designvortek.com/robots.txt` → shows the robots rules
- [ ] `https://designvortek.com/admin/login` → login page loads
- [ ] Sign in with your admin user → redirected to `/admin` dashboard
- [ ] `https://designvortek.com/random-page` → 404 page loads (parchment styled)

---

## Step 6 — Optional: Email & SEO Setup

### 6.1 Resend (for transactional emails — later)

1. Sign up at [resend.com](https://resend.com)
2. Add domain `designvortek.com` and verify via DNS records (TXT entries)
3. Create an API key
4. Add to Vercel env vars: `RESEND_API_KEY`, `FROM_EMAIL`, `ADMIN_NOTIFY_EMAIL`
5. Redeploy (Vercel → Deployments → ⋯ → Redeploy)

### 6.2 Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: `https://designvortek.com`
3. Verify via DNS TXT record at GoDaddy
4. Submit sitemap: `https://designvortek.com/sitemap.xml`

### 6.3 Vercel Analytics (free, lightweight)

1. In Vercel project → **Analytics** tab → **Enable**
2. No code changes needed — auto-tracks Web Vitals

---

## Future Deploys

After the initial setup, deploys are automatic:

```bash
git add .
git commit -m "your message"
git push
```

Vercel auto-deploys every push to `main`. Preview deploys are created for every branch / PR.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `supabaseUrl is required` build error | Env vars not set in Vercel. Add them under Project Settings → Environment Variables, then redeploy. |
| `Failed to fetch` on waitlist submit | Service role key wrong or RLS policies not applied. Re-check `SUPABASE_SERVICE_ROLE_KEY` value and run `policies.sql` again. |
| `/admin/login` redirects in a loop | Cookies not setting correctly. Make sure your domain is over HTTPS and Supabase Site URL is set: Supabase dashboard → Authentication → URL Configuration → add `https://designvortek.com` as Site URL. |
| DNS not propagating | Wait longer (up to 48h). Check [whatsmydns.net](https://whatsmydns.net). |
| SSL not provisioning | Make sure A record points to exactly Vercel's IP. Remove conflicting AAAA records. |

---

## What's Next

Once designs land from Claude Designs:
1. Replace coming soon page with real homepage
2. Build out all public pages (portfolio, services, pricing, etc.)
3. Build admin CMS (orders, portfolio manager, blog editor, etc.)
4. Wire up Resend for order confirmation emails
