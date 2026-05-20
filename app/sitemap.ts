import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://designvortek.com'

/**
 * Dynamic sitemap.
 * Public marketing pages are listed below.
 * /admin/* and the /v2 preview route are intentionally excluded (handled in robots).
 *
 * TODO (M5): replace static slug lists with Supabase queries:
 *   - portfolio_pieces (where is_published)
 *   - blog_posts       (where is_published)
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  // Top-level pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL,                       lastModified, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/portfolio`,        lastModified, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${SITE_URL}/services`,         lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/process`,          lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/pricing`,          lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/availability`,     lastModified, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/about`,            lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/blog`,             lastModified, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/reviews`,          lastModified, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/faq`,              lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`,          lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/order`,            lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/privacy`,          lastModified, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/terms`,            lastModified, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/refunds`,          lastModified, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  // Service detail pages
  const serviceSlugs = ['character-art', 'vtt-tokens', 'party-portraits', 'npc-packs', 'custom-projects']
  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${SITE_URL}/services/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // Portfolio detail pages (demo slugs — replace with Supabase data in M5)
  const portfolioSlugs = ['lyra-vexweaver-tiefling-sorceror', 'eira-half-orc-paladin', 'stormwatch-adventuring-party']
  const portfolioRoutes: MetadataRoute.Sitemap = portfolioSlugs.map((slug) => ({
    url: `${SITE_URL}/portfolio/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  // Blog post pages (demo slugs)
  const blogSlugs = ['how-to-write-commission-brief', 'three-weeks-with-lyra', 'vtt-token-deserves-more']
  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...serviceRoutes, ...portfolioRoutes, ...blogRoutes]
}
