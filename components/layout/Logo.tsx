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
        fill="none"
        className="text-current transition-transform duration-300 group-hover:rotate-[15deg]"
      >
        <circle
          cx="16" cy="16" r="14"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
        <circle
          cx="16" cy="16" r="10"
          fill="currentColor"
          opacity="0.08"
        />
        <text
          x="16" y="20"
          textAnchor="middle"
          fontSize="9"
          fontWeight="700"
          fontFamily="var(--font-display)"
          fill="currentColor"
        >
          DV
        </text>
        {/* Four compass-point dots */}
        <circle cx="16" cy="3" r="1" fill="currentColor" />
        <circle cx="16" cy="29" r="1" fill="currentColor" />
        <circle cx="3" cy="16" r="1" fill="currentColor" />
        <circle cx="29" cy="16" r="1" fill="currentColor" />
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
