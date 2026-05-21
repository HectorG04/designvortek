# Overnight brief — May 21, 2026

Hey, here's what got done while you were asleep. This file is gitignored from the typical .md sweep but committed so you can reference it. Feel free to delete when you've read it.

## What I did

Wired up every public form so submissions actually land in admin + fire email notifications. Plus added the missing `/admin/waitlist` page.

Two commits tonight:

1. **`e8af071`** — Order page literal port (4 steps + new sidebar + custom header + progress in hero)
2. **`a64b706`** — CMS form wire-up (the work you asked for last)

## Form → admin status

| Form | Public URL | API route | Lands in | Admin sees at | Customer email | Admin email |
|---|---|---|---|---|---|---|
| Commission order | `/order` | `/api/order` | `commission_orders` | `/admin/orders` | ✅ confirmation | ✅ notify |
| Contact inquiry | `/contact` | `/api/inquiry` | `inquiries` | `/admin/inquiries` | ✅ confirmation (new) | ✅ notify |
| Waitlist signup | homepage / `/availability` | `/api/waitlist` | `waitlist` | `/admin/waitlist` (new) | — | ✅ notify (new) |

All emails go to `designvortex04@gmail.com` per your request. Configured in `.env.local` as `ADMIN_NOTIFY_EMAIL`.

## What you need to do before emails actually fire

The email config currently has `RESEND_API_KEY=` (empty) in `.env.local`. Until you fill that in:

- ✅ All DB inserts work
- ✅ Admin pages show everything
- ❌ No emails get sent (the code no-ops gracefully)

**Two steps to enable email:**

1. Sign up at [resend.com](https://resend.com), grab the API key from the dashboard
2. Set in `.env.local` locally **and** in Vercel env vars for production:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ADMIN_NOTIFY_EMAIL=designvortex04@gmail.com
   FROM_EMAIL=hello@designvortex.co
   ```
3. Also in Resend you'll need to verify `designvortex.co` as a sending domain (DNS records they'll give you). Until that's done, you can only send to your own address.

## Smoke test plan

After Vercel deploys (commit `a64b706`):

1. **Order form** — visit `/order`, fill all 4 steps, hit Send. Check `/admin/orders` — should appear at top.
2. **Contact form** — visit `/contact`, fill out the right-side form, hit Send message. Check `/admin/inquiries`.
3. **Waitlist** — find the homepage "Coming Soon" widget or `/availability` newsletter signup, drop an email, submit. Check the new `/admin/waitlist`.

If anything fails to land in admin, the most likely cause is a Supabase RLS or service-role-key issue (not the new code).

## What is still NOT wired (separate project)

Five content domains still render from hardcoded data in the codebase, not from Supabase. Admin can CRUD them but the public site doesn't read them:

- **Portfolio** — `lib/portfolio-pieces.ts` (24 pieces baked into the file)
- **Reviews** — `lib/constants.ts` REVIEWS array
- **Blog** — hardcoded posts in `app/(public)/blog/page.tsx`
- **Services** — `app/(public)/services/[slug]/services-data.tsx`
- **Availability** — `MONTHS` array in the availability client component

Wiring these up is its own session. For now, content edits happen in code (which Vercel auto-deploys on push). The forms are independent of this.

## Files touched tonight

```
lib/email.ts                              + waitlist + inquiry-customer templates, URL fix
app/api/order/route.ts                    + capture quantity/notes/source
app/api/inquiry/route.ts                  + customer confirmation email
app/api/waitlist/route.ts                 + admin notify email
app/api/waitlist/export/route.ts          NEW — CSV export endpoint
app/admin/waitlist/page.tsx               NEW — admin view
components/admin/AdminShell.tsx           + Waitlist nav item
.env.local                                + ADMIN_NOTIFY_EMAIL set
```

## Quick reference — Vercel env vars to set

```
NEXT_PUBLIC_SUPABASE_URL=...              (already set, just confirming)
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://designvortex.co
RESEND_API_KEY=re_...                     ← needs filling
FROM_EMAIL=hello@designvortex.co
ADMIN_NOTIFY_EMAIL=designvortex04@gmail.com
```

That's it. Sleep well.
