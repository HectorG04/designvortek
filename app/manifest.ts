import type { MetadataRoute } from 'next'

/* =====================================================================
   PWA manifest — gives the site a proper theme colour in mobile browser
   chrome, an installable name + icons, and a starting URL when someone
   "Add to Home Screen"s the site. All icons render the DV monogram with
   brand-parchment background for legibility on any OS tile colour.
   ===================================================================== */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Design Vortex — Premium Character Art Commissions',
    short_name: 'Design Vortex',
    description:
      'Custom digital character art for D&D, TTRPG, and fantasy — hand-painted by a human artist, never AI.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5EBD3', // parchment-100
    theme_color: '#6B1F2A',      // burgundy-700
    orientation: 'portrait',
    categories: ['art', 'design', 'entertainment'],
    icons: [
      // Modern SVG favicon (any size, scales perfectly)
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      // Raster fallbacks for PWA installation
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      // Legacy ICO fallback
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
  }
}
