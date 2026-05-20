import type { Metadata } from 'next'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import Hero from '@/components/home/Hero'

export const metadata: Metadata = {
  title: 'Design Vortek — Preview (M1)',
  description: 'Work-in-progress preview of the new Design Vortek homepage.',
  // ❗ NOT indexed by Google — we don't want WIP pages competing with the real site.
  robots: { index: false, follow: false },
}

/**
 * MILESTONE 1 PREVIEW — Hero only.
 * Coming Soon stays live at "/" for the public.
 * This route at /v2 lets you preview new homepage as we build it section-by-section.
 *
 * As each milestone completes, more sections are added below the Hero.
 */
export default function HomePreviewPage() {
  return (
    <>
      <SiteHeader transparent />
      <main>
        <Hero />

        {/* Placeholder strip showing what's coming next */}
        <section className="bg-parchment-50 py-32 border-t border-border-light">
          <div className="mx-auto max-w-[1280px] px-6 md:px-12 text-center">
            <span className="inline-flex items-center gap-[10px] mb-6">
              <span className="h-px w-6 bg-burgundy-700" aria-hidden="true" />
              <span className="font-body text-[0.75rem] font-semibold uppercase tracking-[0.15em] text-burgundy-700">
                Milestone 1 of 5 · Foundation Complete
              </span>
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-ink-900 mb-4">
              Hero shipped. <em className="font-display italic font-medium text-burgundy-700">More sections coming.</em>
            </h2>
            <p className="text-ink-500 text-lg max-w-xl mx-auto">
              Next up in Milestone 2: services preview, persona rows, portfolio strip, process steps,
              testimonials, blog preview, availability widget, FAQ, and the closing CTA.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
