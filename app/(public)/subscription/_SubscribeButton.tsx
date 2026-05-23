'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

type SubscriptionTier = 'subscription-companion' | 'subscription-gm'

/**
 * The CTA on each subscription tier card. Two-state UX:
 *
 *  1. Initial → button. Click reveals the email field below.
 *  2. Email submitted → POSTs /api/subscriptions/checkout and redirects
 *     to the returned Stripe URL.
 *
 * The studio's existing customers can just type their email; Stripe
 * matches it to any existing customer with the same email.
 */
export default function SubscribeButton({
  tier,
  label,
  variant,
}: {
  tier: SubscriptionTier
  label: string
  variant: 'primary' | 'outline'
}) {
  const [expanded, setExpanded] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    setError(null)
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, email: email.trim(), name: name.trim() || undefined }),
      })
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || `Subscription failed (${res.status})`)
      }
      window.location.href = data.url
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg)
      setPending(false)
    }
  }

  if (!expanded) {
    return (
      <Button
        type="button"
        onClick={() => setExpanded(true)}
        variant={variant}
        size="md"
        className="w-full"
      >
        {label}
      </Button>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (optional)"
        autoComplete="name"
        className="w-full border-[1.5px] border-border-light rounded-lg px-3.5 py-2.5 text-sm bg-parchment-50 focus:outline-none focus:border-burgundy-500 focus:ring-[3px] focus:ring-burgundy-100 transition"
      />
      <input
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
        autoComplete="email"
        className="w-full border-[1.5px] border-border-light rounded-lg px-3.5 py-2.5 text-sm bg-parchment-50 focus:outline-none focus:border-burgundy-500 focus:ring-[3px] focus:ring-burgundy-100 transition"
      />
      <Button type="submit" variant={variant} size="md" className="w-full" disabled={pending}>
        {pending ? 'Redirecting…' : `Continue to Stripe`}
      </Button>
      {error && (
        <div className="text-burgundy-700 text-xs leading-snug" role="alert">
          {error}
        </div>
      )}
    </form>
  )
}
