'use client'

import { useState } from 'react'
import AdminShell from '@/components/admin/AdminShell'
import { cn } from '@/lib/utils'
import {
  Home,
  User,
  Mail,
  Search,
  Info,
  Save,
  Send,
  Globe,
} from 'lucide-react'

type TabKey = 'site' | 'profile' | 'smtp' | 'seo'

const TABS: {
  key: TabKey
  label: string
  icon: React.ComponentType<{
    size?: number
    strokeWidth?: number
    className?: string
  }>
}[] = [
  { key: 'site', label: 'Site', icon: Home },
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'smtp', label: 'SMTP', icon: Mail },
  { key: 'seo', label: 'SEO', icon: Search },
]

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>('site')

  const adminEmail = 'admin@designvortex.co'
  const initials = adminEmail.slice(0, 2).toUpperCase()

  return (
    <AdminShell
      user={{ email: adminEmail, initials }}
      title="Settings"
      subtitle="Studio config, profile, email and SEO defaults"
      showSearch={false}
      actions={
        <>
          <button
            type="button"
            disabled
            className="hidden sm:inline-flex items-center gap-1.5 bg-transparent border-[1.5px] border-border-medium text-ink-700 disabled:text-ink-400 disabled:border-border-light disabled:cursor-not-allowed px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
          >
            Discard
          </button>
          <button
            type="button"
            disabled
            className="hidden sm:inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 disabled:bg-ink-300 disabled:text-ink-400 disabled:cursor-not-allowed px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider"
          >
            <Save size={14} strokeWidth={1.8} />
            Save changes
          </button>
        </>
      }
    >
      {/* Preview banner */}
      <div className="mb-6 flex items-start gap-3 bg-gold-100 border border-gold-300 rounded-xl px-4 py-3">
        <Info
          size={18}
          strokeWidth={1.8}
          className="text-gold-700 mt-0.5 flex-shrink-0"
        />
        <div className="text-[0.875rem] text-ink-700">
          <p className="font-semibold text-ink-900">
            Settings persistence comes in next milestone.
          </p>
          <p className="mt-1">
            Form values shown are for layout preview only. Edits will not be
            saved yet.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5 lg:gap-6">
        {/* Sidebar tabs */}
        <nav className="bg-parchment-100 border border-border-light rounded-xl p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {TABS.map((t) => {
            const Icon = t.icon
            const isActive = t.key === tab
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[0.875rem] transition-colors text-left flex-shrink-0 lg:flex-shrink',
                  isActive
                    ? 'bg-parchment-50 text-burgundy-700 font-semibold shadow-[inset_2px_0_0_var(--color-gold-500)]'
                    : 'text-ink-700 hover:bg-parchment-200 hover:text-ink-900',
                )}
              >
                <Icon
                  size={16}
                  strokeWidth={1.6}
                  className={isActive ? 'opacity-100' : 'opacity-70'}
                />
                <span>{t.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Tab content */}
        <div className="min-w-0">
          {tab === 'site' && <SiteTab />}
          {tab === 'profile' && <ProfileTab />}
          {tab === 'smtp' && <SmtpTab />}
          {tab === 'seo' && <SeoTab />}
        </div>
      </div>
    </AdminShell>
  )
}

/* -------- Site tab -------- */
function SiteTab() {
  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Site identity"
        description="What the world sees when they find Design Vortex."
      >
        <Row2>
          <Field label="Site name">
            <Input defaultValue="Design Vortex" />
          </Field>
          <Field label="Tagline">
            <Input defaultValue="Premium art commissions, since 2024" />
          </Field>
        </Row2>
        <Row2>
          <Field label="Logo URL">
            <Input defaultValue="/logo.svg" placeholder="https://…" />
          </Field>
          <Field label="Favicon URL">
            <Input defaultValue="/favicon.ico" placeholder="https://…" />
          </Field>
        </Row2>
        <Field label="Footer text">
          <Textarea defaultValue="Premium art commissions, since 2024. Every piece, by hand, by humans." />
        </Field>
      </Section>

      <Section
        title="Social links"
        description="Linked from the footer and contact page."
      >
        <Row2>
          <Field label="Instagram URL" icon={Globe}>
            <Input defaultValue="https://instagram.com/designvortek" />
          </Field>
          <Field label="Twitter / X URL" icon={Globe}>
            <Input defaultValue="https://x.com/designvortek" />
          </Field>
        </Row2>
        <Row2>
          <Field label="Discord invite" icon={Globe}>
            <Input placeholder="https://discord.gg/…" />
          </Field>
          <Field label="Public email" icon={Mail}>
            <Input
              defaultValue="hello@designvortex.co"
              type="email"
            />
          </Field>
        </Row2>
      </Section>

      <FormActions />
    </div>
  )
}

/* -------- Profile tab -------- */
function ProfileTab() {
  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Studio owner"
        description="Personal details shown on the about page and email signatures."
      >
        <Row2>
          <Field label="Your name">
            <Input defaultValue="Hector G." />
          </Field>
          <Field label="Avatar URL">
            <Input placeholder="https://…/avatar.jpg" />
          </Field>
        </Row2>
        <Field label="Bio">
          <Textarea
            defaultValue="Hector G. is the founder of Design Vortex — a commission studio specializing in TTRPG portraits, character art and bespoke illustration. Every piece is painted by hand."
            rows={5}
          />
        </Field>
        <Field label="Email signature image URL">
          <Input placeholder="https://…/signature.png" />
        </Field>
      </Section>

      <FormActions />
    </div>
  )
}

