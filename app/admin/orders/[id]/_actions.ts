'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { SITE } from '@/lib/email/client'
import {
  sendQuoteEmail,
  sendSketchEmail,
  sendUpdateEmail,
  sendDeliveryEmail,
  sendReleaseEmail,
} from '@/lib/email'
import { depositFor } from '@/lib/addons'
import { fetchProductBySlug } from '@/lib/services-server'

/* =====================================================================
   Order lifecycle server actions.

   Every status-changing action:
     1) updates commission_orders
     2) inserts a row into order_status_log (audit trail)
     3) inserts an outbound row into order_messages (paper trail)
     4) fires the matching transactional email via Resend
     5) revalidates the relevant admin paths

   sendQuote also persists the canonical quote breakdown (base, addons,
   commercial uplift, custom adjustment, total, deposit) so downstream
   Stripe Checkout has everything it needs.
   ===================================================================== */

const VALID_STATUSES = [
  'pending',
  'reviewing',
  'quoted',
  'accepted',
  'in_progress',
  'delivered',
  'closed',
  'cancelled',
] as const

type OrderStatus = (typeof VALID_STATUSES)[number]

function isValidStatus(value: string): value is OrderStatus {
  return (VALID_STATUSES as readonly string[]).includes(value)
}

/* ---------- helpers ---------- */

function parseCurrency(raw: string | null | undefined): number | null {
  if (raw == null) return null
  const s = String(raw).trim()
  if (s.length === 0) return null
  const cleaned = s.replace(/[$+,\s]/g, '').replace(/[–—]/g, '-')
  const n = Number(cleaned)
  return Number.isFinite(n) ? Math.round(n) : null
}

function dollarsToCents(d: number | null): number | null {
  if (d == null || !Number.isFinite(d)) return null
  return Math.round(d * 100)
}

function actorEmail(): string {
  // Server actions don't carry a request — we rely on the auth cookie via
  // createClient() in callers. Here we just tag as 'admin' for the log
  // entry; future work can pull the email off the session via Supabase
  // SSR getUser() and pipe through.
  return 'admin'
}

async function logStatus(
  orderId: number,
  status: string,
  note?: string,
  by_user?: string,
): Promise<void> {
  const admin = createAdminClient()
  await admin.from('order_status_log').insert({
    order_id: orderId,
    status,
    by_user: by_user ?? actorEmail(),
    note: note ?? null,
  })
}

async function logMessage(
  orderId: number,
  body: string,
  subject?: string,
  channel: 'email' | 'admin_note' | 'system' = 'email',
): Promise<void> {
  const admin = createAdminClient()
  await admin.from('order_messages').insert({
    order_id: orderId,
    direction: 'outbound',
    channel,
    subject: subject ?? null,
    body,
  })
}

/* =====================================================================
   updateOrderStatus — admin status changer on the right rail.
   Sends the right transactional email per transition.
   ===================================================================== */
