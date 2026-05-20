import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js 16+ "proxy" (formerly "middleware").
 * Only runs Supabase auth check on /admin/* paths.
 * Public pages bypass this entirely.
 */
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      return await updateSession(request)
    } catch (err) {
      console.error('[proxy] auth error:', err)
      if (!request.nextUrl.pathname.startsWith('/admin/login')) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/admin/login'
        return NextResponse.redirect(loginUrl)
      }
      return NextResponse.next()
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
