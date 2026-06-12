import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Completely skip middleware for auth routes
  if (req.nextUrl.pathname.startsWith('/auth')) {
    return res
  }

  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Public routes — always accessible
  const isPublic =
    req.nextUrl.pathname === '/' ||
    req.nextUrl.pathname.startsWith('/auth') ||
    req.nextUrl.pathname.startsWith('/api')

  // Not logged in + protected route → back to landing
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Logged in + on landing page → go to dashboard
  if (session && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(
      new URL('/en/dashboard', req.url)
    )
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|auth).*)',
  ]
}
