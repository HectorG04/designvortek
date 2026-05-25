import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { fetchProductBySlug } from '@/lib/services-server'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PayBalanceForm from './_PayBalanceForm'

export const metadata: Metadata = {
  title: 'Pay balance · Design Vortex',
  description: 'Pay the remaining 70% balance to unlock your finished files.',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ cancelled?: string }>
}

export default async function PayBalancePage({ params, searchParams }: PageProps) {
  const { id: idParam } = await params
  const { cancelled } = await searchParams
  const id = Number(idParam)
  if (!Number.isFinite(id) || id <= 0) notFound()

  const admin = createAdminClient()
  const { data: order, error } = await admin
    .from('commission_orders')
    .select(
      'id,order_number,customer_name,customer_email,product_slug,tier_slug,service_type,status,quote_total_cents,deposit_cents,balance_paid_at',
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !order) notFound()

  const totalCents   = order.quote_total_cents ?? 0
  const depositCents = order.deposit_cents ?? Math.round(totalCents * 0.3)
  const balanceCents = totalCents - depositCents

  let serviceLabel = order.service_type ?? 'Your commission'
  if (order.product_slug) {
    const product = await fetchProductBySlug(order.product_slug)
    if (product) {
      serviceLabel = order.tier_slug ? `${product.name} · ${order.tier_slug}` : product.name
    }
  }

  const alreadyPaid = order.balance_paid_at != null

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50 min-h-screen">
        <section className="py-12 md:py-20">
          <div className="max-w-[640px] mx-auto px-5">
            <div className="text-[0.75rem] uppercase tracking-[0.14em] text-gold-700 font-semibold mb-2">
              Ready for delivery
            </div>
            <h1 className="font-display text-[2.5rem] md:text-[3rem] font-semibold text-ink-900 leading-[1.1] mb-3">
              Pay your <em className="font-display italic text-burgundy-700">balance</em>
            </h1>
            <p className="text-ink-700 leading-[1.65] mb-8">
              {alreadyPaid
                ? "You've already paid this balance. Files have been released — check your email."
                : "Your commission is finished. Pay the remaining 70% to unlock the full-resolution files (PNG, JPG, transparent cut where applicable)."}
            </p>

            {cancelled === '1' && (
              <div className="mb-6 rounded-xl border border-burgundy-500 bg-burgundy-100/40 px-5 py-4 text-burgundy-700 text-sm">
                Payment cancelled. No charge yet — try again whenever you&apos;re ready.
              </div>
            )}

            <div className="rounded-2xl border border-border-light bg-cream-50 px-7 py-8 shadow-sm">
              <div className="text-[0.75rem] uppercase tracking-[0.12em] text-ink-500 mb-1.5">
                Order {order.order_number ?? `#${order.id}`}
              </div>
              <div className="font-display text-[1.5rem] font-semibold text-ink-900 leading-snug mb-5">
                {serviceLabel}
              </div>

              <dl className="border-t border-border-light">
                <Row label="Total" value={fmtCents(totalCents)} />
                <Row label="Deposit paid" value={`−${fmtCents(depositCents)}`} />
                <Row
                  label={<strong className="font-semibold text-burgundy-700">Balance due</strong>}
                  value={
                    <strong className="font-display text-[1.5rem] font-semibold text-burgundy-700 tracking-[-0.015em]">
                      {fmtCents(balanceCents)}
                    </strong>
                  }
                />
              </dl>

              {!alreadyPaid && balanceCents > 0 && (
                <div className="mt-7">
                  <PayBalanceForm orderId={order.id} />
                </div>
              )}
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
