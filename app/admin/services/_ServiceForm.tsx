'use client'

/* =====================================================================
   ADMIN · SERVICES — Service editor form.

   Literal port of "Admin Service Editor v2.html" from the Claude Design
   Final / V2 handoff. Replaces the Phase 1 interim that exposed pricing
   payloads as a raw JSON textarea.

   Structure (mirrors the V2 HTML):
   - Top breadcrumb (Services › Bucket label › Product name)
   - Top action bar (Preview placeholder · Save as draft · Publish)
   - Left column (main editor):
       · Identity card  (name, slug, bucket, eyebrow, lede)
       · Pricing card   (8 mode chips that swap per-mode panels)
       · Operational card (turnaround, revisions, resolution)
       · Included grid editor (add/remove rows of {name, body})
       · Examples gallery editor (add/remove rows of {title, meta, gradient})
       · FAQ editor (collapsible-style blocks of {q, a})
       · Long description (markdown)
   - Right sticky sidebar:
       · Visibility (status, homepage, sort, featured order)
       · Bundle linkage (slugs + uplift cents)
       · Genre tags (add-on-Enter chip input)
       · SEO (collapsible details)
       · Save buttons (Publish primary, Save as draft outline)
       · Danger zone (edit mode only)

   8 pricing-mode chips: Tiered / Range / Per-extra / Pack /
   Percentage / Monthly / Flat fee / Quote-only. The V2 HTML comment
   says "7" but the actual `.adm-mode-grid` carries 8 chips and the
   project's PricingMode union likewise has 8 entries, so `flat` lives
   as its own chip (not folded into anything else).

   Per-mode payload state is kept in `pricingByMode` so the user can
   switch chips without losing data for other modes. On submit, only
   the currently-active mode's payload is serialised to `pricing_json`
   in the shape lib/services.ts PricingPayload expects.

   The exported `ServiceFormValues` interface is unchanged from the
   Phase 1 form so the consuming edit page does not need to rewrite
   its (de)serialisation.
   ===================================================================== */

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Save,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Eye,
  Check,
} from 'lucide-react'
import { createService, updateService, deleteService } from './_actions'
import { BUCKETS } from '@/lib/services'

type Mode = 'create' | 'edit'

export interface ServiceFormValues {
  id?: number
  slug: string
  name: string
  bucket: string
  eyebrow: string
  lede: string
  description: string
  pricing_mode: string
  pricing_json: string
  turnaround_low_days: string
  turnaround_high_days: string
  revisions_included: string
  resolution: string
  included_json: string
  examples_json: string
  faq_json: string
  bundle_with_slugs: string
  bundle_uplift_cents: string
  genre_tags: string
  is_published: boolean
  is_featured_homepage: boolean
  featured_order: string
  seo_title: string
  seo_description: string
  sort_order: string
}

/* ---------------------------------------------------------------------
   Pricing mode metadata (chip name + tagline shown under the chip).
   The `value` matches the project's PricingMode union exactly.
   --------------------------------------------------------------------- */

const PRICING_MODES = [
  { value: 'tiered',            name: 'Tiered',             desc: 'Basic / Standard / Premium'  },
  { value: 'range',             name: 'Range',              desc: 'From $X to $Y'                },
  { value: 'per_extra',         name: 'Per-extra',          desc: 'Base + per member'            },
  { value: 'pack_with_qty',     name: 'Pack-with-quantity', desc: 'Multiple qty rows'            },
  { value: 'pct_uplift',        name: 'Percentage uplift',  desc: '+X% of base job'              },
  { value: 'monthly_recurring', name: 'Monthly recurring',  desc: '$X / month'                   },
  { value: 'flat',              name: 'Flat fee',           desc: 'Single price'                 },
  { value: 'quote_only',        name: 'Quote only',         desc: 'No price, CTA target'         },
] as const

/* ---------------------------------------------------------------------
   Per-mode state shapes — these match PricingPayload from lib/services.ts.
   --------------------------------------------------------------------- */

interface TierDraft {
  name: string
  price: string
  best_for: string  // maps to PricingTier.note (we keep the form label "Best for")
  note: string      // small line under price, kept separately to match the design
  features: string[]
  featured: boolean
  flag: string
}

interface RangeDraft       { low: string; high: string; range_note: string }
interface PerExtraDraft    { base: string; base_desc: string; extra_low: string; extra_high: string; extra_label: string }
interface PackEntryDraft   { qty: string; price: string; label: string }
interface PackDraft        { packs: PackEntryDraft[] }
interface PctUpliftDraft   { percent: string; label: string; calculated_on: string; note: string }
interface MonthlyDraft     { monthly_price: string; included: string[]; cadence: string }
interface FlatDraft        { price: string; label: string; note: string }
interface QuoteDraft       { from_price: string; from_label: string; cta_label: string; cta_href: string; why: string }

interface PricingByMode {
  tiered:             TierDraft[]
  range:              RangeDraft
  per_extra:          PerExtraDraft
  pack_with_qty:      PackDraft
  pct_uplift:         PctUpliftDraft
  monthly_recurring:  MonthlyDraft
  flat:               FlatDraft
  quote_only:         QuoteDraft
}

interface IncludedRow { name: string; body: string }
interface ExampleRow  { title: string; meta: string; gradient: string }
interface FaqRow      { q: string; a: string }

/* ---------------------------------------------------------------------
   Defaults — used when the existing payload doesn't match a mode and
   the user switches to it. Matches the placeholders in the V2 HTML.
   --------------------------------------------------------------------- */

const DEFAULT_TIER = (): TierDraft => ({
  name: '',
  price: '',
  best_for: '',
  note: '',
  features: [''],
  featured: false,
  flag: '',
})

const DEFAULT_PRICING: PricingByMode = {
  tiered: [
    { name: 'Basic',    price: '60',  best_for: 'clean and clear', note: 'line + flat color', features: ['Clean line art', 'Flat color, simple shading', 'Plain background', '2 revisions'], featured: false, flag: '' },
    { name: 'Standard', price: '90',  best_for: 'the sweet spot',  note: 'full render',       features: ['Full rendering, light and shadow', 'Textured materials and fabric', 'Suggested setting', '2 revisions'], featured: true, flag: 'Most popular' },
    { name: 'Premium',  price: '140', best_for: 'the showpiece',   note: 'atmospheric',       features: ['High detail, dynamic pose', 'Effects (magic, weather, light)', 'Full atmospheric background'], featured: false, flag: '' },
  ],
  range: { low: '', high: '', range_note: '' },
  per_extra: { base: '', base_desc: '', extra_low: '', extra_high: '', extra_label: '' },
  pack_with_qty: {
    packs: [
      { qty: '5',  price: '220', label: 'NPCs in matching style' },
      { qty: '10', price: '400', label: 'NPCs in matching style' },
    ],
  },
  pct_uplift: { percent: '', label: '', calculated_on: 'Base job price', note: '' },
  monthly_recurring: { monthly_price: '', included: [''], cadence: '' },
  flat: { price: '', label: '', note: '' },
  quote_only: { from_price: '', from_label: '', cta_label: 'Request a quote', cta_href: '', why: '' },
}

/* ---------------------------------------------------------------------
   Parse the existing pricing_json into the per-mode state. We hydrate
   ALL eight modes from the same JSON if the keys are present, so a
   user who flips modes mid-edit doesn't see stale defaults.
   --------------------------------------------------------------------- */

