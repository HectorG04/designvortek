'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="inline-flex items-center gap-2 border border-border-light text-ink-700 text-xs font-semibold tracking-[0.1em] uppercase px-5 py-2.5 rounded-full hover:border-burgundy-500 hover:text-burgundy-700 transition"
    >
      <LogOut size={14} />
      Sign Out
    </button>
  )
}
