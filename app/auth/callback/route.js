import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://almostbecame.com'

  if (code) {
    // Next.js 14 — cookies() must be awaited
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
              // Safely ignored in read-only contexts
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // ✅ Success — send to the app
      return NextResponse.redirect(`${appUrl}/museum`)
    }

    console.error('Auth callback error:', error.message)
  }

  // ❌ Something went wrong — send back to home with error flag
  return NextResponse.redirect(`${appUrl}/?error=auth_failed`)
}