function parsePricingFromJson(json: string): PricingByMode {
  const next: PricingByMode = {
    tiered: DEFAULT_PRICING.tiered.map((t) => ({ ...t, features: [...t.features] })),
    range: { ...DEFAULT_PRICING.range },
    per_extra: { ...DEFAULT_PRICING.per_extra },
    pack_with_qty: { packs: DEFAULT_PRICING.pack_with_qty.packs.map((p) => ({ ...p })) },
    pct_uplift: { ...DEFAULT_PRICING.pct_uplift },
    monthly_recurring: { ...DEFAULT_PRICING.monthly_recurring, included: [...DEFAULT_PRICING.monthly_recurring.included] },
    flat: { ...DEFAULT_PRICING.flat },
    quote_only: { ...DEFAULT_PRICING.quote_only },
  }
  let parsed: Record<string, unknown> | null = null
  try {
    const p = JSON.parse(json)
    if (p && typeof p === 'object') parsed = p as Record<string, unknown>
  } catch {
    return next
  }
  if (!parsed) return next

  if (Array.isArray(parsed.tiers)) {
    next.tiered = (parsed.tiers as Array<Record<string, unknown>>).map((t) => ({
      name:     typeof t.name === 'string' ? t.name : '',
      price:    typeof t.price === 'number' ? String(t.price) : (typeof t.price === 'string' ? t.price : ''),
      best_for: typeof t.note === 'string' ? t.note : '',
      note:     typeof t.price_note === 'string' ? t.price_note : '',
      features: Array.isArray(t.features) ? (t.features as unknown[]).map((x) => String(x)) : [],
      featured: t.featured === true,
      flag:     typeof t.flag === 'string' ? t.flag : '',
    }))
    if (next.tiered.length === 0) next.tiered = [DEFAULT_TIER()]
  }

  if (parsed.range && typeof parsed.range === 'object') {
    const r = parsed.range as Record<string, unknown>
    next.range.low  = numberToString(r.low)
    next.range.high = numberToString(r.high)
    if (typeof r.range_note === 'string') next.range.range_note = r.range_note
  }

  if (parsed.per_extra && typeof parsed.per_extra === 'object') {
    const pe = parsed.per_extra as Record<string, unknown>
    next.per_extra.base        = numberToString(pe.base)
    next.per_extra.extra_low   = numberToString(pe.extra_low)
    next.per_extra.extra_high  = numberToString(pe.extra_high)
    next.per_extra.extra_label = typeof pe.extra_label === 'string' ? pe.extra_label : ''
    next.per_extra.base_desc   = typeof pe.base_desc === 'string' ? pe.base_desc : ''
  }

  if (parsed.pack && typeof parsed.pack === 'object') {
    const pk = parsed.pack as Record<string, unknown>
    if (Array.isArray(pk.packs)) {
      next.pack_with_qty.packs = (pk.packs as Array<Record<string, unknown>>).map((p) => ({
        qty:   numberToString(p.qty),
        price: numberToString(p.price),
        label: typeof p.label === 'string' ? p.label : '',
      }))
    }
  }

  if (parsed.uplift && typeof parsed.uplift === 'object') {
    const up = parsed.uplift as Record<string, unknown>
    next.pct_uplift.percent       = numberToString(up.percent)
    next.pct_uplift.label         = typeof up.label === 'string' ? up.label : ''
    next.pct_uplift.calculated_on = typeof up.calculated_on === 'string' ? up.calculated_on : 'Base job price'
    next.pct_uplift.note          = typeof up.note === 'string' ? up.note : ''
  }

  if (parsed.monthly && typeof parsed.monthly === 'object') {
    const m = parsed.monthly as Record<string, unknown>
    next.monthly_recurring.monthly_price = numberToString(m.monthly_price)
    next.monthly_recurring.included      = Array.isArray(m.included) ? (m.included as unknown[]).map(String) : []
    next.monthly_recurring.cadence       = typeof m.cadence === 'string' ? m.cadence : ''
    if (next.monthly_recurring.included.length === 0) next.monthly_recurring.included = ['']
  }

  if (parsed.flat && typeof parsed.flat === 'object') {
    const f = parsed.flat as Record<string, unknown>
    next.flat.price = numberToString(f.price)
    next.flat.label = typeof f.label === 'string' ? f.label : ''
    next.flat.note  = typeof f.note === 'string' ? f.note : ''
  }

  if (parsed.quote && typeof parsed.quote === 'object') {
    const q = parsed.quote as Record<string, unknown>
    next.quote_only.from_price = numberToString(q.from_price)
    next.quote_only.from_label = typeof q.from_label === 'string' ? q.from_label : ''
    next.quote_only.cta_label  = typeof q.cta_label === 'string' ? q.cta_label : 'Request a quote'
    next.quote_only.cta_href   = typeof q.cta_href === 'string' ? q.cta_href : ''
    next.quote_only.why        = typeof q.why === 'string' ? q.why : ''
  }

  return next
}

function numberToString(v: unknown): string {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  if (typeof v === 'string') return v.trim()
  return ''
}

function parseNumber(v: string): number {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : 0
}

/* ---------------------------------------------------------------------
   Serialise per-mode state to the shape PricingPayload expects.
   Only the currently active mode is written.
   --------------------------------------------------------------------- */

function serialisePricing(mode: string, p: PricingByMode): string {
  switch (mode) {
    case 'tiered': {
      const tiers = p.tiered
        .filter((t) => t.name.trim() !== '' || t.price.trim() !== '' || t.features.some((f) => f.trim() !== ''))
        .map((t) => {
          const tier: Record<string, unknown> = {
            name:     t.name.trim(),
            price:    parseNumber(t.price),
            features: t.features.map((f) => f.trim()).filter(Boolean),
          }
          if (t.best_for.trim()) tier.note       = t.best_for.trim()
          if (t.note.trim())     tier.price_note = t.note.trim()
          if (t.featured)        tier.featured   = true
          if (t.flag.trim())     tier.flag       = t.flag.trim()
          return tier
        })
      return JSON.stringify({ tiers })
    }
    case 'range': {
      const out: Record<string, unknown> = { range: { low: parseNumber(p.range.low), high: parseNumber(p.range.high) } }
      if (p.range.range_note.trim()) (out.range as Record<string, unknown>).range_note = p.range.range_note.trim()
      return JSON.stringify(out)
    }
    case 'per_extra': {
      const pe: Record<string, unknown> = {
        base:       parseNumber(p.per_extra.base),
        extra_low:  parseNumber(p.per_extra.extra_low),
        extra_high: parseNumber(p.per_extra.extra_high),
      }
      if (p.per_extra.extra_label.trim()) pe.extra_label = p.per_extra.extra_label.trim()
      if (p.per_extra.base_desc.trim())   pe.base_desc   = p.per_extra.base_desc.trim()
      return JSON.stringify({ per_extra: pe })
    }
    case 'pack_with_qty': {
      const packs = p.pack_with_qty.packs
        .filter((row) => row.qty.trim() !== '' || row.price.trim() !== '')
        .map((row) => {
          const out: Record<string, unknown> = { qty: parseNumber(row.qty), price: parseNumber(row.price) }
          if (row.label.trim()) out.label = row.label.trim()
          return out
        })
      return JSON.stringify({ pack: { packs } })
    }
    case 'pct_uplift': {
      const up: Record<string, unknown> = { percent: parseNumber(p.pct_uplift.percent) }
      if (p.pct_uplift.label.trim())         up.label         = p.pct_uplift.label.trim()
      if (p.pct_uplift.calculated_on.trim()) up.calculated_on = p.pct_uplift.calculated_on.trim()
      if (p.pct_uplift.note.trim())          up.note          = p.pct_uplift.note.trim()
      return JSON.stringify({ uplift: up })
    }
    case 'monthly_recurring': {
      const m: Record<string, unknown> = {
        monthly_price: parseNumber(p.monthly_recurring.monthly_price),
        included:      p.monthly_recurring.included.map((s) => s.trim()).filter(Boolean),
      }
      if (p.monthly_recurring.cadence.trim()) m.cadence = p.monthly_recurring.cadence.trim()
      return JSON.stringify({ monthly: m })
    }
    case 'flat': {
      const f: Record<string, unknown> = { price: parseNumber(p.flat.price) }
      if (p.flat.label.trim()) f.label = p.flat.label.trim()
      if (p.flat.note.trim())  f.note  = p.flat.note.trim()
      return JSON.stringify({ flat: f })
    }
    case 'quote_only': {
      const q: Record<string, unknown> = {}
      if (p.quote_only.from_price.trim()) q.from_price = parseNumber(p.quote_only.from_price)
      if (p.quote_only.from_label.trim()) q.from_label = p.quote_only.from_label.trim()
      if (p.quote_only.cta_label.trim())  q.cta_label  = p.quote_only.cta_label.trim()
      if (p.quote_only.cta_href.trim())   q.cta_href   = p.quote_only.cta_href.trim()
      if (p.quote_only.why.trim())        q.why        = p.quote_only.why.trim()
      return JSON.stringify({ quote: q })
    }
    default:
      return '{}'
  }
}

