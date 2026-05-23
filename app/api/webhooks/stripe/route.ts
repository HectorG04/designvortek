import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripe, STRIPE_WEBHOOK_SECRET, formatCents } from '@/lib/stripe'
import {
  sendApprovedEmail,
  sendReleaseEmail,
  sendAdminPaymentFailedEmail,
  sendCycleShipsEmail,
} from '@/lib/email'
import { SITE } from '@/lib/email/client'

/**
 * POST /api/webhooks/stripe
 *
 * Single endpoint for every Stripe webhook event we care about:
 *
 *   • checkout.session.completed
 *       - kind='deposit'      → mark order accepted, set deposit_paid_at,
 *                                 fire sendApprovedEmail
 *       - kind='balance'      → mark order closed, set balance_paid_at,
 *                                 fire sendReleaseEmail
 *       - kind='subscription' → create subscriptions row + first cycle
 *
 *   • invoice.paid (subscription renewal)
 *       - append a subscription_cycles row dated to the 15th of the
 *         upcoming month, status='upcoming'.
 *       - fire sendCycleShipsEmail when the studio marks it shipped
 *         (handled by admin action, not the webhook directly).
 *
 *   • invoice.payment_failed / charge.failed
 *       - fire sendAdminPaymentFailedEmail.
 *
 *   • customer.subscription.deleted / customer.subscription.paused
 *       - mark subscriptions row cancelled/paused.
 *
 * Signature verification uses STRIPE_WEBHOOK_SECRET (set this to the
 * `whsec_…` value from the Stripe Dashboard → Developers → Webhooks).
 */

// Webhook bodies MUST be the raw text. Disable Next's automatic
// JSON parsing.
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')
  const rawBody = await request.text()

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 })
  }
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    console.error('[stripe-webhook] signature verification failed:', msg)
    return NextResponse.json({ error: `Signature failed: ${msg}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break
      case 'checkout.session.async_payment_succeeded':
        await handleCheckoutCompleted(event.data.object)
        break
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object)
        break
      case 'invoice.payment_failed':
      case 'charge.failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice | Stripe.Charge)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionEnded(event.data.object, 'cancelled')
        break
      case 'customer.subscription.paused':
        await handleSubscriptionEnded(event.data.object, 'paused')
        break
      case 'customer.subscription.resumed':
        await handleSubscriptionResumed(event.data.object)
        break
      default:
        // Many event types are noisy — log only at debug level.
        break
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown'
    console.error(`[stripe-webhook] handler error for ${event.type}:`, msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/* ---------- handlers ---------- */

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const kind = session.metadata?.kind ?? ''
  if (kind === 'deposit') {
    await handleDepositPaid(session)
  } else if (kind === 'balance') {
    await handleBalancePaid(session)
  } else if (kind === 'subscription') {
    await handleSubscriptionStarted(session)
  } else {
    // Unknown kind — silently ignore. Could be a manually-created session.
    console.warn('[stripe-webhook] unrecognised checkout.session.completed kind:', kind)
  }
}

async function handleDepositPaid(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = Number(session.metadata?.order_id)
  if (!Number.isFinite(orderId) || orderId <= 0) return

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('commission_orders')
    .select(
      'id,order_number,customer_name,customer_email,quote_total_cents,deposit_cents,product_slug,tier_slug',
    )
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return

  const paymentIntent =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null

  await admin
    .from('commission_orders')
    .update({
      status: 'accepted',
      deposit_paid_at: new Date().toISOString(),
      stripe_payment_intent: paymentIntent,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  await admin.from('order_status_log').insert({
    order_id: orderId,
    status: 'accepted',
    by_user: 'stripe',
    note: `Deposit ${formatCents(order.deposit_cents ?? 0)} received (PI ${paymentIntent ?? '—'}).`,
  })
  await admin.from('order_messages').insert({
    order_id: orderId,
    direction: 'inbound',
    channel: 'system',
    subject: `Deposit received — ${order.order_number ?? `#${order.id}`}`,
    body: `Stripe checkout.session.completed for deposit. Total ${formatCents(order.quote_total_cents ?? 0)}, deposit ${formatCents(order.deposit_cents ?? 0)}.`,
  })

  Promise.allSettled([
    sendApprovedEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      orderNumber: order.order_number ?? `#${order.id}`,
      totalCents: order.quote_total_cents ?? 0,
      depositCents: order.deposit_cents ?? 0,
    }),
  ]).catch(() => {})
}

