/* =====================================================================
   ADDONS — client-safe types + canonical 6-row snapshot.

   The 6 canonical add-ons per HANDOFF v2 §1.5. Seeded to the database
   by migration 0006; this module gives the public surfaces (pricing
   page, order form quote panel, admin) a snapshot fallback in case
   the table is empty or unreachable.
   ===================================================================== */

export interface Addon {
  slug: string
  name: string
  description: string
  /** Flat USD cents — null when this addon uses percent_uplift. */
  flatCents: number | null
  /** Percent uplift applied to base — null when this addon is flat. */
  percentUplift: number | null
  /** Human-facing label: "+$50", "+40% on base", "From $60". */
  displayText: string
  sortOrder: number
}

export const ADDONS: readonly Addon[] = [
  {
    slug: 'rush',
    name: 'Rush delivery',
    description: 'Cuts portrait & token turnaround to 3 days.',
    flatCents: 5000,
    percentUplift: null,
    displayText: '+$50',
    sortOrder: 10,
  },
  {
    slug: 'psd',
    name: 'Layered PSD',
    description: 'Source file with separated layers.',
    flatCents: 3000,
    percentUplift: null,
    displayText: '+$30',
    sortOrder: 20,
  },
  {
    slug: 'commercial',
    name: 'Commercial license',
    description:
      'Books, merch, paid streaming, paid Patreon, indie game assets, Kickstarter rewards.',
    flatCents: null,
    percentUplift: 40,
    displayText: '+40% on base',
    sortOrder: 30,
  },
  {
    slug: 'revision',
    name: 'Extra revision',
    description: 'Third paint-stage revision round beyond the 2 included.',
    flatCents: 4000,
    percentUplift: null,
    displayText: '+$40',
    sortOrder: 40,
  },
  {
    slug: 'token',
    name: 'Matching VTT token',
    description:
      'Round, transparent PNG of the character. Ordered with or after a portrait.',
    flatCents: 2500,
    percentUplift: null,
    displayText: '+$25',
    sortOrder: 50,
  },
  {
    slug: 'print',
    name: 'Print delivery',
    description: '11×14 or 16×20 giclée print, via partner studio.',
    flatCents: 6000,
    percentUplift: null,
    displayText: 'From $60',
    sortOrder: 60,
  },
]

export function getAllAddons(): Addon[] {
  return [...ADDONS].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getAddonBySlug(slug: string): Addon | undefined {
  return ADDONS.find((a) => a.slug === slug)
}

/* --------------------------------------------------------------------
   Pure pricing helpers — applied client- or server-side, never touch
   Stripe. These exist so the order form, admin quote builder, and the
   webhook handler all agree on quote_total_cents math.
   -------------------------------------------------------------------- */

export interface AppliedAddon {
  slug: string
  label: string
  cents: number
}

/** Resolve a list of addon slugs against a base price (in cents) to
 *  a list of {slug, label, cents} entries — percent uplifts get
 *  multiplied against the base. Unknown slugs are silently dropped. */
export function resolveAddons(
  baseCents: number,
  addonSlugs: readonly string[],
): AppliedAddon[] {
  const out: AppliedAddon[] = []
  for (const slug of addonSlugs) {
    const a = getAddonBySlug(slug)
    if (!a) continue
    if (a.percentUplift != null) {
      out.push({
        slug: a.slug,
        label: a.name,
        cents: Math.round(baseCents * (a.percentUplift / 100)),
      })
    } else if (a.flatCents != null) {
      out.push({ slug: a.slug, label: a.name, cents: a.flatCents })
    }
  }
  return out
}

/** Sum addon cents. */
export function sumAddons(applied: readonly AppliedAddon[]): number {
  return applied.reduce((acc, a) => acc + a.cents, 0)
}

/** 30% of total, rounded to nearest cent. Use for deposit calculation. */
export function depositFor(totalCents: number): number {
  return Math.round(totalCents * 0.3)
}
