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
  CalendarDays,
  ExternalLink,
  Send,
  Clock,
  FileText,
} from 'lucide-react'
import { updateOrderNotes, updateOrderStatus, sendQuote } from './_actions'

export const metadata: Metadata = { title: 'Order detail' }

const STATUS_OPTIONS = [
  'pending',
  'reviewing',
  'quoted',
  'accepted',
  'in_progress',
  'delivered',
  'closed',
  'cancelled',
] as const

interface OrderDetailProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailProps) {
  const { id: idParam } = await params
  const orderId = Number(idParam)
  if (!Number.isFinite(orderId) || orderId <= 0) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: order, error } = await admin
    .from('commission_orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error || !order) {
    notFound()
  }

  const orderRef = formatOrderRef(order.id, order.created_at)
  const referenceLinks = parseLinks(order.reference_links)

  return (
    <AdminShell
      user={{ email, initials }}
      title={order.customer_name}
      subtitle={`${orderRef} · submitted ${fmtAgo(order.created_at)}`}
      showSearch={false}
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-700 hover:bg-parchment-200 transition-colors"
          >
            <ChevronLeft size={14} strokeWidth={2} />
            All orders
          </Link>
          <a
            href={`mailto:${order.customer_email}?subject=Re: your commission brief (${orderRef})`}
            className="hidden sm:inline-flex items-center gap-1.5 bg-transparent border-[1.5px] border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50 transition-colors px-4 py-2 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em]"
          >
            <Mail size={14} strokeWidth={1.8} />
            Email customer
          </a>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
        {/* LEFT 60% */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* Order header card */}
          <section className="bg-parchment-100 border border-border-light rounded-xl px-6 py-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="text-[0.8125rem] font-mono text-ink-500 mb-1.5">
                  {orderRef}
                </div>
                <div className="font-display text-[1.75rem] font-semibold text-ink-900 tracking-[-0.015em] leading-tight mb-1.5">
                  {order.customer_name}
                </div>
                <div className="text-[0.9375rem] text-ink-700">
                  <strong className="text-ink-900">{order.service_type}</strong>
                  {order.style && <> · {order.style}</>}
                  {order.budget && (
                    <>
                      {' '}· budget <strong className="text-ink-900">{order.budget}</strong>
                    </>
                  )}
                  {order.deadline && (
                    <>
                      {' '}· deadline{' '}
                      <strong className="text-ink-900">{fmtDate(order.deadline)}</strong>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-ink-500">
                  <a
                    href={`mailto:${order.customer_email}`}
                    className="inline-flex items-center gap-1.5 hover:text-burgundy-700 transition-colors"
                  >
                    <Mail size={12} strokeWidth={1.8} /> {order.customer_email}
                  </a>
                  {order.customer_phone && (
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="inline-flex items-center gap-1.5 hover:text-burgundy-700 transition-colors"
                    >
                      <Phone size={12} strokeWidth={1.8} /> {order.customer_phone}
                    </a>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={12} strokeWidth={1.8} /> {fmtDate(order.created_at)}
                  </span>
                  <Link
                    href={`/admin/customers/${encodeURIComponent(order.customer_email)}`}
                    className="inline-flex items-center gap-1.5 text-burgundy-700 hover:text-burgundy-500 transition-colors"
                  >
                    View customer →
                  </Link>
                </div>
              </div>
              <a
                href="#status-changer"
                className="block flex-shrink-0"
                aria-label="Jump to status changer"
              >
                <StatusPill status={order.status} className="text-[0.9375rem] px-3.5 py-2" />
              </a>
            </div>
          </section>

          {/* Commission brief */}
          <section className="bg-parchment-100 border border-border-light rounded-xl px-6 py-6">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-display text-[1.125rem] font-semibold text-ink-900">
                Commission brief
              </h2>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500">
                From the customer
              </span>
            </div>
            <dl className="m-0">
              <BriefRow label="Service">
                {order.service_type}
                {order.style && <> · {order.style}</>}
              </BriefRow>
              <BriefRow label="Budget">
                {order.budget || <Muted>— not specified —</Muted>}
              </BriefRow>
              <BriefRow label="Deadline">
                {order.deadline ? (
                  fmtDate(order.deadline)
                ) : (
                  <Muted>— flexible —</Muted>
                )}
              </BriefRow>
              <BriefRow label="References">
                {referenceLinks.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {referenceLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-burgundy-700 hover:text-burgundy-500 border-b border-dashed border-burgundy-700/40 hover:border-burgundy-500/40 font-mono text-[0.8125rem] break-all max-w-fit"
                      >
                        <ExternalLink size={12} strokeWidth={1.8} className="flex-shrink-0" />
                        <span>{link}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <Muted>— none provided —</Muted>
                )}
              </BriefRow>
              <BriefRow label="Description">
                <div className="whitespace-pre-line text-ink-900 leading-relaxed">
                  {order.description}
                </div>
              </BriefRow>
            </dl>
          </section>

          {/* Internal notes — server action form, Markdown preview if saved */}
          <section className="bg-parchment-100 border border-border-light rounded-xl px-6 py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-[1.125rem] font-semibold text-ink-900">
                Internal notes
              </h2>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500">
                Admin only
              </span>
            </div>

            {order.internal_notes && (
              <div className="mb-4 bg-gold-100/60 border border-gold-300 rounded-md px-4 py-3 text-[0.9375rem] text-ink-700 leading-relaxed">
                <Markdown>{order.internal_notes}</Markdown>
              </div>
            )}

            <form action={updateOrderNotes} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={order.id} />
              <textarea
                name="internal_notes"
                defaultValue={order.internal_notes ?? ''}
                rows={5}
                placeholder="Pricing thoughts, customer history, scheduling notes… Supports **bold**, *italic*, and [links](https://...)."
                className="w-full bg-gold-100/50 border-[1.5px] border-gold-300 rounded-md px-3.5 py-3 text-[0.9375rem] text-ink-700 placeholder:text-ink-500 focus:outline-none focus:border-gold-500 focus:ring-[3px] focus:ring-gold-100 transition-all resize-y leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 transition-colors px-4 py-2 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em]"
                >
                  Save notes
                </button>
              </div>
            </form>
          </section>

          {/* Activity log */}
          <section className="bg-parchment-100 border border-border-light rounded-xl px-6 py-6">
            <h2 className="font-display text-[1.125rem] font-semibold text-ink-900 mb-4">
              Activity
            </h2>
            <ul className="flex flex-col gap-0">
              <TimelineItem
                icon={FileText}
                tone="gold"
                title="Brief submitted"
                meta={`${fmtDate(order.created_at)} · ${fmtAgo(order.created_at)}`}
              />
              {order.updated_at && order.updated_at !== order.created_at && (
                <TimelineItem
                  icon={Clock}
                  tone="burgundy"
                  title="Order updated"
                  meta={`${fmtDate(order.updated_at)} · ${fmtAgo(order.updated_at)}`}
                />
              )}
            </ul>
          </section>
        </div>

        {/* RIGHT 40% */}
        <div className="flex flex-col gap-4 min-w-0">
          {/* Status changer */}
          <section
            id="status-changer"
            className="bg-parchment-100 border border-border-light rounded-xl px-6 py-6 scroll-mt-24"
          >
            <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 mb-3">
              Status
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {STATUS_OPTIONS.map((s) => {
                const isCurrent = order.status === s
                return (
                  <form key={s} action={updateOrderStatus}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      disabled={isCurrent}
                      aria-pressed={isCurrent}
                      className={
                        isCurrent
                          ? 'block w-full rounded-full outline-2 outline-burgundy-700 outline-offset-2 cursor-default'
                          : 'block w-full rounded-full opacity-70 hover:opacity-100 transition-opacity cursor-pointer'
                      }
                    >
                      <StatusPill
                        status={s}
                        className="w-full justify-center px-2.5 py-2 text-[0.8125rem]"
                      />
                    </button>
                  </form>
                )
              })}
            </div>
            <p className="text-xs text-ink-500 mt-3 leading-relaxed">
              Click any state to change. Customer notifications can be wired in later.
            </p>
          </section>

          {/* Quote builder */}
          <section className="bg-parchment-100 border border-border-light rounded-xl px-6 py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-[1.125rem] font-semibold text-ink-900">
                Quote builder
              </h2>
            </div>
            <form action={sendQuote} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={order.id} />
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500">
                  Quoted price (USD)
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    name="quoted_price"
                    min={0}
                    step="1"
                    defaultValue={order.quoted_price ?? ''}
                    placeholder="320"
                    className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md pl-7 pr-3 py-2.5 text-base text-ink-900 font-mono placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:ring-[3px] focus:ring-burgundy-100 transition-all"
                  />
                </div>
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 bg-gold-500 text-ink-900 hover:bg-gold-300 hover:shadow-[0_8px_24px_rgba(201,160,74,0.32)] transition-all px-4 py-2.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em]"
              >
                <Send size={14} strokeWidth={1.8} />
                Send quote
              </button>
              <p className="text-xs text-ink-500 leading-relaxed">
                Sending a quote sets status to{' '}
                <strong className="text-ink-700">Quoted</strong>.
              </p>
            </form>
          </section>

          {/* Quick actions */}
          <section className="bg-parchment-100 border border-border-light rounded-xl px-6 py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-[1.125rem] font-semibold text-ink-900">
                Quick actions
              </h2>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={`mailto:${order.customer_email}?subject=Re: your commission brief (${orderRef})`}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md text-sm text-ink-700 hover:bg-parchment-200 border border-border-light transition-colors"
              >
                <Mail size={14} strokeWidth={1.8} className="text-burgundy-700" />
                Email customer
              </a>
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md text-sm text-ink-500 border border-dashed border-border-light cursor-not-allowed select-none"
              >
                <CalendarDays size={14} strokeWidth={1.8} className="text-ink-400" />
                Schedule call (soon)
              </span>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  )
}

function BriefRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 py-2 border-b border-dashed border-border-light last:border-b-0">
      <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-ink-500 pt-0.5">
        {label}
      </dt>
      <dd className="m-0 text-[0.9375rem] text-ink-900 leading-relaxed min-w-0">
        {children}
      </dd>
    </div>
  )
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span className="italic text-ink-500">{children}</span>
}

function TimelineItem({
  icon: Icon,
  tone,
  title,
  meta,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  tone: 'burgundy' | 'gold' | 'forest' | 'default'
  title: string
  meta: string
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
      <div className="flex-1 min-w-0">
        <div className="text-[0.9375rem] font-semibold text-ink-900">{title}</div>
        <div className="text-[0.75rem] text-ink-500 mt-0.5">{meta}</div>
      </div>
    </li>
  )
}

function formatOrderRef(id: number, createdAt: string) {
  const d = new Date(createdAt)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const idPart = String(id).padStart(4, '0')
  return `DV-${y}-${m}${day}-${idPart}`
}

function parseLinks(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
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

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
