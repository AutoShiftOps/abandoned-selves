// lib/supabase-server.js
// ✅ Safe to import in API routes and Server Components
// ❌ Never import this in 'use client' components

import { createServerClient, createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// For API routes and Server Components
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
                        // Safe to ignore in read-only server contexts
                    }
                },
            },
        }
    )
}

// For privileged operations — bypasses Row Level Security
// Only use in API routes, never expose to client
export function createAdminClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )
}