import ReactMarkdown, { type Components } from 'react-markdown'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  /** The markdown string to render. */
  children: string
  /** Extra className applied to the wrapper. */
  className?: string
}

/**
 * Branded Markdown renderer.
 *
 * Used for body copy that contains inline emphasis (`<strong>`, `<em>`, `<a>`)
 * — FAQ answers, blog post bodies, persona descriptions with links, etc.
 *
 * Stores content as plain markdown strings (which works with the future admin
 * CMS — Tiptap/Lexical/markdown-it can read/write markdown trivially) and maps
 * tags through to Design Vortex's branded element styles:
 *   • `**bold**`       → `<strong>` with font-semibold ink-900
 *   • `*italic*`       → `<em>` (true Cormorant italic via next/font config)
 *   • `[link](/path)`  → `<Link>` (Next router) with burgundy text + gold underline
 *   • `[link](https…)` → `<a target="_blank" rel="noopener noreferrer">` same style
 *
 * Paragraph spacing comes from the parent via standard Tailwind utilities
 * (`[&_p]:mb-3` etc.) — the Markdown component itself is layout-neutral.
 *
 * Why this exists: storing copy as flat `string[]` loses inline markup.
 * See memory/feedback-css-cascade-rules.md (Rule 3).
 */
export default function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={cn('[&_p]:mb-3 [&_p:last-child]:mb-0', className)}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  )
}

const LINK_CLASSES =
  'text-burgundy-700 border-b border-gold-500 hover:text-burgundy-500 transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]'

const components: Components = {
  // Anchor mapping — internal vs. external. External opens in a new tab.
  a({ href, children, ...rest }) {
    if (!href) return <span {...(rest as React.HTMLAttributes<HTMLSpanElement>)}>{children}</span>
    const isInternal = href.startsWith('/') || href.startsWith('#')
    if (isInternal) {
      return (
        <Link href={href} className={LINK_CLASSES}>
          {children}
        </Link>
      )
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK_CLASSES}
      >
        {children}
      </a>
    )
  },

  // Bold → font-semibold ink-900 (matches design's emphasis treatment)
  strong({ children, ...rest }) {
    return (
      <strong className="font-semibold text-ink-900" {...rest}>
        {children}
      </strong>
    )
  },

  // Italic → true Cormorant italic (loaded via next/font style:['italic'])
  // We don't add font-display here — let the inherited body font carry through.
  // If you need display-italic, add it at the call site via [&_em]:font-display.

  // Strip default p margin — wrapper handles via [&_p]:mb-3
  p({ children, ...rest }) {
    return <p {...rest}>{children}</p>
  },
}
