import type { MetadataRoute } from 'next'

/* =====================================================================
   PWA manifest — gives the site a proper theme colour in mobile browser
   chrome, an installable name, and a starting URL when someone "Add to
   Home Screen"s the site. Falls back gracefully to favicon.ico on
   platforms without dedicated PWA icons (we'll add those later).
   ===================================================================== */

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Design Vortex — Premium Character Art Commissions',
    short_name: 'Design Vortex',
    description:
      'Custom hand-painted digital character art for D&D, TTRPG, and fantasy — painted by a human artist, never AI.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5EBD3', // parchment-100
    theme_color: '#6B1F2A',      // burgundy-700
    orientation: 'portrait',
    categories: ['art', 'design', 'entertainment'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      // Future: add 192x192 + 512x512 PNGs in /public when we generate them.
    ],
  }
}
