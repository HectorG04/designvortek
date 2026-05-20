'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Trash2, Save, ExternalLink, ChevronRight, X,
  Bold, Italic, Heading2, Heading3, Quote, Link as LinkIcon, ImageIcon,
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
}

const CATEGORIES = [
  'Guides',
  'Behind the scenes',
  'D&D',
  'Process',
  'Tutorials',
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

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[0.75rem] text-ink-500 mb-6">
        <Link href="/admin/blog" className="hover:text-burgundy-700">Blog</Link>
        <ChevronRight size={12} strokeWidth={1.8} />
        <span className="text-ink-900">{mode === 'create' ? 'New post' : values.title || 'Untitled'}</span>
      </nav>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md bg-burgundy-100 border border-burgundy-700/30 text-burgundy-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6">
        {/* LEFT — editor */}
        <div className="flex flex-col gap-5">
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <input
              type="text"
              value={values.title}
              onChange={(e) => handleTitle(e.target.value)}
              placeholder="Post title"
              className="w-full bg-transparent border-0 text-3xl md:text-4xl font-display font-semibold text-ink-900 placeholder:text-ink-400 focus:outline-none mb-4 tracking-tight"
            />

            <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-700 mb-1.5">
              Slug
            </label>
            <p className="text-[0.75rem] text-ink-500 mb-2">
              /blog/<strong className="text-burgundy-700 font-mono">{values.slug || '—'}</strong>
            </p>
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
          </section>

          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <h2 className="font-display text-base font-semibold text-ink-900 mb-4">Featured image</h2>
            <input
              type="url"
              value={values.featured_image}
              onChange={(e) => update('featured_image', e.target.value)}
              placeholder="https://…"
              className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm font-mono text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors mb-4"
            />
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
            <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-border-light bg-parchment-50">
              {[
                { Icon: Bold, label: 'Bold' },
                { Icon: Italic, label: 'Italic' },
                { Icon: Heading2, label: 'Heading 2' },
                { Icon: Heading3, label: 'Heading 3' },
                { Icon: Quote, label: 'Quote' },
                { Icon: LinkIcon, label: 'Link' },
                { Icon: ImageIcon, label: 'Image' },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  title={label}
                  aria-label={label}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md text-ink-500 hover:bg-parchment-200 hover:text-ink-900 transition-colors"
                  onClick={(e) => e.preventDefault()}
                >
                  <Icon size={15} strokeWidth={1.8} />
                </button>
              ))}
            </div>

            <div className="p-6">
              <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-700 mb-1.5">
                Excerpt
              </label>
              <textarea
                value={values.excerpt}
                onChange={(e) => update('excerpt', e.target.value)}
                rows={2}
                placeholder="One or two sentence summary."
                className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors mb-5"
              />

              <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-700 mb-1.5">
                Content
              </label>
              <p className="text-[0.75rem] text-ink-500 mb-2">Write in Markdown.</p>
              <textarea
                value={values.content}
                onChange={(e) => update('content', e.target.value)}
                placeholder="# Heading&#10;&#10;Start writing…"
                className="w-full min-h-[600px] bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm font-mono text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors leading-relaxed"
              />
            </div>
          </section>
        </div>

        {/* RIGHT — sidebar */}
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

            <div className="py-2 border-b border-border-light">
              <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-700 mb-1.5 mt-1">
                Publish date
              </label>
              <input
                type="datetime-local"
                value={values.published_at}
                onChange={(e) => update('published_at', e.target.value)}
                className="w-full bg-parchment-50 border border-border-light rounded-md px-2 py-1.5 text-xs text-ink-900 focus:outline-none focus:border-burgundy-500 transition-colors"
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
                {isPending ? 'Saving…' : (mode === 'create' ? 'Publish post' : 'Update post')}
              </button>
              <button
                type="button"
                onClick={() => submit(false)}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-1.5 bg-transparent border border-border-medium text-ink-700 px-4 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-parchment-200 transition-colors disabled:opacity-60"
              >
                Save as draft
              </button>
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-1.5 bg-transparent text-ink-500 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider opacity-60 cursor-not-allowed"
                title="Preview coming soon"
              >
                Preview
              </button>
              {mode === 'edit' && values.slug && (
                <a
                  href={`/blog/${values.slug}`}
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

          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <div className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-ink-500 mb-3">Category &amp; tags</div>

            <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-700 mb-1.5">
              Category
            </label>
            <select
              value={values.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2 text-sm text-ink-900 focus:outline-none focus:border-burgundy-500 transition-colors mb-4"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-700 mb-1.5">
              Tags
            </label>
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
                className="flex-1 min-w-[100px] bg-transparent text-sm text-ink-900 placeholder:text-ink-400 outline-none px-1"
              />
            </div>
          </section>

          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <div className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-ink-500 mb-3">Author &amp; meta</div>

            <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-700 mb-1.5">
              Author name
            </label>
            <input
              type="text"
              value={values.author_name}
              onChange={(e) => update('author_name', e.target.value)}
              placeholder="Studio"
              className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors mb-4"
            />

            <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-700 mb-1.5">
              Read time (minutes)
            </label>
            <input
              type="number"
              min={0}
              value={values.read_time_minutes}
              onChange={(e) => update('read_time_minutes', e.target.value)}
              placeholder="e.g. 8"
              className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
            />
          </section>

          <details className="bg-parchment-100 border border-border-light rounded-xl">
            <summary className="cursor-pointer flex items-center justify-between px-5 py-4 list-none">
              <div className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-ink-500">SEO</div>
              <ChevronRight size={16} strokeWidth={1.8} className="text-ink-500" />
            </summary>
            <div className="px-5 pb-5">
              <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-700 mb-1.5">
                Meta title
              </label>
              <input
                type="text"
                value={values.seo_title}
                onChange={(e) => update('seo_title', e.target.value)}
                placeholder="Defaults to post title"
                className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors mb-4"
              />
              <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-700 mb-1.5">
                Meta description
              </label>
              <textarea
                value={values.seo_description}
                onChange={(e) => update('seo_description', e.target.value)}
                rows={3}
                placeholder="Short search-friendly summary."
                className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
              />
            </div>
          </details>

          {mode === 'edit' && (
            <section className="bg-parchment-100 border border-burgundy-700/20 rounded-xl p-5">
              <div className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-burgundy-700 mb-2">Danger zone</div>
              <p className="text-[0.75rem] text-ink-500 mb-3">Once deleted, this post cannot be recovered.</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 text-burgundy-700 hover:text-burgundy-900 hover:bg-burgundy-100 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-60"
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
