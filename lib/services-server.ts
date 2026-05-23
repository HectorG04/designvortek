import 'server-only'
/* =====================================================================
   SERVICES — server-only Supabase fetchers.

   Same pattern as portfolio/blog/reviews server modules. Tries Supabase
   first; falls back to the in-memory snapshot in lib/services.ts when
   the table is empty or unreachable. Public surfaces (/services,
   /services/[bucket], /pricing, homepage strip) consume through here.

   Public filter rule (matches RLS policy from migration 0004):
     is_published = true

   Service-role bypasses RLS and is used by admin server actions.
   ===================================================================== */

import { createAdminClient } from '@/lib/supabase/server'
import {
  SERVICES,
  BUCKETS,
  bucketLabel,
  bucketTagline,
  getAllProducts,
  getProductsByBucket,
  getProductBySlug,
  getFeaturedHomepageProducts,
  getBucketProducts,
  formatPriceLine,
  formatPriceDetail,
  formatTurnaround,
  formatBundleUplift,
  type BucketMeta,
  type ServiceBucket,
  type ServiceProduct,
  type PricingMode,
  type PricingPayload,
  type PricingTier,
  type IncludedItem,
  type ExampleCard,
  type FaqItem,
} from '@/lib/services'

type ServiceRow = {
  id: number
  created_at: string
  updated_at: string
  slug: string
  name: string
  bucket: string
  eyebrow: string | null
  lede: string | null
  description: string | null
  pricing_mode: string
  pricing: unknown
  turnaround_low_days: number | null
  turnaround_high_days: number | null
  revisions_included: number | null
  resolution: string | null
  included: unknown
  examples: unknown
  faq: unknown
  bundle_with_slugs: string[] | null
  bundle_uplift_cents: number | null
  genre_tags: string[] | null
  is_published: boolean
  is_featured_homepage: boolean
  featured_order: number | null
  seo_title: string | null
  seo_description: string | null
  sort_order: number
}

const COLUMNS =
  'id,created_at,updated_at,slug,name,bucket,eyebrow,lede,description,' +
  'pricing_mode,pricing,turnaround_low_days,turnaround_high_days,' +
  'revisions_included,resolution,included,examples,faq,' +
  'bundle_with_slugs,bundle_uplift_cents,genre_tags,' +
  'is_published,is_featured_homepage,featured_order,seo_title,seo_description,sort_order'

/* --------------------------------------------------------------------
   Row → ServiceProduct adapter.

   The pricing column is a jsonb whose shape varies by pricing_mode.
   We narrow defensively — if the payload is malformed we fall back
   to a quote_only stub so the public surface still renders.
   -------------------------------------------------------------------- */

function isBucket(s: string): s is ServiceBucket {
  return BUCKETS.some((b) => b.slug === s)
}

function isPricingMode(s: string): s is PricingMode {
  return (
    s === 'tiered' ||
    s === 'range' ||
    s === 'per_extra' ||
    s === 'pack_with_qty' ||
    s === 'pct_uplift' ||
    s === 'monthly_recurring' ||
    s === 'quote_only' ||
    s === 'flat'
  )
}

function asRecord(x: unknown): Record<string, unknown> {
  return x && typeof x === 'object' && !Array.isArray(x) ? (x as Record<string, unknown>) : {}
}

function asArray(x: unknown): unknown[] {
  return Array.isArray(x) ? x : []
}

