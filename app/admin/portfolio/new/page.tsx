import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import PortfolioForm, { type PortfolioFormValues } from '../_PortfolioForm'

export const metadata: Metadata = { title: 'New portfolio piece' }

export default async function NewPortfolioPiecePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortex.co'
  const initials = email.slice(0, 2).toUpperCase()

  const initial: PortfolioFormValues = {
    title: '',
    slug: '',
    category: 'Character Art',
    description: '',
    image_url: '',
    thumbnail_url: '',
    additional_images: [],
    tags: [],
    commissioned_by: '',
    tools_used: '',
    hours_spent: '',
    style: '',
    is_featured: false,
    is_published: false,
    sort_order: '0',
    seo_title: '',
    seo_description: '',
  }

  return (
    <AdminShell
      user={{ email, initials }}
      title="New portfolio piece"
      subtitle="Upload a new commission, character, or scene"
      showSearch={false}
    >
      <PortfolioForm mode="create" initial={initial} />
    </AdminShell>
  )
}
