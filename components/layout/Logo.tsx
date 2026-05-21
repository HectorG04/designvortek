import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'

interface LogoProps {
  className?: string
  textClassName?: string
  iconSize?: number
}

/**
 * Brand mark — literal port from Homepage.html lines 21-27.
 * Inherits color via `currentColor`; parent sets text color.
 *
 *   <a class="hp-header-brand">
 *     <svg viewBox="0 0 32 32">
 *       <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="1.2"/>
 *       <path d="M16 4 L18 14 L28 16 L18 18 L16 28 L14 18 L4 16 L14 14 Z" fill="currentColor"/>
 *     </svg>
 *     <span>Design Vortex</span>
 *   </a>
 */
export default function Logo({ className, textClassName, iconSize = 28 }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} home`}
      className={cn('inline-flex items-center gap-[10px] no-underline', className)}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="block"
      >
        <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path
          d="M16 4 L18 14 L28 16 L18 18 L16 28 L14 18 L4 16 L14 14 Z"
          fill="currentColor"
        />
      </svg>
      <span
        className={cn(
          'font-display text-xl font-semibold tracking-[-0.01em]',
          textClassName
        )}
      >
        {SITE_NAME}
      </span>
    </Link>
  )
}