/* ---------------------------------------------------------------------
   Included / examples / FAQ array helpers
   --------------------------------------------------------------------- */

function parseIncludedJson(json: string): IncludedRow[] {
  try {
    const arr = JSON.parse(json)
    if (Array.isArray(arr)) {
      return arr.map((x) => ({
        name: typeof x?.name === 'string' ? x.name : '',
        body: typeof x?.body === 'string' ? x.body : '',
      }))
    }
  } catch { /* ignore */ }
  return []
}

function parseExamplesJson(json: string): ExampleRow[] {
  try {
    const arr = JSON.parse(json)
    if (Array.isArray(arr)) {
      return arr.map((x) => ({
        title:    typeof x?.title === 'string' ? x.title : '',
        meta:     typeof x?.meta === 'string' ? x.meta : '',
        gradient: typeof x?.gradient === 'string' ? x.gradient : '',
      }))
    }
  } catch { /* ignore */ }
  return []
}

function parseFaqJson(json: string): FaqRow[] {
  try {
    const arr = JSON.parse(json)
    if (Array.isArray(arr)) {
      return arr.map((x) => ({
        q: typeof x?.q === 'string' ? x.q : '',
        a: typeof x?.a === 'string' ? x.a : '',
      }))
    }
  } catch { /* ignore */ }
  return []
}

/* ---------------------------------------------------------------------
   Utility
   --------------------------------------------------------------------- */

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function bucketLabel(slug: string): string {
  return BUCKETS.find((b) => b.slug === slug)?.label ?? slug
}

/* Genre tag presets shown as toggleable chips in the right sidebar.
   Matches the V2 design exactly; the user can still type custom tags
   via the inline input below. */
const GENRE_TAG_PRESETS = [
  'Fantasy',
  'D&D 5e',
  'Sci-fi',
  'Horror',
  'Cyberpunk',
  'Modern',
  'Historical',
] as const

/* =====================================================================
   COMPONENT
   ===================================================================== */

