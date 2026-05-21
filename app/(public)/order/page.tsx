import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import Logo from '@/components/layout/Logo'
import OrderForm from './_OrderForm'

/* =====================================================================
   ORDER FORM — literal port of Order Form.html.

   Custom layout (no SiteHeader, no SiteFooter):
     - .of-header: compact brand + back-to-studio link
     - .of-hero: eyebrow / h1 / p + the 4-step progress indicator INSIDE
       the hero (not in the form card)
     - .of-main: 1fr 360px grid → form card + sidebar

   Why no SiteHeader/Footer: the order form is a focused conversion flow.
   The design intentionally strips the full nav so the brief stays the
   one thing on the page. A simple "Back to studio" link is the only
   escape route until the form is submitted.

   The 4-step progress (Step 01 What you need → Step 04 Review) is owned
   by OrderForm so the step transitions stay co-located with the state.
   page.tsx just provides the layout shell.
   ===================================================================== */

export const metadata: Metadata = {
  title: 'Start a commission · Design Vortex',
  description:
    "Tell us about your character, party, or NPC pack. We'll send a fixed quote within 48 hours — no commitment until you're ready.",
  alternates: { canonical: '/order' },
}

const ArrowLeftSm = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
)

export default function OrderPage() {
  return (
    <main className="bg-parchment-50 min-h-screen">

      {/* .of-header — compact header, brand on left, back link on right */}
      <header className="flex items-center justify-between px-6 lg:px-12 py-4 border-b border-border-light bg-parchment-50/[0.92] backdrop-blur-md sticky top-0 z-20">
        <Logo className="text-burgundy-700" textClassName="text-ink-900" />
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-body text-[0.8125rem] text-ink-500 hover:text-burgundy-700 transition-colors"
        >
          <ArrowLeftSm />
          Back to studio
        </Link>
      </header>

      {/* OrderForm owns the hero + progress + form + sidebar so the step
          state stays co-located with the rendering. */}
      <Suspense fallback={<div className="text-center text-ink-500 py-16">Loading form…</div>}>
        <OrderForm />
      </Suspense>

    </main>
  )
}