export async function updateOrderStatus(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'))
  const status = String(formData.get('status') ?? '')
  const note = String(formData.get('note') ?? '').trim() || undefined

  if (!Number.isFinite(id) || id <= 0) return
  if (!isValidStatus(status)) return

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('commission_orders')
    .select(
      'id,order_number,customer_name,customer_email,product_slug,tier_slug,quoted_price,adjustment_amount,deposit_cents,quote_total_cents,stripe_balance_session_id',
    )
    .eq('id', id)
    .maybeSingle()
  if (!order) return

  await admin
    .from('commission_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  await logStatus(id, status, note)

  /* Wire emails to specific transitions. The order's quoted_price /
   * adjustment_amount sums to the quote total; if those are null the
   * email helpers fall back gracefully. */
  const orderRef = order.order_number ?? `#${order.id}`
  const balanceCents = balanceFromOrder(order)

  switch (status) {
    case 'in_progress':
      // Studio kicked off — let them know paint started.
      Promise.allSettled([
        sendUpdateEmail({
          to: order.customer_email,
          customerName: order.customer_name,
          orderNumber: orderRef,
          stage: 'color',
          body:
            note ??
            "I've kicked off your commission and queued the sketch round. I'll share the first sketch within a few days.",
        }),
      ]).catch(() => {})
      await logMessage(id, note ?? 'Status → In progress', `In progress — ${orderRef}`)
      break

    case 'delivered':
      // Customer-facing delivery email with balance pay link (Stripe-driven
      // link is populated by the Stripe Checkout helper; if missing we send
      // the email anyway and instruct the customer to reply).
      Promise.allSettled([
        sendDeliveryEmail({
          to: order.customer_email,
          customerName: order.customer_name,
          orderNumber: orderRef,
          balanceCents: balanceCents ?? 0,
          /* Always route through the JIT bridge — Stripe Checkout
           * session URLs expire after 24 hours but the bridge creates a
           * fresh one on each visit. */
          payBalanceUrl: `${SITE}/order/${order.id}/pay-balance`,
          itemDescription: order.product_slug
            ? humaniseProductSlug(order.product_slug, order.tier_slug)
            : 'your commission',
        }),
      ]).catch(() => {})
      await logMessage(id, 'Sent delivery email with balance pay link', `Delivery — ${orderRef}`)
      break

    case 'closed':
      // Final release (after balance paid). No email by default — the
      // Stripe webhook for the balance payment fires sendReleaseEmail.
      break

    case 'cancelled':
      await logMessage(id, note ?? 'Order cancelled', `Cancelled — ${orderRef}`, 'admin_note')
      break

    default:
      break
  }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
}

/* =====================================================================
   updateOrderNotes — internal-only markdown notes.
   ===================================================================== */
export async function updateOrderNotes(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'))
  const notes = String(formData.get('internal_notes') ?? '')

  if (!Number.isFinite(id) || id <= 0) return

  const admin = createAdminClient()
  await admin
    .from('commission_orders')
    .update({ internal_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
}

/* =====================================================================
   sendQuote — the quote builder submit.

   Persists every field needed for downstream Stripe Checkout:
     - quote_base_cents:     base × 100
     - quote_addons:         [] (admin can add later via UI we'll build)
     - commercial_uplift:    boolean (the new +40% toggle)
     - adjustment_*:         already in place
     - quote_total_cents:    base + commercial + adjustment, in cents
     - deposit_cents:        30% of total, in cents
   ===================================================================== */
export async function sendQuote(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'))
  const baseDollars = Number(formData.get('quoted_price'))
  if (!Number.isFinite(id) || id <= 0) return
  if (!Number.isFinite(baseDollars) || baseDollars < 0) return

  const adjLabelRaw = String(formData.get('adjustment_label') ?? '').trim()
  const adjLabel = adjLabelRaw.length === 0 ? null : adjLabelRaw

  const adjAmountDollars = parseCurrency(String(formData.get('adjustment_amount') ?? ''))

  const adjReasonRaw = String(formData.get('adjustment_reason') ?? '').trim()
  const adjReason = adjReasonRaw.length === 0 ? null : adjReasonRaw

  const commercialUplift = String(formData.get('commercial_uplift') ?? '') === 'on'

  const baseCents = dollarsToCents(baseDollars) ?? 0
  const adjustmentCents = dollarsToCents(adjAmountDollars) ?? 0
  const commercialCents = commercialUplift ? Math.round(baseCents * 0.4) : 0
  const totalCents = baseCents + commercialCents + adjustmentCents
  const depositCents = depositFor(totalCents)

  const admin = createAdminClient()
  await admin
    .from('commission_orders')
    .update({
      quoted_price: baseDollars,
      adjustment_label: adjLabel,
      adjustment_amount: adjAmountDollars,
      adjustment_reason: adjReason,
      quote_base_cents: baseCents,
      commercial_uplift: commercialUplift,
      quote_total_cents: totalCents,
      deposit_cents: depositCents,
      status: 'quoted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  /* Fetch fresh fields needed for the email + log. */
  const { data: order } = await admin
    .from('commission_orders')
    .select('id,order_number,customer_name,customer_email,product_slug,tier_slug')
    .eq('id', id)
    .maybeSingle()

  if (order) {
    const orderRef = order.order_number ?? `#${order.id}`
    let serviceLabel = 'Your commission'
    if (order.product_slug) {
      const product = await fetchProductBySlug(order.product_slug)
      if (product) {
        serviceLabel = order.tier_slug ? `${product.name} · ${order.tier_slug}` : product.name
      }
    }

    await logStatus(id, 'quoted', `Quote sent: ${formatCents(totalCents)} (deposit ${formatCents(depositCents)})`)
    await logMessage(
      id,
      `Quote: ${formatCents(totalCents)} (base ${formatCents(baseCents)}${commercialUplift ? ` + commercial ${formatCents(commercialCents)}` : ''}${adjustmentCents !== 0 ? ` ${adjustmentCents < 0 ? '−' : '+'} ${adjLabel ?? 'adjustment'} ${formatCents(Math.abs(adjustmentCents))}` : ''}). 30% deposit ${formatCents(depositCents)}.`,
      `Quote — ${orderRef}`,
    )

    Promise.allSettled([
      sendQuoteEmail({
        to: order.customer_email,
        customerName: order.customer_name,
        orderNumber: orderRef,
        serviceLabel,
        baseCents,
        addons: [],
        commercialUplift,
        commercialCents: commercialUplift ? commercialCents : undefined,
        adjustmentLabel: adjLabel ?? undefined,
        adjustmentCents: adjustmentCents !== 0 ? adjustmentCents : undefined,
        totalCents,
        depositCents,
        approveUrl: `${SITE}/order/${order.id}/approve`,
        expiresAt: '7 days',
      }),
    ]).catch(() => {})
  }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
}

/* =====================================================================
   sendSketch — admin button "share first sketch".
   ===================================================================== */
export async function sendSketch(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'))
  const note = String(formData.get('note') ?? '').trim() || undefined
  const sketchUrl = String(formData.get('sketch_url') ?? '').trim() || undefined
  if (!Number.isFinite(id) || id <= 0) return

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('commission_orders')
    .select('id,order_number,customer_name,customer_email,status')
    .eq('id', id)
    .maybeSingle()
  if (!order) return

  /* If we haven't already moved into in_progress, do so. */
  if (order.status !== 'in_progress') {
    await admin
      .from('commission_orders')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('id', id)
    await logStatus(id, 'in_progress', 'Auto-advanced on first sketch')
  }

  const orderRef = order.order_number ?? `#${order.id}`
  Promise.allSettled([
    sendSketchEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      orderNumber: orderRef,
      note,
      sketchUrl,
    }),
  ]).catch(() => {})
  await logMessage(id, `Sent first sketch${sketchUrl ? `: ${sketchUrl}` : ''}`, `Sketch — ${orderRef}`)

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
}

/* =====================================================================
   sendUpdate — admin generic progress update.
   ===================================================================== */
export async function sendUpdate(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'))
  const stageRaw = String(formData.get('stage') ?? 'render')
  const body = String(formData.get('body') ?? '').trim()
  const imageUrl = String(formData.get('image_url') ?? '').trim() || undefined
  if (!Number.isFinite(id) || id <= 0 || body.length === 0) return

  const stage = (['sketch', 'color', 'render', 'revisions', 'final'].includes(stageRaw)
    ? stageRaw
    : 'render') as 'sketch' | 'color' | 'render' | 'revisions' | 'final'

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('commission_orders')
    .select('id,order_number,customer_name,customer_email')
    .eq('id', id)
    .maybeSingle()
  if (!order) return

  const orderRef = order.order_number ?? `#${order.id}`
  Promise.allSettled([
    sendUpdateEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      orderNumber: orderRef,
      stage,
      body,
      imageUrl,
    }),
  ]).catch(() => {})
  await logMessage(id, body, `${stage} update — ${orderRef}`)

  revalidatePath(`/admin/orders/${id}`)
}

/* =====================================================================
   sendDelivery — admin "release for delivery" — separate from
   updateOrderStatus('delivered') because we want to lock in the
   balance amount and produce a Stripe Checkout pay link.

   The Stripe Checkout session creation lives in the Phase 5 helper.
   Here we just persist + email; if the helper has populated
   stripe_balance_session_id by the time the admin clicks, the URL
   is the Stripe Checkout link; otherwise it falls back to the
   in-app /order/[id]/pay-balance bridge.
   ===================================================================== */
export async function sendDelivery(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'))
  const previewUrl = String(formData.get('preview_url') ?? '').trim() || undefined
  if (!Number.isFinite(id) || id <= 0) return

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('commission_orders')
    .select(
      'id,order_number,customer_name,customer_email,product_slug,tier_slug,quote_total_cents,deposit_cents,stripe_balance_session_id',
    )
    .eq('id', id)
    .maybeSingle()
  if (!order) return

  await admin
    .from('commission_orders')
    .update({ status: 'delivered', updated_at: new Date().toISOString() })
    .eq('id', id)

  const balanceCents = balanceFromOrder(order)
  const orderRef = order.order_number ?? `#${order.id}`

  await logStatus(id, 'delivered', `Delivered. Balance due ${formatCents(balanceCents ?? 0)}.`)

  Promise.allSettled([
    sendDeliveryEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      orderNumber: orderRef,
      balanceCents: balanceCents ?? 0,
      payBalanceUrl:
        order.stripe_balance_session_id
          ? `https://checkout.stripe.com/c/pay/${order.stripe_balance_session_id}`
          : `${SITE}/order/${order.id}/pay-balance`,
      previewUrl,
      itemDescription: order.product_slug
        ? humaniseProductSlug(order.product_slug, order.tier_slug)
        : 'your commission',
    }),
  ]).catch(() => {})
  await logMessage(id, `Delivery email sent. Balance ${formatCents(balanceCents ?? 0)}.`, `Delivery — ${orderRef}`)

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
}

