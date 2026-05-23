import { NextRequest, NextResponse } from 'next/server'
import { createSubscriptionSession } from '@/lib/stripe'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/subscriptions/checkout
 *
 * Body: { tier: 'subscription-companion' | 'subscription-gm', email: string, name?: string }
 *
 * Returns: { url: string } — Stripe Checkout URL for the subscription.
 *
 * Stripe webhook (kind='subscription' on checkout.session.completed)
 * provisions the local subscriptions row.
 */
export async function POST(request: NextRequest) {
  let body: { tier?: string; email?: string; name?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const { tier, email, name } = body
  if (tier !== 'subscription-companion' && tier !== 'subscription-gm') {
    return NextResponse.json({ error: 'Unknown tier.' }, { status: 400 })
  }
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }
  const trimmedEmail = email.trim().toLowerCase()
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return NextResponse.json({ error: 'Invalid email.' }, { status: 400 })
  }

  try {
    const session = await createSubscriptionSession({
      tierSlug: tier,
      customerEmail: trimmedEmail,
      customerName: typeof name === 'string' && name.trim() ? name.trim() : 'Subscriber',
    })
    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a session URL.' }, { status: 502 })
    }
    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe error'
    console.error('[subscriptions/checkout] error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
