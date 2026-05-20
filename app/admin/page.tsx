import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from './_SignOutButton'

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false, follow: false },
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-parchment-50 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-burgundy-700 text-xs font-semibold tracking-[0.2em] uppercase mb-2">
              Admin Dashboard
            </p>
            <h1 className="font-display text-3xl text-ink-900">
              Welcome back<em className="font-display italic">.</em>
            </h1>
            <p className="text-ink-500 text-sm mt-2">{user?.email}</p>
          </div>
          <SignOutButton />
        </div>

        <div className="bg-parchment-100 border border-border-light rounded-2xl p-8">
          <p className="font-display text-ink-900 text-xl mb-3">Coming soon.</p>
          <p className="text-ink-500 text-sm leading-relaxed">
            The full admin CMS — orders, portfolio manager, blog editor, slot availability, and more — will be built once the new public-facing designs are finalized.
          </p>
          <p className="text-ink-500 text-sm leading-relaxed mt-3">
            For now, your Supabase project handles all data — view it directly in the{' '}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-burgundy-700 hover:text-burgundy-500 underline underline-offset-4"
            >
              Supabase dashboard
            </a>.
          </p>
        </div>
      </div>
    </div>
  )
}
