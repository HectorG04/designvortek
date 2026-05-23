'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import USDDisclaimer from '@/components/ui/USDDisclaimer'
import { cn } from '@/lib/utils'

/* =====================================================================
   ORDER FORM — port of Order Form.html + V2 Step 1 progressive disclosure.

   4-step brief: Service → Project → Details → Review.

   PHASE 5 V2 CHANGES (this revision):
     1) Step 1 replaced with V2 bucket → product → tier flow. Five bucket
        cards reveal a product chip row, which (for tiered products) reveals
        a 3-up tier grid. Non-tiered products show an inline preview note.
        Quote-only products (battle map, world/region map) deep-link to
        /services/maps instead of advancing the form. Catalog lives in an
        inline CATALOG const below — sourced from V2 design + lib/services.
     2) Step 3 gains a "budget_notes" textarea below the budget cards
        for negotiation context (returning client, student, multi-piece,
        charity, etc). Submitted as `[Budget context] …` prefix folded
        into the existing `notes` payload so the API hands it through to
        `internal_notes` without any backend change.

   Carried over from V1:
     - Submits to /api/order with the same payload shape
     - Validates each step before allowing next
     - Restores draft from query string (`?month=June` deep-links from
       /availability)
     - Multi-style checkboxes, budget radio cards
   ===================================================================== */

/* ---------- Pricing-mode types for the V2 catalog ---------- */
type Tier = { id: string; name: string; price: string; note: string; featured?: boolean }
type Product =
  | { id: string; name: string; sub: string; mode: 'tiered'; tiers: Tier[]; footnote?: string }
  | { id: string; name: string; sub: string; mode: 'range';   rangeNote: string }
  | { id: string; name: string; sub: string; mode: 'flat';    flatNote: string }
  | { id: string; name: string; sub: string; mode: 'pack';    packNote: string }
  | { id: string; name: string; sub: string; mode: 'bundle';  bundleNote: string }
  | { id: string; name: string; sub: string; mode: 'monthly'; monthlyNote: string }
  | { id: string; name: string; sub: string; mode: 'quote';   href: string; quoteNote: string }

type BucketKey = 'character' | 'party' | 'gm' | 'tokens' | 'subscription'

type BucketEntry = {
  /** Long label used in the reveal head + crumb trail ("Character work") */
  label: string
  /** Short name shown on the bucket card itself ("Character") */
  cardName: string
  tagline: string
  /** Short blurb shown on the bucket card body */
  desc: string
  /** Short blurb shown in the reveal head sub */
  helper: string
  fromLine: string
  countLine: string
  products: Product[]
}

/* ---------- V2 CATALOG — bucket → product → tier hierarchy ----------
 * Mirrors the CATALOG const inside the V2 Step 1 HTML, with the pricing
 * values taken from lib/services.ts (the locked snapshot). Commercial is
 * intentionally excluded — that bucket has its own /commercial flow. */
const CATALOG: Record<BucketKey, BucketEntry> = {
  character: {
    label: 'Character work',
    cardName: 'Character',
    tagline: 'your hero, painted',
    desc: 'Single-figure portraits, full-body art, reference sheets, character+token bundles.',
    helper: 'Single-figure pieces, reference sheets, and the matching-token bundle.',
    fromLine: 'from $60',
    countLine: '4 products',
    products: [
      {
        id: 'character-portrait-bust',
        name: 'Character Portrait',
        sub: 'bust',
        mode: 'tiered',
        tiers: [
          { id: 'basic',    name: 'Basic',    price: '$60',  note: 'line + flat color' },
          { id: 'standard', name: 'Standard', price: '$90',  note: 'full render', featured: true },
          { id: 'premium',  name: 'Premium',  price: '$140', note: 'atmospheric' },
        ],
      },
      {
        id: 'character-art-full-body',
        name: 'Full-body Character',
        sub: 'head to toe',
        mode: 'tiered',
        tiers: [
          { id: 'basic',    name: 'Basic',    price: '$120', note: 'standing pose' },
          { id: 'standard', name: 'Standard', price: '$180', note: 'dynamic + scene', featured: true },
          { id: 'premium',  name: 'Premium',  price: '$280', note: 'cinematic' },
        ],
      },
      {
        id: 'character-reference-sheet',
        name: 'Reference Sheet',
        sub: 'from $250',
        mode: 'range',
        rangeNote: '$250 to $450 · scoped per brief',
      },
      {
        id: 'character-token-bundle',
        name: 'Portrait + Token Bundle',
        sub: '+$25',
        mode: 'bundle',
        bundleNote: 'Adds a matching VTT token to any portrait tier for a flat $25. Pick a portrait tier above, then add this on at the brief stage.',
      },
    ],
  },
  party: {
    label: 'Party work',
    cardName: 'Party',
    tagline: 'the whole gang',
    desc: 'Group compositions, matched portrait sets, action scenes for the whole table.',
    helper: 'Group compositions and action scenes.',
    fromLine: 'from $220',
    countLine: '3 products',
    products: [
      {
        id: 'party-portrait',
        name: 'Party Portrait',
        sub: 'up to 4 in one piece',
        mode: 'tiered',
        tiers: [
          { id: 'standard', name: 'Standard', price: '$350', note: '4 figures, half-body' },
          { id: 'premium',  name: 'Premium',  price: '$600', note: '4 figures, full scene', featured: true },
        ],
        footnote: 'Each extra member adds $80 to $120 depending on tier.',
      },
      {
        id: 'matched-party-set',
        name: 'Matched Party Set',
        sub: 'separate portraits, unified style',
        mode: 'pack',
        packNote: '4 portraits $220 · 6 portraits $320',
      },
      {
        id: 'action-scene',
        name: 'Action Scene',
        sub: 'from $400',
        mode: 'range',
        rangeNote: '$400 to $900 · scoped per brief',
      },
    ],
  },
  gm: {
    label: 'GM & world-building',
    cardName: 'GM & world-building',
    tagline: 'for the campaign',
    desc: 'NPC packs, monsters, items, battle maps, region maps. Anything behind the screen.',
    helper: 'Everything behind the screen.',
    fromLine: 'from $30',
    countLine: '5 products',
    products: [
      {
        id: 'npc-pack',
        name: 'NPC Pack',
        sub: '5 or 10 portraits',
        mode: 'pack',
        packNote: '5 NPCs $220 · 10 NPCs $400',
      },
      {
        id: 'monster-creature',
        name: 'Monster / Creature',
        sub: 'from $90',
        mode: 'range',
        rangeNote: '$90 to $250 · scoped by complexity',
      },
      {
        id: 'item-artifact',
        name: 'Item / Artifact',
        sub: 'single or 6-pack',
        mode: 'pack',
        packNote: 'Single $30 · 6-pack $150',
      },
      {
        id: 'battle-map',
        name: 'Battle Map',
        sub: 'quote only',
        mode: 'quote',
        href: '/services/maps',
        quoteNote: 'Battle maps are quote-based. Send a brief on the dedicated maps page so we can scope properly.',
      },
      {
        id: 'world-region-map',
        name: 'World / Region Map',
        sub: 'quote only',
        mode: 'quote',
        href: '/services/maps',
        quoteNote: 'World and region maps are quote-based. Brief them on the maps page.',
      },
    ],
  },
  tokens: {
    label: 'Tokens',
    cardName: 'Tokens (standalone)',
    tagline: 'tabletop-ready',
    desc: 'Single tokens, token packs, or convert your existing art into VTT-ready tokens.',
    helper: 'For VTT play. Personal use included.',
    fromLine: 'from $25',
    countLine: '3 products',
    products: [
      {
        id: 'vtt-token-single',
        name: 'Single Token',
        sub: 'from $40',
        mode: 'range',
        rangeNote: '$40 to $60 · scoped per character',
      },
      {
        id: 'vtt-token-pack-5',
        name: 'Token Pack',
        sub: '5 originals',
        mode: 'flat',
        flatNote: '$180 · 5 original tokens in matching style',
      },
      {
        id: 'convert-to-token',
        name: 'Convert client art to token',
        sub: 'flat fee',
        mode: 'flat',
        flatNote: '$25 per token · works from art you already own',
      },
    ],
  },
  subscription: {
    label: 'Subscription',
    cardName: 'Subscription',
    tagline: 'campaign companion',
    desc: 'Monthly tokens, NPCs, and maps. For active GMs running long-form campaigns. 6-month minimum commitment.',
    helper: 'Monthly bundle · 6 months minimum.',
    fromLine: '$75 or $150 / mo',
    countLine: '2 tiers',
    products: [
      {
        id: 'subscription-companion',
        name: 'Companion',
        sub: '$75 / mo',
        mode: 'monthly',
        monthlyNote: '$75 / month · 10 tokens + 2 NPCs · 6 months minimum · pause up to 2 cycles within the window',
      },
      {
        id: 'subscription-gm',
        name: 'GM tier',
        sub: '$150 / mo',
        mode: 'monthly',
        monthlyNote: '$150 / month · ~15 tokens + 3 NPCs + 1 battle map · 6 months minimum · pause up to 2 cycles within the window',
      },
    ],
  },
}