async function handleBalancePaid(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = Number(session.metadata?.order_id)
  if (!Number.isFinite(orderId) || orderId <= 0) return

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('commission_orders')
    .select('id,order_number,customer_name,customer_email,product_slug,tier_slug,quote_total_cents')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return

  const paymentIntent =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null

  await admin
    .from('commission_orders')
    .update({
      status: 'closed',
      balance_paid_at: new Date().toISOString(),
      stripe_balance_payment_intent: paymentIntent,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  await admin.from('order_status_log').insert({
    order_id: orderId,
    status: 'closed',
    by_user: 'stripe',
    note: `Balance paid (PI ${paymentIntent ?? '—'}). Files released.`,
  })

  /* Fire the release email. Files URL is admin-curated; for now we
   * direct the customer to a "files release" page that admin populates
   * with a Storage signed URL (Phase 7 builds the upload UI). */
  const filesUrl = `${SITE}/order/${orderId}/files`
  Promise.allSettled([
    sendReleaseEmail({
      to: order.customer_email,
      customerName: order.customer_name,
      orderNumber: order.order_number ?? `#${order.id}`,
      filesUrl,
      itemDescription: humaniseProductSlug(order.product_slug, order.tier_slug),
    }),
  ]).catch(() => {})
}

async function handleSubscriptionStarted(session: Stripe.Checkout.Session): Promise<void> {
  const tierSlug = String(session.metadata?.tier_slug ?? '')
  if (tierSlug !== 'subscription-companion' && tierSlug !== 'subscription-gm') return

  const stripeSubId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null
  if (!stripeSubId) return

  const customerEmail = session.customer_details?.email?.toLowerCase() ?? session.customer_email
  if (!customerEmail) return

  const admin = createAdminClient()

  /* Upsert customer by email. */
  const { data: customerRow } = await admin
    .from('customers')
    .upsert(
      { email: customerEmail, name: session.customer_details?.name ?? null },
      { onConflict: 'email' },
    )
    .select('id')
    .maybeSingle()
  if (!customerRow) return

  const stripeCustomerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null

  /* Compute next bill date — Stripe will trigger invoice.paid later; we
   * just stamp the row optimistically. */
  const now = new Date()
  const nextBill = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  await admin
    .from('subscriptions')
    .upsert(
      {
        customer_id: customerRow.id,
        tier_slug: tierSlug,
        stripe_subscription_id: stripeSubId,
        stripe_customer_id: stripeCustomerId,
        status: 'active',
        next_bill_date: nextBill.toISOString().slice(0, 10),
      },
      { onConflict: 'stripe_subscription_id' },
    )
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const subId =
    typeof (invoice as { subscription?: Stripe.Subscription | string | null }).subscription === 'string'
      ? ((invoice as { subscription?: string }).subscription as string)
      : ((invoice as { subscription?: Stripe.Subscription }).subscription?.id ?? null)
  if (!subId) return

  const admin = createAdminClient()
  const { data: sub } = await admin
    .from('subscriptions')
    .select('id,tier_slug,customer_id')
    .eq('stripe_subscription_id', subId)
    .maybeSingle()
  if (!sub) return

  /* Build the cycle: ships on the 15th of next month, status='upcoming'. */
  const now = new Date()
  const ships = new Date(now.getFullYear(), now.getMonth() + 1, 15)
  const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const itemsPlanned =
    sub.tier_slug === 'subscription-companion'
      ? { tokens: 10, npcs: 2 }
      : { tokens: 15, npcs: 4, battle_maps: 1 }

  await admin.from('subscription_cycles').insert({
    subscription_id: sub.id,
    cycle_start: cycleStart.toISOString().slice(0, 10),
    ships_on: ships.toISOString().slice(0, 10),
    items_planned: itemsPlanned,
    status: 'upcoming',
  })

  /* Bump next_bill_date forward one month. */
  const nextBill = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  await admin
    .from('subscriptions')
    .update({ next_bill_date: nextBill.toISOString().slice(0, 10), updated_at: new Date().toISOString() })
    .eq('id', sub.id)

  /* Customer email — let them know this month's cycle is queued. The
   * "shipped" notification fires later when the studio marks delivered. */
  const { data: customer } = await admin
    .from('customers')
    .select('email,name')
    .eq('id', sub.customer_id)
    .maybeSingle()
  if (customer?.email) {
    const tierLabel = sub.tier_slug === 'subscription-companion' ? 'Companion' : 'GM tier'
    const items =
      sub.tier_slug === 'subscription-companion'
        ? ['10 tokens', '2 NPCs']
        : ['15 tokens', '4 NPCs', '1 battle map']
    Promise.allSettled([
      sendCycleShipsEmail({
        to: customer.email,
        customerName: customer.name ?? 'there',
        tierLabel,
        cycleMonth: cycleStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        items,
        filesUrl: `${SITE}/account/subscription`,
      }),
    ]).catch(() => {})
  }
}

async function handlePaymentFailed(obj: Stripe.Invoice | Stripe.Charge): Promise<void> {
  /* Whatever the object, dig out the customer email + amount. */
  let email = ''
  let name = ''
  let amount = 0
  let reason = 'Payment failed'
  let orderNumber: string | undefined

  if ('customer_email' in obj && obj.customer_email) email = obj.customer_email
  if ('customer_name' in obj && obj.customer_name) name = obj.customer_name as string
  if ('amount_due' in obj && typeof obj.amount_due === 'number') amount = obj.amount_due
  if ('amount' in obj && typeof obj.amount === 'number' && !amount) amount = obj.amount
  if ('failure_message' in obj && obj.failure_message) reason = String(obj.failure_message)
  if ('billing_reason' in obj && obj.billing_reason) reason = String(obj.billing_reason)
  if ('metadata' in obj && obj.metadata?.order_number) orderNumber = String(obj.metadata.order_number)

  Promise.allSettled([
    sendAdminPaymentFailedEmail({
      orderNumber,
      customerName: name || 'Unknown',
      customerEmail: email || 'unknown',
      amountCents: amount,
      reason,
    }),
  ]).catch(() => {})
}

async function handleSubscriptionEnded(
  sub: Stripe.Subscription,
  status: 'cancelled' | 'paused',
): Promise<void> {
  const admin = createAdminClient()
  await admin
    .from('subscriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', sub.id)
}

async function handleSubscriptionResumed(sub: Stripe.Subscription): Promise<void> {
  const admin = createAdminClient()
  await admin
    .from('subscriptions')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', sub.id)
}

function humaniseProductSlug(slug: string | null | undefined, tier?: string | null): string {
  if (!slug) return 'your commission'
  const base = slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
  return tier ? `${base} · ${tier}` : base
}
