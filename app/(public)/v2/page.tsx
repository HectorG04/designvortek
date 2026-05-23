import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Hero from '@/components/home/Hero'
import ServicesPreview from '@/components/home/ServicesPreview'
import PersonaRows from '@/components/home/PersonaRows'
import PortfolioStrip from '@/components/home/PortfolioStrip'
import { fetchFeaturedPieces } from '@/lib/portfolio-pieces-server'
import ProcessSteps from '@/components/home/ProcessSteps'
import Testimonials from '@/components/home/Testimonials'
import BlogPreview from '@/components/home/BlogPreview'
import AvailabilityWidget from '@/components/home/AvailabilityWidget'
import FAQ from '@/components/home/FAQ'
import CTACloser from '@/components/home/CTACloser'
import CompassDivider from '@/components/decor/CompassDivider'

export const metadata: Metadata = {
  title: 'Design Vortex â€” Preview',
  description:
    'Internal preview of the homepage. Public site is at the root domain.',
  robots: { index: false, follow: false },
}

/**
 * MILESTONE 2 PREVIEW â€” Full homepage (all body sections).
 *
 * Order matches the design brief:
 *   1. Hero            (dark tome, fold)
 *   2. Services        (3 featured cards)
 *   3. Personas        (3 SEO-rich alternating rows)
 *   4. Portfolio strip (8-piece masonry w/ filter)
 *   5. Process         (4-step horizontal)
 *   6. Testimonials    (3-card row)
 *   7. Blog preview    (3 latest articles)
 *   8. Availability    (slot widget â€” signature feature)
 *   9. FAQ             (6-item accordion + FAQPage JSON-LD)
 *  10. CTA closer      (dark tome bookend)
 *
 * Compass dividers separate major thematic blocks.
 */
export default async function HomePreviewPage() {
  const featuredPieces = await fetchFeaturedPieces(8)
  return (
    <>
      <SiteHeader transparent />
      <main id="main">
        <Hero />
        <ServicesPreview />

        <div className="bg-parchment-50">
          <CompassDivider />
        </div>

        <PersonaRows />
        <PortfolioStrip pieces={featuredPieces} />
        <ProcessSteps />
        <Testimonials />
        <BlogPreview />
        <AvailabilityWidget />
        <FAQ />
        <CTACloser />
      </main>
      <SiteFooter />
    </>
  )
}
