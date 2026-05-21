import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/* GET /api/waitlist/export
 * Returns the full waitlist as CSV. Requires an authenticated admin session
 * (anyone hitting it without auth gets a 401). */
export async function GET() {
  /* Auth check via the SSR client which reads the session cookie. */
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('waitlist')
    .select('email,name,phone,source,interested_in,notes,created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = data ?? []
  const header = ['email', 'name', 'phone', 'source', 'interested_in', 'notes', 'created_at']
  const csv = [
    header.join(','),
    ...rows.map((r) =>
      header
        .map((k) => {
          const v = (r as Record<string, unknown>)[k]
          if (v === null || v === undefined) return ''
          const s = String(v)
          /* Quote if the value contains a comma, quote, or newline. Double-up
           * any embedded quotes per RFC 4180. */
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(','),
    ),
  ].join('\n')

  const filename = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
