'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, ArrowRight, ArrowLeft, Edit3, Clock, Star, Sparkles,
  Users, Circle, Layers, Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ============================================================
   Static data
   ============================================================ */
const SERVICES = [
  { value: 'character-art',  label: 'Character Art', price: 'From $180',  desc: 'Single-character painterly portrait — your hero, brought to life.',          Icon: Star },
  { value: 'vtt-token',      label: 'VTT Tokens',    price: 'From $80',   desc: 'Roll20 & Foundry-ready circular tokens. 512px and 1024px exports.',           Icon: Circle },
  { value: 'party-portrait', label: 'Party Portrait',price: 'From $400',  desc: 'Adventuring party, wedding, gift — 3 to 8 figures in matching style.',        Icon: Users },
  { value: 'npc-pack',       label: 'NPC Pack',      price: 'From $300',  desc: '5+ NPCs in matching style. Schedule-friendly for long campaigns.',            Icon: Layers },
  { value: 'custom',         label: 'Custom',        price: 'Quote',      desc: 'Book covers, game assets, merch, concept art — we will scope a quote.',       Icon: Wand2 },
] as const

const STYLES = [
  'Painterly · warm',
  'Anime · cell-shaded',
  'Lineart · clean',
  'Chibi',
  'Semi-realistic',
  'Open to suggestion',
] as const

const BUDGETS = [
  { value: 'under-200',  label: 'Under $200', note: 'Token or simple piece' },
  { value: '200-500',    label: '$200 – $500', note: 'Standard character art' },
  { value: '500-1k',     label: '$500 – $1k',  note: 'Party portraits, packs' },
  { value: '1k-plus',    label: '$1k+',        note: 'Large commissions' },
] as const

const SOURCES = [
  'Instagram',
  'Twitter / X',
  'Reddit (r/DnD, r/characterdrawing…)',
  'Google search',
  'Friend referral',
  'Previous commission',
  'Other',
] as const

const TOTAL_STEPS = 3
const STEP_LABELS = ['What?', 'Tell us about it', 'Your details']

/* ============================================================
   Component
   ============================================================ */
type FormState = {
  service: string
  styles: string[]
  description: string
  references: string
  deadline: string
  quantity: string
  notes: string
  name: string
  email: string
  phone: string
  source: string
  budget: string
}

const initialState: FormState = {
  service: 'character-art',
  styles: ['Painterly · warm'],
  description: '',
  references: '',
  deadline: '',
  quantity: '1',
  notes: '',
  name: '',
  email: '',
  phone: '',
  source: '',
  budget: '200-500',
}