function asNumber(x: unknown, fallback = 0): number {
  if (typeof x === 'number' && Number.isFinite(x)) return x
  if (typeof x === 'string') {
    const n = Number(x)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

function asString(x: unknown, fallback = ''): string {
  return typeof x === 'string' ? x : fallback
}

function buildPricingPayload(mode: PricingMode, raw: unknown): PricingPayload {
  const r = asRecord(raw)

  switch (mode) {
    case 'tiered': {
      const tiersRaw = asArray(r.tiers)
      const tiers: PricingTier[] = tiersRaw.map((t) => {
        const rec = asRecord(t)
        return {
          name: asString(rec.name),
          price: asNumber(rec.price),
          note: typeof rec.note === 'string' ? rec.note : undefined,
          features: asArray(rec.features).filter((f): f is string => typeof f === 'string'),
          featured: rec.featured === true,
          flag: typeof rec.flag === 'string' ? rec.flag : undefined,
        }
      })
      return { mode: 'tiered', tiers }
    }
    case 'range': {
      const range = asRecord(r.range)
      return { mode: 'range', range: { low: asNumber(range.low), high: asNumber(range.high) } }
    }
    case 'per_extra': {
      const px = asRecord(r.per_extra)
      return {
        mode: 'per_extra',
        per_extra: {
          base: asNumber(px.base),
          extra_low: asNumber(px.extra_low),
          extra_high: asNumber(px.extra_high),
          extra_label: typeof px.extra_label === 'string' ? px.extra_label : undefined,
        },
      }
    }
    case 'pack_with_qty': {
      const pack = asRecord(r.pack)
      const packs = asArray(pack.packs).map((p) => {
        const pr = asRecord(p)
        return {
          qty: asNumber(pr.qty),
          price: asNumber(pr.price),
          label: typeof pr.label === 'string' ? pr.label : undefined,
        }
      })
      return { mode: 'pack_with_qty', pack: { packs } }
    }
    case 'pct_uplift': {
      const up = asRecord(r.uplift)
      return {
        mode: 'pct_uplift',
        uplift: {
          percent: asNumber(up.percent),
          label: typeof up.label === 'string' ? up.label : undefined,
        },
      }
    }
    case 'monthly_recurring': {
      const m = asRecord(r.monthly)
      return {
        mode: 'monthly_recurring',
        monthly: {
          monthly_price: asNumber(m.monthly_price),
          included: asArray(m.included).filter((s): s is string => typeof s === 'string'),
          cadence: typeof m.cadence === 'string' ? m.cadence : undefined,
        },
      }
    }
    case 'quote_only': {
      const q = asRecord(r.quote)
      return {
        mode: 'quote_only',
        quote: {
          from_price: typeof q.from_price === 'number' ? q.from_price : undefined,
          cta_label: typeof q.cta_label === 'string' ? q.cta_label : undefined,
          cta_href: typeof q.cta_href === 'string' ? q.cta_href : undefined,
        },
      }
    }
    case 'flat': {
      const f = asRecord(r.flat)
      return {
        mode: 'flat',
        flat: {
          price: asNumber(f.price),
          label: typeof f.label === 'string' ? f.label : undefined,
        },
      }
    }
  }
}

function rowToProduct(row: ServiceRow): ServiceProduct | null {
  if (!row.slug || !row.name) return null
  if (!isBucket(row.bucket)) return null

  const mode: PricingMode = isPricingMode(row.pricing_mode) ? row.pricing_mode : 'quote_only'
  const pricing = buildPricingPayload(mode, row.pricing)

  const included: IncludedItem[] = asArray(row.included).map((x) => {
    const rec = asRecord(x)
    return { name: asString(rec.name), body: asString(rec.body) }
  })

  const examples: ExampleCard[] = asArray(row.examples).map((x) => {
    const rec = asRecord(x)
    return {
      title: asString(rec.title),
      meta: asString(rec.meta),
      gradient: asString(rec.gradient),
    }
  })

  const faq: FaqItem[] = asArray(row.faq).map((x) => {
    const rec = asRecord(x)
    return { q: asString(rec.q), a: asString(rec.a) }
  })

  return {
    slug: row.slug,
    name: row.name,
    bucket: row.bucket,
    eyebrow: row.eyebrow ?? undefined,
    lede: row.lede ?? undefined,
    description: row.description ?? undefined,
    pricingMode: mode,
    pricing,
    turnaroundLowDays: row.turnaround_low_days ?? undefined,
    turnaroundHighDays: row.turnaround_high_days ?? undefined,
    revisionsIncluded: row.revisions_included ?? undefined,
    resolution: row.resolution ?? undefined,
    included,
    examples,
    faq,
    bundleWithSlugs: row.bundle_with_slugs ?? [],
    bundleUpliftCents: row.bundle_uplift_cents ?? undefined,
    genreTags: row.genre_tags ?? [],
    isPublished: row.is_published,
    isFeaturedHomepage: row.is_featured_homepage,
    featuredOrder: row.featured_order ?? undefined,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    sortOrder: row.sort_order,
  }
}

/* --------------------------------------------------------------------
   Fetchers — Supabase first, snapshot fallback.

   Snapshot is empty in Phase 1 — these return [] until Phase 2 seeds
   the DB. Consumers (Phase 3 public surfaces) should handle the empty
   case gracefully.
   -------------------------------------------------------------------- */

export async function fetchAllProducts(): Promise<ServiceProduct[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('services')
      .select(COLUMNS)
      .eq('is_published', true)
      .order('bucket', { ascending: true })
      .order('sort_order', { ascending: true })

    if (error || !data) return getAllProducts()
    const products = (data as unknown as ServiceRow[])
      .map(rowToProduct)
      .filter((p): p is ServiceProduct => p !== null)
    return products.length > 0 ? products : getAllProducts()
  } catch {
    return getAllProducts()
  }
}

export async function fetchProductsByBucket(bucket: ServiceBucket): Promise<ServiceProduct[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('services')
      .select(COLUMNS)
      .eq('is_published', true)
      .eq('bucket', bucket)
      .order('sort_order', { ascending: true })

    if (error || !data) return getProductsByBucket(bucket)
    const products = (data as unknown as ServiceRow[])
      .map(rowToProduct)
      .filter((p): p is ServiceProduct => p !== null)
    return products.length > 0 ? products : getProductsByBucket(bucket)
  } catch {
    return getProductsByBucket(bucket)
  }
}

