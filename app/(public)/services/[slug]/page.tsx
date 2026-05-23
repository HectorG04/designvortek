import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Container from '@/components/ui/Container'
import Button from '@/components/ui/Button'
import Markdown from '@/components/ui/Markdown'
import PaperTexture from '@/components/decor/PaperTexture'
import USDDisclaimer from '@/components/ui/USDDisclaimer'
import {
  bucketLabel,
  fetchProductsByBucket,
  formatTurnaround,
  formatBundleUplift,
  type ServiceBucket,
  type ServiceProduct,
} from '@/lib/services-server'
import { cn } from '@/lib/utils'

/* =====================================================================
   SERVICES · BUCKET DETAIL — V2 PORT (revised to match design 100%).

   Literal port of `Service Detail v2.html` from the Claude Design
   handoff. Structure follows the design exactly:

     1. Breadcrumbs (Home › Services › <Bucket label>)
     2. Hero (eyebrow + h1 with <em> + lede)
     3. Bucket truths strip (Revisions · Turnaround · Delivery)
     4. Per-product blocks — head + description + pricing card ONLY
        (no per-product included/examples/faq/CTA — those live at the
        bucket level below)
     5. Pick your style — CHARACTER BUCKET ONLY (4 style cards)
     6. Recent {bucket} work — bucket-level 3 example cards + "See all"
     7. Bucket-level FAQ — .hp-faq-layout (side rail + accordion)
     8. Dark-tome CTA closer

   PRICING-CARD RENDERER COVERS ALL 8 VARIANTS:
     tiered · range · per_extra · pack_with_qty · pct_uplift
     monthly_recurring · quote_only · flat (with bundleWithSlugs branch
     that triggers the .bd-bundle callout treatment for Character +
     Token Bundle)

   USD disclaimer renders inline directly after the FIRST tiered
   product's tier grid (per design), not at the bottom of the page.

   ISR: revalidate = 60s.
   ===================================================================== */

export const revalidate = 60

type AllowedBucket = Extract<ServiceBucket, 'character-work' | 'party-work' | 'gm-world-building' | 'tokens'>

const ALLOWED_BUCKETS: AllowedBucket[] = [
  'character-work',
  'party-work',
  'gm-world-building',
  'tokens',
]

function isAllowedBucket(slug: string): slug is AllowedBucket {
  return (ALLOWED_BUCKETS as string[]).includes(slug)
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return ALLOWED_BUCKETS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (!isAllowedBucket(slug)) return { title: 'Service not found · Design Vortex' }
  const label = bucketLabel(slug)
  return {
    title: `${label} · every tier of finish · Design Vortex`,
    description: `${label} commissions: hand-painted, fixed-rate pricing, two revisions on every tier. Browse every product in the ${label.toLowerCase()} bucket with USD pricing and turnaround ranges.`,
    alternates: { canonical: `/services/${slug}` },
  }
}

/* =====================================================================
   Bucket-level copy (hero emphasis, lede, truths strip).
   ===================================================================== */
const BUCKET_COPY: Record<AllowedBucket, {
  heroEmphasis: string
  lede: string
  truths: { label: string; value: string }[]
}> = {
  'character-work': {
    heroEmphasis: 'tier of finish',
    lede: 'Four ways to commission a character. A bust for the character sheet, a full-body for the wall, a reference sheet for the long campaign, or the bundle that includes a matching VTT token. Same hand-painted craft on every option.',
    truths: [
      { label: 'Revisions',  value: '2 included on every tier' },
      { label: 'Turnaround', value: '2 to 4 weeks per piece'    },
      { label: 'Delivery',   value: '4K final + transparent PNG' },
    ],
  },
  'party-work': {
    heroEmphasis: 'one composition',
    lede: 'Group portraits, matched sets, and action scenes for the whole table. Whether you want everyone in one canvas or individual portraits that share a style guide, the same hand-painted craft applies to every figure.',
    truths: [
      { label: 'Revisions',  value: '2 included on every tier' },
      { label: 'Turnaround', value: '2 to 5 weeks per piece'    },
      { label: 'Delivery',   value: '4K master + print-ready'   },
    ],
  },
  'gm-world-building': {
    heroEmphasis: 'campaign',
    lede: 'NPC packs, monsters, magic items, battle maps, region maps — the visual language of your whole world. Painted to a shared style guide so the campaign feels like one continuous setting.',
    truths: [
      { label: 'Revisions',  value: '2 included on every tier'  },
      { label: 'Turnaround', value: '3 days to 6 weeks by scope' },
      { label: 'Delivery',   value: '4K · VTT-ready · print'     },
    ],
  },
  tokens: {
    heroEmphasis: 'table-ready',
    lede: 'Hand-painted VTT tokens built for the circle, not cropped from a square. Single tokens, matched packs, or conversions from your existing art — every option ships at 512 and 1024 px transparent PNG.',
    truths: [
      { label: 'Revisions',  value: '1 included per token'      },
      { label: 'Turnaround', value: '2 days to 2 weeks by scope' },
      { label: 'Delivery',   value: '512 + 1024 px PNG'         },
    ],
  },
}

