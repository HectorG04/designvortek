import 'server-only'
/* =====================================================================
   Resend client — thin wrapper used by lib/email/send.ts.

   Behavior when RESEND_API_KEY is missing (dev without a key, demo
   environment, preview deploys without env): every send becomes a
   no-op that logs the intended message to the console. This lets the
   rest of the order pipeline run end-to-end without throwing.

   Production: set RESEND_API_KEY + FROM_EMAIL + ADMIN_NOTIFY_EMAIL.
   ===================================================================== */

import { Resend } from 'resend'

const RESEND_API_KEY     = process.env.RESEND_API_KEY
const FROM_EMAIL         = process.env.FROM_EMAIL         || 'hello@designvortex.co'
const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || FROM_EMAIL
const SITE_URL           = process.env.NEXT_PUBLIC_SITE_URL || 'https://designvortex.co'

const isLive = Boolean(RESEND_API_KEY && RESEND_API_KEY.startsWith('re_'))
const resend = isLive ? new Resend(RESEND_API_KEY) : null

export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  text: string
  /** Sender override — defaults to FROM_EMAIL. */
  from?: string
  /** Optional reply-to override (e.g. send the customer reply to a specific support inbox). */
  replyTo?: string
}

export interface SendResult {
  ok: boolean
  /** Resend message ID when the send succeeded; never when no-op. */
  id?: string
  /** Reason this send did not happen (no API key, error message, etc.). */
  reason?: string
}

/** Send one message. Returns ok=false (never throws) when sends fail
 *  or when the API key is missing — callers can log the result or
 *  proceed without checking it. */
export async function sendEmail(payload: EmailPayload): Promise<SendResult> {
  if (!resend) {
    // eslint-disable-next-line no-console
    console.log(
      `[email:noop] would send "${payload.subject}" to ${
        Array.isArray(payload.to) ? payload.to.join(', ') : payload.to
      } — set RESEND_API_KEY to enable`,
    )
    return { ok: false, reason: 'RESEND_API_KEY missing' }
  }
  try {
    const result = await resend.emails.send({
      from: payload.from ?? `Design Vortex <${FROM_EMAIL}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
    })
    return { ok: !result.error, id: result.data?.id, reason: result.error?.message }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    // eslint-disable-next-line no-console
    console.error(`[email:error] ${payload.subject} → ${msg}`)
    return { ok: false, reason: msg }
  }
}

export const ADMIN_EMAIL = ADMIN_NOTIFY_EMAIL
export const SITE = SITE_URL
