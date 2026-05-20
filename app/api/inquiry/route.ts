import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/inquiry
 * Contact-form submissions. Inserts into `inquiries` table.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, message } = body

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

    const { error } = await supabase.from('inquiries').insert([
      {
        name: name.trim(),
        email: trimmedEmail,
        message: message.trim(),
      },
    ])

    if (error) {
      console.error('Inquiry insert error:', error)
      return NextResponse.json(
        { error: 'Failed to send. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Inquiry API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
