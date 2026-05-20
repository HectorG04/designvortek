'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Check, AlertCircle, Sparkles } from 'lucide-react'

const SERVICE_TAGS = [
  'D&D Character Art',
  'VTT Tokens',
  'Party Portraits',
  'NPC Packs',
  'Anime & Furry',
  'Custom Projects',
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function ComingSoon() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
          source: 'coming-soon-page',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join. Try again.')
      setStatus('error')
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-parchment-50 px-6 py-16">

      {/* Subtle ambient gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-gold-300 blur-[180px] -translate-x-1/2 -translate-y-1/2"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-burgundy-100 blur-[160px]"
        />
      </div>

      {/* Subtle aged-paper grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(#1E1408 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <main className="relative z-10 w-full max-w-2xl mx-auto text-center">

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border border-gold-500/40" />
            <div className="absolute inset-[6px] rounded-full bg-gradient-to-br from-gold-300/40 to-burgundy-100/0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-burgundy-700 text-lg font-bold">DV</span>
            </div>
            {/* Compass-rose flourish (tiny accent) */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-500" />
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-500" />
            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-1 h-1 rounded-full bg-gold-500" />
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-1 h-1 rounded-full bg-gold-500" />
          </div>
          <span className="font-display text-ink-900 text-sm font-semibold tracking-[0.25em] uppercase">
            Design Vortex
          </span>
        </motion.div>

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="inline-flex items-center gap-3 mb-6"
        >
          <span className="h-px w-8 bg-gold-500/60" />
          <span className="text-burgundy-700 text-[0.65rem] font-semibold tracking-[0.25em] uppercase">
            Crafting Something Special
          </span>
          <span className="h-px w-8 bg-gold-500/60" />
        </motion.div>

        {/* Headline — staggered words */}
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-ink-900 leading-[1.05] mb-6 overflow-hidden">
          {['A new home', 'is being'].map((line, i) => (
            <motion.span
              key={i}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.25 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              {line}
            </motion.span>
          ))}
          <motion.span
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            <em className="font-display italic text-burgundy-700">illuminated.</em>
          </motion.span>
        </h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-ink-500 text-lg max-w-lg mx-auto leading-relaxed mb-10"
        >
          Design Vortex is a premium art studio crafting custom character art, VTT tokens, and bespoke illustrations for the TTRPG community and beyond. Our new site is on its way.
        </motion.p>

        {/* Service tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-12"
        >
          {SERVICE_TAGS.map((tag, i) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.85 + i * 0.04 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-parchment-100 border border-border-light text-ink-700 text-xs font-medium"
            >
              {tag}
            </motion.span>
          ))}
        </motion.div>

        {/* Email capture */}
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-parchment-100 border border-forest-500/30 rounded-2xl p-8 max-w-md mx-auto"
            >
              <div className="w-12 h-12 rounded-full bg-forest-500/15 flex items-center justify-center mx-auto mb-4">
                <Check size={20} className="text-forest-700" strokeWidth={2.5} />
              </div>
              <h2 className="font-display text-2xl text-ink-900 mb-2">You&rsquo;re on the list.</h2>
              <p className="text-ink-500 text-sm">
                We&rsquo;ll send a note the moment we open the gates. In the meantime,{' '}
                <a href="mailto:hello@designvortek.com" className="text-burgundy-700 underline underline-offset-4 hover:text-burgundy-500 transition">
                  reach out
                </a>{' '}
                if you have a commission in mind.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="max-w-md mx-auto"
            >
              <p className="font-display text-ink-900 text-xl mb-1">Be first to know.</p>
              <p className="text-ink-500 text-sm mb-6">
                Get notified when we launch — plus first access to commission slots.
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={status === 'loading'}
                  className="w-full bg-parchment-100 border border-border-light rounded-xl px-4 py-3 text-ink-900 text-sm placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:bg-parchment-50 transition-all disabled:opacity-60"
                />

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === 'loading'}
                      className="w-full bg-parchment-100 border border-border-light rounded-xl pl-11 pr-4 py-3 text-ink-900 text-sm placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:bg-parchment-50 transition-all disabled:opacity-60"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={status === 'loading' || !email}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 bg-burgundy-700 text-cream-50 font-semibold text-xs tracking-[0.1em] uppercase px-6 py-3 rounded-xl hover:bg-burgundy-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {status === 'loading' ? (
                      <div className="w-4 h-4 border-2 border-cream-50/30 border-t-cream-50 rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Notify
                      </>
                    )}
                  </motion.button>
                </div>

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 text-error text-xs mt-2"
                  >
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </div>

              <p className="text-ink-400 text-xs mt-4">
                No spam. Unsubscribe anytime. We&rsquo;ll only email you about the launch.
              </p>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Footer line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mt-16 pt-8 border-t border-border-light/50 max-w-md mx-auto"
        >
          <p className="text-ink-400 text-xs">
            Currently accepting commissions via{' '}
            <a href="mailto:hello@designvortek.com" className="text-burgundy-700 underline underline-offset-4 hover:text-burgundy-500 transition">
              hello@designvortek.com
            </a>
          </p>
          <p className="font-accent text-ink-500 text-lg mt-2">
            See you soon — DV
          </p>
        </motion.div>

      </main>
    </div>
  )
}
