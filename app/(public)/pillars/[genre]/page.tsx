import { permanentRedirect } from 'next/navigation'

/* =====================================================================
   LEGACY REDIRECT — /pillars/[genre] → /guides/[genre]

   The pillar route was renamed to "guides" in May 2026 — "pillars" was
   internal SEO jargon, "guides" matches what visitors see. 308 permanent
   redirect preserves any backlinks or indexed URLs Google has crawled.

   /pillars (index) already redirects to /resources.
   ===================================================================== */

interface PageProps {
  params: Promise<{ genre: string }>
}

export default async function PillarGenreRedirect({ params }: PageProps) {
  const { genre } = await params
  permanentRedirect(`/guides/${genre}`)
}
