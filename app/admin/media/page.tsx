import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import { Upload, ImageIcon, Info } from 'lucide-react'

export const metadata: Metadata = { title: 'Media' }

const FILTERS = [
  { key: 'all', label: 'All', count: 12 },
  { key: 'images', label: 'Images', count: 12 },
  { key: 'videos', label: 'Videos', count: 0 },
  { key: 'docs', label: 'Docs', count: 0 },
] as const

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, var(--color-burgundy-700), var(--color-gold-700))',
  'linear-gradient(160deg, var(--color-parchment-300), var(--color-gold-300))',
  'linear-gradient(180deg, var(--color-tome-900), var(--color-burgundy-700))',
  'linear-gradient(135deg, var(--color-forest-700), var(--color-forest-500))',
  'linear-gradient(150deg, var(--color-gold-500), var(--color-parchment-100))',
  'linear-gradient(135deg, var(--color-burgundy-100), var(--color-parchment-300))',
  'linear-gradient(140deg, var(--color-tome-800), var(--color-burgundy-900))',
  'linear-gradient(160deg, var(--color-gold-700), var(--color-parchment-50))',
  'linear-gradient(135deg, var(--color-forest-500), var(--color-gold-500))',
  'linear-gradient(170deg, var(--color-burgundy-700), var(--color-tome-900))',
  'linear-gradient(120deg, var(--color-parchment-200), var(--color-gold-300))',
  'linear-gradient(135deg, var(--color-tome-950), var(--color-burgundy-500))',
]

export default async function MediaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <AdminShell
      user={{ email, initials }}
      title="Media library"
      subtitle="Centralized asset management — placeholder view"
      actions={
        <button
          type="button"
          disabled
          className="hidden sm:inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 disabled:bg-ink-300 disabled:text-ink-400 disabled:cursor-not-allowed px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
        >
          <Upload size={14} strokeWidth={1.8} />
          Upload
        </button>
      }
    >
      {/* Info banner */}
      <div className="mb-6 flex items-start gap-3 bg-gold-100 border border-gold-300 rounded-xl px-4 py-3">
        <Info
          size={18}
          strokeWidth={1.8}
          className="text-gold-700 mt-0.5 flex-shrink-0"
        />
        <div className="text-[0.875rem] text-ink-700">
          <p className="font-semibold text-ink-900">Media library coming soon.</p>
          <p className="mt-1">
            For now, host images on Supabase Storage or a CDN and use direct
            URLs in the portfolio and blog editors.
          </p>
        </div>
      </div>

      {/* Filter chips (visual only) */}
      <div className="flex flex-wrap items-center gap-2 mb-5 px-4 py-3 bg-parchment-100 border border-border-light rounded-xl">
        {FILTERS.map((f) => {
          const isActive = f.key === 'all'
          return (
            <span
              key={f.key}
              aria-disabled="true"
              className={
                isActive
                  ? 'inline-flex items-center gap-1.5 rounded-full border border-burgundy-700 bg-burgundy-700 px-3.5 py-1.5 text-[0.8125rem] text-cream-50 cursor-default'
                  : 'inline-flex items-center gap-1.5 rounded-full border border-border-light bg-parchment-50 px-3.5 py-1.5 text-[0.8125rem] text-ink-700 cursor-default opacity-70'
              }
            >
              {f.label}
              <span
                className={
                  isActive
                    ? 'inline-block min-w-[20px] px-1.5 text-center text-[0.6875rem] font-semibold rounded-full bg-cream-50/[0.20] text-cream-50'
                    : 'inline-block min-w-[20px] px-1.5 text-center text-[0.6875rem] font-semibold rounded-full bg-parchment-300 text-ink-700'
                }
              >
                {f.count}
              </span>
            </span>
          )
        })}
      </div>

      {/* Placeholder grid */}
      <section className="bg-parchment-100 border border-border-light rounded-xl p-5 lg:p-6">
        <header className="mb-4 flex items-center gap-2">
          <ImageIcon
            size={16}
            strokeWidth={1.8}
            className="text-gold-700"
          />
          <h2 className="font-display text-base font-semibold text-ink-900 tracking-tight">
            Recent uploads (preview)
          </h2>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {PLACEHOLDER_GRADIENTS.map((bg, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden border border-border-light bg-parchment-50 relative aspect-square"
            >
              <div className="absolute inset-0" style={{ background: bg }} />
              <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.6),transparent_60%)]" />
              <div className="absolute bottom-0 left-0 right-0 px-2.5 py-1.5 flex items-center justify-between bg-tome-950/[0.70] backdrop-blur-sm text-cream-50">
                <span className="text-[0.6875rem] font-mono truncate">
                  placeholder-{(i + 1).toString().padStart(2, '0')}.webp
                </span>
                <span className="text-[0.6875rem] font-mono flex-shrink-0 opacity-70">
                  —
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[0.75rem] text-ink-500 mt-5 text-center">
          These tiles are visual placeholders. Real uploads land here once
          storage is wired up.
        </p>
      </section>
    </AdminShell>
  )
}
