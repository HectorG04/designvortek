import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendInquiryAckEmail, sendAdminInquiryEmail } from '@/lib/email'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/inquiry
 * Contact-form submissions. Inserts into `inquiries` table, sends:
 *   - customer ack (`Thanks for reaching out`)
 *   - admin notification (`New inquiry from …`)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message, topic } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Your name is required.' }, { status: 400 })
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }
    const trimmedEmail = email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: 'Please include a message.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: inserted, error } = await supabase
      .from('inquiries')
      .insert([
        {
          name: name.trim(),
          email: trimmedEmail,
          message: message.trim(),
        },
      ])
      .select('id')
      .single()

    if (error) {
      console.error('Inquiry insert error:', error)
      return NextResponse.json(
        { error: 'Failed to send. Please try again.' },
        { status: 500 }
      )
    }

    /* Fire-and-forget notifications. */
    Promise.allSettled([
      sendInquiryAckEmail({
        to: trimmedEmail,
        customerName: name.trim(),
      }),
      sendAdminInquiryEmail({
        customerName: name.trim(),
        customerEmail: trimmedEmail,
        topic: typeof topic === 'string' && topic.trim() ? topic.trim() : 'General inquiry',
        body: message.trim(),
        inquiryId: inserted?.id ?? undefined,
      }),
    ]).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Inquiry API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
