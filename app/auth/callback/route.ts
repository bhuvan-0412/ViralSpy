import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore if called from Server Component
            }
          },
        },
      }
    )
    await supabase.auth.exchangeCodeForSession(code)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      // Check if user_profile exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarded')
        .eq('id', user.id)
        .single()

      // Create profile if doesn't exist
      if (!profile) {
        await supabase.from('user_profiles').insert({
          id: user.id,
          display_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          onboarded: false
        })
        return NextResponse.redirect(
          new URL('/en/onboarding', requestUrl.origin)
        )
      }

      // Redirect based on onboarding status
      if (!profile.onboarded) {
        return NextResponse.redirect(
          new URL('/en/onboarding', requestUrl.origin)
        )
      }

      return NextResponse.redirect(
        new URL('/en/dashboard', requestUrl.origin)
      )
    }
  }

  // If no code or user, go back to landing
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
