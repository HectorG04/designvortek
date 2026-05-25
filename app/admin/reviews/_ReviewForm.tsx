'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Star, Save, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { createReview, updateReview, deleteReviewById } from './_actions'

type Mode = 'create' | 'edit'

export interface ReviewFormValues {
  id?: number
  customer_name: string
  customer_role: string
  content: string
  rating: number
  service_type: string
  avatar_url: string
  is_approved: boolean
  is_featured: boolean
}

const SERVICE_TYPES = [
  'Character Art',
  'Tokens',
  'Portraits',
  'Anime',
  'Custom',
  'Character commission',
  'Party portrait',
  'NPC pack',
  'Book cover',
  'VTT token',
]

const ROLE_SUGGESTIONS = [
  'Character commission',
  'Character commission · D&D',
  'Character commission · gift',
  'Party portrait',
  'Party portrait · gift',
  'NPC pack',
  'VTT token',
  'Custom · campaign banner',
  'Custom · wedding avatars',
  'Magic item card',
  'Fan art commission',
  'Album cover art',
  'Returning client',
  'First-time client',
]

export default function ReviewForm({
  mode,
  initial,
}: {
  mode: Mode
  initial: ReviewFormValues
}) {
  const [values, setValues] = useState<ReviewFormValues>(initial)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const update = <K extends keyof ReviewFormValues>(key: K, value: ReviewFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const submit = () => {
    setError(null)
    const fd = new FormData()
    if (values.id) fd.set('id', String(values.id))
    fd.set('customer_name', values.customer_name)
    fd.set('customer_role', values.customer_role)
    fd.set('content', values.content)
    fd.set('rating', String(values.rating))
    fd.set('service_type', values.service_type)
    fd.set('avatar_url', values.avatar_url)
    if (values.is_approved) fd.set('is_approved', 'on')
    if (values.is_featured) fd.set('is_featured', 'on')

    startTransition(async () => {
      const action = mode === 'create' ? createReview : updateReview
      const res = await action(fd)
      if (res && 'ok' in res && !res.ok) {
        setError(res.error ?? 'Something went wrong')
      }
    })
  }

  const handleDelete = () => {
    if (!values.id) return
    if (!confirm('Delete this review? This cannot be undone.')) return
    const fd = new FormData()
    fd.set('id', String(values.id))
    startTransition(async () => {
      const res = await deleteReviewById(fd)
      if (res && 'ok' in res && !res.ok) {
        setError(res.error ?? 'Something went wrong')
      }
    })
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[0.75rem] text-ink-500 mb-6">
        <Link href="/admin/reviews" className="inline-flex items-center gap-1 hover:text-burgundy-700">
          <ChevronLeft size={12} strokeWidth={1.8} />
          Reviews
        </Link>
        <ChevronRight size={12} strokeWidth={1.8} />
        <span className="text-ink-900">
          {mode === 'create' ? 'New review' : values.customer_name || 'Edit review'}
        </span>
      </nav>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md bg-burgundy-100 border border-burgundy-700/30 text-burgundy-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:p-[26px]">
            <Field label="Customer name">
              <input
                type="text"
                value={values.customer_name}
                onChange={(e) => update('customer_name', e.target.value)}
                placeholder="Tess R."
                className={inputClass + ' text-xl font-display font-semibold'}
              />
            </Field>

            <Field
              label="Role / context"
              hint="What context did the review come from? Shown under the name on the public card."
            >
              <input
                type="text"
                list="review-roles"
                value={values.customer_role}
                onChange={(e) => update('customer_role', e.target.value)}
                placeholder="Character commission · D&D"
                className={inputClass}
              />
              <datalist id="review-roles">
                {ROLE_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>

            <Field
              label="Service type"
              hint="Optional category chip shown on the public card."
            >
              <input
                type="text"
                list="review-service-types"
                value={values.service_type}
                onChange={(e) => update('service_type', e.target.value)}
                placeholder="Character Art"
                className={inputClass}
              />
              <datalist id="review-service-types">
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>

            <Field label="Rating">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update('rating', n)}
                    className="p-1 hover:scale-110 transition-transform"
                    aria-label={`Set rating to ${n}`}
                  >
                    <Star
                      size={24}
                      strokeWidth={1.5}
                      className={
                        n <= values.rating
                          ? 'fill-gold-500 text-gold-500'
                          : 'text-ink-300'
                      }
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm text-ink-500">{values.rating} of 5</span>
              </div>
            </Field>

            <Field
              label="Content"
              hint="Markdown supported — use **bold** to emphasise a key beat. Keep it natural; long quotes are fine."
              className="mb-0"
            >
              <textarea
                value={values.content}
                onChange={(e) => update('content', e.target.value)}
                rows={8}
                placeholder="The painting came back better than the mood board I sent. Communication was thoughtful from the first email."
                className={inputClass + ' min-h-[200px] leading-relaxed resize-y'}
              />
            </Field>
          </section>

          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:p-[26px]">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">Avatar</h2>
            <Field
              label="Avatar URL (optional)"
              hint="If empty, the public card renders initials on a burgundy gradient."
              className="mb-0"
            >
              <input
                type="url"
                value={values.avatar_url}
                onChange={(e) => update('avatar_url', e.target.value)}
                placeholder="https://…"
                className={inputClass + ' font-mono text-sm'}
              />
            </Field>
          </section>
        </div>

        {/* RIGHT sidebar */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:px-[26px] lg:py-6">
            <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-2">
              Visibility
            </div>

            <div className="flex flex-col gap-1">
              <PublishRow label="Approved">
                <ToggleSwitch
                  value={values.is_approved}
                  onChange={(v) => update('is_approved', v)}
                  onLabel="Public"
                  offLabel="Pending"
                />
              </PublishRow>
              <PublishRow label="Featured">
                <ToggleSwitch
                  value={values.is_featured}
                  onChange={(v) => update('is_featured', v)}
                />
              </PublishRow>
            </div>

            <div className="text-[0.75rem] text-ink-500 mt-3 leading-snug">
              Approved reviews appear on /reviews. Featured reviews also appear on the homepage
              testimonials row.
            </div>

            <div className="flex flex-col gap-2 mt-5">
              <button
                type="button"
                onClick={submit}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 bg-burgundy-700 text-cream-50 px-7 py-3 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] hover:bg-burgundy-500 hover:shadow-md hover:-translate-y-px active:bg-burgundy-900 transition-all disabled:bg-ink-300 disabled:text-ink-400 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
              >
                <Save size={14} strokeWidth={1.8} />
                {isPending ? 'Saving…' : mode === 'create' ? 'Add review' : 'Save changes'}
              </button>
            </div>
          </section>

          {mode === 'edit' && (
            <section className="bg-parchment-100 border border-burgundy-700/20 rounded-xl p-6 lg:px-[26px] lg:py-5">
              <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 mb-2">
                Danger zone
              </div>
              <p className="text-[0.75rem] text-ink-500 mb-3">
                Once deleted, this review cannot be recovered.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 text-burgundy-700 hover:bg-burgundy-100 px-3 py-2 rounded-md text-[0.6875rem] font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-60 w-full justify-start"
              >
                <Trash2 size={14} strokeWidth={1.8} />
                Delete this review
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

function PublishRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-dashed border-border-light last:border-b-0">
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
