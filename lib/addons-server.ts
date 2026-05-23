import 'server-only'
/* =====================================================================
   ADDONS — server fetcher with snapshot fallback.

   Same pattern as services-server / portfolio-pieces-server.
   ===================================================================== */

import { createAdminClient } from '@/lib/supabase/server'
import { ADDONS, getAllAddons, type Addon } from '@/lib/addons'

type AddonRow = {
  slug: string
  name: string
  description: string | null
  flat_cents: number | null
  percent_uplift: number | null
  display_text: string
  sort_order: number
  is_active: boolean
}

function rowToAddon(row: AddonRow): Addon {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    flatCents: row.flat_cents,
    percentUplift: row.percent_uplift,
    displayText: row.display_text,
    sortOrder: row.sort_order,
  }
}

export async function fetchAllAddons(): Promise<Addon[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('addons')
      .select('slug,name,description,flat_cents,percent_uplift,display_text,sort_order,is_active')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error || !data || data.length === 0) return getAllAddons()
    return (data as unknown as AddonRow[]).map(rowToAddon)
  } catch {
    return getAllAddons()
  }
}

export { ADDONS, type Addon }
