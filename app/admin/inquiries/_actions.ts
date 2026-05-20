'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'

function parseId(formData: FormData): number | null {
  const raw = formData.get('id')
  const id = Number(raw)
  if (!Number.isFinite(id) || id <= 0) return null
  return id
}

function revalidateAll() {
  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
}

export async function markAsRead(formData: FormData): Promise<void> {
  const id = parseId(formData)
  if (id === null) return

  const admin = createAdminClient()
  await admin.from('inquiries').update({ is_read: true }).eq('id', id)
  revalidateAll()
}

export async function markAsUnread(formData: FormData): Promise<void> {
  const id = parseId(formData)
  if (id === null) return

  const admin = createAdminClient()
  await admin.from('inquiries').update({ is_read: false }).eq('id', id)
  revalidateAll()
}

export async function archive(formData: FormData): Promise<void> {
  const id = parseId(formData)
  if (id === null) return

  const admin = createAdminClient()
  await admin
    .from('inquiries')
    .update({ is_archived: true, is_read: true })
    .eq('id', id)
  revalidateAll()
}

export async function unarchive(formData: FormData): Promise<void> {
  const id = parseId(formData)
  if (id === null) return

  const admin = createAdminClient()
  await admin.from('inquiries').update({ is_archived: false }).eq('id', id)
  revalidateAll()
}
