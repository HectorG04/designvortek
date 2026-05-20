import { cn } from '@/lib/utils'

type OrderStatus =
  | 'pending'
  | 'reviewing'
  | 'quoted'
  | 'accepted'
  | 'in_progress'
  | 'delivered'
  | 'closed'
  | 'cancelled'

interface PillStyle {
  label: string
  /** Pill bg + text colors. */
  pill: string
  /** Dot color. */
  dot: string
  /** If set, dot animates a slow opacity pulse. */
  pulse?: boolean
}

const STATUS_STYLES: Record<OrderStatus, PillStyle> = {
  pending:     { label: 'Pending quote', pill: 'bg-gold-100 text-gold-700',           dot: 'bg-gold-500' },
  reviewing:   { label: 'Reviewing',     pill: 'bg-burgundy-100 text-burgundy-700',   dot: 'bg-burgundy-500' },
  quoted:      { label: 'Quoted',        pill: 'bg-burgundy-100 text-burgundy-700',   dot: 'bg-burgundy-500' },
  accepted:    { label: 'Accepted',      pill: 'bg-burgundy-100 text-burgundy-700',   dot: 'bg-burgundy-500' },
  in_progress: { label: 'In progress',   pill: 'bg-burgundy-100 text-burgundy-700',   dot: 'bg-burgundy-500', pulse: true },
  delivered:   { label: 'Delivered',     pill: 'bg-forest-500/[0.12] text-forest-700', dot: 'bg-forest-500' },
  closed:      { label: 'Closed',        pill: 'bg-parchment-200 text-ink-500',       dot: 'bg-ink-400' },
  cancelled:   { label: 'Cancelled',     pill: 'bg-parchment-200 text-ink-500',       dot: 'bg-ink-400' },
}

interface StatusPillProps {
  status: OrderStatus | string
  className?: string
}

export default function StatusPill({ status, className }: StatusPillProps) {
  const config: PillStyle =
    STATUS_STYLES[status as OrderStatus] ?? {
      label: status,
      pill: 'bg-parchment-200 text-ink-700',
      dot: 'bg-ink-400',
    }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.75rem] font-medium tracking-[0.02em] whitespace-nowrap',
        config.pill,
        className,
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          config.dot,
          config.pulse && 'animate-pulse',
        )}
        aria-hidden="true"
      />
      {config.label}
    </span>
  )
}
