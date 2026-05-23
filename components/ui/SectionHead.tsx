import { cn } from '@/lib/utils'
import SectionLabel from './SectionLabel'

interface SectionHeadProps {
  /** Small label above the heading (e.g. "What we create", "How it works") */
  eyebrow?: string
  /** Heading — pass plain text or JSX with <em> for emphasis */
  title: React.ReactNode
  /** Optional intro paragraph below the heading */
  description?: string | React.ReactNode
  /** "default" centers content (used inside grid sections);
   *  "left" left-aligns it (used in FAQ side column / persona text). */
  align?: 'default' | 'left'
  /** Eyebrow variant — default is dark theme; "dark" is for tome (dark) sections */
  eyebrowVariant?: 'default' | 'dark' | 'gold'
  className?: string
  /** Heading-level — defaults to h2. Use h1 on page-hero variants. */
  as?: 'h1' | 'h2' | 'h3'
}

/**
 * Standard section head used at the top of every homepage section.
 * Encapsulates the eyebrow → H2 → sub-paragraph pattern repeated 9+ times.
 *
 * Usage:
 *   <SectionHead
 *     eyebrow="What we create"
 *     title={<>Three signature <em>services</em></>}
 *     description="..."
 *   />
 *
 * Renders the canonical .hp-section-head pattern from homepage.css:
 *   - max-width 720px, mx-auto, mb-16
 *   - eyebrow → 16px gap → h2 → 16px gap → p
 *   - h2 size = display-md (clamp(2rem, 4vw, 3rem))
 *   - em inside h2: italic + burgundy-700 (or gold-glow on dark variants)
 */
export default function SectionHead({
  eyebrow,
  title,
  description,
  align = 'default',
  eyebrowVariant = 'default',
  className,
  as: Component = 'h2',
}: SectionHeadProps) {
  const isCenter = align === 'default'

  return (
    <div
      className={cn(
        'max-w-[720px]',
        isCenter ? 'mx-auto text-center' : 'text-left',
        'mb-14 md:mb-16',
        className,
      )}
    >
      {eyebrow && (
        <div className={cn('mb-4', isCenter && 'flex justify-center')}>
          <SectionLabel variant={eyebrowVariant}>{eyebrow}</SectionLabel>
        </div>
      )}

      <Component
        className={cn(
          'font-display font-semibold leading-[1.1] tracking-tight',
          // h2 by default → display-md sized via clamp; h1 gets the page-hero scale
          Component === 'h1'
            ? 'text-[2.5rem] md:text-[clamp(2.5rem,5.5vw,4.5rem)]'
            : 'text-[2rem] md:text-[clamp(2rem,4vw,3rem)]',
          // Color: default ink-900; em italic burgundy-700 (or gold-glow on dark sections — handled via parent class override)
          'text-ink-900 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700',
        )}
      >
        {title}
      </Component>

      {description && (
        <p
          className={cn(
            'text-lg text-ink-500 leading-relaxed mt-4',
            isCenter && 'mx-auto',
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
