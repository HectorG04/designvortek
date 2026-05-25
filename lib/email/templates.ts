/* =====================================================================
   Email templates — the 13 canonical messages per HANDOFF v2 §10.

   Each builder takes a strongly-typed prop bag and returns the full
   {to, subject, html, text} EmailPayload ready to hand to sendEmail().

   Customer-facing templates (12): brief-receipt, quote, approved,
   sketch, update, delivery, release, cycle-ships, sub-paused,
   sub-resumed, refund, admin-inquiry, admin-payment-failed.

   Heading + tone is intentionally warm and concrete — the studio's
   voice is reassuring and craft-focused, never corporate.
   ===================================================================== */

import type { EmailPayload } from './client'
import { ADMIN_EMAIL, SITE } from './client'
import { renderEmail, formatCents, type EmailLayoutSection } from './layout'

/* --------------------------------------------------------------------
   1) Brief receipt — fires when a customer submits a brief via /order.
   -------------------------------------------------------------------- */
export interface BriefReceiptProps {
  to: string
  customerName: string
  orderNumber: string
  serviceLabel: string                 // "Character work · Full-body · Standard"
  description: string                  // truncated to ~200 chars by the caller
  approxTurnaround?: string            // "7–14 days"
}
export function buildBriefReceiptEmail(p: BriefReceiptProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: 'Brief received',
    heading: `Thank you, ${firstName(p.customerName)} — we have your brief`,
    paragraphs: [
      `Your commission brief just landed in the studio. We read every one personally; you'll hear back within <strong>1 business day</strong> with either a quote or a short clarifying question.`,
      `Your reference number is <strong>${escape(p.orderNumber)}</strong>. Keep that handy if you need to reply about this order.`,
    ],
    summary: [
      { label: 'Order number', value: escape(p.orderNumber) },
      { label: 'Service',      value: escape(p.serviceLabel) },
      ...(p.approxTurnaround ? [{ label: 'Likely turnaround', value: escape(p.approxTurnaround) }] : []),
      { label: 'Your brief',   value: escape(truncate(p.description, 240)) },
    ],
    closer: `Reply directly to this email if anything needs adjusting before we quote.`,
  }
  const { html, text } = renderEmail(section)
  return { to: p.to, subject: `We have your brief — ${p.orderNumber}`, html, text }
}

/* --------------------------------------------------------------------
   2) Quote — fires when admin clicks "Send quote" in /admin/orders/[id].
   -------------------------------------------------------------------- */
export interface QuoteEmailProps {
  to: string
  customerName: string
  orderNumber: string
  serviceLabel: string
  baseCents: number
  addons: Array<{ label: string; cents: number }>
  commercialUplift?: boolean           // adds the +40% line
  commercialCents?: number             // when commercialUplift=true
  adjustmentLabel?: string             // visible to customer
  adjustmentCents?: number             // signed; negative = discount
  totalCents: number
  depositCents: number
  approveUrl: string                   // /api/orders/[id]/approve or /order/[id]/approve
  expiresAt?: string                   // human-readable "valid for 7 days"
}
export function buildQuoteEmail(p: QuoteEmailProps): EmailPayload {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Order',  value: escape(p.orderNumber) },
    { label: 'Service', value: escape(p.serviceLabel) },
    { label: 'Base',   value: formatCents(p.baseCents) },
  ]
  for (const a of p.addons) rows.push({ label: escape(a.label), value: `+${formatCents(a.cents)}` })
  if (p.commercialUplift && p.commercialCents != null) {
    rows.push({ label: 'Commercial license (+40%)', value: `+${formatCents(p.commercialCents)}` })
  }
  if (p.adjustmentLabel && p.adjustmentCents != null && p.adjustmentCents !== 0) {
    const sign = p.adjustmentCents < 0 ? '−' : '+'
    rows.push({ label: escape(p.adjustmentLabel), value: `${sign}${formatCents(Math.abs(p.adjustmentCents))}` })
  }
  rows.push({ label: 'Total',           value: `<strong>${formatCents(p.totalCents)}</strong>` })
  rows.push({ label: '30% deposit now', value: `<strong>${formatCents(p.depositCents)}</strong>` })

  const section: EmailLayoutSection = {
    eyebrow: 'Quote ready',
    heading: `Your quote is ready, ${firstName(p.customerName)}`,
    paragraphs: [
      `We've scoped your brief and the quote below holds your slot${p.expiresAt ? ` for ${escape(p.expiresAt)}` : ''}.`,
      `Click the button to approve and pay your 30% deposit — that locks your slot and we start. The deposit is fully refundable until we share the first sketch.`,
    ],
    summary: rows,
    cta: { label: 'Approve & pay deposit', href: p.approveUrl },
    footnote: `Total balance (the remaining 70%) is due on delivery. We'll send a separate pay link with the finished files.`,
    closer: `Reply to this email if anything's off — happy to walk through line items.`,
  }
  const { html, text } = renderEmail(section)
  return { to: p.to, subject: `Quote for ${p.orderNumber} — ${formatCents(p.totalCents)}`, html, text }
}

