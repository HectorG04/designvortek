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

const STATUS_STYLES: Record<OrderStatus, { label: string; classes: string }> = {
  pending:      { label: 'Pending',      classes: 'bg-gold-100 text-gold-700 border-gold-300' },
  reviewing:    { label: 'Reviewing',    classes: 'bg-gold-100 text-gold-700 border-gold-300' },
  quoted:       { label: 'Quoted',       classes: 'bg-burgundy-100 text-burgundy-700 border-burgundy-100' },
  accepted:     { label: 'Accepted',     classes: 'bg-burgundy-100 text-burgundy-700 border-burgundy-100' },
  in_progress:  { label: 'In progress',  classes: 'bg-burgundy-700 text-cream-50 border-burgundy-700' },
  delivered:    { label: 'Delivered',    classes: 'bg-forest-500/15 text-forest-700 border-forest-500/30' },
  closed:       { label: 'Closed',       classes: 'bg-parchment-300 text-ink-700 border-border-medium' },
  cancelled:    { label: 'Cancelled',    classes: 'bg-parchment-200 text-ink-500 border-border-light' },
}

interface StatusPillProps {
  status: OrderStatus | string
  className?: string
}

export default function StatusPill({ status, className }: StatusPillProps) {
  const config = STATUS_STYLES[status as OrderStatus] ?? {
    label: status,
    classes: 'bg-parchment-200 text-ink-700 border-border-light',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full border text-[0.6875rem] font-semibold uppercase tracking-[0.1em] whitespace-nowrap',
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
