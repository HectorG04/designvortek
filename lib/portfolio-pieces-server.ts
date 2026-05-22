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
  style: string | null
  is_featured: boolean
  is_published: boolean
  meta: Record<string, unknown> | null
}

function rowToPiece(row: PortfolioRow): PortfolioPiece | null {
  if (!row.slug || !row.title || !row.image_url) return null
  const meta = (row.meta ?? {}) as Record<string, unknown>

  /* meta.paragraphs is the canonical 2-paragraph description; fall back to
   * splitting the single description column on blank lines if absent. */
  const paragraphs =
    Array.isArray(meta.paragraphs) && meta.paragraphs.every((s) => typeof s === 'string')
      ? (meta.paragraphs as string[])
      : (row.description ?? '').split(/\n\s*\n/).filter(Boolean)

  /* processImages may live in meta (preferred — preserves labels) or in
   * additional_images as a flat array (labels lost). */
  const processImages =
    Array.isArray(meta.processImages)
      ? (meta.processImages as { src: string; label: string }[])
      : (row.additional_images ?? []).map((src, i) => ({
          src,
          label: i === 0 ? 'FINAL' : `STAGE ${i + 1}`,
        }))

  const VALID_CATEGORIES = ['Character Art', 'Tokens', 'Portraits', 'Anime', 'Custom'] as const
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
    client: (meta.client as string) ?? row.commissioned_by ?? '',
    description: paragraphs,
    tools: (meta.toolsText as string) ?? row.tools_used ?? '',
    hours: (meta.hoursText as string) ?? '',
    style: (meta.styleText as string) ?? row.style ?? '',
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
  'slug,title,category,description,image_url,additional_images,tags,commissioned_by,tools_used,style,is_featured,is_published,meta'

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
