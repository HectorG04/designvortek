'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'

/**
 * Footer newsletter form — literal port of `.hp-footer-newsletter` block.
 *
 *   .hp-footer-newsletter { display: flex; gap: 6px; margin-top: 12px; }
 *   input  { bg parchment-50, 1.5px border-light, radius-md, 10/14 padding, 0.8125rem }
 *   button { dv-btn dv-btn-primary sm — burgundy-700 bg, cream-50 text, full rounded }
 *
 * Posts to /api/waitlist with source `footer-newsletter`. Functionality preserved.
 */
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
      <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-forest-500/30 bg-forest-500/10 px-3 py-2.5 text-sm text-forest-700">
        <Check size={14} strokeWidth={2.5} />
        <span>Thanks &mdash; you&rsquo;re on the list.</span>
      </div>
    )
  }

  return (
    <form className="mt-3 flex gap-1.5" onSubmit={handleSubmit}>
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
        className="min-w-0 flex-1 rounded-md border-[1.5px] border-border-light bg-parchment-50 px-[14px] py-[10px] font-body text-[0.8125rem] text-ink-900 placeholder:text-ink-400 transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-burgundy-500 focus:outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-burgundy-700 px-5 py-[10px] font-body text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-cream-50 transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-px hover:bg-burgundy-500 hover:shadow-md active:scale-[0.98] active:bg-burgundy-900 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
      >
        {loading ? '...' : 'Subscribe'}
      </button>
    </form>
  )
}
