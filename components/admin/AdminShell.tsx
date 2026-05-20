'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, MessageSquare,
  ImageIcon, Pencil, Briefcase, Star,
  CalendarDays, Users,
  Folder, Settings,
  Search, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  badge?: number | string
  badgeMuted?: boolean
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Inbox',
    items: [
      { href: '/admin',            label: 'Dashboard',  icon: LayoutDashboard },
      { href: '/admin/orders',     label: 'Orders',     icon: ShoppingBag,    badge: 3 },
      { href: '/admin/inquiries',  label: 'Inquiries',  icon: MessageSquare,  badge: 5 },
    ],
  },
  {
    label: 'Library',
    items: [
      { href: '/admin/portfolio',  label: 'Portfolio',  icon: ImageIcon },
      { href: '/admin/blog',       label: 'Blog',       icon: Pencil },
      { href: '/admin/services',   label: 'Services',   icon: Briefcase },
      { href: '/admin/reviews',    label: 'Reviews',    icon: Star,           badge: 2, badgeMuted: true },
    ],
  },
  {
    label: 'Schedule',
    items: [
      { href: '/admin/availability', label: 'Availability', icon: CalendarDays },
      { href: '/admin/customers',    label: 'Customers',    icon: Users },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { href: '/admin/media',     label: 'Media',     icon: Folder },
      { href: '/admin/settings',  label: 'Settings',  icon: Settings },
    ],
  },
]

interface AdminShellProps {
  user: { email: string; initials: string }
  title: string
  subtitle?: string
  actions?: React.ReactNode
  showSearch?: boolean
  children: React.ReactNode
}

export default function AdminShell({
  user,
  title,
  subtitle,
  actions,
  showSearch = true,
  children,
}: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="lg:grid lg:grid-cols-[248px_1fr] min-h-screen bg-parchment-50">

      {/* Mobile topbar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-parchment-100 border-b border-border-light sticky top-0 z-30">
        <Link href="/admin" className="inline-flex items-center gap-2 text-burgundy-700">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-full border border-gold-500/40" />
            <div className="absolute inset-0 flex items-center justify-center text-burgundy-700">
              <span className="font-display text-[0.7rem] font-bold">DV</span>
            </div>
          </div>
          <span className="font-display text-base font-semibold text-ink-900">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 inline-flex items-center justify-center rounded-md text-ink-700 hover:bg-parchment-200"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-parchment-100 border-r border-border-light p-4 lg:p-6 flex flex-col gap-5',
          'lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto',
          !mobileOpen && 'hidden lg:flex'
        )}
      >
        {/* Brand */}
        <Link
          href="/admin"
          className="flex items-center gap-3 px-2 pb-4 border-b border-border-light text-burgundy-700 hover:text-burgundy-500 transition-colors"
        >
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="absolute inset-0 rounded-full border border-gold-500/40" />
            <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-gold-300/40 to-burgundy-100/0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-burgundy-700 text-xs font-bold">DV</span>
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold text-ink-900 tracking-tight">Design Vortek</span>
            <span className="text-[0.625rem] uppercase tracking-[0.15em] text-ink-500 mt-0.5">Studio admin</span>
          </div>
        </Link>

        {/* Nav groups */}
        <nav className="flex flex-col gap-2 flex-1" aria-label="Admin">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-ink-500 px-3 pt-3 pb-2">
                {group.label}
              </p>
              <div className="flex flex-col gap-px">
                {group.items.map((item) => {
                  const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-[0.9375rem] transition-colors relative',
                        active
                          ? 'bg-parchment-50 text-burgundy-700 font-medium shadow-[inset_2px_0_0_var(--color-gold-500)]'
                          : 'text-ink-700 hover:bg-parchment-200 hover:text-ink-900'
                      )}
                    >
                      <Icon size={18} strokeWidth={1.6} className={cn('flex-shrink-0', active ? 'opacity-100' : 'opacity-70')} />
                      <span>{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            'ml-auto min-w-[22px] text-center text-[0.6875rem] font-bold px-2 py-0.5 rounded-full',
                            item.badgeMuted
                              ? 'bg-parchment-300 text-ink-700'
                              : 'bg-burgundy-700 text-cream-50'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="pt-4 border-t border-border-light">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 p-2 rounded-md hover:bg-parchment-200 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-cream-50 font-display text-sm font-semibold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-burgundy-700), var(--color-gold-700))' }}
            >
              {user.initials}
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-[0.8125rem] font-semibold text-ink-900 truncate">{user.email}</span>
              <span className="text-[0.6875rem] text-ink-500 mt-0.5">Studio owner</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0">
        {/* Sticky header */}
        <header className="bg-parchment-50 border-b border-border-light px-5 lg:px-8 py-5 sticky top-0 z-20 flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            <h1 className="font-display text-2xl font-semibold text-ink-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-[0.8125rem] text-ink-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {showSearch && (
              <div className="relative hidden md:block w-64">
                <Search size={16} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="search"
                  placeholder="Search…"
                  className="w-full bg-parchment-100 border border-border-light rounded-md pl-9 pr-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:bg-parchment-50 transition-colors"
                />
              </div>
            )}
            {actions}
          </div>
        </header>

        {/* Content */}
        <div className="px-5 lg:px-8 py-6 lg:py-8">{children}</div>
      </div>
    </div>
  )
}
