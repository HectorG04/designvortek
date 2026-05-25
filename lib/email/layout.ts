/* =====================================================================
   Shared email layout — on-brand wrapper for every Resend template.

   Visual language: warm parchment background, burgundy CTAs, gold
   accents, Cormorant for the header logotype (web-safe stack), Inter
   for body. Designed to read cleanly in Gmail / Outlook web / Apple
   Mail without requiring custom font loading.
   ===================================================================== */

import { SITE } from './client'

const COLORS = {
  parchment50:  '#fdf8ef',
  parchment100: '#f6ecd6',
  parchment300: '#e6d5b3',
  cream50:      '#fffbf0',
  ink900:       '#1f1a16',
  ink700:       '#3a312a',
  ink500:       '#6b5d52',
  burgundy500:  '#8a2a35',
  burgundy700:  '#6b1f2a',
  gold500:      '#c9a04a',
  gold700:      '#a07e2f',
  tome950:      '#1a130c',
  borderLight:  '#e7dcc4',
}

export interface EmailLayoutSection {
  heading: string
  /** Optional eyebrow above the heading. */
  eyebrow?: string
  /** Body paragraphs (HTML allowed for each — supports <strong>, <a>, <em>). */
  paragraphs: string[]
  /** Optional CTA button. */
  cta?: { label: string; href: string }
  /** Optional key/value summary table. */
  summary?: Array<{ label: string; value: string }>
  /** Optional secondary plain link block beneath the CTA. */
  footnote?: string
  /** Optional footer-pre block (eg. "Need to chat? Reply to this email."). */
  closer?: string
}

/* Lightweight HTML email layout. Inline styles only — no <style> blocks
 * survive Outlook reliably. Tested visually against the warm-parchment
 * brand palette in HANDOFF v2 §2. */
export function renderEmail(section: EmailLayoutSection): { html: string; text: string } {
  const ctaButton = section.cta
    ? `
      <tr><td style="padding: 8px 0 20px 0;">
        <a href="${escapeAttr(section.cta.href)}"
           style="display: inline-block; padding: 14px 28px; background: ${COLORS.burgundy700};
                  color: ${COLORS.cream50}; text-decoration: none; border-radius: 999px;
                  font-family: 'Inter', Arial, sans-serif; font-size: 14px; font-weight: 600;
                  letter-spacing: 0.04em;">
          ${escapeText(section.cta.label)}
        </a>
      </td></tr>`
    : ''

  const summaryRows = (section.summary ?? [])
    .map(
      (row) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid ${COLORS.borderLight}; font-family: 'Inter', Arial, sans-serif; font-size: 13px; color: ${COLORS.ink500}; text-transform: uppercase; letter-spacing: 0.08em; width: 40%;">
            ${escapeText(row.label)}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid ${COLORS.borderLight}; font-family: 'Inter', Arial, sans-serif; font-size: 15px; color: ${COLORS.ink900}; font-weight: 500;">
            ${row.value}
          </td>
        </tr>`,
    )
    .join('')

  const summaryBlock = summaryRows
    ? `
      <tr><td style="padding: 8px 0 20px 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
          ${summaryRows}
        </table>
      </td></tr>`
    : ''

  const paragraphsBlock = section.paragraphs
    .map(
      (p) => `
        <tr><td style="padding: 0 0 16px 0; font-family: 'Inter', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: ${COLORS.ink700};">
          ${p}
        </td></tr>`,
    )
    .join('')

  const eyebrowBlock = section.eyebrow
    ? `
      <tr><td style="padding: 0 0 8px 0; font-family: 'Inter', Arial, sans-serif; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: ${COLORS.gold700}; font-weight: 600;">
        ${escapeText(section.eyebrow)}
      </td></tr>`
    : ''

  const footnoteBlock = section.footnote
    ? `
      <tr><td style="padding: 0 0 12px 0; font-family: 'Inter', Arial, sans-serif; font-size: 13px; line-height: 1.5; color: ${COLORS.ink500};">
        ${section.footnote}
      </td></tr>`
    : ''

  const closerBlock = section.closer
    ? `
      <tr><td style="padding: 20px 0 0 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: ${COLORS.ink500}; border-top: 1px dashed ${COLORS.borderLight};">
        ${section.closer}
      </td></tr>`
    : ''

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeText(section.heading)}</title>
</head>
<body style="margin: 0; padding: 0; background: ${COLORS.parchment50}; color: ${COLORS.ink900};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: ${COLORS.parchment50}; padding: 32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background: ${COLORS.cream50}; border: 1px solid ${COLORS.borderLight}; border-radius: 16px; box-shadow: 0 6px 24px rgba(31,26,22,0.06);">

        <!-- Header -->
        <tr><td style="padding: 28px 36px; border-bottom: 1px solid ${COLORS.borderLight}; background: ${COLORS.parchment100};">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 22px; font-weight: 600; letter-spacing: -0.01em; color: ${COLORS.ink900};">
                Design <em style="font-style: italic; color: ${COLORS.burgundy700};">Vortex</em>
              </td>
              <td align="right" style="font-family: 'Inter', Arial, sans-serif; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: ${COLORS.ink500};">
                Hand-painted commissions
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding: 36px 36px 24px 36px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            ${eyebrowBlock}
            <tr><td style="padding: 0 0 18px 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 30px; font-weight: 600; line-height: 1.2; color: ${COLORS.ink900};">
              ${escapeText(section.heading)}
            </td></tr>
            ${paragraphsBlock}
            ${summaryBlock}
            ${ctaButton}
            ${footnoteBlock}
            ${closerBlock}
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding: 22px 36px; border-top: 1px solid ${COLORS.borderLight}; background: ${COLORS.parchment100};">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="font-family: 'Inter', Arial, sans-serif; font-size: 12px; line-height: 1.5; color: ${COLORS.ink500};">
                Design Vortex Studio · <a href="${SITE}" style="color: ${COLORS.burgundy700}; text-decoration: none;">designvortex.co</a>
                <br>You're getting this because you have an active project or inquiry with the studio.
              </td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  const text = buildPlainText(section)
  return { html, text }
}

function buildPlainText(section: EmailLayoutSection): string {
  const lines: string[] = []
  if (section.eyebrow) lines.push(section.eyebrow.toUpperCase())
  lines.push(section.heading)
  lines.push('')
  for (const p of section.paragraphs) {
    lines.push(stripHtml(p))
    lines.push('')
  }
  if (section.summary?.length) {
    for (const row of section.summary) {
      lines.push(`${row.label}: ${stripHtml(row.value)}`)
    }
    lines.push('')
  }
  if (section.cta) {
    lines.push(`${section.cta.label}: ${section.cta.href}`)
    lines.push('')
  }
  if (section.footnote) {
    lines.push(stripHtml(section.footnote))
    lines.push('')
  }
  if (section.closer) {
    lines.push(stripHtml(section.closer))
    lines.push('')
  }
  lines.push('—')
  lines.push('Design Vortex Studio')
  lines.push(SITE)
  return lines.join('\n')
}

/* --- escape helpers --- */
function escapeText(s: string): string {
  return s.replace(/[&<>]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;'))
}
function escapeAttr(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
  )
}
function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim()
}

export function formatCents(cents: number | null | undefined): string {
  if (cents == null || !Number.isFinite(cents)) return '—'
  const dollars = cents / 100
  return dollars % 1 === 0 ? `$${dollars.toFixed(0)}` : `$${dollars.toFixed(2)}`
}
