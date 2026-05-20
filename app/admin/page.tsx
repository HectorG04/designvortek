import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import StatusPill from '@/components/admin/StatusPill'
import {
  ShoppingBag,
  Briefcase,
  DollarSign,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  Star,
  Plus,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function AdminDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  // --- Live data from Supabase ---
  const admin = createAdminClient()
  const startOfMonth = new Date(new Date().setDate(1))
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    pendingOrdersRes,
    activeOrdersRes,
    deliveredOrdersRes,
    unreadInquiriesRes,
    recentOrdersRes,
  ] = await Promise.all([
    admin
      .from('commission_orders')
      .select('id, created_at', { count: 'exact' })
      .in('status', ['pending', 'reviewing'])
      .order('created_at', { ascending: true }),
    admin
      .from('commission_orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['quoted', 'accepted', 'in_progress']),
    admin
      .from('commission_orders')
      .select('quoted_price')
      .gte('created_at', startOfMonth.toISOString())
      .eq('status', 'delivered'),
    admin
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false),
    admin
      .from('commission_orders')
      .select('id, customer_name, customer_email, service_type, style, status, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const pendingCount = pendingOrdersRes.count ?? 0
  const activeCount = activeOrdersRes.count ?? 0
  const revenueMonth = (deliveredOrdersRes.data ?? []).reduce(
    (sum, o) => sum + Number(o.quoted_price ?? 0),
    0,
  )
  const unreadInquiries = unreadInquiriesRes.count ?? 0
  const recentOrders = recentOrdersRes.data ?? []
  const oldestPending = pendingOrdersRes.data?.[0]?.created_at ?? null

  const greeting = getTimeOfDay()
  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const headerSubtitle =
    pendingCount > 0
      ? `${dateLabel} · ${pendingCount} ${pendingCount === 1 ? 'order needs' : 'orders need'} your attention`
      : `${dateLabel} · all caught up`

  return (
    <AdminShell
      user={{ email, initials }}
      title={`Good ${greeting}.`}
      subtitle={headerSubtitle}
      actions={
        <Link
          href="/admin/orders"
          className="hidden sm:inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 px-4 py-2 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] hover:bg-burgundy-500 transition-colors"
        >
          <Plus size={14} strokeWidth={1.8} />
          New order
        </Link>
      }
    >
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Pending orders"
          value={pendingCount}
          icon={ShoppingBag}
          showDot={pendingCount > 0}
          delta={
            pendingCount > 0 && oldestPending
              ? `Awaiting quote · oldest ${fmtAgo(oldestPending)}`
              : 'All caught up'
          }
        />
        <StatCard
          label="Active commissions"
          value={activeCount}
          icon={Briefcase}
          delta="Quoted · in-progress"
          deltaPositive={activeCount > 0}
        />
        <StatCard
          label="Revenue · month"
          value={fmtMoney(revenueMonth)}
          icon={DollarSign}
          delta={revenueMonth > 0 ? 'From delivered work' : 'No revenue yet this month'}
          deltaPositive={revenueMonth > 0}
        />
        <StatCard
          label="Unread inquiries"
          value={unreadInquiries}
          icon={MessageSquare}
          showDot={unreadInquiries > 0}
          delta={unreadInquiries > 0 ? 'Reply within 48h target' : 'Inbox clear'}
        />
      </div>

      {/* Recent orders (60%) + side stack (40%) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-5">
        {/* Recent orders */}
        <section className="bg-parchment-100 border border-border-light rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
            <h2 className="font-display text-lg font-semibold text-ink-900">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:text-burgundy-500 inline-flex items-center gap-1"
            >
              View all <ChevronRight size={12} strokeWidth={2} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-5 py-12 text-center text-ink-500 text-sm">
              <ShoppingBag
                size={28}
                strokeWidth={1.5}
                className="mx-auto mb-3 text-ink-400"
              />
              <p className="font-display text-lg text-ink-900">No orders yet</p>
              <p className="mt-1 text-xs">
                New commission submissions will show up here as customers fill the order form.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-parchment-50">
                  <tr>
                    <Th>Customer</Th>
                    <Th>Service</Th>
                    <Th>Status</Th>
                    <Th>Submitted</Th>
                    <Th className="w-12 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-border-light hover:bg-parchment-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-display text-base font-semibold text-ink-900 leading-tight">
                          {order.customer_name}
                        </div>
                        <div className="text-xs text-ink-500 mt-0.5 truncate max-w-[220px]">
                          {order.customer_email}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[0.9375rem] text-ink-700">
                        {order.service_type}
                        {order.style && (
                          <span className="text-ink-500"> · {order.style}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={order.status} />
                      </td>
                      <td className="px-5 py-4 text-[0.8125rem] text-ink-500 font-mono whitespace-nowrap">
                        {fmtAgo(order.created_at)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-flex w-8 h-8 items-center justify-center rounded-md text-ink-500 hover:bg-parchment-200 hover:text-burgundy-700 transition-colors"
                          aria-label={`Open order from ${order.customer_name}`}
                        >
                          <ChevronRight size={16} strokeWidth={1.8} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Side stack */}
        <div className="flex flex-col gap-5">
          {/* This week mini-stats */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-ink-900">This week</h2>
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink-500">
                Snapshot
              </span>
            </div>
            <ul className="flex flex-col gap-3 text-sm">
              <MiniRow
                icon={ShoppingBag}
                label="New orders"
                value={String(recentOrders.length)}
              />
              <MiniRow
                icon={Briefcase}
                label="Active"
                value={String(activeCount)}
              />
              <MiniRow
                icon={MessageSquare}
                label="Unread inquiries"
                value={String(unreadInquiries)}
              />
              <MiniRow
                icon={DollarSign}
                label="Revenue · month"
                value={fmtMoney(revenueMonth)}
              />
            </ul>
          </section>

          {/* Activity feed */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">Activity</h2>
            <ul className="flex flex-col">
              {pendingCount > 0 && (
                <ActivityItem
                  icon={ShoppingBag}
                  tone="burgundy"
                  body={
                    <>
                      <strong className="text-ink-900 font-semibold">{pendingCount}</strong>{' '}
                      {pendingCount === 1 ? 'order is' : 'orders are'} awaiting a quote.
                    </>
                  }
                  time={
                    oldestPending ? `oldest ${fmtAgo(oldestPending)}` : 'just now'
                  }
                />
              )}
              {unreadInquiries > 0 && (
                <ActivityItem
                  icon={Mail}
                  tone="gold"
                  body={
                    <>
                      <strong className="text-ink-900 font-semibold">
                        {unreadInquiries}
                      </strong>{' '}
                      unread {unreadInquiries === 1 ? 'message' : 'messages'} in inquiries.
                    </>
                  }
                  time="needs reply"
                />
              )}
              {activeCount > 0 && (
                <ActivityItem
                  icon={CheckCircle2}
                  tone="forest"
                  body={
                    <>
                      <strong className="text-ink-900 font-semibold">{activeCount}</strong>{' '}
                      active {activeCount === 1 ? 'commission' : 'commissions'} in progress.
                    </>
                  }
                  time="quoted · accepted · in progress"
                />
              )}
              {pendingCount === 0 && unreadInquiries === 0 && activeCount === 0 && (
                <ActivityItem
                  icon={Star}
                  tone="default"
                  body={<>Studio is quiet. Activity will populate as new orders and inquiries come in.</>}
                  time={dateLabel}
                />
              )}
            </ul>
          </section>

          {/* Quick links — dark tome card */}
          <section className="bg-tome-950 text-cream-50 rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-cream-50 mb-3">
              Quick links
            </h2>
            <ul className="flex flex-col gap-2 text-sm">
              {[
                { href: '/admin/orders', label: 'Manage orders' },
                { href: '/admin/portfolio', label: 'Upload portfolio piece' },
                { href: '/admin/blog', label: 'Write a blog post' },
                { href: '/admin/availability', label: 'Set monthly availability' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-2 text-cream-200 hover:text-gold-glow transition-colors"
                  >
                    <ArrowUpRight size={14} strokeWidth={1.8} />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AdminShell>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
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

function StatCard({
  label,
  value,
  delta,
  deltaPositive,
  icon: Icon,
  showDot,
}: {
  label: string
  value: string | number
  delta?: string
  deltaPositive?: boolean
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  showDot?: boolean
}) {
  return (
    <div className="relative bg-parchment-100 border border-border-light rounded-xl px-5 py-5">
      {showDot && (
        <span
          aria-label="Needs attention"
          className="absolute top-4 right-4 w-2 h-2 rounded-full bg-burgundy-700"
        >
          <span className="absolute inset-[-3px] rounded-full bg-burgundy-700 opacity-35 animate-ping" />
        </span>
      )}
      <div className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-2.5">
        <Icon size={14} strokeWidth={1.8} className="text-gold-700" />
        {label}
      </div>
      <div className="font-display text-[2.25rem] font-semibold text-ink-900 leading-none tracking-[-0.015em]">
        {value}
      </div>
      {delta && (
        <div
          className={`text-xs mt-2 inline-flex items-center gap-1 ${
            deltaPositive ? 'text-forest-700' : 'text-ink-500'
          }`}
        >
          {deltaPositive && <TrendingUp size={12} strokeWidth={2} />}
          {delta}
        </div>
      )}
    </div>
  )
}

function MiniRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  value: string
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-1">
      <span className="inline-flex items-center gap-2 text-ink-700">
        <Icon size={14} strokeWidth={1.8} className="text-gold-700" />
        {label}
      </span>
      <span className="font-display text-lg font-semibold text-ink-900">{value}</span>
    </li>
  )
}

function ActivityItem({
  icon: Icon,
  tone,
  body,
  time,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  tone: 'burgundy' | 'gold' | 'forest' | 'default'
  body: React.ReactNode
  time: string
}) {
  const toneClasses: Record<typeof tone, string> = {
    burgundy: 'bg-burgundy-100 text-burgundy-700',
    gold: 'bg-gold-100 text-gold-700',
    forest: 'bg-forest-500/[0.12] text-forest-700',
    default: 'bg-parchment-200 text-ink-700',
  }
  return (
    <li className="flex items-start gap-3 py-3 border-b border-dashed border-border-light last:border-b-0">
      <span
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${toneClasses[tone]}`}
      >
        <Icon size={14} strokeWidth={1.8} />
      </span>
      <div className="flex-1 min-w-0 text-[0.875rem] text-ink-700 leading-snug">
        <div>{body}</div>
        <div className="text-[0.75rem] text-ink-500 mt-0.5">{time}</div>
      </div>
    </li>
  )
}

function fmtAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
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
