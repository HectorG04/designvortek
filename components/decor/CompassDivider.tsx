import { cn } from '@/lib/utils'

interface CompassDividerProps {
  className?: string
  size?: number
}

/**
 * Decorative compass-rose divider used between major sections.
 * Per brand: max 1 per page section. Don't overuse.
 */
export default function CompassDivider({
  className,
  size = 24,
}: CompassDividerProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4 my-12',
        className
      )}
      aria-hidden="true"
    >
      <span className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-border-medium" />
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="text-gold-500 opacity-80"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" fill="currentColor" />
      </svg>
      <span className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-border-medium" />
    </div>
  )
}
