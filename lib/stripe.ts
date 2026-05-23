import 'server-only'
/* =====================================================================
   Stripe client + helpers.

   Behavior when STRIPE_SECRET_KEY is missing: every helper that would
   make a network call throws a descriptive error. That's intentional —
   we never want to silently skip a payment. Callers wrap in try/catch
   and surface the failure to the user.

   Env vars expected:
     STRIPE_SECRET_KEY         sk_live_… or sk_test_…
     STRIPE_WEBHOOK_SECRET     whsec_… (for /api/webhooks/stripe)
     STRIPE_PRICE_COMPANION    price_… (Companion subscription price)
     STRIPE_PRICE_GM_TIER      price_… (GM-tier subscription price)
   ===================================================================== */

import Stripe from 'stripe'

const STRIPE_SECRET_KEY     = process.env.STRIPE_SECRET_KEY
export const STRIPE_WEBHOOK_SECRET    = process.env.STRIPE_WEBHOOK_SECRET ?? ''
export const STRIPE_PRICE_COMPANION   = process.env.STRIPE_PRICE_COMPANION ?? ''
export const STRIPE_PRICE_GM_TIER     = process.env.STRIPE_PRICE_GM_TIER ?? ''
const SITE_URL                        = process.env.NEXT_PUBLIC_SITE_URL || 'https://designvortex.co'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (_stripe) return _stripe
  if (!STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set — cannot create Stripe client')
  }
  _stripe = new Stripe(STRIPE_SECRET_KEY, {
    // Pin to the API version baked into the installed @types/stripe.
    // Bumping is a deliberate decision (Stripe sometimes changes shape).
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
  })
  return _stripe
}

export interface CreateDepositSessionArgs {
  orderId: number
  orderNumber: string
  customerEmail: string
  customerName: string
  serviceLabel: string
  depositCents: number
  totalCents: number
}

/** Create a Stripe Checkout session for the 30% deposit. */
export async function createDepositSession(args: CreateDepositSessionArgs): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()
  return stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: args.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: args.depositCents,
          product_data: {
            name: `${args.serviceLabel} — 30% deposit`,
            description: `Design Vortex commission ${args.orderNumber}. Balance of ${formatCents(args.totalCents - args.depositCents)} due on delivery.`,
            metadata: {
              order_id: String(args.orderId),
              order_number: args.orderNumber,
              kind: 'deposit',
            },
          },
        },
      },
    ],
    payment_intent_data: {
      description: `${args.orderNumber} deposit (${args.customerName})`,
      metadata: {
        order_id: String(args.orderId),
        order_number: args.orderNumber,
        kind: 'deposit',
      },
    },
    metadata: {
      order_id: String(args.orderId),
      order_number: args.orderNumber,
      kind: 'deposit',
    },
    success_url: `${SITE_URL}/order/success?order=${encodeURIComponent(args.orderNumber)}&deposit=paid`,
    cancel_url: `${SITE_URL}/order/${args.orderId}/approve?cancelled=1`,
    automatic_tax: { enabled: false },
  })
}

export interface CreateBalanceSessionArgs {
  orderId: number
  orderNumber: string
  customerEmail: string
  customerName: string
  serviceLabel: string
  balanceCents: number
}

/** Create a Stripe Checkout session for the 70% balance on delivery. */
export async function createBalanceSession(args: CreateBalanceSessionArgs): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()
  return stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: args.customerEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: args.balanceCents,
          product_data: {
            name: `${args.serviceLabel} — balance (70%)`,
            description: `Design Vortex commission ${args.orderNumber}. Files release on payment.`,
            metadata: {
              order_id: String(args.orderId),
              order_number: args.orderNumber,
              kind: 'balance',
            },
          },
        },
      },
    ],
    payment_intent_data: {
      description: `${args.orderNumber} balance (${args.customerName})`,
      metadata: {
        order_id: String(args.orderId),
        order_number: args.orderNumber,
        kind: 'balance',
      },
    },
    metadata: {
      order_id: String(args.orderId),
      order_number: args.orderNumber,
      kind: 'balance',
    },
    success_url: `${SITE_URL}/order/success?order=${encodeURIComponent(args.orderNumber)}&balance=paid`,
    cancel_url: `${SITE_URL}/order/${args.orderId}/pay-balance?cancelled=1`,
    automatic_tax: { enabled: false },
  })
}

export interface CreateSubscriptionSessionArgs {
  tierSlug: 'subscription-companion' | 'subscription-gm'
  customerEmail: string
  customerName: string
}

/** Create a Stripe Checkout session for a monthly subscription. */
export async function createSubscriptionSession(
  args: CreateSubscriptionSessionArgs,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()
  const priceId =
    args.tierSlug === 'subscription-companion'
      ? STRIPE_PRICE_COMPANION
      : STRIPE_PRICE_GM_TIER
  if (!priceId) {
    throw new Error(
      `Missing Stripe price ID env var for ${args.tierSlug} — set STRIPE_PRICE_COMPANION or STRIPE_PRICE_GM_TIER`,
    )
  }
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: args.customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      description: `${args.tierSlug} (${args.customerName})`,
      metadata: { tier_slug: args.tierSlug },
    },
    metadata: { tier_slug: args.tierSlug, kind: 'subscription' },
    success_url: `${SITE_URL}/subscription/success?tier=${args.tierSlug}`,
    cancel_url: `${SITE_URL}/subscription?cancelled=1`,
    automatic_tax: { enabled: false },
  })
}

export function formatCents(cents: number | null | undefined): string {
  if (cents == null || !Number.isFinite(cents)) return '—'
  const d = cents / 100
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`
}
