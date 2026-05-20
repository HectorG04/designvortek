import type { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import FilterChips from './_FilterChips'
import { markAsRead, markAsUnread, archive, unarchive } from './_actions'
import { MessageSquare, Mail, Archive, ArchiveRestore, CheckCircle2, CircleDot } from 'lucide-react'

export const metadata: Metadata = { title: 'Inquiries' }

export default async function InquiriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: inquiriesData } = await admin
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  const inquiries = inquiriesData ?? []

  const counts = {
    all:      inquiries.length,
    unread:   inquiries.filter((i) => !i.is_read && !i.is_archived).length,
    read:     inquiries.filter((i) =>  i.is_read && !i.is_archived).length,
    archived: inquiries.filter((i) =>  i.is_archived).length,
  }

  // Default selected item: first non-archived (unread preferred), else most recent
  const activeItems = inquiries.filter((i) => !i.is_archived)
  const selected =
    activeItems.find((i) => !i.is_read) ?? activeItems[0] ?? inquiries[0] ?? null

  const subtitle =
    counts.unread > 0
      ? `${counts.unread} unread · ${counts.all} total`
      : `${counts.all} total`

  return (
    <AdminShell user={{ email, initials }} title="Inquiries" subtitle={subtitle}>
      <FilterChips counts={counts} />

      {inquiries.length === 0 ? (
        <section className="bg-parchment-100 border border-border-light rounded-xl px-5 py-16 text-center text-ink-500">
          <MessageSquare size={28} strokeWidth={1.5} className="mx-auto mb-3 text-ink-400" />
          <p className="font-display text-xl text-ink-900">No inquiries yet</p>
          <p className="mt-1 text-sm">Messages from the contact form land here.</p>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 lg:gap-6">
          {/* LIST */}
          <div className="bg-parchment-100 border border-border-light rounded-xl overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
            <div className="overflow-y-auto divide-y divide-border-light">
              {inquiries.map((item) => {
                const isActive = selected?.id === item.id
                return (
                  <div
                    key={item.id}
                    className={
                      'relative px-4 py-3 transition-colors ' +
                      (isActive
                        ? 'bg-parchment-50 shadow-[inset_3px_0_0_var(--color-gold-500)]'
                        : 'hover:bg-parchment-50')
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {!item.is_read && !item.is_archived && (
                          <span
                            aria-label="Unread"
                            className="inline-block w-2 h-2 rounded-full bg-burgundy-700 flex-shrink-0"
                          />
                        )}
                        <span
                          className={
                            'font-display text-[0.95rem] truncate ' +
                            (!item.is_read && !item.is_archived
                              ? 'font-semibold text-ink-900'
                              : 'font-medium text-ink-700')
                          }
                        >
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[0.6875rem] text-ink-500 font-mono flex-shrink-0">
                        {fmtAgo(item.created_at)}
                      </span>
                    </div>
                    <p className="text-[0.8125rem] text-ink-700 mt-1 line-clamp-1">
                      {firstLine(item.message)}
                    </p>
                    <p className="text-[0.75rem] text-ink-500 mt-0.5 line-clamp-1">
                      {item.email}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* VIEW */}
          <div className="min-w-0">
            {selected ? (
              <article className="bg-parchment-100 border border-border-light rounded-xl p-5 lg:p-6 flex flex-col gap-5">
                <header className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-display text-xl lg:text-2xl font-semibold text-ink-900 tracking-tight">
                      {selected.name}
                    </h2>
                    <div className="mt-1 text-[0.8125rem] text-ink-500 truncate">
                      <a
                        href={`mailto:${selected.email}`}
                        className="hover:text-burgundy-700 transition-colors"
                      >
                        {selected.email}
                      </a>
                      <span className="mx-2 text-ink-300">·</span>
                      <span className="font-mono">{fmtAbsolute(selected.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {selected.is_read ? (
                      <form action={markAsUnread}>
                        <input type="hidden" name="id" value={selected.id} />
                        <button
                          type="submit"
                          title="Mark as unread"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border-light text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-700 hover:bg-parchment-200 transition-colors"
                        >
                          <CircleDot size={14} strokeWidth={1.8} />
                          Mark unread
                        </button>
                      </form>
                    ) : (
                      <form action={markAsRead}>
                        <input type="hidden" name="id" value={selected.id} />
                        <button
                          type="submit"
                          title="Mark as read"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border-light text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-700 hover:bg-parchment-200 transition-colors"
                        >
                          <CheckCircle2 size={14} strokeWidth={1.8} />
                          Mark read
                        </button>
                      </form>
                    )}

                    {selected.is_archived ? (
                      <form action={unarchive}>
                        <input type="hidden" name="id" value={selected.id} />
                        <button
                          type="submit"
                          title="Restore"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border-light text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-700 hover:bg-parchment-200 transition-colors"
                        >
                          <ArchiveRestore size={14} strokeWidth={1.8} />
                          Restore
                        </button>
                      </form>
                    ) : (
                      <form action={archive}>
                        <input type="hidden" name="id" value={selected.id} />
                        <button
                          type="submit"
                          title="Archive"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border-light text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-700 hover:bg-parchment-200 transition-colors"
                        >
                          <Archive size={14} strokeWidth={1.8} />
                          Archive
                        </button>
                      </form>
                    )}
                  </div>
                </header>

                <div className="bg-parchment-50 border border-border-light rounded-lg p-5 text-[0.9375rem] leading-relaxed text-ink-700 whitespace-pre-wrap">
                  {selected.message}
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-light">
                  <p className="text-[0.75rem] text-ink-500">
                    Reply opens your default mail client. Persistence and outbound mail come later.
                  </p>
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent('Re: your inquiry to DesignVortek')}`}
                    className="inline-flex items-center gap-2 bg-gold-500 text-ink-900 hover:bg-gold-300 transition-colors px-5 py-2.5 rounded-full text-[0.75rem] font-semibold uppercase tracking-[0.12em]"
                  >
                    <Mail size={14} strokeWidth={1.8} />
                    Reply via email
                  </a>
                </footer>
              </article>
            ) : (
              <div className="bg-parchment-100 border border-border-light rounded-xl px-5 py-16 text-center text-ink-500">
                <MessageSquare size={28} strokeWidth={1.5} className="mx-auto mb-3 text-ink-400" />
                <p className="font-display text-xl text-ink-900">Nothing selected</p>
                <p className="mt-1 text-sm">Pick a message on the left to read it.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  )
}

function firstLine(text: string) {
  const trimmed = (text ?? '').trim()
  const newlineIdx = trimmed.indexOf('\n')
  if (newlineIdx === -1) return trimmed
  return trimmed.slice(0, newlineIdx)
}

function fmtAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60) return m <= 1 ? 'now' : `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d === 1) return '1d'
  if (d < 30) return `${d}d`
  const mo = Math.floor(d / 30)
  return `${mo}mo`
}

function fmtAbsolute(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
