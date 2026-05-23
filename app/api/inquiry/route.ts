import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendInquiryAckEmail, sendAdminInquiryEmail } from '@/lib/email'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/inquiry
 *
 * Contact-form + maps-brief + any-future "get in touch" form.
 *
 * Accepts BOTH:
 *   - application/json                       (fetch-style submits — ContactFormCard)
 *   - application/x-www-form-urlencoded      (native form submits — services/maps brief form)
 *   - multipart/form-data                    (same)
 *
 * Required fields after parsing:
 *   name, email
 *   message OR description (description is folded into message)
 *
 * Maps-specific extra fields (folded into message body if present):
 *   map_type, size, tone, deadline, references
 *
 * Behaviour:
 *   - JSON submit         → returns {success: true} JSON, status 200
 *   - Form-encoded submit → 303 redirect back to referer with ?sent=1
 *     so the source page can render a thank-you state without a broken
 *     "Internal server error" landing on /api/inquiry.
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')

    /* ---- Parse body (defensive: support both JSON + form) ---- */
    const body: Record<string, string> = {}
    if (isJson) {
      try {
        const json = await request.json()
        for (const [k, v] of Object.entries(json ?? {})) {
          if (typeof v === 'string') body[k] = v
          else if (v != null) body[k] = String(v)
        }
      } catch {
        return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
      }
    } else {
      try {
        const formData = await request.formData()
        for (const [k, v] of formData.entries()) {
          if (typeof v === 'string') body[k] = v
        }
      } catch {
        return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
      }
    }

    const { name, email, message, topic, description } = body

    /* ---- Required-field validation ---- */
    if (!name || typeof name !== 'string' || !name.trim()) {
      return badRequest(request, isJson, 'Your name is required.')
    }
    if (!email || typeof email !== 'string') {
      return badRequest(request, isJson, 'Email is required.')
    }
    const trimmedEmail = email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return badRequest(request, isJson, 'Invalid email address.')
    }

    /* ---- Build the message body ---- */
    // Prefer explicit `message`. If absent (maps form), build from
    // description + the maps-specific fields so the studio sees everything.
    let finalMessage = (message ?? '').trim()
    if (!finalMessage) {
      const parts: string[] = []
      if (description?.trim()) parts.push(description.trim())

      // Maps brief specifics — only included when present.
      const mapsFields: Array<[string, string | undefined]> = [
        ['Map type',  body.map_type],
        ['Size',      body.size],
        ['Tone',      body.tone],
        ['Deadline',  body.deadline],
        ['References', body.references],
      ]
      const mapsLines = mapsFields
        .filter(([, v]) => v && v.trim())
        .map(([k, v]) => `${k}: ${v!.trim()}`)
      if (mapsLines.length > 0) {
        parts.push('\n--- Brief details ---')
        parts.push(...mapsLines)
      }
      finalMessage = parts.join('\n').trim()
    }

    if (!finalMessage || finalMessage.length < 5) {
      return badRequest(request, isJson, 'Please include a message.')
    }

    /* ---- Persist ---- */
    const supabase = createAdminClient()
    const { data: inserted, error } = await supabase
      .from('inquiries')
      .insert([
        {
          name: name.trim(),
          email: trimmedEmail,
          message: finalMessage,
        },
      ])
      .select('id')
      .single()

    if (error) {
      console.error('[inquiry] insert error:', error)
      return serverError(request, isJson, 'Failed to send. Please try again.')
    }

    /* ---- Fire-and-forget notifications. ---- */
    const inferredTopic =
      typeof topic === 'string' && topic.trim()
        ? topic.trim()
        : body.map_type
          ? `Maps inquiry — ${body.map_type}`
          : 'General inquiry'

    Promise.allSettled([
      sendInquiryAckEmail({ to: trimmedEmail, customerName: name.trim() }),
      sendAdminInquiryEmail({
        customerName: name.trim(),
        customerEmail: trimmedEmail,
        topic: inferredTopic,
        body: finalMessage,
        inquiryId: inserted?.id ?? undefined,
      }),
    ]).catch(() => {})

    /* ---- Response ---- */
    if (isJson) {
      return NextResponse.json({ success: true })
    }
    return redirectBack(request, 'sent')
  } catch (err) {
    console.error('[inquiry] API error:', err)
    const isJson = (request.headers.get('content-type') ?? '').includes('application/json')
    return serverError(request, isJson, 'Internal server error.')
  }
}

/* ---------- helpers ---------- */

function badRequest(request: NextRequest, isJson: boolean, msg: string) {
  if (isJson) return NextResponse.json({ error: msg }, { status: 400 })
  return redirectBack(request, 'error', msg)
}

function serverError(request: NextRequest, isJson: boolean, msg: string) {
  if (isJson) return NextResponse.json({ error: msg }, { status: 500 })
  return redirectBack(request, 'error', msg)
}

/** 303 back to wherever the user submitted from, with a status flag in
 *  the query string. Falls back to '/' if no referer. */
function redirectBack(request: NextRequest, status: 'sent' | 'error', errMsg?: string) {
  const referer = request.headers.get('referer')
  const baseUrl = referer && referer.startsWith(request.nextUrl.origin)
    ? new URL(referer)
    : new URL('/', request.nextUrl.origin)
  baseUrl.searchParams.set(status === 'sent' ? 'sent' : 'error', status === 'sent' ? '1' : (errMsg ?? '1'))
  // Anchor to the form section if it was the maps brief.
  if (baseUrl.pathname === '/services/maps' && status === 'sent') {
    baseUrl.hash = 'map-brief'
  }
  return NextResponse.redirect(baseUrl, 303)
}