/* =====================================================================
   sendRelease — fired by the Stripe webhook after balance is paid.
   Exported so the webhook can call it directly without duplicating
   email + log boilerplate.
   ===================================================================== */
export async function sendRelease(orderId: number, filesUrl: string): Promise<void> {
  const admin = createAdminClient()
  const { data: order } = await admin
    .from('commission_orders')
    .select('id,order_number,customer_name,customer_email,product_slug,tier_slug')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return

  const orderRef = order.order_number ?? `#${order.id}`
  Promise.allSettled([
    sendReleaseEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      orderNumber: orderRef,
      filesUrl,
      itemDescription: order.product_slug
        ? humaniseProductSlug(order.product_slug, order.tier_slug)
        : 'your commission',
    }),
  ]).catch(() => {})
  await logMessage(orderId, `Files released → ${filesUrl}`, `Files ready — ${orderRef}`)
}

/* ---------- internal helpers ---------- */

interface BalanceCalcOrder {
  quoted_price?: number | null
  adjustment_amount?: number | null
  deposit_cents?: number | null
  quote_total_cents?: number | null
}

function balanceFromOrder(order: BalanceCalcOrder): number | null {
  const totalCents =
    order.quote_total_cents ??
    dollarsToCents(
      (Number(order.quoted_price ?? 0) || 0) + (Number(order.adjustment_amount ?? 0) || 0),
    )
  if (totalCents == null) return null
  const dep = order.deposit_cents ?? depositFor(totalCents)
  return totalCents - dep
}

function formatCents(cents: number): string {
  if (!Number.isFinite(cents)) return '—'
  const d = cents / 100
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`
}

function humaniseProductSlug(slug: string, tierSlug?: string | null): string {
  const base = slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
  return tierSlug ? `${base} · ${tierSlug}` : base
}
