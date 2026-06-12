import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarded')
        .eq('id', user.id)
        .single()

      if (!profile || !profile.onboarded) {
        return NextResponse.redirect(
          new URL('/onboarding', requestUrl.origin)
        )
      }

      return NextResponse.redirect(
        new URL('/dashboard', requestUrl.origin)
      )
    }
  }

  return NextResponse.redirect(
    new URL('/', requestUrl.origin)
  )
}
