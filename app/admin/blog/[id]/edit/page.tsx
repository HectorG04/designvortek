import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import BlogForm, { type BlogFormValues } from '../../_BlogForm'

export const metadata: Metadata = { title: 'Edit post' }

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => n.toString().padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: rawId } = await params
  const id = Number(rawId)
  if (!Number.isFinite(id) || id <= 0) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortek.com'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: post } = await admin
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) notFound()

  const initial: BlogFormValues = {
    id: post.id,
    title: post.title ?? '',
    slug: post.slug ?? '',
    excerpt: post.excerpt ?? '',
    content: post.content ?? '',
    featured_image: post.featured_image ?? '',
    category: post.category ?? 'Guides',
    tags: post.tags ?? [],
    author_name: post.author_name ?? '',
    is_published: !!post.is_published,
    published_at: toDatetimeLocal(post.published_at),
    read_time_minutes:
      post.read_time_minutes !== null && post.read_time_minutes !== undefined
        ? String(post.read_time_minutes)
        : '',
    seo_title: post.seo_title ?? '',
    seo_description: post.seo_description ?? '',
  }

  const lastEdited = new Date(post.updated_at ?? post.created_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const status = post.is_published ? 'Published' : 'Draft'

  return (
    <AdminShell
      user={{ email, initials }}
      title="Edit post"
      subtitle={`Auto-saved ${lastEdited} · ${status}`}
      showSearch={false}
    >
      <BlogForm mode="edit" initial={initial} />
    </AdminShell>
  )
}
