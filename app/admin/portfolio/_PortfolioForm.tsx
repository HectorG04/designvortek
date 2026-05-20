'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Trash2, Save, ExternalLink, ChevronRight, X } from 'lucide-react'
import {
  createPortfolioPiece,
  updatePortfolioPiece,
  deletePortfolioPiece,
} from './_actions'

type Mode = 'create' | 'edit'

export interface PortfolioFormValues {
  id?: number
  title: string
  slug: string
  category: string
  description: string
  image_url: string
  thumbnail_url: string
  additional_images: string[]
  tags: string[]
  commissioned_by: string
  tools_used: string
  hours_spent: string
  style: string
  is_featured: boolean
  is_published: boolean
  sort_order: string
  seo_title: string
  seo_description: string
}

const CATEGORIES = [
  'Character Art',
  'Tokens',
  'Portraits',
  'Anime',
  'Custom',
]

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export default function PortfolioForm({
  mode,
  initial,
}: {
  mode: Mode
  initial: PortfolioFormValues
}) {
  const [values, setValues] = useState<PortfolioFormValues>(initial)
  const [slugTouched, setSlugTouched] = useState(initial.slug !== '' && mode === 'edit')
  const [tagDraft, setTagDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const update = <K extends keyof PortfolioFormValues>(key: K, value: PortfolioFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleTitle = (value: string) => {
    update('title', value)
    if (!slugTouched) {
      update('slug', slugify(value))
    }
  }

  const handleAddTag = () => {
    const t = tagDraft.trim()
    if (!t) return
    if (values.tags.includes(t)) {
      setTagDraft('')
      return
    }
    update('tags', [...values.tags, t])
    setTagDraft('')
  }

  const removeTag = (tag: string) => {
    update('tags', values.tags.filter((t) => t !== tag))
  }

  const submit = (publishOverride?: boolean) => {
    setError(null)
    const fd = new FormData()
    if (values.id) fd.set('id', String(values.id))
    fd.set('title', values.title)
    fd.set('slug', values.slug)
    fd.set('category', values.category)
    fd.set('description', values.description)
    fd.set('image_url', values.image_url)
    fd.set('thumbnail_url', values.thumbnail_url)
    fd.set('additional_images', values.additional_images.join('\n'))
    fd.set('tags', values.tags.join(','))
    fd.set('commissioned_by', values.commissioned_by)
    fd.set('tools_used', values.tools_used)
    fd.set('hours_spent', values.hours_spent)
    fd.set('style', values.style)
    fd.set('sort_order', values.sort_order)
    fd.set('seo_title', values.seo_title)
    fd.set('seo_description', values.seo_description)
    const publishValue = publishOverride ?? values.is_published
    if (publishValue) fd.set('is_published', 'on')
    if (values.is_featured) fd.set('is_featured', 'on')

    startTransition(async () => {
      const action = mode === 'create' ? createPortfolioPiece : updatePortfolioPiece
      const res = await action(fd)
      // redirect throws — only get here if there was a validation error
      if (res && 'ok' in res && !res.ok) {
        setError(res.error ?? 'Something went wrong')
      }
    })
  }

  const handleDelete = () => {
    if (!values.id) return
    if (!confirm('Delete this portfolio piece? This cannot be undone.')) return
    const fd = new FormData()
    fd.set('id', String(values.id))
    startTransition(async () => {
      const res = await deletePortfolioPiece(fd)
      if (res && 'ok' in res && !res.ok) {
        setError(res.error ?? 'Something went wrong')
      }
    })
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[0.75rem] text-ink-500 mb-6">
        <Link href="/admin/portfolio" className="hover:text-burgundy-700">Portfolio</Link>
        <ChevronRight size={12} strokeWidth={1.8} />
        <span className="text-ink-900">{mode === 'create' ? 'New piece' : values.title || 'Untitled'}</span>
      </nav>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md bg-burgundy-100 border border-burgundy-700/30 text-burgundy-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* LEFT 60% */}
        <div className="flex flex-col gap-5">
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <Field label="Title">
              <input
                type="text"
                value={values.title}
                onChange={(e) => handleTitle(e.target.value)}
                placeholder="A short, evocative title"
                className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-lg font-display text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
              />
            </Field>

            <Field
              label="Slug"
              hint={
                <>
                  designvortek.com/portfolio/<strong className="text-burgundy-700 font-mono">{values.slug || '—'}</strong>
                </>
              }
            >
              <input
                type="text"
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  update('slug', slugify(e.target.value))
                }}
                placeholder="auto-from-title"
                className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm font-mono text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Category">
                <select
                  value={values.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-burgundy-500 transition-colors"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Style">
                <input
                  type="text"
                  value={values.style}
                  onChange={(e) => update('style', e.target.value)}
                  placeholder="e.g. Painterly · warm"
                  className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                />
              </Field>
            </div>

            <Field label="Description" hint="Tell the story behind the piece — what made it special.">
              <textarea
                value={values.description}
                onChange={(e) => update('description', e.target.value)}
                rows={5}
                className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors leading-relaxed"
              />
            </Field>

            <Field label="Tags">
              <div className="flex flex-wrap items-center gap-2 bg-parchment-50 border border-border-light rounded-md p-2 focus-within:border-burgundy-500 transition-colors">
                {values.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-parchment-200 text-ink-700 text-[0.75rem] rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-burgundy-700 hover:text-cream-50 transition-colors"
                      aria-label={`Remove ${tag}`}
                    >
                      <X size={10} strokeWidth={2.4} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  onBlur={handleAddTag}
                  placeholder="Add tag…"
                  className="flex-1 min-w-[120px] bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none px-1"
                />
              </div>
            </Field>
          </section>

          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <h2 className="font-display text-base font-semibold text-ink-900 mb-4">Images</h2>

            <Field label="Cover image URL" hint="Paste a public image URL — actual upload coming soon.">
              <input
                type="url"
                value={values.image_url}
                onChange={(e) => update('image_url', e.target.value)}
                placeholder="https://…"
                className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm font-mono text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
              />
            </Field>

            {values.image_url && (
              <div className="mb-5">
                <div className="aspect-[4/3] max-w-xs rounded-md overflow-hidden border border-border-light bg-parchment-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={values.image_url} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <Field label="Thumbnail URL (optional)">
              <input
                type="url"
                value={values.thumbnail_url}
                onChange={(e) => update('thumbnail_url', e.target.value)}
                placeholder="https://…"
                className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm font-mono text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
              />
            </Field>

            <Field label="Additional images" hint="One URL per line.">
              <textarea
                value={values.additional_images.join('\n')}
                onChange={(e) =>
                  update(
                    'additional_images',
                    e.target.value.split('\n').map((s) => s.trim()).filter(Boolean)
                  )
                }
                rows={4}
                placeholder={'https://example.com/img-1.jpg\nhttps://example.com/img-2.jpg'}
                className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm font-mono text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
              />
            </Field>
          </section>

          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <h2 className="font-display text-base font-semibold text-ink-900 mb-4">Project details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Commissioned by">
                <input
                  type="text"
                  value={values.commissioned_by}
                  onChange={(e) => update('commissioned_by', e.target.value)}
                  placeholder="Client name"
                  className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                />
              </Field>
              <Field label="Hours spent">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={values.hours_spent}
                  onChange={(e) => update('hours_spent', e.target.value)}
                  placeholder="e.g. 14"
                  className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                />
              </Field>
              <Field label="Tools used">
                <input
                  type="text"
                  value={values.tools_used}
                  onChange={(e) => update('tools_used', e.target.value)}
                  placeholder="Procreate · Photoshop"
                  className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                />
              </Field>
              <Field label="Sort order">
                <input
                  type="number"
                  value={values.sort_order}
                  onChange={(e) => update('sort_order', e.target.value)}
                  placeholder="0"
                  className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                />
              </Field>
            </div>
          </section>

          <details className="bg-parchment-100 border border-border-light rounded-xl">
            <summary className="cursor-pointer flex items-center justify-between px-6 py-4 list-none">
              <div>
                <div className="font-display text-base font-semibold text-ink-900">SEO &amp; metadata</div>
                <div className="text-[0.75rem] text-ink-500 mt-0.5">Title and description for search engines</div>
              </div>
              <ChevronRight size={16} strokeWidth={1.8} className="text-ink-500 transition-transform group-open:rotate-90" />
            </summary>
            <div className="px-6 pb-6">
              <Field label="Meta title">
                <input
                  type="text"
                  value={values.seo_title}
                  onChange={(e) => update('seo_title', e.target.value)}
                  placeholder="Defaults to piece title"
                  className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                />
              </Field>
              <Field label="Meta description">
                <textarea
                  value={values.seo_description}
                  onChange={(e) => update('seo_description', e.target.value)}
                  rows={3}
                  placeholder="One or two sentences for search results."
                  className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                />
              </Field>
            </div>
          </details>
        </div>

        {/* RIGHT 40% sidebar */}
        <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:self-start">
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <div className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-ink-500 mb-3">Publish</div>

            <div className="flex items-center justify-between py-2 border-b border-border-light">
              <span className="text-sm text-ink-700">Status</span>
              <ToggleButton
                value={values.is_published}
                onChange={(v) => update('is_published', v)}
                onLabel="Published"
                offLabel="Draft"
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border-light">
              <span className="text-sm text-ink-700">Featured</span>
              <ToggleButton
                value={values.is_featured}
                onChange={(v) => update('is_featured', v)}
              />
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                type="button"
                onClick={() => submit(true)}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-1.5 bg-burgundy-700 text-cream-50 px-4 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-burgundy-500 transition-colors disabled:opacity-60"
              >
                <Save size={14} strokeWidth={1.8} />
                {isPending ? 'Saving…' : (mode === 'create' ? 'Publish piece' : 'Save changes')}
              </button>
              <button
                type="button"
                onClick={() => submit(false)}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-1.5 bg-transparent border border-border-medium text-ink-700 px-4 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-parchment-200 transition-colors disabled:opacity-60"
              >
                Save as draft
              </button>
              {mode === 'edit' && values.slug && (
                <a
                  href={`/portfolio/${values.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:text-burgundy-500 mt-1"
                >
                  <ExternalLink size={12} strokeWidth={1.8} />
                  View on site
                </a>
              )}
            </div>
          </section>

          {mode === 'edit' && (
            <section className="bg-parchment-100 border border-burgundy-700/20 rounded-xl p-5">
              <div className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-burgundy-700 mb-2">Danger zone</div>
              <p className="text-[0.75rem] text-ink-500 mb-3">Once deleted, this piece cannot be recovered.</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 text-burgundy-700 hover:text-burgundy-900 hover:bg-burgundy-100 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-60"
              >
                <Trash2 size={14} strokeWidth={1.8} />
                Delete this piece
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mb-5 last:mb-0">
      <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-700 mb-1.5">
        {label}
      </label>
      {hint && <p className="text-[0.75rem] text-ink-500 mb-2">{hint}</p>}
      {children}
    </div>
  )
}

function ToggleButton({
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
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-[0.6875rem] font-semibold transition-colors ${
        value ? 'text-forest-700' : 'text-ink-500'
      }`}
    >
      <span
        className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
          value ? 'bg-forest-500' : 'bg-parchment-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-cream-50 shadow-sm transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
      {(onLabel || offLabel) && <span>{value ? onLabel : offLabel}</span>}
    </button>
  )
}
