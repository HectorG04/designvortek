import type { Metadata } from 'next'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import { Bell, Mail, Download } from 'lucide-react'

export const metadata: Metadata = { title: 'Waitlist | Admin' }

interface WaitlistRow {
  id: number
  created_at: string
  email: string
  name: string | null
  phone: string | null
  source: string | null
  interested_in: string | null
  notes: string | null
}

export default async function WaitlistPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortex.co'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data } = await admin
    .from('waitlist')
    .select('*')
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as WaitlistRow[]

  /* Quick segment counts so the operator can see at a glance where signups
   * are coming from (homepage CTA vs availability page vs other entry points). */
  const sources = rows.reduce<Record<string, number>>((acc, r) => {
    const key = r.source ?? 'unknown'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const subtitle = rows.length === 1 ? '1 signup' : `${rows.length} signups`

  /* Pre-formatted mailto link to email everyone at once (BCC keeps addresses
   * private). Capped at 95 recipients since some mail clients balk above 100. */
  const mailtoAll = rows.length
    ? `mailto:?bcc=${rows.slice(0, 95).map((r) => r.email).join(',')}`
    : ''

  return (
    <AdminShell user={{ email, initials }} title="Waitlist" subtitle={subtitle}>
      {rows.length === 0 ? (
        <section className="bg-parchment-100 border border-border-light rounded-xl px-5 py-16 text-center">
          <Bell size={28} strokeWidth={1.5} className="mx-auto mb-3 text-ink-400" />
          <p className="font-display text-xl text-ink-900">No signups yet</p>
          <p className="mt-1 text-sm text-ink-500">
            Visitors who join the studio dispatch land here.
          </p>
        </section>
      ) : (
        <>
          {/* Source breakdown */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex flex-wrap gap-2">
                {Object.entries(sources).map(([src, count]) => (
                  <span
                    key={src}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-parchment-50 border border-border-light font-body text-[0.75rem] font-medium text-ink-700"
                  >
                    {src}
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-burgundy-700 text-cream-50 text-[0.625rem] font-bold">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
              {mailtoAll && (
                <a
                  href={mailtoAll}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500 text-ink-900 hover:bg-gold-300 transition-colors text-[0.75rem] font-semibold uppercase tracking-[0.12em]"
                >
                  <Mail size={14} strokeWidth={1.8} />
                  Email all
                </a>
              )}
            </div>
          </section>

          {/* Table */}
          <section className="bg-parchment-100 border border-border-light rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-parchment-50 border-b border-border-light">
                  <tr className="text-left">
                    <Th>Email</Th>
                    <Th>Name</Th>
                    <Th>Interested in</Th>
                    <Th>Source</Th>
                    <Th className="text-right">Joined</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={row.id}
                      className={
                        'border-b border-border-light last:border-b-0 ' +
                        (i % 2 === 0 ? 'bg-parchment-100' : 'bg-parchment-50')
                      }
                    >
                      <td className="px-4 py-3 text-ink-900">
                        <a
                          href={`mailto:${row.email}`}
                          className="font-medium hover:text-burgundy-700 transition-colors"
                        >
                          {row.email}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-ink-700">
                        {row.name ?? <span className="text-ink-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-ink-700">
                        {row.interested_in ?? <span className="text-ink-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-ink-500 text-[0.8125rem]">
                        {row.source ?? <span className="text-ink-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-ink-500 font-mono text-[0.75rem] text-right whitespace-nowrap">
                        {fmtDate(row.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border-light bg-parchment-50">
              <div className="text-[0.75rem] text-ink-500">
                {rows.length} {rows.length === 1 ? 'signup' : 'signups'} total
              </div>
              <a
                href="/api/waitlist/export"
                className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-burgundy-700 hover:text-burgundy-500 transition-colors"
              >
                <Download size={12} strokeWidth={1.8} />
                Export CSV
              </a>
            </div>
          </section>
        </>
      )}
    </AdminShell>
  )
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={
        'px-4 py-3 font-body text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-500 ' +
        (className ?? '')
      }
    >
      {children}
    </th>
  )
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  })
}