export async function fetchProductBySlug(slug: string): Promise<ServiceProduct | undefined> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('services')
      .select(COLUMNS)
      .eq('slug', slug)
      .maybeSingle()

    if (!error && data) {
      const row = data as unknown as ServiceRow
      if (row.is_published) {
        const product = rowToProduct(row)
        if (product) return product
      }
    }
  } catch {
    /* fall through */
  }
  return getProductBySlug(slug)
}

export async function fetchFeaturedHomepageProducts(limit = 3): Promise<ServiceProduct[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('services')
      .select(COLUMNS)
      .eq('is_published', true)
      .eq('is_featured_homepage', true)
      .order('featured_order', { ascending: true, nullsFirst: false })
      .limit(limit)

    if (error || !data) return getFeaturedHomepageProducts(limit)
    const products = (data as unknown as ServiceRow[])
      .map(rowToProduct)
      .filter((p): p is ServiceProduct => p !== null)
    return products.length > 0 ? products.slice(0, limit) : getFeaturedHomepageProducts(limit)
  } catch {
    return getFeaturedHomepageProducts(limit)
  }
}

/** Bucket → products map for the services index. Always includes every
 *  bucket key (even empty ones) so consumers don't need to special-case. */
export async function fetchBucketProducts(): Promise<Record<ServiceBucket, ServiceProduct[]>> {
  const all = await fetchAllProducts()
  const out = {} as Record<ServiceBucket, ServiceProduct[]>
  for (const b of BUCKETS) out[b.slug] = []
  for (const p of all) out[p.bucket].push(p)
  return out
}

/** Slug list for generateStaticParams on /services/[bucket] (and later
 *  /services/[bucket]/[product] if we add product detail pages). */
export async function fetchAllSlugs(): Promise<string[]> {
  const all = await fetchAllProducts()
  return all.map((p) => p.slug)
}

/* Re-exports for consumer convenience. */
export {
  BUCKETS,
  bucketLabel,
  bucketTagline,
  formatPriceLine,
  formatPriceDetail,
  formatTurnaround,
  formatBundleUplift,
  type BucketMeta,
  type ServiceBucket,
  type ServiceProduct,
  type PricingMode,
  type PricingPayload,
  type PricingTier,
}
