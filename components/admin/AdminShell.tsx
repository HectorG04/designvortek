'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  ImageIcon,
  Pencil,
  Briefcase,
  Star,
  CalendarDays,
  Users,
  Folder,
  Settings,
  Search,
  Menu,
  X,
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
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, badge: 3 },
      { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare, badge: 7 },
    ],
  },
  {
    label: 'Library',
    items: [
      { href: '/admin/portfolio', label: 'Portfolio', icon: ImageIcon },
      { href: '/admin/blog', label: 'Blog', icon: Pencil },
      { href: '/admin/services', label: 'Services', icon: Briefcase },
      { href: '/admin/reviews', label: 'Reviews', icon: Star, badge: 2, badgeMuted: true },
    ],
  },
  {
    label: 'Schedule',
    items: [
      { href: '/admin/availability', label: 'Availability', icon: CalendarDays },
      { href: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { href: '/admin/media', label: 'Media', icon: Folder },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
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
      <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-parchment-100 border-b border-border-light sticky top-0 z-30">
        <Link href="/admin" className="inline-flex items-center gap-2.5 text-burgundy-700">
          <BrandMark />
          <span className="font-display text-base font-semibold text-ink-900 tracking-tight">
            Design Vortek
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 inline-flex items-center justify-center rounded-md text-ink-700 hover:bg-parchment-200 transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={18} strokeWidth={1.8} /> : <Menu size={18} strokeWidth={1.8} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-parchment-100 border-r border-border-light p-6 flex flex-col gap-5',
          'lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto',
          !mobileOpen && 'hidden lg:flex',
        )}
      >
        {/* Brand */}
        <Link
          href="/admin"
          className="flex items-center gap-2.5 px-2.5 pb-3.5 border-b border-border-light text-burgundy-700 hover:text-burgundy-500 transition-colors"
        >
          <BrandMark />
          <div className="flex flex-col leading-none">
            <span className="font-display text-[1.125rem] font-semibold text-ink-900 tracking-tight">
              Design Vortek
            </span>
            <span className="text-[0.625rem] uppercase tracking-[0.15em] text-ink-500 mt-[3px]">
              Studio Admin
            </span>
          </div>
        </Link>

        {/* Nav groups */}
        <nav className="flex flex-col flex-1" aria-label="Admin">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col">
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] text-ink-500 px-3 pt-3 pb-2">
                {group.label}
              </p>
              <div className="flex flex-col gap-px">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href + '/')) ||
                    (item.href !== '/admin' && pathname.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'group flex items-center gap-3 px-3 py-2 rounded-md text-[0.9375rem] transition-colors',
                        active
                          ? 'bg-parchment-50 text-burgundy-700 font-medium shadow-[inset_2px_0_0_var(--color-gold-500)]'
                          : 'text-ink-700 hover:bg-parchment-200 hover:text-ink-900',
                      )}
                    >
                      <Icon
                        size={18}
                        strokeWidth={1.5}
                        className={cn(
                          'flex-shrink-0 transition-opacity',
                          active ? 'opacity-100 text-burgundy-700' : 'opacity-70 group-hover:opacity-100',
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            'ml-auto min-w-[22px] text-center text-[0.6875rem] font-bold px-2 py-0.5 rounded-full',
                            item.badgeMuted
                              ? 'bg-parchment-300 text-ink-700'
                              : 'bg-burgundy-700 text-cream-50',
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
        <div className="pt-4 border-t border-border-light mt-auto">
          <Link
            href="/admin/settings"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-parchment-200 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-cream-50 font-display text-sm font-semibold flex-shrink-0"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-burgundy-700), var(--color-gold-700))',
              }}
            >
              {user.initials}
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-[0.8125rem] font-semibold text-ink-900 truncate">
                {user.email}
              </span>
              <span className="text-[0.6875rem] text-ink-500 mt-0.5">Owner · Sign out</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex flex-col">
        {/* Sticky header */}
        <header className="bg-parchment-50 border-b border-border-light px-5 py-5 md:px-8 sticky top-0 z-20 flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0 leading-[1.15]">
            <h1 className="font-display text-[1.625rem] font-semibold text-ink-900 tracking-[-0.015em] truncate">
              {title}
            </h1>
            {subtitle && <p className="text-[0.8125rem] text-ink-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {showSearch && (
              <div className="relative hidden md:block w-[280px]">
                <Search
                  size={16}
                  strokeWidth={1.8}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
                />
                <input
                  type="search"
                  placeholder="Search…"
                  className="w-full bg-parchment-100 border border-border-light rounded-md pl-9 pr-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:bg-parchment-50 focus:ring-[3px] focus:ring-burgundy-100 transition-all"
                />
              </div>
            )}
            {actions}
          </div>
        </header>

        {/* Content */}
        <div className="px-5 py-5 md:px-8 md:py-8 flex-1">{children}</div>
      </div>
    </div>
  )
}

function BrandMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="w-7 h-7 flex-shrink-0 text-burgundy-700"
    >
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M16 4 L18 14 L28 16 L18 18 L16 28 L14 18 L4 16 L14 14 Z"
        fill="currentColor"
      />
    </svg>
  )
}
