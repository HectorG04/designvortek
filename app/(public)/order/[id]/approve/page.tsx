import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { fetchProductBySlug } from '@/lib/services-server'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import ApproveQuoteForm from './_ApproveQuoteForm'

export const metadata: Metadata = {
  title: 'Approve quote | Design Vortex',
  description: 'Review your quote and pay the 30% deposit to start your commission.',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cancelled?: string }>
}

export default async function ApproveQuotePage({ params, searchParams }: PageProps) {
  const { id: idParam } = await params
  const { cancelled } = await searchParams
  const id = Number(idParam)
  if (!Number.isFinite(id) || id <= 0) notFound()

  const admin = createAdminClient()
  const { data: order, error } = await admin
    .from('commission_orders')
    .select(
      'id,order_number,customer_name,customer_email,product_slug,tier_slug,service_type,status,quoted_price,adjustment_label,adjustment_amount,commercial_uplift,quote_base_cents,quote_total_cents,deposit_cents,deposit_paid_at',
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !order) notFound()

  const baseCents     = order.quote_base_cents ?? Math.round(Number(order.quoted_price ?? 0) * 100)
  const adjCents      = Math.round(Number(order.adjustment_amount ?? 0) * 100)
  const isCommercial  = Boolean(order.commercial_uplift)
  const commercialCents = isCommercial ? Math.round(baseCents * 0.4) : 0
  const totalCents    = order.quote_total_cents ?? baseCents + commercialCents + adjCents
  const depositCents  = order.deposit_cents ?? Math.round(totalCents * 0.3)

  let serviceLabel = order.service_type ?? 'Your commission'
  if (order.product_slug) {
    const product = await fetchProductBySlug(order.product_slug)
    if (product) {
      serviceLabel = order.tier_slug ? `${product.name} · ${order.tier_slug}` : product.name
    }
  }

  const alreadyApproved = order.deposit_paid_at != null

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50 min-h-screen">
        <section className="py-12 md:py-20">
          <div className="max-w-[640px] mx-auto px-5">
            <div className="text-[0.75rem] uppercase tracking-[0.14em] text-gold-700 font-semibold mb-2">
              Quote ready
            </div>
            <h1 className="font-display text-[2.5rem] md:text-[3rem] font-semibold text-ink-900 leading-[1.1] mb-3">
              Approve & pay your <em className="font-display italic text-burgundy-700">deposit</em>
            </h1>
            <p className="text-ink-700 leading-[1.65] mb-8">
              {alreadyApproved
                ? "You already approved this quote and paid the deposit. We're on it — check your email for updates."
                : "Take a look at the line items below. Approving locks your slot and sends you to Stripe to pay the 30% deposit. The deposit is fully refundable until we share the first sketch."}
            </p>

            {cancelled === '1' && (
              <div className="mb-6 rounded-xl border border-burgundy-500 bg-burgundy-100/40 px-5 py-4 text-burgundy-700 text-sm">
                Payment cancelled. No charge yet — try again whenever you&apos;re ready.
              </div>
            )}

            {/* Quote summary card */}
            <div className="rounded-2xl border border-border-light bg-cream-50 px-7 py-8 shadow-sm">
              <div className="text-[0.75rem] uppercase tracking-[0.12em] text-ink-500 mb-1.5">
                Order {order.order_number ?? `#${order.id}`}
              </div>
              <div className="font-display text-[1.5rem] font-semibold text-ink-900 leading-snug mb-5">
                {serviceLabel}
              </div>

              <dl className="border-t border-border-light">
                <Row label="Base" value={fmtCents(baseCents)} />
                {isCommercial && (
                  <Row label="Commercial license (+40%)" value={`+${fmtCents(commercialCents)}`} />
                )}
                {adjCents !== 0 && order.adjustment_label && (
                  <Row
                    label={order.adjustment_label}
                    value={`${adjCents < 0 ? '−' : '+'}${fmtCents(Math.abs(adjCents))}`}
                  />
                )}
                <Row
                  label={<strong className="font-semibold text-ink-900">Total</strong>}
                  value={<strong className="font-semibold text-ink-900">{fmtCents(totalCents)}</strong>}
                />
                <Row
                  label={<strong className="font-semibold text-burgundy-700">30% deposit now</strong>}
                  value={
                    <strong className="font-display text-[1.5rem] font-semibold text-burgundy-700 tracking-[-0.015em]">
                      {fmtCents(depositCents)}
                    </strong>
                  }
                />
              </dl>

              {!alreadyApproved && depositCents > 0 && (
                <div className="mt-7">
                  <ApproveQuoteForm orderId={order.id} />
                </div>
              )}

              <p className="mt-5 text-[0.8125rem] text-ink-500 leading-[1.55]">
                Balance ({fmtCents(totalCents - depositCents)}) is due on delivery — we&apos;ll send a separate pay link with the finished files.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between py-3 border-b border-border-light text-[0.9375rem] text-ink-700 last:border-b-0">
      <dt>{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  )
}

function fmtCents(c: number): string {
  const d = c / 100
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`
}
