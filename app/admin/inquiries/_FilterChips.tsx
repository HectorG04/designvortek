'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FilterChipsProps {
  counts: { all: number; unread: number; read: number; archived: number }
}

const FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'unread',   label: 'Unread' },
  { key: 'read',     label: 'Read' },
  { key: 'archived', label: 'Archived' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

export default function FilterChips({ counts }: FilterChipsProps) {
  const [active, setActive] = useState<FilterKey>('unread')

  return (
    <div className="flex flex-wrap gap-2 mb-5">
      {FILTERS.map((f) => {
        const isActive = f.key === active
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => setActive(f.key)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.75rem] font-semibold tracking-[0.05em] transition-colors',
              isActive
                ? 'border-burgundy-700 bg-burgundy-700 text-cream-50'
                : 'border-border-light bg-parchment-100 text-ink-700 hover:bg-parchment-200'
            )}
          >
            {f.label}
            <span
              className={cn(
                'min-w-[20px] text-center text-[0.625rem] font-bold px-1.5 py-0.5 rounded-full',
                isActive
                  ? 'bg-cream-50/20 text-cream-50'
                  : 'bg-parchment-300 text-ink-700'
              )}
            >
              {counts[f.key] ?? 0}
            </span>
          </button>
        )
      })}
    </div>
  )
}