/* -------- SMTP tab -------- */
function SmtpTab() {
  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Email delivery"
        description="Used for outbound transactional mail and admin notifications."
      >
        <Row2>
          <Field label="Provider">
            <Select defaultValue="resend">
              <option value="resend">Resend</option>
              <option value="sendgrid">SendGrid</option>
              <option value="custom">Custom SMTP</option>
            </Select>
          </Field>
          <Field label="API key">
            <Input type="password" placeholder="re_xxxxxxxxxxxxxxxx" />
          </Field>
        </Row2>
        <Row2>
          <Field label="From email">
            <Input type="email" defaultValue="hello@designvortex.co" />
          </Field>
          <Field label="From name">
            <Input defaultValue="Design Vortex" />
          </Field>
        </Row2>
        <Field label="Admin notification email">
          <Input type="email" defaultValue="admin@designvortex.co" />
          <Help>New orders and inquiries are CC&apos;d here.</Help>
        </Field>
      </Section>

      <Section
        title="Test connection"
        description="Send a quick deliverability test to confirm credentials."
      >
        <div className="flex items-center justify-between gap-3 bg-parchment-50 border border-border-light rounded-md p-4">
          <div className="text-[0.8125rem] text-ink-500">
            Sends a tiny styled email from the From address above to the admin
            notification email.
          </div>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1.5 bg-gold-500 text-ink-900 disabled:bg-ink-300 disabled:text-ink-400 disabled:cursor-not-allowed px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            <Send size={14} strokeWidth={1.8} />
            Send test email
          </button>
        </div>
      </Section>

      <FormActions />
    </div>
  )
}

/* -------- SEO tab -------- */
function SeoTab() {
  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Meta defaults"
        description="Templates used when an individual page does not set its own metadata."
      >
        <Field label="Default meta title template">
          <Input defaultValue="%s · Design Vortex" />
          <Help>%s is replaced with the page title.</Help>
        </Field>
        <Field label="Default meta description">
          <Textarea
            rows={3}
            defaultValue="Premium art commissions handcrafted for TTRPG players, streamers and lifelong storytellers."
          />
        </Field>
      </Section>

      <Section
        title="Robots &amp; verification"
        description="Search engine indexing controls and ownership tokens."
      >
        <Field label="robots.txt">
          <Textarea
            rows={6}
            defaultValue={`User-agent: *\nAllow: /\n\nSitemap: https://designvortex.co/sitemap.xml`}
            mono
          />
          <Help>Visual only — file is generated from /app/robots.ts.</Help>
        </Field>
        <Row2>
          <Field label="Google Search Console" icon={Globe}>
            <Input placeholder="google-site-verification=…" />
          </Field>
          <Field label="Bing Webmaster">
            <Input placeholder="msvalidate.01=…" />
          </Field>
        </Row2>
      </Section>

      <Section
        title="Analytics"
        description="One-line measurement IDs for your preferred analytics providers."
      >
        <Row2>
          <Field label="Google Analytics ID">
            <Input placeholder="G-XXXXXXXXXX" />
          </Field>
          <Field label="Plausible domain">
            <Input placeholder="designvortex.co" />
          </Field>
        </Row2>
      </Section>

      <FormActions />
    </div>
  )
}

/* -------- Building blocks -------- */

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-parchment-100 border border-border-light rounded-xl p-5 lg:p-7">
      <header className="mb-5 pb-4 border-b border-border-light">
        <h2 className="font-display text-xl font-semibold text-ink-900 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-[0.875rem] text-ink-500 mt-1">{description}</p>
        )}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  )
}

function Row2({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  )
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon?: React.ComponentType<{
    size?: number
    strokeWidth?: number
    className?: string
  }>
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.15em] text-ink-700">
        {Icon && <Icon size={12} strokeWidth={1.8} />}
        {label}
      </span>
      {children}
    </label>
  )
}

function Input({
  type = 'text',
  defaultValue,
  placeholder,
}: {
  type?: string
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="bg-parchment-50 border-[1.5px] border-border-light rounded-md px-3.5 py-2.5 text-[0.9375rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:ring-[3px] focus:ring-burgundy-100 transition-all"
    />
  )
}

function Textarea({
  defaultValue,
  rows = 4,
  mono = false,
}: {
  defaultValue?: string
  rows?: number
  mono?: boolean
}) {
  return (
    <textarea
      defaultValue={defaultValue}
      rows={rows}
      className={cn(
        'bg-parchment-50 border-[1.5px] border-border-light rounded-md px-3.5 py-2.5 text-[0.9375rem] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-burgundy-500 focus:ring-[3px] focus:ring-burgundy-100 resize-y transition-all',
        mono && 'font-mono text-[0.8125rem]',
      )}
    />
  )
}

function Select({
  defaultValue,
  children,
}: {
  defaultValue?: string
  children: React.ReactNode
}) {
  return (
    <select
      defaultValue={defaultValue}
      className="bg-parchment-50 border-[1.5px] border-border-light rounded-md px-3.5 py-2.5 text-[0.9375rem] text-ink-900 focus:outline-none focus:border-burgundy-500 focus:ring-[3px] focus:ring-burgundy-100 transition-all"
    >
      {children}
    </select>
  )
}

function Help({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.75rem] text-ink-500 mt-0.5">{children}</p>
}

function FormActions() {
  return (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-1.5 bg-transparent border-[1.5px] border-border-medium text-ink-700 disabled:text-ink-400 disabled:border-border-light disabled:cursor-not-allowed px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
      >
        Discard
      </button>
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-1.5 bg-burgundy-700 text-cream-50 disabled:bg-ink-300 disabled:text-ink-400 disabled:cursor-not-allowed px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
      >
        <Save size={14} strokeWidth={1.8} />
        Save changes
      </button>
    </div>
  )
}
