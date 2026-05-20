import type { Metadata } from 'next'
import { Suspense } from 'react'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import OrderForm from './_OrderForm'

export const metadata: Metadata = {
  title: 'Start a commission',
  description:
    'Tell us about your character, party, or NPC pack. Three short steps. We respond within 48 hours with a fixed quote — no commitment until you are ready.',
  alternates: { canonical: '/order' },
}

export default function OrderPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Commission brief"
          title={
            <>
              Tell us about your <em className="italic font-medium text-burgundy-700">commission</em>
            </>
          }
          description="Three short steps. Takes about three minutes. We respond within 48 hours with a fixed quote — no commitment until you are ready."
        />

        <section className="pb-24">
          <Suspense fallback={<div className="text-center text-ink-500 py-12">Loading form…</div>}>
            <OrderForm />
          </Suspense>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
