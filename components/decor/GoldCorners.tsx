import { cn } from '@/lib/utils'

interface GoldCornersProps {
  className?: string
  size?: number
}

/**
 * Four small gold-corner flourishes for featured/highlighted cards.
 * Per brand: only on featured portfolio pieces or hero callouts.
 * Renders absolutely-positioned in each corner — parent must be position: relative.
 */
export default function GoldCorners({
  className,
  size = 16,
}: GoldCornersProps) {
  const Corner = ({ rotate }: { rotate: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      style={{ transform: `rotate(${rotate}deg)` }}
      className="text-gold-500"
    >
      <path d="M2 8 L2 2 L8 2" />
    </svg>
  )

  return (
    <div
      className={cn('pointer-events-none absolute inset-0', className)}
      aria-hidden="true"
    >
      <div className="absolute top-2 left-2">
        <Corner rotate={0} />
      </div>
      <div className="absolute top-2 right-2">
        <Corner rotate={90} />
      </div>
      <div className="absolute bottom-2 right-2">
        <Corner rotate={180} />
      </div>
      <div className="absolute bottom-2 left-2">
        <Corner rotate={270} />
      </div>
    </div>
  )
}
