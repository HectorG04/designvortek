import { cn } from '@/lib/utils'

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'dark' | 'gold'
}

/**
 * The "eyebrow" label that appears above section headings.
 * Examples: "Premium Art Commissions · Since 2024", "Our Services", "How It Works"
 */
export default function SectionLabel({
  children,
  className,
  variant = 'default',
}: SectionLabelProps) {
  const colors = {
    default: 'text-burgundy-700',
    dark:    'text-gold-glow',
    gold:    'text-gold-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-[10px]',
        'font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em]',
        colors[variant],
        className
      )}
    >
      <span
        className={cn(
          'h-px w-6',
          variant === 'dark' ? 'bg-gold-glow' : 'bg-burgundy-700',
          variant === 'gold' && 'bg-gold-700'
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  )
}