/* =====================================================================
   Bucket-level examples — 3 cards shown in the "Recent {bucket} work"
   section. Hardcoded per bucket (the design's intent is a curated trio
   sampling across products in the bucket).
   ===================================================================== */
interface BucketExampleCard {
  title: string
  badge: string
  meta: string
  gradient: string
  filter?: string
}
const BUCKET_EXAMPLES: Record<AllowedBucket, BucketExampleCard[]> = {
  'character-work': [
    { title: 'Lyra · Tiefling Sorceror',  badge: 'Portrait · Premium', meta: 'Mar 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
    { title: 'Aldric · half-elf paladin', badge: 'Full-body · Standard', meta: 'Mar 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
    { title: 'Captain Veska · 4 views',   badge: 'Reference Sheet',    meta: 'Feb 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
  ],
  'party-work': [
    { title: 'Stormwatch · 5 figures',        badge: 'Party · Premium',     meta: 'Mar 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
    { title: 'Wedding party as adventurers',  badge: 'Party · Premium',     meta: 'Feb 2026', gradient: 'from-amber-700 via-burgundy-700 to-tome-900' },
    { title: 'Saltbound crew · 4 PCs',        badge: 'Matched set',         meta: 'Mar 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
  ],
  'gm-world-building': [
    { title: 'Strahd · 8-NPC pack',           badge: 'NPC Pack · 10',      meta: 'Mar 2026', gradient: 'from-burgundy-900 via-red-800 to-rose-700' },
    { title: 'Hexcrown council hall',         badge: 'Battle Map',         meta: 'Feb 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
    { title: 'The Hexcrown Coast',            badge: 'World Map',          meta: 'Mar 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
  ],
  tokens: [
    { title: 'Drow ranger token',             badge: 'Single token',       meta: 'Mar 2026', gradient: 'from-violet-900 via-purple-700 to-indigo-600' },
    { title: 'Adventuring party · 5 tokens',  badge: '5-pack',             meta: 'Mar 2026', gradient: 'from-emerald-900 via-teal-700 to-cyan-600' },
    { title: 'Half-orc paladin token',        badge: 'Convert',            meta: 'Mar 2026', gradient: 'from-amber-950 via-orange-800 to-yellow-700' },
  ],
}

/* =====================================================================
   Bucket-level FAQ — 4 questions per bucket. Bucket-spanning topics
   (deposit, tier model, how to decide). Hardcoded so each bucket has
   tight, curated questions rather than aggregated per-product noise.
   ===================================================================== */
interface BucketFaqItem { q: string; a: string }
const BUCKET_FAQ: Record<AllowedBucket, BucketFaqItem[]> = {
  'character-work': [
    {
      q: 'How do the tiers differ?',
      a: 'Tiers describe rendering complexity, not subject matter. **Basic** is clean line and flat color. **Standard** is fully rendered with shadow, texture, and a suggested setting. **Premium** adds dynamic pose, atmospheric background, and effects. Same character at any tier, different finish.',
    },
    {
      q: 'Can I commission a portrait without a token, or add a token later?',
      a: 'Yes to both. The bundle is just a smaller package price when bought together. A token added later from an existing portrait runs **$25** too, same flat rate. Tokens commissioned without a portrait start at **$40**.',
    },
    {
      q: "What's the deposit?",
      a: '**30% upfront** to hold the slot, with the remainder due on delivery. The deposit is refundable until sketches begin and non-refundable after. Subscriptions bill the full month upfront instead, no deposit.',
    },
    {
      q: 'What species and classes do you cover?',
      a: 'Every **D&D 5e** species and class, every **Pathfinder** ancestry, homebrew species, and characters from your own setting. Tieflings, drow, dragonborn, kobolds, custom mixes. Send a description and the studio will paint it.',
    },
  ],
  'party-work': [
    {
      q: 'How many figures can fit in one composition?',
      a: 'The Party Portrait base price covers up to **4 figures**. Add up to 4 more as extras at **$80 to $120** each, depending on tier complexity. Beyond 8 figures, faces get small enough that we recommend splitting into two pieces.',
    },
    {
      q: 'Whats the difference between a Party Portrait and a Matched Set?',
      a: 'A **Party Portrait** is one composition with everyone in it (single canvas). A **Matched Set** is separate portraits painted to a shared style guide. Pick Portrait when the table wants one heirloom piece; pick Matched Set when each player wants their own canvas.',
    },
    {
      q: "What's the deposit?",
      a: '**30% upfront** to hold the slot, refundable until sketches begin. The remainder is due on delivery.',
    },
    {
      q: 'Can I order this as a surprise gift?',
      a: 'Yes. We coordinate references with someone else at the table to keep the surprise. Common for wedding gifts, anniversaries, retirement, and milestone birthdays.',
    },
  ],
  'gm-world-building': [
    {
      q: 'What counts as a campaign-worthy NPC pack?',
      a: 'A pack means **matching style across multiple portraits**. We lock palette, era, and lighting on a kickoff call, then every NPC in the pack holds that visual language. Five-pack is the minimum; ten-pack drops the per-piece rate.',
    },
    {
      q: 'Why are maps quote-only?',
      a: 'Maps vary enormously in scope: a small ambush battle map is different from a 60×80 city-block fight scene or a region map with 30 named places. We quote per brief so the price reflects actual work rather than a one-size-fits-all tier.',
    },
    {
      q: "What's the deposit?",
      a: '**30% upfront** to hold the slot, refundable until sketches begin. The remainder is due on delivery. For larger NPC packs, we sometimes split into two milestones.',
    },
    {
      q: 'Can you match my existing campaign art?',
      a: 'Yes. Send references of the art that\'s already in your campaign and we\'ll match tone, palette, and finish. We\'ve picked up where other artists left off before.',
    },
  ],
  tokens: [
    {
      q: 'Why pay for a custom token instead of cropping a portrait?',
      a: 'A token designed for the circle has the head sized to fill the round frame, not clipped from a square. **Decorative borders** pull the eye inward. The single-token starting price is $40 because the design effort is real, even at 512px.',
    },
    {
      q: "What's the difference between a single and a 5-pack?",
      a: 'The **5-pack** ships all 5 tokens in matching border style for **$180** ($36/token). Singles start at **$40** and go to $60 for ornate borders or effects. If you already have your portrait, **converting to a token is $25** (no new painting, just expert cropping + border).',
    },
    {
      q: 'Do you do animated tokens?',
      a: 'Not yet. Every token ships as a static PNG. Animation is on the roadmap but we want to get it right before launching it.',
    },
    {
      q: "What's the deposit?",
      a: '**30% upfront** to hold the slot, refundable until sketches begin. The remainder is due on delivery.',
    },
  ],
}

/* =====================================================================
   Pick your style — CHARACTER BUCKET ONLY. Four style cards.
   The `ph` field maps to the design-system.css gradient placeholder.
   ===================================================================== */
const STYLE_CARDS: { name: string; note: string; gradient: string; filter?: string }[] = [
  { name: 'Painterly',      note: 'Warm, dramatic, signature', gradient: 'radial-gradient(ellipse at 30% 20%, rgba(232,200,128,0.6), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(107,31,42,0.6), transparent 60%), linear-gradient(135deg, #2a1810, #3e1218 60%, #1a130c)' },
  { name: 'Anime',          note: 'Cell-shaded, expressive',   gradient: 'radial-gradient(ellipse at 50% 30%, rgba(243,214,217,0.6), transparent 60%), radial-gradient(ellipse at 30% 80%, rgba(201,160,74,0.4), transparent 60%), linear-gradient(160deg, #6B1F2A, #8A2A35 70%, #3e1218)' },
  { name: 'Lineart',        note: 'Clean, ink-and-wash',       gradient: 'radial-gradient(ellipse at 30% 20%, rgba(232,200,128,0.6), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(107,31,42,0.6), transparent 60%), linear-gradient(135deg, #2a1810, #3e1218 60%, #1a130c)', filter: 'saturate(0.4) brightness(1.05)' },
  { name: 'Semi-realistic', note: 'For the serious PC',        gradient: 'radial-gradient(ellipse at 30% 20%, rgba(232,200,128,0.6), transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(107,31,42,0.6), transparent 60%), linear-gradient(135deg, #2a1810, #3e1218 60%, #1a130c)', filter: 'hue-rotate(60deg) brightness(1.1)' },
]

export default async function ServiceBucketDetailPage({ params }: PageProps) {
  const { slug } = await params
  if (!isAllowedBucket(slug)) notFound()

  const products = await fetchProductsByBucket(slug)
  if (products.length === 0) notFound()

  const label = bucketLabel(slug)
  const copy = BUCKET_COPY[slug]
  const examples = BUCKET_EXAMPLES[slug]
  const faq = BUCKET_FAQ[slug]

  // The USD disclaimer renders inline after the FIRST tiered product
  // (mirrors the design exactly). Track which index that is.
  const firstTieredIdx = products.findIndex((p) => p.pricing.mode === 'tiered')

  return (
    <>
      <SiteHeader />
      <main className="bg-parchment-50">

        {/* ============ BREADCRUMBS ============ */}
        <div className="pt-[108px]">
          <Container>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-[0.8125rem] text-ink-500"
            >
              <Link href="/" className="hover:text-burgundy-700 transition-colors">Home</Link>
              <Chevron />
              <Link href="/services" className="hover:text-burgundy-700 transition-colors">Services</Link>
              <Chevron />
              <span aria-current="page" className="text-ink-900 font-medium">{label}</span>
            </nav>
          </Container>
        </div>

        {/* ============ HERO ============ */}
        <section className="pt-6 pb-16 text-center">
          <Container>
            <div className="mb-4 flex justify-center">
              <span className="inline-flex items-center gap-[10px] font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                <span aria-hidden="true" className="h-px w-6 bg-burgundy-700" />
                {label}
              </span>
            </div>
            <h1
              className="font-display font-semibold text-ink-900 leading-[1.05] tracking-tight mb-4 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
              style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}
            >
              {label}, every <em>{copy.heroEmphasis}</em>.
            </h1>
            <p className="text-lg text-ink-500 leading-[1.65] mx-auto max-w-[60ch]">
              {copy.lede}
            </p>
          </Container>
        </section>

        {/* ============ BUCKET TRUTHS STRIP ============ */}
        <section>
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-14">
              {copy.truths.map((truth, i) => (
                <div
                  key={truth.label}
                  className="bg-parchment-100 border border-border-light rounded-lg px-5 py-[18px] flex items-center gap-3.5"
                >
                  <div className="w-8 h-8 rounded-full bg-gold-100 inline-flex items-center justify-center flex-shrink-0 text-gold-700">
                    {i === 0 && <ChartIcon />}
                    {i === 1 && <ClockIcon />}
                    {i === 2 && <DeliveryIcon />}
                  </div>
                  <div>
                    <span className="block text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-500 mb-0.5">
                      {truth.label}
                    </span>
                    <span className="block font-display text-[1.0625rem] font-semibold text-ink-900 leading-tight">
                      {truth.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ============ PER-PRODUCT BLOCKS ============ */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="flex flex-col">
              {products.map((product, i) => (
                <div key={product.slug}>
                  <ProductBlock product={product} isFirst={i === 0} />
                  {/* Inline USD disclaimer after the first tiered product */}
                  {i === firstTieredIdx && (
                    <div className="text-center mt-4">
                      <USDDisclaimer variant="inline" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ============ PICK YOUR STYLE (Character only) ============ */}
        {slug === 'character-work' && (
          <section className="bg-parchment-100 py-16 md:py-20">
            <Container>
              <div className="text-center mb-10">
                <div className="mb-4 flex justify-center">
                  <span className="inline-flex items-center gap-[10px] font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                    <span aria-hidden="true" className="h-px w-6 bg-burgundy-700" />
                    Pick your style
                  </span>
                </div>
                <h2
                  className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mb-4 max-w-[24ch] mx-auto [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
                >
                  Four styles, <em>one craft</em>
                </h2>
                <p className="text-ink-500 leading-[1.65] max-w-[60ch] mx-auto">
                  Available on every character work product. Not sure? Send references in the brief and the studio will recommend.
                </p>
              </div>

              {/* .sd-styles · grid: 4 cols desktop, 2 cols below 900px, gap 16px */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STYLE_CARDS.map((style) => (
                  <article
                    key={style.name}
                    className="bg-parchment-50 border border-border-light rounded-lg overflow-hidden transition-all duration-[250ms] hover:-translate-y-[3px] hover:shadow-md hover:border-border-medium cursor-pointer"
                  >
                    {/* .sd-style-img · aspect-ratio 4/5 (portrait, slightly taller than wide) */}
                    <div
                      className="aspect-[4/5]"
                      aria-hidden="true"
                      style={{ background: style.gradient, filter: style.filter }}
                    />
                    {/* .sd-style-body · padding 14px 18px 18px, left-aligned */}
                    <div className="pt-[14px] px-[18px] pb-[18px]">
                      <div className="font-display text-[1.125rem] font-semibold text-ink-900 leading-tight mb-0.5">
                        {style.name}
                      </div>
                      <div className="text-[0.8125rem] text-ink-500">
                        {style.note}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* ============ RECENT BUCKET WORK ============ */}
        <section className="py-16 md:py-20">
          <Container>
            <div className="text-center mb-10">
              <div className="mb-4 flex justify-center">
                <span className="inline-flex items-center gap-[10px] font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                  <span aria-hidden="true" className="h-px w-6 bg-burgundy-700" />
                  Recent {label.toLowerCase()}
                </span>
              </div>
              <h2
                className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight max-w-[24ch] mx-auto [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
              >
                Pieces from <em>this bucket</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {examples.map((ex) => (
                <article
                  key={ex.title}
                  className="bg-parchment-50 border border-border-light rounded-xl overflow-hidden transition-all duration-[250ms] hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className={cn('relative aspect-[4/3] flex items-start p-3.5', `bg-gradient-to-br ${ex.gradient}`)}
                    style={ex.filter ? { filter: ex.filter } : undefined}
                  >
                    <span className="inline-block bg-parchment-50/[0.92] backdrop-blur-md border border-gold-300 text-ink-900 text-[0.625rem] tracking-[0.15em] uppercase font-bold px-2.5 py-[5px] rounded-full">
                      {ex.badge}
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    <h4 className="font-display text-[1.0625rem] font-semibold text-ink-900 leading-tight">
                      {ex.title}
                    </h4>
                    <div className="text-[0.75rem] text-ink-500 mt-1 font-mono">
                      {ex.meta}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button href="/portfolio" variant="outline" size="md">
                See all {label.toLowerCase()} <ArrowRight />
              </Button>
            </div>
          </Container>
        </section>

        {/* ============ BUCKET-LEVEL FAQ ============ */}
        <section className="bg-parchment-100 py-16 md:py-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 max-w-[1080px] mx-auto">
              <div>
                <div className="mb-3 inline-flex items-center gap-[10px] font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                  <span aria-hidden="true" className="h-px w-6 bg-burgundy-700" />
                  {label} FAQ
                </div>
                <h2
                  className="font-display font-semibold leading-[1.1] tracking-tight text-ink-900 mb-4 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
                >
                  Common questions <em>across the bucket</em>
                </h2>
                <p className="text-ink-500 leading-[1.65] mb-5">
                  Answers that apply to every product in this bucket. For pricing-specific or workflow questions, see the full FAQ.
                </p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:gap-3.5 transition-all"
                >
                  Full FAQ <ArrowRight />
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {faq.map((item, i) => (
                  <details
                    key={item.q}
                    open={i === 0}
                    className="group bg-parchment-50 border border-border-light rounded-xl open:border-border-medium open:shadow-sm transition-colors"
                  >
                    <summary className="list-none cursor-pointer flex items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-display text-xl font-semibold text-ink-900 leading-[1.3]">
                        {item.q}
                      </span>
                      <span className="flex-shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-all duration-[250ms] bg-parchment-100 text-burgundy-700 border border-border-medium group-open:bg-burgundy-700 group-open:text-cream-50 group-open:border-burgundy-700 group-open:rotate-45">
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-5 text-base text-ink-700 leading-[1.7] max-w-[64ch]">
                      <Markdown>{item.a}</Markdown>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* ============ CTA CLOSER ============ */}
        <section className="relative bg-tome-950 text-cream-50 py-20 text-center overflow-hidden">
          <PaperTexture variant="cream" opacity={0.5} />
          <div className="relative">
            <Container>
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.15] tracking-tight mb-4 mx-auto max-w-[28ch] [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
              >
                Ready to commission a <em>{ctaWord(slug)}</em>?
              </h2>
              <p className="text-base text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-7">
                Pick a product, pick a tier, send a short brief. Fixed quote back within 48 hours.
              </p>
              <div className="inline-flex flex-wrap justify-center gap-3">
                <Button href="/order" variant="gold" size="lg">
                  Start a commission <ArrowRight />
                </Button>
                <Button href="/portfolio" variant="outline-cream" size="lg">
                  Browse portfolio
                </Button>
              </div>
            </Container>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  )
}

/* =====================================================================
   CTA noun per bucket — matches the design's "Ready to commission a
   character?" pattern.
   ===================================================================== */
function ctaWord(slug: AllowedBucket): string {
  switch (slug) {
    case 'character-work':    return 'character'
    case 'party-work':        return 'party piece'
    case 'gm-world-building': return 'campaign asset'
    case 'tokens':            return 'token'
  }
}

/* =====================================================================
   ProductBlock — simplified per design. Renders ONLY head + description
   + pricing card. No included grid, no examples, no FAQ, no extra CTAs
   (those all live at the bucket level).

   Stacking pattern matches `.bd-product` from pages.css: first block
   has no top divider; every subsequent block has a dashed top border
   + 56px padding/margin between siblings.
   ===================================================================== */
function ProductBlock({ product, isFirst }: { product: ServiceProduct; isFirst: boolean }) {
  const turnaroundLabel = formatTurnaround(product)
  const isBundle =
    product.pricing.mode === 'flat' && product.bundleWithSlugs.length > 0

  return (
    <div
      className={cn(
        'flex flex-col',
        !isFirst && 'mt-14 pt-14 border-t border-dashed border-border-light',
      )}
    >
      {/* Product head: name + meta */}
      <div className="flex flex-wrap justify-between items-end gap-6 mb-6">
        <div>
          <h2
            className="font-display font-medium text-ink-900 leading-[1.15] tracking-tight [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
            style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}
          >
            {product.name}
          </h2>
          {product.eyebrow && (
            <div className="font-accent text-[1.0625rem] text-burgundy-700 mt-1">
              {product.eyebrow}
            </div>
          )}
        </div>
        <div className="inline-flex items-center gap-2 text-[0.8125rem] text-ink-500">
          {isBundle ? (
            <>
              <BundleIcon className="w-4 h-4 text-gold-700" />
              <span>Added to any portrait</span>
            </>
          ) : (
            <>
              <ClockIcon className="w-4 h-4 text-gold-700" />
              <span>Turnaround</span>
              <strong className="text-ink-900 font-semibold">{turnaroundLabel}</strong>
            </>
          )}
        </div>
      </div>

      {/* Lede paragraph */}
      {product.lede && (
        <p className="max-w-[65ch] text-ink-700 leading-[1.6] mb-7">
          {product.lede}
        </p>
      )}

      {/* Pricing card(s) per mode */}
      <PricingDisplay product={product} />
    </div>
  )
}

/* =====================================================================
   PricingDisplay — ONE switch covering all 8 pricing modes.

   Special branch: flat + bundleWithSlugs.length > 0 renders the
   .bd-bundle dark-tome callout exactly per the design instead of a
   regular flat card.
   ===================================================================== */
function PricingDisplay({ product }: { product: ServiceProduct }) {
  const p = product.pricing

  switch (p.mode) {
    /* ---- 1 of 8: TIERED (3-up grid) ---- */
    case 'tiered': {
      const cols =
        p.tiers.length === 2 ? 'grid-cols-1 sm:grid-cols-2' :
        'grid-cols-1 lg:grid-cols-3'
      return (
        <div className={cn('grid gap-4', cols)}>
          {p.tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                'relative rounded-xl p-7 sm:p-8 flex flex-col gap-4 transition-all duration-[250ms]',
                'hover:-translate-y-1 hover:shadow-md',
                tier.featured
                  ? 'bg-parchment-50 border border-gold-500 shadow-[0_8px_24px_rgba(201,160,74,0.18)]'
                  : 'bg-parchment-100 border border-border-light',
              )}
            >
              {tier.flag && (
                <span className="absolute -top-2.5 right-6 bg-gold-500 text-ink-900 font-body text-[0.625rem] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">
                  {tier.flag}
                </span>
              )}

              <div>
                <div className="font-display text-2xl font-semibold text-ink-900">{tier.name}</div>
                {tier.note && (
                  <div className="font-accent text-base text-burgundy-700 -mt-1">{tier.note}</div>
                )}
              </div>

              <div className="flex items-baseline gap-2 py-3 border-y border-dashed border-border-light">
                <span className="font-display text-[2.75rem] font-semibold text-ink-900 leading-none tracking-[-0.02em]">
                  ${tier.price}
                </span>
                {tier.note && (
                  <span className="text-sm text-ink-500">{tier.note}</span>
                )}
              </div>

              <ul className="flex flex-col gap-2.5 list-none p-0 m-0 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2.5 items-start text-[0.9375rem] text-ink-700 leading-[1.4]">
                    <CheckIcon className="w-3.5 h-3.5 text-gold-700 flex-shrink-0 mt-1" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                href="/order"
                variant={tier.featured ? 'primary' : 'outline'}
                size="md"
                className="mt-2 w-full"
              >
                Choose {tier.name}
              </Button>
            </div>
          ))}
        </div>
      )
    }

    /* ---- 2 of 8: RANGE (single card with bullet list inside info col) ---- */
    case 'range': {
      // Pull bullet content from product.included if available; the design
      // for Reference Sheet uses 2 price-pegged bullets ("Base: ... ($250)"
      // / "Upper end: ... ($450)"). We render up to 2 included items as
      // bullets when present.
      const bullets = product.included.slice(0, 2)
      return (
        <BdCard
          title={product.name}
          body={
            product.description ??
            product.lede ??
            'Scoped per brief. The base sits at the floor of the range; the upper end reflects added scope.'
          }
          bullets={bullets.length > 0 ? bullets.map((b) => `${b.name}: ${b.body}`) : undefined}
          priceNum={`$${p.range.low} – $${p.range.high}`}
          priceNote="scoped per brief"
          ctaLabel="Request a quote"
          ctaHref="/order"
          ctaVariant="primary"
        />
      )
    }

    /* ---- 3 of 8: PER_EXTRA (base + footnote) ---- */
    case 'per_extra': {
      return (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[720px]">
            <div className="relative rounded-xl p-7 sm:p-8 flex flex-col gap-4 bg-parchment-100 border border-border-light">
              <div>
                <div className="font-display text-2xl font-semibold text-ink-900">{product.name}</div>
                {product.eyebrow && (
                  <div className="font-accent text-base text-burgundy-700 -mt-1">
                    {product.eyebrow}
                  </div>
                )}
              </div>
              <div className="flex items-baseline gap-2 py-3 border-y border-dashed border-border-light">
                <span className="font-display text-[2.75rem] font-semibold text-ink-900 leading-none tracking-[-0.02em]">
                  ${p.per_extra.base}
                </span>
                <span className="text-sm text-ink-500">base scope</span>
              </div>
              <p className="text-[0.9375rem] text-ink-700 leading-[1.5]">
                {p.per_extra.extra_label ?? 'Base scope covered in the flat price.'}
              </p>
            </div>
          </div>
          <p className="mt-4 text-[0.9375rem] text-ink-700 italic">
            Each additional member adds{' '}
            <strong className="text-burgundy-700 font-semibold not-italic">
              +${p.per_extra.extra_low} to ${p.per_extra.extra_high}
            </strong>{' '}
            depending on tier complexity.
          </p>
        </div>
      )
    }

    /* ---- 4 of 8: PACK_WITH_QTY (stacked rows inside one bd-card) ---- */
    case 'pack_with_qty': {
      const min = Math.min(...p.pack.packs.map((q) => q.price))
      const max = Math.max(...p.pack.packs.map((q) => q.price))
      const priceLine = p.pack.packs.map((q) => `$${q.price}`).join(' / ')
      return (
        <div className="bg-parchment-100 border border-border-light rounded-lg p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-7 items-center">
          <div>
            <h4 className="font-display text-xl font-semibold text-ink-900 mb-1">
              {product.name}
            </h4>
            <p className="text-[0.9375rem] text-ink-500 leading-[1.55] max-w-[50ch]">
              {product.description ??
                'Pick the volume that fits the brief. Per-piece rate drops as the pack grows.'}
            </p>
            <div className="flex flex-col gap-3 pt-5">
              {p.pack.packs.map((pk) => (
                <div
                  key={pk.qty}
                  className="grid grid-cols-[1fr_auto] gap-4 items-center px-4 py-3 bg-parchment-50 border border-border-light rounded-md"
                >
                  <span className="text-ink-700 text-[0.9375rem]">
                    {pk.label ?? `${pk.qty} in matching style`}
                    <span className="text-ink-400 text-xs ml-2">
                      · ${Math.round(pk.price / pk.qty)}/piece
                    </span>
                  </span>
                  <strong className="font-display text-[1.125rem] text-burgundy-700">
                    ${pk.price}
                  </strong>
                </div>
              ))}
            </div>
          </div>
          <div className="md:border-l md:border-dashed md:border-border-light md:pl-7 md:text-right">
            <span className="block font-display text-[2rem] font-semibold text-burgundy-700 leading-none">
              {min === max ? `$${min}` : priceLine}
            </span>
            <span className="block text-xs font-medium uppercase tracking-[0.1em] text-ink-500 mt-1.5">
              {p.pack.packs.length === 1 ? 'one quantity' : `${p.pack.packs.length} quantities`}
            </span>
            <Button href="/order" variant="primary" size="md" className="mt-4">
              Start a pack
            </Button>
          </div>
        </div>
      )
    }

    /* ---- 5 of 8: PCT_UPLIFT (big +X% display) ---- */
    case 'pct_uplift': {
      return (
        <BdCard
          title={product.name}
          body={
            product.description ??
            'Applied on top of the standard quote for any commercially-used piece. Covers broad commercial use in the agreed scope.'
          }
          priceNum={`+${p.uplift.percent}%`}
          priceNote={p.uplift.label ?? 'of base job price'}
          ctaLabel="Discuss scope"
          ctaHref="/order"
          ctaVariant="primary"
        />
      )
    }

    /* ---- 6 of 8: MONTHLY_RECURRING ---- */
    case 'monthly_recurring': {
      return (
        <div className="bg-parchment-100 border border-border-light rounded-xl p-8 flex flex-col gap-4 max-w-[480px]">
          <div className="flex items-baseline gap-2 pb-3 border-b border-dashed border-border-light">
            <span className="font-display text-[2.75rem] font-semibold text-ink-900 leading-none tracking-[-0.02em]">
              ${p.monthly.monthly_price}
            </span>
            <span className="text-base text-ink-500">/ month</span>
          </div>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {p.monthly.included.map((i) => (
              <li key={i} className="flex gap-2.5 items-start text-[0.9375rem] text-ink-700">
                <CheckIcon className="w-3.5 h-3.5 text-gold-700 flex-shrink-0 mt-1" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
          {p.monthly.cadence && (
            <p className="text-[0.8125rem] text-ink-500 italic">{p.monthly.cadence}</p>
          )}
          <Button href="/subscription" variant="primary" size="md" className="self-start mt-2">
            Subscribe
          </Button>
        </div>
      )
    }

    /* ---- 7 of 8: QUOTE_ONLY ---- */
    case 'quote_only': {
      const priceNum = p.quote.from_price != null ? `From $${p.quote.from_price}` : 'Custom quote'
      return (
        <BdCard
          title={product.name}
          body={
            product.description ??
            'Quote-based pricing. Scope depends on size, detail, and labels. Send a brief and the studio will quote within 48 hours.'
          }
          priceNum={priceNum}
          priceNote="request a quote"
          ctaLabel={p.quote.cta_label ?? 'Send a brief'}
          ctaHref={p.quote.cta_href ?? '/order'}
          ctaVariant="gold"
        />
      )
    }

    /* ---- 8 of 8: FLAT — special-cased for BUNDLE products ---- */
    case 'flat': {
      const isBundle = product.bundleWithSlugs.length > 0
      const uplift = formatBundleUplift(product) ?? `$${p.flat.price}`

      if (isBundle) {
        // Dark-tome .bd-bundle callout matching the design exactly.
        return (
          <div className="relative bg-tome-950 text-cream-50 rounded-xl px-8 py-7 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-6 items-center overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 0% 100%, rgba(212,162,76,0.14), transparent 60%)',
              }}
            />
            <div className="relative">
              <h4 className="font-display text-[1.5rem] font-medium text-cream-50 mb-2 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow">
                Add a matching <em>token</em> for {uplift}
              </h4>
              <p className="text-cream-200 text-[0.9375rem] leading-[1.55] max-w-[52ch]">
                One flat price on top of any portrait tier. Circular crop, VTT-scaled, transparent PNG. Same character, same painting, ready for Roll20 or Foundry the day the portrait ships.
              </p>
            </div>
            <div className="relative font-display text-[3rem] font-semibold text-gold-glow whitespace-nowrap leading-none">
              + {uplift}
            </div>
          </div>
        )
      }

      return (
        <BdCard
          title={product.name}
          body={
            product.description ??
            'Single flat price. No tiers, no add-ons. Includes everything listed below.'
          }
          priceNum={`$${p.flat.price}`}
          priceNote={p.flat.label ?? 'flat price'}
          ctaLabel="Add to a commission"
          ctaHref="/order"
          ctaVariant="primary"
        />
      )
    }
  }
}

/* =====================================================================
   BdCard — canonical `.bd-card` from the V2 design: 1fr / auto grid
   with a left info column and a right price column separated by a
   dashed vertical rule. Optional `bullets` list rendered inside the
   info column (used by range-mode Reference Sheet).
   ===================================================================== */
function BdCard({
  title,
  body,
  bullets,
  priceNum,
  priceNote,
  ctaLabel,
  ctaHref,
  ctaVariant = 'primary',
}: {
  title: string
  body: string
  bullets?: string[]
  priceNum: string
  priceNote: string
  ctaLabel: string
  ctaHref: string
  ctaVariant?: 'primary' | 'gold' | 'outline'
}) {
  return (
    <div className="bg-parchment-100 border border-border-light rounded-lg p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-7 items-center">
      <div>
        <h4 className="font-display text-xl font-semibold text-ink-900 mb-1">
          {title}
        </h4>
        <p className="text-[0.9375rem] text-ink-500 leading-[1.55] max-w-[50ch]">
          {body}
        </p>
        {bullets && bullets.length > 0 && (
          <ul className="flex flex-col gap-2 list-none p-0 mt-4">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2.5 items-start text-[0.9375rem] text-ink-700 leading-[1.5]">
                <CheckIcon className="w-3.5 h-3.5 text-gold-700 flex-shrink-0 mt-1" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="md:border-l md:border-dashed md:border-border-light md:pl-7 md:text-right">
        <span className="block font-display text-[2rem] font-semibold text-burgundy-700 leading-none">
          {priceNum}
        </span>
        <span className="block text-xs font-medium uppercase tracking-[0.1em] text-ink-500 mt-1.5">
          {priceNote}
        </span>
        <Button href={ctaHref} variant={ctaVariant} size="md" className="mt-4">
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}

/* =====================================================================
   Inline icons
   ===================================================================== */
function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="w-3 h-3 text-gold-500" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M9 6l6 6-6 6" />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12l5 5L20 7" />
    </svg>
  )
}

function ClockIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  )
}

function ChartIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M3 12h4l3 8 4-16 3 8h4" />
    </svg>
  )
}

function DeliveryIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16v12H4z" />
      <path d="M4 20h16" />
    </svg>
  )
}

function BundleIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v6m0 0l-3 3m3-3l3 3" />
      <rect x="3" y="14" width="18" height="7" rx="2" />
    </svg>
  )
}
