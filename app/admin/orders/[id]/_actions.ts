'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

const VALID_STATUSES = [
  'pending',
  'reviewing',
  'quoted',
  'accepted',
  'in_progress',
  'delivered',
  'closed',
  'cancelled',
] as const

type OrderStatus = (typeof VALID_STATUSES)[number]

function isValidStatus(value: string): value is OrderStatus {
  return (VALID_STATUSES as readonly string[]).includes(value)
}

/**
 * Update an order's status (no email/notifications wired yet).
 * Used by the right-rail status changer on the order detail page.
 */
export async function updateOrderStatus(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'))
  const status = String(formData.get('status') ?? '')

  if (!Number.isFinite(id) || id <= 0) return
  if (!isValidStatus(status)) return

  const admin = createAdminClient()
  await admin
    .from('commission_orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
}

/**
 * Save admin-only internal notes (markdown supported).
 */
export async function updateOrderNotes(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'))
  const notes = String(formData.get('internal_notes') ?? '')

  if (!Number.isFinite(id) || id <= 0) return

  const admin = createAdminClient()
  await admin
    .from('commission_orders')
    .update({
      internal_notes: notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
}

/**
 * Set a quoted price + optional custom adjustment and move the order
 * into the `quoted` state.
 *
 * The custom adjustment supports negotiation (discounts, surcharges,
 * loyalty rates, multi-piece bundles) without exposing those on the
 * public site. Three columns drive it:
 *
 *   adjustment_label  → shown to the customer on the quote email
 *   adjustment_amount → signed integer in USD whole dollars (negative = discount)
 *   adjustment_reason → admin-only context, never shared with the customer
 *
 * Total quote = quoted_price + adjustment_amount.
 */
export async function sendQuote(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'))
  const price = Number(formData.get('quoted_price'))

  if (!Number.isFinite(id) || id <= 0) return
  if (!Number.isFinite(price) || price < 0) return

  // Custom adjustment (optional). Empty → null. Negative is allowed.
  const adjLabelRaw = String(formData.get('adjustment_label') ?? '').trim()
  const adjLabel = adjLabelRaw.length === 0 ? null : adjLabelRaw

  const adjAmountRaw = String(formData.get('adjustment_amount') ?? '').trim()
  let adjAmount: number | null = null
  if (adjAmountRaw.length > 0) {
    // Strip "$", "+", commas, and any en/em dashes the customer might have typed.
    const cleaned = adjAmountRaw.replace(/[$+,\s]/g, '').replace(/[–—]/g, '-')
    const n = Number(cleaned)
    if (Number.isFinite(n)) adjAmount = Math.round(n)
  }

  const adjReasonRaw = String(formData.get('adjustment_reason') ?? '').trim()
  const adjReason = adjReasonRaw.length === 0 ? null : adjReasonRaw

  const admin = createAdminClient()
  await admin
    .from('commission_orders')
    .update({
      quoted_price: price,
      adjustment_label: adjLabel,
      adjustment_amount: adjAmount,
      adjustment_reason: adjReason,
      status: 'quoted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
}
