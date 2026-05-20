import { cn } from '@/lib/utils'
import SectionLabel from '@/components/ui/SectionLabel'
import Container from '@/components/ui/Container'

interface PageHeroProps {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  align?: 'left' | 'center'
  /** Optional stat row (e.g. "120 commissions · 4.9 stars") rendered below description */
  stat?: React.ReactNode
  /** Extra content rendered below the description (e.g. CTA buttons) */
  children?: React.ReactNode
  className?: string
}

/**
 * Standard page hero used at the top of every non-homepage public page.
 * Matches `.pg-hero` from the design system:
 *   - 160px top padding (to clear fixed header)
 *   - 64px bottom padding
 *   - Centered text by default (or left-aligned via `align="left"`)
 *   - eyebrow → H1 (with optional <em> emphasis) → intro paragraph
 */
export default function PageHero({
  eyebrow,
  title,
  description,
  align = 'center',
  stat,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'pt-[160px] pb-16',
        align === 'center' ? 'text-center' : 'text-left',
        className,
      )}
    >
      <Container>
        {eyebrow && (
          <div className={cn('mb-4', align === 'center' && 'flex justify-center')}>
            <SectionLabel>{eyebrow}</SectionLabel>
          </div>
        )}

        <h1
          className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
        >
          {title}
        </h1>

        {description && (
          <p
            className={cn(
              'text-lg text-ink-500 leading-[1.65] mt-4',
              align === 'center' && 'mx-auto max-w-[60ch]',
            )}
          >
            {description}
          </p>
        )}

        {stat && (
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-ink-500">
            {stat}
          </div>
        )}

        {children && <div className={cn('mt-8', align === 'center' && 'flex justify-center')}>{children}</div>}
      </Container>
    </section>
  )
}
