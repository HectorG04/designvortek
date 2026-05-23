/* =====================================================================
   /subscription — Campaign Companion landing.

   Literal port of `Claude Design Final/Claude designs New Screens and
   flow V2/Subscription.html` into Next.js/Tailwind v4.

   Sections (mirrors the source HTML 1:1):
     01  Hero (PageHero) with reassurance pills
     02  How it works — 4-step horizontal strip
     03  Two tiers — $75 Companion / $150 GM (featured) · 6 months minimum
     04  Cadence callout — dark tome card, ships 15th
     05  What's NOT included — 3 honesty cards
     06  FAQ — 6 items, side+list layout
     07  CTA closer — dark tome strip with gold + outline-cream CTAs
   ===================================================================== */

import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
import SectionLabel from '@/components/ui/SectionLabel'
import Button from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'
import SubscribeButton from './_SubscribeButton'

export const metadata: Metadata = {
  title: 'Campaign Companion subscription · Design Vortek',
  description:
    "Monthly tokens, NPCs, and maps for active D&D campaigns. Hand-painted by the studio, delivered the 15th of every month. Pause or cancel any time.",
  alternates: { canonical: '/subscription' },
}

/* ---------- small icon helpers ---------- */
const CheckIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
)

const ArrowRightIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const DollarIcon = ({ className = 'w-[11px] h-[11px]' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
)

/* ---------- data ---------- */
const HOWTO_STEPS = [
  {
    n: 1,
    h: 'Pick a tier',
    p: "Companion if your table mostly needs tokens. GM tier if you're running a long-form campaign with worlds to draw.",
  },
  {
    n: 2,
    h: 'Send your campaign brief',
    p: "One quick form. Setting, tone, who's at the table, what's coming up. Less than ten minutes.",
  },
  {
    n: 3,
    h: 'Receive every 15th',
    p: 'Your allotment lands as a downloadable bundle on the 15th of each month. Sketches shared mid-cycle.',
  },
  {
    n: 4,
    h: 'Pause or cancel',
    p: 'Hit pause before the next cycle and skip a month, or cancel outright. No phone trees, no questions.',
  },
]

const COMPANION_FEATURES = [
  '10 hand-painted tokens',
  '2 NPC portraits, simpler render',
  'VTT-ready 512 + 1024 exports',
  '6 months minimum · pause up to 2 cycles',
  'Swap items mid-cycle if your plan changes',
]

const GM_FEATURES = [
  '15 hand-painted tokens',
  '4 NPC portraits',
  '1 battle map (standard size, gridded)',
  'Style continuity across the campaign',
  'Priority response on briefs',
  '6 months minimum · pause up to 2 cycles',
]

const NOT_INCLUDED = [
  {
    title: 'Full party portraits',
    body:
      "Group compositions live as their own piece, not a monthly slot. Commission a party portrait separately when the table's ready to sit for one.",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <circle cx="15" cy="8" r="3" />
        <path d="M4 20c0-3 2-5 5-5s5 2 5 5M15 20c0-2 1-4 3-4s2 1 2 4" />
      </svg>
    ),
  },
  {
    title: 'Oversize battle maps',
    body:
      'The included battle map is standard size. Bigger spreads, multi-floor dungeons, or world-scale layouts get quoted separately so the time is real.',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
  },
  {
    title: 'Commercial licensing',
    body: (
      <>
        Subscriptions cover personal campaign use. Streaming, paid Patreon tiers, or merch get licensed per piece. See the{' '}
        <Link href="/commercial" className="text-burgundy-700 border-b border-gold-500 hover:text-burgundy-500">
          commercial page
        </Link>
        .
      </>
    ),
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
]

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Can I pause my subscription?',
    a: "Yes. Pause from your account before the next billing date and we skip the cycle. Your slot stays held for up to two months. Beyond that you can resume any time, you'll just go back in the queue.",
  },
  {
    q: "What if I don't use my monthly allotment?",
    a: "Subscription pieces don't roll over. The studio reserves time for your cycle each month and that time gets spent on your bundle. If you anticipate a quiet month, pause instead so the value isn't lost.",
  },
  {
    q: 'Can I swap a token for an NPC?',
    a: 'Within the same tier of complexity, yes. NPC portraits and tokens are interchangeable on a roughly 2-to-1 basis (one NPC counts as two tokens of equivalent effort). Flag it in your monthly brief.',
  },
  {
    q: 'What happens if I have a complex month?',
    a: "Send the brief anyway. If a request is more involved than the standard allotment covers, we'll quote the overflow separately and let you choose whether to add it to the cycle or punt to next month.",
  },
  {
    q: 'How do I cancel?',
    a: 'One button in your account, or one email to the studio. Cancellations made before the next billing date take effect immediately, no last cycle owed. Your delivered art stays yours forever.',
  },
  {
    q: 'Is there a deposit on subscriptions?',
    a: "No. The 30% deposit applies to one-off commissions. Subscriptions bill the full month upfront on signup, and the studio commits the time to your cycle. After that it's monthly recurring until you pause or cancel.",
  },
]

