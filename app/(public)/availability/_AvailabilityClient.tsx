'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Check, ArrowRight, Clock, Sparkles, Pencil, Send } from 'lucide-react'
import { useState } from 'react'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import { LinkButton } from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'
import { cn } from '@/lib/utils'

/* Slot data — May, June (full + waitlist), July (mostly open) */
type Slot = { num: string; booked: boolean }
type MonthData = {
  key: string
  month: string
  year: string
  flag: 'open' | 'full'
  flagLabel: string
  sub: string
  slots: Slot[]
  metaSuffix: string
  ctaLabel: string
}

const MONTHS: MonthData[] = [
  {
    key: 'may',
    month: 'May',
    year: '2026',
    flag: 'open',
    flagLabel: '2 open',
    sub: 'Current month',
    slots: [
      { num: '01', booked: true },
      { num: '02', booked: true },
      { num: '03', booked: true },
      { num: '04', booked: false },
      { num: '05', booked: false },
    ],
    metaSuffix: 'book by May 25',
    ctaLabel: 'Reserve a May slot',
  },
  {
    key: 'june',
    month: 'June',
    year: '2026',
    flag: 'full',
    flagLabel: 'Fully booked',
    sub: 'Next month',
    slots: [
      { num: '01', booked: true },
      { num: '02', booked: true },
      { num: '03', booked: true },
      { num: '04', booked: true },
      { num: '05', booked: true },
    ],
    metaSuffix: 'waitlist of 4 · we’ll reach out if a slot opens',
    ctaLabel: 'Join June waitlist',
  },
  {
    key: 'july',
    month: 'July',
    year: '2026',
    flag: 'open',
    flagLabel: '4 open',
    sub: 'Booking now',
    slots: [
      { num: '01', booked: true },
      { num: '02', booked: false },
      { num: '03', booked: false },
      { num: '04', booked: false },
      { num: '05', booked: false },
    ],
    metaSuffix: 'early-bird friendly',
    ctaLabel: 'Reserve a July slot',
  },
]

