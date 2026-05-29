import type { Metadata } from 'next'
import { fetchAllPieces, fetchCategoryCounts } from '@/lib/portfolio-pieces-server'
import PortfolioMasonryClient from './_PortfolioMasonryClient'

/* =====================================================================
   PORTFOLIO INDEX — server shell.

   Fetches the published pieces from Supabase (with in-memory snapshot
   fallback) and hands them to the client masonry component as props.
   The client only owns interactivity (filter chips, search box, sort
   select). When admin edits or adds a piece, ISR rebuilds this page
   within 60 seconds.
   ===================================================================== */

export const metadata: Metadata = {
  title: 'Character Art Portfolio — D&D, RPG, Sci-Fi & Fantasy Commissions',
  description:
    'Browse hand-painted D&D, Pathfinder, 40K, sci-fi & fantasy character commissions. Every piece painted by Hector G — no AI, no tracing. See the work.',
  alternates: { canonical: '/portfolio' },
}

/* ISR — rebuild at most every 60 seconds. Admin edits in portfolio_pieces
 * become visible inside that window without a deploy. */
export const revalidate = 60

export default async function PortfolioPage() {
  const [pieces, counts] = await Promise.all([
    fetchAllPieces(),
    fetchCategoryCounts(),
  ])

  return <PortfolioMasonryClient pieces={pieces} counts={counts} />
}
