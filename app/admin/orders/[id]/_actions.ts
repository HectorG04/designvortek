'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

const VALID_STATUSES = [
  'pending', 'reviewing', 'quoted', 'accepted',
  'in_progress', 'delivered', 'closed', 'cancelled',
] as const

type OrderStatus = (typeof VALID_STATUSES)[number]

function isValidStatus(value: string): value is OrderStatus {
  return (VALID_STATUSES as readonly string[]).includes(value)
}

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

export async function updateOrderNotes(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'))
  const notes = String(formData.get('internal_notes') ?? '')

  if (!Number.isFinite(id) || id <= 0) return

  const admin = createAdminClient()
  await admin
    .from('commission_orders')
    .update({ internal_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', id)

  revalidatePath(`/admin/orders/${id}`)
}

export async function sendQuote(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'))
  const price = Number(formData.get('quoted_price'))

  if (!Number.isFinite(id) || id <= 0) return
  if (!Number.isFinite(price) || price < 0) return

  const admin = createAdminClient()
  await admin
    .from('commission_orders')
    .update({
      quoted_price: price,
      status: 'quoted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
}
