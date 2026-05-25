'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
    }
  }
}

/* ---------- Form card — literal port of .ct-form-card from Contact.html ----------
   - parchment-100 bg, border-light, rounded-2xl, padding 40px
   - h3 1.75rem display 600, p body-md ink-500
   - 4 fields: name, email, topic <select>, message <textarea>
   - Send button primary burgundy with arrow
   - .ct-redirect box at bottom (gold-100 bg + gold-500 left border)
*/

const TOPIC_OPTIONS = [
  'Just a question',
  'Pricing inquiry',
  'Custom project / quote',
  'Press & collaboration',
  'Something else',
]

const ArrowRightSm = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M6 9l6 6 6-6" />
  </svg>
)

export default function ContactFormCard() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: TOPIC_OPTIONS[0],
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load reCAPTCHA v3 script once
  useEffect(() => {
    if (!SITE_KEY || document.querySelector('#recaptcha-script')) return
    const script = document.createElement('script')
    script.id = 'recaptcha-script'
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.async = true
    document.head.appendChild(script)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setError(null)
    try {
      // Get reCAPTCHA token (silent, invisible to user)
      let recaptcha_token = ''
      if (SITE_KEY && window.grecaptcha) {
        try {
          await new Promise<void>((resolve) => window.grecaptcha.ready(resolve))
          recaptcha_token = await window.grecaptcha.execute(SITE_KEY, { action: 'contact' })
        } catch {
          // Fail open — submit without token, server will bypass check
        }
      }

      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: `[${form.topic}]\n\n${form.message}`,
          recaptcha_token,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-parchment-100 border border-border-light rounded-2xl p-7 md:p-10">
      <h3 className="font-display text-[1.75rem] font-semibold text-ink-900 tracking-tight mb-2 leading-tight">
        Send a message
      </h3>
      <p className="text-[1.0625rem] text-ink-500 leading-[1.6] mb-6">
        For quick questions. For commission briefs, use the{' '}
        <Link href="/order" className="text-burgundy-700 border-b border-gold-500 hover:text-burgundy-500 transition-colors">
          commission form
        </Link>{' '}
        instead — it captures more detail and gets faster turnaround.
      </p>

      {submitted ? (
        <div className="px-5 py-6 rounded-md bg-forest-700/[0.08] border border-forest-700/30 text-forest-700">
          <div className="font-display text-lg font-semibold text-ink-900 mb-1">Message sent.</div>
          <div className="text-sm text-ink-500">
            We&apos;ll reply within 48 hours, Mon–Fri.
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label htmlFor="ct-name" className="block font-body text-[0.75rem] uppercase tracking-[0.12em] font-semibold text-ink-500 mb-2">
              Your name
            </label>
            <input
              id="ct-name"
              type="text"
              required
              placeholder="Aria Mendel"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-3 font-body text-[1.0625rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="ct-email" className="block font-body text-[0.75rem] uppercase tracking-[0.12em] font-semibold text-ink-500 mb-2">
              Email
            </label>
            <input
              id="ct-email"
              type="email"
              required
              placeholder="aria@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-3 font-body text-[1.0625rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
            />
          </div>

          {/* Topic select */}
          <div>
            <label htmlFor="ct-topic" className="block font-body text-[0.75rem] uppercase tracking-[0.12em] font-semibold text-ink-500 mb-2">
              What&apos;s this about?
            </label>
            <div className="relative">
              <select
                id="ct-topic"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="w-full appearance-none bg-parchment-50 border-[1.5px] border-border-light rounded-md pl-4 pr-10 py-3 font-body text-[1.0625rem] text-ink-900 focus:outline-none focus:border-burgundy-500 transition-colors cursor-pointer"
              >
                {TOPIC_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronDown />
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="ct-msg" className="block font-body text-[0.75rem] uppercase tracking-[0.12em] font-semibold text-ink-500 mb-2">
              Your message
            </label>
            <textarea
              id="ct-msg"
              required
              rows={5}
              placeholder="Tell us what's on your mind…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-3 font-body text-[1.0625rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors resize-y min-h-[140px]"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-md bg-burgundy-100 border border-burgundy-500/30 text-burgundy-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'self-start mt-2 inline-flex items-center gap-2 px-7 py-[14px] rounded-full font-body text-xs font-semibold uppercase tracking-[0.12em]',
              'bg-burgundy-700 text-cream-50 transition-all',
              'hover:bg-burgundy-500 hover:-translate-y-px hover:shadow-md',
              'active:bg-burgundy-900 active:scale-[0.98]',
              'disabled:bg-ink-300 disabled:text-ink-400 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none'
            )}
          >
            {loading ? 'Sending…' : 'Send message'}
            {!loading && <ArrowRightSm />}
          </button>
        </form>
      )}

      {/* .ct-redirect block — gold-100 bg, gold-500 3px left border */}
      <div className="mt-8 px-6 py-5 bg-gold-100 border-l-[3px] border-gold-500 rounded-md text-[1.0625rem] text-ink-700 leading-[1.55]">
        <strong className="font-display text-ink-900">Looking to commission?</strong>{' '}
        The{' '}
        <Link href="/order" className="text-burgundy-700 border-b border-gold-500 hover:text-burgundy-500 transition-colors">
          commission brief form
        </Link>{' '}
        captures more detail and gets quicker quotes.
      </div>
    </div>
  )
}
