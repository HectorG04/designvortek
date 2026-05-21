/**
 * Email helper — wraps Resend.
 * Gracefully no-ops if RESEND_API_KEY isn't set, so dev/test work without email.
 */
import { Resend } from 'resend'

const FROM = process.env.FROM_EMAIL || 'hello@designvortex.co'
const ADMIN = process.env.ADMIN_NOTIFY_EMAIL || ''

let _client: Resend | null = null

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY)
  return _client
}

interface SendOpts {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

/**
 * Send an email via Resend. Returns boolean — never throws.
 * If RESEND_API_KEY is missing, logs once and returns false.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendOpts): Promise<boolean> {
  const client = getClient()
  if (!client) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[email] RESEND_API_KEY not set — skipping send. Subject:', subject)
    }
    return false
  }
  try {
    await client.emails.send({
      from: `Design Vortex <${FROM}>`,
      to,
      subject,
      html,
      replyTo,
    })
    return true
  } catch (err) {
    console.error('[email] Resend send failed:', err)
    return false
  }
}

// --- Email templates ---

export function orderConfirmationHTML(p: {
  customerName: string
  serviceType: string
  description: string
}) {
  return `<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #FBF6E9; color: #1E1408; padding: 40px 20px; max-width: 600px; margin: 0 auto;">
  <h1 style="font-family: Georgia, serif; color: #6B1F2A; font-size: 28px; margin: 0 0 16px;">Brief received, ${p.customerName}.</h1>
  <p style="font-size: 16px; line-height: 1.65; color: #3A2A1C;">Thanks for getting in touch about your <strong>${p.serviceType}</strong> commission. We've received your brief and we'll review it within 48 hours.</p>
  <p style="font-size: 16px; line-height: 1.65; color: #3A2A1C;">Here's what to expect next:</p>
  <ol style="font-size: 15px; line-height: 1.7; color: #3A2A1C;">
    <li><strong>Within 48 hours:</strong> A quote with timeline.</li>
    <li><strong>If you accept:</strong> 25% deposit holds your slot.</li>
    <li><strong>Through the work:</strong> Sketches → color blocks → final paint. Two revisions baked in.</li>
  </ol>
  <p style="font-size: 14px; color: #6B5A48; margin-top: 32px;">Have questions? Just reply to this email.</p>
  <p style="font-size: 12px; color: #9A8870; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8DBBE;">Design Vortex · Premium TTRPG art commissions · <a href="https://designvortex.co" style="color: #6B1F2A;">designvortex.co</a></p>
</body></html>`
}

export function adminOrderNotifyHTML(p: {
  id: number
  customerName: string
  customerEmail: string
  serviceType: string
  budget: string | null
  description: string
}) {
  return `<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #6B1F2A; margin: 0 0 16px;">New commission brief · #${p.id}</h2>
  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
    <tr><td style="padding: 6px 0; color: #6B5A48; width: 120px;">Customer</td><td style="padding: 6px 0;"><strong>${p.customerName}</strong></td></tr>
    <tr><td style="padding: 6px 0; color: #6B5A48;">Email</td><td style="padding: 6px 0;"><a href="mailto:${p.customerEmail}">${p.customerEmail}</a></td></tr>
    <tr><td style="padding: 6px 0; color: #6B5A48;">Service</td><td style="padding: 6px 0;">${p.serviceType}</td></tr>
    <tr><td style="padding: 6px 0; color: #6B5A48;">Budget</td><td style="padding: 6px 0;">${p.budget ?? '—'}</td></tr>
  </table>
  <h3 style="margin: 24px 0 8px; color: #1E1408;">Brief</h3>
  <div style="background: #F5EBD3; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${escapeHtml(p.description)}</div>
  <p style="margin-top: 24px;"><a href="https://designvortex.co/admin/orders/${p.id}" style="background: #6B1F2A; color: #F4EAD3; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: 600;">Open in admin →</a></p>
</body></html>`
}

export function adminInquiryNotifyHTML(p: {
  id: number
  name: string
  email: string
  message: string
}) {
  return `<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #6B1F2A; margin: 0 0 16px;">New inquiry · #${p.id}</h2>
  <p><strong>${p.name}</strong> · <a href="mailto:${p.email}">${p.email}</a></p>
  <div style="background: #F5EBD3; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; line-height: 1.6; margin-top: 16px;">${escapeHtml(p.message)}</div>
  <p style="margin-top: 24px;"><a href="https://designvortex.co/admin/inquiries" style="background: #6B1F2A; color: #F4EAD3; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: 600;">Open in admin →</a></p>
</body></html>`
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export const ADMIN_EMAIL = ADMIN
