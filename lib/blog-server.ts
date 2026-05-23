import 'server-only'
/* =====================================================================
   BLOG — server-only Supabase fetchers.

   Same pattern as lib/portfolio-pieces-server.ts and lib/reviews-server.ts:
   tries Supabase first; falls back to the in-memory snapshot in
   lib/blog.ts when the table is empty or unreachable. Public surfaces
   (/blog, /blog/[slug], /blog/category/[c]) read through this module so
   admin edits propagate via ISR (revalidate=60).

   Public filter rule mirrors the RLS policy from migration 0003:
     is_published = true AND (published_at IS NULL OR published_at <= now())
   The RLS policy already enforces this for non-service-role clients, but
   we apply it in the query too because admin reads use the service role
   client (which bypasses RLS).
   ===================================================================== */

import { createAdminClient } from '@/lib/supabase/server'
import {
  POSTS,
  STUDIO_AUTHOR,
  getAllPosts,
  getFeaturedPost,
  getGridPosts,
  getPostBySlug,
  getPostsByCategory,
  getRelatedPosts,
  getCategoryCounts,
  categoryToSlug,
  slugToCategory,
  formatPostDate,
  type BlogPost,
  type BlogAuthor,
} from '@/lib/blog'

type BlogRow = {
  id: number
  created_at: string
  updated_at: string
  title: string | null
  slug: string | null
  excerpt: string | null
  content: string | null
  featured_image: string | null
  category: string | null
  tags: string[] | null
  author_name: string | null
  is_published: boolean | null
  published_at: string | null
  read_time_minutes: number | null
  seo_title: string | null
  seo_description: string | null
}

const COLUMNS =
  'id,created_at,updated_at,title,slug,excerpt,content,featured_image,category,tags,author_name,is_published,published_at,read_time_minutes,seo_title,seo_description'

/** Returns true when the row should be visible to the public — published
 *  and either no scheduled publish time, or scheduled time has arrived. */
function isPubliclyVisible(row: BlogRow, now: number): boolean {
  if (!row.is_published) return false
  if (!row.published_at) return true
  const t = new Date(row.published_at).getTime()
  return Number.isFinite(t) && t <= now
}

/** Adapt a DB row to the client-safe BlogPost shape. Returns null when
 *  the row is missing fields required by the public renderer (title,
 *  slug, body). The fallback snapshot covers those cases. */
function rowToPost(row: BlogRow): BlogPost | null {
  if (!row.slug || !row.title) return null
  const body = row.content ?? ''
  if (!body.trim()) return null

  // Effective publish timestamp — prefer published_at, then updated_at,
  // then created_at. The snapshot uses YYYY-MM-DD dates so we store ISO
  // and let formatPostDate handle the display.
  const isoDate =
    (row.published_at && new Date(row.published_at).toISOString()) ||
    (row.updated_at && new Date(row.updated_at).toISOString()) ||
    row.created_at

  return {
    slug: row.slug,
    title: row.title,
    category: row.category ?? 'Guides',
    date: isoDate,
    dateLabel: formatPostDate(isoDate),
    readMin:
      typeof row.read_time_minutes === 'number' && row.read_time_minutes > 0
        ? row.read_time_minutes
        : Math.max(2, Math.round(body.split(/\s+/).length / 220)),
    excerpt: row.excerpt ?? '',
    body,
    authorName: row.author_name ?? STUDIO_AUTHOR.name,
    featuredImage: row.featured_image ?? undefined,
    tags: row.tags ?? undefined,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
  }
}

/* --------------------------------------------------------------------
   Fetch helpers — every one tries Supabase first, falls back to the
   in-memory snapshot when the DB is empty / unreachable. ISR keeps the
   responses cached for `revalidate` seconds on each public page.
   -------------------------------------------------------------------- */

/** All publicly visible posts, newest first. */
export async function fetchAllPosts(): Promise<BlogPost[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select(COLUMNS)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error || !data || data.length === 0) return getAllPosts()

    const now = Date.now()
    const posts = (data as unknown as BlogRow[])
      .filter((r) => isPubliclyVisible(r, now))
      .map(rowToPost)
      .filter((p): p is BlogPost => p !== null)

    return posts.length > 0 ? posts : getAllPosts()
  } catch {
    return getAllPosts()
  }
}

/** Hero post for /blog. Picks the newest published post (Supabase or
 *  snapshot). The hardcoded "featured: true" flag in the snapshot only
 *  matters when Supabase is empty. */
export async function fetchFeaturedPost(): Promise<BlogPost | undefined> {
  const posts = await fetchAllPosts()
  return posts[0] ?? getFeaturedPost()
}

/** Grid posts for /blog (everything except the featured/hero post). */
export async function fetchGridPosts(): Promise<BlogPost[]> {
  const posts = await fetchAllPosts()
  if (posts.length === 0) return getGridPosts()
  return posts.slice(1)
}

/** Single post by slug for /blog/[slug]. Falls back to the snapshot
 *  before declaring 404 — preserves the in-memory canonical content
 *  for posts that were seeded but later removed from Supabase. */
export async function fetchPostBySlug(slug: string): Promise<BlogPost | undefined> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select(COLUMNS)
      .eq('slug', slug)
      .maybeSingle()

    if (!error && data) {
      const now = Date.now()
      const row = data as unknown as BlogRow
      if (isPubliclyVisible(row, now)) {
        const post = rowToPost(row)
        if (post) return post
      }
    }
  } catch {
    /* fall through */
  }
  return getPostBySlug(slug)
}

/** Used by generateStaticParams on /blog/[slug]. Mixes DB slugs (if
 *  any) with snapshot slugs so the build pre-renders every known post. */
export async function fetchAllSlugs(): Promise<string[]> {
  const dbSlugs = new Set<string>()
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug,is_published,published_at')

    if (!error && data) {
      const now = Date.now()
      for (const row of data as Array<{
        slug: string | null
        is_published: boolean | null
        published_at: string | null
      }>) {
        if (!row.slug) continue
        if (!row.is_published) continue
        if (row.published_at && new Date(row.published_at).getTime() > now) continue
        dbSlugs.add(row.slug)
      }
    }
  } catch {
    /* fall through */
  }
  for (const p of POSTS) dbSlugs.add(p.slug)
  return Array.from(dbSlugs)
}

/** Posts in a single category (label, not slug). */
export async function fetchPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await fetchAllPosts()
  if (posts.length === 0) return getPostsByCategory(category)
  const target = category.toLowerCase()
  return posts.filter((p) => p.category.toLowerCase() === target)
}

/** Category chip data for /blog — labels + counts computed against the
 *  currently visible post set. "All" is prepended for convenience. */
export async function fetchCategoryCounts(): Promise<Array<{ label: string; count: number }>> {
  const posts = await fetchAllPosts()
  if (posts.length === 0) return getCategoryCounts()
  const counts = new Map<string, number>()
  for (const p of posts) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  }
  return [
    { label: 'All', count: posts.length },
    ...Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
  ]
}

/** Related-posts rail (everything except the current slug). */
export async function fetchRelatedPosts(slug: string, limit = 3): Promise<BlogPost[]> {
  const posts = await fetchAllPosts()
  if (posts.length === 0) return getRelatedPosts(slug, limit)
  return posts.filter((p) => p.slug !== slug).slice(0, limit)
}

/* Re-exports for consumer convenience. */
export {
  POSTS,
  STUDIO_AUTHOR,
  categoryToSlug,
  slugToCategory,
  formatPostDate,
  type BlogPost,
  type BlogAuthor,
}
