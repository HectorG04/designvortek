import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'

interface LogoProps {
  className?: string
  textClassName?: string
  iconSize?: number
  /** When true, render the monogram in the reverse (cream + gold) palette for dark backgrounds. */
  reverse?: boolean
  /** When true, render only the monogram (no wordmark text). */
  iconOnly?: boolean
}

/* =============================================================================
   Logo — DV monogram (burgundy serif D + gold V + illuminated dot) plus the
   "Design Vortex" wordmark. The monogram colors are hard-coded brand burgundy
   + gold; the wordmark text inherits `currentColor` so the parent controls its
   tone (ink-900 on parchment headers, cream-50 on dark-tome hero etc).

   Master SVG lives at public/logo/monogram.svg — keep the path data here in
   sync if you ever refine the shape. The component inlines the SVG (vs
   <img>) so it scales, doesn't trigger a network request, and lets us pass
   accessible labels per use.
   ============================================================================= */

export default function Logo({
  className,
  textClassName,
  iconSize = 32,
  reverse = false,
  iconOnly = false,
}: LogoProps) {
  // Brand colors — hard-coded so the monogram is always on-brand regardless
  // of the parent's currentColor. Reverse swaps the D to cream for dark contexts.
  const dColor = reverse ? '#F4EAD3' : '#6B1F2A'
  const vColor = '#D4A24C'

  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} home`}
      className={cn('inline-flex items-center gap-[10px] no-underline', className)}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="block flex-shrink-0"
      >
        {/* Serif D with bowl cut as negative space (evenodd) */}
        <path
          d="M16 13 H50 C70 13, 82 30, 82 50 C82 70, 70 87, 50 87 H16 V13 Z M29 24 V76 H50 C62 76, 70 64, 70 50 C70 36, 62 24, 50 24 H29 Z"
          fill={dColor}
          fillRule="evenodd"
        />
        {/* Cormorant-style serif brackets on the D's stem */}
        <path
          d="M12 13 H22 V18 H16 V20 H12 Z M12 87 H22 V82 H16 V80 H12 Z"
          fill={dColor}
        />
        {/* Gold V nested inside the D's bowl */}
        <path
          d="M36 35 L48 67 L60 35 L55 35 L48 56 L41 35 Z"
          fill={vColor}
        />
        {/* Illuminated dot — the scholarly-fantasy touch */}
        <circle cx="48" cy="29" r="2" fill={vColor} />
      </svg>

      {!iconOnly && (
        <span
          className={cn(
            'font-display text-xl font-semibold tracking-[-0.01em]',
            textClassName
          )}
        >
          {SITE_NAME}
        </span>
      )}
    </Link>
  )
}
