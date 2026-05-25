import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createDepositSession } from '@/lib/stripe'
import { fetchProductBySlug } from '@/lib/services-server'

/**
 * POST /api/orders/[id]/approve
 *
 * Customer clicks "Approve & pay deposit" on the quote email or on
 * /order/[id]/approve. We:
 *   1. Verify the order is in 'quoted' state with a positive total.
 *   2. Mark status='reviewing' (= "customer initiated approve") so the
 *      admin sees the click happen even if the customer abandons Stripe.
 *   3. Create a Stripe Checkout session for the 30% deposit.
 *   4. Persist the stripe_session_id and respond with the URL.
 *
 * On Stripe checkout.session.completed (webhook) we flip status to
 * 'accepted' and set deposit_paid_at.
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
      'id,order_number,customer_name,customer_email,product_slug,tier_slug,service_type,status,quote_total_cents,deposit_cents,stripe_session_id',
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
  }
  if (order.status !== 'quoted' && order.status !== 'reviewing') {
    return NextResponse.json(
      { error: `Order is in '${order.status}' — only quoted orders can be approved.` },
      { status: 409 },
    )
  }
  const total = order.quote_total_cents ?? 0
  const deposit = order.deposit_cents ?? Math.round(total * 0.3)
  if (deposit <= 0) {
    return NextResponse.json({ error: 'Quote total is missing or zero.' }, { status: 422 })
  }

  let serviceLabel = order.service_type ?? 'Design Vortex commission'
  if (order.product_slug) {
    const product = await fetchProductBySlug(order.product_slug)
    if (product) {
      serviceLabel = order.tier_slug ? `${product.name} · ${order.tier_slug}` : product.name
    }
  }

  try {
    const session = await createDepositSession({
      orderId: order.id,
      orderNumber: order.order_number ?? `#${order.id}`,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      serviceLabel,
      depositCents: deposit,
      totalCents: total,
    })
    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a session URL.' }, { status: 502 })
    }

    await admin
      .from('commission_orders')
      .update({
        stripe_session_id: session.id,
        status: 'reviewing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    await admin.from('order_status_log').insert({
      order_id: id,
      status: 'reviewing',
      by_user: 'customer',
      note: `Stripe Checkout session ${session.id} created for $${(deposit / 100).toFixed(0)} deposit.`,
    })

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe error'
    console.error('[approve] Stripe session error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
