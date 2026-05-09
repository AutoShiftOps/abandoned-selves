import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ── Browser client ─────────────────────────────────────
// Use this in Client Components ('use client')
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// ── Server client ──────────────────────────────────────
// Use this in Server Components and API routes
// Next.js 14: cookies() is async — must be awaited
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
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
            // Safely ignored in read-only server contexts
          }
        },
      },
    }
  )
}

// ── Admin client ───────────────────────────────────────
// Use only in API routes for privileged operations
// Bypasses Row Level Security — never expose to client
export function createAdminClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}
