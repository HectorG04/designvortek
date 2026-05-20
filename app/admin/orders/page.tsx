import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import StatusPill from '@/components/admin/StatusPill'
import {
  ShoppingBag, Briefcase, CheckCircle2, DollarSign,
  ChevronRight, Download,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Orders' }

const FILTERS = [
  { key: 'all',          label: 'All' },
  { key: 'pending',      label: 'Pending' },
  { key: 'in_progress',  label: 'In progress' },
  { key: 'delivered',    label: 'Delivered' },
  { key: 'closed',       label: 'Closed' },
] as const

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: orders } = await admin
    .from('commission_orders')
    .select('*')
    .order('created_at', { ascending: false })

  const allOrders = orders ?? []

  // Stats
  const pendingCount     = allOrders.filter((o) => o.status === 'pending' || o.status === 'reviewing').length
  const inProgressCount  = allOrders.filter((o) => o.status === 'quoted' || o.status === 'accepted' || o.status === 'in_progress').length
  const startOfMonth = new Date(new Date().setDate(1)).setHours(0, 0, 0, 0)
  const deliveredThisMonth = allOrders.filter(
    (o) => o.status === 'delivered' && new Date(o.created_at).getTime() >= startOfMonth
  )
  const deliveredCount = deliveredThisMonth.length
  const totalRevenue = allOrders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.quoted_price ?? 0), 0)

  const awaitingAction = pendingCount
  const subtitle = `${allOrders.length} ${allOrders.length === 1 ? 'commission' : 'commissions'} · ${awaitingAction} awaiting action`

  // Filter chip counts
  const filterCounts: Record<string, number> = {
    all: allOrders.length,
    pending: pendingCount,
    in_progress: inProgressCount,
    delivered: allOrders.filter((o) => o.status === 'delivered').length,
    closed: allOrders.filter((o) => o.status === 'closed' || o.status === 'cancelled').length,
  }

  return (
    <AdminShell
      user={{ email, initials }}
      title="Orders"
      subtitle={subtitle}
      actions={
        <button
          type="button"
          className="hidden sm:inline-flex items-center gap-1.5 bg-transparent border-[1.5px] border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50 transition-colors px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
        >
          <Download size={14} strokeWidth={1.8} />
          Export CSV
        </button>
      }
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MiniStat
          label="Pending"
          value={pendingCount}
          icon={ShoppingBag}
          showDot={pendingCount > 0}
        />
        <MiniStat
          label="In progress"
          value={inProgressCount}
          icon={Briefcase}
        />
        <MiniStat
          label="Delivered this month"
          value={deliveredCount}
          icon={CheckCircle2}
        />
        <MiniStat
          label="Total revenue"
          value={fmtMoney(totalRevenue)}
          icon={DollarSign}
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => {
          const active = f.key === 'all'
          return (
            <span
              key={f.key}
              data-active={active || undefined}
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

      {/* Orders panel */}
      <section className="bg-parchment-100 border border-border-light rounded-xl overflow-hidden">
        {allOrders.length === 0 ? (
          <div className="px-5 py-16 text-center text-ink-500">
            <ShoppingBag size={28} strokeWidth={1.5} className="mx-auto mb-3 text-ink-400" />
            <p className="font-display text-xl text-ink-900">No orders yet</p>
            <p className="mt-1 text-sm">New commission submissions will appear here as customers fill the order form.</p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:text-burgundy-500"
            >
              Back to dashboard <ChevronRight size={12} strokeWidth={2} />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-parchment-50">
                <tr>
                  <Th>Customer</Th>
                  <Th>Service</Th>
                  <Th>Budget</Th>
                  <Th>Status</Th>
                  <Th>Submitted</Th>
                  <Th className="w-12 text-right" />
                </tr>
              </thead>
              <tbody>
                {allOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-border-light hover:bg-parchment-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-display text-base font-semibold text-ink-900">{order.customer_name}</div>
                      <div className="text-xs text-ink-500 mt-0.5 truncate max-w-[220px]">{order.customer_email}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-700">
                      {order.service_type}
                      {order.style && <span className="text-ink-500"> · {order.style}</span>}
                    </td>
                    <td className="px-5 py-4 text-[0.8125rem] font-mono text-ink-700">
                      {order.budget ?? <span className="text-ink-400">—</span>}
                    </td>
                    <td className="px-5 py-4"><StatusPill status={order.status} /></td>
                    <td className="px-5 py-4 text-[0.8125rem] text-ink-500 font-mono">{fmtAgo(order.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex w-8 h-8 items-center justify-center rounded-md text-ink-500 hover:bg-parchment-200 hover:text-burgundy-700 transition-colors"
                        aria-label="Open order"
                      >
                        <ChevronRight size={16} strokeWidth={2} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-5 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 ${className ?? ''}`}
    >
      {children}
    </th>
  )
}

function MiniStat({
  label,
  value,
  icon: Icon,
  showDot,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  showDot?: boolean
}) {
  return (
    <div className="relative bg-parchment-100 border border-border-light rounded-xl p-4">
      {showDot && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-burgundy-700">
          <span className="absolute inset-[-3px] rounded-full bg-burgundy-700 opacity-35 animate-ping" />
        </span>
      )}
      <div className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-2">
        <Icon size={14} strokeWidth={1.8} className="text-gold-700" />
        {label}
      </div>
      <div className="font-display text-2xl md:text-3xl font-semibold text-ink-900 leading-none tracking-tight">
        {value}
      </div>
    </div>
  )
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
