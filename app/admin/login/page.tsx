import type { Metadata } from 'next'
import { Suspense } from 'react'
import LoginForm from './_LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-parchment-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-12 h-12 mb-3">
            <div className="absolute inset-0 rounded-full border border-gold-500/40" />
            <div className="absolute inset-[4px] rounded-full bg-gradient-to-br from-gold-300/40 to-burgundy-100/0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-burgundy-700 text-sm font-bold">DV</span>
            </div>
          </div>
          <span className="font-display text-ink-900 text-xs font-semibold tracking-[0.25em] uppercase">
            Design Vortex
          </span>
        </div>

        {/* Card */}
        <div className="bg-parchment-100 border border-border-light rounded-2xl p-8 shadow-sm">
          <h1 className="font-display text-2xl text-ink-900 mb-1 text-center">Welcome back.</h1>
          <p className="text-ink-500 text-sm text-center mb-6">
            <em className="font-display italic">Sign in to manage your studio.</em>
          </p>

          <Suspense fallback={<div className="h-48" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-ink-400 text-xs text-center mt-6">
          Trouble signing in? Email{' '}
          <a href="mailto:hello@designvortek.com" className="text-burgundy-700 hover:text-burgundy-500 underline underline-offset-4">
            hello@designvortek.com
          </a>
        </p>
      </div>
    </div>
  )
}