export default function OrderForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const monthParam = searchParams.get('month')

  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Pre-fill notes if arriving from /availability?month=X
  useEffect(() => {
    if (monthParam) {
      setData((d) => ({
        ...d,
        notes: d.notes || `I'd like to reserve a ${monthParam.charAt(0).toUpperCase()}${monthParam.slice(1)} slot.`,
      }))
    }
  }, [monthParam])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setData((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const toggleStyle = (style: string) => {
    setData((d) => ({
      ...d,
      styles: d.styles.includes(style)
        ? d.styles.filter((s) => s !== style)
        : [...d.styles, style],
    }))
  }

  /* ----- validation ----- */
  const validateStep = (n: number): boolean => {
    const e: Record<string, string> = {}
    if (n === 1) {
      if (!data.service) e.service = 'Pick a service'
    }
    if (n === 2) {
      if (!data.description.trim() || data.description.trim().length < 10) {
        e.description = 'Tell us a bit about the project (at least a sentence)'
      }
    }
    if (n === 3) {
      if (!data.name.trim()) e.name = 'Your name is required'
      if (!data.email.trim()) e.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Invalid email'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const goNext = async () => {
    if (!validateStep(step)) return
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    // submit
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: data.name,
          customer_email: data.email,
          customer_phone: data.phone || undefined,
          service_type: data.service,
          style: data.styles.join(', ') || undefined,
          description: data.description,
          reference_links: data.references || undefined,
          budget: data.budget || undefined,
          deadline: data.deadline || undefined,
        }),
      })
      const body = await res.json()
      if (!res.ok) {
        setSubmitError(body.error || 'Something went wrong.')
        setSubmitting(false)
        return
      }
      router.push('/order/success')
    } catch (err) {
      console.error(err)
      setSubmitError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const selectedService = SERVICES.find((s) => s.value === data.service)
  const selectedBudget = BUDGETS.find((b) => b.value === data.budget)

  /* ============================================================
     Render
     ============================================================ */
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-12 max-w-[1200px] mx-auto px-6 md:px-12">

      {/* ============== FORM CARD ============== */}
      <div className="bg-parchment-50 border border-border-light rounded-2xl p-6 md:p-10 shadow-sm">

        {/* Progress bar */}
        <div className="mb-8" aria-label="Form progress">
          <div className="flex items-center justify-between gap-2 mb-3">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1
              const active = n === step
              const done = n < step
              return (
                <div key={label} className="flex-1 flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-[0.7rem] font-semibold transition-colors',
                        done && 'bg-burgundy-700 text-cream-50',
                        active && 'bg-gold-500 text-ink-900',
                        !done && !active && 'bg-parchment-200 text-ink-500'
                      )}
                    >
                      {done ? <Check size={14} strokeWidth={2.4} /> : n}
                    </div>
                    <span
                      className={cn(
                        'hidden md:inline text-[0.7rem] uppercase tracking-[0.15em] font-semibold',
                        (active || done) ? 'text-ink-900' : 'text-ink-400'
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {n < STEP_LABELS.length && (
                    <div className={cn(
                      'flex-1 h-px mx-2 md:mx-3 transition-colors',
                      done ? 'bg-burgundy-700' : 'bg-border-light'
                    )} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="text-[0.7rem] uppercase tracking-[0.15em] text-ink-500">
            Step {step} of {TOTAL_STEPS} · {STEP_LABELS[step - 1]}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >

            {/* ============== STEP 1 ============== */}
            {step === 1 && (
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-tight mb-2">
                  What do you <em className="italic font-medium text-burgundy-700">need</em>?
                </h2>
                <p className="text-ink-500 mb-8">
                  Pick the service that fits. Not sure? Start with Character Art — we&rsquo;ll talk through the rest.
                </p>

                <fieldset className="mb-8">
                  <legend className="block text-sm font-semibold text-ink-900 mb-1">Service type</legend>
                  <p className="text-xs text-ink-500 mb-4">Choose one. You can refine details in the next step.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICES.map(({ value, label, price, desc, Icon }) => {
                      const checked = data.service === value
                      return (
                        <label
                          key={value}
                          className={cn(
                            'relative flex flex-col gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all',
                            checked
                              ? 'border-burgundy-700 bg-burgundy-100/40'
                              : 'border-border-light bg-parchment-50 hover:border-border-medium'
                          )}
                        >
                          <input
                            type="radio"
                            name="service"
                            value={value}
                            checked={checked}
                            onChange={() => set('service', value)}
                            className="sr-only"
                          />
                          <div className="flex items-start gap-3">
                            <span className={cn(
                              'inline-flex w-9 h-9 rounded-md items-center justify-center shrink-0',
                              checked ? 'bg-burgundy-700 text-cream-50' : 'bg-parchment-200 text-ink-700'
                            )}>
                              <Icon size={18} strokeWidth={1.5} />
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-2">
                                <span className="font-display text-lg font-semibold text-ink-900">{label}</span>
                                <span className="text-[0.7rem] uppercase tracking-wider text-gold-700 font-semibold">{price}</span>
                              </div>
                              <p className="text-sm text-ink-500 mt-0.5 leading-snug">{desc}</p>
                            </div>
                          </div>
                          {checked && (
                            <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-burgundy-700 text-cream-50 inline-flex items-center justify-center">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </label>
                      )
                    })}
                  </div>
                  {errors.service && <p className="text-error text-sm mt-2">{errors.service}</p>}
                </fieldset>

                <fieldset className="mb-2">
                  <legend className="block text-sm font-semibold text-ink-900 mb-1">Style preference</legend>
                  <p className="text-xs text-ink-500 mb-4">Optional — we&rsquo;ll discuss style in detail before starting.</p>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map((style) => {
                      const checked = data.styles.includes(style)
                      return (
                        <button
                          type="button"
                          key={style}
                          onClick={() => toggleStyle(style)}
                          className={cn(
                            'px-4 py-2 rounded-full text-sm border-2 transition-all',
                            checked
                              ? 'border-burgundy-700 bg-burgundy-700 text-cream-50'
                              : 'border-border-light bg-parchment-50 text-ink-700 hover:border-border-medium'
                          )}
                        >
                          {style}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              </div>
            )}

            {/* ============== STEP 2 ============== */}
            {step === 2 && (
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-tight mb-2">
                  Tell us about <em className="italic font-medium text-burgundy-700">it</em>
                </h2>
                <p className="text-ink-500 mb-8">
                  The more specific, the better the brief. Include species, class, vibe — whatever makes them theirs.
                </p>

                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-semibold text-ink-900 mb-2">
                    Project description <span className="text-error">*</span>
                  </label>
                  <textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => set('description', e.target.value)}
                    rows={6}
                    maxLength={1500}
                    placeholder="e.g. Lyra Vexweaver — tiefling sorceress, level 9. Tall, lean, soft purple skin with darker freckles, gold horns swept back. Painterly style, warm dramatic lighting, dark mossy forest background. Vibe: melancholy but powerful."
                    className={cn(
                      'w-full bg-parchment-50 border rounded-md px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors min-h-[140px] resize-y',
                      errors.description ? 'border-error' : 'border-border-light'
                    )}
                  />
                  <div className="flex justify-between mt-1.5">
                    {errors.description ? (
                      <p className="text-error text-xs">{errors.description}</p>
                    ) : <span />}
                    <span className="text-xs text-ink-400">{data.description.length} / 1500</span>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="references" className="block text-sm font-semibold text-ink-900 mb-1">
                    Reference links <span className="text-ink-400 font-normal text-xs">optional</span>
                  </label>
                  <p className="text-xs text-ink-500 mb-2">Pinterest boards, ArtStation, mood images — paste one or many.</p>
                  <input
                    id="references"
                    type="text"
                    value={data.references}
                    onChange={(e) => set('references', e.target.value)}
                    placeholder="https://pinterest.com/board/… https://artstation.com/…"
                    className="w-full bg-parchment-50 border border-border-light rounded-md px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="deadline" className="block text-sm font-semibold text-ink-900 mb-2">
                      Preferred deadline <span className="text-ink-400 font-normal text-xs">optional</span>
                    </label>
                    <input
                      id="deadline"
                      type="date"
                      value={data.deadline}
                      onChange={(e) => set('deadline', e.target.value)}
                      className="w-full bg-parchment-50 border border-border-light rounded-md px-4 py-3 text-sm text-ink-900 focus:outline-none focus:border-burgundy-500 transition-colors"
                    />
                  </div>
                  {(data.service === 'party-portrait' || data.service === 'npc-pack') && (
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-semibold text-ink-900 mb-2">
                        Figure count
                      </label>
                      <select
                        id="quantity"
                        value={data.quantity}
                        onChange={(e) => set('quantity', e.target.value)}
                        className="w-full bg-parchment-50 border border-border-light rounded-md px-4 py-3 text-sm text-ink-900 focus:outline-none focus:border-burgundy-500 transition-colors"
                      >
                        <option value="1">1 figure</option>
                        <option value="2-3">2 – 3 figures</option>
                        <option value="4-5">4 – 5 figures</option>
                        <option value="6-8">6 – 8 figures</option>
                        <option value="9+">9+ figures (bulk)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-ink-900 mb-2">
                    Anything else? <span className="text-ink-400 font-normal text-xs">optional</span>
                  </label>
                  <textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    rows={3}
                    placeholder="Surprise gift? Specific delivery date? Layered PSD needed?"
                    className="w-full bg-parchment-50 border border-border-light rounded-md px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors min-h-[80px] resize-y"
                  />
                </div>
              </div>
            )}

            {/* ============== STEP 3 ============== */}
            {step === 3 && (
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 leading-tight mb-2">
                  Your <em className="italic font-medium text-burgundy-700">details</em>
                </h2>
                <p className="text-ink-500 mb-8">
                  So we can send the quote. We never share your details — ever.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-ink-900 mb-2">
                      Your name <span className="text-error">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => set('name', e.target.value)}
                      placeholder="Aria Mendel"
                      autoComplete="name"
                      className={cn(
                        'w-full bg-parchment-50 border rounded-md px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors',
                        errors.name ? 'border-error' : 'border-border-light'
                      )}
                    />
                    {errors.name && <p className="text-error text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-ink-900 mb-2">
                      Email <span className="text-error">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="aria@example.com"
                      autoComplete="email"
                      className={cn(
                        'w-full bg-parchment-50 border rounded-md px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors',
                        errors.email ? 'border-error' : 'border-border-light'
                      )}
                    />
                    {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-ink-900 mb-2">
                      Phone <span className="text-ink-400 font-normal text-xs">optional</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={data.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      autoComplete="tel"
                      className="w-full bg-parchment-50 border border-border-light rounded-md px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="source" className="block text-sm font-semibold text-ink-900 mb-2">
                      How did you find us?
                    </label>
                    <select
                      id="source"
                      value={data.source}
                      onChange={(e) => set('source', e.target.value)}
                      className="w-full bg-parchment-50 border border-border-light rounded-md px-4 py-3 text-sm text-ink-900 focus:outline-none focus:border-burgundy-500 transition-colors"
                    >
                      <option value="">Choose one…</option>
                      {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <fieldset>
                  <legend className="block text-sm font-semibold text-ink-900 mb-1">Preferred budget</legend>
                  <p className="text-xs text-ink-500 mb-4">Helps us match scope to investment. We&rsquo;ll confirm in the quote.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {BUDGETS.map(({ value, label, note }) => {
                      const checked = data.budget === value
                      return (
                        <label
                          key={value}
                          className={cn(
                            'p-3 rounded-lg border-2 text-center cursor-pointer transition-all',
                            checked
                              ? 'border-burgundy-700 bg-burgundy-100/40'
                              : 'border-border-light bg-parchment-50 hover:border-border-medium'
                          )}
                        >
                          <input
                            type="radio"
                            name="budget"
                            value={value}
                            checked={checked}
                            onChange={() => set('budget', value)}
                            className="sr-only"
                          />
                          <div className="font-display text-base font-semibold text-ink-900">{label}</div>
                          <div className="text-[0.7rem] text-ink-500 mt-0.5">{note}</div>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>

                {submitError && (
                  <div className="mt-6 px-4 py-3 rounded-md bg-error/10 border border-error/30 text-error text-sm">
                    {submitError}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Footer nav */}
        <div className="flex items-center justify-between gap-4 pt-8 mt-8 border-t border-border-light">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1 || submitting}
            className={cn(
              'inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-semibold uppercase tracking-[0.12em] transition-colors',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'text-ink-700 hover:bg-parchment-100'
            )}
          >
            <ArrowLeft size={14} strokeWidth={1.8} /> Back
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={submitting}
            className={cn(
              'inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.12em]',
              'bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 transition-colors',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          >
            {submitting ? 'Sending…' : (step === TOTAL_STEPS ? 'Send brief' : 'Continue')}
            {!submitting && <ArrowRight size={14} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {/* ============== SUMMARY SIDEBAR ============== */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-5">

          {/* Summary card */}
          <div className="bg-parchment-50 border border-border-light rounded-2xl p-6 shadow-sm">
            <div className="text-[0.7rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 mb-3">
              Your brief so far
            </div>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-ink-500 text-xs uppercase tracking-wider mb-0.5">Service</dt>
                <dd className="text-ink-900 font-medium">
                  {selectedService ? `${selectedService.label} · ${selectedService.price}` : '—'}
                </dd>
              </div>

              {data.styles.length > 0 && step >= 1 && (
                <div>
                  <dt className="text-ink-500 text-xs uppercase tracking-wider mb-0.5">Style</dt>
                  <dd className="text-ink-900">{data.styles.join(' · ')}</dd>
                </div>
              )}

              {data.description && step >= 2 && (
                <div>
                  <dt className="text-ink-500 text-xs uppercase tracking-wider mb-0.5">Description</dt>
                  <dd className="text-ink-700 text-sm line-clamp-3">{data.description}</dd>
                </div>
              )}

              {data.deadline && step >= 2 && (
                <div>
                  <dt className="text-ink-500 text-xs uppercase tracking-wider mb-0.5">Deadline</dt>
                  <dd className="text-ink-900">{data.deadline}</dd>
                </div>
              )}

              {step >= 3 && (
                <div>
                  <dt className="text-ink-500 text-xs uppercase tracking-wider mb-0.5">Budget</dt>
                  <dd className="text-ink-900">{selectedBudget?.label || '—'}</dd>
                </div>
              )}

              {data.name && step >= 3 && (
                <div>
                  <dt className="text-ink-500 text-xs uppercase tracking-wider mb-0.5">Contact</dt>
                  <dd className="text-ink-900">
                    {data.name}
                    {data.email && <span className="text-ink-500 block text-xs">{data.email}</span>}
                  </dd>
                </div>
              )}
            </dl>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-burgundy-700 hover:text-burgundy-500 transition-colors"
            >
              <Edit3 size={12} strokeWidth={1.8} /> Edit from step 1
            </button>
          </div>

          {/* Next steps mini-timeline */}
          <div className="bg-parchment-50 border border-border-light rounded-2xl p-6 shadow-sm">
            <div className="text-[0.7rem] uppercase tracking-[0.15em] font-semibold text-burgundy-700 mb-4">
              What happens next
            </div>
            <ol className="space-y-4">
              {[
                { strong: 'Within 48 hours', body: 'We review and send a fixed quote with timeline.' },
                { strong: 'You approve & deposit', body: '25% holds your slot. Refundable until first sketch.' },
                { strong: 'Work begins', body: 'Sketches, color blocks, paint. Updates every 3 days.' },
              ].map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-gold-100 text-gold-700 font-display font-semibold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="text-sm">
                    <div className="font-semibold text-ink-900">{s.strong}</div>
                    <div className="text-ink-500 leading-snug">{s.body}</div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-5 pt-4 border-t border-border-light flex items-center gap-2 text-xs text-ink-500">
              <Clock size={14} strokeWidth={1.5} className="text-gold-700" />
              <span><span className="font-semibold text-ink-900">48 hours</span> · average response time</span>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-tome-900 text-cream-50 rounded-2xl p-6 relative overflow-hidden">
            <Sparkles size={20} strokeWidth={1.5} className="text-gold-glow mb-3" />
            <blockquote className="font-display italic text-base leading-relaxed mb-4">
              &ldquo;Every revision sharpened the piece. This isn&rsquo;t a transaction — it&rsquo;s a collaboration.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-gold-500 text-ink-900 inline-flex items-center justify-center font-display font-semibold text-sm">
                AM
              </span>
              <div className="text-xs">
                <div className="text-cream-50 font-semibold">Aria Mendel</div>
                <div className="text-cream-200">Character commission</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