export default function AvailabilityClient() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'availability-page' }),
      })
      setSubmitted(true)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <main id="main">
        {/* Hero */}
        <section className="pt-[160px] pb-12 text-center">
          <Container>
            <div className="mb-4 flex justify-center">
              <SectionLabel>Availability</SectionLabel>
            </div>
            <h1
              className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
            >
              When can <em className="italic font-medium text-burgundy-700">we start</em>?
            </h1>
            <p className="text-lg text-ink-500 leading-[1.65] mt-4 mx-auto max-w-[60ch]">
              We take a fixed number of pieces each month so every commission gets the attention it deserves.
              Here&rsquo;s what&rsquo;s open right now.
            </p>
          </Container>
        </section>

        {/* 3-month calendar */}
        <section className="pb-16">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MONTHS.map((m) => {
                const open = m.slots.filter((s) => !s.booked).length
                const booked = m.slots.length - open
                return (
                  <motion.div
                    key={m.key}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={cn(
                      'bg-parchment-50 border rounded-2xl p-6 shadow-sm flex flex-col',
                      m.flag === 'open' && m.key === 'may'
                        ? 'border-gold-500 ring-1 ring-gold-500/30'
                        : 'border-border-light'
                    )}
                  >
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <div className="font-display text-2xl font-semibold text-ink-900 leading-tight">
                          {m.month} {m.year}
                        </div>
                        <div className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-ink-500 mt-1">
                          {m.sub}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-full text-[0.65rem] uppercase tracking-[0.12em] font-semibold',
                          m.flag === 'open' ? 'bg-success/15 text-success' : 'bg-burgundy-100 text-burgundy-700'
                        )}
                      >
                        {m.flagLabel}
                      </span>
                    </div>

                    {/* Slots */}
                    <div className="flex items-center justify-center gap-2.5 py-4" role="list">
                      {m.slots.map((slot) => {
                        if (slot.booked) {
                          return (
                            <div
                              key={slot.num}
                              role="listitem"
                              aria-label={`Slot ${slot.num}, booked`}
                              className="w-11 h-11 rounded-full bg-burgundy-700 text-cream-50 flex items-center justify-center"
                            >
                              <Check size={16} strokeWidth={2.4} />
                            </div>
                          )
                        }
                        return (
                          <Link
                            key={slot.num}
                            href={`/order?month=${m.key}`}
                            aria-label={`Reserve ${m.month} slot ${slot.num}`}
                            className={cn(
                              'w-11 h-11 rounded-full bg-parchment-50 border-2 border-gold-500 text-ink-900 flex items-center justify-center',
                              'font-display text-sm font-semibold hover:bg-gold-100 hover:border-gold-700 transition-colors'
                            )}
                          >
                            {slot.num}
                          </Link>
                        )
                      })}
                    </div>

                    <div className="text-center text-sm text-ink-500 leading-relaxed mb-5">
                      <span className="font-semibold text-ink-700">{booked} booked</span>
                      {' · '}{open} remaining · {m.metaSuffix}
                    </div>

                    <div className="mt-auto flex justify-center">
                      <LinkButton
                        href={`/order?month=${m.key}`}
                        variant={m.flag === 'open' ? 'gold' : 'outline'}
                        size="sm"
                      >
                        {m.ctaLabel} <ArrowRight size={14} strokeWidth={1.8} />
                      </LinkButton>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Container>
        </section>

        {/* Explainer + side panel */}
        <section className="relative bg-parchment-200 py-20 overflow-hidden">
          <PaperTexture variant="parchment" opacity={0.35} />
          <Container className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* Left: explainer */}
              <div>
                <SectionLabel>What is a slot?</SectionLabel>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-tight mt-3 mb-4">
                  One slot, <em className="italic font-medium text-burgundy-700">one commission</em>.
                </h2>
                <p className="text-ink-700 leading-relaxed mb-4">
                  We take five commissions per month, each one getting our full attention through sketches,
                  paint, and revisions. No overlap, no juggling, no rushed work.
                </p>
                <p className="text-ink-500 leading-relaxed">
                  That&rsquo;s why we&rsquo;re worth booking ahead — and why the slots fill up.
                </p>
              </div>

              {/* Right: step list */}
              <div className="bg-parchment-50 border border-border-light rounded-2xl p-6 md:p-8 shadow-sm">
                <ol className="space-y-5">
                  {[
                    { Icon: Pencil,    strong: 'Reserve your slot',    body: '25% deposit holds it. Refundable until first sketch.' },
                    { Icon: Send,      strong: 'We confirm + brief',   body: 'Within 48 hours we send the quote and intake form.' },
                    { Icon: Sparkles,  strong: 'Sketches begin',       body: 'Usually within a week. Updates every 3 days from there.' },
                    { Icon: Clock,     strong: 'Final delivery',       body: '4K final + transparent BG. Yours, forever.' },
                  ].map(({ Icon, strong, body }, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="shrink-0 w-10 h-10 rounded-full bg-gold-100 text-gold-700 inline-flex items-center justify-center">
                        <Icon size={18} strokeWidth={1.6} />
                      </span>
                      <div>
                        <div className="font-display text-lg font-semibold text-ink-900 leading-tight">{strong}</div>
                        <div className="text-sm text-ink-500 mt-1">{body}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Container>
        </section>

        {/* Waitlist */}
        <section className="py-20 bg-tome-900 text-cream-50 relative overflow-hidden">
          <PaperTexture variant="cream" opacity={0.15} />
          <Container className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-[10px] mb-3 font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-gold-glow">
                  <span className="h-px w-6 bg-gold-glow" aria-hidden="true" />
                  Waitlist
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight mb-3 text-cream-50">
                  This month&rsquo;s full. <em className="italic font-medium text-gold-glow">Next month&rsquo;s coming</em>.
                </h2>
                <p className="text-cream-200 leading-relaxed">
                  Drop your email and we&rsquo;ll reach out the moment a slot opens — plus give you first pick
                  when next month&rsquo;s slots release.
                </p>
              </div>

              <div>
                {submitted ? (
                  <div className="bg-forest-700/30 border border-forest-500/50 rounded-lg px-5 py-4 text-cream-50 flex items-center gap-3">
                    <Check size={20} strokeWidth={2} className="text-gold-glow" />
                    <span>Thanks — you&rsquo;re on the list.</span>
                  </div>
                ) : (
                  <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      disabled={loading}
                      className="flex-1 bg-tome-800 border border-tome-800 rounded-md px-4 py-3 text-sm text-cream-50 placeholder:text-cream-200/60 focus:outline-none focus:border-gold-glow transition-colors disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gold-500 text-ink-900 px-6 py-3 rounded-md text-xs font-semibold uppercase tracking-[0.12em] hover:bg-gold-300 transition-colors disabled:opacity-60"
                    >
                      {loading ? '…' : 'Join waitlist'}
                    </button>
                  </form>
                )}
                <div className="text-xs text-cream-200/70 mt-3">
                  No spam, no marketing. Just availability notes.
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  )
}
