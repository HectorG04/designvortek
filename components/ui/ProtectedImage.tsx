'use client'

import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

/* =====================================================================
   ProtectedImage — drop-in replacement for next/image that layers
   client-side deterrents on top of the baked-in DV watermark.

   The watermark in the WebP file is the only thing that survives a
   screenshot, DevTools extraction, or save-as. This wrapper adds:

     draggable=false        blocks drag-to-desktop save
     onContextMenu          blocks right-click → Save Image As
     onDragStart            belt-and-braces for older browsers
     select-none            blocks text selection on the image area
     touch-callout-none     blocks iOS long-press save sheet
     user-drag-none         WebKit fallback for drag prevention

   None of these stop a determined visitor with DevTools open. Combined
   they stop the ~95% of casual visitors who would otherwise grab an
   image via the right-click muscle memory.

   Usage: replace any `<Image ... />` of client artwork with
   `<ProtectedImage ... />`. Same prop API, same rendering output.
   ===================================================================== */
export default function ProtectedImage(props: ImageProps) {
  return (
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
  )
}