/* --------------------------------------------------------------------
   3) Approved — fires from Stripe webhook on checkout.session.completed
       for the 30% deposit. Sent to customer + admin notify.
   -------------------------------------------------------------------- */
export interface ApprovedProps {
  to: string
  customerName: string
  orderNumber: string
  totalCents: number
  depositCents: number
  estimatedDelivery?: string           // "around April 14"
}
export function buildApprovedEmail(p: ApprovedProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: 'Deposit received',
    heading: `You're booked, ${firstName(p.customerName)} — paint starts now`,
    paragraphs: [
      `Your 30% deposit (${formatCents(p.depositCents)}) is in. Slot reserved, brief in queue, and we'll send the first sketch ${p.estimatedDelivery ? `around <strong>${escape(p.estimatedDelivery)}</strong>` : 'in the next few days'}.`,
      `We'll share work-in-progress through email as we go — sketch, color blocks, finished paint. Reply any time with thoughts.`,
    ],
    summary: [
      { label: 'Order',    value: escape(p.orderNumber) },
      { label: 'Deposit',  value: formatCents(p.depositCents) },
      { label: 'Balance',  value: `${formatCents(p.totalCents - p.depositCents)} on delivery` },
    ],
    closer: `Refund policy: deposit is refundable until we share the first sketch. After that, it covers the sketch work.`,
  }
  const { html, text } = renderEmail(section)
  return { to: p.to, subject: `Deposit received — ${p.orderNumber}`, html, text }
}

/* --------------------------------------------------------------------
   4) Sketch — admin button "share sketch" in order detail.
   -------------------------------------------------------------------- */
export interface SketchProps {
  to: string
  customerName: string
  orderNumber: string
  sketchUrl?: string                   // optional hosted thumbnail
  note?: string                        // optional artist note
}
export function buildSketchEmail(p: SketchProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: 'Sketch ready',
    heading: `First sketch for ${escape(p.orderNumber)}`,
    paragraphs: [
      p.note ?? `The first sketch is ready for your eyes. Take a look and let me know if pose, composition, or framing needs to shift before I start painting.`,
      `Once you're happy, I'll move into color blocks. You've got two paint-stage revisions baked in.`,
    ],
    cta: p.sketchUrl ? { label: 'View sketch', href: p.sketchUrl } : undefined,
    closer: `Any change at sketch stage is free and easy — this is the cheapest moment to redirect the piece.`,
  }
  const { html, text } = renderEmail(section)
  return { to: p.to, subject: `Sketch ready — ${p.orderNumber}`, html, text }
}

/* --------------------------------------------------------------------
   5) Update — generic in-flight progress email.
   -------------------------------------------------------------------- */
export interface UpdateProps {
  to: string
  customerName: string
  orderNumber: string
  stage: 'sketch' | 'color' | 'render' | 'revisions' | 'final'
  body: string                         // admin-authored message
  imageUrl?: string
}
export function buildUpdateEmail(p: UpdateProps): EmailPayload {
  const stageLabel: Record<UpdateProps['stage'], string> = {
    sketch:    'Sketch update',
    color:     'Color blocks update',
    render:    'Rendering update',
    revisions: 'Revision round',
    final:     'Near-final update',
  }
  const section: EmailLayoutSection = {
    eyebrow: 'Progress update',
    heading: `${stageLabel[p.stage]} — ${escape(p.orderNumber)}`,
    paragraphs: [escape(p.body).replace(/\n/g, '<br>')],
    cta: p.imageUrl ? { label: 'View latest', href: p.imageUrl } : undefined,
    closer: `Reply with thoughts whenever you have a moment — no rush.`,
  }
  const { html, text } = renderEmail(section)
  return { to: p.to, subject: `${stageLabel[p.stage]} — ${p.orderNumber}`, html, text }
}

