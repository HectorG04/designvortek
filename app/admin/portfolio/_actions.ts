'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function toTextArray(value: FormDataEntryValue | null): string[] | null {
  if (!value) return null
  const items = String(value)
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
  return items.length ? items : null
}

function toNullableNumber(value: FormDataEntryValue | null): number | null {
  if (value === null) return null
  const str = String(value).trim()
  if (str === '') return null
  const n = Number(str)
  return Number.isFinite(n) ? n : null
}

function buildPayload(formData: FormData) {
  const titleRaw = String(formData.get('title') ?? '').trim()
  const slugRaw = String(formData.get('slug') ?? '').trim()
  const category = String(formData.get('category') ?? '').trim() || 'Character Art'
  const imageUrl = String(formData.get('image_url') ?? '').trim()

  if (!titleRaw) return { error: 'Title is required' as const }
  if (!imageUrl) return { error: 'Cover image URL is required' as const }

  const slug = slugRaw ? toSlug(slugRaw) : toSlug(titleRaw)
  if (!slug) return { error: 'Could not derive a valid slug' as const }

  const description = String(formData.get('description') ?? '').trim() || null
  const tags = toTextArray(formData.get('tags'))
  const additionalImages = toTextArray(formData.get('additional_images'))
  const commissionedBy = String(formData.get('commissioned_by') ?? '').trim() || null
  const toolsUsed = String(formData.get('tools_used') ?? '').trim() || null
  const hoursSpent = toNullableNumber(formData.get('hours_spent'))
  const style = String(formData.get('style') ?? '').trim() || null
  const thumbnailUrl = String(formData.get('thumbnail_url') ?? '').trim() || null
  const seoTitle = String(formData.get('seo_title') ?? '').trim() || null
  const seoDescription = String(formData.get('seo_description') ?? '').trim() || null
  const sortOrder = toNullableNumber(formData.get('sort_order')) ?? 0

  const isPublished = formData.get('is_published') === 'on' || formData.get('is_published') === 'true'
  const isFeatured = formData.get('is_featured') === 'on' || formData.get('is_featured') === 'true'

  return {
    payload: {
      title: titleRaw,
      slug,
      category,
      description,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      additional_images: additionalImages,
      tags,
      commissioned_by: commissionedBy,
      tools_used: toolsUsed,
      hours_spent: hoursSpent,
      style,
      is_featured: isFeatured,
      is_published: isPublished,
      seo_title: seoTitle,
      seo_description: seoDescription,
      sort_order: sortOrder,
    },
  }
}

export async function createPortfolioPiece(formData: FormData) {
  const result = buildPayload(formData)
  if ('error' in result) {
    return { ok: false as const, error: result.error }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('portfolio_pieces').insert(result.payload)
  if (error) {
    return { ok: false as const, error: error.message }
  }

  revalidatePath('/admin/portfolio')
  revalidatePath('/portfolio')
  redirect('/admin/portfolio')
}

export async function updatePortfolioPiece(formData: FormData) {
  const rawId = formData.get('id')
  const id = Number(rawId)
  if (!Number.isFinite(id) || id <= 0) {
    return { ok: false as const, error: 'Invalid id' }
  }

  const result = buildPayload(formData)
  if ('error' in result) {
    return { ok: false as const, error: result.error }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('portfolio_pieces')
    .update({ ...result.payload, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { ok: false as const, error: error.message }
  }

  revalidatePath('/admin/portfolio')
  revalidatePath(`/admin/portfolio/${id}/edit`)
  revalidatePath('/portfolio')
  revalidatePath(`/portfolio/${result.payload.slug}`)
  redirect('/admin/portfolio')
}

export async function deletePortfolioPiece(formData: FormData) {
  const rawId = formData.get('id')
  const id = Number(rawId)
  if (!Number.isFinite(id) || id <= 0) {
    return { ok: false as const, error: 'Invalid id' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('portfolio_pieces').delete().eq('id', id)
  if (error) {
    return { ok: false as const, error: error.message }
  }

  revalidatePath('/admin/portfolio')
  revalidatePath('/portfolio')
  redirect('/admin/portfolio')
}
