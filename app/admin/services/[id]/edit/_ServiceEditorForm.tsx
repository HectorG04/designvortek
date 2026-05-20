'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  Plus,
  X,
  AlertTriangle,
} from 'lucide-react'

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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[0.75rem] text-ink-500 mb-6">
        <Link href="/admin/services" className="inline-flex items-center gap-1 hover:text-burgundy-700">
          <ChevronLeft size={12} strokeWidth={1.8} />
          Services
        </Link>
        <ChevronRight size={12} strokeWidth={1.8} />
        <span className="text-ink-900">{values.title || 'Untitled service'}</span>
      </nav>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-burgundy-700 bg-burgundy-100 px-4 py-3 text-sm text-burgundy-700">
          <AlertTriangle size={18} strokeWidth={1.6} className="mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        {/* LEFT — Main form */}
        <div className="flex flex-col gap-4">
          {/* Basics */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:p-[26px]">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">Basics</h2>

            <Field label="Service name">
              <input
                type="text"
                value={values.title}
                onChange={(e) => update('title', e.target.value)}
                className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-3.5 text-3xl font-display font-semibold text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:shadow-[0_0_0_3px_var(--color-burgundy-100)] transition-all tracking-tight"
                placeholder="Character Art"
              />
            </Field>

            <Field label="Caveat subtitle">
              <input
                type="text"
                value={values.subtitle}
                onChange={(e) => update('subtitle', e.target.value)}
                className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-2.5 text-burgundy-700 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:shadow-[0_0_0_3px_var(--color-burgundy-100)] transition-all font-accent text-xl"
                placeholder="your hero, painted"
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

            <Field label="Short description (card)" hint="Markdown supported." className="mb-0">
              <textarea
                value={values.description}
                onChange={(e) => update('description', e.target.value)}
                className={inputClass + ' min-h-[100px] resize-y'}
                placeholder="Single-character portraits at portfolio quality…"
              />
            </Field>
          </section>

          {/* Hero image */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:p-[26px]">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">Hero image</h2>
            <Field label="Image URL" className="mb-0">
              <input
                type="text"
                value={values.hero_image}
                onChange={(e) => update('hero_image', e.target.value)}
                className={inputClass + ' font-mono text-sm'}
                placeholder="/images/services/character-art-hero.webp"
              />
            </Field>
            {values.hero_image && (
              <div className="mt-4 aspect-[16/9] max-w-md rounded-md overflow-hidden border border-border-light bg-parchment-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={values.hero_image}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </section>

          {/* Features */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:p-[26px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-ink-900">What&apos;s included</h2>
              <button
                type="button"
                onClick={() => update('features', [...values.features, ''])}
                className="inline-flex items-center gap-1.5 border-[1.5px] border-dashed border-border-medium text-ink-700 px-3.5 py-2 rounded-md text-[0.8125rem] font-medium hover:bg-parchment-200 transition-colors"
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
                    className="w-[34px] h-[34px] inline-flex items-center justify-center rounded-sm text-burgundy-700 hover:bg-burgundy-100 border border-transparent hover:border-burgundy-100 transition-colors flex-shrink-0"
                    aria-label="Remove feature"
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Tiers */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:p-[26px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-ink-900">Pricing tiers</h2>
            </div>
            <div className="flex flex-col gap-3">
              {values.tiers.map((tier, i) => {
                const isFeatured = i === 1
                return (
                  <div
                    key={i}
                    className={[
                      'relative rounded-md p-4',
                      isFeatured
                        ? 'border-[1.5px] border-gold-500 bg-gold-100/50'
                        : 'border border-border-light bg-parchment-50',
                    ].join(' ')}
                  >
                    {isFeatured && (
                      <span className="absolute -top-2.5 right-3.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-700 text-[0.6875rem] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                        Featured
                      </span>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_110px_110px] gap-3 mb-3">
                      <Field label="Tier name" className="mb-0">
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => updateTier(i, { name: e.target.value })}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Price ($)" className="mb-0">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={tier.price}
                          onChange={(e) => updateTier(i, { price: Number(e.target.value) })}
                          className={inputClass + ' font-mono'}
                        />
                      </Field>
                      <Field label="Turnaround" className="mb-0">
                        <input
                          type="text"
                          value={tier.turnaround_days}
                          onChange={(e) => updateTier(i, { turnaround_days: e.target.value })}
                          className={inputClass}
                          placeholder="10 days"
                        />
                      </Field>
                    </div>
                    <Field label="Tier features (one per line)" hint="Markdown supported." className="mb-0">
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
                )
              })}
            </div>
          </section>
        </div>

        {/* RIGHT — Sidebar */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:px-[26px] lg:py-6">
            <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-2">
              Status
            </div>
            <div className="flex flex-col">
              <PublishRow label="Active">
                <ToggleSwitch
                  value={values.is_active}
                  onChange={(v) => update('is_active', v)}
                  onLabel="Live"
                  offLabel="Off"
                />
              </PublishRow>
              <div className="flex flex-col gap-1.5 py-2.5">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700">
                  Sort order
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={values.sort_order}
                  onChange={(e) => update('sort_order', Number(e.target.value))}
                  className={inputClass + ' font-mono'}
                />
              </div>
              <div className="flex flex-col gap-1.5 py-2.5">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700">
                  Starting price ($)
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={values.starting_price}
                  onChange={(e) => update('starting_price', Number(e.target.value))}
                  className={inputClass + ' font-mono'}
                />
              </div>
              <div className="flex flex-col gap-1.5 py-2.5">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700">
                  Turnaround
                </span>
                <input
                  type="text"
                  value={values.turnaround_days}
                  onChange={(e) => update('turnaround_days', e.target.value)}
                  className={inputClass}
                  placeholder="7–14 days"
                />
              </div>
            </div>
          </section>

          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:px-[26px] lg:py-6">
            <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-3">
              Save
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 bg-burgundy-700 text-cream-50 px-7 py-3 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] hover:bg-burgundy-500 hover:shadow-md hover:-translate-y-px active:bg-burgundy-900 transition-all disabled:bg-ink-300 disabled:text-ink-400 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
              >
                <Save size={14} strokeWidth={1.8} />
                {isPending ? 'Saving…' : 'Save changes'}
              </button>
              <Link
                href="/admin/services"
                className="inline-flex items-center justify-center gap-2 bg-transparent border-[1.5px] border-burgundy-700 text-burgundy-700 px-7 py-3 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] hover:bg-burgundy-700 hover:text-cream-50 transition-all"
              >
                Cancel
              </Link>
            </div>
          </section>

          {onDelete && (
            <section className="bg-parchment-100 border border-burgundy-700/20 rounded-xl p-6 lg:px-[26px] lg:py-5">
              <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 mb-2">
                Danger zone
              </div>
              <p className="text-[0.75rem] text-ink-500 mb-3">Once deleted, this service cannot be recovered.</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 text-burgundy-700 hover:bg-burgundy-100 px-3 py-2 rounded-md text-[0.6875rem] font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-60 w-full justify-start"
              >
                <Trash2 size={14} strokeWidth={1.8} />
                Delete this service
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

const inputClass =
  'w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-3.5 py-2.5 text-[0.9375rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:shadow-[0_0_0_3px_var(--color-burgundy-100)] transition-all'

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={'flex flex-col gap-1.5 mb-4 ' + (className ?? '')}>
      <label className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700">
        {label}
      </label>
      {hint && <p className="text-[0.75rem] text-ink-500 leading-snug">{hint}</p>}
      {children}
    </div>
  )
}

function PublishRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-dashed border-border-light">
      <span className="text-[0.8125rem] text-ink-500">{label}</span>
      {children}
    </div>
  )
}

function ToggleSwitch({
  value,
  onChange,
  onLabel,
  offLabel,
}: {
  value: boolean
  onChange: (v: boolean) => void
  onLabel?: string
  offLabel?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`inline-flex items-center gap-2.5 text-[0.8125rem] font-medium transition-colors ${
        value ? 'text-ink-900' : 'text-ink-500'
      }`}
    >
      {(onLabel || offLabel) && <span>{value ? onLabel : offLabel}</span>}
      <span
        className={`relative inline-block w-10 h-[22px] rounded-full transition-colors ${
          value ? 'bg-burgundy-700' : 'bg-parchment-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-cream-50 shadow-sm transition-transform ${
            value ? 'translate-x-[18px]' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}