/* --------------------------------------------------------------------
   6) Delivery — admin sendDelivery action. Includes the 70% balance
       pay link (Stripe Checkout session URL).
   -------------------------------------------------------------------- */
export interface DeliveryProps {
  to: string
  customerName: string
  orderNumber: string
  balanceCents: number
  payBalanceUrl: string
  previewUrl?: string                  // watermarked preview
  itemDescription: string              // "Full-body Standard portrait of Aldric"
}
export function buildDeliveryEmail(p: DeliveryProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: 'Ready for delivery',
    heading: `${escape(p.itemDescription)} is ready, ${firstName(p.customerName)}`,
    paragraphs: [
      `The piece is finished. You can preview it watermarked at the link below. Once the remaining <strong>${formatCents(p.balanceCents)}</strong> balance is paid, I release the full-resolution files (PNG, JPG, transparent cut where applicable).`,
      `No deadline pressure on the balance, but the high-res files unlock the moment Stripe confirms payment.`,
    ],
    summary: [
      { label: 'Order',      value: escape(p.orderNumber) },
      { label: 'Balance due', value: `<strong>${formatCents(p.balanceCents)}</strong>` },
    ],
    cta: { label: `Pay balance & unlock files`, href: p.payBalanceUrl },
    footnote: p.previewUrl
      ? `<a href="${escapeAttr(p.previewUrl)}" style="color:#6b1f2a">View watermarked preview →</a>`
      : undefined,
    closer: `Hold onto this email — the pay link works for 30 days.`,
  }
  const { html, text } = renderEmail(section)
  return { to: p.to, subject: `Ready for delivery — ${p.orderNumber}`, html, text }
}

/* --------------------------------------------------------------------
   7) Release — final files released after balance paid.
   -------------------------------------------------------------------- */
export interface ReleaseProps {
  to: string
  customerName: string
  orderNumber: string
  filesUrl: string                     // Supabase Storage signed URL bundle
  itemDescription: string
}
export function buildReleaseEmail(p: ReleaseProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: 'Files released',
    heading: `Your files are ready, ${firstName(p.customerName)}`,
    paragraphs: [
      `Balance is in — full-resolution files for <strong>${escape(p.itemDescription)}</strong> are unlocked. The link below stays live for 90 days; download a local copy at your convenience.`,
      `If you'd like a print delivery (11×14 or 16×20 giclée), reply and we'll route through our partner studio.`,
    ],
    cta: { label: 'Download files', href: p.filesUrl },
    closer: `If you enjoyed working with the studio, a short review on the site means the world. <a href="${SITE}/reviews" style="color:#6b1f2a">Leave one here →</a>`,
  }
  const { html, text } = renderEmail(section)
  return { to: p.to, subject: `Files ready — ${p.orderNumber}`, html, text }
}

/* --------------------------------------------------------------------
   8) Subscription cycle ships — every 15th when a sub cycle goes out.
   -------------------------------------------------------------------- */
export interface CycleShipsProps {
  to: string
  customerName: string
  tierLabel: string                    // "Companion" | "GM tier"
  cycleMonth: string                   // "April 2026"
  items: string[]                      // ["10 tokens", "2 NPCs", "1 battle map"]
  filesUrl: string
}
export function buildCycleShipsEmail(p: CycleShipsProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: `${escape(p.cycleMonth)} cycle`,
    heading: `Your ${escape(p.tierLabel)} drop is ready`,
    paragraphs: [
      `This month's ${escape(p.tierLabel)} cycle is painted, packed, and ready.`,
      `Included this cycle: <strong>${p.items.map((i) => escape(i)).join(', ')}</strong>.`,
    ],
    cta: { label: 'Download this month', href: p.filesUrl },
    closer: `Want to pause next cycle, or swap items? Reply by the 10th of next month and we'll adjust.`,
  }
  const { html, text } = renderEmail(section)
  return { to: p.to, subject: `${p.tierLabel} drop — ${p.cycleMonth}`, html, text }
}

/* --------------------------------------------------------------------
   9) Subscription paused
   -------------------------------------------------------------------- */
export interface SubPausedProps {
  to: string
  customerName: string
  tierLabel: string
  resumesOn?: string                   // "May 15" — null = paused indefinitely
}
export function buildSubPausedEmail(p: SubPausedProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: 'Subscription paused',
    heading: `${escape(p.tierLabel)} paused, ${firstName(p.customerName)}`,
    paragraphs: [
      p.resumesOn
        ? `Your ${escape(p.tierLabel)} subscription is paused and will resume on <strong>${escape(p.resumesOn)}</strong>. No charge in between.`
        : `Your ${escape(p.tierLabel)} subscription is paused indefinitely. Resume any time — your style guide stays on file for 12 months.`,
    ],
    closer: `Need to resume sooner, or change tier? Reply to this email.`,
  }
  const { html, text } = renderEmail(section)
  return { to: p.to, subject: `${p.tierLabel} paused`, html, text }
}

