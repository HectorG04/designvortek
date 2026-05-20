import type { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import Markdown from '@/components/ui/Markdown'
import { Star, Check, X, Trash2, MessageSquare } from 'lucide-react'

export const metadata: Metadata = { title: 'Reviews' }

type FilterKey = 'all' | 'pending' | 'approved' | 'featured'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'featured', label: 'Featured' },
]

interface ReviewRow {
  id: number
  created_at: string
  customer_name: string
  customer_role: string | null
  content: string
  rating: number
  service_type: string | null
  is_approved: boolean
  is_featured: boolean
  avatar_url: string | null
}

export default async function ReviewsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
  const activeFilter: FilterKey =
    filter === 'pending' || filter === 'approved' || filter === 'featured'
      ? filter
      : 'all'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: reviewsData } = await admin
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  const reviews = (reviewsData ?? []) as ReviewRow[]

  const total = reviews.length
  const pendingCount = reviews.filter((r) => !r.is_approved).length
  const approvedCount = reviews.filter((r) => r.is_approved).length
  const featuredCount = reviews.filter((r) => r.is_featured).length

  const counts: Record<FilterKey, number> = {
    all: total,
    pending: pendingCount,
    approved: approvedCount,
    featured: featuredCount,
  }

  const filtered = reviews.filter((r) => {
    if (activeFilter === 'pending') return !r.is_approved
    if (activeFilter === 'approved') return r.is_approved && !r.is_featured
    if (activeFilter === 'featured') return r.is_featured
    return true
  })

  const subtitle = `${total} total · ${pendingCount} pending · ${approvedCount} approved`

  return (
    <AdminShell user={{ email, initials }} title="Reviews" subtitle={subtitle}>
      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-5 px-4 py-3 bg-parchment-100 border border-border-light rounded-xl">
        {FILTERS.map((f) => {
          const active = f.key === activeFilter
          const href = f.key === 'all' ? '/admin/reviews' : `/admin/reviews?filter=${f.key}`
          return (
            <a
              key={f.key}
              href={href}
              className={
                active
                  ? 'inline-flex items-center gap-1.5 rounded-full border border-burgundy-700 bg-burgundy-700 px-3.5 py-1.5 text-[0.8125rem] text-cream-50 transition-colors'
                  : 'inline-flex items-center gap-1.5 rounded-full border border-border-light bg-parchment-50 px-3.5 py-1.5 text-[0.8125rem] text-ink-700 hover:bg-parchment-200 hover:border-border-medium transition-colors'
              }
            >
              {f.label}
              <span
                className={
                  active
                    ? 'inline-block min-w-[20px] px-1.5 text-center text-[0.6875rem] font-semibold rounded-full bg-cream-50/[0.20] text-cream-50'
                    : 'inline-block min-w-[20px] px-1.5 text-center text-[0.6875rem] font-semibold rounded-full bg-parchment-300 text-ink-700'
                }
              >
                {counts[f.key]}
              </span>
            </a>
          )
        })}
      </div>

      {/* Empty state / grid */}
      {filtered.length === 0 ? (
        <div className="bg-parchment-100 border border-border-light rounded-xl px-5 py-16 text-center">
          <MessageSquare
            size={28}
            strokeWidth={1.5}
            className="mx-auto mb-3 text-ink-400"
          />
          <p className="font-display text-xl text-ink-900">
            {activeFilter === 'all' ? 'No reviews yet' : `No ${activeFilter} reviews`}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            {activeFilter === 'all'
              ? 'When customers leave reviews, they appear here for approval.'
              : 'Try a different filter to see other reviews.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </AdminShell>
  )
}

/* ---------- Server actions ---------- */

async function approveReview(id: number) {
  'use server'
  const admin = createAdminClient()
  await admin.from('reviews').update({ is_approved: true }).eq('id', id)
  revalidatePath('/admin/reviews')
}

async function unapproveReview(id: number) {
  'use server'
  const admin = createAdminClient()
  await admin
    .from('reviews')
    .update({ is_approved: false, is_featured: false })
    .eq('id', id)
  revalidatePath('/admin/reviews')
}

async function toggleFeatured(id: number, current: boolean) {
  'use server'
  const admin = createAdminClient()
  const update = current
    ? { is_featured: false }
    : { is_featured: true, is_approved: true }
  await admin.from('reviews').update(update).eq('id', id)
  revalidatePath('/admin/reviews')
}

async function deleteReview(id: number) {
  'use server'
  const admin = createAdminClient()
  await admin.from('reviews').delete().eq('id', id)
  revalidatePath('/admin/reviews')
}

/* ---------- Card ---------- */

function ReviewCard({ review }: { review: ReviewRow }) {
  const rating = Math.max(0, Math.min(5, review.rating))
  const initials =
    review.customer_name
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'NA'

  let pill: { label: string; className: string }
  if (review.is_featured) {
    pill = {
      label: 'Featured',
      className: 'bg-gold-100 text-gold-700 border-gold-300',
    }
  } else if (review.is_approved) {
    pill = {
      label: 'Approved',
      className: 'bg-forest-500/[0.12] text-forest-700 border-forest-500/[0.30]',
    }
  } else {
    pill = {
      label: 'Pending',
      className: 'bg-gold-100 text-gold-700 border-gold-300',
    }
  }

  return (
    <article className="bg-parchment-100 border border-border-light rounded-xl p-5 flex flex-col gap-4">
      {/* Top: stars + status pill */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex items-center gap-1"
          aria-label={`Rating ${rating} of 5`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              strokeWidth={1.5}
              className={
                i < rating
                  ? 'fill-gold-500 text-gold-500'
                  : 'text-parchment-300'
              }
            />
          ))}
        </div>
        <span
          className={[
            'inline-flex items-center px-2.5 py-1 rounded-full border text-[0.6875rem] font-semibold uppercase tracking-[0.1em] whitespace-nowrap',
            pill.className,
          ].join(' ')}
        >
          {pill.label}
        </span>
      </div>

      {/* Quote */}
      <blockquote className="font-display italic text-lg leading-snug text-ink-900 [&_p]:m-0">
        <span aria-hidden="true">&ldquo;</span>
        <Markdown>{review.content}</Markdown>
        <span aria-hidden="true">&rdquo;</span>
      </blockquote>

      {/* Reviewer row */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-cream-50 font-display text-sm font-semibold flex-shrink-0"
          style={{
            background:
              'linear-gradient(135deg, var(--color-burgundy-700), var(--color-gold-700))',
          }}
        >
          {initials}
        </div>
        <div className="flex flex-col leading-tight min-w-0">
          <span className="font-display text-base font-semibold text-ink-900 truncate">
            {review.customer_name}
          </span>
          <span className="text-[0.8125rem] text-ink-500 truncate">
            {review.customer_role ?? 'Customer'} · {fmtDate(review.created_at)}
          </span>
        </div>
      </div>

      {/* Service chip */}
      {review.service_type && (
        <span className="inline-flex self-start items-center px-2.5 py-1 rounded-full bg-parchment-50 border border-border-light text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-700">
          {review.service_type}
        </span>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-3 mt-auto border-t border-border-light">
        {!review.is_approved ? (
          <form action={approveReview.bind(null, review.id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-gold-500 text-ink-900 hover:bg-gold-300 transition-colors px-3 py-1.5 rounded-md text-[0.6875rem] font-semibold uppercase tracking-[0.1em]"
            >
              <Check size={12} strokeWidth={2} />
              Approve
            </button>
          </form>
        ) : (
          <form action={unapproveReview.bind(null, review.id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-transparent border-[1.5px] border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50 transition-colors px-3 py-1.5 rounded-md text-[0.6875rem] font-semibold uppercase tracking-[0.1em]"
            >
              <X size={12} strokeWidth={2} />
              Unapprove
            </button>
          </form>
        )}

        <form action={toggleFeatured.bind(null, review.id, review.is_featured)}>
          <button
            type="submit"
            className={
              review.is_featured
                ? 'inline-flex items-center gap-1.5 bg-gold-500 text-ink-900 hover:bg-gold-300 transition-colors px-3 py-1.5 rounded-md text-[0.6875rem] font-semibold uppercase tracking-[0.1em]'
                : 'inline-flex items-center gap-1.5 bg-transparent border-[1.5px] border-gold-500 text-gold-700 hover:bg-gold-100 transition-colors px-3 py-1.5 rounded-md text-[0.6875rem] font-semibold uppercase tracking-[0.1em]'
            }
          >
            <Star
              size={12}
              strokeWidth={1.8}
              className={review.is_featured ? 'fill-ink-900' : ''}
            />
            {review.is_featured ? 'Featured' : 'Feature'}
          </button>
        </form>

        <form
          action={deleteReview.bind(null, review.id)}
          className="ml-auto"
        >
          <button
            type="submit"
            aria-label="Delete review"
            title="Delete"
            className="w-8 h-8 inline-flex items-center justify-center rounded-md text-burgundy-700 hover:bg-burgundy-100 transition-colors"
          >
            <Trash2 size={14} strokeWidth={1.8} />
          </button>
        </form>
      </div>
    </article>
  )
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
