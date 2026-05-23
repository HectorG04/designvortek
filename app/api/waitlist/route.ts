import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendAdminWaitlistEmail } from '@/lib/email'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone, source, interested_in } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Upsert (replace if exists by email)
    const { error } = await supabase
      .from('waitlist')
      .upsert(
        [
          {
            email: trimmedEmail,
            name: name?.trim() || null,
            phone: phone?.trim() || null,
            source: source || 'unknown',
            interested_in: interested_in || null,
          },
        ],
        { onConflict: 'email' }
      )

    if (error) {
      console.error('Waitlist upsert error:', error)
      return NextResponse.json(
        { error: 'Failed to save. Please try again.' },
        { status: 500 }
      )
    }

    /* Admin notify, fire-and-forget. No customer confirmation because the
     * homepage waitlist signup is a one-field email-only flow. */
    sendAdminWaitlistEmail({
      email: trimmedEmail,
      name: name?.trim() || null,
      source: source || null,
      interestedIn: interested_in || null,
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Waitlist API error:', err)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    )
  }
}
