import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionLabel from '@/components/ui/SectionLabel'
import Markdown from '@/components/ui/Markdown'
import PaperTexture from '@/components/decor/PaperTexture'
import USDDisclaimer from '@/components/ui/USDDisclaimer'
import { fetchAllProducts } from '@/lib/services-server'
import { fetchAllAddons } from '@/lib/addons-server'
import { formatTurnaround, type ServiceProduct } from '@/lib/services'
import {
  Zap,
  Layers,
  Globe,
  RefreshCcw,
  Circle as CircleIcon,
  Image as ImageIcon,
} from 'lucide-react'

/* =====================================================================
   PRICING — canonical Pricing.html (Latest 23 may 2026) port.

   Layout:
     01  Hero
     02  USD disclaimer
     03  "At a glance" index strip (8 jump-link cards)
     04  Bucket 1 — One-off commissions (7 curated products)
     05  Bucket 2 — Monthly subscription (2 tiers, parchment-100 bg)
     06  Add-ons grid (6 cards from `addons` table)
     07  "Something bigger?" custom quote block
     08  Pricing FAQ (side card + accordion)

   ISR keeps the page fresh against admin edits at most every 60s.
   ===================================================================== */

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Art Commission Prices | Character Portraits & Packages',
  description:
    'Flat-rate character art commission prices — bust from $60, full-body from $120, VTT tokens, party portraits & NPC packs. Hand-painted, never AI. No hidden fees.',
  alternates: { canonical: '/pricing' },
}

/* The 7 curated products surfaced on the pricing page (canonical). The
 * remaining 10 products live in /services/[bucket] detail pages. */
const ONE_OFF_SLUGS = [
  'character-portrait-bust',
  'character-art-full-body',
  'character-reference-sheet',
  'vtt-token-single',
  'party-portrait',
  'npc-pack',
  'battle-map',
] as const

const INDEX_CARDS = [
  { label: 'Character work', name: 'Portrait',        price: 'From $60',      anchor: 'character-portrait-bust' },
  { label: 'Character work', name: 'Full-body',       price: 'From $120',     anchor: 'character-art-full-body' },
  { label: 'Character work', name: 'Reference sheet', price: '$250 – $450',   anchor: 'character-reference-sheet' },
  { label: 'Tabletop',       name: 'VTT tokens',      price: 'From $25',      anchor: 'vtt-token-single' },
  { label: 'Group work',     name: 'Party portrait',  price: 'From $350',     anchor: 'party-portrait' },
  { label: 'Campaign',       name: 'NPC pack',        price: 'From $220',     anchor: 'npc-pack' },
  { label: 'Campaign',       name: 'Battle map',      price: 'From $150',     anchor: 'battle-map' },
  { label: 'Monthly',        name: 'Subscription',    price: 'From $75 / mo', anchor: 'subscription' },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Why flat-rate instead of hourly?',
    a: "Because you deserve to know the price before we start. Hourly billing punishes care, the artist who polishes for an extra two hours should not cost you more. Fixed scope, fixed price, every time.",
  },
  {
    q: 'How does payment work on a one-off commission?',
    a: 'A **30% deposit** holds your slot (refundable until first sketch). The remaining 70% on delivery. All payments through Stripe — cards, Apple Pay, Google Pay, all common methods.',
  },
  {
    q: 'How does a subscription bill?',
    a: 'Subscriptions bill the full month upfront on signup — no deposit, no separate delivery charge. Each cycle is billed on the same day. Pause any time; the next cycle skips and you are not charged for it.',
  },
  {
    q: 'What if I need to cancel?',
    a: 'Before first sketch: **100% refundable**. After first sketch: deposit covers our sketch work. After paint begins: pro-rated based on stage completed. See full [refund policy](/refunds).',
  },
  {
    q: 'Do you charge in any other currency?',
    a: 'No. All pricing is **USD only**. International cards are billed at the current exchange rate by your card provider.',
  },
  {
    q: 'What about commercial use?',
    a: 'Personal use is included. **Commercial licensing is +40% of the base job price (flat)**, covering books, paid streaming, merchandise, indie game assets, and paid Patreons. See [/commercial](/commercial) for retainer arrangements.',
  },
]

const ArrowRightMd = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const ClockSvg = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
  </svg>
)

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0 text-gold-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
)

