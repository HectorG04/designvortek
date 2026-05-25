/**
 * lib/rate-limit.ts
 * Simple in-memory IP rate limiter for API routes.
 *
 * Works per serverless instance — good enough for protecting public
 * forms at Design Vortex's traffic level. For distributed rate limiting
 * across many instances, swap the Map for Upstash Redis.
 *
 * Usage:
 *   const allowed = rateLimit(ip, { limit: 5, windowMs: 60_000 })
 *   if (!allowed) return 429
 */

interface Entry {
  timestamps: number[]
}

const store = new Map<string, Entry>()

// Prune the store every 5 minutes so it doesn't grow unbounded
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (entry.timestamps.every(t => now - t > 10 * 60_000)) {
      store.delete(key)
    }
  }
}, 5 * 60_000)

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number
  /** Window size in milliseconds */
  windowMs: number
}

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param key  Unique identifier — typically the client IP address
 */
export function rateLimit(key: string, options: RateLimitOptions): boolean {
  const { limit, windowMs } = options
  const now = Date.now()

  const entry = store.get(key) ?? { timestamps: [] }
  // Evict timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs)

  if (entry.timestamps.length >= limit) {
    store.set(key, entry)
    return false // blocked
  }

  entry.timestamps.push(now)
  store.set(key, entry)
  return true // allowed
}

/** Extract the real IP from a Next.js request. */
export function getIp(request: Request): string {
  const headers = (request as { headers: { get(k: string): string | null } }).headers
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  )
}
