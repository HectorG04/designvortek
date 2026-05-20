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
      <div className="mb-6 max-w-sm inline-flex items-center gap-2 bg-forest-500/10 border border-forest-500/30 rounded-md px-3 py-2.5 text-sm text-forest-700">
        <Check size={14} strokeWidth={2.5} />
        <span>Thanks — you&rsquo;re on the list.</span>
      </div>
    )
  }

  return (
    <form className="mb-6" onSubmit={handleSubmit}>
      <label htmlFor="footer-newsletter" className="block text-[0.7rem] tracking-[0.15em] uppercase font-semibold text-ink-700 mb-2">
        Studio Notes
      </label>
      <div className="flex gap-2 max-w-sm">
        <input
          id="footer-newsletter"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={loading}
          className="flex-1 bg-parchment-50 border border-border-light rounded-md px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-burgundy-700 text-cream-50 px-4 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-burgundy-500 transition-colors disabled:opacity-60"
        >
          {loading ? '...' : 'Join'}
        </button>
      </div>
    </form>
  )
}
