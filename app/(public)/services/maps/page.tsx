/* =====================================================================
   /services/maps — Battle maps & world maps · quote-only landing.

   Literal port of:
     Claude Design Final/Claude designs New Screens and flow V2/Maps.html

   Sections in source order:
     1. Hero                         (<PageHero>)
     2. Two product cards            (Battle Map · World Map)
     3. Four pricing factors         (parchment-100 band)
     4. Editorial / SEO long-form    (sticky-side TOC + body)
     5. Embedded quote-brief form    (POST /api/inquiry, anchor #map-brief)
     6. Map FAQ (4 questions)
     7. Dark CTA strip (tome-950)

   Cartographic tone — older-feel typography, ink-wash placeholder swatches,
   chip-style radio groups for map_type and tone. No hourly pricing here;
   quote-only by design. All Tailwind utilities reference brand tokens
   declared in app/globals.css (no globals.css edits in this port).
   ===================================================================== */

import type { Metadata } from 'next'
import Link from 'next/link'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import PageHero from '@/components/layout/PageHero'
import Container from '@/components/ui/Container'
import SectionHead from '@/components/ui/SectionHead'
import USDDisclaimer from '@/components/ui/USDDisclaimer'
import Button from '@/components/ui/Button'
import PaperTexture from '@/components/decor/PaperTexture'

export const metadata: Metadata = {
  title: 'Battle maps & world maps · Design Vortek',
  description:
    "Hand-drawn battle maps and region/world maps for D&D and other tabletop games. Gridded, VTT-ready, quote-based pricing. Send a brief and the studio will send a quote.",
  alternates: { canonical: '/services/maps' },
}

/* ds-ph-scene placeholder gradient — forest â†’ burgundy â†’ tome,
   gold ellipse glow at the base. Lifted verbatim from design-system.css. */
const PH_SCENE_BG =
  'radial-gradient(ellipse at 50% 80%, rgba(232,200,128,0.4), transparent 60%), linear-gradient(180deg, #1F4D3A 0%, #6B1F2A 60%, #1a130c 100%)'

/* Small inline icons used inside JSX (kept local so the file is self-contained). */
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-gold-700 flex-shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
)
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
const ChevronRight = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3 text-ink-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
)
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

/* ----- product card data ----- */
const PRODUCTS = [
  {
    label: 'BATTLE MAP · 16×20 · GRIDDED',
    filter: 'none',
    eyebrow: 'for the encounter',
    name: 'Battle Map',
    bullets: [
      'Hand-drawn at 300dpi, room or open-field scale',
      'Gridded or ungridded variants, both delivered',
      'Roll20 + Foundry exports, scaled and tagged',
    ],
    from: 'From $150',
    fromNote: 'scoped by size & detail',
  },
  {
    label: 'WORLD MAP · 12 SETTLEMENTS · LABELED',
    filter: 'hue-rotate(40deg) saturate(0.85)',
    eyebrow: 'for the campaign atlas',
    name: 'World / Region Map',
    bullets: [
      'Decorative, stylized cartography',
      'Hand-lettered labels or digital, your call',
      'Region, continent, or full-world scale',
    ],
    from: 'From $300',
    fromNote: 'scoped by scale & complexity',
  },
] as const

/* ----- pricing-factors data ----- */
const FACTORS = [
  { num: '01', title: 'Size & print scale', body: 'A 16×20 battle map at 300dpi is different work from a 24×36 city spread. Bigger usually means more detail to fill.' },
  { num: '02', title: 'Detail density',     body: 'Empty fields are quick. Dungeons stuffed with furniture, traps, and elevation changes take much longer.' },
  { num: '03', title: 'Color vs ink-wash',  body: 'Full color rendered maps cost more than a clean ink-and-wash treatment. Both are offered at different price points.' },
  { num: '04', title: 'Labels & VTT prep',  body: 'Hand-lettered labels look gorgeous and take time. Digital labels are faster. VTT exports (gridded, scaled, tagged) add a small line item.' },
] as const

/* ----- TOC anchors for the editorial block ----- */
const TOC = [
  { id: 'seo-what',    label: 'What we draw' },
  { id: 'seo-vtt',     label: 'VTT readiness' },
  { id: 'seo-hand',    label: 'Hand-drawn, not generated' },
  { id: 'seo-process', label: 'How a map gets made' },
] as const

