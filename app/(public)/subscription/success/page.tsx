import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'

export const metadata: Metadata = {
  title: 'Subscription started Â· Design Vortex',
  description: 'Your subscription is active. Welcome to the campaign companion.',
  robots: { index: false, follow: false },
}

interface PageProps {
  searchParams: Promise<{ tier?: string }>
}

export default async function SubscriptionSuccessPage({ searchParams }: PageProps) {
  const { tier } = await searchParams
  const tierLabel = tier === 'subscription-gm' ? 'GM tier' : 'Companion'

  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-parchment-50 min-h-screen">
        <section className="py-16 md:py-28">
          <div className="max-w-[640px] mx-auto px-5 text-center">
            <div className="text-[0.75rem] uppercase tracking-[0.14em] text-gold-700 font-semibold mb-3">
              Welcome aboard
            </div>
            <h1 className="font-display text-[3rem] md:text-[3.5rem] font-semibold text-ink-900 leading-[1.05] mb-5">
              Your <em className="font-display italic text-burgundy-700">{tierLabel}</em> subscription is live
            </h1>
            <p className="text-ink-700 text-[1.0625rem] leading-[1.65] mb-8 max-w-[520px] mx-auto">
              Stripe will confirm your first month by email in a few minutes. We&apos;ll be in touch to lock in your campaign style guide before the first cycle ships on the 15th.
            </p>

            <div className="rounded-2xl border border-border-light bg-cream-50 px-7 py-7 text-left mb-8">
              <div className="text-[0.75rem] uppercase tracking-[0.12em] text-ink-500 mb-2">
                What happens next
              </div>
              <ol className="list-decimal pl-5 space-y-2.5 text-ink-700 text-[0.9375rem] leading-[1.55]">
                <li>You&apos;ll get a Stripe receipt within minutes.</li>
                <li>
                  Within 1 business day, we&apos;ll email a short style-guide kickoff: palette,
                  era, lighting language.
                </li>
                <li>
                  Your first cycle ships on the <strong>15th</strong> â€” tokens, NPCs, and (GM
                  tier) a battle map.
                </li>
              </ol>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/portfolio"
                className="inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 transition-colors px-6 py-3 rounded-full text-[0.75rem] font-semibold uppercase tracking-[0.12em]"
              >
                Browse portfolio
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 border border-border-medium text-ink-700 hover:bg-parchment-100 transition-colors px-6 py-3 rounded-full text-[0.75rem] font-semibold uppercase tracking-[0.12em]"
              >
                Send a kickoff note
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
