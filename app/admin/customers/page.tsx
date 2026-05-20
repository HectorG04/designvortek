import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import { Users, Search, ChevronRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Customers' }

interface CustomerAggregate {
  email: string
  name: string
  orderCount: number
  totalSpent: number
  lastOrderAt: string
  firstOrderAt: string
}

export default async function CustomersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: ordersData } = await admin
    .from('commission_orders')
    .select('customer_name, customer_email, quoted_price, created_at')
    .order('created_at', { ascending: false })

  const orders = ordersData ?? []

  // Aggregate orders by lowercased email
  const map = new Map<string, CustomerAggregate>()
  for (const o of orders) {
    const key = (o.customer_email ?? '').trim().toLowerCase()
    if (!key) continue
    const existing = map.get(key)
    const price = Number(o.quoted_price ?? 0)
    if (existing) {
      existing.orderCount += 1
      existing.totalSpent += price
      if (new Date(o.created_at) > new Date(existing.lastOrderAt)) {
        existing.lastOrderAt = o.created_at
        existing.name = o.customer_name ?? existing.name
      }
      if (new Date(o.created_at) < new Date(existing.firstOrderAt)) {
        existing.firstOrderAt = o.created_at
      }
    } else {
      map.set(key, {
        email: key,
        name: o.customer_name ?? '—',
        orderCount: 1,
        totalSpent: price,
        lastOrderAt: o.created_at,
        firstOrderAt: o.created_at,
      })
    }
  }

  const customers = Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.lastOrderAt).getTime() - new Date(a.lastOrderAt).getTime(),
  )

  const total = customers.length
  const startOfMonth = new Date(new Date().setDate(1)).setHours(0, 0, 0, 0)
  const newThisMonth = customers.filter(
    (c) => new Date(c.firstOrderAt).getTime() >= startOfMonth,
  ).length

  const subtitle =
    total === 0
      ? 'No customers yet'
      : `${total} total ${total === 1 ? 'customer' : 'customers'} · ${newThisMonth} new this month`

  return (
    <AdminShell user={{ email, initials }} title="Customers" subtitle={subtitle}>
      {/* Search bar (visual only) */}
      <div className="relative max-w-md mb-5">
        <Search
          size={16}
          strokeWidth={1.8}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
        />
        <input
          type="search"
          placeholder="Search by name or email…"
          className="w-full bg-parchment-100 border border-border-light rounded-md pl-9 pr-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:bg-parchment-50 transition-colors"
        />
      </div>

      {/* Customers panel */}
      <section className="bg-parchment-100 border border-border-light rounded-xl overflow-hidden">
        {customers.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Users
              size={28}
              strokeWidth={1.5}
              className="mx-auto mb-3 text-ink-400"
            />
            <p className="font-display text-xl text-ink-900">
              No customers yet
            </p>
            <p className="mt-1 text-sm text-ink-500">
              As commissions come in, customers will be aggregated here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-parchment-50">
                <tr>
                  <Th>Customer</Th>
                  <Th>Orders</Th>
                  <Th>Total spent</Th>
                  <Th>Last order</Th>
                  <Th className="w-12 text-right" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const id = encodeURIComponent(c.email)
                  return (
                    <tr
                      key={c.email}
                      className="border-t border-border-light hover:bg-parchment-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/customers/${id}`}
                          className="flex items-center gap-3 group"
                        >
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-cream-50 font-display text-[0.8125rem] font-semibold flex-shrink-0"
                            style={{
                              background:
                                'linear-gradient(135deg, var(--color-burgundy-700), var(--color-gold-700))',
                            }}
                          >
                            {initialsOf(c.name, c.email)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-display text-base font-semibold text-ink-900 group-hover:text-burgundy-700 transition-colors truncate">
                              {c.name}
                            </div>
                            <div className="text-xs text-ink-500 mt-0.5 truncate max-w-[260px]">
                              {c.email}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-[0.8125rem] font-mono text-ink-700">
                        {c.orderCount}
                      </td>
                      <td className="px-5 py-4 text-[0.8125rem] font-mono text-ink-700">
                        {c.totalSpent > 0 ? (
                          fmtMoney(c.totalSpent)
                        ) : (
                          <span className="text-ink-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-[0.8125rem] font-mono text-ink-500">
                        {fmtAgo(c.lastOrderAt)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/customers/${id}`}
                          aria-label={`Open ${c.name}`}
                          className="inline-flex items-center gap-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-burgundy-700 hover:text-burgundy-500 transition-colors"
                        >
                          View
                          <ChevronRight size={12} strokeWidth={2} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  )
}

function Th({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <th
      className={
        'px-5 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 ' +
        (className ?? '')
      }
    >
      {children}
    </th>
  )
}

function initialsOf(name: string, email: string) {
  const source = name && name !== '—' ? name : email
  const parts = source.trim().split(/[\s@.]+/).filter(Boolean)
  if (parts.length === 0) return '??'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function fmtAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 60) return m <= 1 ? 'just now' : `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'yesterday'
  if (d < 30) return `${d}d ago`
  const mo = Math.floor(d / 30)
  return `${mo}mo ago`
}

function fmtMoney(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}