const BUCKET_ORDER: BucketKey[] = ['character', 'party', 'gm', 'tokens', 'subscription']

const STYLES = [
  { value: 'painterly',  label: 'Painterly · warm' },
  { value: 'anime',      label: 'Anime · cell-shaded' },
  { value: 'lineart',    label: 'Lineart · clean' },
  { value: 'chibi',      label: 'Chibi' },
  { value: 'realistic',  label: 'Semi-realistic' },
  { value: 'open',       label: 'Open to suggestion' },
] as const

const QUANTITIES = [
  { value: '1',     label: '1 piece' },
  { value: '2',     label: '2 pieces' },
  { value: '3-5',   label: '3 – 5 pieces' },
  { value: '6-10',  label: '6 – 10 pieces' },
  { value: '10+',   label: '10+ pieces (bulk)' },
] as const

const BUDGETS = [
  { value: 'under-100',  range: 'Under $100',   note: 'Token, item, monster bust' },
  { value: '100-300',    range: '$100 – $300',  note: 'Character art, NPC starter pack' },
  { value: '300-700',    range: '$300 – $700',  note: 'Party portrait, NPC campaign, reference sheet' },
  { value: '700-plus',   range: '$700+',        note: 'Action scenes, maps, large commissions' },
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

const STEP_LABELS = [
  { num: 'Step 01', text: 'What you need' },
  { num: 'Step 02', text: 'Tell us about it' },
  { num: 'Step 03', text: 'Your details' },
  { num: 'Step 04', text: 'Review' },
]
const TOTAL = 4

/* ---------- Helpers ---------- */
const findProduct = (bucket: BucketKey | '', productId: string): Product | undefined => {
  if (!bucket) return undefined
  return CATALOG[bucket].products.find((p) => p.id === productId)
}

const productPreviewNote = (p: Product): string => {
  switch (p.mode) {
    case 'range':   return p.rangeNote
    case 'flat':    return p.flatNote
    case 'pack':    return p.packNote
    case 'bundle':  return p.bundleNote
    case 'monthly': return p.monthlyNote
    default:        return ''
  }
}

/* ---------- Bucket icons (V2) ---------- */
const BucketIcon = ({ kind, className = 'w-5 h-5' }: { kind: BucketKey; className?: string }) => {
  if (kind === 'character') return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  )
  if (kind === 'party') return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="8" r="3" />
      <path d="M3 20c0-3 2-5 6-5s6 2 6 5M14 20c0-2 2-4 5-4s3 1 3 4" />
    </svg>
  )
  if (kind === 'gm') return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 19l6-12 6 8 4-5 2 9z" />
    </svg>
  )
  if (kind === 'tokens') return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  )
  /* subscription */
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </svg>
  )
}

const CheckSm = ({ className = 'w-3 h-3' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
)

const ArrowRightSm = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const ArrowLeftSm = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20l9-9-3-3-9 9v3z" />
    <path d="M16 8l-3-3" />
  </svg>
)

const PlusSm = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const XSm = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6l-12 12" />
  </svg>
)

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 text-ink-500" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7L11 7" />
    <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7L13 17" />
  </svg>
)

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-gold-700" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
)

/* ---------- State ---------- */
type FormState = {
  bucket: BucketKey | ''
  product: string
  tier: string
  styles: string[]
  description: string
  references: string[]
  deadline: string
  quantity: string
  notes: string
  name: string
  email: string
  phone: string
  source: string
  budget: string
  budget_notes: string
  termsAccepted: boolean
}

const initialState: FormState = {
  bucket: '',
  product: '',
  tier: '',
  styles: ['painterly'],
  description: '',
  references: ['', ''],
  deadline: '',
  quantity: '1',
  notes: '',
  name: '',
  email: '',
  phone: '',
  source: '',
  budget: '100-300',
  budget_notes: '',
  termsAccepted: false,
}

