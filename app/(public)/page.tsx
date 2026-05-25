import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Hero from '@/components/home/Hero'
import ServicesPreview from '@/components/home/ServicesPreview'
import PersonaRows from '@/components/home/PersonaRows'
import PortfolioStrip from '@/components/home/PortfolioStrip'
import ProcessSteps from '@/components/home/ProcessSteps'
import Testimonials from '@/components/home/Testimonials'
import BlogPreview from '@/components/home/BlogPreview'
import AvailabilityWidget from '@/components/home/AvailabilityWidget'
import FAQ from '@/components/home/FAQ'
import CTACloser from '@/components/home/CTACloser'
import CompassDivider from '@/components/decor/CompassDivider'
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/constants'
import { fetchFeaturedPieces } from '@/lib/portfolio-pieces-server'

/* ISR — homepage rebuilds at most every 60 seconds so admin portfolio
 * edits show up in the strip without a redeploy. */
export const revalidate = 60

export const metadata: Metadata = {
  title: 'Hand-Painted Character Art Commissions | Design Vortex',
  description:
    'Custom hand-painted D&D, RPG & fantasy character portraits. No AI. No tracing. Every piece painted by artist Hector G. Start your commission today.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Hand-Painted Character Art Commissions | Design Vortex',
    description:
      'Custom hand-painted D&D, RPG & fantasy character portraits. No AI. No tracing. Every piece painted by artist Hector G. Start your commission today.',
    url: SITE_URL,
    type: 'website',
  },
}

/**
 * Homepage — the real one.
 *
 * Sections in order:
 *   1. Hero            (dark tome, fold)
 *   2. Services        (3 featured cards)
 *   3. Personas        (3 SEO-rich alternating rows)
 *   4. Portfolio strip (8-piece masonry w/ filter)
 *   5. Process         (4-step horizontal)
 *   6. Testimonials    (3-card row)
 *   7. Blog preview    (3 latest articles)
 *   8. Availability    (slot widget — signature feature)
 *   9. FAQ             (6-item accordion + FAQPage JSON-LD)
 *  10. CTA closer      (dark tome bookend)
 */
export default async function HomePage() {
  /* Featured pieces for the portfolio strip — fetched server-side so the
   * strip stays a static SSG snapshot that updates with ISR. */
  const featuredPieces = await fetchFeaturedPieces(8)
  // Organization JSON-LD — Google understands this as the canonical brand entity
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og-default.png`,
    description: SITE_DESCRIPTION,
    sameAs: [
      // TODO: real social URLs when ready
      // 'https://instagram.com/designvortek',
      // 'https://twitter.com/designvortek',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@designvortex.co',
      contactType: 'customer support',
      areaServed: 'Worldwide',
      availableLanguage: 'English',
    },
  }

  // WebSite schema with SearchAction (enables Google sitelinks search box)
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/portfolio?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <>
      <SiteHeader transparent />
      <main id="main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />

        <Hero />
        <ServicesPreview />

        <div className="bg-parchment-50">
          <CompassDivider />
        </div>

        <PersonaRows />

        <div className="bg-parchment-50">
          <CompassDivider />
        </div>

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