const ADDON_ICONS: Record<string, React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>> = {
  rush:       Zap,
  psd:        Layers,
  commercial: Globe,
  revision:   RefreshCcw,
  token:      CircleIcon,
  print:      ImageIcon,
}

/* =====================================================================
   Page
   ===================================================================== */
export default async function PricingPage() {
  const [allProducts, addons] = await Promise.all([
    fetchAllProducts(),
    fetchAllAddons(),
  ])

  const productBySlug = new Map(allProducts.map((p) => [p.slug, p]))
  const oneOffProducts = ONE_OFF_SLUGS
    .map((slug) => productBySlug.get(slug))
    .filter((p): p is ServiceProduct => p != null)
  const subscriptionProducts = allProducts
    .filter((p) => p.bucket === 'subscription')
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const tokenBundle = productBySlug.get('character-token-bundle')

  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-parchment-50">

        {/* 01 — Hero */}
        <PageHero
          eyebrow="Pricing"
          title={
            <>
              Transparent pricing.<br />
              <em className="font-display italic font-medium text-burgundy-700">No surprises.</em>
            </>
          }
          description="Flat-rate quotes on one-off commissions, predictable monthly bundles on subscriptions. The quote you approve is the price we charge — no hourly games, no scope creep, no sneaking surcharges onto delivery."
        />

        {/* 02 — USD disclaimer */}
        <section className="pb-8">
          <Container>
            <div className="flex justify-center">
              <USDDisclaimer variant="block" />
            </div>
          </Container>
        </section>

        {/* 03 — Index strip "At a glance" */}
        <section className="pb-12 md:pb-16">
          <Container>
            <div className="mb-7">
              <div className="mb-2">
                <SectionLabel>Jump to a price</SectionLabel>
              </div>
              <h2 className="font-display font-semibold text-ink-900 leading-[1.15] tracking-tight [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(1.5rem, 2.4vw, 1.875rem)' }}>
                At a <em>glance</em>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {INDEX_CARDS.map((card) => (
                <a
                  key={card.anchor}
                  href={`#${card.anchor}`}
                  className="flex flex-col gap-1.5 px-5 py-[18px] bg-parchment-100 border border-border-light rounded-md no-underline text-ink-900 hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-[0_6px_18px_rgba(0,0,0,0.06)] transition-[transform,border-color,box-shadow] duration-150"
                >
                  <span className="font-body text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-ink-500">
                    {card.label}
                  </span>
                  <span className="font-display text-xl leading-[1.2]">{card.name}</span>
                  <span className="font-display text-burgundy-700 text-base mt-1">{card.price}</span>
                </a>
              ))}
            </div>
          </Container>
        </section>

        {/* 04 — Bucket 1: One-off commissions */}
        <section className="pb-16 md:pb-24">
          <Container>
            <BucketHead
              eyebrow="One-off commissions"
              titleStart="Pay "
              titleEm="once"
              titleEnd=", own forever"
              description="Fixed-price commissions for the pieces you'll commission once and live with for years. Two revisions on every character tier, 30% deposit to hold the slot, balance due on delivery."
            />
            <div className="flex flex-col gap-16">
              {oneOffProducts.map((product) => (
                <ProductBlock
                  key={product.slug}
                  product={product}
                  tokenBundle={product.slug === 'vtt-token-single' ? tokenBundle : undefined}
                />
              ))}
            </div>
          </Container>
        </section>

        {/* 05 — Bucket 2: Monthly subscription (parchment-100 bg) */}
        <section id="subscription" className="bg-parchment-100 py-16 md:py-24">
          <Container>
            <BucketHead
              eyebrow="Monthly subscription"
              titleStart="Your campaign's "
              titleEm="steady supply"
              description="For active GMs who burn through tokens and NPCs faster than the party burns through hit points. Hand-painted, delivered the 15th of every month, pause whenever the table goes on hiatus."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[780px] mx-auto">
              {subscriptionProducts.map((p, i) => (
                <SubscriptionTierCard key={p.slug} product={p} featured={i === 1} />
              ))}
            </div>
            <p className="text-center max-w-[60ch] mx-auto mt-8 text-ink-500 text-[0.9375rem] leading-[1.6]">
              Cycles ship the 15th of each month. Subscriptions bill the full month upfront on signup — no deposit. See the{' '}
              <Link href="/subscription" className="text-burgundy-700 underline underline-offset-4 hover:text-burgundy-500">
                full subscription page
              </Link>{' '}
              for cadence, swap rules, and what&apos;s intentionally outside the plan.
            </p>
          </Container>
        </section>

        {/* 06 — Add-ons */}
        <section className="pb-16 md:pb-24 pt-16 md:pt-24">
          <Container>
            <div className="text-center max-w-[640px] mx-auto mb-12">
              <div className="mb-3 inline-flex"><SectionLabel>Add-ons</SectionLabel></div>
              <h2 className="font-display font-semibold text-ink-900 leading-[1.1] tracking-tight mb-3 [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Optional <em>extras</em>
              </h2>
              <p className="text-ink-500 leading-[1.65]">Tweaks and upgrades available on any one-off commission.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1080px] mx-auto">
              {addons.map((addon) => {
                const Icon = ADDON_ICONS[addon.slug] ?? Zap
                return (
                  <div
                    key={addon.slug}
                    className="bg-parchment-50 border border-border-light rounded-xl p-6 flex gap-4 items-start"
                  >
                    <span className="w-10 h-10 rounded-md bg-gold-100 text-gold-700 inline-flex items-center justify-center flex-shrink-0">
                      <Icon size={18} strokeWidth={1.5} />
                    </span>
                    <div className="flex-1">
                      <div className="font-display text-[1.125rem] font-semibold text-ink-900 leading-snug">{addon.name}</div>
                      <p className="text-[0.875rem] text-ink-700 leading-[1.55] mt-1">{addon.description}</p>
                      <div className="font-display text-burgundy-700 text-[1rem] font-semibold mt-2">
                        {addon.displayText}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Container>
        </section>

        {/* 07 — "Something bigger?" custom quote block */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="relative overflow-hidden bg-tome-950 text-cream-50 rounded-3xl px-8 py-10 md:px-14 md:py-12">
              <PaperTexture variant="cream" opacity={0.35} />
              <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
                <div>
                  <div className="text-[0.75rem] uppercase tracking-[0.14em] text-gold-glow font-semibold mb-3">
                    Custom projects
                  </div>
                  <h3 className="font-display font-semibold leading-[1.15] mb-3 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                      style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}>
                    Something <em>bigger</em>?
                  </h3>
                  <p className="text-cream-200 leading-[1.65] max-w-[58ch]">
                    Book covers, indie game asset packs, merch design, concept art, or commissions over $1,000 — let&apos;s talk. Custom scopes get custom quotes, and frequent collaborators get retainer arrangements.
                  </p>
                </div>
                <div className="flex flex-col gap-3 lg:items-end">
                  <Link
                    href="/order"
                    className="inline-flex items-center justify-center gap-2 bg-gold-500 text-ink-900 hover:bg-gold-300 transition-colors px-7 py-3.5 rounded-full text-[0.8125rem] font-semibold uppercase tracking-[0.12em] whitespace-nowrap"
                  >
                    Request a custom quote <ArrowRightMd />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 border border-cream-200 text-cream-50 hover:bg-cream-50 hover:text-ink-900 transition-colors px-6 py-3 rounded-full text-[0.75rem] font-semibold uppercase tracking-[0.12em] whitespace-nowrap"
                  >
                    Email hello@designvortek.com
                  </Link>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* 08 — Pricing FAQ */}
        <section className="pb-16 md:pb-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 max-w-[1080px] mx-auto">
              <div>
                <div className="mb-3">
                  <SectionLabel>Pricing questions</SectionLabel>
                </div>
                <h2
                  className="font-display font-semibold leading-[1.1] tracking-tight text-ink-900 mb-4 [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  The fine <em>print</em>
                </h2>
                <p className="text-ink-500 leading-[1.65] mb-5">
                  Common questions about payment, refunds, subscriptions, and what&rsquo;s covered.
                </p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:gap-3.5 transition-all"
                >
                  Full FAQ <ArrowRightMd />
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {FAQ.map((item, i) => (
                  <details
                    key={i}
                    open={i === 0}
                    className="group bg-parchment-100 border border-border-light rounded-xl open:bg-parchment-50 open:border-border-medium open:shadow-sm transition-colors"
                  >
                    <summary className="list-none cursor-pointer flex items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-display text-xl font-semibold text-ink-900 leading-[1.3]">
                        {item.q}
                      </span>
                      <span className="flex-shrink-0 w-8 h-8 rounded-full inline-flex items-center justify-center transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] bg-parchment-50 text-burgundy-700 border border-border-medium group-open:bg-burgundy-700 group-open:text-cream-50 group-open:border-burgundy-700 group-open:rotate-45">
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

      </main>
      <SiteFooter />
    </>
  )
}

/* =====================================================================
   BucketHead — the two big section headers (.pr-bucket-head)
   ===================================================================== */
function BucketHead({
  eyebrow,
  titleStart,
  titleEm,
  titleEnd,
  description,
}: {
  eyebrow: string
  titleStart: string
  titleEm: string
  titleEnd?: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-2 pb-7 border-b border-border-light mb-12">
      <div className="inline-flex"><SectionLabel>{eyebrow}</SectionLabel></div>
      <h2 className="font-display font-semibold leading-[1.1] text-ink-900 [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
          style={{ fontSize: 'clamp(2rem, 3.2vw, 2.5rem)' }}>
        {titleStart}<em>{titleEm}</em>{titleEnd ?? ''}
      </h2>
      <p className="text-ink-700 max-w-[60ch] leading-[1.6]">{description}</p>
    </div>
  )
}

/* =====================================================================
   ProductBlock — one product, matching .bd-product layout.
   Includes the optional token-bundle callout for VTT Tokens.
   ===================================================================== */
function ProductBlock({
  product,
  tokenBundle,
}: {
  product: ServiceProduct
  tokenBundle?: ServiceProduct
}) {
  return (
    <div id={product.slug} className="scroll-mt-28">
      {/* Head: H2 + best-for + turnaround pill */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-display text-[1.75rem] sm:text-[2rem] font-semibold text-ink-900 leading-[1.15]">
            {product.name}
          </h2>
          {product.eyebrow && (
            <div className="font-accent text-burgundy-700 text-[1.125rem] mt-0.5">
              {product.eyebrow}
            </div>
          )}
        </div>
        <div className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-500 bg-parchment-100 border border-border-light rounded-full px-3 py-1.5">
          <ClockSvg />
          Turnaround <strong className="text-ink-900 font-semibold ml-1">{formatTurnaround(product)}</strong>
        </div>
      </div>

      {/* Lede */}
      {product.lede && (
        <p className="text-ink-700 leading-[1.65] max-w-[68ch] mb-6">{product.lede}</p>
      )}

      {/* Token-bundle callout — only for vtt-token-single block */}
      {tokenBundle && (
        <div className="bg-tome-950 text-cream-50 rounded-2xl px-6 py-5 md:px-8 md:py-6 flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h4 className="font-display text-[1.25rem] font-semibold leading-snug [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow">
              Bundle: add a matching <em>token</em> to any portrait
            </h4>
            <p className="text-cream-200 text-[0.9375rem] leading-[1.5] mt-1 max-w-[60ch]">
              One flat price on top of any portrait tier. Circular crop, VTT-scaled, transparent PNG. Same character, same painting, ready the day the portrait ships.
            </p>
          </div>
          <div className="font-display text-[1.75rem] font-semibold text-gold-glow whitespace-nowrap">
            + ${tokenBundleUplift(tokenBundle)}
          </div>
        </div>
      )}

      {/* Pricing display by mode */}
      <PricingDisplay product={product} />

      {/* Party portrait per-extra footnote */}
      {product.slug === 'party-portrait' && (
        <div className="bg-parchment-100 border-l-[3px] border-gold-500 px-5 py-3.5 rounded-r-md text-[0.9375rem] text-ink-700 leading-[1.5] mt-5">
          <strong className="font-display text-[1.0625rem] text-burgundy-700">5th+ figure:</strong>{' '}
          each additional party member adds <strong>+$80 to $120</strong> depending on tier complexity. Quoted exactly before paint begins.
        </div>
      )}
    </div>
  )
}

function tokenBundleUplift(bundle: ServiceProduct): number {
  if (bundle.pricing.mode === 'flat') return bundle.pricing.flat.price
  if (bundle.bundleUpliftCents != null) return Math.round(bundle.bundleUpliftCents / 100)
  return 25
}

/* =====================================================================
   PricingDisplay — pricing card per mode
   ===================================================================== */
function PricingDisplay({ product }: { product: ServiceProduct }) {
  const p = product.pricing
  switch (p.mode) {
    case 'tiered': {
      return (
        <div className={`grid gap-4 ${p.tiers.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-[720px]' : 'grid-cols-1 sm:grid-cols-3'}`}>
          {p.tiers.map((tier) => (
            <div
              key={tier.name}
              className={
                'relative rounded-2xl px-7 py-8 flex flex-col gap-4 ' +
                (tier.featured
                  ? 'bg-parchment-50 border border-gold-500 shadow-[0_8px_24px_rgba(201,160,74,0.18)]'
                  : 'bg-parchment-100 border border-border-light')
              }
            >
              {tier.flag && (
                <span className="absolute -top-2.5 right-6 bg-gold-500 text-ink-900 font-body text-[0.625rem] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">
                  {tier.flag}
                </span>
              )}
              <div>
                <div className="font-display text-2xl font-semibold text-ink-900">{tier.name}</div>
                {tier.note && <div className="font-accent text-base text-burgundy-700 -mt-1">{tier.note}</div>}
              </div>
              <div className="flex items-baseline gap-2 py-3 border-y border-dashed border-border-light">
                <span className="font-display text-[2.75rem] font-semibold text-ink-900 leading-none -tracking-[0.02em]">
                  ${tier.price}
                </span>
              </div>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0 flex-1">
                {tier.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex gap-2.5 items-start text-[0.9375rem] text-ink-700 leading-[1.4]">
                    <CheckSvg />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )
    }
    case 'range': {
      return (
        <BdCard
          heading={product.name}
          body={product.included[0]?.body ?? 'Quoted inside this range per brief.'}
          bullets={[
            'Base: 3 views, single outfit, neutral expressions ($250)',
            'Upper end: 4 views, alt outfit, expression studies, detail call-outs ($450)',
          ]}
          priceNum={`$${p.range.low} – $${p.range.high}`}
          priceNote="scoped per brief"
          ctaLabel="Request a quote"
          ctaHref="/order"
        />
      )
    }
    case 'pack_with_qty': {
      return (
        <BdCard
          heading={product.name}
          body="Pick the volume that fits the campaign. Each piece delivered with matching color treatment and border style across the set."
          stack={p.pack.packs.map((pk) => ({
            label: pk.label ?? `${pk.qty} ${product.name.toLowerCase()}`,
            price: `$${pk.price}`,
          }))}
          priceNum={p.pack.packs.map((pk) => `$${pk.price}`).join(' / ')}
          priceNote={`${p.pack.packs.length} quantities`}
          ctaLabel="Start a pack"
          ctaHref="/order"
        />
      )
    }
    case 'quote_only': {
      return (
        <BdCard
          heading={product.name}
          body="Quote-based pricing because the scope varies wildly with size, detail, and label count. Send a brief and the studio will quote within 48 hours."
          bullets={[
            'Most small encounter maps land $150 – $300',
            'Multi-room dungeons or overworlds: $400+',
          ]}
          priceNum={p.quote.from_price != null ? `From $${p.quote.from_price}` : 'Custom quote'}
          priceNote="request a quote"
          ctaLabel={p.quote.cta_label ?? 'Send a brief'}
          ctaHref={p.quote.cta_href ?? '/order'}
        />
      )
    }
    case 'flat': {
      return (
        <BdCard
          heading={product.name}
          body={product.lede ?? ''}
          priceNum={`$${p.flat.price}`}
          priceNote={p.flat.label ?? 'flat price'}
          ctaLabel="Order"
          ctaHref="/order"
        />
      )
    }
    case 'per_extra': {
      return (
        <BdCard
          heading={product.name}
          body={`Base price includes the first figure. Each extra adds $${p.per_extra.extra_low}–$${p.per_extra.extra_high}.`}
          priceNum={`From $${p.per_extra.base}`}
          priceNote={`+$${p.per_extra.extra_low}–${p.per_extra.extra_high} per extra`}
          ctaLabel="Request a quote"
          ctaHref="/order"
        />
      )
    }
    case 'pct_uplift':
    case 'monthly_recurring':
    default:
      return null
  }
}

/* =====================================================================
   BdCard — single-row pricing card (.bd-card)
   ===================================================================== */
function BdCard({
  heading,
  body,
  bullets,
  stack,
  priceNum,
  priceNote,
  ctaLabel,
  ctaHref,
}: {
  heading: string
  body: string
  bullets?: string[]
  stack?: { label: string; price: string }[]
  priceNum: string
  priceNote: string
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 bg-parchment-100 border border-border-light rounded-2xl px-6 py-7 md:px-8 md:py-9">
      <div>
        <h4 className="font-display text-[1.25rem] font-semibold text-ink-900 leading-snug mb-2">{heading}</h4>
        <p className="text-[0.9375rem] text-ink-700 leading-[1.55] mb-3">{body}</p>
        {bullets && bullets.length > 0 && (
          <ul className="flex flex-col gap-2 list-none p-0 m-0 mt-3">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2.5 items-start text-[0.9375rem] text-ink-700 leading-[1.4]">
                <CheckSvg />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
        {stack && stack.length > 0 && (
          <div className="flex flex-col gap-2 mt-3">
            {stack.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 bg-parchment-50 border border-border-light rounded-md px-4 py-2.5">
                <span className="text-[0.9375rem] text-ink-700">{row.label}</span>
                <strong className="font-display text-burgundy-700 text-[1.0625rem]">{row.price}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="lg:border-l lg:border-border-light lg:pl-6 flex flex-col justify-center gap-2">
        <span className="font-display text-[2rem] font-semibold text-burgundy-700 leading-none -tracking-[0.015em]">
          {priceNum}
        </span>
        <span className="text-[0.8125rem] text-ink-500">{priceNote}</span>
        <Link
          href={ctaHref}
          className="self-start mt-3 inline-flex items-center gap-2 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 transition-colors px-5 py-2.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em]"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}

/* =====================================================================
   SubscriptionTierCard — Companion / GM tier
   ===================================================================== */
function SubscriptionTierCard({ product, featured }: { product: ServiceProduct; featured: boolean }) {
  if (product.pricing.mode !== 'monthly_recurring') return null
  const m = product.pricing.monthly
  return (
    <div
      className={
        'relative rounded-2xl px-7 py-8 flex flex-col gap-4 ' +
        (featured
          ? 'bg-parchment-50 border border-gold-500 shadow-[0_8px_24px_rgba(201,160,74,0.18)]'
          : 'bg-parchment-50 border border-border-light')
      }
    >
      {featured && (
        <span className="absolute -top-2.5 right-6 bg-gold-500 text-ink-900 font-body text-[0.625rem] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">
          Most picked
        </span>
      )}
      <div>
        <div className="font-display text-2xl font-semibold text-ink-900">
          {product.name.replace(/^Campaign Companion.*?(·|\.)?\s*/, '') || product.name}
        </div>
        {product.eyebrow && (
          <div className="font-accent text-base text-burgundy-700 -mt-1">{product.eyebrow}</div>
        )}
      </div>
      <div className="flex items-baseline gap-2 py-3 border-y border-dashed border-border-light">
        <span className="font-display text-[2.5rem] font-semibold text-ink-900 leading-none -tracking-[0.02em]">
          ${m.monthly_price}
        </span>
        <span className="text-[0.875rem] text-ink-500">/ month</span>
      </div>
      <ul className="flex flex-col gap-2.5 list-none p-0 m-0 flex-1">
        {m.included.map((i) => (
          <li key={i} className="flex gap-2.5 items-start text-[0.9375rem] text-ink-700 leading-[1.4]">
            <CheckSvg />
            <span>{i}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/subscription"
        className={
          'inline-flex items-center justify-center px-5 py-2.5 rounded-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] mt-1 ' +
          (featured
            ? 'bg-burgundy-700 text-cream-50 hover:bg-burgundy-500'
            : 'border border-burgundy-700 text-burgundy-700 hover:bg-burgundy-700 hover:text-cream-50')
        }
      >
        Start {product.name.includes('GM') ? 'GM tier' : 'Companion'}
      </Link>
    </div>
  )
}