/* ---------- page ---------- */
export default function SubscriptionPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-parchment-50">

        {/* 01 — Hero */}
        <PageHero
          eyebrow="Campaign companion · Subscription"
          title={
            <>
              Your campaign&apos;s{' '}
              <em className="font-display italic font-medium text-burgundy-700">
                steady supply
              </em>
              .
            </>
          }
          description="For active GMs who burn through tokens and NPCs faster than the players burn through hit points. Hand-painted, delivered the 15th of every month, pause whenever the table goes on hiatus."
        >
          <ul className="-mt-3.5 flex flex-wrap gap-2.5 justify-center list-none p-0">
            {['Cancel any time', 'Pause for a month', 'Every piece by hand'].map((label) => (
              <li key={label}>
                <span className="inline-flex items-center gap-1.5 bg-parchment-50 border border-border-light rounded-full px-3 py-1.5 text-[0.8125rem] text-ink-700">
                  <CheckIcon className="w-[13px] h-[13px] text-forest-500" />
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </PageHero>

        {/* 02 — How it works */}
        <section className="py-16 md:py-24">
          <Container>
            <SectionHead
              eyebrow="How it works"
              title={<>Four steps, <em>then we paint</em></>}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 bg-parchment-100 border border-border-light rounded-2xl px-9 py-10">
              {HOWTO_STEPS.map((step) => (
                <div key={step.n}>
                  <div className="w-8 h-8 rounded-full bg-parchment-50 border-[1.5px] border-gold-500 text-gold-700 font-display text-[1.0625rem] font-semibold inline-flex items-center justify-center mb-3.5">
                    {step.n}
                  </div>
                  <h4 className="font-display text-lg font-semibold text-ink-900 mb-1.5">{step.h}</h4>
                  <p className="text-sm text-ink-500 leading-[1.5]">{step.p}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* 03 — Tier cards */}
        <section className="py-16 md:py-24 bg-parchment-100">
          <Container>
            <SectionHead
              eyebrow="Two tiers"
              title={<>Pick the <em>cadence</em> that fits</>}
              description="Same hand-painted craft, two volumes. Switch tiers between cycles if your campaign changes shape."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[920px] mx-auto">

              {/* Companion */}
              <TierCard
                tierSlug="subscription-companion"
                name="Companion"
                best="active GMs with a token-hungry table"
                price="$75"
                priceNote="10 tokens + 2 NPCs · 6 mo min"
                features={COMPANION_FEATURES}
                ctaLabel="Start Companion"
                ctaVariant="outline"
              />

              {/* GM tier — featured */}
              <TierCard
                tierSlug="subscription-gm"
                featured
                flag="Most picked"
                name="GM tier"
                best="long-form campaigns that need a steady drip"
                price="$150"
                priceNote="tokens + NPCs + 1 map · 6 mo min"
                features={GM_FEATURES}
                ctaLabel="Start GM tier"
                ctaVariant="primary"
              />

            </div>
          </Container>
        </section>

        {/* 04 — Cadence callout */}
        <section className="pt-8 pb-16 md:pb-24">
          <Container>
            <div className="relative overflow-hidden rounded-2xl bg-tome-950 text-cream-50 px-6 py-6 md:px-9 md:py-7 flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Soft gold radial glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  background:
                    'radial-gradient(ellipse at 100% 50%, rgba(212,162,76,0.10), transparent 60%)',
                }}
              />
              <div className="relative w-14 h-14 rounded-full inline-flex items-center justify-center flex-shrink-0 border" style={{ background: 'rgba(212,162,76,0.12)', borderColor: 'rgba(212,162,76,0.30)' }}>
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-gold-glow" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 11h18M12 15l2 2 4-4" />
                </svg>
              </div>
              <div className="relative flex-1">
                <div className="text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-gold-glow mb-1">
                  Cadence
                </div>
                <h3 className="font-display text-[1.375rem] font-medium text-cream-50 mb-1.5 [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow">
                  Every cycle ships the <em>15th of the month</em>
                </h3>
                <p className="text-cream-200 text-[0.9375rem] leading-[1.6] max-w-[60ch]">
                  New subscriptions started after the 10th roll over to the next cycle, so your first bundle never lands rushed or thin. Sketches go out mid-cycle so you can flag changes before paint begins.
                </p>
              </div>
            </div>
          </Container>
        </section>

        {/* 05 — What's NOT included */}
        <section className="py-16 md:py-24">
          <Container>
            <SectionHead
              eyebrow="Honest scope"
              title={<>What a subscription <em>doesn&apos;t cover</em></>}
              description="Three things we keep outside the monthly plan so quality stays where it should."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {NOT_INCLUDED.map((card) => (
                <div
                  key={card.title}
                  className="bg-parchment-50 border border-border-light rounded-xl p-6"
                >
                  <div className="w-9 h-9 rounded-full bg-burgundy-100 inline-flex items-center justify-center mb-3.5 text-burgundy-700">
                    {card.icon}
                  </div>
                  <h4 className="font-display text-lg font-semibold text-burgundy-700 mb-1.5">
                    {card.title}
                  </h4>
                  <p className="text-sm text-ink-500 leading-[1.55]">{card.body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* 06 — FAQ */}
        <section className="py-16 md:py-24 bg-parchment-100">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-8 lg:gap-16 max-w-[1080px] mx-auto">
              <div>
                <div className="mb-3">
                  <SectionLabel>Subscription FAQ</SectionLabel>
                </div>
                <h2
                  className="font-display font-semibold leading-[1.1] tracking-tight text-ink-900 mb-4 [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  The fine <em>print</em>
                </h2>
                <p className="text-ink-500 leading-[1.65] mb-5">
                  Common questions about pausing, swapping, and what happens when life gets busy mid-cycle.
                </p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:gap-3.5 transition-all"
                >
                  Full FAQ <ArrowRightIcon />
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {FAQ_ITEMS.map((item, i) => (
                  <details
                    key={item.q}
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
                      <p>{item.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* 07 — CTA closer (dark tome) */}
        <section className="relative bg-tome-950 text-cream-50 py-20 text-center overflow-hidden">
          <PaperTexture variant="cream" opacity={0.5} />
          <div className="relative">
            <Container>
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.15] tracking-tight mb-4 mx-auto max-w-[24ch] [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
              >
                Start your <em>campaign companion</em>
              </h2>
              <p className="text-base text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-7">
                Pick a tier, send a short brief, get the first bundle on the next cycle.
              </p>

              <div className="inline-flex flex-wrap gap-3 justify-center">
                <Button href="/order" variant="gold" size="lg">
                  Start the subscription <ArrowRightIcon />
                </Button>
                <Button href="/contact" variant="outline-cream" size="lg">
                  Ask a question first
                </Button>
              </div>

              <div className="mt-[18px] flex justify-center">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.6875rem] font-medium whitespace-nowrap tracking-[0.01em]"
                  style={{
                    background: 'rgba(244,234,211,0.08)',
                    color: 'var(--color-cream-200)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    lineHeight: 1,
                  }}
                >
                  <DollarIcon className="w-[11px] h-[11px] text-gold-glow" />
                  Billed in USD · international cards converted at current rate
                </span>
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
   TierCard — single subscription tier card matching `.sd-tier` /
   `.sd-tier.featured` from the source design.
   ===================================================================== */
function TierCard({
  featured = false,
  flag,
  name,
  best,
  price,
  priceNote,
  features,
  ctaLabel,
  ctaVariant,
  tierSlug,
}: {
  featured?: boolean
  flag?: string
  name: string
  best: string
  price: string
  priceNote: string
  features: string[]
  ctaLabel: string
  ctaVariant: 'primary' | 'outline'
  /** Canonical subscription tier slug — when present the CTA wires
   *  through to Stripe Checkout via /api/subscriptions/checkout. */
  tierSlug?: 'subscription-companion' | 'subscription-gm'
}) {
  return (
    <div
      className={
        'relative rounded-2xl px-7 py-8 flex flex-col gap-4 transition-all duration-[250ms] hover:-translate-y-1 ' +
        (featured
          ? 'bg-parchment-50 border border-gold-500 shadow-[0_8px_24px_rgba(201,160,74,0.18)]'
          : 'bg-parchment-100 border border-border-light hover:shadow-md')
      }
    >
      {flag && (
        <span className="absolute -top-2.5 right-6 bg-gold-500 text-ink-900 font-body text-[0.625rem] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">
          {flag}
        </span>
      )}

      <div className="font-display text-2xl font-semibold text-ink-900">{name}</div>
      <div className="font-accent text-base text-burgundy-700 -mt-2">{best}</div>

      <div className="flex items-baseline gap-1.5 py-3 border-y border-dashed border-border-light">
        <span className="font-display text-[2.5rem] font-semibold text-ink-900 leading-none tracking-[-0.02em]">
          {price}
        </span>
        <span className="text-sm text-ink-500 font-body">/ month</span>
        <span className="text-sm text-ink-500 ml-auto">{priceNote}</span>
      </div>

      <ul className="flex flex-col gap-2.5 list-none p-0 m-0 flex-1">
        {features.map((f) => (
          <li key={f} className="flex gap-2.5 items-start text-[0.9375rem] text-ink-700 leading-[1.4]">
            <CheckIcon className="w-3.5 h-3.5 text-gold-700 flex-shrink-0 mt-1" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-2">
        {tierSlug ? (
          <SubscribeButton tier={tierSlug} label={ctaLabel} variant={ctaVariant} />
        ) : (
          <Button href="/order" variant={ctaVariant} size="md" className="w-full">
            {ctaLabel}
          </Button>
        )}
      </div>

      <span className="mt-3 mx-auto flex w-fit items-center gap-1.5 rounded-full bg-parchment-200 border border-black/[0.04] px-3.5 py-1.5 text-xs font-medium tracking-[0.01em] text-ink-500 whitespace-nowrap leading-none">
        <DollarIcon className="w-[11px] h-[11px] text-gold-700" />
        USD · international cards billed at current rate
      </span>
    </div>
  )
}
