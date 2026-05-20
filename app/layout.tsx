import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter, Caveat } from 'next/font/google'
import './globals.css'

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://designvortek.com'

export const metadata: Metadata = {
  title: {
    default: 'Design Vortek — Premium Art Commissions',
    template: '%s | Design Vortek',
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
  authors: [{ name: 'Design Vortek' }],
  creator: 'Design Vortek',
  publisher: 'Design Vortek',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Design Vortek',
    title: 'Design Vortek — Premium Art Commissions',
    description:
      'Premium D&D, TTRPG, and custom character art commissions — crafted with care.',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Design Vortek' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Design Vortek — Premium Art Commissions',
    description: 'Premium D&D, TTRPG, and custom character art commissions.',
    images: ['/og-default.png'],
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${caveat.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
