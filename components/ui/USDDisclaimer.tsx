/* =====================================================================
   USDDisclaimer — small disclaimer chip placed near prominent prices.

   Phase 3 interim version. The polished design from Claude Design's
   handoff will replace this with a more refined visual treatment.

   Two variants:
   - `inline`: single-line, very small, for chip-row placement
   - `block`:  slightly larger, sits as its own row beneath a price grid
   ===================================================================== */

interface Props {
  variant?: 'inline' | 'block'
  className?: string
}

export default function USDDisclaimer({ variant = 'inline', className }: Props) {
  const text = 'Prices in USD. International cards billed at the current exchange rate.'

  if (variant === 'inline') {
    return (
      <span
        className={
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-parchment-200 text-ink-500 text-[0.6875rem] font-medium tracking-[0.01em] ' +
          (className ?? '')
        }
      >
        <DollarIcon />
        {text}
      </span>
    )
  }

  return (
    <span
      className={
        'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-parchment-200 border border-border-light text-ink-500 text-xs font-medium ' +
        (className ?? '')
      }
    >
      <DollarIcon />
      {text}
    </span>
  )
}

function DollarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3 flex-shrink-0 text-ink-500"
      aria-hidden="true"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  )
}