/* --------------------------------------------------------------------
   10) Subscription resumed
   -------------------------------------------------------------------- */
export interface SubResumedProps {
  to: string
  customerName: string
  tierLabel: string
  nextBillDate: string                 // "April 1"
}
export function buildSubResumedEmail(p: SubResumedProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: 'Subscription resumed',
    heading: `Welcome back, ${firstName(p.customerName)}`,
    paragraphs: [
      `Your ${escape(p.tierLabel)} subscription resumed. Next cycle bills <strong>${escape(p.nextBillDate)}</strong> and ships on the 15th.`,
    ],
    closer: `Got campaign updates that should shape this month's drop? Reply with notes.`,
  }
  const { html, text } = renderEmail(section)
  return { to: p.to, subject: `${p.tierLabel} resumed`, html, text }
}

/* --------------------------------------------------------------------
   11) Refund issued
   -------------------------------------------------------------------- */
export interface RefundProps {
  to: string
  customerName: string
  orderNumber: string
  amountCents: number
  reason?: string
}
export function buildRefundEmail(p: RefundProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: 'Refund issued',
    heading: `Refund of ${formatCents(p.amountCents)} on the way`,
    paragraphs: [
      `We've issued a refund of <strong>${formatCents(p.amountCents)}</strong> on order ${escape(p.orderNumber)}. It should land on your card within 5 business days.`,
      p.reason ?? `Thanks for working with us. If anything wasn't clear, reply and let me know.`,
    ],
    closer: `Receipt of refund will arrive separately from Stripe.`,
  }
  const { html, text } = renderEmail(section)
  return { to: p.to, subject: `Refund issued — ${p.orderNumber}`, html, text }
}

/* --------------------------------------------------------------------
   12) Admin: new inquiry — fires when a /contact submission lands.
   -------------------------------------------------------------------- */
export interface AdminInquiryProps {
  customerName: string
  customerEmail: string
  topic: string
  body: string
  inquiryId?: number
}
export function buildAdminInquiryEmail(p: AdminInquiryProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: 'New inquiry',
    heading: `${escape(p.customerName)} — ${escape(p.topic)}`,
    paragraphs: [escape(p.body).replace(/\n/g, '<br>')],
    summary: [
      { label: 'From',  value: `${escape(p.customerName)} &lt;${escape(p.customerEmail)}&gt;` },
      { label: 'Topic', value: escape(p.topic) },
      ...(p.inquiryId ? [{ label: 'ID', value: `#${p.inquiryId}` }] : []),
    ],
    cta: { label: 'Open inbox', href: `${SITE}/admin/inquiries` },
  }
  const { html, text } = renderEmail(section)
  return {
    to: ADMIN_EMAIL,
    replyTo: p.customerEmail,
    subject: `[Contact] Inquiry — ${p.topic} — ${p.customerName}`,
    html,
    text,
  }
}

/* --------------------------------------------------------------------
   12b) Customer inquiry acknowledgement — fires when a /contact
        submission lands, alongside the admin notification.
   -------------------------------------------------------------------- */
export interface InquiryAckProps {
  to: string
  customerName: string
}
export function buildInquiryAckEmail(p: InquiryAckProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: 'Message received',
    heading: `Thanks for reaching out, ${firstName(p.customerName)}`,
    paragraphs: [
      `We got your message and we'll reply within <strong>1 business day</strong>.`,
      `If your note is about starting a commission, you can also fill out the brief form for a faster quote at <a href="${SITE}/order" style="color:#6b1f2a">${SITE}/order</a>.`,
    ],
    closer: `Reply to this email any time.`,
  }
  const { html, text } = renderEmail(section)
  return { to: p.to, subject: `Thanks for reaching out — we'll reply within 1 business day`, html, text }
}

/* --------------------------------------------------------------------
   12c) Admin brief notification — separate from the customer
        brief-receipt; this goes to the studio so they know a new
        brief landed. Includes a deep-link into /admin/orders/[id].
   -------------------------------------------------------------------- */
