import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Design Vortek Admin' },
  robots: { index: false, follow: false },
}

/**
 * Admin layout — auth is enforced by /proxy.ts (Next.js 16 middleware).
 * Each admin page wraps its own content in <AdminShell> to access the user prop.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