/* ---------- Reveal animation preset (V2 spec: 8px translate, 280ms, ease-soft) ---------- */
const revealAnim = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
  transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
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

  /* Pre-fill notes when arriving from /availability?month=June etc. */
  useEffect(() => {
    if (monthParam) {
      const m = monthParam.charAt(0).toUpperCase() + monthParam.slice(1)
      setData((d) => ({
        ...d,
        notes: d.notes || `I'd like to reserve a ${m} slot.`,
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
      styles: d.styles.includes(style) ? d.styles.filter((s) => s !== style) : [...d.styles, style],
    }))
  }

  const setReference = (i: number, value: string) => {
    setData((d) => ({ ...d, references: d.references.map((r, idx) => (idx === i ? value : r)) }))
  }

  const addReference = () => {
    if (data.references.length >= 5) return
    setData((d) => ({ ...d, references: [...d.references, ''] }))
  }

  const removeReference = (i: number) => {
    if (data.references.length <= 1) {
      setData((d) => ({ ...d, references: [''] }))
      return
    }
    setData((d) => ({ ...d, references: d.references.filter((_, idx) => idx !== i) }))
  }

  /* ---------- V2 Step 1 handlers ---------- */
  const pickBucket = (b: BucketKey) => {
    setData((d) => ({ ...d, bucket: b, product: '', tier: '' }))
    setErrors((e) => ({ ...e, bucket: '', product: '', tier: '' }))
  }

  const pickProduct = (productId: string) => {
    const p = findProduct(data.bucket, productId)
    if (!p) return
    setData((d) => ({ ...d, product: productId, tier: '' }))
    setErrors((e) => ({ ...e, product: '', tier: '' }))
  }

  const pickTier = (tierId: string) => {
    setData((d) => ({ ...d, tier: tierId }))
    setErrors((e) => ({ ...e, tier: '' }))
  }

  /* ---------- Validation ---------- */
  const validateStep = (n: number): boolean => {
    const e: Record<string, string> = {}
    if (n === 1) {
      if (!data.bucket) {
        e.bucket = 'Pick a service bucket'
      } else if (!data.product) {
        e.product = 'Pick a product inside that bucket'
      } else {
        const p = findProduct(data.bucket, data.product)
        if (p?.mode === 'tiered' && !data.tier) e.tier = 'Pick a tier'
        if (p?.mode === 'quote') e.product = 'Maps are quote-only. Use the link below to brief on the maps page.'
      }
    }
    if (n === 2 && (!data.description.trim() || data.description.trim().length < 10)) {
      e.description = 'Tell us a bit about the project (at least a sentence)'
    }
    if (n === 3) {
      if (!data.name.trim()) e.name = 'Your name is required'
      if (!data.email.trim()) e.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Invalid email'
    }
    if (n === 4 && !data.termsAccepted) e.termsAccepted = 'Please accept the brief terms to send'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ---------- Navigation ---------- */
  const goNext = async () => {
    if (!validateStep(step)) return
    if (step < TOTAL) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    /* Final submit */
    setSubmitting(true)
    setSubmitError(null)
    try {
      /* Build a service_type string from bucket/product/tier so the existing
       * /api/order endpoint (single string column) keeps working. Format:
       *   bucket/product[/tier]
       * Admin can split on `/` to recover the parts. */
      const tierSuffix = data.tier ? `/${data.tier}` : ''
      const serviceType = `${data.bucket}/${data.product}${tierSuffix}`

      /* Prepend the budget context to notes so the API folds it into
       * internal_notes (route.ts inlines `Client notes: ${notes}` already). */
      const notesPayload = [
        data.budget_notes.trim() ? `[Budget context]\n${data.budget_notes.trim()}` : '',
        data.notes.trim(),
      ].filter(Boolean).join('\n\n') || undefined

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: data.name,
          customer_email: data.email,
          customer_phone: data.phone || undefined,
          service_type: serviceType,
          style: data.styles.length ? data.styles.join(', ') : undefined,
          description: data.description,
          reference_links: data.references.filter(Boolean).join('\n') || undefined,
          budget: data.budget || undefined,
          deadline: data.deadline || undefined,
          quantity: data.quantity || undefined,
          notes: notesPayload,
          source: data.source || undefined,
        }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSubmitError(body.error || 'Something went wrong. Please try again.')
        setSubmitting(false)
        return
      }
      router.push('/order/success')
    } catch {
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

  const jumpTo = (n: number) => {
    setStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ---------- Derived ---------- */
  const selectedBucket = data.bucket ? CATALOG[data.bucket] : null
  const selectedProduct = findProduct(data.bucket, data.product)
  const selectedTier =
    selectedProduct?.mode === 'tiered'
      ? selectedProduct.tiers.find((t) => t.id === data.tier)
      : undefined

  const selectedBudget = BUDGETS.find((b) => b.value === data.budget)
  const selectedStyles = data.styles.map((v) => STYLES.find((s) => s.value === v)?.label).filter(Boolean) as string[]
  const formattedDeadline = data.deadline
    ? new Date(data.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''
  const nonEmptyRefs = data.references.filter(Boolean)
  const quantityLabel = QUANTITIES.find((q) => q.value === data.quantity)?.label

  /* Review-card "Service" line, e.g. "Character work · Character Portrait · Standard $90" */
  const serviceReviewLine = (() => {
    if (!selectedBucket || !selectedProduct) return '—'
    const parts = [selectedBucket.label, selectedProduct.name]
    if (selectedTier) parts.push(`${selectedTier.name} · ${selectedTier.price}`)
    else if (selectedProduct.mode !== 'tiered' && selectedProduct.mode !== 'quote') {
      parts.push(productPreviewNote(selectedProduct))
    }
    return parts.join(' · ')
  })()

  return (
    <>
      {/* ============== HERO + PROGRESS ============== */}
      <section className="px-6 lg:px-12 pt-12 pb-10 text-center max-w-[1200px] mx-auto">
        <span className="inline-block font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-gold-700 mb-4">
          Commission brief
        </span>
        <h1
          className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight mb-4 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
          style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}
        >
          Tell us about your <em>commission</em>
        </h1>
        <p className="text-lg text-ink-500 leading-[1.65] mx-auto max-w-[60ch] mb-12">
          Four short steps. Takes about 3 minutes. We respond within 48 hours with a fixed quote, no commitment until you&rsquo;re ready.
        </p>

        {/* Progress indicator — 4 numbered dots with connecting lines */}
        <nav aria-label="Form progress" className="mx-auto max-w-[760px]">
          <div className="flex items-start justify-between gap-2">
            {STEP_LABELS.map((label, i) => {
              const n = i + 1
              const isActive = n === step
              const isDone = n < step
              return (
                <div key={label.num} className="flex items-start flex-1 min-w-0">
                  {/* Step block */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <div
                      className={cn(
                        'w-9 h-9 rounded-full inline-flex items-center justify-center font-display text-sm font-semibold transition-all',
                        isDone && 'bg-burgundy-700 text-cream-50',
                        isActive && 'bg-burgundy-700 text-cream-50 ring-4 ring-burgundy-700/20',
                        !isDone && !isActive && 'bg-parchment-50 border-[1.5px] border-border-light text-ink-500',
                      )}
                    >
                      {isDone ? <CheckSm className="w-4 h-4" /> : n}
                    </div>
                    <div className="hidden sm:flex flex-col items-center gap-0.5">
                      <span className="font-body text-[0.6875rem] font-bold tracking-[0.15em] uppercase text-ink-500">
                        {label.num}
                      </span>
                      <span
                        className={cn(
                          'font-body text-[0.8125rem] font-medium',
                          (isActive || isDone) ? 'text-burgundy-700 font-semibold' : 'text-ink-500',
                        )}
                      >
                        {label.text}
                      </span>
                    </div>
                  </div>
                  {/* Connecting line */}
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-[2px] mt-[18px] mx-2 sm:mx-3 transition-colors',
                        isDone ? 'bg-burgundy-700' : 'bg-border-light',
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </nav>
      </section>

      {/* ============== MAIN: form + sidebar ============== */}
      <section className="px-6 lg:px-12 pb-24 max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-14 items-start">

          {/* FORM CARD — .of-form-card */}
          <div className="bg-parchment-100 border border-border-light rounded-2xl p-6 md:p-12 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >

                {/* ============== STEP 1 — V2 bucket → product → tier ============== */}
                {step === 1 && (
                  <>
                    <div className="pb-5 mb-7 border-b border-border-light">
                      <div className="font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-gold-700 mb-2">
                        Step 01 of 04
                      </div>
                      <h2 className="font-display text-[2rem] font-semibold text-ink-900 leading-[1.15] tracking-tight mb-2 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700">
                        What do you <em>need</em>?
                      </h2>
                      <p className="text-[1.0625rem] text-ink-500 leading-[1.6] max-w-[56ch]">
                        Pick a service bucket. We&rsquo;ll narrow it down to the specific product in two clicks.
                      </p>
                    </div>

                    {/* Crumb trail: bucket › product › tier (text-arrow chevrons per spec) */}
                    <div className="flex flex-wrap items-center gap-3 text-[0.8125rem] text-ink-500 mb-6">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5',
                          !selectedBucket && 'text-ink-300',
                        )}
                      >
                        <strong
                          className={cn(
                            'font-display font-semibold',
                            selectedBucket ? 'text-ink-900' : 'text-ink-300 font-medium',
                          )}
                        >
                          {selectedBucket ? selectedBucket.label : 'Pick a bucket'}
                        </strong>
                      </span>
                      <span aria-hidden="true" className="text-ink-300">›</span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5',
                          !selectedProduct && 'text-ink-300',
                        )}
                      >
                        <strong
                          className={cn(
                            'font-display font-semibold',
                            selectedProduct ? 'text-ink-900' : 'text-ink-300 font-medium',
                          )}
                        >
                          {selectedProduct ? selectedProduct.name : 'Pick a product'}
                        </strong>
                      </span>
                      <span aria-hidden="true" className="text-ink-300">›</span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5',
                          !(selectedTier || (selectedProduct && selectedProduct.mode !== 'tiered' && selectedProduct.mode !== 'quote')) &&
                            'text-ink-300',
                        )}
                      >
                        <strong
                          className={cn(
                            'font-display font-semibold',
                            (selectedTier || (selectedProduct && selectedProduct.mode !== 'tiered' && selectedProduct.mode !== 'quote'))
                              ? 'text-ink-900'
                              : 'text-ink-300 font-medium',
                          )}
                        >
                          {selectedTier
                            ? `${selectedTier.name} · ${selectedTier.price}`
                            : selectedProduct && selectedProduct.mode !== 'tiered' && selectedProduct.mode !== 'quote'
                              ? 'Ready'
                              : 'Pick a tier'}
                        </strong>
                      </span>
                    </div>

                    {/* ============ 1. BUCKET GRID ============ */}
                    <div className="mb-7">
                      <div className="font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700 mb-1">
                        Service bucket
                      </div>
                      <p className="text-sm text-ink-500 mb-4">
                        Five buckets, plus commercial which has its own landing page.
                      </p>

                      {/* 3-col desktop with row-2 = [card-4 spans col-1][card-5 spans col-2&3].
                          2-col tablet (card-5 spans 2). 1-col mobile. */}
                      <div
                        className={cn(
                          'grid gap-3 sm:gap-4',
                          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
                          '[&>*:nth-child(4)]:sm:col-auto [&>*:nth-child(4)]:lg:col-start-1 [&>*:nth-child(4)]:lg:col-end-2',
                          '[&>*:nth-child(5)]:sm:col-span-2 [&>*:nth-child(5)]:lg:col-start-2 [&>*:nth-child(5)]:lg:col-end-4',
                        )}
                        role="radiogroup"
                        aria-label="Service bucket"
                      >
                        {BUCKET_ORDER.map((key) => {
                          const meta = CATALOG[key]
                          const checked = data.bucket === key
                          return (
                            <label
                              key={key}
                              className={cn(
                                'relative cursor-pointer rounded-xl p-5 transition-all flex flex-col gap-3 min-h-[188px] bg-parchment-50',
                                checked
                                  ? 'border-[1.5px] border-burgundy-700 shadow-[0_0_0_3px_rgba(107,31,42,0.12),0_4px_16px_rgba(0,0,0,0.08)]'
                                  : 'border-[1.5px] border-border-light hover:border-border-medium hover:-translate-y-0.5 hover:shadow-md',
                              )}
                            >
                              <input
                                type="radio"
                                name="bucket"
                                value={key}
                                checked={checked}
                                onChange={() => pickBucket(key)}
                                className="sr-only"
                              />
                              {/* Check chip */}
                              <span
                                className={cn(
                                  'absolute top-3.5 right-3.5 w-[22px] h-[22px] rounded-full inline-flex items-center justify-center transition-all',
                                  checked ? 'bg-burgundy-700 text-cream-50 opacity-100 scale-100' : 'opacity-0 scale-50',
                                )}
                                aria-hidden="true"
                              >
                                <CheckSm className="w-3 h-3" />
                              </span>
                              {/* Solid burgundy icon block — flips to gold when checked */}
                              <span
                                className={cn(
                                  'inline-flex w-10 h-10 rounded-md items-center justify-center mb-1 transition-colors',
                                  checked
                                    ? 'bg-gold-500 text-ink-900'
                                    : 'bg-burgundy-700 text-cream-50',
                                )}
                              >
                                <BucketIcon kind={key} />
                              </span>
                              <span className="font-display text-[1.25rem] font-semibold text-ink-900 leading-tight tracking-tight">
                                {meta.cardName}
                              </span>
                              <span className="text-[0.8125rem] text-ink-500 leading-[1.45]">
                                {meta.desc}
                              </span>
                              <span className="mt-auto pt-2.5 border-t border-dashed border-border-light font-body text-[0.6875rem] tracking-[0.04em] text-ink-500 leading-[1.4]">
                                <strong className="font-semibold text-ink-700">{meta.countLine}</strong> · {meta.fromLine}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                      {errors.bucket && (
                        <p className="text-sm text-burgundy-700 mt-3">{errors.bucket}</p>
                      )}

                      {/* Commercial nudge */}
                      <div className="mt-5 px-[18px] py-[14px] rounded-md bg-parchment-100 border border-dashed border-border-medium text-[0.875rem] text-ink-700">
                        <strong className="font-semibold">Doing commercial work?</strong>{' '}
                        Publishers, indie game studios, and Kickstarter campaigns start at the{' '}
                        <Link
                          href="/commercial"
                          className="text-burgundy-700 underline underline-offset-[3px] hover:text-burgundy-500"
                        >
                          commercial landing page
                        </Link>{' '}
                        instead.
                      </div>
                    </div>

                    {/* ============ 2. REVEAL — PRODUCT CHIPS + TIER PICKER ============ */}
                    <AnimatePresence initial={false} mode="wait">
                      {selectedBucket && (
                        <motion.div
                          key={`reveal-${data.bucket}`}
                          {...revealAnim}
                          className="mt-8"
                        >
                          {/* Product picker head */}
                          <div className="flex items-baseline justify-between gap-5 mb-4 pb-3.5 border-b border-dashed border-border-light">
                            <h3 className="font-display text-[1.25rem] font-semibold text-ink-900">
                              Now pick a{' '}
                              <em className="not-italic font-display italic font-medium text-burgundy-700">
                                {selectedBucket.label}
                              </em>
                            </h3>
                            <span className="text-[0.8125rem] text-ink-500">{selectedBucket.helper}</span>
                          </div>

                          {/* Product chips */}
                          <div
                            className="flex flex-wrap gap-2.5"
                            role="radiogroup"
                            aria-label="Product within bucket"
                          >
                            {selectedBucket.products.map((p) => {
                              const checked = data.product === p.id
                              return (
                                <label key={p.id} className="relative cursor-pointer">
                                  <input
                                    type="radio"
                                    name="product-pick"
                                    value={p.id}
                                    checked={checked}
                                    onChange={() => pickProduct(p.id)}
                                    className="sr-only"
                                  />
                                  <span
                                    className={cn(
                                      'inline-flex items-center gap-2.5 px-[18px] py-3 rounded-full border-[1.5px] transition-all font-body text-[0.9375rem]',
                                      checked
                                        ? 'bg-burgundy-700 border-burgundy-700 text-cream-50 shadow-[0_4px_12px_rgba(107,31,42,0.18)]'
                                        : 'bg-parchment-50 border-border-medium text-ink-700 hover:border-burgundy-700 hover:text-ink-900',
                                    )}
                                  >
                                    <span>{p.name}</span>
                                    <small
                                      className={cn(
                                        'text-[0.75rem] font-medium',
                                        checked ? 'text-gold-300' : 'text-ink-500',
                                      )}
                                    >
                                      {p.sub}
                                    </small>
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                          {errors.product && (
                            <p className="text-sm text-burgundy-700 mt-3">{errors.product}</p>
                          )}

                          {/* ===== Mode-aware second-level UI ===== */}
                          <AnimatePresence initial={false} mode="wait">
                            {selectedProduct && (
                              <motion.div
                                key={`mode-${selectedProduct.id}`}
                                {...revealAnim}
                                transition={{ ...revealAnim.transition, duration: 0.24 }}
                                className="mt-6"
                              >
                                {/* --- Tiered product: 3-up tier grid --- */}
                                {selectedProduct.mode === 'tiered' && (
                                  <>
                                    <div className="flex items-baseline justify-between gap-5 mb-4 pb-3.5 border-b border-dashed border-border-light">
                                      <h3 className="font-display text-[1.25rem] font-semibold text-ink-900">
                                        And the <em className="not-italic font-display italic font-medium text-burgundy-700">tier</em>?
                                      </h3>
                                      <span className="text-[0.8125rem] text-ink-500">Same character, different finish.</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      {selectedProduct.tiers.map((t) => {
                                        const checked = data.tier === t.id
                                        return (
                                          <label
                                            key={t.id}
                                            className={cn(
                                              'relative cursor-pointer rounded-lg p-[18px_20px] flex flex-col gap-1 transition-all bg-parchment-50',
                                              checked
                                                ? t.featured
                                                  ? 'border-[1.5px] border-gold-500 bg-parchment-100 shadow-[0_0_0_3px_var(--gold-100,rgba(232,200,128,0.3))]'
                                                  : 'border-[1.5px] border-burgundy-700 bg-parchment-100 shadow-[0_0_0_3px_rgba(107,31,42,0.12)]'
                                                : 'border-[1.5px] border-border-medium hover:border-burgundy-700',
                                            )}
                                          >
                                            <input
                                              type="radio"
                                              name="tier-pick"
                                              value={t.id}
                                              checked={checked}
                                              onChange={() => pickTier(t.id)}
                                              className="sr-only"
                                            />
                                            {t.featured && (
                                              <span className="absolute -top-2.5 right-3.5 bg-gold-500 text-ink-900 text-[0.625rem] font-bold tracking-[0.1em] uppercase px-2.5 py-1 rounded-full">
                                                Most picked
                                              </span>
                                            )}
                                            <span className="font-display text-[1.0625rem] font-semibold text-ink-900">
                                              {t.name}
                                            </span>
                                            <span className="font-display text-[1.5rem] font-semibold text-burgundy-700 tracking-tight">
                                              {t.price}
                                            </span>
                                            <span className="text-[0.8125rem] text-ink-500 leading-[1.45]">
                                              {t.note}
                                            </span>
                                          </label>
                                        )
                                      })}
                                    </div>
                                    {errors.tier && (
                                      <p className="text-sm text-burgundy-700 mt-3">{errors.tier}</p>
                                    )}
                                    {selectedProduct.footnote && (
                                      <p className="mt-3 text-[0.8125rem] italic text-ink-500">
                                        {selectedProduct.footnote}
                                      </p>
                                    )}
                                  </>
                                )}

                                {/* --- Quote-only product (battle map / world map): deep-link --- */}
                                {selectedProduct.mode === 'quote' && (
                                  <div className="px-[18px] py-[14px] rounded-md bg-parchment-100 border border-dashed border-border-medium text-[0.875rem] text-ink-700">
                                    {selectedProduct.quoteNote}{' '}
                                    <Link
                                      href={selectedProduct.href}
                                      className="text-burgundy-700 underline underline-offset-[3px] hover:text-burgundy-500 font-semibold"
                                    >
                                      Go to the maps brief →
                                    </Link>
                                  </div>
                                )}

                                {/* --- Range / Flat / Pack / Bundle / Monthly: inline preview --- */}
                                {selectedProduct.mode !== 'tiered' && selectedProduct.mode !== 'quote' && (
                                  <div className="px-[18px] py-[14px] rounded-md bg-parchment-100 border border-dashed border-border-medium text-[0.875rem] text-ink-700">
                                    <strong className="font-semibold text-ink-900">{selectedProduct.name}:</strong>{' '}
                                    {productPreviewNote(selectedProduct)}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Style chips — still on Step 1 */}
                    <div className="mt-9">
                      <div className="font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700 mb-1">
                        Style preference
                      </div>
                      <p className="text-sm text-ink-500 mb-4">
                        Optional. The studio will discuss style in detail before starting.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {STYLES.map((s) => {
                          const checked = data.styles.includes(s.value)
                          return (
                            <button
                              key={s.value}
                              type="button"
                              onClick={() => toggleStyle(s.value)}
                              className={cn(
                                'inline-flex items-center gap-2 px-4 py-2 rounded-full border-[1.5px] font-body text-[0.8125rem] font-medium transition-all',
                                checked
                                  ? 'bg-burgundy-700 border-burgundy-700 text-cream-50'
                                  : 'bg-parchment-50 border-border-light text-ink-700 hover:border-border-medium',
                              )}
                            >
                              {checked && <CheckSm />}
                              {s.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* ============== STEP 2 ============== */}
                {step === 2 && (
                  <>
                    <div className="pb-5 mb-9 border-b border-border-light">
                      <div className="font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-gold-700 mb-2">
                        Step 02 of 04
                      </div>
                      <h2 className="font-display text-[2rem] font-semibold text-ink-900 leading-[1.15] tracking-tight mb-2 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700">
                        Tell us about <em>it</em>
                      </h2>
                      <p className="text-[1.0625rem] text-ink-500 leading-[1.6] max-w-[56ch]">
                        The more specific, the better the brief. Include species, class, vibe, key features, whatever makes them theirs.
                      </p>
                    </div>

                    {/* Description with counter */}
                    <div className="mb-9">
                      <label htmlFor="of-desc" className="block font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700 mb-2">
                        Project description
                      </label>
                      <div className="relative">
                        <textarea
                          id="of-desc"
                          value={data.description}
                          onChange={(e) => set('description', e.target.value)}
                          maxLength={1500}
                          placeholder="e.g. Lyra Vexweaver — tiefling sorceress, level 9. Tall, lean, soft purple skin with darker freckles, gold horns swept back. Wears a tattered violet robe with constellations stitched in silver thread. Holds a glass orb that catches the light. Painterly style, warm dramatic lighting, dark mossy forest in the background. Vibe: melancholy but powerful — she's just lost her familiar."
                          className={cn(
                            'w-full bg-parchment-50 border-[1.5px] rounded-md px-4 py-3 pr-24 font-body text-[1rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors min-h-[180px] resize-y',
                            errors.description ? 'border-burgundy-500' : 'border-border-light',
                          )}
                        />
                        <div className="absolute bottom-3 right-4 font-body text-xs text-ink-400 tabular-nums">
                          {data.description.length} / 1500
                        </div>
                      </div>
                      {errors.description && <p className="text-sm text-burgundy-700 mt-2">{errors.description}</p>}
                    </div>

                    {/* References list with add/remove */}
                    <div className="mb-9">
                      <div className="font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700 mb-1">
                        References (up to 5)
                      </div>
                      <p className="text-sm text-ink-500 mb-4">
                        Pinterest boards, ArtStation, mood images, or other character portraits you love. Helps us nail the vibe faster.
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {data.references.map((ref, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="flex-shrink-0 inline-flex w-10 h-10 rounded-md bg-parchment-50 border border-border-light items-center justify-center">
                              <LinkIcon />
                            </span>
                            <input
                              type="url"
                              value={ref}
                              onChange={(e) => setReference(i, e.target.value)}
                              placeholder="https://"
                              className="flex-1 bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-2.5 font-body text-[0.9375rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => removeReference(i)}
                              aria-label="Remove reference"
                              className="flex-shrink-0 inline-flex w-9 h-9 rounded-md text-ink-500 hover:text-burgundy-700 hover:bg-parchment-50 items-center justify-center transition-colors"
                            >
                              <XSm />
                            </button>
                          </div>
                        ))}
                      </div>
                      {data.references.length < 5 && (
                        <button
                          type="button"
                          onClick={addReference}
                          className="inline-flex items-center gap-2 mt-3 font-body text-[0.8125rem] font-semibold text-burgundy-700 hover:text-burgundy-500 transition-colors"
                        >
                          <PlusSm /> Add another reference
                        </button>
                      )}
                    </div>

                    {/* Deadline + Quantity row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-9">
                      <div>
                        <label htmlFor="of-deadline" className="block font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700 mb-2">
                          Preferred deadline <span className="font-normal text-ink-400 normal-case tracking-normal">optional</span>
                        </label>
                        <input
                          id="of-deadline"
                          type="date"
                          value={data.deadline}
                          onChange={(e) => set('deadline', e.target.value)}
                          className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-2.5 font-body text-[0.9375rem] text-ink-900 focus:outline-none focus:border-burgundy-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="of-qty" className="block font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700 mb-2">
                          Quantity
                        </label>
                        <div className="relative">
                          <select
                            id="of-qty"
                            value={data.quantity}
                            onChange={(e) => set('quantity', e.target.value)}
                            className="w-full appearance-none bg-parchment-50 border-[1.5px] border-border-light rounded-md pl-4 pr-10 py-2.5 font-body text-[0.9375rem] text-ink-900 cursor-pointer focus:outline-none focus:border-burgundy-500 transition-colors"
                          >
                            {QUANTITIES.map((q) => (
                              <option key={q.value} value={q.value}>{q.label}</option>
                            ))}
                          </select>
                          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Notes textarea */}
                    <div>
                      <label htmlFor="of-notes" className="block font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700 mb-2">
                        Anything else? <span className="font-normal text-ink-400 normal-case tracking-normal">optional</span>
                      </label>
                      <textarea
                        id="of-notes"
                        value={data.notes}
                        onChange={(e) => set('notes', e.target.value)}
                        placeholder="Surprise gift? Specific delivery date? Layered PSD needed? Tell us here."
                        className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-3 font-body text-[1rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors min-h-[100px] resize-y"
                      />
                    </div>
                  </>
                )}

                {/* ============== STEP 3 ============== */}
                {step === 3 && (
                  <>
                    <div className="pb-5 mb-9 border-b border-border-light">
                      <div className="font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-gold-700 mb-2">
                        Step 03 of 04
                      </div>
                      <h2 className="font-display text-[2rem] font-semibold text-ink-900 leading-[1.15] tracking-tight mb-2 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700">
                        Your <em>details</em>
                      </h2>
                      <p className="text-[1.0625rem] text-ink-500 leading-[1.6] max-w-[56ch]">
                        So we can send the quote. We never share your details, ever. See our{' '}
                        <Link href="/privacy" className="text-burgundy-700 border-b border-gold-500 hover:text-burgundy-500">privacy policy</Link>.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                      <div>
                        <label htmlFor="of-name" className="block font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700 mb-2">
                          Your name
                        </label>
                        <input
                          id="of-name"
                          type="text"
                          value={data.name}
                          onChange={(e) => set('name', e.target.value)}
                          placeholder="Aria Mendel"
                          autoComplete="name"
                          required
                          className={cn(
                            'w-full bg-parchment-50 border-[1.5px] rounded-md px-4 py-2.5 font-body text-[0.9375rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors',
                            errors.name ? 'border-burgundy-500' : 'border-border-light',
                          )}
                        />
                        {errors.name && <p className="text-sm text-burgundy-700 mt-1.5">{errors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="of-email" className="block font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700 mb-2">
                          Email
                        </label>
                        <input
                          id="of-email"
                          type="email"
                          value={data.email}
                          onChange={(e) => set('email', e.target.value)}
                          placeholder="aria@example.com"
                          autoComplete="email"
                          required
                          className={cn(
                            'w-full bg-parchment-50 border-[1.5px] rounded-md px-4 py-2.5 font-body text-[0.9375rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors',
                            errors.email ? 'border-burgundy-500' : 'border-border-light',
                          )}
                        />
                        {errors.email && <p className="text-sm text-burgundy-700 mt-1.5">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-9">
                      <div>
                        <label htmlFor="of-phone" className="block font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700 mb-2">
                          Phone <span className="font-normal text-ink-400 normal-case tracking-normal">optional</span>
                        </label>
                        <input
                          id="of-phone"
                          type="tel"
                          value={data.phone}
                          onChange={(e) => set('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          autoComplete="tel"
                          className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-2.5 font-body text-[0.9375rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label htmlFor="of-source" className="block font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700 mb-2">
                          How did you find us?
                        </label>
                        <div className="relative">
                          <select
                            id="of-source"
                            value={data.source}
                            onChange={(e) => set('source', e.target.value)}
                            className="w-full appearance-none bg-parchment-50 border-[1.5px] border-border-light rounded-md pl-4 pr-10 py-2.5 font-body text-[0.9375rem] text-ink-900 cursor-pointer focus:outline-none focus:border-burgundy-500 transition-colors"
                          >
                            <option value="">Choose one…</option>
                            {SOURCES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Budget cards */}
                    <div>
                      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                        <div className="font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700">
                          Budget range
                        </div>
                        <USDDisclaimer variant="inline" />
                      </div>
                      <p className="text-sm text-ink-500 mb-4">
                        Helps us match scope to what you&rsquo;d like to invest. We&rsquo;ll confirm in the quote.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {BUDGETS.map((b) => {
                          const checked = data.budget === b.value
                          return (
                            <label
                              key={b.value}
                              className={cn(
                                'cursor-pointer rounded-lg p-4 text-center bg-parchment-50 transition-all',
                                checked
                                  ? 'border-[1.5px] border-burgundy-700 shadow-[0_4px_16px_rgba(107,31,42,0.12)]'
                                  : 'border-[1.5px] border-border-light hover:border-border-medium',
                              )}
                            >
                              <input
                                type="radio"
                                name="budget"
                                value={b.value}
                                checked={checked}
                                onChange={() => set('budget', b.value)}
                                className="sr-only"
                              />
                              <div className="font-display text-[1rem] font-semibold text-ink-900">{b.range}</div>
                              <div className="text-xs text-ink-500 mt-1">{b.note}</div>
                            </label>
                          )
                        })}
                      </div>
                    </div>

                    {/* Budget context textarea (V2 addition) — uppercase .of-label style,
                        matches the rest of the form's "label + optional inline" pattern. */}
                    <div className="mt-6">
                      <label
                        htmlFor="of-budget-context"
                        className="block font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-ink-700 mb-2"
                      >
                        Anything else about your budget?{' '}
                        <span className="font-normal text-ink-400 normal-case tracking-normal">optional</span>
                      </label>
                      <p className="text-[0.8125rem] text-ink-500 leading-[1.5] mb-2.5">
                        Returning client, student, multi-piece commission, gift, charity, anything else worth knowing. The studio reads this before quoting and may offer a custom arrangement.
                      </p>
                      <textarea
                        id="of-budget-context"
                        value={data.budget_notes}
                        onChange={(e) => set('budget_notes', e.target.value)}
                        placeholder="e.g. This is my fourth commission this year and I'm hoping to bundle this with a token pack. Or: I'm a student, but I've been saving for this since the campaign started."
                        className="w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-4 py-3 font-body text-[0.9375rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 transition-colors min-h-[88px] resize-y"
                      />
                    </div>
                  </>
                )}

                {/* ============== STEP 4 — REVIEW ============== */}
                {step === 4 && (
                  <>
                    <div className="pb-5 mb-9 border-b border-border-light">
                      <div className="font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-gold-700 mb-2">
                        Step 04 of 04
                      </div>
                      <h2 className="font-display text-[2rem] font-semibold text-ink-900 leading-[1.15] tracking-tight mb-2 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700">
                        Review &amp; <em>send</em>
                      </h2>
                      <p className="text-[1.0625rem] text-ink-500 leading-[1.6] max-w-[56ch]">
                        Quick check, everything look right? Edit any section if not.
                      </p>
                    </div>

                    {/* Review cards */}
                    <div className="flex flex-col gap-4 mb-7">
                      {/* Card 1: What you need */}
                      <ReviewCard title="What you need" onEdit={() => jumpTo(1)}>
                        <Row dt="Service" dd={serviceReviewLine} empty={!selectedProduct} />
                        <Row dt="Style" dd={selectedStyles.length ? selectedStyles.join(' · ') : ''} empty={!selectedStyles.length} />
                      </ReviewCard>

                      {/* Card 2: Project details */}
                      <ReviewCard title="Project details" onEdit={() => jumpTo(2)}>
                        <Row dt="Description" dd={data.description} empty={!data.description} emptyText="No description yet" />
                        <Row
                          dt="References"
                          dd={nonEmptyRefs.length ? nonEmptyRefs.join('\n') : ''}
                          empty={!nonEmptyRefs.length}
                          emptyText="None added"
                        />
                        <Row
                          dt="Deadline"
                          dd={formattedDeadline}
                          empty={!formattedDeadline}
                          emptyText="No deadline set"
                        />
                        <Row dt="Quantity" dd={quantityLabel || '—'} />
                        <Row dt="Notes" dd={data.notes} empty={!data.notes} emptyText="None" />
                      </ReviewCard>

                      {/* Card 3: Your details */}
                      <ReviewCard title="Your details" onEdit={() => jumpTo(3)}>
                        <Row dt="Name" dd={data.name} empty={!data.name} emptyText="—" />
                        <Row dt="Email" dd={data.email} empty={!data.email} emptyText="—" />
                        <Row dt="Phone" dd={data.phone} empty={!data.phone} emptyText="Not provided" />
                        <Row dt="Budget" dd={selectedBudget?.range || '—'} />
                        <Row dt="Budget notes" dd={data.budget_notes} empty={!data.budget_notes} emptyText="None" />
                        <Row dt="How found" dd={data.source} empty={!data.source} emptyText="—" />
                      </ReviewCard>
                    </div>

                    {/* Terms checkbox */}
                    <label className="flex items-start gap-3 px-5 py-4 bg-gold-100 border-l-[3px] border-gold-500 rounded-md cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.termsAccepted}
                        onChange={(e) => set('termsAccepted', e.target.checked)}
                        required
                        className="mt-0.5 w-4 h-4 accent-burgundy-700 cursor-pointer flex-shrink-0"
                      />
                      <span className="text-[0.9375rem] text-ink-700 leading-[1.5]">
                        I understand this is a brief, not a contract. We&rsquo;ll send a fixed quote within 48 hours and nothing is charged until I approve. I&rsquo;ve read the{' '}
                        <Link href="/terms" className="text-burgundy-700 border-b border-gold-500 hover:text-burgundy-500">terms</Link>
                        {' '}and{' '}
                        <Link href="/refunds" className="text-burgundy-700 border-b border-gold-500 hover:text-burgundy-500">refund policy</Link>.
                      </span>
                    </label>
                    {errors.termsAccepted && <p className="text-sm text-burgundy-700 mt-2">{errors.termsAccepted}</p>}

                    {submitError && (
                      <div className="mt-6 px-4 py-3 rounded-md bg-burgundy-100 border border-burgundy-500/30 text-burgundy-700 text-sm">
                        {submitError}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer nav */}
            <div className="flex items-center justify-between gap-4 pt-7 mt-9 border-t border-border-light">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1 || submitting}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-3 rounded-full font-body text-[0.75rem] font-semibold uppercase tracking-[0.12em] transition-colors',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    'text-ink-700 hover:bg-parchment-200',
                  )}
                >
                  <ArrowLeftSm /> Back
                </button>
                <span className="hidden sm:inline-block font-body text-xs text-ink-500">
                  Step <strong className="font-display text-ink-900 font-semibold">{step}</strong> of {TOTAL}
                </span>
              </div>
              <button
                type="button"
                onClick={goNext}
                disabled={submitting}
                className={cn(
                  'inline-flex items-center gap-2 px-7 py-[14px] rounded-full font-body text-xs font-semibold uppercase tracking-[0.12em]',
                  'bg-burgundy-700 text-cream-50 transition-all',
                  'hover:bg-burgundy-500 hover:-translate-y-px hover:shadow-md',
                  'disabled:bg-ink-300 disabled:text-ink-400 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none',
                )}
              >
                {submitting ? 'Sending…' : (step === TOTAL ? 'Send commission brief' : 'Continue')}
                {!submitting && <ArrowRightSm />}
              </button>
            </div>
          </div>

          {/* ============== SIDEBAR ============== */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">

            {/* Card 1: What happens next */}
            <div className="bg-parchment-100 border border-border-light rounded-xl p-7">
              <div className="font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-gold-700 mb-2">
                What happens next
              </div>
              <div className="font-display text-[1.25rem] font-semibold text-ink-900 leading-[1.2] mb-5">
                A clear, honest process, no chasing.
              </div>
              <ol className="flex flex-col gap-4 mb-6">
                {[
                  { strong: 'Within 48 hours', body: 'We review and send a fixed quote with timeline.' },
                  { strong: 'You approve & deposit', body: '30% to hold your slot. Refundable until first sketch.' },
                  { strong: 'Work begins', body: 'Sketches, color blocks, final paint. Updates every 3 days.' },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 inline-flex w-7 h-7 rounded-full bg-burgundy-700 text-cream-50 font-display text-sm font-semibold items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="flex-1">
                      <strong className="block font-display text-[0.9375rem] font-semibold text-ink-900 leading-tight">{s.strong}</strong>
                      <span className="block text-[0.875rem] text-ink-500 leading-[1.5] mt-0.5">{s.body}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="flex items-center gap-3 pt-5 border-t border-border-light">
                <ClockIcon />
                <div>
                  <div className="font-display text-[1.0625rem] font-semibold text-ink-900 leading-tight">48 hours</div>
                  <div className="text-xs text-ink-500">average response time</div>
                </div>
              </div>
            </div>

            {/* Card 2: Recent client (dark tome variant) */}
            <div className="relative bg-tome-950 text-cream-50 border border-tome-950 rounded-xl p-7 overflow-hidden">
              <div className="font-body text-[0.6875rem] font-semibold tracking-[0.18em] uppercase text-gold-glow mb-3">
                Recent client
              </div>
              <blockquote className="font-display italic text-[1.0625rem] leading-[1.45] text-cream-50 mb-5">
                &ldquo;The communication was thoughtful, every revision sharpened the piece. This isn&rsquo;t a transaction, it&rsquo;s a collaboration.&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <span className="flex-shrink-0 inline-flex w-10 h-10 rounded-full bg-gold-500 text-ink-900 font-display text-sm font-semibold items-center justify-center">
                  AM
                </span>
                <div>
                  <div className="font-display text-[0.9375rem] font-semibold text-cream-50 leading-tight">Aria Mendel</div>
                  <div className="text-xs text-cream-200 mt-0.5">Character commission · March 2026</div>
                </div>
              </div>
            </div>

            {/* Card 3: Trust list */}
            <div className="bg-parchment-100 border border-border-light rounded-xl p-7">
              <ul className="flex flex-col gap-3">
                {[
                  'No commitment until you approve',
                  'Refundable deposit until first sketch',
                  'Secure payments via Stripe',
                  '2 revisions baked into every piece',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] text-ink-700">
                    <span className="flex-shrink-0 inline-flex w-5 h-5 rounded-full bg-forest-700/20 text-forest-700 items-center justify-center mt-0.5">
                      <CheckSm />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </aside>
        </div>
      </section>
    </>
  )
}

/* ---------- Review card sub-components ---------- */
function ReviewCard({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-parchment-50 border border-border-light rounded-xl px-6 py-5">
      <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-border-light">
        <div className="font-display text-[1.0625rem] font-semibold text-ink-900">{title}</div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 font-body text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-burgundy-700 hover:text-burgundy-500 transition-colors"
        >
          Edit <EditIcon />
        </button>
      </div>
      <dl className="flex flex-col gap-2">{children}</dl>
    </div>
  )
}

function Row({
  dt,
  dd,
  empty,
  emptyText,
}: {
  dt: string
  dd: string
  empty?: boolean
  emptyText?: string
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 items-baseline">
      <dt className="font-body text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-500">{dt}</dt>
      <dd className={cn('text-[0.9375rem]', empty ? 'text-ink-400 italic' : 'text-ink-900 whitespace-pre-line break-words')}>
        {empty ? (emptyText ?? '—') : dd}
      </dd>
    </div>
  )
}
