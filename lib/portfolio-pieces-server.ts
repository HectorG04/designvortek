import 'server-only'
/* =====================================================================
   PORTFOLIO PIECES — server-only Supabase fetchers.

   Lives in its own file because lib/supabase/server pulls in next/headers,
   which is server-only. Importing that from lib/portfolio-pieces.ts would
   pollute any client component that uses the sync helpers / types.

   Public API:
     - fetchAllPieces()         all published pieces, newest first
     - fetchFeaturedPieces(n)   featured only, capped
     - fetchAllSlugs()          for generateStaticParams + sitemap
     - fetchPieceBySlug(slug)   single piece lookup
     - fetchCategoryCounts()    chip counts for the masonry

   Each helper tries Supabase first; if the table is empty or errors, it
   falls back to the in-memory PORTFOLIO_PIECES snapshot that ships in
   lib/portfolio-pieces.ts. So the public site keeps working even before
   the migration is applied or if Supabase is unreachable.
   ===================================================================== */

import { createAdminClient } from '@/lib/supabase/server'
import {
  PORTFOLIO_PIECES,
  CATEGORY_FILTER_KEYS,
  getAllPieces,
  getAllSlugs,
  getPieceBySlug,
  getRelatedPieces,
  type PortfolioPiece,
} from '@/lib/portfolio-pieces'

/* ---------- Row → PortfolioPiece adapter ---------- */
type PortfolioRow = {
  slug: string
  title: string
  category: string
  description: string | null
  image_url: string
  additional_images: string[] | null
  tags: string[] | null
  commissioned_by: string | null
  tools_used: string | null
  hours_spent: number | null
  style: string | null
  is_featured: boolean
  is_published: boolean
  meta: Record<string, unknown> | null
}

function rowToPiece(row: PortfolioRow): PortfolioPiece | null {
  if (!row.slug || !row.title || !row.image_url) return null
  const meta = (row.meta ?? {}) as Record<string, unknown>
  const metaProcess = Array.isArray(meta.processImages)
    ? (meta.processImages as { src: string; label: string }[])
    : []

  /* PRIORITY RULE: editable row fields win over seeded meta fields. So
   * when admin updates the form, the public site reflects the change.
   * meta values are kept as fallbacks for fields the admin form doesn't
   * yet expose (artistNote, gradient, aspect, resolution, revisions,
   * delivered) and as a graceful default when a row field is empty. */

  /* Description: prefer the row.description text (split on blank lines
   * into the 2-paragraph shape the public uses). Fall back to the seeded
   * meta.paragraphs if admin hasn't typed anything yet. */
  const rowParagraphs = (row.description ?? '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean)
  const paragraphs =
    rowParagraphs.length > 0
      ? rowParagraphs
      : Array.isArray(meta.paragraphs) && meta.paragraphs.every((s) => typeof s === 'string')
        ? (meta.paragraphs as string[])
        : []

  /* processImages: prefer the row.additional_images URL list (one URL
   * per line in the admin form). For each URL, try to match it against
   * the seeded meta.processImages to preserve its label; otherwise fall
   * back to a positional or generic label. When the admin clears the
   * field entirely, fall back to the seeded meta list. */
  const additionalUrls = row.additional_images ?? []
  const processImages =
    additionalUrls.length > 0
      ? additionalUrls.map((src, i) => {
          const matchedByUrl = metaProcess.find((m) => m.src === src)
          if (matchedByUrl) return { src, label: matchedByUrl.label }
          const positional = metaProcess[i]?.label
          return { src, label: positional ?? (i === 0 ? 'FINAL' : `STAGE ${i + 1}`) }
        })
      : metaProcess

  /* Hours: admin form writes an integer to row.hours_spent. If they've
   * set it, render a clean "Nh" string. Otherwise show the seeded
   * meta.hoursText ("16h across 12 days"). */
  const hours =
    row.hours_spent != null && row.hours_spent > 0
      ? `${row.hours_spent}h`
      : ((meta.hoursText as string) ?? '')

  const VALID_CATEGORIES = ['Character Art', 'Tokens', 'Portraits', 'Anime', 'Custom', 'Weapons & Assets', 'Character Sheets', 'Emotes'] as const
  const category = (VALID_CATEGORIES.includes(row.category as PortfolioPiece['category'])
    ? row.category
    : 'Character Art') as PortfolioPiece['category']

  const VALID_ASPECTS = ['4/5', '3/4', '3/2', '1/1'] as const
  const aspect = (VALID_ASPECTS.includes(meta.aspect as PortfolioPiece['aspect'])
    ? meta.aspect
    : '4/5') as PortfolioPiece['aspect']

  return {
    slug: row.slug,
    title: row.title,
    category,
    /* Row first, meta as fallback for every admin-editable field below. */
    client: row.commissioned_by ?? (meta.client as string) ?? '',
    description: paragraphs,
    tools: row.tools_used ?? (meta.toolsText as string) ?? '',
    hours,
    style: row.style ?? (meta.styleText as string) ?? '',
    /* Below: not yet in the admin form — meta-only for now. */
    resolution: (meta.resolution as string) ?? '',
    revisions: (meta.revisions as string) ?? '',
    delivered: (meta.delivered as string) ?? '',
    tags: row.tags ?? [],
    gradient: (meta.gradient as string) ?? 'from-burgundy-900 via-amber-800 to-stone-900',
    aspect,
    featured: !!row.is_featured,
    heroImage: row.image_url,
    processImages,
    artistNote: (meta.artistNote as string) ?? '',
  }
}

const COLUMNS =
  'slug,title,category,description,image_url,additional_images,tags,commissioned_by,tools_used,hours_spent,style,is_featured,is_published,meta'

/** All published pieces, sorted newest-first by meta.delivered. Falls back
 *  to the in-memory snapshot if Supabase returns 0 rows or errors. */
export async function fetchAllPieces(): Promise<PortfolioPiece[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('portfolio_pieces')
      .select(COLUMNS)
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) return getAllPieces()

    const pieces = (data as unknown as PortfolioRow[])
      .map(rowToPiece)
      .filter((p): p is PortfolioPiece => p !== null)

    if (pieces.length === 0) return getAllPieces()
    return pieces.sort(
      (a, b) => new Date(b.delivered || 0).getTime() - new Date(a.delivered || 0).getTime(),
    )
  } catch {
    return getAllPieces()
  }
}

