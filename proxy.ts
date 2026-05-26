import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js 16+ "proxy" (formerly "middleware").
 *
 * Two responsibilities:
 *   1. Auth check on /admin/* — Supabase session must be valid, else redirect to login.
 *   2. Add X-Robots-Tag: noindex, nofollow header on /admin/* responses — belt-and-suspenders
 *      on top of the robots.ts disallow + the admin layout's metadata.robots config.
 *      Three layers of "do not index" protect against any single point of failure
 *      (Google ignoring robots.txt for direct URL submissions, accidental removal
 *      of the layout metadata, etc.).
 *
 * Public pages bypass this entirely.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Admin: auth + noindex header
  if (pathname.startsWith('/admin')) {
    let response: NextResponse
    try {
      response = await updateSession(request)
    } catch (err) {
      console.error('[proxy] auth error:', err)
      if (!pathname.startsWith('/admin/login')) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/admin/login'
        return NextResponse.redirect(loginUrl)
      }
      response = NextResponse.next()
    }
    // Hard noindex header on every /admin/* response, regardless of auth outcome.
    // This survives even if a search engine ignores robots.txt and somehow reaches
    // a redirect or error page.
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
    return response
  }

  // Same protection for /api/* (any internal API route accidentally exposed)
  // and /v2/* (preview/staging surfaces) — these should never appear in search.
  if (pathname.startsWith('/api') || pathname.startsWith('/v2')) {
    const response = NextResponse.next()
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