/* ----- FAQ data ----- */
const FAQ = [
  {
    q: 'How long does a battle map take?',
    a: 'A standard 16×20 battle map runs about 2 to 3 weeks. Bigger spreads, multi-level dungeons, and heavy detail push toward 4 weeks. Quote turnaround is 48 hours so you’ll know the timeline before committing.',
  },
  {
    q: 'Can you match my existing campaign art?',
    a: 'If the studio painted the character art, yes. If you’re bringing in art from another artist or AI tools, the studio will work to a complementary palette and feel but won’t trace or copy another artist’s linework. Reference is welcome.',
  },
  {
    q: 'Hand-lettered labels or digital?',
    a: 'Both, your choice. Hand-lettered looks gorgeous on world maps and takes longer. Digital labels read more clearly at VTT scale and let you edit names later. Many clients pick hand-lettered for the showpiece and digital for the play layer.',
  },
  {
    q: 'What VTT formats do you export?',
    a: 'Roll20 and Foundry VTT, with grid scaled to 70px per square unless you specify otherwise. Owlbear Rodeo, Fantasy Grounds, Talespire on request. Standard delivery includes a print-ready master file and the gridded VTT export.',
  },
] as const

/* ----- form chip option data ----- */
const MAP_TYPE_OPTIONS = [
  { value: 'battle', label: 'Battle map' },
  { value: 'region', label: 'Region map' },
  { value: 'world',  label: 'World map' },
  { value: 'unsure', label: 'Not sure' },
] as const

const TONE_OPTIONS = [
  { value: 'classic', label: 'Classic fantasy' },
  { value: 'sci-fi',  label: 'Sci-fi' },
  { value: 'horror',  label: 'Horror' },
  { value: 'modern',  label: 'Modern' },
  { value: 'other',   label: 'Other' },
] as const

/* ===================================================================== */

interface MapsPageProps {
  searchParams: Promise<{ sent?: string; error?: string }>
}

