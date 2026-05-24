'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Trash2,
  Save,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  X,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Link as LinkIcon,
  ImageIcon,
} from 'lucide-react'
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from './_actions'

type Mode = 'create' | 'edit'

export interface BlogFormValues {
  id?: number
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  category: string
  tags: string[]
  author_name: string
  is_published: boolean
  published_at: string
  read_time_minutes: string
  seo_title: string
  seo_description: string
  is_pillar: boolean
  pillar_genre: string
}

const CATEGORIES = [
  'Guides',
  'Behind the scenes',
  'D&D',
  'Process',
  'Tutorials',
]

/* Mirrors lib/blog.ts GENRES exactly. Kept inline so the admin form
 * (client) doesn't import from the server module. */
const GENRE_OPTIONS: { slug: string; label: string }[] = [
  { slug: 'fantasy',      label: 'Fantasy' },
  { slug: 'dnd-5e',       label: 'D&D 5e' },
  { slug: 'sci-fi',       label: 'Sci-fi' },
  { slug: 'cyberpunk',    label: 'Cyberpunk' },
  { slug: 'horror',       label: 'Horror' },
  { slug: 'modern',       label: 'Modern' },
  { slug: 'historical',   label: 'Historical' },
  { slug: 'souls-anime',  label: 'Souls & anime fan art' },
  { slug: 'western',      label: 'Western' },
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

export default function BlogForm({
  mode,
  initial,
}: {
  mode: Mode
  initial: BlogFormValues
}) {
  const [values, setValues] = useState<BlogFormValues>(initial)
  const [slugTouched, setSlugTouched] = useState(initial.slug !== '' && mode === 'edit')
  const [tagDraft, setTagDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const update = <K extends keyof BlogFormValues>(key: K, value: BlogFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleTitle = (value: string) => {
    update('title', value)
    if (!slugTouched) update('slug', slugify(value))
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
    fd.set('excerpt', values.excerpt)
    fd.set('content', values.content)
    fd.set('featured_image', values.featured_image)
    fd.set('category', values.category)
    fd.set('tags', values.tags.join(','))
    fd.set('author_name', values.author_name)
    fd.set('published_at', values.published_at)
    fd.set('read_time_minutes', values.read_time_minutes)
    fd.set('seo_title', values.seo_title)
    fd.set('seo_description', values.seo_description)
    fd.set('pillar_genre', values.pillar_genre)
    if (values.is_pillar && values.pillar_genre) fd.set('is_pillar', 'on')
    const publishValue = publishOverride ?? values.is_published
    if (publishValue) fd.set('is_published', 'on')

    startTransition(async () => {
      const action = mode === 'create' ? createBlogPost : updateBlogPost
      const res = await action(fd)
      if (res && 'ok' in res && !res.ok) {
        setError(res.error ?? 'Something went wrong')
      }
    })
  }

  const handleDelete = () => {
    if (!values.id) return
    if (!confirm('Delete this post? This cannot be undone.')) return
    const fd = new FormData()
    fd.set('id', String(values.id))
    startTransition(async () => {
      const res = await deleteBlogPost(fd)
      if (res && 'ok' in res && !res.ok) {
        setError(res.error ?? 'Something went wrong')
      }
    })
  }

  const toolbarButtons = [
    { Icon: Heading2, label: 'Heading 2' },
    { Icon: Heading3, label: 'Heading 3' },
    { Icon: Bold, label: 'Bold' },
    { Icon: Italic, label: 'Italic' },
    { Icon: Quote, label: 'Quote' },
    { Icon: LinkIcon, label: 'Link' },
    { Icon: ImageIcon, label: 'Image' },
  ]

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[0.75rem] text-ink-500 mb-6">
        <Link href="/admin/blog" className="inline-flex items-center gap-1 hover:text-burgundy-700">
          <ChevronLeft size={12} strokeWidth={1.8} />
          Blog
        </Link>
        <ChevronRight size={12} strokeWidth={1.8} />
        <span className="text-ink-900">{mode === 'create' ? 'New post' : values.title || 'Untitled'}</span>
      </nav>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md bg-burgundy-100 border border-burgundy-700/30 text-burgundy-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-start">
        {/* LEFT — editor */}
        <div className="flex flex-col gap-4">
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:p-[26px]">
            <Field label="Title">
              <input
                type="text"
                value={values.title}
                onChange={(e) => handleTitle(e.target.value)}
                placeholder="Post title"
                className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-3.5 text-3xl md:text-[1.875rem] font-display font-semibold text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:shadow-[0_0_0_3px_var(--color-burgundy-100)] transition-all tracking-tight"
              />
            </Field>

            <Field
              label="Slug"
              labelExtra={
                <span className="text-ink-500 font-normal normal-case tracking-normal text-xs">
                  /blog/
                  <strong className="text-burgundy-700 font-mono">{values.slug || '—'}</strong>
                </span>
              }
              className="mb-0"
            >
              <input
                type="text"
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  update('slug', slugify(e.target.value))
                }}
                placeholder="auto-from-title"
                className={inputClass + ' font-mono text-sm'}
              />
            </Field>
          </section>

          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:p-[26px]">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">Featured image</h2>
            <Field label="Image URL">
              <input
                type="url"
                value={values.featured_image}
                onChange={(e) => update('featured_image', e.target.value)}
                placeholder="https://…"
                className={inputClass + ' font-mono text-sm'}
              />
            </Field>
            {values.featured_image && (
              <div className="aspect-[16/9] max-w-md rounded-md overflow-hidden border border-border-light bg-parchment-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={values.featured_image}
                  alt="Featured preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </section>

          <section className="bg-parchment-100 border border-border-light rounded-xl overflow-hidden">
            {/* Visual-only toolbar */}
            <div className="flex flex-wrap items-center gap-[2px] p-2 bg-parchment-50 border-b border-border-light">
              {toolbarButtons.map(({ Icon, label }, idx) => (
                <span key={label} className="contents">
                  {idx === 2 && <Divider />}
                  {idx === 4 && <Divider />}
                  <button
                    type="button"
                    title={label}
                    aria-label={label}
                    onClick={(e) => e.preventDefault()}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-sm text-ink-500 hover:bg-parchment-200 hover:text-burgundy-700 transition-colors"
                  >
                    <Icon size={15} strokeWidth={1.8} />
                  </button>
                </span>
              ))}
            </div>

            <div className="p-6 lg:p-[26px]">
              <Field label="Excerpt">
                <textarea
                  value={values.excerpt}
                  onChange={(e) => update('excerpt', e.target.value)}
                  rows={2}
                  placeholder="One or two sentence summary."
                  className={inputClass + ' min-h-[64px] resize-y'}
                />
              </Field>

              <Field label="Content" hint="Write in Markdown. Renders via the public blog post page." className="mb-0">
                <textarea
                  value={values.content}
                  onChange={(e) => update('content', e.target.value)}
                  placeholder="# Heading&#10;&#10;Start writing…"
                  className="w-full min-h-[600px] bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-3 text-[0.9375rem] font-mono text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:shadow-[0_0_0_3px_var(--color-burgundy-100)] transition-all leading-relaxed resize-y"
                />
              </Field>
            </div>
          </section>
        </div>

        {/* RIGHT — sidebar */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:px-[26px] lg:py-6">
            <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-2">Publish</div>

            <div className="flex flex-col">
              <PublishRow label="Status">
                <ToggleSwitch
                  value={values.is_published}
                  onChange={(v) => update('is_published', v)}
                  onLabel="Published"
                  offLabel="Draft"
                />
              </PublishRow>
              <div className="flex flex-col gap-1.5 py-2.5 border-b border-dashed border-border-light">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700">
                  Publish date
                </span>
                <input
                  type="datetime-local"
                  value={values.published_at}
                  onChange={(e) => update('published_at', e.target.value)}
                  className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-2.5 py-2 text-xs text-ink-900 focus:outline-none focus:border-burgundy-500 focus:shadow-[0_0_0_3px_var(--color-burgundy-100)] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                type="button"
                onClick={() => submit(true)}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 bg-burgundy-700 text-cream-50 px-7 py-3 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] hover:bg-burgundy-500 hover:shadow-md hover:-translate-y-px active:bg-burgundy-900 transition-all disabled:bg-ink-300 disabled:text-ink-400 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
              >
                <Save size={14} strokeWidth={1.8} />
                {isPending ? 'Saving…' : (mode === 'create' ? 'Publish post' : 'Update post')}
              </button>
              <button
                type="button"
                onClick={() => submit(false)}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 bg-transparent border-[1.5px] border-burgundy-700 text-burgundy-700 px-7 py-3 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] hover:bg-burgundy-700 hover:text-cream-50 transition-all disabled:opacity-60"
              >
                Save as draft
              </button>
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 bg-transparent text-ink-500 px-7 py-2.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] opacity-60 cursor-not-allowed"
                title="Preview coming soon"
              >
                Preview
              </button>
              {mode === 'edit' && values.slug && (
                <a
                  href={`/blog/${values.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-burgundy-700 hover:text-burgundy-500 mt-1"
                >
                  <ExternalLink size={12} strokeWidth={1.8} />
                  View on site
                </a>
              )}
            </div>
          </section>

          {/* Pillar / genre — make this post the SEO authority page
              for one genre. Only one pillar per genre is enforced at
              the DB level. */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:px-[26px] lg:py-6">
            <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-2">Pillar</div>

            <div className="flex flex-col">
              <PublishRow label="Is pillar?">
                <ToggleSwitch
                  value={values.is_pillar}
                  onChange={(v) => update('is_pillar', v)}
                  onLabel="Yes"
                  offLabel="No"
                />
              </PublishRow>

              <div className="flex flex-col gap-1.5 py-2.5">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700">
                  Pillar genre
                </span>
                <select
                  value={values.pillar_genre}
                  onChange={(e) => update('pillar_genre', e.target.value)}
                  disabled={!values.is_pillar}
                  className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-2.5 py-2 text-xs text-ink-900 focus:outline-none focus:border-burgundy-500 focus:shadow-[0_0_0_3px_var(--color-burgundy-100)] transition-all disabled:bg-parchment-200 disabled:text-ink-400 disabled:cursor-not-allowed"
                >
                  <option value="">— select a genre —</option>
                  {GENRE_OPTIONS.map((g) => (
                    <option key={g.slug} value={g.slug}>{g.label}</option>
                  ))}
                </select>
                <p className="text-[0.6875rem] text-ink-500 leading-snug mt-1">
                  When on, this post becomes the authority page at{' '}
                  <strong className="text-ink-700">/pillars/{values.pillar_genre || '<genre>'}</strong>.
                  Tag every spoke post in this genre with the same slug.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:px-[26px] lg:py-6">
            <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-3">
              Category &amp; tags
            </div>

            <Field label="Category">
              <select
                value={values.category}
                onChange={(e) => update('category', e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Tags" className="mb-0">
              <div className="flex flex-wrap items-center gap-1.5 bg-parchment-50 border-[1.5px] border-border-light rounded-md px-2.5 py-2 min-h-[44px] focus-within:border-burgundy-500 focus-within:shadow-[0_0_0_3px_var(--color-burgundy-100)] transition-all">
                {values.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-parchment-200 text-ink-700 text-[0.8125rem] rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="inline-flex items-center justify-center text-ink-500 hover:text-burgundy-700"
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
                  className="flex-1 min-w-[100px] bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none px-1 py-1"
                />
              </div>
            </Field>
          </section>

          <section className="bg-parchment-100 border border-border-light rounded-xl p-6 lg:px-[26px] lg:py-6">
            <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-3">
              Author &amp; meta
            </div>

            <Field label="Author name">
              <input
                type="text"
                value={values.author_name}
                onChange={(e) => update('author_name', e.target.value)}
                placeholder="Studio"
                className={inputClass}
              />
            </Field>

            <Field label="Read time (minutes)" className="mb-0">
              <input
                type="number"
                min={0}
                value={values.read_time_minutes}
                onChange={(e) => update('read_time_minutes', e.target.value)}
                placeholder="e.g. 8"
                className={inputClass + ' font-mono'}
              />
            </Field>
          </section>

          <details className="group bg-parchment-100 border border-border-light rounded-xl">
            <summary className="cursor-pointer flex items-center justify-between px-6 lg:px-[26px] py-5 list-none">
              <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500">SEO</div>
              <ChevronRight
                size={16}
                strokeWidth={1.8}
                className="text-ink-500 transition-transform group-open:rotate-90"
              />
            </summary>
            <div className="px-6 lg:px-[26px] pb-5">
              <Field label="Meta title">
                <input
                  type="text"
                  value={values.seo_title}
                  onChange={(e) => update('seo_title', e.target.value)}
                  placeholder="Defaults to post title"
                  className={inputClass}
                />
              </Field>
              <Field label="Meta description" className="mb-0">
                <textarea
                  value={values.seo_description}
                  onChange={(e) => update('seo_description', e.target.value)}
                  rows={3}
                  placeholder="Short search-friendly summary."
                  className={inputClass + ' min-h-[80px] resize-y'}
                />
              </Field>
            </div>
          </details>

          {mode === 'edit' && (
            <section className="bg-parchment-100 border border-burgundy-700/20 rounded-xl p-6 lg:px-[26px] lg:py-5">
              <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 mb-2">
                Danger zone
              </div>
              <p className="text-[0.75rem] text-ink-500 mb-3">Once deleted, this post cannot be recovered.</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 text-burgundy-700 hover:bg-burgundy-100 px-3 py-2 rounded-md text-[0.6875rem] font-semibold uppercase tracking-[0.12em] transition-colors disabled:opacity-60 w-full justify-start"
              >
                <Trash2 size={14} strokeWidth={1.8} />
                Delete this post
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
  labelExtra,
  hint,
  children,
  className,
}: {
  label: string
  labelExtra?: React.ReactNode
  hint?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={'flex flex-col gap-1.5 mb-4 ' + (className ?? '')}>
      <label className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700">
        <span>{label}</span>
        {labelExtra}
      </label>
      {hint && <p className="text-[0.75rem] text-ink-500 leading-snug">{hint}</p>}
      {children}
    </div>
  )
}

function Divider() {
  return <span className="inline-block w-px h-[22px] bg-border-light mx-1 self-center" />
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
