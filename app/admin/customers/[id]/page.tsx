import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import StatusPill from '@/components/admin/StatusPill'
import Markdown from '@/components/ui/Markdown'
import {
  ChevronLeft,
  Mail,
  Phone,
  ShoppingBag,
  DollarSign,
  Calendar,
  CheckCircle2,
  FileText,
  MessageSquare,
} from 'lucide-react'

interface CustomerDetailProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: CustomerDetailProps): Promise<Metadata> {
  const { id } = await params
  const email = safeDecode(id)
  return { title: email || 'Customer' }
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailProps) {
  const { id } = await params
  const customerEmail = safeDecode(id).toLowerCase()
  if (!customerEmail) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortex.co'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: ordersData } = await admin
    .from('commission_orders')
    .select('*')
    .ilike('customer_email', customerEmail)
    .order('created_at', { ascending: false })

  const orders = ordersData ?? []
  if (orders.length === 0) notFound()

  const latestOrder = orders[0]
  const firstOrder = orders[orders.length - 1]
  const customerName = latestOrder.customer_name
  const customerPhone = latestOrder.customer_phone
  const totalOrders = orders.length
  const totalSpent = orders.reduce(
    (s, o) => s + Number(o.quoted_price ?? 0),
    0,
  )
  const avgOrder = totalOrders > 0 ? totalSpent / totalOrders : 0
  const customerSince = fmtMonthYear(firstOrder.created_at)
  const lastActivity = fmtAgo(latestOrder.created_at)
  const avatarInitials = initialsOf(customerName, customerEmail)

  return (
    <AdminShell
      user={{ email, initials }}
      title={customerName}
      subtitle={`Customer since ${customerSince} · ${totalOrders} ${totalOrders === 1 ? 'order' : 'orders'} · ${fmtMoney(totalSpent)} lifetime`}
      actions={
        <a
          href={`mailto:${customerEmail}`}
          className="hidden sm:inline-flex items-center gap-1.5 bg-transparent border-[1.5px] border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50 transition-colors px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
        >
          <Mail size={14} strokeWidth={1.8} />
          Email
        </a>
      }
    >
      {/* Breadcrumb */}
      <div className="mb-5">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-1 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-ink-500 hover:text-burgundy-700 transition-colors"
        >
          <ChevronLeft size={14} strokeWidth={2} />
          Customers / {customerName}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 lg:gap-6">
        {/* LEFT */}
        <div className="flex flex-col gap-5">
          {/* Stat tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Stat label="Total orders" value={totalOrders} icon={ShoppingBag} />
            <Stat
              label="Lifetime spend"
              value={fmtMoney(totalSpent)}
              icon={DollarSign}
            />
            <Stat
              label="Average order"
              value={fmtMoney(avgOrder)}
              icon={CheckCircle2}
            />
          </div>

          {/* Orders */}
          <section className="bg-parchment-100 border border-border-light rounded-xl overflow-hidden">
            <header className="px-5 py-4 border-b border-border-light flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
                Orders &amp; commissions
              </h2>
              <span className="text-[0.8125rem] text-ink-500">
                {totalOrders} total · {fmtMoney(totalSpent)} spent
              </span>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-parchment-50">
                  <tr>
                    <Th>Order</Th>
                    <Th>Service</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Submitted</Th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-border-light hover:bg-parchment-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-mono text-[0.8125rem] text-burgundy-700 hover:text-burgundy-500 transition-colors"
                        >
                          #{o.id}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-ink-700">
                        {o.service_type}
                        {o.style && (
                          <span className="text-ink-500"> · {o.style}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[0.8125rem] font-mono text-ink-700">
                        {o.quoted_price != null ? (
                          fmtMoney(Number(o.quoted_price))
                        ) : (
                          <span className="text-ink-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={o.status} />
                      </td>
                      <td className="px-5 py-3.5 text-[0.8125rem] text-ink-500 font-mono">
                        {fmtAgo(o.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Activity timeline */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5 lg:p-6">
            <header className="mb-4">
              <h2 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
                Activity timeline
              </h2>
              <p className="text-[0.75rem] text-ink-500 mt-0.5">
                Order events for this customer.
              </p>
            </header>
            <ol className="flex flex-col gap-0">
              {orders.map((o, idx) => (
                <li
                  key={`act-${o.id}`}
                  className={
                    'flex gap-3 py-3 ' +
                    (idx < orders.length - 1
                      ? 'border-b border-dashed border-border-light'
                      : '')
                  }
                >
                  <span className="mt-0.5 w-8 h-8 rounded-full flex items-center justify-center bg-burgundy-100 text-burgundy-700 flex-shrink-0">
                    <FileText size={14} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.875rem] text-ink-700 leading-snug">
                      Submitted{' '}
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-semibold text-ink-900 hover:text-burgundy-700 transition-colors"
                      >
                        order #{o.id}
                      </Link>{' '}
                      — {o.service_type}
                      {o.style && (
                        <span className="text-ink-500"> · {o.style}</span>
                      )}
                    </div>
                    <div className="text-[0.75rem] text-ink-500 mt-1 font-mono inline-flex items-center gap-2">
                      {fmtAbsolute(o.created_at)} · status:{' '}
                      <StatusPill status={o.status} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Internal notes */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5 lg:p-6">
            <header className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink-900 tracking-tight">
                Internal notes
              </h2>
              <span className="text-[0.6875rem] uppercase tracking-[0.12em] text-ink-500">
                Per-customer notes coming later
              </span>
            </header>
            <textarea
              disabled
              placeholder="Private notes about this customer will be persisted here once the customer profile schema lands…"
              className="w-full min-h-[120px] bg-gold-100 border-[1.5px] border-gold-300 rounded-md p-3 text-sm text-ink-700 placeholder:text-ink-500 resize-y disabled:cursor-not-allowed disabled:opacity-70"
            />
            <p className="text-[0.75rem] text-ink-500 mt-2">
              For now, jot notes per-order in each order&apos;s internal notes
              field.
            </p>
            {latestOrder.internal_notes && (
              <div className="mt-4 pt-4 border-t border-dashed border-border-light">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-2">
                  Notes from latest order
                </p>
                <div className="text-[0.875rem] text-ink-700 [&_p]:mb-2 [&_p:last-child]:mb-0">
                  <Markdown>{latestOrder.internal_notes}</Markdown>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT */}
        <aside className="flex flex-col gap-5">
          <section className="bg-parchment-100 border border-border-light rounded-xl p-5 lg:p-6">
            <div className="flex flex-col items-center gap-3 pb-4 border-b border-border-light">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-cream-50 font-display text-2xl font-semibold"
                style={{
                  background:
                    'linear-gradient(135deg, var(--color-burgundy-700), var(--color-gold-700))',
                }}
              >
                {avatarInitials}
              </div>
              <div className="text-center">
                <div className="font-display text-xl font-semibold text-ink-900 leading-tight">
                  {customerName}
                </div>
                <div className="text-[0.75rem] text-ink-500 mt-1">
                  Customer since {customerSince}
                </div>
              </div>
            </div>

            <dl className="flex flex-col divide-y divide-border-light">
              <Row icon={Mail} label="Email">
                <a
                  href={`mailto:${customerEmail}`}
                  className="font-mono text-[0.8125rem] text-ink-700 hover:text-burgundy-700 transition-colors break-all"
                >
                  {customerEmail}
                </a>
              </Row>
              <Row icon={Phone} label="Phone">
                {customerPhone ? (
                  <a
                    href={`tel:${customerPhone}`}
                    className="font-mono text-[0.8125rem] text-ink-700 hover:text-burgundy-700 transition-colors"
                  >
                    {customerPhone}
                  </a>
                ) : (
                  <span className="text-ink-400 text-[0.8125rem]">—</span>
                )}
              </Row>
              <Row icon={Calendar} label="First order">
                <span className="text-[0.8125rem] text-ink-700 font-mono">
                  {fmtAbsolute(firstOrder.created_at)}
                </span>
              </Row>
              <Row icon={MessageSquare} label="Last activity">
                <span className="text-[0.8125rem] text-ink-700 font-mono">
                  {lastActivity}
                </span>
              </Row>
            </dl>
          </section>

          <section className="bg-parchment-100 border border-border-light rounded-xl p-5 lg:p-6">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-3">
              Spend &amp; loyalty
            </p>
            <dl className="flex flex-col gap-3">
              <KeyValue label="Total orders" value={String(totalOrders)} accent />
              <KeyValue
                label="Lifetime spent"
                value={fmtMoney(totalSpent)}
                accent
              />
              <KeyValue label="Average order" value={fmtMoney(avgOrder)} />
            </dl>
          </section>
        </aside>
      </div>
    </AdminShell>
  )
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value).trim()
  } catch {
    return ''
  }
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

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{
    size?: number
    strokeWidth?: number
    className?: string
  }>
}) {
  return (
    <div className="bg-parchment-100 border border-border-light rounded-xl p-4">
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

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{
    size?: number
    strokeWidth?: number
    className?: string
  }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon
        size={14}
        strokeWidth={1.8}
        className="text-ink-400 mt-0.5 flex-shrink-0"
      />
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[0.6875rem] uppercase tracking-[0.12em] text-ink-500 mb-0.5">
          {label}
        </span>
        {children}
      </div>
    </div>
  )
}

function KeyValue({
  label,
  value,
  accent = false,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-dashed border-border-light last:border-b-0">
      <span className="text-[0.8125rem] text-ink-500">{label}</span>
      <span
        className={
          accent
            ? 'font-display text-xl font-semibold text-burgundy-700'
            : 'text-[0.875rem] text-ink-900 font-medium'
        }
      >
        {value}
      </span>
    </div>
  )
}

function initialsOf(name: string, email: string) {
  const source = name && name.trim() ? name : email
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

function fmtAbsolute(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function fmtMonthYear(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function fmtMoney(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}
