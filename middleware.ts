import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const pathname = req.nextUrl.pathname

  // Skip middleware entirely for these paths
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('favicon')
  ) {
    return res
  }

  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // Landing page — if logged in redirect to dashboard
  if (pathname === '/' || pathname === '') {
    if (session) {
      return NextResponse.redirect(
        new URL('/en/dashboard', req.url)
      )
    }
    return res
  }

  // Protected routes — if not logged in redirect to landing
  if (!session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
