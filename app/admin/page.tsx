import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import StatusPill from '@/components/admin/StatusPill'
import {
  ShoppingBag, Briefcase, DollarSign, MessageSquare,
  TrendingUp, ChevronRight, ArrowUpRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fallback if (impossible — middleware redirects) the user isn't loaded
  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  // --- Live data from Supabase ---
  const admin = createAdminClient()
  const [
    pendingOrdersRes,
    activeOrdersRes,
    deliveredOrdersRes,
    unreadInquiriesRes,
    recentOrdersRes,
  ] = await Promise.all([
    admin.from('commission_orders').select('id', { count: 'exact', head: true }).in('status', ['pending', 'reviewing']),
    admin.from('commission_orders').select('id', { count: 'exact', head: true }).in('status', ['quoted', 'accepted', 'in_progress']),
    admin.from('commission_orders').select('quoted_price').gte('created_at', new Date(new Date().setDate(1)).toISOString()).eq('status', 'delivered'),
    admin.from('inquiries').select('id', { count: 'exact', head: true }).eq('is_read', false),
    admin.from('commission_orders').select('id, customer_name, customer_email, service_type, status, created_at').order('created_at', { ascending: false }).limit(6),
  ])

  const pendingCount = pendingOrdersRes.count ?? 0
  const activeCount = activeOrdersRes.count ?? 0
  const revenueMonth = (deliveredOrdersRes.data ?? []).reduce((sum, o) => sum + Number(o.quoted_price ?? 0), 0)
  const unreadInquiries = unreadInquiriesRes.count ?? 0
  const recentOrders = recentOrdersRes.data ?? []

  // --- Format helpers ---
  const fmtAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const h = Math.floor(diff / 3_600_000)
    if (h < 1) return 'just now'
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return d === 1 ? 'yesterday' : `${d} days ago`
  }
  const fmtMoney = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })

  return (
    <AdminShell
      user={{ email, initials }}
      title="Dashboard"
      subtitle={`Good ${getTimeOfDay()} — here's what's on the table today.`}
      actions={
        <Link
          href="/admin/orders"
          className="hidden sm:inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-burgundy-500 transition-colors"
        >
          New order <ChevronRight size={14} strokeWidth={2} />
        </Link>
      }
    >
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <StatCard
          label="Pending orders"
          value={pendingCount}
          delta={pendingCount > 0 ? 'Awaiting your action' : 'All caught up'}
          icon={ShoppingBag}
          showDot={pendingCount > 0}
        />

        <StatCard
          label="Active commissions"
          value={activeCount}
          delta="Quoted · in-progress"
          icon={Briefcase}
        />

        <StatCard
          label="Revenue · month"
          value={fmtMoney(revenueMonth)}
          delta={revenueMonth > 0 ? 'From delivered work' : 'No revenue yet this month'}
          deltaPositive
          icon={DollarSign}
        />

        <StatCard
          label="Unread inquiries"
          value={unreadInquiries}
          delta={unreadInquiries > 0 ? 'Reply within 48h target' : 'Inbox clear'}
          icon={MessageSquare}
          showDot={unreadInquiries > 0}
        />
      </div>

      {/* Recent orders + side panels */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-5">

        {/* Recent orders table */}
        <section className="bg-parchment-100 border border-border-light rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
            <h2 className="font-display text-lg font-semibold text-ink-900">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:text-burgundy-500 inline-flex items-center gap-1"
            >
              View all <ChevronRight size={12} strokeWidth={2} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="px-5 py-12 text-center text-ink-500 text-sm">
              <p>No orders yet.</p>
              <p className="mt-1 text-xs">New submissions will show up here as customers fill the order form.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-parchment-50">
                  <tr>
                    <Th>Customer</Th>
                    <Th>Service</Th>
                    <Th>Status</Th>
                    <Th>When</Th>
                    <Th className="w-12 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-border-light hover:bg-parchment-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-display text-base font-semibold text-ink-900">{order.customer_name}</div>
                        <div className="text-xs text-ink-500 mt-0.5">{order.customer_email}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-ink-700">{order.service_type}</td>
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

        {/* Side panels */}
        <div className="flex flex-col gap-5">

          {/* Quick stats */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">This week</h2>
            <ul className="space-y-3 text-sm">
              <Stat label="New orders" value="—" />
              <Stat label="Delivered" value="—" />
              <Stat label="Avg. quote response" value="—" />
              <Stat label="Site visitors" value="—" hint="Enable Vercel Analytics" />
            </ul>
            <p className="text-xs text-ink-500 mt-4 leading-relaxed">
              Weekly trends will populate once you have ~30 days of order history.
            </p>
          </section>

          {/* Activity feed placeholder */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">Activity</h2>
            <ul className="space-y-3 text-[0.8125rem] text-ink-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 flex-shrink-0" />
                <span>Live activity feed will populate as orders, inquiries, and new reviews come in.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-burgundy-500 mt-1.5 flex-shrink-0" />
                <span>You have <strong className="text-ink-900">{pendingCount}</strong> {pendingCount === 1 ? 'order' : 'orders'} waiting for your quote.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-forest-500 mt-1.5 flex-shrink-0" />
                <span><strong className="text-ink-900">{unreadInquiries}</strong> unread {unreadInquiries === 1 ? 'message' : 'messages'} in inquiries.</span>
              </li>
            </ul>
          </section>

          {/* Quick links */}
          <section className="bg-tome-950 text-cream-50 rounded-xl p-5">
            <h2 className="font-display text-lg font-semibold text-cream-50 mb-3">Quick links</h2>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/admin/orders',     label: 'Manage orders' },
                { href: '/admin/portfolio',  label: 'Upload portfolio piece' },
                { href: '/admin/blog',       label: 'Write a blog post' },
                { href: '/admin/availability', label: 'Set monthly availability' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex items-center gap-2 text-cream-200 hover:text-gold-glow transition-colors">
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
    <th className={`px-5 py-3 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 ${className ?? ''}`}>
      {children}
    </th>
  )
}

function StatCard({
  label, value, delta, deltaPositive, icon: Icon, showDot,
}: {
  label: string
  value: string | number
  delta?: string
  deltaPositive?: boolean
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  showDot?: boolean
}) {
  return (
    <div className="relative bg-parchment-100 border border-border-light rounded-xl p-5">
      {showDot && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-burgundy-700">
          <span className="absolute inset-[-3px] rounded-full bg-burgundy-700 opacity-35 animate-ping" />
        </span>
      )}
      <div className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-3">
        <Icon size={14} strokeWidth={1.8} className="text-gold-700" />
        {label}
      </div>
      <div className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-none tracking-tight">{value}</div>
      {delta && (
        <div className={`text-xs mt-2 inline-flex items-center gap-1 ${deltaPositive ? 'text-forest-700' : 'text-ink-500'}`}>
          {deltaPositive && <TrendingUp size={12} strokeWidth={2} />}
          {delta}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <li className="flex items-center justify-between gap-3 py-1">
      <div>
        <div className="text-ink-700">{label}</div>
        {hint && <div className="text-[0.6875rem] text-ink-500 mt-0.5">{hint}</div>}
      </div>
      <div className="font-display text-lg font-semibold text-ink-900">{value}</div>
    </li>
  )
}
