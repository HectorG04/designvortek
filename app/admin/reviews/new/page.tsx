import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'
import ReviewForm from '../_ReviewForm'

export const metadata: Metadata = { title: 'New review' }

export default async function NewReviewPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const email = user?.email ?? 'admin@designvortex.co'
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <AdminShell
      user={{ email, initials }}
      title="New review"
      subtitle="Add a manually-entered review"
    >
      <ReviewForm
        mode="create"
        initial={{
          customer_name: '',
          customer_role: '',
          content: '',
          rating: 5,
          service_type: '',
          avatar_url: '',
          is_approved: true,
          is_featured: false,
        }}
      />
    </AdminShell>
  )
}
