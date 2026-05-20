import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Only run Supabase session refresh + admin auth on /admin/* paths.
  // Everything else (public site) bypasses middleware entirely → no risk of crashing the public pages.
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      return await updateSession(request)
    } catch (err) {
      console.error('[middleware] auth error:', err)
      // If auth check crashes, send admin visitors to login instead of 500-ing
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
    /*
     * Match all request paths except:
     * - _next/static, _next/image, favicon.ico, sitemap.xml, robots.txt
     * - public assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
