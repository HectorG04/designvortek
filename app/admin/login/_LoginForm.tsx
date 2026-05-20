'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="adm-email"
          className="text-ink-700 text-[0.6875rem] font-semibold tracking-[0.15em] uppercase"
        >
          Email
        </label>
        <div className="relative">
          <Mail
            size={16}
            strokeWidth={1.8}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
          />
          <input
            id="adm-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@designvortek.com"
            disabled={loading}
            className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md pl-10 pr-4 py-2.5 text-ink-900 text-sm placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:ring-[3px] focus:ring-burgundy-100 transition-all disabled:opacity-60"
          />
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="adm-pw"
          className="text-ink-700 text-[0.6875rem] font-semibold tracking-[0.15em] uppercase"
        >
          Password
        </label>
        <div className="relative">
          <Lock
            size={16}
            strokeWidth={1.8}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
          />
          <input
            id="adm-pw"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md pl-10 pr-4 py-2.5 text-ink-900 text-sm placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:ring-[3px] focus:ring-burgundy-100 transition-all disabled:opacity-60"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 bg-burgundy-100 border border-burgundy-100 rounded-md px-3 py-2 text-burgundy-700 text-xs"
        >
          <AlertCircle size={14} strokeWidth={1.8} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-burgundy-700 text-cream-50 font-semibold text-[0.75rem] tracking-[0.12em] uppercase py-3.5 rounded-full hover:bg-burgundy-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md mt-2"
      >
        {loading ? (
          <span
            aria-label="Signing in"
            className="w-4 h-4 border-2 border-cream-50/30 border-t-cream-50 rounded-full animate-spin"
          />
        ) : (
          <>
            Sign in
            <ArrowRight size={14} strokeWidth={1.8} />
          </>
        )}
      </button>
    </form>
  )
}
