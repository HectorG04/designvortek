import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Sidebar etc. will be added once we wire up real admin pages.
  // For now: simple wrapper. Middleware handles auth protection.
  return <>{children}</>
}
