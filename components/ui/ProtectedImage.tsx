'use client'

import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

/* =====================================================================
   ProtectedImage — drop-in replacement for next/image that layers:

   1. CLIENT-SIDE DETERRENTS (stops ~95 % of casual saves):
      draggable=false       → blocks drag-to-desktop
      onContextMenu         → blocks right-click → Save Image As
      onDragStart           → belt-and-braces older browsers
      select-none           → blocks text-selection on image area
      touch-callout-none    → blocks iOS long-press save sheet
      user-drag-none        → WebKit drag fallback

   2. FULL-IMAGE WATERMARK OVERLAY:
      Diagonal repeating "DESIGN VORTEX" text at 18 % opacity —
      covers the entire image area, not just one corner. This is the
      only protection that survives a screenshot or DevTools grab.

   Usage: replace any <Image /> of client artwork with
   <ProtectedImage />. Same prop API.

   IMPORTANT — parent must be `position: relative` with an explicit
   size (aspect-ratio div). ProtectedImage returns a React fragment
   so both the <Image> and the overlay land as siblings inside the
   caller's relative container. All current usages pass `fill`.
   ===================================================================== */

/* Pre-compute the watermark data-URI once at module load. */
const _WM_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220">',
  '<text',
  ' x="110" y="110"',
  ' dominant-baseline="middle"',
  ' text-anchor="middle"',
  ' transform="rotate(-35 110 110)"',
  ' font-family="Georgia,serif"',
  ' font-size="16"',
  ' font-weight="bold"',
  ' fill="rgba(255,255,255,0.18)"',
  ' letter-spacing="4"',
  '>DESIGN VORTEX</text>',
  '</svg>',
].join('')

const WM_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(_WM_SVG)}")`,
  backgroundRepeat: 'repeat',
}

export default function ProtectedImage(props: ImageProps) {
  return (
    <>
      <Image
        {...props}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className={cn(
          'select-none [-webkit-touch-callout:none] [-webkit-user-drag:none]',
          props.className,
        )}
      />
      {/* Full-image watermark overlay — absolute inside caller's relative parent */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-[2]"
        style={WM_STYLE}
      />
    </>
  )
}
