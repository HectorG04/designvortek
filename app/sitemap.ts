import { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://designvortek.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  // Coming soon — only the homepage is indexed
  // (will expand to all routes once designs land)
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]
}