export default function ServiceForm({
  mode,
  initial,
}: {
  mode: Mode
  initial: ServiceFormValues
}) {
  const [values, setValues] = useState<ServiceFormValues>(initial)
  const [slugTouched, setSlugTouched] = useState(initial.slug !== '' && mode === 'edit')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  /* Per-mode pricing state — hydrated once from initial.pricing_json. */
  const initialPricing = useMemo(() => parsePricingFromJson(initial.pricing_json), [initial.pricing_json])
  const [pricingByMode, setPricingByMode] = useState<PricingByMode>(initialPricing)

  /* Included / examples / FAQ row state. */
  const [included, setIncluded] = useState<IncludedRow[]>(() => {
    const rows = parseIncludedJson(initial.included_json)
    return rows.length > 0 ? rows : [{ name: '', body: '' }]
  })
  const [examples, setExamples] = useState<ExampleRow[]>(() => {
    const rows = parseExamplesJson(initial.examples_json)
    return rows.length > 0 ? rows : [{ title: '', meta: '', gradient: 'from-violet-900 via-purple-700 to-indigo-600' }]
  })
  const [faqs, setFaqs] = useState<FaqRow[]>(() => {
    const rows = parseFaqJson(initial.faq_json)
    return rows.length > 0 ? rows : [{ q: '', a: '' }]
  })

  const update = <K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  /* Genre tags as an array (the underlying field is a comma-separated string). */
  const [genreTagDraft, setGenreTagDraft] = useState('')
  const genreTags = useMemo(
    () => values.genre_tags.split(',').map((s) => s.trim()).filter(Boolean),
    [values.genre_tags],
  )
  const setGenreTags = (next: string[]) => update('genre_tags', next.join(', '))

  const handleName = (value: string) => {
    update('name', value)
    if (!slugTouched) update('slug', slugify(value))
  }

  /* -----------------------------------------------------------------
     Pricing mode chip selection — switch the active mode WITHOUT
     touching the other modes' state.
     ----------------------------------------------------------------- */
  const setPricingMode = (next: string) => update('pricing_mode', next)

  /* Tier helpers */
  const setTier = (idx: number, patch: Partial<TierDraft>) => {
    setPricingByMode((prev) => ({
      ...prev,
      tiered: prev.tiered.map((t, i) => (i === idx ? { ...t, ...patch } : t)),
    }))
  }
  const setTierFeature = (tierIdx: number, featIdx: number, value: string) => {
    setPricingByMode((prev) => ({
      ...prev,
      tiered: prev.tiered.map((t, i) =>
        i === tierIdx ? { ...t, features: t.features.map((f, j) => (j === featIdx ? value : f)) } : t,
      ),
    }))
  }
  const addTierFeature = (tierIdx: number) => {
    setPricingByMode((prev) => ({
      ...prev,
      tiered: prev.tiered.map((t, i) => (i === tierIdx ? { ...t, features: [...t.features, ''] } : t)),
    }))
  }
  const removeTierFeature = (tierIdx: number, featIdx: number) => {
    setPricingByMode((prev) => ({
      ...prev,
      tiered: prev.tiered.map((t, i) =>
        i === tierIdx ? { ...t, features: t.features.filter((_, j) => j !== featIdx) } : t,
      ),
    }))
  }
  const addTier = () => {
    setPricingByMode((prev) => ({ ...prev, tiered: [...prev.tiered, DEFAULT_TIER()] }))
  }
  const removeTier = (idx: number) => {
    setPricingByMode((prev) => ({ ...prev, tiered: prev.tiered.filter((_, i) => i !== idx) }))
  }

  /* Pack helpers */
  const setPackRow = (idx: number, patch: Partial<PackEntryDraft>) => {
    setPricingByMode((prev) => ({
      ...prev,
      pack_with_qty: { packs: prev.pack_with_qty.packs.map((r, i) => (i === idx ? { ...r, ...patch } : r)) },
    }))
  }
  const addPackRow = () => {
    setPricingByMode((prev) => ({
      ...prev,
      pack_with_qty: { packs: [...prev.pack_with_qty.packs, { qty: '', price: '', label: '' }] },
    }))
  }
  const removePackRow = (idx: number) => {
    setPricingByMode((prev) => ({
      ...prev,
      pack_with_qty: { packs: prev.pack_with_qty.packs.filter((_, i) => i !== idx) },
    }))
  }

  /* Included grid rows */
  const setIncludedRow = (idx: number, patch: Partial<IncludedRow>) =>
    setIncluded((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  const addIncludedRow = () => setIncluded((prev) => [...prev, { name: '', body: '' }])
  const removeIncludedRow = (idx: number) => setIncluded((prev) => prev.filter((_, i) => i !== idx))

  /* Examples rows */
  const setExampleRow = (idx: number, patch: Partial<ExampleRow>) =>
    setExamples((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  const addExampleRow = () =>
    setExamples((prev) => [...prev, { title: '', meta: '', gradient: 'from-violet-900 via-purple-700 to-indigo-600' }])
  const removeExampleRow = (idx: number) => setExamples((prev) => prev.filter((_, i) => i !== idx))

  /* FAQ rows */
  const setFaqRow = (idx: number, patch: Partial<FaqRow>) =>
    setFaqs((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
  const addFaqRow = () => setFaqs((prev) => [...prev, { q: '', a: '' }])
  const removeFaqRow = (idx: number) => setFaqs((prev) => prev.filter((_, i) => i !== idx))

  /* Genre tag add / remove */
  const addGenreTag = () => {
    const t = genreTagDraft.trim()
    if (!t) return
    if (genreTags.includes(t)) { setGenreTagDraft(''); return }
    setGenreTags([...genreTags, t])
    setGenreTagDraft('')
  }
  const removeGenreTag = (tag: string) => setGenreTags(genreTags.filter((g) => g !== tag))

  /* -----------------------------------------------------------------
     Submit (publishOverride drives the "Publish changes" vs "Save as
     draft" buttons — both call the same server action).
     ----------------------------------------------------------------- */
  const submit = (publishOverride?: boolean) => {
    setError(null)
    const isPublished = publishOverride === undefined ? values.is_published : publishOverride
    if (publishOverride !== undefined) update('is_published', publishOverride)

    const fd = new FormData()
    if (values.id) fd.set('id', String(values.id))
    fd.set('slug', values.slug)
    fd.set('name', values.name)
    fd.set('bucket', values.bucket)
    fd.set('eyebrow', values.eyebrow)
    fd.set('lede', values.lede)
    fd.set('description', values.description)
    fd.set('pricing_mode', values.pricing_mode)
    fd.set('pricing', serialisePricing(values.pricing_mode, pricingByMode))
    fd.set('turnaround_low_days', values.turnaround_low_days)
    fd.set('turnaround_high_days', values.turnaround_high_days)
    fd.set('revisions_included', values.revisions_included)
    fd.set('resolution', values.resolution)
    fd.set('included', JSON.stringify(included.filter((r) => r.name.trim() || r.body.trim())))
    fd.set('examples', JSON.stringify(examples.filter((r) => r.title.trim() || r.meta.trim())))
    fd.set('faq', JSON.stringify(faqs.filter((r) => r.q.trim() || r.a.trim())))
    fd.set('bundle_with_slugs', values.bundle_with_slugs)
    fd.set('bundle_uplift_cents', values.bundle_uplift_cents)
    fd.set('genre_tags', values.genre_tags)
    if (isPublished) fd.set('is_published', 'on')
    if (values.is_featured_homepage) fd.set('is_featured_homepage', 'on')
    fd.set('featured_order', values.featured_order)
    fd.set('seo_title', values.seo_title)
    fd.set('seo_description', values.seo_description)
    fd.set('sort_order', values.sort_order)

    startTransition(async () => {
      const action = mode === 'create' ? createService : updateService
      const res = await action(fd)
      if (res && 'ok' in res && !res.ok) {
        setError(res.error ?? 'Something went wrong')
      }
    })
  }

  const handleDelete = () => {
    if (!values.id) return
    if (!confirm('Delete this product? This unpublishes it immediately and breaks any direct links. Order history stays intact.')) return
    const fd = new FormData()
    fd.set('id', String(values.id))
    startTransition(async () => {
      const res = await deleteService(fd)
      if (res && 'ok' in res && !res.ok) {
        setError(res.error ?? 'Something went wrong')
      }
    })
  }

  /* =====================================================================
     RENDER
     ===================================================================== */
  return (
    <div>
      {/* Top bar: breadcrumb + meta on the left, action buttons on the right */}
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <nav className="flex items-center gap-2 text-[0.8125rem] text-ink-500 mb-1">
            <Link href="/admin/services" className="text-ink-700 hover:text-burgundy-700 no-underline">
              Services
            </Link>
            <ChevronRight size={12} strokeWidth={1.8} className="text-ink-300" />
            <Link href="/admin/services" className="text-ink-700 hover:text-burgundy-700 no-underline">
              {bucketLabel(values.bucket)}
            </Link>
            <ChevronRight size={12} strokeWidth={1.8} className="text-ink-300" />
            <span>{mode === 'create' ? 'New product' : (values.name || 'Edit product')}</span>
          </nav>
          <h1 className="font-display text-3xl font-semibold text-ink-900 leading-tight">
            {mode === 'create' ? 'New product' : 'Edit product'}
          </h1>
          {mode === 'edit' && (
            <div className="text-[0.8125rem] text-ink-500 mt-1">
              Editing existing product · changes save to the live catalogue
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled
            title="Preview not wired yet"
            className="inline-flex items-center gap-2 bg-transparent text-ink-700 border-[1.5px] border-border-light px-4 py-2 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] opacity-60 cursor-not-allowed"
          >
            <Eye size={14} strokeWidth={1.8} />
            Preview
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-transparent text-ink-700 border-[1.5px] border-border-light px-4 py-2 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] hover:border-burgundy-500 hover:text-burgundy-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-burgundy-700 text-cream-50 px-5 py-2 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] hover:bg-burgundy-500 hover:shadow-md transition-all disabled:bg-ink-300 disabled:cursor-not-allowed"
          >
            <Check size={14} strokeWidth={1.8} />
            {isPending ? 'Saving…' : 'Publish changes'}
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-md bg-burgundy-100 border border-burgundy-700/30 text-burgundy-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-7 items-start">
        {/* =========================================================
             LEFT COLUMN
             ========================================================= */}
        <div className="flex flex-col gap-5">

          {/* Identity */}
          <SvceCard>
            <Field label="Product title">
              <input
                type="text"
                value={values.name}
                onChange={(e) => handleName(e.target.value)}
                placeholder="Character Portrait"
                className={inputClass + ' text-xl font-display font-semibold'}
              />
            </Field>
            <Field label="URL slug">
              <div className="flex items-center bg-parchment-50 border-[1.5px] border-border-light rounded-md overflow-hidden">
                <span className="font-mono text-[0.8125rem] text-ink-500 px-3 py-2.5 bg-parchment-200">
                  /services/{values.bucket}/
                </span>
                <input
                  type="text"
                  value={values.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    update('slug', slugify(e.target.value))
                  }}
                  placeholder="portrait"
                  className="flex-1 bg-transparent px-3 py-2.5 font-mono text-[0.8125rem] text-ink-900 focus:outline-none min-w-0"
                />
              </div>
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1.5">
              <Field label="Bucket" className="mb-0">
                <select
                  value={values.bucket}
                  onChange={(e) => update('bucket', e.target.value)}
                  className={inputClass}
                >
                  {BUCKETS.map((b) => (
                    <option key={b.slug} value={b.slug}>{b.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Eyebrow / one-line subtitle" className="mb-0">
                <input
                  type="text"
                  value={values.eyebrow}
                  onChange={(e) => update('eyebrow', e.target.value)}
                  placeholder="your hero, head to shoulders"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Lead paragraph" className="mb-0 mt-4">
              <textarea
                value={values.lede}
                onChange={(e) => update('lede', e.target.value)}
                rows={3}
                placeholder="The classic. Painted from chest up…"
                className={inputClass + ' min-h-[80px] resize-y'}
              />
            </Field>
          </SvceCard>

          {/* Pricing */}
          <SvceCard>
            <SvceCardHead title="Pricing" hint="Pick a mode, fill the matching inputs" />

            {/* 8 mode chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {PRICING_MODES.map((m) => {
                const isActive = values.pricing_mode === m.value
                return (
                  <button
                    type="button"
                    key={m.value}
                    onClick={() => setPricingMode(m.value)}
                    className={
                      'relative cursor-pointer text-left px-3.5 py-3 rounded-md border-[1.5px] flex flex-col gap-0.5 transition-all bg-parchment-50 ' +
                      (isActive
                        ? 'border-burgundy-700 shadow-[0_0_0_3px_var(--color-burgundy-100)]'
                        : 'border-border-light hover:border-border-medium')
                    }
                  >
                    <span className="font-display text-[0.9375rem] font-semibold text-ink-900">{m.name}</span>
                    <span className="text-[0.6875rem] text-ink-500 leading-snug">{m.desc}</span>
                  </button>
                )
              })}
            </div>

            {/* Panels */}
            <div className="mt-6">
              {values.pricing_mode === 'tiered' && (
                <div className="animate-[adm-fade_200ms_ease-out] space-y-3">
                  {pricingByMode.tiered.map((t, idx) => (
                    <TierBlock
                      key={idx}
                      index={idx}
                      tier={t}
                      onPatch={(patch) => setTier(idx, patch)}
                      onRemove={() => removeTier(idx)}
                      onFeatureChange={(featIdx, value) => setTierFeature(idx, featIdx, value)}
                      onAddFeature={() => addTierFeature(idx)}
                      onRemoveFeature={(featIdx) => removeTierFeature(idx, featIdx)}
                    />
                  ))}
                  <AddRowButton onClick={addTier} label="Add another tier" />
                </div>
              )}

              {values.pricing_mode === 'range' && (
                <div className="animate-[adm-fade_200ms_ease-out] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Low price" className="mb-0">
                      <CurrencyInput
                        value={pricingByMode.range.low}
                        onChange={(v) => setPricingByMode((p) => ({ ...p, range: { ...p.range, low: v } }))}
                        placeholder="250"
                      />
                    </Field>
                    <Field label="High price" className="mb-0">
                      <CurrencyInput
                        value={pricingByMode.range.high}
                        onChange={(v) => setPricingByMode((p) => ({ ...p, range: { ...p.range, high: v } }))}
                        placeholder="450"
                      />
                    </Field>
                  </div>
                  <Field label='Range note (shown next to "From $X" anchor)' className="mb-0">
                    <input
                      type="text"
                      value={pricingByMode.range.range_note}
                      onChange={(e) => setPricingByMode((p) => ({ ...p, range: { ...p.range, range_note: e.target.value } }))}
                      placeholder="scoped per brief"
                      className={inputClass}
                    />
                  </Field>
                </div>
              )}

              {values.pricing_mode === 'per_extra' && (
                <div className="animate-[adm-fade_200ms_ease-out] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Base price" className="mb-0">
                      <CurrencyInput
                        value={pricingByMode.per_extra.base}
                        onChange={(v) => setPricingByMode((p) => ({ ...p, per_extra: { ...p.per_extra, base: v } }))}
                        placeholder="350"
                      />
                    </Field>
                    <Field label="Base description" className="mb-0">
                      <input
                        type="text"
                        value={pricingByMode.per_extra.base_desc}
                        onChange={(e) => setPricingByMode((p) => ({ ...p, per_extra: { ...p.per_extra, base_desc: e.target.value } }))}
                        placeholder="up to 4 members"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Extra member · low" className="mb-0">
                      <CurrencyInput
                        value={pricingByMode.per_extra.extra_low}
                        onChange={(v) => setPricingByMode((p) => ({ ...p, per_extra: { ...p.per_extra, extra_low: v } }))}
                        placeholder="80"
                      />
                    </Field>
                    <Field label="Extra member · high" className="mb-0">
                      <CurrencyInput
                        value={pricingByMode.per_extra.extra_high}
                        onChange={(v) => setPricingByMode((p) => ({ ...p, per_extra: { ...p.per_extra, extra_high: v } }))}
                        placeholder="120"
                      />
                    </Field>
                  </div>
                  <Field label="Extra note (shows below tier card)" className="mb-0">
                    <input
                      type="text"
                      value={pricingByMode.per_extra.extra_label}
                      onChange={(e) => setPricingByMode((p) => ({ ...p, per_extra: { ...p.per_extra, extra_label: e.target.value } }))}
                      placeholder="depending on tier complexity"
                      className={inputClass}
                    />
                  </Field>
                </div>
              )}

              {values.pricing_mode === 'pack_with_qty' && (
                <div className="animate-[adm-fade_200ms_ease-out]">
                  <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700 mb-2.5">
                    Quantity rows (add a row per quantity option)
                  </label>
                  <div className="space-y-2">
                    {pricingByMode.pack_with_qty.packs.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-[80px_1fr_120px_32px] gap-2 items-center">
                        <input
                          type="number"
                          value={row.qty}
                          onChange={(e) => setPackRow(idx, { qty: e.target.value })}
                          placeholder="qty"
                          className={inputClass + ' py-2 font-mono'}
                        />
                        <input
                          type="text"
                          value={row.label}
                          onChange={(e) => setPackRow(idx, { label: e.target.value })}
                          placeholder="label · e.g. NPCs in matching style"
                          className={inputClass + ' py-2'}
                        />
                        <CurrencyInput
                          value={row.price}
                          onChange={(v) => setPackRow(idx, { price: v })}
                          placeholder="220"
                          dense
                        />
                        <IconButton onClick={() => removePackRow(idx)} title="Remove row">
                          <X size={14} strokeWidth={1.8} />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <AddRowButton onClick={addPackRow} label="Add quantity row" />
                  </div>
                </div>
              )}

              {values.pricing_mode === 'pct_uplift' && (
                <div className="animate-[adm-fade_200ms_ease-out] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Percentage uplift" className="mb-0">
                      <SuffixInput
                        value={pricingByMode.pct_uplift.percent}
                        onChange={(v) => setPricingByMode((p) => ({ ...p, pct_uplift: { ...p.pct_uplift, percent: v } }))}
                        suffix="% of base"
                        placeholder="40"
                      />
                    </Field>
                    <Field label="Calculated on" className="mb-0">
                      <select
                        value={pricingByMode.pct_uplift.calculated_on}
                        onChange={(e) => setPricingByMode((p) => ({ ...p, pct_uplift: { ...p.pct_uplift, calculated_on: e.target.value } }))}
                        className={inputClass}
                      >
                        <option>Base job price</option>
                        <option>Tier price</option>
                        <option>Final invoice total</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Customer-facing note" className="mb-0">
                    <textarea
                      value={pricingByMode.pct_uplift.note}
                      onChange={(e) => setPricingByMode((p) => ({ ...p, pct_uplift: { ...p.pct_uplift, note: e.target.value } }))}
                      rows={2}
                      placeholder="e.g. Covers commercial use across the agreed scope. No tiered upgrades."
                      className={inputClass + ' min-h-[60px] resize-y'}
                    />
                  </Field>
                </div>
              )}

              {values.pricing_mode === 'monthly_recurring' && (
                <div className="animate-[adm-fade_200ms_ease-out] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Monthly price" className="mb-0">
                      <CurrencyInput
                        value={pricingByMode.monthly_recurring.monthly_price}
                        onChange={(v) => setPricingByMode((p) => ({ ...p, monthly_recurring: { ...p.monthly_recurring, monthly_price: v } }))}
                        placeholder="30"
                      />
                    </Field>
                    <Field label="Billing cadence note" className="mb-0">
                      <input
                        type="text"
                        value={pricingByMode.monthly_recurring.cadence}
                        onChange={(e) => setPricingByMode((p) => ({ ...p, monthly_recurring: { ...p.monthly_recurring, cadence: e.target.value } }))}
                        placeholder="Ships the 15th of each month"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <Field label="What's included (monthly allotment)" hint="One item per line. Bullets render in the public detail page." className="mb-0">
                    <textarea
                      value={pricingByMode.monthly_recurring.included.join('\n')}
                      onChange={(e) =>
                        setPricingByMode((p) => ({
                          ...p,
                          monthly_recurring: {
                            ...p.monthly_recurring,
                            included: e.target.value.split('\n'),
                          },
                        }))
                      }
                      rows={4}
                      placeholder="e.g. 10 hand-painted tokens · 2 NPC portraits · VTT-ready exports · cancel any cycle"
                      className={inputClass + ' min-h-[80px] resize-y'}
                    />
                  </Field>
                </div>
              )}

              {values.pricing_mode === 'flat' && (
                <div className="animate-[adm-fade_200ms_ease-out] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Flat price" className="mb-0">
                      <CurrencyInput
                        value={pricingByMode.flat.price}
                        onChange={(v) => setPricingByMode((p) => ({ ...p, flat: { ...p.flat, price: v } }))}
                        placeholder="180"
                      />
                    </Field>
                    <Field label="Per-unit label" className="mb-0">
                      <input
                        type="text"
                        value={pricingByMode.flat.label}
                        onChange={(e) => setPricingByMode((p) => ({ ...p, flat: { ...p.flat, label: e.target.value } }))}
                        placeholder="e.g. per token, per pack"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <Field label="Customer note" className="mb-0">
                    <input
                      type="text"
                      value={pricingByMode.flat.note}
                      onChange={(e) => setPricingByMode((p) => ({ ...p, flat: { ...p.flat, note: e.target.value } }))}
                      placeholder="5 originals in matching style"
                      className={inputClass}
                    />
                  </Field>
                </div>
              )}

              {values.pricing_mode === 'quote_only' && (
                <div className="animate-[adm-fade_200ms_ease-out] space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="CTA label (button text)" className="mb-0">
                      <input
                        type="text"
                        value={pricingByMode.quote_only.cta_label}
                        onChange={(e) => setPricingByMode((p) => ({ ...p, quote_only: { ...p.quote_only, cta_label: e.target.value } }))}
                        placeholder="Request a quote"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="CTA target URL" className="mb-0">
                      <input
                        type="text"
                        value={pricingByMode.quote_only.cta_href}
                        onChange={(e) => setPricingByMode((p) => ({ ...p, quote_only: { ...p.quote_only, cta_href: e.target.value } }))}
                        placeholder="/services/maps · or external URL"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label='"From $X" anchor (optional)' className="mb-0">
                      <CurrencyInput
                        value={pricingByMode.quote_only.from_price}
                        onChange={(v) => setPricingByMode((p) => ({ ...p, quote_only: { ...p.quote_only, from_price: v } }))}
                        placeholder="150"
                      />
                    </Field>
                    <Field label="Anchor label" className="mb-0">
                      <input
                        type="text"
                        value={pricingByMode.quote_only.from_label}
                        onChange={(e) => setPricingByMode((p) => ({ ...p, quote_only: { ...p.quote_only, from_label: e.target.value } }))}
                        placeholder="scoped per brief"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <Field label="Why pricing is quote-based (customer-facing)" className="mb-0">
                    <textarea
                      value={pricingByMode.quote_only.why}
                      onChange={(e) => setPricingByMode((p) => ({ ...p, quote_only: { ...p.quote_only, why: e.target.value } }))}
                      rows={2}
                      placeholder="e.g. Maps vary in scope more than character pieces…"
                      className={inputClass + ' min-h-[60px] resize-y'}
                    />
                  </Field>
                </div>
              )}
            </div>
          </SvceCard>

          {/* Operational */}
          <SvceCard>
            <SvceCardHead title="Operational" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Turnaround · low (days)" className="mb-0">
                <input
                  type="number"
                  min={0}
                  value={values.turnaround_low_days}
                  onChange={(e) => update('turnaround_low_days', e.target.value)}
                  placeholder="7"
                  className={inputClass + ' font-mono'}
                />
              </Field>
              <Field label="Turnaround · high (days)" className="mb-0">
                <input
                  type="number"
                  min={0}
                  value={values.turnaround_high_days}
                  onChange={(e) => update('turnaround_high_days', e.target.value)}
                  placeholder="14"
                  className={inputClass + ' font-mono'}
                />
              </Field>
              <Field label="Revisions included" className="mb-0">
                <input
                  type="number"
                  min={0}
                  value={values.revisions_included}
                  onChange={(e) => update('revisions_included', e.target.value)}
                  placeholder="2"
                  className={inputClass + ' font-mono'}
                />
              </Field>
              <Field label="Resolution / delivery" className="mb-0">
                <input
                  type="text"
                  value={values.resolution}
                  onChange={(e) => update('resolution', e.target.value)}
                  placeholder="4K final + transparent PNG"
                  className={inputClass}
                />
              </Field>
            </div>
          </SvceCard>

          {/* Included grid */}
          <SvceCard>
            <SvceCardHead title={`"What's included" grid`} hint="6 cards recommended" />
            <div className="flex flex-col gap-2">
              {included.map((row, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_2fr_32px] gap-2 items-start">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => setIncludedRow(idx, { name: e.target.value })}
                    placeholder="Name"
                    className={inputClass + ' py-2 text-[0.8125rem]'}
                  />
                  <input
                    type="text"
                    value={row.body}
                    onChange={(e) => setIncludedRow(idx, { body: e.target.value })}
                    placeholder="Body — short description"
                    className={inputClass + ' py-2 text-[0.8125rem]'}
                  />
                  <IconButton onClick={() => removeIncludedRow(idx)} title="Remove">
                    <X size={14} strokeWidth={1.8} />
                  </IconButton>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <AddRowButton onClick={addIncludedRow} label="Add included item" />
            </div>
          </SvceCard>

          {/* Examples */}
          <SvceCard>
            <SvceCardHead title="Examples gallery" hint="3 cards · upload images later" />
            <div className="flex flex-col gap-2">
              {examples.map((row, idx) => (
                <div key={idx} className="grid grid-cols-[110px_1fr_1fr_32px] gap-2 items-center">
                  <select
                    value={row.gradient}
                    onChange={(e) => setExampleRow(idx, { gradient: e.target.value })}
                    className={inputClass + ' py-2 text-[0.75rem]'}
                  >
                    <option value="from-violet-900 via-purple-700 to-indigo-600">violet · indigo</option>
                    <option value="from-amber-950 via-orange-800 to-yellow-700">amber · orange</option>
                    <option value="from-emerald-900 via-teal-700 to-cyan-600">emerald · teal</option>
                    <option value="from-burgundy-900 via-red-800 to-rose-700">burgundy · rose</option>
                    <option value="from-amber-700 via-burgundy-700 to-tome-900">tome · ember</option>
                  </select>
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) => setExampleRow(idx, { title: e.target.value })}
                    placeholder="Title"
                    className={inputClass + ' py-2 text-[0.8125rem]'}
                  />
                  <input
                    type="text"
                    value={row.meta}
                    onChange={(e) => setExampleRow(idx, { meta: e.target.value })}
                    placeholder="Meta · e.g. Premium tier · Mar 2026"
                    className={inputClass + ' py-2 text-[0.8125rem]'}
                  />
                  <IconButton onClick={() => removeExampleRow(idx)} title="Remove">
                    <X size={14} strokeWidth={1.8} />
                  </IconButton>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <AddRowButton onClick={addExampleRow} label="Add example" />
            </div>
          </SvceCard>

          {/* FAQ */}
          <SvceCard>
            <SvceCardHead title="Product FAQ" hint="4 to 5 questions recommended" />
            <div className="space-y-3">
              {faqs.map((row, idx) => (
                <div key={idx} className="bg-parchment-50 border border-border-light rounded-md p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-2 items-center font-display text-[0.9375rem] font-semibold text-ink-900">
                      <span className="inline-flex w-[22px] h-[22px] rounded-full bg-burgundy-700 text-cream-50 items-center justify-center font-display text-[0.75rem] font-semibold">
                        {idx + 1}
                      </span>
                      Question {idx + 1}
                    </div>
                    <IconButton onClick={() => removeFaqRow(idx)} title="Remove">
                      <X size={14} strokeWidth={1.8} />
                    </IconButton>
                  </div>
                  <input
                    type="text"
                    value={row.q}
                    onChange={(e) => setFaqRow(idx, { q: e.target.value })}
                    placeholder="Question text"
                    className={inputClass + ' mb-2'}
                  />
                  <textarea
                    value={row.a}
                    onChange={(e) => setFaqRow(idx, { a: e.target.value })}
                    rows={3}
                    placeholder="Answer (markdown supported)"
                    className={inputClass + ' min-h-[64px] resize-y'}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <AddRowButton onClick={addFaqRow} label="Add question" />
            </div>
          </SvceCard>

          {/* Long description */}
          <SvceCard>
            <SvceCardHead
              title={
                <>
                  Long description{' '}
                  <span className="text-ink-500 font-normal text-[0.8125rem]">(optional)</span>
                </>
              }
              hint="Markdown supported"
            />
            <textarea
              value={values.description}
              onChange={(e) => update('description', e.target.value)}
              rows={6}
              placeholder="Add a richer product page body. Used on the public detail page if present, ignored if blank."
              className={inputClass + ' min-h-[160px] resize-y'}
            />
          </SvceCard>
        </div>

        {/* =========================================================
             RIGHT STICKY SIDEBAR
             ========================================================= */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          {/* Visibility */}
          <SvceCard>
            <SvceCardHead title="Visibility" />
            <VisibilityRow label="Status" sub="Public listing">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => update('is_published', true)}
                  className={
                    'inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-full text-[0.8125rem] font-medium transition-colors border-[1.5px] ' +
                    (values.is_published
                      ? 'bg-forest-700/10 text-forest-700 border-burgundy-700 outline outline-2 outline-burgundy-700 outline-offset-2'
                      : 'bg-forest-700/10 text-forest-700 border-transparent')
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-500" />
                  Published
                </button>
                <button
                  type="button"
                  onClick={() => update('is_published', false)}
                  className={
                    'inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-full text-[0.8125rem] font-medium transition-colors border-[1.5px] ' +
                    (!values.is_published
                      ? 'bg-parchment-200 text-ink-500 border-burgundy-700 outline outline-2 outline-burgundy-700 outline-offset-2'
                      : 'bg-parchment-200 text-ink-500 border-transparent')
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-400" />
                  Draft
                </button>
              </div>
            </VisibilityRow>
            <VisibilityRow label="Show on homepage" sub="Featured strip">
              <ToggleSwitch
                value={values.is_featured_homepage}
                onChange={(v) => update('is_featured_homepage', v)}
              />
            </VisibilityRow>
            <VisibilityRow label="Featured order" sub="Sort within bucket">
              <input
                type="number"
                value={values.featured_order}
                onChange={(e) => update('featured_order', e.target.value)}
                placeholder="1"
                className="w-[60px] text-center bg-parchment-50 border-[1.5px] border-border-light rounded-md px-2 py-1.5 text-[0.875rem] text-ink-900 font-mono focus:outline-none focus:border-burgundy-500"
              />
            </VisibilityRow>
            <VisibilityRow label="Sort order" sub="Within bucket listing">
              <input
                type="number"
                value={values.sort_order}
                onChange={(e) => update('sort_order', e.target.value)}
                placeholder="0"
                className="w-[60px] text-center bg-parchment-50 border-[1.5px] border-border-light rounded-md px-2 py-1.5 text-[0.875rem] text-ink-900 font-mono focus:outline-none focus:border-burgundy-500"
              />
            </VisibilityRow>

            <div className="flex flex-col gap-2 mt-4">
              <button
                type="button"
                onClick={() => submit(true)}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 bg-burgundy-700 text-cream-50 px-5 py-3 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] hover:bg-burgundy-500 hover:shadow-md hover:-translate-y-px active:bg-burgundy-900 transition-all disabled:bg-ink-300 disabled:text-ink-400 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed"
              >
                <Save size={14} strokeWidth={1.8} />
                {isPending ? 'Saving…' : (mode === 'create' ? 'Create product' : 'Publish changes')}
              </button>
              <button
                type="button"
                onClick={() => submit(false)}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 bg-transparent text-burgundy-700 border-[1.5px] border-burgundy-700 px-5 py-2.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] hover:bg-burgundy-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Save as draft
              </button>
            </div>
          </SvceCard>

          {/* Bundle linkage */}
          <SvceCard>
            <SvceCardHead title="Bundle linkage" />
            <Field label="Partner product slugs" hint="Comma-separated. Example: vtt-token-single, character-art-full-body.">
              <input
                type="text"
                value={values.bundle_with_slugs}
                onChange={(e) => update('bundle_with_slugs', e.target.value)}
                placeholder="vtt-token-single"
                className={inputClass + ' font-mono text-[0.8125rem]'}
              />
            </Field>
            <Field label="Bundle uplift price" hint="Cents. Example: 2500 for +$25." className="mb-0">
              <CurrencyInput
                value={values.bundle_uplift_cents}
                onChange={(v) => update('bundle_uplift_cents', v)}
                placeholder="2500"
                centsHint
              />
            </Field>
          </SvceCard>

          {/* Genre tags */}
          <SvceCard>
            <SvceCardHead title="Genre tags" hint="Filter on portfolio" />
            <div className="flex flex-wrap gap-1.5">
              {/* Preset chips (toggleable) */}
              {GENRE_TAG_PRESETS.map((preset) => {
                const isActive = genreTags.includes(preset)
                return (
                  <button
                    type="button"
                    key={preset}
                    onClick={() =>
                      isActive
                        ? removeGenreTag(preset)
                        : setGenreTags([...genreTags, preset])
                    }
                    className={
                      'inline-flex items-center gap-1 px-2.5 py-1 text-[0.75rem] rounded-full border transition-colors cursor-pointer ' +
                      (isActive
                        ? 'bg-burgundy-700 text-cream-50 border-burgundy-700'
                        : 'bg-parchment-200 text-ink-700 border-transparent hover:border-burgundy-500')
                    }
                  >
                    {preset}
                  </button>
                )
              })}
              {/* Custom tags (typed by user, removable) */}
              {genreTags
                .filter((t) => !(GENRE_TAG_PRESETS as readonly string[]).includes(t))
                .map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[0.75rem] bg-burgundy-700 text-cream-50 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeGenreTag(tag)}
                      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-burgundy-900 transition-colors"
                      title={`Remove ${tag}`}
                    >
                      <X size={10} strokeWidth={2} />
                    </button>
                  </span>
                ))}
              {/* Inline "+ tag" input */}
              <input
                type="text"
                value={genreTagDraft}
                onChange={(e) => setGenreTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    addGenreTag()
                  } else if (e.key === 'Backspace' && genreTagDraft === '' && genreTags.length > 0) {
                    const last = genreTags[genreTags.length - 1]
                    if (!(GENRE_TAG_PRESETS as readonly string[]).includes(last)) {
                      removeGenreTag(last)
                    }
                  }
                }}
                placeholder="+ tag"
                className="bg-parchment-200 border border-transparent rounded-full px-2.5 py-1 text-[0.75rem] text-ink-700 placeholder:text-ink-500 focus:outline-none focus:border-burgundy-500 min-w-[80px]"
              />
            </div>
          </SvceCard>

          {/* SEO */}
          <details className="group bg-parchment-100 border border-border-light rounded-xl">
            <summary className="cursor-pointer flex items-center justify-between px-6 py-4 list-none">
              <div className="font-display text-[1.0625rem] font-semibold text-ink-900">SEO</div>
              <ChevronRight size={14} strokeWidth={1.8} className="text-ink-500 transition-transform group-open:rotate-90" />
            </summary>
            <div className="px-6 pb-6">
              <Field label="Meta title">
                <input
                  type="text"
                  value={values.seo_title}
                  onChange={(e) => update('seo_title', e.target.value)}
                  placeholder="Character Portrait commissions · DesignVortek"
                  className={inputClass}
                />
              </Field>
              <Field label="Meta description" className="mb-0">
                <textarea
                  value={values.seo_description}
                  onChange={(e) => update('seo_description', e.target.value)}
                  rows={3}
                  placeholder="Hand-painted bust-shot character portraits from $60. Three tiers, 2 revisions, 4K delivery…"
                  className={inputClass + ' min-h-[72px] resize-y'}
                />
              </Field>
            </div>
          </details>

          {/* Danger zone */}
          {mode === 'edit' && (
            <section className="border border-burgundy-500 bg-burgundy-100/20 rounded-xl p-5 mt-1">
              <h4 className="font-display text-[0.9375rem] font-semibold text-burgundy-700 mb-1.5">
                Danger zone
              </h4>
              <p className="text-[0.8125rem] text-ink-700 leading-relaxed mb-3">
                Deleting a product unpublishes it immediately and breaks any direct links. Order history stays intact.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex items-center gap-2 bg-burgundy-700 text-cream-50 px-4 py-2 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] hover:bg-burgundy-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} strokeWidth={1.8} />
                Delete {values.name || 'this product'}
              </button>
            </section>
          )}
        </div>
      </div>

      {/* Local keyframes for panel swap fade-in.
          Tailwind v4 picks up arbitrary `animate-[…]` values, so the
          @keyframes here gets emitted when a panel mounts. Using a
          plain <style> tag (not styled-jsx) so it doesn't require any
          extra babel plugin in Next 16. */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes adm-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  )
}

/* =====================================================================
   LOCAL PRIMITIVES
   ===================================================================== */

const inputClass =
  'w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md px-3.5 py-2.5 text-[0.9375rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:shadow-[0_0_0_3px_var(--color-burgundy-100)] transition-all'

function SvceCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-parchment-100 border border-border-light rounded-xl p-6">
      {children}
    </section>
  )
}

function SvceCardHead({
  title,
  hint,
}: {
  title: React.ReactNode
  hint?: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between mb-3.5 gap-4">
      <div className="font-display text-[1.0625rem] font-semibold text-ink-900">{title}</div>
      {hint && <span className="text-[0.75rem] text-ink-500">{hint}</span>}
    </div>
  )
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={'flex flex-col gap-1.5 mb-4 ' + (className ?? '')}>
      <label className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700">
        <span>{label}</span>
      </label>
      {hint && <p className="text-[0.75rem] text-ink-500 leading-snug">{hint}</p>}
      {children}
    </div>
  )
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
  dense,
  centsHint,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  dense?: boolean
  centsHint?: boolean
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 font-semibold text-[0.875rem] pointer-events-none">
        $
      </span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={
          'w-full bg-parchment-50 border-[1.5px] border-border-light rounded-md pl-6 pr-3 text-[0.9375rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:shadow-[0_0_0_3px_var(--color-burgundy-100)] transition-all font-mono ' +
          (dense ? 'py-2' : 'py-2.5')
        }
      />
      {centsHint && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.6875rem] text-ink-500 pointer-events-none">
          cents
        </span>
      )}
    </div>
  )
}

function SuffixInput({
  value,
  onChange,
  suffix,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  suffix: string
  placeholder?: string
}) {
  return (
    <div className="relative flex items-center">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass + ' pr-20 font-mono'}
      />
      <span className="absolute right-3 text-[0.75rem] text-ink-500 font-medium pointer-events-none">
        {suffix}
      </span>
    </div>
  )
}

function IconButton({
  onClick,
  children,
  small,
  title,
}: {
  onClick: () => void
  children: React.ReactNode
  small?: boolean
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={
        'inline-flex items-center justify-center rounded-md bg-transparent border border-transparent text-ink-500 hover:bg-parchment-200 hover:text-burgundy-700 hover:border-border-light transition-colors ' +
        (small ? 'w-[26px] h-[26px]' : 'w-[30px] h-[30px]')
      }
    >
      {children}
    </button>
  )
}

function AddRowButton({
  onClick,
  label,
  small,
}: {
  onClick: () => void
  label: string
  small?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'inline-flex items-center gap-1.5 bg-transparent border border-dashed border-border-medium rounded-md text-ink-700 hover:bg-parchment-50 hover:border-burgundy-500 hover:text-burgundy-700 transition-colors ' +
        (small ? 'px-3 py-1.5 text-[0.75rem]' : 'px-3.5 py-2 text-[0.8125rem]')
      }
    >
      <Plus size={12} strokeWidth={2} />
      {label}
    </button>
  )
}

function VisibilityRow({
  label,
  sub,
  children,
}: {
  label: string
  sub?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-t border-dashed border-border-light first:border-t-0">
      <div className="flex flex-col gap-0.5">
        <strong className="text-[0.875rem] font-semibold text-ink-900">{label}</strong>
        {sub && <small className="text-[0.75rem] text-ink-500">{sub}</small>}
      </div>
      {children}
    </div>
  )
}

function ToggleSwitch({
  value,
  onChange,
  onLabel,
  offLabel,
}: {
  value: boolean
  onChange: (v: boolean) => void
  onLabel?: string
  offLabel?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`inline-flex items-center gap-2.5 text-[0.8125rem] font-medium transition-colors ${
        value ? 'text-ink-900' : 'text-ink-500'
      }`}
    >
      {(onLabel || offLabel) && <span>{value ? onLabel : offLabel}</span>}
      <span
        className={`relative inline-block w-10 h-[22px] rounded-full transition-colors ${
          value ? 'bg-burgundy-700' : 'bg-parchment-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-cream-50 shadow-sm transition-transform ${
            value ? 'translate-x-[18px]' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}

/* =====================================================================
   TIER BLOCK
   ===================================================================== */
function TierBlock({
  index,
  tier,
  onPatch,
  onRemove,
  onFeatureChange,
  onAddFeature,
  onRemoveFeature,
}: {
  index: number
  tier: TierDraft
  onPatch: (patch: Partial<TierDraft>) => void
  onRemove: () => void
  onFeatureChange: (featIdx: number, value: string) => void
  onAddFeature: () => void
  onRemoveFeature: (featIdx: number) => void
}) {
  const isFeatured = tier.featured
  return (
    <div
      className={
        'bg-parchment-50 border rounded-md p-4 transition-shadow ' +
        (isFeatured
          ? 'border-gold-500 shadow-[0_0_0_2px_var(--color-gold-100)]'
          : 'border-border-light')
      }
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2 items-center font-display text-[0.9375rem] font-semibold text-ink-900">
          <span
            className={
              'inline-flex w-[22px] h-[22px] rounded-full items-center justify-center font-display text-[0.75rem] font-semibold ' +
              (isFeatured ? 'bg-gold-500 text-ink-900' : 'bg-burgundy-700 text-cream-50')
            }
          >
            {index + 1}
          </span>
          Tier {index + 1}
          {isFeatured && (
            <span className="text-[0.6875rem] text-gold-700 ml-2 tracking-[0.1em] uppercase">
              Featured
            </span>
          )}
        </div>
        <IconButton onClick={onRemove} title="Remove tier">
          <X size={14} strokeWidth={1.8} />
        </IconButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        <Field label="Tier name" className="mb-0">
          <input
            type="text"
            value={tier.name}
            onChange={(e) => onPatch({ name: e.target.value })}
            placeholder="Basic"
            className={inputClass + ' py-2'}
          />
        </Field>
        <Field label="Price" className="mb-0">
          <CurrencyInput
            value={tier.price}
            onChange={(v) => onPatch({ price: v })}
            placeholder="60"
            dense
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
        <Field label='"Best for" subtitle' className="mb-0">
          <input
            type="text"
            value={tier.best_for}
            onChange={(e) => onPatch({ best_for: e.target.value })}
            placeholder="clean and clear"
            className={inputClass + ' py-2'}
          />
        </Field>
        <Field label="Price note" className="mb-0">
          <input
            type="text"
            value={tier.note}
            onChange={(e) => onPatch({ note: e.target.value })}
            placeholder="line + flat color"
            className={inputClass + ' py-2'}
          />
        </Field>
      </div>

      <div>
        <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700 mb-1.5">
          Feature checklist
        </label>
        <div className="flex flex-col gap-1.5">
          {tier.features.map((feat, fIdx) => (
            <div key={fIdx} className="flex gap-2 items-center">
              <input
                type="text"
                value={feat}
                onChange={(e) => onFeatureChange(fIdx, e.target.value)}
                placeholder="Clean line art"
                className="flex-1 bg-parchment-50 border border-border-light rounded-sm px-2.5 py-1.5 text-[0.8125rem] text-ink-900 focus:outline-none focus:border-burgundy-500 min-w-0"
              />
              <IconButton onClick={() => onRemoveFeature(fIdx)} small title="Remove feature">
                <X size={12} strokeWidth={1.8} />
              </IconButton>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <AddRowButton onClick={onAddFeature} label="Add feature" small />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-border-light gap-3">
        <label className="flex items-center gap-2 text-[0.8125rem] text-ink-700 cursor-pointer">
          <input
            type="checkbox"
            checked={tier.featured}
            onChange={(e) => onPatch({ featured: e.target.checked })}
            className="w-4 h-4 accent-burgundy-700"
          />
          Featured tier (gold ring)
        </label>
        <input
          type="text"
          value={tier.flag}
          onChange={(e) => onPatch({ flag: e.target.value })}
          placeholder='Flag text (e.g. "Most popular")'
          className="bg-parchment-50 border border-border-light rounded-md px-2.5 py-1.5 text-[0.75rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 max-w-[200px]"
        />
      </div>
    </div>
  )
}
