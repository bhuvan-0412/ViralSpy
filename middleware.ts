import createMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const intlMiddleware = createMiddleware({
  locales: ['en', 'hi', 'te'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
})

export async function middleware(req: NextRequest) {
  // First run next-intl middleware to handle locale rewrites/redirects
  let res = intlMiddleware(req)
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value)
          })
          res = intlMiddleware(req)
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  
  const { data: { session } } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname
  const cleanPath = pathname.replace(/^\/(en|hi|te)(\/|$)/, '/')

  const publicRoutes = ['/', '/auth', '/auth/callback']
  const isPublic = publicRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  )

  // If not logged in and trying to access protected route
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // If logged in and on landing page — go to dashboard
  if (session && cleanPath === '/') {
    // Respect locale prefix if present in URL
    const locale = pathname.split('/')[1]
    const hasLocale = ['en', 'hi', 'te'].includes(locale)
    const redirectUrl = new URL(hasLocale ? `/${locale}/dashboard` : '/dashboard', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
