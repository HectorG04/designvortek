import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import StatusPill from '@/components/admin/StatusPill'
import {
  ChevronLeft, Mail, Phone, CalendarDays, ExternalLink,
  Send, Paperclip, Clock, MessageSquare, FileText,
} from 'lucide-react'
import { updateOrderNotes, updateOrderStatus, sendQuote } from './_actions'

export const metadata: Metadata = { title: 'Order detail' }

const STATUS_OPTIONS = [
  'pending', 'reviewing', 'quoted', 'accepted',
  'in_progress', 'delivered', 'closed', 'cancelled',
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
  const { data: { user } } = await supabase.auth.getUser()
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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider text-ink-700 hover:bg-parchment-200 transition-colors"
          >
            <ChevronLeft size={14} strokeWidth={2} />
            All orders
          </Link>
          <a
            href={`mailto:${order.customer_email}`}
            className="hidden sm:inline-flex items-center gap-1.5 bg-transparent border-[1.5px] border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50 transition-colors px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
          >
            <Mail size={14} strokeWidth={1.8} />
            Email customer
          </a>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
        {/* LEFT */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Order header card */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="text-[0.6875rem] font-mono uppercase tracking-[0.15em] text-ink-500">{orderRef}</div>
                <div className="font-display text-2xl font-semibold text-ink-900 mt-1">{order.customer_name}</div>
                <div className="text-sm text-ink-700 mt-2">
                  <strong className="text-ink-900">{order.service_type}</strong>
                  {order.style && <> · <span>{order.style}</span></>}
                  {order.budget && <> · budget <strong className="text-ink-900">{order.budget}</strong></>}
                  {order.deadline && <> · deadline <strong className="text-ink-900">{fmtDate(order.deadline)}</strong></>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={12} strokeWidth={1.8} /> {order.customer_email}
                  </span>
                  {order.customer_phone && (
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={12} strokeWidth={1.8} /> {order.customer_phone}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={12} strokeWidth={1.8} /> {fmtDate(order.created_at)}
                  </span>
                </div>
              </div>
              <StatusPill status={order.status} className="text-[0.75rem] px-3 py-1.5" />
            </div>
          </section>

          {/* Description / brief */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-ink-900">Commission brief</h2>
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink-500">From the customer</span>
            </div>
            <dl className="divide-y divide-border-light">
              <BriefRow label="Service">
                {order.service_type}
                {order.style && <> · {order.style}</>}
              </BriefRow>
              <BriefRow label="Description">
                <p className="whitespace-pre-line">{order.description}</p>
              </BriefRow>
              <BriefRow label="Budget">{order.budget || <Muted>— not specified —</Muted>}</BriefRow>
              <BriefRow label="Deadline">
                {order.deadline ? fmtDate(order.deadline) : <Muted>— flexible —</Muted>}
              </BriefRow>
              <BriefRow label="References">
                {referenceLinks.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {referenceLinks.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-burgundy-700 hover:text-burgundy-500 break-all text-sm"
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
            </dl>
          </section>

          {/* Attachments placeholder */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-3">Attachments</h2>
            <div className="border border-dashed border-border-medium rounded-lg p-6 text-center text-ink-500">
              <Paperclip size={20} strokeWidth={1.5} className="mx-auto mb-2 text-ink-400" />
              <p className="text-sm">No attachments yet.</p>
              <p className="text-xs mt-1">File uploads from the brief form will appear here.</p>
            </div>
          </section>

          {/* Internal notes — server action form */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-semibold text-ink-900">Internal notes</h2>
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink-500">Admin only</span>
            </div>
            <form action={updateOrderNotes} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={order.id} />
              <textarea
                name="internal_notes"
                defaultValue={order.internal_notes ?? ''}
                rows={5}
                placeholder="Pricing thoughts, customer history, scheduling notes…"
                className="w-full bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors resize-y"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 transition-colors px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
                >
                  Save notes
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-5 min-w-0">
          {/* Status changer */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <div className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink-500 mb-3">Status</div>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => {
                const isCurrent = order.status === s
                return (
                  <form key={s} action={updateOrderStatus}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      disabled={isCurrent}
                      className={
                        isCurrent
                          ? 'opacity-100 ring-2 ring-burgundy-700/40 ring-offset-2 ring-offset-parchment-100 rounded-full cursor-default'
                          : 'opacity-70 hover:opacity-100 transition-opacity cursor-pointer rounded-full'
                      }
                      aria-pressed={isCurrent}
                    >
                      <StatusPill status={s} />
                    </button>
                  </form>
                )
              })}
            </div>
            <p className="text-xs text-ink-500 mt-3 leading-relaxed">
              Click a state to update this order. Customer-facing notifications can be wired in later.
            </p>
          </section>

          {/* Quote builder */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-3">Quote builder</h2>
            <form action={sendQuote} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={order.id} />
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500">
                  Quoted price (USD)
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 font-mono text-sm">$</span>
                  <input
                    type="number"
                    name="quoted_price"
                    min={0}
                    step="1"
                    defaultValue={order.quoted_price ?? ''}
                    placeholder="320"
                    className="w-full bg-parchment-50 border border-border-light rounded-md pl-7 pr-3 py-2.5 text-sm text-ink-900 font-mono placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                  />
                </div>
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 transition-colors px-4 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider"
              >
                <Send size={14} strokeWidth={1.8} />
                Send quote
              </button>
              <p className="text-xs text-ink-500 leading-relaxed">
                Sending a quote sets status to <strong className="text-ink-700">Quoted</strong>.
              </p>
            </form>
          </section>

          {/* Activity timeline placeholder */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-4">Activity</h2>
            <ul className="space-y-3 text-[0.8125rem] text-ink-700">
              <li className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center flex-shrink-0">
                  <FileText size={13} strokeWidth={1.8} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink-900">Brief submitted</div>
                  <div className="text-xs text-ink-500 mt-0.5">{fmtDate(order.created_at)} · {fmtAgo(order.created_at)}</div>
                </div>
              </li>
              {order.updated_at && order.updated_at !== order.created_at && (
                <li className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-full bg-burgundy-100 text-burgundy-700 flex items-center justify-center flex-shrink-0">
                    <Clock size={13} strokeWidth={1.8} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink-900">Order updated</div>
                    <div className="text-xs text-ink-500 mt-0.5">{fmtDate(order.updated_at)} · {fmtAgo(order.updated_at)}</div>
                  </div>
                </li>
              )}
              <li className="text-xs text-ink-500 italic pt-2">
                Communication, quote, and delivery events will populate here as wiring expands.
              </li>
            </ul>
          </section>

          {/* Quick actions */}
          <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-ink-900 mb-3">Quick actions</h2>
            <div className="flex flex-col gap-2">
              <a
                href={`mailto:${order.customer_email}?subject=Re: your commission brief (${orderRef})`}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-ink-700 hover:bg-parchment-200 border border-border-light transition-colors"
              >
                <Mail size={14} strokeWidth={1.8} className="text-burgundy-700" />
                Email customer
              </a>
              <a
                href={`mailto:${order.customer_email}?subject=Schedule a call about your brief (${orderRef})`}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-ink-700 hover:bg-parchment-200 border border-border-light transition-colors"
              >
                <CalendarDays size={14} strokeWidth={1.8} className="text-burgundy-700" />
                Schedule a call
              </a>
              <span className="inline-flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-ink-500 border border-dashed border-border-light cursor-not-allowed">
                <MessageSquare size={14} strokeWidth={1.8} className="text-ink-400" />
                Reply thread (soon)
              </span>
            </div>
          </section>
        </div>
      </div>
    </AdminShell>
  )
}

function BriefRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="sm:w-32 flex-shrink-0 text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500 pt-0.5">
        {label}
      </dt>
      <dd className="flex-1 text-sm text-ink-900 leading-relaxed min-w-0">{children}</dd>
    </div>
  )
}

function Muted({ children }: { children: React.ReactNode }) {
  return <span className="italic text-ink-500">{children}</span>
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
  if (m < 60) return m <= 1 ? 'just now' : `${m}m ago`
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