export default async function MapsPage({ searchParams }: MapsPageProps) {
  const { sent, error } = await searchParams
  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-parchment-50">

        {/* Breadcrumbs (matches .pd-breadcrumbs from source) */}
        <Container>
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 pt-[108px] text-[0.75rem] tracking-[0.04em] text-ink-500">
            <Link href="/" className="hover:text-burgundy-700 transition-colors">Home</Link>
            <ChevronRight />
            <Link href="/services" className="hover:text-burgundy-700 transition-colors">Services</Link>
            <ChevronRight />
            <span aria-current="page" className="text-ink-700">Maps</span>
          </nav>
        </Container>

        {/* Hero */}
        <PageHero
          eyebrow="GM / world-building · Maps"
          align="left"
          className="pt-6 pb-16"
          title={
            <>
              Maps your players will <em className="font-display italic font-medium text-burgundy-700">steal</em>.
            </>
          }
          description="Hand-drawn battle maps and stylized region maps for tabletop campaigns. VTT-ready exports, gridded or ungridded, hand-lettered labels if you want them. Pricing depends on the brief, so send one."
        />

        {/* ===== 2 product cards ===== */}
        <section className="py-16 md:py-24">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PRODUCTS.map((p) => (
                <article
                  key={p.name}
                  className="bg-parchment-50 border border-border-light rounded-2xl overflow-hidden flex flex-col transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[3px] hover:shadow-md"
                >
                  {/* Image placeholder — ds-ph-scene gradient */}
                  <div
                    className="relative aspect-[16/10]"
                    style={{ background: PH_SCENE_BG, filter: p.filter }}
                  >
                    <span
                      className="absolute top-4 left-4 inline-flex items-center font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-cream-50 bg-[rgba(26,19,12,0.6)] backdrop-blur-[8px] px-2.5 py-1.5 rounded border border-[rgba(244,234,211,0.15)]"
                    >
                      {p.label}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-7 flex flex-col gap-3.5 flex-1">
                    <div className="font-accent text-base text-burgundy-700">{p.eyebrow}</div>
                    <div className="font-display text-[1.625rem] font-semibold text-ink-900 leading-[1.15] tracking-[-0.02em]">
                      {p.name}
                    </div>
                    <ul className="list-none p-0 m-0 flex flex-col gap-2">
                      {p.bullets.map((b) => (
                        <li key={b} className="flex gap-2.5 text-[0.9375rem] text-ink-700 leading-[1.5]">
                          <CheckIcon />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Foot — price block + CTA */}
                    <div className="mt-auto pt-[18px] border-t border-dashed border-border-light flex flex-wrap items-center justify-between gap-3.5">
                      <div>
                        <span className="font-display text-2xl font-semibold text-burgundy-700 leading-[1.1] whitespace-nowrap">
                          {p.from}
                        </span>
                        <span className="block font-body text-[0.6875rem] font-medium text-ink-500 uppercase tracking-[0.08em] mt-1">
                          {p.fromNote}
                        </span>
                      </div>
                      <Button href="#map-brief" variant="primary" size="md">
                        Request a quote
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* USD disclaimer — centered below the product grid */}
            <div className="text-center mt-[18px]">
              <USDDisclaimer variant="inline" />
            </div>
          </Container>
        </section>

        {/* ===== Pricing depends on — 4 factors (parchment-100 band) ===== */}
        <section className="bg-parchment-100 py-16 md:py-24">
          <Container>
            <SectionHead
              eyebrow="Pricing depends on"
              title={<>Four things that <em>move the quote</em></>}
              description="Maps vary in scope more than character pieces, which is why pricing is quote-based. The factors below are the ones that change the number."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {FACTORS.map((f) => (
                <div
                  key={f.num}
                  className="bg-parchment-50 border border-border-light rounded-xl p-5"
                >
                  <div className="font-accent text-[1.125rem] text-gold-700 mb-2">{f.num}</div>
                  <h4 className="font-display text-[1.0625rem] font-semibold text-ink-900 mb-1 leading-[1.25]">
                    {f.title}
                  </h4>
                  <p className="text-sm text-ink-500 leading-[1.5]">{f.body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ===== Editorial / SEO long-form ===== */}
        <section className="py-16 md:py-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 lg:gap-16 items-start">

              {/* Sticky side */}
              <aside className="lg:sticky lg:top-[110px]">
                <div className="mb-3">
                  <span className="inline-flex items-center gap-[10px] font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                    <span className="h-px w-6 bg-burgundy-700" aria-hidden="true" />
                    About map work
                  </span>
                </div>
                <h2
                  className="font-display font-medium leading-[1.1] tracking-tight text-ink-900 mb-3.5 [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}
                >
                  What it takes to draw a <em>good map</em>
                </h2>
                <p className="text-ink-500 text-[0.9375rem] leading-[1.65] max-w-[32ch]">
                  Short context on the craft, the tools, and the choices that shape a quote. Replace this copy with your own SEO content when you&rsquo;re ready.
                </p>

                <nav className="mt-6 border-t border-dashed border-border-light pt-5 flex flex-col gap-1.5">
                  {TOC.map((t) => (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="group inline-flex items-center gap-2 text-[0.8125rem] text-ink-700 tracking-[0.01em] py-1 hover:text-burgundy-700 transition-colors"
                    >
                      <span className="inline-block w-3.5 h-px bg-ink-300 group-hover:bg-burgundy-700 transition-colors" aria-hidden="true" />
                      {t.label}
                    </a>
                  ))}
                </nav>
              </aside>

              {/* Body */}
              <div className="flex flex-col gap-11">

                <article id="seo-what">
                  <h3 className="font-display text-2xl font-semibold text-ink-900 mb-3.5 leading-[1.2] [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700">
                    What the studio <em>actually draws</em>
                  </h3>
                  <p className="text-ink-700 text-base leading-[1.7] mb-3.5 max-w-[64ch]">
                    Hand-drawn battle maps for D&amp;D 5e, Pathfinder 2e, Pathfinder 1e, Call of Cthulhu, Mothership, M&ouml;rk Borg, and homebrew systems. Region and continent maps for long-running campaigns. Stylized world maps for setting books, gazetteers, and player handouts. Multi-level dungeons rendered as separate floors with consistent visual language across the set.
                  </p>
                  <p className="text-ink-700 text-base leading-[1.7] max-w-[64ch]">
                    Most briefs land in one of three buckets. <strong className="font-semibold text-ink-900">Encounter battle maps</strong> at 16&times;20 or 22&times;17 inches, designed for a single fight or a single room. <strong className="font-semibold text-ink-900">City and town maps</strong> showing districts, key buildings, and the streets the party will run through. <strong className="font-semibold text-ink-900">Region and world maps</strong> showing biomes, settlements, trade routes, and the political shape of the setting.
                  </p>
                </article>

                <article id="seo-vtt">
                  <h3 className="font-display text-2xl font-semibold text-ink-900 mb-3.5 leading-[1.2] [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700">
                    VTT ready, table ready
                  </h3>
                  <p className="text-ink-700 text-base leading-[1.7] mb-3.5 max-w-[64ch]">
                    Every map ships with two delivery layers. A print-ready master at 300dpi for the GM who likes to print on tabloid paper, and a virtual tabletop export scaled to the platform you specified. Roll20, Foundry VTT, Owlbear Rodeo, Fantasy Grounds, and Talespire are all standard. Grid scale defaults to 70px per 5-foot square unless you ask for something else.
                  </p>
                  <ul className="list-none p-0 m-0 flex flex-col gap-2 max-w-[64ch]">
                    {[
                      ['Gridded and ungridded versions', 'delivered together, so you can run the same map at the table and on screen without redrawing'],
                      ['Multi-light variants', 'for dungeons that switch from lit to dark mid-encounter'],
                      ['Layered exports on request', 'so you can hide furniture, swap weather, or reveal hidden corridors during play'],
                    ].map(([bold, rest]) => (
                      <li key={bold} className="flex gap-3 text-[0.9375rem] text-ink-700 leading-[1.55]">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-500 mt-[9px] flex-shrink-0" aria-hidden="true" />
                        <span>
                          <strong className="font-semibold text-ink-900">{bold}</strong> {rest}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article id="seo-hand">
                  <h3 className="font-display text-2xl font-semibold text-ink-900 mb-3.5 leading-[1.2] [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700">
                    Hand-drawn, not generated
                  </h3>
                  <p className="text-ink-700 text-base leading-[1.7] mb-3.5 max-w-[64ch]">
                    Every map starts with a thumbnail sketch and ends with hand-painted detail. No AI generators, no asset packs assembled into a mosaic, no traced reference. That choice costs more time and shows up in the finish. It also means the map is unique to your campaign and free of the legal mess that comes with generated work.
                  </p>
                  {/* SEO callout — gold-accent left border, italic Cormorant */}
                  <p
                    className="bg-parchment-100 border border-border-light border-l-4 border-l-gold-500 rounded-md px-[22px] py-[18px] mt-3.5 font-display italic text-[1.0625rem] text-ink-700 leading-[1.55] max-w-[56ch]"
                  >
                    <span className="font-display text-[1.5rem] text-gold-700 leading-none align-[-4px] mr-1">&ldquo;</span>
                    The map should feel like it came from inside the setting. If your campaign has a tone, the cartography should carry it.
                  </p>
                </article>

                <article id="seo-process">
                  <h3 className="font-display text-2xl font-semibold text-ink-900 mb-3.5 leading-[1.2] [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700">
                    How a map gets made
                  </h3>
                  <p className="text-ink-700 text-base leading-[1.7] mb-3.5 max-w-[64ch]">
                    Once you send the brief and approve the quote, the studio works in three visible stages. The first is a rough thumbnail of layout, scale, and major features, sent within five to seven days. Free revisions sit here. Once you sign off, the studio moves to detailed line work and labels, which is where most of the time gets spent. The final stage is color, lighting, and any VTT preparation. You see the work at each stage, and there are two paint-level revisions baked into the quote.
                  </p>
                  <p className="text-ink-700 text-base leading-[1.7] max-w-[64ch]">
                    Most battle maps move from brief to delivery in two to three weeks. Region and world maps run three to five weeks depending on settlement count and labeling style. Rush turnaround is occasionally available for an uplift, ask in the brief.
                  </p>
                </article>

              </div>
            </div>
          </Container>
        </section>

        {/* ===== Quote brief form (parchment-100 band, anchor #map-brief) ===== */}
        <section id="map-brief" className="bg-parchment-100 py-16 md:py-24 scroll-mt-24">
          <Container>
            {/* Submission feedback banner — rendered after the /api/inquiry
                redirect lands back here with ?sent=1 or ?error=… */}
            {sent === '1' && (
              <div className="max-w-[920px] mx-auto mb-6 rounded-xl border border-forest-500/40 bg-forest-100/60 px-5 py-4 text-forest-700 text-[0.9375rem] flex items-start gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                <span>
                  <strong className="font-semibold">Brief received.</strong>{' '}
                  We&rsquo;ll reply within 48 hours with a fixed quote and turnaround estimate. Check your inbox for the confirmation.
                </span>
              </div>
            )}
            {error && (
              <div className="max-w-[920px] mx-auto mb-6 rounded-xl border border-burgundy-500/40 bg-burgundy-100/60 px-5 py-4 text-burgundy-700 text-[0.9375rem]" role="alert">
                <strong className="font-semibold">Something went wrong:</strong>{' '}
                {error === '1' ? 'Please try again, or email hello@designvortex.co.' : decodeURIComponent(error)}
              </div>
            )}

            <form
              action="/api/inquiry"
              method="POST"
              className="bg-parchment-50 border border-border-light rounded-2xl p-7 sm:p-12 max-w-[920px] mx-auto"
              noValidate
            >
              <div className="text-center mb-8 pb-6 border-b border-dashed border-border-light">
                <div className="mb-3 flex justify-center">
                  <span className="inline-flex items-center gap-[10px] font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                    <span className="h-px w-6 bg-burgundy-700" aria-hidden="true" />
                    Map brief
                  </span>
                </div>
                <h3
                  className="font-display font-medium text-ink-900 mb-2 [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
                >
                  Send the <em>scope</em>, get a quote
                </h3>
                <p className="text-ink-500 text-[0.9375rem] max-w-[50ch] mx-auto">
                  One short form. We&rsquo;ll reply within 48 hours with a fixed quote, a turnaround estimate, and any clarifying questions.
                </p>
              </div>

              {/* Map type (radio chips, full-width) */}
              <div className="mb-5">
                <FieldLabel>Map type</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {MAP_TYPE_OPTIONS.map((opt, i) => (
                    <ChipRadio key={opt.value} name="map_type" value={opt.value} label={opt.label} defaultChecked={i === 0} />
                  ))}
                </div>
              </div>

              {/* Size / scope + Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="map-size">Estimated size or scope</FieldLabel>
                  <TextInput id="map-size" name="size" type="text" placeholder="e.g. 16×20, room scale, or 12 settlements" />
                </div>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="map-deadline" optional>Deadline</FieldLabel>
                  <TextInput id="map-deadline" name="deadline" type="date" />
                </div>
              </div>

              {/* Tone */}
              <div className="mb-5">
                <FieldLabel>Tone</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {TONE_OPTIONS.map((opt, i) => (
                    <ChipRadio key={opt.value} name="tone" value={opt.value} label={opt.label} defaultChecked={i === 0} />
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 mb-5">
                <FieldLabel htmlFor="map-desc">Description</FieldLabel>
                <textarea
                  id="map-desc"
                  name="description"
                  placeholder="What the map is for, who's running through it, what's on it. Rooms, terrain, encounters, important features. Half a paragraph is enough to quote."
                  className="w-full bg-parchment-50 border-[1.5px] border-border-medium rounded-md px-4 py-3 font-body text-[0.9375rem] text-ink-900 transition-colors duration-150 ease-out min-h-[96px] resize-y placeholder:text-ink-400 focus:outline-none focus:border-burgundy-700 focus:shadow-[0_0_0_3px_rgba(107,31,42,0.10)]"
                />
              </div>

              {/* Reference URLs */}
              <div className="flex flex-col gap-2 mb-5">
                <FieldLabel htmlFor="map-refs" optionalText="optional, one per line">Reference links</FieldLabel>
                <textarea
                  id="map-refs"
                  name="references"
                  placeholder="Pinterest boards, existing maps you like, mood images."
                  style={{ minHeight: '80px' }}
                  className="w-full bg-parchment-50 border-[1.5px] border-border-medium rounded-md px-4 py-3 font-body text-[0.9375rem] text-ink-900 transition-colors duration-150 ease-out resize-y placeholder:text-ink-400 focus:outline-none focus:border-burgundy-700 focus:shadow-[0_0_0_3px_rgba(107,31,42,0.10)]"
                />
              </div>

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="map-name">Your name</FieldLabel>
                  <TextInput id="map-name" name="name" type="text" placeholder="Aria Mendel" autoComplete="name" required />
                </div>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="map-email">Email</FieldLabel>
                  <TextInput id="map-email" name="email" type="email" placeholder="aria@example.com" autoComplete="email" required />
                </div>
              </div>

              {/* Foot — note + submit */}
              <div className="mt-7 pt-6 border-t border-dashed border-border-light flex flex-wrap items-center justify-between gap-4">
                <p className="text-[0.8125rem] text-ink-500 max-w-[36ch]">
                  No commitment until the quote comes back and you say yes. USD pricing.
                </p>
                <Button type="submit" variant="primary" size="lg">
                  Send map brief
                  <ArrowRight />
                </Button>
              </div>
            </form>
          </Container>
        </section>

        {/* ===== Map FAQ ===== */}
        <section className="py-16 md:py-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr] gap-12 lg:gap-16 max-w-[1080px] mx-auto">
              <div>
                <div className="mb-3">
                  <span className="inline-flex items-center gap-[10px] font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                    <span className="h-px w-6 bg-burgundy-700" aria-hidden="true" />
                    Map FAQ
                  </span>
                </div>
                <h2
                  className="font-display font-semibold leading-[1.1] tracking-tight text-ink-900 mb-4 [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-burgundy-700"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
                >
                  About <em>map work</em>
                </h2>
                <p className="text-ink-500 leading-[1.65] mb-5">
                  The four questions that come up most. Anything else, send it in the brief or ask the studio directly.
                </p>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700 hover:gap-3.5 transition-all"
                >
                  Full FAQ <ArrowRight />
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                {FAQ.map((item, i) => (
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
                        <PlusIcon />
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

        {/* ===== CTA closer (dark tome strip) ===== */}
        <section className="relative bg-tome-950 text-cream-50 py-16 md:py-20 text-center overflow-hidden">
          <PaperTexture variant="cream" opacity={0.5} />
          <div className="relative">
            <Container>
              <h2
                className="font-display font-semibold text-cream-50 leading-[1.15] tracking-tight mb-4 mx-auto max-w-[24ch] [&_em]:not-italic [&_em]:font-display [&_em]:italic [&_em]:font-medium [&_em]:text-gold-glow"
                style={{ fontSize: 'clamp(1.875rem, 4vw, 2.75rem)' }}
              >
                Send a map <em>brief</em>
              </h2>
              <p className="text-base text-cream-200 leading-relaxed max-w-[52ch] mx-auto mb-7">
                Five fields, two minutes. Quote back within 48 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button href="#map-brief" variant="gold" size="lg">
                  Send a brief <ArrowRight />
                </Button>
                <Button href="/contact" variant="outline-cream" size="lg">
                  Talk to the studio
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
   Small form primitives — local to this file so the page is self-contained.
   ===================================================================== */

function FieldLabel({
  children,
  htmlFor,
  optional,
  optionalText,
}: {
  children: React.ReactNode
  htmlFor?: string
  optional?: boolean
  optionalText?: string
}) {
  return (
    <label htmlFor={htmlFor} className="flex justify-between items-baseline text-[0.8125rem] font-semibold text-ink-900">
      <span>{children}</span>
      {(optional || optionalText) && (
        <span className="text-ink-500 font-normal text-xs">{optionalText ?? 'optional'}</span>
      )}
    </label>
  )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-parchment-50 border-[1.5px] border-border-medium rounded-md px-4 py-3 font-body text-[0.9375rem] text-ink-900 transition-colors duration-150 ease-out placeholder:text-ink-400 focus:outline-none focus:border-burgundy-700 focus:shadow-[0_0_0_3px_rgba(107,31,42,0.10)]"
    />
  )
}

/**
 * ChipRadio — pill-shaped radio that visually toggles between
 * outlined (parchment) and filled (burgundy) on :checked. The native
 * <input> is visually hidden but kept focusable for keyboard / a11y.
 */
function ChipRadio({
  name,
  value,
  label,
  defaultChecked,
}: {
  name: string
  value: string
  label: string
  defaultChecked?: boolean
}) {
  return (
    <label className="relative cursor-pointer group">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="absolute opacity-0 pointer-events-none peer"
      />
      <span
        className="inline-flex px-3.5 py-[9px] border-[1.5px] border-border-medium bg-parchment-50 rounded-full text-sm text-ink-700 transition-colors duration-150 ease-out group-hover:border-burgundy-700 peer-checked:bg-burgundy-700 peer-checked:text-cream-50 peer-checked:border-burgundy-700 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-gold-500 peer-focus-visible:outline-offset-2"
      >
        {label}
      </span>
    </label>
  )
}
