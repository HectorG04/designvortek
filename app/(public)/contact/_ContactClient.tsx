'use client'

import { useState } from 'react'
import { Mail, Camera, AtSign, Send, Clock, MapPin, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import { cn } from '@/lib/utils'

const FAQS = [
  { q: 'How much does a commission cost?',      a: 'From $80 for a single VTT token to $600+ for a party portrait.' },
  { q: 'How long does a commission take?',      a: 'Most character portraits ship within 7–14 days of brief approval.' },
  { q: 'Can I use the art commercially?',       a: 'Personal use is included. Commercial licensing is a $150 add-on.' },
]

export default function ContactClient() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
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
    <main>
      {/* Hero */}
      <section className="pt-[160px] pb-12 text-center">
        <Container>
          <div className="mb-4 flex justify-center">
            <SectionLabel>Contact</SectionLabel>
          </div>
          <h1
            className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight"
            style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
          >
            Get in <em className="italic font-medium text-burgundy-700">touch</em>
          </h1>
          <p className="text-lg text-ink-500 leading-[1.65] mt-4 mx-auto max-w-[60ch]">
            Got a question, an idea, or just want to talk shop? Drop us a line. We reply within 48 hours, every weekday.
          </p>
        </Container>
      </section>

      {/* Form + info */}
      <section className="pb-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14">

            {/* LEFT: form */}
            <div className="bg-parchment-50 border border-border-light rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="font-display text-2xl font-semibold text-ink-900 mb-1">Send a message</h2>
              <p className="text-sm text-ink-500 mb-6">
                For quick questions. For commission briefs,{' '}
                <Link href="/order" className="text-burgundy-700 hover:text-burgundy-500 underline underline-offset-2 decoration-gold-500">
                  use the commission form
                </Link>{' '}— it captures more detail and gets a faster turnaround.
              </p>

              {submitted ? (
                <div className="bg-success/10 border border-success/30 rounded-lg px-5 py-6 text-success flex items-start gap-3">
                  <Check size={20} strokeWidth={2} className="shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-ink-900">Message sent.</div>
                    <div className="text-ink-500 text-sm mt-1">We&rsquo;ll reply within 48 hours, Mon–Fri.</div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="ct-name" className="block text-sm font-semibold text-ink-900 mb-2">
                      Your name <span className="text-error">*</span>
                    </label>
                    <input
                      id="ct-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Aria Mendel"
                      required
                      className="w-full bg-parchment-50 border border-border-light rounded-md px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="ct-email" className="block text-sm font-semibold text-ink-900 mb-2">
                      Email <span className="text-error">*</span>
                    </label>
                    <input
                      id="ct-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="aria@example.com"
                      required
                      className="w-full bg-parchment-50 border border-border-light rounded-md px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="ct-msg" className="block text-sm font-semibold text-ink-900 mb-2">
                      Your message <span className="text-error">*</span>
                    </label>
                    <textarea
                      id="ct-msg"
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us what's on your mind…"
                      required
                      className="w-full bg-parchment-50 border border-border-light rounded-md px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors resize-y min-h-[140px]"
                    />
                  </div>

                  {error && (
                    <div className="px-4 py-3 rounded-md bg-error/10 border border-error/30 text-error text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      'inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.12em]',
                      'bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 transition-colors',
                      'disabled:opacity-60 disabled:cursor-not-allowed'
                    )}
                  >
                    {loading ? 'Sending…' : 'Send message'} {!loading && <ArrowRight size={14} strokeWidth={1.8} />}
                  </button>
                </form>
              )}
            </div>

            {/* RIGHT: info */}
            <aside className="space-y-6">

              <div>
                <SectionLabel>Studio info</SectionLabel>
                <h3 className="font-display text-2xl font-semibold text-ink-900 mt-3 mb-5 leading-tight">
                  Other ways to reach us
                </h3>

                <div className="space-y-3">
                  <a
                    href="mailto:hello@designvortek.com"
                    className="flex items-start gap-4 p-4 bg-parchment-50 border border-border-light rounded-xl hover:border-burgundy-700 transition-colors group"
                  >
                    <span className="inline-flex w-10 h-10 rounded-md bg-parchment-200 text-ink-700 items-center justify-center group-hover:bg-burgundy-700 group-hover:text-cream-50 transition-colors">
                      <Mail size={18} strokeWidth={1.5} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-[0.12em] font-semibold text-burgundy-700">Email</div>
                      <div className="text-ink-900 font-medium">hello@designvortek.com</div>
                      <div className="text-xs text-ink-500 mt-0.5">Best for detailed questions and project ideas.</div>
                    </div>
                  </a>

                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 bg-parchment-50 border border-border-light rounded-xl hover:border-burgundy-700 hover:text-burgundy-700 transition-colors text-ink-700"
                      aria-label="Instagram"
                    >
                      <Camera size={18} strokeWidth={1.5} />
                      <span className="text-xs">Instagram</span>
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 bg-parchment-50 border border-border-light rounded-xl hover:border-burgundy-700 hover:text-burgundy-700 transition-colors text-ink-700"
                      aria-label="Twitter / X"
                    >
                      <AtSign size={18} strokeWidth={1.5} />
                      <span className="text-xs">Twitter</span>
                    </a>
                    <a
                      href="https://discord.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-2 p-4 bg-parchment-50 border border-border-light rounded-xl hover:border-burgundy-700 hover:text-burgundy-700 transition-colors text-ink-700"
                      aria-label="Discord"
                    >
                      <Send size={18} strokeWidth={1.5} />
                      <span className="text-xs">Discord</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Stats / location */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-parchment-50 border border-border-light rounded-xl p-4">
                  <div className="inline-flex w-9 h-9 rounded-md bg-gold-100 text-gold-700 items-center justify-center mb-3">
                    <Clock size={16} strokeWidth={1.5} />
                  </div>
                  <div className="font-display text-2xl font-semibold text-ink-900 leading-none">48h</div>
                  <div className="text-xs text-ink-500 mt-1">Average reply time</div>
                </div>
                <div className="bg-parchment-50 border border-border-light rounded-xl p-4">
                  <div className="inline-flex w-9 h-9 rounded-md bg-gold-100 text-gold-700 items-center justify-center mb-3">
                    <MapPin size={16} strokeWidth={1.5} />
                  </div>
                  <div className="font-display text-base font-semibold text-ink-900 leading-tight">Studio</div>
                  <div className="text-xs text-ink-500 mt-1">Online · Worldwide</div>
                </div>
              </div>

              <div className="bg-parchment-200 rounded-xl p-4 text-sm text-ink-700">
                <strong className="font-display text-ink-900 block mb-1">Response time</strong>
                Within 48 hours, Mon–Fri. We sleep on weekends — usually.
              </div>
            </aside>
          </div>

          {/* FAQ teaser */}
          <div className="mt-20 max-w-3xl mx-auto text-center">
            <SectionLabel>Quick questions</SectionLabel>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mt-3 mb-8">
              Got a question? <em className="italic font-medium text-burgundy-700">Probably answered.</em>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {FAQS.map((faq, i) => (
                <Link
                  key={i}
                  href="/faq"
                  className="bg-parchment-50 border border-border-light rounded-xl p-5 hover:border-burgundy-700 transition-colors group"
                >
                  <div className="font-display text-base font-semibold text-ink-900 mb-2 group-hover:text-burgundy-700 transition-colors">
                    {faq.q}
                  </div>
                  <div className="text-sm text-ink-500 leading-snug">{faq.a}</div>
                </Link>
              ))}
            </div>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 mt-6 text-sm text-burgundy-700 hover:text-burgundy-500 transition-colors"
            >
              See all FAQs <ArrowRight size={14} strokeWidth={1.8} />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  )
}
