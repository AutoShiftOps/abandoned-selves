import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name)              { return request.cookies.get(name)?.value },
        set(name, value, opts) { response.cookies.set({ name, value, ...opts }) },
        remove(name, opts)     { response.cookies.set({ name, value: '', ...opts }) },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // If user tries to access /museum without being logged in → redirect to home
  if (!session && request.nextUrl.pathname.startsWith('/museum')) {
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('auth', 'required') // trigger login modal on landing page
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/museum/:path*'],
}
