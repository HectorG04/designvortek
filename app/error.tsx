'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'

/* =====================================================================
   ERROR — branded runtime error boundary.
   Catches uncaught errors in any route segment. Mirrors not-found.tsx
   structure so the brand stays consistent in failure states.
   ===================================================================== */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console for client-side visibility. Production deploys should
    // pipe this to whatever observability is wired up (Sentry, LogRocket, etc).
    if (process.env.NODE_ENV !== 'production') {
      console.error('Caught by app/error.tsx:', error)
    }
  }, [error])

  return (
    <>
      <SiteHeader />
      <main className="relative min-h-screen flex items-center justify-center bg-parchment-50 px-6 py-24 overflow-hidden">
        {/* Soft blurred orbs (same family as not-found.tsx) */}
        <div
          aria-hidden="true"
          className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(201,160,74,0.12), transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(107,31,42,0.12), transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        <div className="relative z-10 max-w-[640px] text-center">
          <div
            className="font-display font-bold text-burgundy-700 leading-none mb-4 [&_em]:not-italic [&_em]:text-gold-500"
            style={{ fontSize: 'clamp(5rem, 14vw, 9rem)' }}
          >
            5<em>0</em>0
          </div>

          <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold-700 mb-3">
            Something cracked in the canvas frame
          </div>

          <h1
            className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mb-4 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
            style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
          >
            The studio hit an <em>unexpected snag</em>
          </h1>

          <p className="text-ink-700 text-base md:text-lg leading-[1.6] mb-8 max-w-[52ch] mx-auto">
            An error broke this page. You can try reloading, or pick one of the routes below.
            If this keeps happening, send us a note and we'll look into it.
          </p>

          {error?.digest && (
            <div className="text-[0.75rem] text-ink-400 mb-6 font-mono">
              ref: {error.digest}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="px-5 py-3 rounded-full bg-burgundy-700 text-cream-50 text-[0.875rem] font-semibold uppercase tracking-[0.1em] hover:bg-burgundy-500 transition-colors"
            >
              Try again
            </button>
            <Link
              href="/"
              className="px-5 py-3 rounded-full border-[1.5px] border-border-medium bg-parchment-100 text-ink-900 text-[0.875rem] font-semibold uppercase tracking-[0.1em] hover:bg-parchment-200 hover:border-border-dark transition-colors"
            >
              Home
            </Link>
            <Link
              href="/contact"
              className="px-5 py-3 rounded-full border-[1.5px] border-border-medium bg-parchment-100 text-ink-900 text-[0.875rem] font-semibold uppercase tracking-[0.1em] hover:bg-parchment-200 hover:border-border-dark transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
