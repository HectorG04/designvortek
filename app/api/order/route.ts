import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendBriefReceiptEmail, sendAdminBriefEmail } from '@/lib/email'
import { verifyRecaptcha } from '@/lib/recaptcha'
import { rateLimit, getIp } from '@/lib/rate-limit'
import { fetchProductBySlug } from '@/lib/services-server'
import { formatTurnaround } from '@/lib/services'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/order
 * Submits a commission brief. Inserts into `commission_orders` table.
 *
 * Side effects:
 *  - Customer receives the canonical `brief-receipt` email (no-op if
 *    RESEND_API_KEY missing).
 *  - Admin receives the `admin-brief` notification (no-op if no
 *    ADMIN_NOTIFY_EMAIL).
 *  - Upserts a row into `customers` keyed on email so future orders /
 *    subscriptions can FK in.
 */
export async function POST(request: NextRequest) {
  try {
    /* ---- Rate limiting: 3 briefs per IP per minute ---- */
    const ip = getIp(request)
    if (!rateLimit(ip, { limit: 3, windowMs: 60_000 })) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    const body = await request.json()

    /* ---- reCAPTCHA v3 verification ---- */
    const captchaResult = await verifyRecaptcha(body.recaptcha_token)
    if (!captchaResult.ok) {
      return NextResponse.json({ error: 'Bot detected. Please try again.' }, { status: 400 })
    }

    const {
      customer_name,
      customer_email,
      customer_phone,
      service_type,
      style,
      description,
      reference_links,
      budget,
      deadline,
      // Form sends these too, but the legacy table didn't have dedicated columns
      // for them. Migration 0006 added structured columns; we now persist what
      // we can structurally and fold the rest into internal_notes for safety.
      quantity,
      notes,
      source,
      // Canonical refs sent by the Order Form v2 picker. Optional — older
      // versions of the form don't post these.
      bucket_slug,
      product_slug,
      tier_slug,
      style_tags,
      reference_urls,
      budget_range,
      budget_context,
    } = body

    // Required-field validation
    if (!customer_name || typeof customer_name !== 'string' || !customer_name.trim()) {
      return NextResponse.json({ error: 'Your name is required.' }, { status: 400 })
    }
    if (!customer_email || typeof customer_email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }
    const trimmedEmail = customer_email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    if (!service_type || typeof service_type !== 'string') {
      return NextResponse.json({ error: 'Please choose a service type.' }, { status: 400 })
    }
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please describe your commission (at least a sentence or two).' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    /* Upsert into customers (keyed by email). The first-seen-at default fires
     * on insert; subsequent upserts touch updated_at but preserve first_seen_at. */
    const trimmedName = customer_name.trim()
    const { data: customerRow } = await supabase
      .from('customers')
      .upsert(
        {
          email: trimmedEmail,
          name: trimmedName,
          phone: customer_phone?.trim() || null,
          source: typeof source === 'string' && source.trim() ? source.trim() : null,
        },
        { onConflict: 'email' },
      )
      .select('id')
      .maybeSingle()

    /* Stash anything we don't yet have a column for in internal_notes so
     * nothing posted from the form is silently dropped. */
    const internalParts: string[] = []
    if (quantity)        internalParts.push(`Quantity: ${String(quantity).trim()}`)
    if (notes?.trim())   internalParts.push(`Client notes:\n${notes.trim()}`)
    if (source?.trim())  internalParts.push(`How they found us: ${source.trim()}`)

    const styleTagsArr =
      Array.isArray(style_tags) ? style_tags.filter((s): s is string => typeof s === 'string') : null
    const refUrlsArr =
      Array.isArray(reference_urls) ? reference_urls.filter((s): s is string => typeof s === 'string') : null

    const { data: inserted, error } = await supabase
      .from('commission_orders')
      .insert([
        {
          customer_id: customerRow?.id ?? null,
          customer_name: trimmedName,
          customer_email: trimmedEmail,
          customer_phone: customer_phone?.trim() || null,
          service_type,
          style: style?.trim() || null,
          description: description.trim(),
          reference_links: reference_links?.trim() || null,
          reference_urls: refUrlsArr,
          style_tags: styleTagsArr,
          budget: budget?.trim() || null,
          budget_range: typeof budget_range === 'string' ? budget_range : null,
          budget_context: typeof budget_context === 'string' ? budget_context : null,
          quantity: typeof quantity === 'string' ? quantity : null,
          bucket_slug: typeof bucket_slug === 'string' ? bucket_slug : null,
          product_slug: typeof product_slug === 'string' ? product_slug : null,
          tier_slug: typeof tier_slug === 'string' ? tier_slug : null,
          deadline: deadline?.trim() || null,
          status: 'pending',
          internal_notes: internalParts.length ? internalParts.join('\n\n') : null,
        },
      ])
      .select('id,order_number')
      .single()

    if (error) {
      console.error('Commission order insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save your brief. Please try again.' },
        { status: 500 }
      )
    }

    /* Log the initial status transition. */
    if (inserted?.id) {
      await supabase
        .from('order_status_log')
        .insert({ order_id: inserted.id, status: 'pending', by_user: 'customer', note: 'Brief submitted via /order' })
    }

    /* Resolve a friendly turnaround estimate based on the product slug. */
    let approxTurnaround: string | undefined
    let serviceLabel = service_type
    if (typeof product_slug === 'string') {
      const product = await fetchProductBySlug(product_slug)
      if (product) {
        serviceLabel = tier_slug ? `${product.name} · ${tier_slug}` : product.name
        approxTurnaround = formatTurnaround(product)
      }
    }

    /* Fire-and-forget email notifications. */
    Promise.allSettled([
      sendBriefReceiptEmail({
        to: trimmedEmail,
        customerName: trimmedName,
        orderNumber: inserted?.order_number ?? `#${inserted?.id ?? 'pending'}`,
        serviceLabel,
        description: description.trim(),
        approxTurnaround,
      }),
      sendAdminBriefEmail({
        orderId: inserted?.id ?? 0,
        orderNumber: inserted?.order_number ?? `#${inserted?.id ?? 'pending'}`,
        customerName: trimmedName,
        customerEmail: trimmedEmail,
        serviceLabel,
        budgetLabel: budget?.trim() || budget_range || undefined,
        description: description.trim(),
      }),
    ]).catch(() => {})

    return NextResponse.json({
      success: true,
      id: inserted?.id,
      order_number: inserted?.order_number ?? null,
    })
  } catch (err) {
    console.error('Order API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
