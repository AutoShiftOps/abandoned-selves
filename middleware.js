import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session — required for Next.js App Router
    const { data: { user } } = await supabase.auth.getUser()

    // If no user and trying to access /museum — redirect to home
    if (!user && request.nextUrl.pathname.startsWith('/museum')) {
        const loginUrl = new URL('/', request.url)
        loginUrl.searchParams.set('auth', 'required')
        return NextResponse.redirect(loginUrl)
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/museum/:path*'],
}
