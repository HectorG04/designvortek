'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, AlertCircle } from 'lucide-react'

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
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <label className="block text-ink-700 text-xs font-semibold tracking-[0.1em] uppercase mb-2">
          Email
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@designvortek.com"
            disabled={loading}
            className="w-full bg-parchment-50 border border-border-light rounded-xl pl-11 pr-4 py-3 text-ink-900 text-sm placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-all disabled:opacity-60"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-ink-700 text-xs font-semibold tracking-[0.1em] uppercase mb-2">
          Password
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
            className="w-full bg-parchment-50 border border-border-light rounded-xl pl-11 pr-4 py-3 text-ink-900 text-sm placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-all disabled:opacity-60"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-burgundy-100/40 border border-burgundy-100 rounded-lg px-3 py-2 text-burgundy-700 text-xs">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-burgundy-700 text-cream-50 font-semibold text-xs tracking-[0.12em] uppercase py-3.5 rounded-xl hover:bg-burgundy-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md mt-2"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-cream-50/30 border-t-cream-50 rounded-full animate-spin" />
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}
