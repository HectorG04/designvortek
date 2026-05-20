'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'footer-newsletter' }),
      })
      setSubmitted(true)
    } catch {
      // silent — keep footer clean
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="mt-3 mb-3 max-w-sm inline-flex items-center gap-2 bg-forest-500/10 border border-forest-500/30 rounded-md px-3 py-2.5 text-sm text-forest-700">
        <Check size={14} strokeWidth={2.5} />
        <span>Thanks — you&rsquo;re on the list.</span>
      </div>
    )
  }

  return (
    <form className="flex gap-1.5 mt-3 mb-3 max-w-sm" onSubmit={handleSubmit}>
      <label htmlFor="footer-newsletter" className="sr-only">
        Email address
      </label>
      <input
        id="footer-newsletter"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        disabled={loading}
        className="flex-1 min-w-0 bg-parchment-50 border-[1.5px] border-border-light rounded-md px-[14px] py-[10px] font-body text-[0.8125rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 bg-burgundy-700 text-cream-50 px-5 py-[10px] rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] whitespace-nowrap hover:bg-burgundy-500 hover:-translate-y-px hover:shadow-md active:bg-burgundy-900 active:scale-[0.98] transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
      >
        {loading ? '...' : 'Subscribe'}
      </button>
    </form>
  )
}
