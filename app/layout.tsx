import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, Caveat } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

/* Google Analytics 4 — measurement ID. Hardcoded fallback so production
   works without env config; override via NEXT_PUBLIC_GA_MEASUREMENT_ID
   (useful for staging/preview deploys that should NOT pollute the prod
   analytics property). Empty string disables GA entirely. */
const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-B3KJN28KEM'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant-var',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter-var',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat-var',
  weight: ['400', '700'],
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://designvortex.co'

export const metadata: Metadata = {
  title: {
    default: 'Design Vortex — Premium Art Commissions',
    template: '%s | Design Vortex',
  },
  description:
    'Premium custom art commissions — D&D character art, VTT tokens, party portraits, anime portraits, and bespoke illustrations crafted with care.',
  keywords: [
    'd&d character art',
    'commission art',
    'tabletop rpg art',
    'vtt tokens',
    'party portraits',
    'anime commission',
    'custom character art',
    'npc portraits',
    'fantasy art commission',
  ],
  authors: [{ name: 'Design Vortex' }],
  creator: 'Design Vortex',
  publisher: 'Design Vortex',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Design Vortex',
    title: 'Design Vortex — Premium Art Commissions',
    description:
      'Premium D&D, TTRPG, and custom character art commissions — crafted with care.',
    /* NOTE: no manual `images` here — Next.js auto-uses app/opengraph-image.tsx
       as the site-wide fallback. Per-route opengraph-image.tsx files override per page. */
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Design Vortex — Premium Art Commissions',
    description: 'Premium D&D, TTRPG, and custom character art commissions.',
    /* Same: no manual `images` — Next.js auto-pulls from opengraph-image.tsx. */
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

/* Site-wide Organization JSON-LD — rendered in every page's <head>. Powers
   rich results, knowledge-panel signals, AI-search citations, and disambiguation
   of the studio brand. */
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Design Vortex',
  alternateName: 'Design Vortex Studio',
  url: SITE_URL,
  logo: `${SITE_URL}/opengraph-image`,
  description:
    'Design Vortex is a digital character art commission studio. Custom D&D, TTRPG, and fantasy portraits painted by a human artist — never AI.',
  founder: {
    '@type': 'Person',
    name: 'Hector G.',
    jobTitle: 'Founder & Lead Artist',
  },
  foundingDate: '2024',
  knowsAbout: [
    'D&D character art',
    'TTRPG portrait commissions',
    'VTT tokens',
    'Party portraits',
    'NPC packs',
    'Pathfinder character art',
    'Cyberpunk character art',
    'Anime style commissions',
  ],
  makesOffer: {
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: 'Custom character art commission',
      serviceType: 'Digital illustration',
      areaServed: 'Worldwide',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${caveat.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        {children}

        {/* Google Analytics 4 — loads after page becomes interactive so it
           never blocks LCP/INP. Two scripts: the gtag library, then the
           init that registers our measurement ID. Only renders when an ID
           is configured (the fallback above keeps prod working out of box). */}
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  )
}
