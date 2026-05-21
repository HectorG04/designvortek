import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import { Plus, Pencil, ChevronRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Blog' }

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'drafts', label: 'Draft' },
  { key: 'scheduled', label: 'Scheduled' },
] as const

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortex.co'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: posts } = await admin
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })

  const allPosts = posts ?? []

  const now = Date.now()
  const publishedCount = allPosts.filter(
    (p) =>
      p.is_published &&
      (!p.published_at || new Date(p.published_at).getTime() <= now)
  ).length
  const draftCount = allPosts.filter((p) => !p.is_published).length
  const scheduledCount = allPosts.filter(
    (p) => p.is_published && p.published_at && new Date(p.published_at).getTime() > now
  ).length

  const filterCounts: Record<string, number> = {
    all: allPosts.length,
    published: publishedCount,
    drafts: draftCount,
    scheduled: scheduledCount,
  }

  const subtitle =
    allPosts.length === 0
      ? 'No posts yet'
      : `${publishedCount} published · ${draftCount} draft${draftCount === 1 ? '' : 's'}${scheduledCount > 0 ? ` · ${scheduledCount} scheduled` : ''}`

  return (
    <AdminShell
      user={{ email, initials }}
      title="Blog"
      subtitle={subtitle}
      actions={
        <Link
          href="/admin/blog/new"
          className="hidden sm:inline-flex items-center gap-1.5 bg-gold-500 text-ink-900 hover:bg-gold-300 hover:shadow-[0_8px_24px_rgba(201,160,74,0.32)] transition-all px-4 py-2 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em]"
        >
          <Plus size={14} strokeWidth={2} />
          New post
        </Link>
      }
    >
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => {
          const active = f.key === 'all'
          return (
            <span
              key={f.key}
              className={
                active
                  ? 'inline-flex items-center gap-2 rounded-full border border-burgundy-700 bg-burgundy-700 text-cream-50 px-3.5 py-1.5 text-[0.8125rem] font-medium'
                  : 'inline-flex items-center gap-2 rounded-full border border-border-light bg-parchment-50 text-ink-700 hover:bg-parchment-200 hover:border-border-medium px-3.5 py-1.5 text-[0.8125rem] font-medium cursor-default transition-colors'
              }
            >
              {f.label}
              <span
                className={
                  active
                    ? 'min-w-[18px] text-center text-[0.6875rem] px-1.5 rounded-full bg-cream-50/20 text-cream-50'
                    : 'min-w-[18px] text-center text-[0.6875rem] px-1.5 rounded-full bg-parchment-300 text-ink-700'
                }
              >
                {filterCounts[f.key] ?? 0}
              </span>
            </span>
          )
        })}
      </div>

      {allPosts.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="bg-parchment-100 border border-border-light rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-parchment-50 border-b border-border-light">
                  <Th>Title</Th>
                  <Th>Category</Th>
                  <Th>Author</Th>
                  <Th>Status</Th>
                  <Th>Published</Th>
                  <Th className="w-12 text-right" />
                </tr>
              </thead>
              <tbody>
                {allPosts.map((post) => {
                  const isScheduled =
                    post.is_published &&
                    post.published_at &&
                    new Date(post.published_at).getTime() > now
                  return (
                    <tr
                      key={post.id}
                      className="border-b border-border-light last:border-b-0 hover:bg-parchment-50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-14 h-10 flex-shrink-0 rounded-md overflow-hidden bg-parchment-200 border border-border-light"
                            style={
                              post.featured_image
                                ? undefined
                                : { background: 'linear-gradient(135deg, #6B1F2A 0%, #9A7232 100%)' }
                            }
                          >
                            {post.featured_image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={post.featured_image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-display text-base font-semibold text-ink-900 leading-tight line-clamp-1">
                              {post.title || 'Untitled draft'}
                            </div>
                            <div className="text-[0.75rem] text-ink-500 mt-0.5 line-clamp-1">
                              {post.read_time_minutes
                                ? `${post.read_time_minutes} min read`
                                : post.excerpt
                                ? post.excerpt
                                : '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[0.9375rem] text-ink-700">{post.category}</td>
                      <td className="px-5 py-3.5 text-[0.9375rem] text-ink-700">{post.author_name}</td>
                      <td className="px-5 py-3.5">
                        {isScheduled ? (
                          <StatusBadge variant="gold">Scheduled</StatusBadge>
                        ) : post.is_published ? (
                          <StatusBadge variant="forest">Published</StatusBadge>
                        ) : (
                          <StatusBadge variant="muted">Draft</StatusBadge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[0.8125rem] text-ink-500 font-mono">
                        {formatDate(post.published_at ?? post.updated_at)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="inline-flex w-[30px] h-[30px] items-center justify-center rounded-sm text-ink-500 hover:bg-parchment-200 hover:text-burgundy-700 hover:border-border-light border border-transparent transition-colors"
                          aria-label="Edit post"
                        >
                          <Pencil size={14} strokeWidth={1.8} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AdminShell>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-5 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 whitespace-nowrap ${className ?? ''}`}
    >
      {children}
    </th>
  )
}

function StatusBadge({
  variant,
  children,
}: {
  variant: 'forest' | 'muted' | 'gold'
  children: React.ReactNode
}) {
  const styles =
    variant === 'forest'
      ? 'bg-forest-500/15 text-forest-700'
      : variant === 'gold'
        ? 'bg-gold-100 text-gold-700'
        : 'bg-parchment-200 text-ink-500'
  const dot =
    variant === 'forest'
      ? 'bg-forest-500'
      : variant === 'gold'
        ? 'bg-gold-500'
        : 'bg-ink-400'
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.75rem] font-medium ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  )
}

function EmptyState() {
  return (
    <section className="bg-parchment-100 border border-dashed border-border-medium rounded-xl px-6 py-16 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gold-100 text-gold-700 mb-4">
        <Pencil size={24} strokeWidth={1.5} />
      </div>
      <h2 className="font-display text-2xl font-semibold text-ink-900">Write your first post</h2>
      <p className="text-sm text-ink-500 max-w-md mx-auto mt-2">
        Share studio updates, process notes, or guides. New posts you publish here will appear on the public blog.
      </p>
      <Link
        href="/admin/blog/new"
        className="inline-flex items-center gap-1.5 mt-6 bg-gold-500 text-ink-900 hover:bg-gold-300 transition-colors px-5 py-2.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em]"
      >
        <Plus size={14} strokeWidth={2} />
        Start a post
        <ChevronRight size={12} strokeWidth={2} />
      </Link>
    </section>
  )
}
