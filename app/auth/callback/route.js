import { createServerSupabaseClient } from '../../../lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const response = NextResponse.redirect(new URL('/museum', request.url))
    const supabase = createServerSupabaseClient(request, response)
    await supabase.auth.exchangeCodeForSession(code)
    return response
  }

  // After login, redirect to the main app
  return NextResponse.redirect(new URL('/museum', request.url))
}
