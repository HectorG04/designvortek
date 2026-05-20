import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import {
  Plus, Pencil, Trash2, ImageIcon, Grid3x3, List, Star, ChevronRight,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Portfolio' }

const FILTERS = [
  { key: 'all',        label: 'All' },
  { key: 'published',  label: 'Published' },
  { key: 'drafts',     label: 'Drafts' },
  { key: 'featured',   label: 'Featured' },
] as const

const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #6B1F2A 0%, #9A7232 50%, #3E1218 100%)',
  'linear-gradient(135deg, #1F4D3A 0%, #C9A04A 60%, #251A10 100%)',
  'linear-gradient(135deg, #3E1218 0%, #8A2A35 50%, #C9A04A 100%)',
  'linear-gradient(135deg, #251A10 0%, #6B1F2A 50%, #E8C880 100%)',
  'linear-gradient(135deg, #9A7232 0%, #F8EBC4 50%, #6B1F2A 100%)',
  'linear-gradient(135deg, #3D7256 0%, #1A130C 50%, #C9A04A 100%)',
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function PortfolioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: pieces } = await admin
    .from('portfolio_pieces')
    .select('*')
    .order('sort_order', { ascending: true })

  const allPieces = pieces ?? []
  const publishedCount = allPieces.filter((p) => p.is_published).length
  const draftCount     = allPieces.filter((p) => !p.is_published).length
  const featuredCount  = allPieces.filter((p) => p.is_featured).length

  const filterCounts: Record<string, number> = {
    all: allPieces.length,
    published: publishedCount,
    drafts: draftCount,
    featured: featuredCount,
  }

  const subtitle =
    allPieces.length === 0
      ? 'No pieces yet'
      : `${allPieces.length} piece${allPieces.length === 1 ? '' : 's'} · ${publishedCount} published · ${draftCount} draft${draftCount === 1 ? '' : 's'}`

  return (
    <AdminShell
      user={{ email, initials }}
      title="Portfolio"
      subtitle={subtitle}
      actions={
        <Link
          href="/admin/portfolio/new"
          className="hidden sm:inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-burgundy-500 transition-colors"
        >
          <Plus size={14} strokeWidth={2} />
          New piece
        </Link>
      }
    >
      {/* Filter row + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = f.key === 'all'
            return (
              <span
                key={f.key}
                className={
                  active
                    ? 'inline-flex items-center gap-2 rounded-full border border-burgundy-700 bg-burgundy-700 text-cream-50 px-3.5 py-1.5 text-[0.75rem] font-semibold tracking-[0.05em]'
                    : 'inline-flex items-center gap-2 rounded-full border border-border-light bg-parchment-100 text-ink-700 hover:bg-parchment-200 px-3.5 py-1.5 text-[0.75rem] font-semibold tracking-[0.05em] cursor-default'
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
                  {filterCounts[f.key] ?? 0}
                </span>
              </span>
            )
          })}
        </div>
        <div className="inline-flex items-center gap-px p-0.5 bg-parchment-200 rounded-md">
          <button
            type="button"
            aria-label="Grid view"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-parchment-50 text-burgundy-700 border border-border-light"
          >
            <Grid3x3 size={16} strokeWidth={1.8} />
          </button>
          <button
            type="button"
            aria-label="List view"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-ink-500 hover:text-ink-900"
          >
            <List size={16} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {allPieces.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {allPieces.map((piece, idx) => (
            <PortfolioTile
              key={piece.id}
              id={piece.id}
              title={piece.title}
              category={piece.category}
              imageUrl={piece.image_url}
              thumbnailUrl={piece.thumbnail_url}
              isFeatured={piece.is_featured}
              isPublished={piece.is_published}
              createdAt={piece.created_at}
              gradient={PLACEHOLDER_GRADIENTS[idx % PLACEHOLDER_GRADIENTS.length]}
            />
          ))}
        </div>
      )}
    </AdminShell>
  )
}

function PortfolioTile({
  id,
  title,
  category,
  imageUrl,
  thumbnailUrl,
  isFeatured,
  isPublished,
  createdAt,
  gradient,
}: {
  id: number
  title: string
  category: string
  imageUrl: string
  thumbnailUrl: string | null
  isFeatured: boolean
  isPublished: boolean
  createdAt: string
  gradient: string
}) {
  const cover = thumbnailUrl || imageUrl
  const hasCover = cover && cover.length > 0

  return (
    <article className="group bg-parchment-100 border border-border-light rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-border-medium">
      <Link href={`/admin/portfolio/${id}/edit`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden" style={!hasCover ? { background: gradient } : undefined}>
          {hasCover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {isFeatured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-500 text-ink-900 text-[0.625rem] font-bold uppercase tracking-[0.1em]">
                <Star size={10} strokeWidth={2.4} />
                Featured
              </span>
            )}
            {!isPublished && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-parchment-200 text-ink-700 border border-border-medium text-[0.625rem] font-bold uppercase tracking-[0.1em]">
                Draft
              </span>
            )}
            {isPublished && !isFeatured && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-forest-500/90 text-cream-50 text-[0.625rem] font-bold uppercase tracking-[0.1em]">
                Live
              </span>
            )}
          </div>

          {/* Hover actions */}
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-parchment-50/95 text-ink-700 backdrop-blur-sm shadow-sm border border-border-light"
              aria-label="Edit"
            >
              <Pencil size={14} strokeWidth={1.8} />
            </span>
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-parchment-50/95 text-burgundy-700 backdrop-blur-sm shadow-sm border border-border-light"
              aria-label="Delete"
            >
              <Trash2 size={14} strokeWidth={1.8} />
            </span>
          </div>

          {/* Title overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-ink-900/85 via-ink-900/40 to-transparent">
            <h3 className="font-display text-base font-semibold text-cream-50 leading-tight line-clamp-2">
              {title}
            </h3>
            <p className="text-[0.6875rem] uppercase tracking-[0.15em] text-cream-200 mt-1">
              {category} · {formatDate(createdAt)}
            </p>
          </div>
        </div>
      </Link>
    </article>
  )
}

function EmptyState() {
  return (
    <section className="bg-parchment-100 border border-dashed border-border-medium rounded-xl px-6 py-16 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-parchment-200 text-gold-700 mb-4">
        <ImageIcon size={26} strokeWidth={1.5} />
      </div>
      <h2 className="font-display text-2xl font-semibold text-ink-900">Upload your first piece</h2>
      <p className="text-sm text-ink-500 max-w-md mx-auto mt-2">
        Your portfolio is empty. Add your first commission, scene, or character study and it will show up here.
      </p>
      <Link
        href="/admin/portfolio/new"
        className="inline-flex items-center gap-1.5 mt-6 bg-burgundy-700 text-cream-50 px-5 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-burgundy-500 transition-colors"
      >
        <Plus size={14} strokeWidth={2} />
        Add a piece
        <ChevronRight size={12} strokeWidth={2} />
      </Link>
    </section>
  )
}