/** Featured-only pieces (homepage strip). */
export async function fetchFeaturedPieces(limit?: number): Promise<PortfolioPiece[]> {
  const all = await fetchAllPieces()
  const featured = all.filter((p) => p.featured)
  return typeof limit === 'number' ? featured.slice(0, limit) : featured
}

/** All published slugs (generateStaticParams + sitemap). */
export async function fetchAllSlugs(): Promise<string[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('portfolio_pieces')
      .select('slug')
      .eq('is_published', true)

    if (error || !data || data.length === 0) return getAllSlugs()
    return (data as { slug: string }[]).map((r) => r.slug)
  } catch {
    return getAllSlugs()
  }
}

/** Single piece by slug. */
export async function fetchPieceBySlug(slug: string): Promise<PortfolioPiece | undefined> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('portfolio_pieces')
      .select(COLUMNS)
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()

    if (error || !data) return getPieceBySlug(slug)
    const piece = rowToPiece(data as unknown as PortfolioRow)
    return piece ?? getPieceBySlug(slug)
  } catch {
    return getPieceBySlug(slug)
  }
}

/** Related pieces — same category first (excluding current slug), then
 *  padded with other-category pieces if there aren't enough. Mirrors the
 *  fetchRelatedPosts pattern in lib/blog-server.ts so the portfolio detail
 *  page's "Related" section uses real pieces instead of hardcoded data. */
export async function fetchRelatedPieces(
  slug: string,
  category: PortfolioPiece['category'],
  limit = 3,
): Promise<PortfolioPiece[]> {
  const pieces = await fetchAllPieces()
  if (pieces.length === 0) return getRelatedPieces(slug, category, limit)
  const sameCategory = pieces.filter((p) => p.slug !== slug && p.category === category)
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit)
  const others = pieces.filter((p) => p.slug !== slug && p.category !== category)
  return [...sameCategory, ...others].slice(0, limit)
}

/** Live category counts. */
export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const pieces = await fetchAllPieces()
  const counts: Record<string, number> = { all: 0 }
  for (const piece of pieces) {
    counts.all += 1
    const key = CATEGORY_FILTER_KEYS[piece.category]
    counts[key] = (counts[key] ?? 0) + 1
  }
  return counts
}

/* Re-export for consumer convenience so they only need one import. */
export { PORTFOLIO_PIECES, CATEGORY_FILTER_KEYS, type PortfolioPiece }
