import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ── Server client (use in Server Components & API routes) ──
export function createServerSupabaseClient(request, response) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name) {
                    if (request) {
                        return request.cookies.get(name);
                    } else {
                        return cookies().get(name)?.value;
                    }
                },
                set(name, value, options) {
                    if (response) {
                        response.cookies.set(name, value, options);
                    } else if (!request) {
                        try { cookies().set({ name, value, ...options }) } catch { }
                    }
                },
                remove(name, options) {
                    if (response) {
                        response.cookies.set(name, '', options);
                    } else if (!request) {
                        try { cookies().set({ name, value: '', ...options }) } catch { }
                    }
                },
            },
        }
    )
}

// ── Admin client (use only in API routes for privileged ops) ──
export function createAdminClient(request, response) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            cookies: {
                get(name) {
                    if (request) {
                        return request.cookies.get(name);
                    } else {
                        return cookies().get(name)?.value;
                    }
                },
                set(name, value, options) {
                    if (response) {
                        response.cookies.set(name, value, options);
                    } else if (!request) {
                        try { cookies().set({ name, value, ...options }) } catch { }
                    }
                },
                remove(name, options) {
                    if (response) {
                        response.cookies.set(name, '', options);
                    } else if (!request) {
                        try { cookies().set({ name, value: '', ...options }) } catch { }
                    }
                },
            },
        }
    )
}