export interface AdminBriefProps {
  orderId: number
  orderNumber: string
  customerName: string
  customerEmail: string
  serviceLabel: string
  budgetLabel?: string
  description: string
}
export function buildAdminBriefEmail(p: AdminBriefProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: 'New brief',
    heading: `${escape(p.customerName)} — ${escape(p.serviceLabel)}`,
    paragraphs: [escape(p.description).replace(/\n/g, '<br>')],
    summary: [
      { label: 'Order',    value: escape(p.orderNumber) },
      { label: 'Customer', value: `${escape(p.customerName)} &lt;${escape(p.customerEmail)}&gt;` },
      { label: 'Service',  value: escape(p.serviceLabel) },
      ...(p.budgetLabel ? [{ label: 'Budget', value: escape(p.budgetLabel) }] : []),
    ],
    cta: { label: 'Open in admin', href: `${SITE}/admin/orders/${p.orderId}` },
  }
  const { html, text } = renderEmail(section)
  return {
    to: ADMIN_EMAIL,
    replyTo: p.customerEmail,
    subject: `[Commission] New brief — ${p.orderNumber} — ${p.customerName}`,
    html,
    text,
  }
}

/* --------------------------------------------------------------------
   12d) Admin waitlist notification — fires when a /api/waitlist
        submission lands.
   -------------------------------------------------------------------- */
export interface AdminWaitlistProps {
  email: string
  name?: string | null
  source?: string | null
  interestedIn?: string | null
}
export function buildAdminWaitlistEmail(p: AdminWaitlistProps): EmailPayload {
  const section: EmailLayoutSection = {
    eyebrow: 'New waitlist signup',
    heading: `${escape(p.name ?? p.email)} joined the waitlist`,
    paragraphs: [
      `They want to be told when slots open.`,
    ],
    summary: [
      { label: 'Email',         value: escape(p.email) },
      { label: 'Name',          value: escape(p.name ?? '—') },
      { label: 'Interested in', value: escape(p.interestedIn ?? '—') },
      { label: 'Source',        value: escape(p.source ?? '—') },
    ],
    cta: { label: 'Open waitlist', href: `${SITE}/admin/waitlist` },
  }
  const { html, text } = renderEmail(section)
  return {
    to: ADMIN_EMAIL,
    replyTo: p.email,
    subject: `[Waitlist] ${p.name ?? p.email} joined`,
    html,
    text,
  }
}

/* --------------------------------------------------------------------
   13) Admin: payment failed — fires from Stripe webhook on
       invoice.payment_failed or charge.failed.
   -------------------------------------------------------------------- */
export interface AdminPaymentFailedProps {
  orderNumber?: string
  subscriptionId?: number
  customerName: string
  customerEmail: string
  amountCents: number
  reason: string
}
export function buildAdminPaymentFailedEmail(p: AdminPaymentFailedProps): EmailPayload {
  const ref = p.orderNumber
    ? `order ${escape(p.orderNumber)}`
    : p.subscriptionId
      ? `subscription #${p.subscriptionId}`
      : 'an account'
  const section: EmailLayoutSection = {
    eyebrow: 'Payment failed',
    heading: `Payment failure on ${ref}`,
    paragraphs: [
      `Stripe reported a payment failure of <strong>${formatCents(p.amountCents)}</strong> on ${ref}.`,
      `Reason: ${escape(p.reason)}`,
      `Reach out to <a href="mailto:${escape(p.customerEmail)}" style="color:#6b1f2a">${escape(p.customerEmail)}</a> if a manual nudge feels right.`,
    ],
    summary: [
      { label: 'Customer', value: `${escape(p.customerName)} &lt;${escape(p.customerEmail)}&gt;` },
      { label: 'Amount',   value: formatCents(p.amountCents) },
      { label: 'Reason',   value: escape(p.reason) },
    ],
    cta: { label: 'Open admin', href: `${SITE}/admin/orders` },
  }
  const { html, text } = renderEmail(section)
  return {
    to: ADMIN_EMAIL,
    subject: `[Billing] Payment failed — ${ref}`,
    html,
    text,
  }
}

/* --------------------------------------------------------------------
   Tiny helpers
   -------------------------------------------------------------------- */
function firstName(full: string): string {
  return (full || '').trim().split(/\s+/)[0] || 'there'
}
function truncate(s: string, max: number): string {
  if (!s) return ''
  return s.length > max ? `${s.slice(0, max).trimEnd()}…` : s
}
function escape(s: string): string {
  return (s || '').replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'))
}
function escapeAttr(s: string): string {
  return (s || '').replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  )
}
