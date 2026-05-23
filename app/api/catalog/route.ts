/* =====================================================================
   GET /api/catalog
   ---------------------------------------------------------------------
   Returns the full bucket → product → tier tree plus the canonical
   add-ons. Used by:

   • The Order Form (Step 1 picker — wires the inline CATALOG against
     the live data, so admin edits show up without rebuild).
   • Third-party integrations (Stripe Checkout Sessions, etc.) that
     need to read the canonical price list.
   • Future GraphQL / mobile clients.

   Edge-cached for 1 hour. The Order Form fetches client-side and falls
   back to its inline snapshot during SSR / on network failure.

   Response shape (loose, additive-friendly):
   {
     buckets: [{ slug, label, tagline, order }],
     products: [{ slug, name, bucket, pricingMode, pricing, ... }],
     addons:   [{ slug, name, displayText, flatCents, percentUplift }],
     generatedAt: ISO timestamp
   }
   ===================================================================== */

import { NextResponse } from 'next/server'
import { BUCKETS } from '@/lib/services'
import { fetchAllProducts } from '@/lib/services-server'
import { fetchAllAddons } from '@/lib/addons-server'

// 1-hour ISR — the catalog rarely changes day to day. Admin edits go
// live within the hour without a redeploy; on-demand revalidation can
// be wired later via revalidateTag('catalog') in the services actions.
export const revalidate = 3600

export async function GET() {
  const [products, addons] = await Promise.all([
    fetchAllProducts(),
    fetchAllAddons(),
  ])

  const buckets = BUCKETS.map((b) => ({
    slug: b.slug,
    label: b.label,
    tagline: b.tagline,
    order: b.order,
    showOnIndex: b.showOnIndex,
  }))

  return NextResponse.json(
    {
      buckets,
      products,
      addons,
      generatedAt: new Date().toISOString(),
    },
    {
      headers: {
        // CDN cache for 1h, stale-while-revalidate for 1d.
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  )
}
