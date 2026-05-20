import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import PortfolioForm, { type PortfolioFormValues } from '../../_PortfolioForm'

export const metadata: Metadata = { title: 'Edit portfolio piece' }

export default async function EditPortfolioPiecePage({
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
  const { data: piece } = await admin
    .from('portfolio_pieces')
    .select('*')
    .eq('id', id)
    .single()

  if (!piece) notFound()

  const initial: PortfolioFormValues = {
    id: piece.id,
    title: piece.title ?? '',
    slug: piece.slug ?? '',
    category: piece.category ?? 'Character Art',
    description: piece.description ?? '',
    image_url: piece.image_url ?? '',
    thumbnail_url: piece.thumbnail_url ?? '',
    additional_images: piece.additional_images ?? [],
    tags: piece.tags ?? [],
    commissioned_by: piece.commissioned_by ?? '',
    tools_used: piece.tools_used ?? '',
    hours_spent: piece.hours_spent !== null && piece.hours_spent !== undefined ? String(piece.hours_spent) : '',
    style: piece.style ?? '',
    is_featured: !!piece.is_featured,
    is_published: !!piece.is_published,
    sort_order: piece.sort_order !== null && piece.sort_order !== undefined ? String(piece.sort_order) : '0',
    seo_title: piece.seo_title ?? '',
    seo_description: piece.seo_description ?? '',
  }

  const lastEdited = new Date(piece.updated_at ?? piece.created_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <AdminShell
      user={{ email, initials }}
      title="Edit portfolio piece"
      subtitle={`Last updated ${lastEdited}`}
      showSearch={false}
    >
      <PortfolioForm mode="edit" initial={initial} />
    </AdminShell>
  )
}
