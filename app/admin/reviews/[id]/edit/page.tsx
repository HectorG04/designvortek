import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import ReviewForm from '../../_ReviewForm'

export const metadata: Metadata = { title: 'Edit review' }

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = parseInt(id, 10)
  if (!Number.isFinite(numericId)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortex.co'
  const initials = email.slice(0, 2).toUpperCase()

  const admin = createAdminClient()
  const { data: review } = await admin
    .from('reviews')
    .select('*')
    .eq('id', numericId)
    .maybeSingle()

  if (!review) notFound()

  return (
    <AdminShell
      user={{ email, initials }}
      title="Edit review"
      subtitle={review.customer_name}
    >
      <ReviewForm
        mode="edit"
        initial={{
          id: review.id,
          customer_name: review.customer_name ?? '',
          customer_role: review.customer_role ?? '',
          content: review.content ?? '',
          rating: review.rating ?? 5,
          service_type: review.service_type ?? '',
          avatar_url: review.avatar_url ?? '',
          is_approved: !!review.is_approved,
          is_featured: !!review.is_featured,
        }}
      />
    </AdminShell>
  )
}
