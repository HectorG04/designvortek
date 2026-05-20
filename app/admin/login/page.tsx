import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from './_LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-parchment-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Soft brand glow accents (background only) */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gold-500/[0.12] blur-[80px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-burgundy-700/[0.12] blur-[80px] pointer-events-none"
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-parchment-100 border border-border-light rounded-2xl px-8 py-10 md:px-10 md:py-12 shadow-[0_12px_32px_rgba(30,20,8,0.10)]">
          {/* Brand mark */}
          <div className="flex justify-center mb-6 text-gold-500">
            <svg
              viewBox="0 0 56 56"
              aria-hidden="true"
              className="w-14 h-14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <circle cx="28" cy="28" r="20" />
              <path
                d="M28 6 L31 28 L28 50 L25 28 Z M6 28 L28 25 L50 28 L28 31 Z"
                fill="currentColor"
              />
              <circle cx="28" cy="28" r="2.5" fill="var(--color-parchment-100)" />
            </svg>
          </div>

          <h1 className="font-display text-[1.5rem] md:text-[2rem] font-semibold text-ink-900 tracking-tight text-center mb-1.5">
            Welcome back.
          </h1>
          <p className="font-display italic text-ink-500 text-center mb-8">
            Sign in to manage your studio.
          </p>

          <Suspense fallback={<div className="h-48" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-ink-500 text-[0.8125rem] text-center mt-6">
          Trouble signing in? Email{' '}
          <a
            href="mailto:hello@designvortek.com"
            className="text-burgundy-700 hover:text-burgundy-500 underline underline-offset-4 decoration-gold-500/60"
          >
            hello@designvortek.com
          </a>
        </p>
      </div>
    </div>
  )
}
