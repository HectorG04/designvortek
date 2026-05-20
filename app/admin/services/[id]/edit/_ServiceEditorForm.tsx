'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ChevronLeft, Save, Trash2, Plus, X, AlertTriangle } from 'lucide-react'

export interface ServiceTier {
  name: string
  price: number
  turnaround_days: string
  features: string[]
}

export interface ServiceFormValues {
  id: number | null
  slug: string
  title: string
  subtitle: string
  description: string
  starting_price: number
  turnaround_days: string
  features: string[]
  hero_image: string
  sort_order: number
  is_active: boolean
  tiers: ServiceTier[]
}

interface Props {
  initialValues: ServiceFormValues
  onSave: (values: ServiceFormValues) => Promise<void>
  onDelete: (() => Promise<void>) | null
}

export default function ServiceEditorForm({ initialValues, onSave, onDelete }: Props) {
  const [values, setValues] = useState<ServiceFormValues>(initialValues)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function update<K extends keyof ServiceFormValues>(key: K, val: ServiceFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  function updateTier(idx: number, patch: Partial<ServiceTier>) {
    setValues((prev) => ({
      ...prev,
      tiers: prev.tiers.map((t, i) => (i === idx ? { ...t, ...patch } : t)),
    }))
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      try {
        await onSave(values)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to save'
        // Next's redirect throws a special error — swallow it
        if (msg.includes('NEXT_REDIRECT')) return
        setError(msg)
      }
    })
  }

  function handleDelete() {
    if (!onDelete) return
    if (!window.confirm('Delete this service? This cannot be undone.')) return
    setError(null)
    startTransition(async () => {
      try {
        await onDelete()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to delete'
        if (msg.includes('NEXT_REDIRECT')) return
        setError(msg)
      }
    })
  }

  return (
    <div>
      {/* Breadcrumb + top actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-500 hover:text-burgundy-700"
        >
          <ChevronLeft size={14} strokeWidth={2} />
          All services
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/services"
            className="inline-flex items-center gap-1.5 bg-transparent border-[1.5px] border-border-medium text-ink-700 hover:bg-parchment-200 transition-colors px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 disabled:bg-ink-300 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
          >
            <Save size={14} strokeWidth={1.8} />
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-burgundy-700 bg-burgundy-100 px-4 py-3 text-sm text-burgundy-700">
          <AlertTriangle size={18} strokeWidth={1.6} className="mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* LEFT — Main form */}
        <div className="flex flex-col gap-5">
          {/* Basics */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">Basics</h2>
            <div className="flex flex-col gap-4">
              <Field label="Title">
                <input
                  type="text"
                  value={values.title}
                  onChange={(e) => update('title', e.target.value)}
                  className={inputClass + ' font-display text-lg'}
                  placeholder="Character Art"
                />
              </Field>

              <Field label="Slug">
                <input
                  type="text"
                  value={values.slug}
                  onChange={(e) => update('slug', e.target.value)}
                  className={inputClass + ' font-mono text-sm'}
                  placeholder="character-art"
                />
              </Field>

              <Field label="Caveat tagline">
                <input
                  type="text"
                  value={values.subtitle}
                  onChange={(e) => update('subtitle', e.target.value)}
                  className={inputClass + ' text-burgundy-700'}
                  style={{ fontFamily: 'var(--font-accent)', fontSize: '1.25rem' }}
                  placeholder="your hero, painted"
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={values.description}
                  onChange={(e) => update('description', e.target.value)}
                  className={inputClass + ' min-h-[100px] resize-y'}
                  placeholder="Single-character portraits at portfolio quality…"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Starting price ($)">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={values.starting_price}
                    onChange={(e) => update('starting_price', Number(e.target.value))}
                    className={inputClass + ' font-mono'}
                  />
                </Field>
                <Field label="Turnaround">
                  <input
                    type="text"
                    value={values.turnaround_days}
                    onChange={(e) => update('turnaround_days', e.target.value)}
                    className={inputClass}
                    placeholder="7–14 days"
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-ink-900">What&apos;s included</h2>
              <button
                type="button"
                onClick={() => update('features', [...values.features, ''])}
                className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-burgundy-700 hover:text-burgundy-500"
              >
                <Plus size={12} strokeWidth={2} />
                Add feature
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {values.features.length === 0 && (
                <p className="text-sm text-ink-400 italic">No features yet. Add one above.</p>
              )}
              {values.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={f}
                    onChange={(e) =>
                      update(
                        'features',
                        values.features.map((x, j) => (j === i ? e.target.value : x)),
                      )
                    }
                    className={inputClass}
                    placeholder="e.g. 2 revisions included"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update(
                        'features',
                        values.features.filter((_, j) => j !== i),
                      )
                    }
                    className="w-9 h-9 inline-flex items-center justify-center rounded-md text-burgundy-700 hover:bg-burgundy-100 transition-colors flex-shrink-0"
                    aria-label="Remove feature"
                  >
                    <X size={16} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Tiers */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">Pricing tiers</h2>
            <div className="flex flex-col gap-4">
              {values.tiers.map((tier, i) => (
                <div
                  key={i}
                  className={[
                    'rounded-lg border p-4',
                    i === 1
                      ? 'border-gold-500 bg-gold-100/40'
                      : 'border-border-light bg-parchment-50',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-display text-base font-semibold text-ink-900">
                      {tier.name || `Tier ${i + 1}`}
                    </span>
                    {i === 1 && (
                      <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-gold-700 bg-gold-100 border border-gold-300 px-2 py-0.5 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Field label="Tier name">
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => updateTier(i, { name: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Price ($)">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={tier.price}
                        onChange={(e) => updateTier(i, { price: Number(e.target.value) })}
                        className={inputClass + ' font-mono'}
                      />
                    </Field>
                    <Field label="Turnaround">
                      <input
                        type="text"
                        value={tier.turnaround_days}
                        onChange={(e) => updateTier(i, { turnaround_days: e.target.value })}
                        className={inputClass}
                        placeholder="10 days"
                      />
                    </Field>
                  </div>
                  <Field label="Tier features (one per line)" className="mt-3">
                    <textarea
                      value={tier.features.join('\n')}
                      onChange={(e) =>
                        updateTier(i, {
                          features: e.target.value
                            .split('\n')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className={inputClass + ' min-h-[80px] resize-y text-sm'}
                      placeholder="1 character&#10;1 revision&#10;Standard rendering"
                    />
                  </Field>
                </div>
              ))}
            </div>
          </section>

          {/* Hero image */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">Hero image</h2>
            <Field label="Image URL">
              <input
                type="text"
                value={values.hero_image}
                onChange={(e) => update('hero_image', e.target.value)}
                className={inputClass + ' font-mono text-sm'}
                placeholder="/images/services/character-art-hero.webp"
              />
            </Field>
          </section>
        </div>

        {/* RIGHT — Sidebar */}
        <div className="flex flex-col gap-5">
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <div className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-ink-500 mb-3">
              Status
            </div>
            <div className="flex flex-col gap-3">
              <ToggleRow
                label="Active"
                description="Show on the public site"
                checked={values.is_active}
                onChange={(v) => update('is_active', v)}
              />
              <Field label="Sort order">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={values.sort_order}
                  onChange={(e) => update('sort_order', Number(e.target.value))}
                  className={inputClass + ' font-mono'}
                />
              </Field>
            </div>
          </section>

          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <div className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-ink-500 mb-3">
              Save
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 disabled:bg-ink-300 disabled:cursor-not-allowed transition-colors px-4 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider"
              >
                <Save size={14} strokeWidth={1.8} />
                {isPending ? 'Saving…' : 'Save changes'}
              </button>
              <Link
                href="/admin/services"
                className="w-full inline-flex items-center justify-center gap-1.5 bg-transparent border-[1.5px] border-border-medium text-ink-700 hover:bg-parchment-200 transition-colors px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
              >
                Cancel
              </Link>
            </div>
          </section>

          {onDelete && (
            <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
              <div className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-burgundy-700 mb-3">
                Danger zone
              </div>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="w-full inline-flex items-center justify-center gap-1.5 bg-transparent border-[1.5px] border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
              >
                <Trash2 size={14} strokeWidth={1.8} />
                Delete service
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

const inputClass =
  'w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors'

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={['block', className ?? ''].join(' ')}>
      <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 w-full text-left"
    >
      <span className="flex flex-col">
        <span className="text-[0.8125rem] font-semibold text-ink-900">{label}</span>
        {description && <span className="text-[0.75rem] text-ink-500 mt-0.5">{description}</span>}
      </span>
      <span
        className={[
          'relative inline-block w-10 h-5 rounded-full flex-shrink-0 transition-colors',
          checked ? 'bg-forest-500' : 'bg-parchment-300',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-0.5 w-4 h-4 bg-cream-50 rounded-full shadow-sm transition-all',
            checked ? 'left-[22px]' : 'left-0.5',
          ].join(' ')}
        />
      </span>
    </button>
  )
}
