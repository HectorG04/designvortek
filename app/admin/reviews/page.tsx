import type { Metadata } from 'next'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import { Star, MessageSquare, Check, X, Trash2 } from 'lucide-react'

export const metadata: Metadata = { title: 'Reviews' }

type FilterKey = 'all' | 'pending' | 'approved' | 'featured'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'featured', label: 'Featured' },
]

export default async function ReviewsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
  const activeFilter: FilterKey =
    filter === 'pending' || filter === 'approved' || filter === 'featured' ? filter : 'all'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: reviews } = await admin
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  const allReviews = reviews ?? []

  const total = allReviews.length
  const pendingCount = allReviews.filter((r) => !r.is_approved).length
  const approvedCount = allReviews.filter((r) => r.is_approved).length
  const featuredCount = allReviews.filter((r) => r.is_featured).length

  const filteredReviews = allReviews.filter((r) => {
    if (activeFilter === 'pending') return !r.is_approved
    if (activeFilter === 'approved') return r.is_approved && !r.is_featured
    if (activeFilter === 'featured') return r.is_featured
    return true
  })

  const subtitle = `${total} total · ${pendingCount} pending · ${approvedCount} approved`

  const counts: Record<FilterKey, number> = {
    all: total,
    pending: pendingCount,
    approved: approvedCount,
    featured: featuredCount,
  }

  return (
    <AdminShell user={{ email, initials }} title="Reviews" subtitle={subtitle}>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => {
          const active = f.key === activeFilter
          const href = f.key === 'all' ? '/admin/reviews' : `/admin/reviews?filter=${f.key}`
          return (
            <a
              key={f.key}
              href={href}
              className={
                active
                  ? 'inline-flex items-center gap-2 rounded-full border border-burgundy-700 bg-burgundy-700 text-cream-50 px-3.5 py-1.5 text-[0.75rem] font-semibold tracking-[0.05em]'
                  : 'inline-flex items-center gap-2 rounded-full border border-border-light bg-parchment-100 text-ink-700 hover:bg-parchment-200 px-3.5 py-1.5 text-[0.75rem] font-semibold tracking-[0.05em]'
              }
            >
              {f.label}
              <span
                className={
                  active
                    ? 'min-w-[20px] text-center text-[0.625rem] font-bold px-1.5 py-0.5 rounded-full bg-cream-50/20 text-cream-50'
                    : 'min-w-[20px] text-center text-[0.625rem] font-bold px-1.5 py-0.5 rounded-full bg-parchment-300 text-ink-700'
                }
              >
                {counts[f.key]}
              </span>
            </a>
          )
        })}
      </div>

      {/* Empty state */}
      {filteredReviews.length === 0 ? (
        <div className="bg-parchment-100 border border-border-light rounded-xl px-5 py-16 text-center text-ink-500">
          <MessageSquare size={28} strokeWidth={1.5} className="mx-auto mb-3 text-ink-400" />
          <p className="font-display text-xl text-ink-900">
            {activeFilter === 'all' ? 'No reviews yet' : `No ${activeFilter} reviews`}
          </p>
          <p className="mt-1 text-sm">
            {activeFilter === 'all'
              ? 'When customers leave reviews, they appear here for approval.'
              : 'Try a different filter to see other reviews.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </AdminShell>
  )
}

async function approveReview(id: number) {
  'use server'
  const admin = createAdminClient()
  await admin.from('reviews').update({ is_approved: true }).eq('id', id)
  revalidatePath('/admin/reviews')
}

async function unapproveReview(id: number) {
  'use server'
  const admin = createAdminClient()
  await admin.from('reviews').update({ is_approved: false, is_featured: false }).eq('id', id)
  revalidatePath('/admin/reviews')
}

async function toggleFeatured(id: number, next: boolean) {
  'use server'
  const admin = createAdminClient()
  // Featuring implies approval
  const update = next ? { is_featured: true, is_approved: true } : { is_featured: false }
  await admin.from('reviews').update(update).eq('id', id)
  revalidatePath('/admin/reviews')
}

async function deleteReview(id: number) {
  'use server'
  const admin = createAdminClient()
  await admin.from('reviews').delete().eq('id', id)
  revalidatePath('/admin/reviews')
}

function ReviewCard({
  review,
}: {
  review: {
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
}) {
  const rating = Math.max(0, Math.min(5, review.rating))
  const initials = review.customer_name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'NA'

  let statusPill: { label: string; classes: string }
  if (review.is_featured) {
    statusPill = {
      label: 'Featured',
      classes: 'bg-gold-100 text-gold-700 border-gold-300',
    }
  } else if (review.is_approved) {
    statusPill = {
      label: 'Approved',
      classes: 'bg-forest-500/15 text-forest-700 border-forest-500/30',
    }
  } else {
    statusPill = {
      label: 'Pending',
      classes: 'bg-parchment-200 text-ink-700 border-border-medium',
    }
  }

  return (
    <article className="bg-parchment-100 border border-border-light rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-1 text-gold-500" aria-label={`Rating ${rating} of 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              strokeWidth={1.5}
              className={i < rating ? 'fill-gold-500 text-gold-500' : 'text-parchment-300'}
            />
          ))}
        </div>
        <span
          className={[
            'inline-flex items-center px-2.5 py-1 rounded-full border text-[0.6875rem] font-semibold uppercase tracking-[0.1em] whitespace-nowrap',
            statusPill.classes,
          ].join(' ')}
        >
          {statusPill.label}
        </span>
      </div>

      <blockquote
        className="font-display italic text-lg text-ink-900 leading-snug"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        &ldquo;{review.content}&rdquo;
      </blockquote>

      <div className="flex items-center gap-3 pt-1">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-cream-50 font-display text-sm font-semibold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--color-burgundy-700), var(--color-gold-700))' }}
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

      {review.service_type && (
        <span className="inline-flex self-start items-center px-2.5 py-1 rounded-full bg-parchment-50 border border-border-light text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-700">
          {review.service_type}
        </span>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border-light">
        {!review.is_approved ? (
          <form action={approveReview.bind(null, review.id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 transition-colors px-3 py-1.5 rounded-md text-[0.6875rem] font-semibold uppercase tracking-[0.1em]"
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

        <form action={toggleFeatured.bind(null, review.id, !review.is_featured)}>
          <button
            type="submit"
            className={[
              'inline-flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-md text-[0.6875rem] font-semibold uppercase tracking-[0.1em]',
              review.is_featured
                ? 'bg-gold-500 text-ink-900 hover:bg-gold-300'
                : 'bg-transparent border-[1.5px] border-gold-500 text-gold-700 hover:bg-gold-100',
            ].join(' ')}
          >
            <Star
              size={12}
              strokeWidth={1.8}
              className={review.is_featured ? 'fill-ink-900' : ''}
            />
            {review.is_featured ? 'Featured' : 'Feature'}
          </button>
        </form>

        <form action={deleteReview.bind(null, review.id)} className="ml-auto">
          <button
            type="submit"
            className="w-8 h-8 inline-flex items-center justify-center rounded-md text-burgundy-700 hover:bg-burgundy-100 transition-colors"
            aria-label="Delete review"
            title="Delete"
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
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
