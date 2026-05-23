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
  ImageIcon,
  Trash2,
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
  const email = user?.email ?? 'admin@designvortex.co'
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

  const basePrice = Number(order.quoted_price ?? 0)
  const adjAmount = Number(order.adjustment_amount ?? 0)
  const hasPricing = (order.quoted_price ?? null) !== null || (order.adjustment_amount ?? null) !== null
  const totalQuote = basePrice + adjAmount

  // Customer history: count prior orders by email (excluding this one).
  const { data: priorOrders } = await admin
    .from('commission_orders')
    .select('id, created_at, quoted_price')
    .eq('customer_email', order.customer_email)
    .neq('id', order.id)
    .order('created_at', { ascending: true })

  const priorCount = priorOrders?.length ?? 0
  const totalSpent = (priorOrders ?? []).reduce(
    (sum, o) => sum + Number(o.quoted_price ?? 0),
    0,
  )
  const firstSeenIso = priorOrders && priorOrders.length > 0
    ? priorOrders[0].created_at
    : order.created_at
  const customerInitials = order.customer_name
    .split(/\s+/)
    .map((s: string) => s.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

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
          <a
            href="#quote-builder"
            className="hidden sm:inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 transition-colors px-4 py-2 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em]"
          >
            <Send size={14} strokeWidth={1.8} />
            Send quote
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
              {order.style && <BriefRow label="Style">{order.style}</BriefRow>}
              <BriefRow label="Description">
                <div className="whitespace-pre-line text-ink-900 leading-relaxed">
                  {order.description}
                </div>
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

          {/* Communication thread (placeholder until email log lands) */}
          <section className="bg-parchment-100 border border-border-light rounded-xl px-6 py-6">
            <div className="flex items-center justify-between mb-3.5">
              <h2 className="font-display text-[1.125rem] font-semibold text-ink-900">
                Communication
              </h2>
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-500">
                View full thread
              </span>
            </div>
            <div className="flex gap-3 pb-3 border-b border-dashed border-border-light">
              <span className="w-8 h-8 rounded-full bg-burgundy-100 text-burgundy-700 flex items-center justify-center flex-shrink-0">
                <Mail size={14} strokeWidth={1.8} />
              </span>
              <div className="flex-1 text-[0.875rem] text-ink-700 leading-[1.55]">
                <div className="flex justify-between items-baseline mb-1">
                  <strong className="text-ink-900 font-display text-base font-semibold">
                    Brief auto-receipt sent
                  </strong>
                  <span className="text-[0.75rem] text-ink-500">{fmtAgo(order.created_at)}</span>
                </div>
                <span>
                  &ldquo;Thanks for your brief, {order.customer_name.split(' ')[0]} — we&rsquo;ll
                  send a fixed quote within 48 hours.&rdquo;
                </span>
              </div>
            </div>
            <div className="mt-4">
              <textarea
                disabled
                placeholder={`Reply to ${order.customer_name.split(' ')[0]}…  (email thread coming soon)`}
                className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-3.5 py-2.5 text-[0.9375rem] text-ink-700 placeholder:text-ink-500 min-h-[80px] resize-y opacity-70 cursor-not-allowed"
              />
              <div className="flex justify-between items-center mt-2.5">
                <div className="text-[0.75rem] text-ink-500">
                  Replies will send from{' '}
                  <strong className="text-ink-700">theo@designvortek.com</strong> via Resend
                </div>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 bg-burgundy-700/60 text-cream-50 px-4 py-2 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] cursor-not-allowed"
                >
                  Send reply
                  <Send size={12} strokeWidth={1.8} />
                </button>
              </div>
            </div>
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
              Click any state to change. Customer gets an email on every transition.
            </p>
          </section>

          {/* Quote builder */}
          <section
            id="quote-builder"
            className="bg-parchment-100 border border-border-light rounded-xl px-6 pt-6 pb-0 overflow-hidden scroll-mt-24"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-[1.125rem] font-semibold text-ink-900">
                Quote builder
              </h2>
            </div>
            <form action={sendQuote} className="flex flex-col">
              <input type="hidden" name="id" value={order.id} />

              {/* Base price row — matches .adm-quote-row layout from design */}
              <div className="flex items-center gap-2.5 py-3">
                <div className="flex-1">
                  <span className="text-ink-500 text-[0.8125rem]">
                    Base price{order.service_type ? ` (${order.service_type})` : ''}
                  </span>
                </div>
                <div className="relative w-[120px] flex-shrink-0">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 font-semibold pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    name="quoted_price"
                    min={0}
                    step="1"
                    defaultValue={order.quoted_price ?? ''}
                    placeholder="320"
                    className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md pl-6 pr-3 py-2.5 text-base text-ink-900 font-mono placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:ring-[3px] focus:ring-burgundy-100 transition-all"
                  />
                </div>
              </div>

              {/* Custom adjustment block — gold dashed border per .adm-adjust */}
              <div className="bg-parchment-50 border border-dashed border-gold-500 rounded-md p-4 my-2.5 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-900 tracking-[0.01em]">
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-gold-700 flex-shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M19 5L5 19M9 5h10v10" />
                  </svg>
                  <span>Custom adjustment</span>
                  <span className="ml-auto not-italic text-ink-500 text-[0.6875rem] font-medium tracking-normal">
                    optional · discount or surcharge
                  </span>
                </div>

                <div className="flex gap-2.5 items-stretch">
                  <input
                    type="text"
                    name="adjustment_label"
                    defaultValue={order.adjustment_label ?? ''}
                    placeholder="Label shown to customer · e.g. Returning client, multi-piece bundle"
                    className="flex-1 min-w-0 bg-parchment-50 border border-border-medium rounded-md px-3 py-2.5 text-[0.875rem] text-ink-900 placeholder:text-ink-400 placeholder:text-[0.8125rem] focus:outline-none focus:border-gold-500 focus:ring-[3px] focus:ring-gold-100 transition-all"
                  />
                  <div className="relative w-[120px] flex-shrink-0">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 font-semibold pointer-events-none">
                      $
                    </span>
                    <input
                      type="text"
                      name="adjustment_amount"
                      defaultValue={order.adjustment_amount ?? ''}
                      placeholder="±0"
                      inputMode="numeric"
                      className="w-full h-full bg-parchment-50 border-[1.5px] border-border-light rounded-md pl-6 pr-3 py-2.5 text-base text-ink-900 font-mono placeholder:text-ink-400 focus:outline-none focus:border-gold-500 focus:ring-[3px] focus:ring-gold-100 transition-all"
                    />
                  </div>
                </div>

                <textarea
                  name="adjustment_reason"
                  defaultValue={order.adjustment_reason ?? ''}
                  rows={2}
                  placeholder="Internal note · why this adjustment? (private, not sent to customer)"
                  className="w-full bg-white/55 border border-border-medium rounded-md px-3 py-2.5 text-[0.8125rem] text-ink-700 placeholder:text-ink-400 focus:outline-none focus:border-gold-500 focus:ring-[3px] focus:ring-gold-100 transition-all resize-y min-h-[56px] leading-[1.5]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 transition-colors px-4 py-2.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] mt-2 mb-3 self-end"
              >
                <Send size={14} strokeWidth={1.8} />
                Send quote
              </button>
              <p className="text-xs text-ink-500 leading-relaxed mb-4">
                Sending a quote sets status to{' '}
                <strong className="text-ink-700">Quoted</strong>. The custom adjustment label
                appears on the customer&apos;s quote email; the internal note stays private.
              </p>

              {/* Total quote bar — gold strip flush to the card bottom. */}
              <div
                className="flex items-center justify-between bg-gold-100 -mx-6 px-6 py-3.5 rounded-b-xl"
                aria-label="Total quote"
              >
                <span className="font-display text-base font-semibold text-ink-900">
                  Total quote
                </span>
                <span className="font-display text-[1.75rem] font-semibold text-burgundy-700 tracking-[-0.015em]">
                  {hasPricing ? `$${totalQuote}` : '—'}
                </span>
              </div>
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
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md text-sm text-ink-700 hover:bg-parchment-200 border border-border-light transition-colors w-full justify-start"
              >
                <Mail size={14} strokeWidth={1.8} className="text-burgundy-700" />
                Send quote email
              </a>
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md text-sm text-ink-500 hover:bg-parchment-200 transition-colors w-full justify-start cursor-not-allowed select-none"
              >
                <CalendarDays size={14} strokeWidth={1.8} />
                Schedule a call
              </span>
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md text-sm text-ink-500 hover:bg-parchment-200 transition-colors w-full justify-start cursor-not-allowed select-none"
              >
                <ImageIcon size={14} strokeWidth={1.8} />
                Move to portfolio
              </span>
              <form action={updateOrderStatus}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value="closed" />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-md text-sm text-burgundy-700 hover:bg-parchment-200 transition-colors w-full justify-start"
                >
                  <Trash2 size={14} strokeWidth={1.8} />
                  Archive order
                </button>
              </form>
            </div>
          </section>

          {/* Customer history */}
          <section className="bg-parchment-100 border border-border-light rounded-xl px-6 py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-[1.125rem] font-semibold text-ink-900">
                About this customer
              </h2>
            </div>
            <div className="flex gap-3 items-center mb-3.5">
              <div className="w-11 h-11 rounded-full bg-burgundy-700 text-cream-50 flex items-center justify-center font-display text-base font-semibold flex-shrink-0">
                {customerInitials}
              </div>
              <div className="min-w-0">
                <div className="font-display text-[1.125rem] font-semibold text-ink-900 truncate">
                  {order.customer_name}
                </div>
                <div className="text-[0.8125rem] text-ink-500 truncate">
                  {order.customer_email}
                  {order.customer_phone && <> · {order.customer_phone}</>}
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex justify-between items-center py-2 border-b border-dashed border-border-light">
                <span className="text-ink-500 text-[0.8125rem]">Past orders</span>
                <span className="text-ink-900 text-[0.8125rem] font-medium">
                  {priorCount === 0
                    ? 'First-time customer'
                    : `${priorCount} commission${priorCount === 1 ? '' : 's'}${
                        totalSpent > 0 ? ` · $${totalSpent} spent` : ''
                      }`}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed border-border-light">
                <span className="text-ink-500 text-[0.8125rem]">First seen</span>
                <span className="text-ink-900 text-[0.8125rem] font-medium">
                  {fmtMonthYear(firstSeenIso)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-ink-500 text-[0.8125rem]">Email</span>
                <a
                  href={`mailto:${order.customer_email}`}
                  className="text-burgundy-700 hover:text-burgundy-500 text-[0.8125rem] font-medium truncate max-w-[60%]"
                >
                  {order.customer_email}
                </a>
              </div>
            </div>
            <Link
              href={`/admin/customers/${encodeURIComponent(order.customer_email)}`}
              className="block text-center mt-3 text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:text-burgundy-500 transition-colors"
            >
              View customer profile →
            </Link>
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

function fmtMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  })
}
