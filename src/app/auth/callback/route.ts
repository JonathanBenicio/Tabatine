import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()

      if (user && user.email) {
        // Enforce `@tabatine` domain restriction OR allow specific developer email
        const isTabatine = user.email.includes('@tabatine.') || user.email === 'jonathan.developer.fullstack@gmail.com';

        if (!isTabatine) {
          // Sign out immediately
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/auth/auth-code-error?error=invalid_domain`)
        }

        const forwardedHost = request.headers.get('x-forwarded-host')
        const isLocalEnv = process.env.NODE_ENV === 'development'

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
          return NextResponse.redirect(`${origin}${next}`)
        }
      } else {
         // No user/email found
         await supabase.auth.signOut()
         return NextResponse.redirect(`${origin}/auth/auth-code-error`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
