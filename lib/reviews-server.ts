import 'server-only'
/* =====================================================================
   REVIEWS — server-only Supabase fetchers.

   Same pattern as lib/portfolio-pieces-server.ts. Tries Supabase first;
   falls back to the in-memory 30-review snapshot in lib/reviews.ts if
   the table is empty or errors. Public surfaces (/reviews, homepage
   testimonials) read from here so admin edits propagate via ISR.

   Public filter rule: only reviews with is_approved = true are returned.
   ===================================================================== */

import { createAdminClient } from '@/lib/supabase/server'
import {
  REVIEWS,
  computeAggregate,
  getAllReviews,
  getFeaturedReviews,
  type Review,
} from '@/lib/reviews'

type ReviewRow = {
  id: number
  created_at: string
  customer_name: string
  customer_role: string | null
  content: string
  rating: number
  service_type: string | null
  is_approved: boolean
  is_featured: boolean
  avatar_url: string | null
}

function rowToReview(row: ReviewRow): Review | null {
  if (!row.customer_name || !row.content) return null
  const initials =
    row.customer_name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'NA'

  const rating = Math.max(1, Math.min(5, Math.round(row.rating))) as Review['rating']

  return {
    key: `db-${row.id}`,
    customerName: row.customer_name,
    initials,
    role: row.customer_role ?? 'Customer',
    content: row.content,
    rating,
    date: row.created_at,
    featured: !!row.is_featured,
    serviceType: row.service_type ?? undefined,
  }
}

const COLUMNS =
  'id,created_at,customer_name,customer_role,content,rating,service_type,is_approved,is_featured,avatar_url'

/** All approved reviews from Supabase, newest first. Fallback to the
 *  in-memory snapshot when the table is empty or unreachable. */
export async function fetchAllReviews(): Promise<Review[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('reviews')
      .select(COLUMNS)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) return getAllReviews()

    const reviews = (data as unknown as ReviewRow[])
      .map(rowToReview)
      .filter((r): r is Review => r !== null)

    return reviews.length > 0 ? reviews : getAllReviews()
  } catch {
    return getAllReviews()
  }
}

/** Featured-only reviews for the homepage testimonials row. */
export async function fetchFeaturedReviews(limit?: number): Promise<Review[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('reviews')
      .select(COLUMNS)
      .eq('is_approved', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(typeof limit === 'number' ? limit : 100)

    if (error || !data || data.length === 0) return getFeaturedReviews(limit)

    const reviews = (data as unknown as ReviewRow[])
      .map(rowToReview)
      .filter((r): r is Review => r !== null)

    if (reviews.length === 0) return getFeaturedReviews(limit)
    return typeof limit === 'number' ? reviews.slice(0, limit) : reviews
  } catch {
    return getFeaturedReviews(limit)
  }
}

/** Aggregate rating computed from current data source. Falls back to
 *  the snapshot's computed aggregate automatically since computeAggregate
 *  just averages whatever Review[] you pass in. */
export async function fetchAggregateRating() {
  const reviews = await fetchAllReviews()
  return computeAggregate(reviews)
}

/* Re-exports for consumer convenience. */
export { REVIEWS, computeAggregate, type Review }
