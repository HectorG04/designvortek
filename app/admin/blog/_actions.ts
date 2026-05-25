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
  if (!titleRaw) return { error: 'Title is required' as const }

  const slugRaw = String(formData.get('slug') ?? '').trim()
  const slug = slugRaw ? toSlug(slugRaw) : toSlug(titleRaw)
  if (!slug) return { error: 'Could not derive a valid slug' as const }

  const content = String(formData.get('content') ?? '')
  const excerpt = String(formData.get('excerpt') ?? '').trim() || null
  const category = String(formData.get('category') ?? '').trim() || 'Guides'
  const tags = toTextArray(formData.get('tags'))
  const authorName = String(formData.get('author_name') ?? '').trim() || 'Studio'
  const featuredImage = String(formData.get('featured_image') ?? '').trim() || null
  const seoTitle = String(formData.get('seo_title') ?? '').trim() || null
  const seoDescription = String(formData.get('seo_description') ?? '').trim() || null
  const readTime = toNullableNumber(formData.get('read_time_minutes'))

  const isPublished = formData.get('is_published') === 'on' || formData.get('is_published') === 'true'

  const publishedAtRaw = String(formData.get('published_at') ?? '').trim()
  let publishedAt: string | null = null
  if (publishedAtRaw) {
    const d = new Date(publishedAtRaw)
    if (!Number.isNaN(d.getTime())) publishedAt = d.toISOString()
  } else if (isPublished) {
    publishedAt = new Date().toISOString()
  }

  /* Pillar fields. is_pillar requires a genre slug to be meaningful;
   * if the checkbox is on but no genre selected, treat as not-pillar
   * so the partial-unique index on pillar_genre doesn't reject the row. */
  const isPillarRaw = formData.get('is_pillar') === 'on' || formData.get('is_pillar') === 'true'
  const pillarGenreRaw = String(formData.get('pillar_genre') ?? '').trim()
  const pillarGenre = pillarGenreRaw || null
  const isPillar = isPillarRaw && !!pillarGenre

  return {
    payload: {
      title: titleRaw,
      slug,
      content,
      excerpt,
      category,
      tags,
      author_name: authorName,
      featured_image: featuredImage,
      is_published: isPublished,
      published_at: publishedAt,
      read_time_minutes: readTime,
      seo_title: seoTitle,
      seo_description: seoDescription,
      is_pillar: isPillar,
      pillar_genre: isPillar ? pillarGenre : null,
    },
  }
}

export async function createBlogPost(formData: FormData) {
  const result = buildPayload(formData)
  if ('error' in result) {
    return { ok: false as const, error: result.error }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('blog_posts').insert(result.payload)
  if (error) {
    return { ok: false as const, error: error.message }
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  redirect('/admin/blog')
}

export async function updateBlogPost(formData: FormData) {
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
    .from('blog_posts')
    .update({ ...result.payload, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    return { ok: false as const, error: error.message }
  }

  revalidatePath('/admin/blog')
  revalidatePath(`/admin/blog/${id}/edit`)
  revalidatePath('/resources')
  revalidatePath(`/resources/${result.payload.slug}`)
  // also bust the legacy redirect path so the 308 stays fresh
  revalidatePath(`/blog/${result.payload.slug}`)
  redirect('/admin/blog')
}

export async function deleteBlogPost(formData: FormData) {
  const rawId = formData.get('id')
  const id = Number(rawId)
  if (!Number.isFinite(id) || id <= 0) {
    return { ok: false as const, error: 'Invalid id' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('blog_posts').delete().eq('id', id)
  if (error) {
    return { ok: false as const, error: error.message }
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  redirect('/admin/blog')
}
