import { permanentRedirect } from 'next/navigation'

/* =====================================================================
   LEGACY REDIRECT — /blog/[slug] → /resources/[slug]

   The blog section was renamed to "Resources". All article detail pages
   now live at /resources/[slug]. This file issues a 308 permanent
   redirect so old links (including any indexed by Google) forward
   correctly without losing PageRank.
   ===================================================================== */

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPostRedirect({ params }: PageProps) {
  const { slug } = await params
  permanentRedirect(`/resources/${slug}`)
}
