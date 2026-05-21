import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import BlogForm, { type BlogFormValues } from '../_BlogForm'

export const metadata: Metadata = { title: 'New post' }

export default async function NewBlogPostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortex.co'
  const initials = email.slice(0, 2).toUpperCase()

  const initial: BlogFormValues = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: 'Guides',
    tags: [],
    author_name: email.split('@')[0] || 'Studio',
    is_published: false,
    published_at: '',
    read_time_minutes: '',
    seo_title: '',
    seo_description: '',
  }

  return (
    <AdminShell
      user={{ email, initials }}
      title="New post"
      subtitle="Draft a new article"
      showSearch={false}
    >
      <BlogForm mode="create" initial={initial} />
    </AdminShell>
  )
}
