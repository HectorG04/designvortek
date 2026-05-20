/**
 * Auth middleware helper — refreshes session cookies on every request.
 * Called by /middleware.ts at the project root.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './types'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Refresh the session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /admin/* routes
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/admin/login'
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect logged-in users away from /admin/login
  if (request.nextUrl.pathname === '/admin/login' && user) {
    const adminUrl = request.nextUrl.clone()
    adminUrl.pathname = '/admin'
    return NextResponse.redirect(adminUrl)
  }

  return supabaseResponse
}
