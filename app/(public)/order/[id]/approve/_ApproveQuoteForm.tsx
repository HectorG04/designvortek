'use client'

import { useState } from 'react'

/**
 * Client-side bridge to POST /api/orders/[id]/approve and redirect to
 * the returned Stripe Checkout URL. Two-line UX: button + error line.
 */
export default function ApproveQuoteForm({ orderId }: { orderId: number }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onApprove() {
    setPending(true)
    setError(null)
    try {
      const res = await fetch(`/api/orders/${orderId}/approve`, { method: 'POST' })
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || `Approve failed (${res.status})`)
      }
      window.location.href = data.url
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg)
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onApprove}
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 bg-burgundy-700 text-cream-50 hover:bg-burgundy-500 disabled:bg-ink-500 disabled:cursor-not-allowed transition-colors px-7 py-3.5 rounded-full text-[0.8125rem] font-semibold uppercase tracking-[0.12em] w-full"
      >
        {pending ? 'Redirecting…' : 'Approve & pay deposit'}
      </button>
      {error && (
        <div className="text-burgundy-700 text-sm leading-snug" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
