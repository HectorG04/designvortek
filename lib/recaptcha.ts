/**
 * lib/recaptcha.ts
 * Server-side reCAPTCHA v3 verification.
 *
 * Returns ok=true when the token is valid and the score is >= 0.5.
 * Fails open (ok=true) when RECAPTCHA_SECRET_KEY is missing so local
 * dev and preview deploys without the key still work.
 */

const SECRET = process.env.RECAPTCHA_SECRET_KEY

export interface RecaptchaResult {
  ok: boolean
  score: number
  reason?: string
}

export async function verifyRecaptcha(token: string | undefined | null): Promise<RecaptchaResult> {
  // Dev / preview bypass — no key set
  if (!SECRET) return { ok: true, score: 1, reason: 'no-secret-dev-bypass' }

  if (!token) return { ok: false, score: 0, reason: 'missing-token' }

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(SECRET)}&response=${encodeURIComponent(token)}`,
    })
    const data = await res.json() as {
      success: boolean
      score?: number
      'error-codes'?: string[]
    }

    const score = data.score ?? 0
    const ok = data.success && score >= 0.5

    return {
      ok,
      score,
      reason: ok ? undefined : (data['error-codes']?.[0] ?? `low-score-${score}`),
    }
  } catch (err) {
    // Network error — fail open so legit users aren't blocked
    console.error('[recaptcha] verification error:', err)
    return { ok: true, score: 1, reason: 'network-error-fail-open' }
  }
}
