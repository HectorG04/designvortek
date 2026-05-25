import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createBalanceSession } from '@/lib/stripe'
import { fetchProductBySlug } from '@/lib/services-server'

/**
 * POST /api/orders/[id]/pay-balance
 *
 * Customer clicks the balance pay link on the delivery email or on
 * /order/[id]/pay-balance. Creates a Stripe Checkout session for the
 * remaining 70% balance and returns the URL.
 *
 * Webhook handler (checkout.session.completed with kind='balance')
 * sets balance_paid_at and status='closed', and fires sendReleaseEmail.
 */
export async function POST(_request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await ctx.params
  const id = Number(idParam)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid order id.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: order, error } = await admin
    .from('commission_orders')
    .select(
      'id,order_number,customer_name,customer_email,product_slug,tier_slug,service_type,status,quote_total_cents,deposit_cents,balance_paid_at',
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }
  if (order.balance_paid_at) {
    return NextResponse.json({ error: 'Balance already paid.' }, { status: 409 })
  }
  if (order.status !== 'delivered' && order.status !== 'in_progress') {
    return NextResponse.json(
      { error: `Order is in '${order.status}' — balance payable only after delivery.` },
      { status: 409 },
    )
  }

  const total = order.quote_total_cents ?? 0
  const deposit = order.deposit_cents ?? Math.round(total * 0.3)
  const balance = total - deposit
  if (balance <= 0) {
    return NextResponse.json({ error: 'Balance is zero or undefined.' }, { status: 422 })
  }

  let serviceLabel = order.service_type ?? 'Design Vortex commission'
  if (order.product_slug) {
    const product = await fetchProductBySlug(order.product_slug)
    if (product) {
      serviceLabel = order.tier_slug ? `${product.name} · ${order.tier_slug}` : product.name
    }
  }

  try {
    const session = await createBalanceSession({
      orderId: order.id,
      orderNumber: order.order_number ?? `#${order.id}`,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      serviceLabel,
      balanceCents: balance,
    })
    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a session URL.' }, { status: 502 })
    }

    await admin
      .from('commission_orders')
      .update({
        stripe_balance_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe error'
    console.error('[pay-balance] Stripe session error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
