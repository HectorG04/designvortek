import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'

interface LogoProps {
  className?: string
  textClassName?: string
  iconSize?: number
}

/**
 * Design Vortek logo mark — circular medallion with "DV" + wordmark.
 * Inherits color from parent (so it works on dark AND light headers).
 */
export default function Logo({ className, textClassName, iconSize = 28 }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn('inline-flex items-center gap-[10px] group', className)}
      aria-label={`${SITE_NAME} home`}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="text-current transition-transform duration-[250ms] ease-out group-hover:rotate-[15deg]"
      >
        <circle
          cx="16" cy="16" r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
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
