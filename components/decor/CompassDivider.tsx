import { cn } from '@/lib/utils'

interface CompassDividerProps {
  className?: string
  size?: number
}

/**
 * Decorative compass-rose divider used between major sections.
 * Per brand: max 1 per page section. Don't overuse.
 *
 * Implements the `hp-divider-wrap` + `ds-compass-divider` pattern:
 * negative top/bottom margins pull the divider into adjacent section padding
 * so the compass mark sits inside the gap between sections.
 */
export default function CompassDivider({
  className,
  size = 28,
}: CompassDividerProps) {
  return (
    <div
      className={cn(
        'relative z-[2] -mt-10 -mb-10 md:-mt-[88px] md:-mb-[88px]',
        className
      )}
    >
      <div
        className="flex items-center gap-6 text-gold-500"
        aria-hidden="true"
      >
        <span className="flex-1 h-px bg-gradient-to-r from-transparent via-border-medium to-transparent" />
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          className="flex-shrink-0 opacity-80"
        >
          <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="0.8" />
          <path
            d="M16 3 L18 16 L16 29 L14 16 Z M3 16 L16 14 L29 16 L16 18 Z"
            fill="currentColor"
          />
          <circle cx="16" cy="16" r="1.6" fill="var(--color-parchment-50, #faf6ed)" />
        </svg>
        <span className="flex-1 h-px bg-gradient-to-r from-transparent via-border-medium to-transparent" />
      </div>
    </div>
  )
}
