import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail, orderConfirmationHTML, adminOrderNotifyHTML, ADMIN_EMAIL } from '@/lib/email'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/order
 * Submits a commission brief. Inserts into `commission_orders` table.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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

    const { data: inserted, error } = await supabase
      .from('commission_orders')
      .insert([
        {
          customer_name: customer_name.trim(),
          customer_email: trimmedEmail,
          customer_phone: customer_phone?.trim() || null,
          service_type,
          style: style?.trim() || null,
          description: description.trim(),
          reference_links: reference_links?.trim() || null,
          budget: budget?.trim() || null,
          deadline: deadline?.trim() || null,
          status: 'pending',
        },
      ])
      .select('id')
      .single()

    if (error) {
      console.error('Commission order insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save your brief. Please try again.' },
        { status: 500 }
      )
    }

    // Fire-and-forget email notifications (no-op if RESEND_API_KEY missing).
    // We don't await — but we use Promise.allSettled so failures don't crash the response.
    Promise.allSettled([
      sendEmail({
        to: trimmedEmail,
        subject: `Brief received — we'll be in touch within 48 hours`,
        html: orderConfirmationHTML({
          customerName: customer_name.trim(),
          serviceType: service_type,
          description: description.trim(),
        }),
      }),
      ADMIN_EMAIL
        ? sendEmail({
            to: ADMIN_EMAIL,
            subject: `New commission brief #${inserted?.id} — ${customer_name.trim()}`,
            replyTo: trimmedEmail,
            html: adminOrderNotifyHTML({
              id: inserted?.id ?? 0,
              customerName: customer_name.trim(),
              customerEmail: trimmedEmail,
              serviceType: service_type,
              budget: budget?.trim() || null,
              description: description.trim(),
            }),
          })
        : Promise.resolve(false),
    ]).catch(() => {})

    return NextResponse.json({ success: true, id: inserted?.id })
  } catch (err) {
    console.error('Order API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
