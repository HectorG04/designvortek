import { MetadataRoute } from 'next'
import { fetchAllSlugs as fetchPortfolioSlugs } from '@/lib/portfolio-pieces-server'
import { fetchAllSlugs as fetchBlogSlugs, fetchActivePillarGenres } from '@/lib/blog-server'
import { BUCKETS } from '@/lib/services-server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://designvortex.co'

/**
 * Dynamic sitemap.
 *
 * Top-level pages plus dynamic detail routes:
 *   - /portfolio/[slug]        from portfolio_pieces
 *   - /services/[bucket]       from BUCKETS metadata
 *   - /subscription            new Phase 4 landing
 *   - /commercial              new Phase 4 landing
 *   - /services/maps           new Phase 4 quote-only product
 *   - /blog/[slug]             from blog_posts
 *
 * /admin/* and /v2/preview remain excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                       lastModified, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/portfolio`,        lastModified, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/services`,         lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/subscription`,     lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/commercial`,       lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/services/maps`,    lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/process`,          lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/pricing`,          lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/availability`,     lastModified, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/about`,            lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/resources`,        lastModified, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/reviews`,          lastModified, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/faq`,              lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`,          lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/order`,            lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/privacy`,          lastModified, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/terms`,            lastModified, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/refunds`,          lastModified, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // Bucket detail pages at /services/[bucket]. Subscription sits at its
  // own top-level path (/subscription, listed above), so it's excluded
  // from the bucket-loop. Commercial is no longer a bucket — it lives at
  // /commercial (listed above) and as the +40% addon row.
  const serviceRoutes: MetadataRoute.Sitemap = BUCKETS
    .filter((b) => b.slug !== 'subscription')
    .map((b) => ({
      url: `${SITE_URL}/services/${b.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

  // Portfolio detail pages — slugs come from Supabase via the server module.
  const portfolioSlugs = await fetchPortfolioSlugs()
  const portfolioRoutes: MetadataRoute.Sitemap = portfolioSlugs.map((slug) => ({
    url: `${SITE_URL}/portfolio/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Blog post pages — slugs come from Supabase.
  const blogSlugs = await fetchBlogSlugs()
  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Pillar pages — one per genre that has a published pillar post.
  // Higher priority than spoke blog posts since pillars are the
  // authority pages for their genre.
  const pillarGenres = await fetchActivePillarGenres()
  const pillarRoutes: MetadataRoute.Sitemap = pillarGenres.map((g) => ({
    url: `${SITE_URL}/pillars/${g.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.85,
  }))

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...portfolioRoutes,
    ...blogRoutes,
    ...pillarRoutes,
  ]
}
