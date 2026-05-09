import { createServerSupabaseClient, createAdminClient } from '../../../lib/supabase'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

// GET /api/museums — fetch current user's museums
export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('museums')
    .select('id, slug, selves, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ museums: data })
}

// POST /api/museums — save a new museum
export async function POST(request) {
  const supabase = await createServerSupabaseClient()
  const admin = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check free tier limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_paid, museum_count')
    .eq('id', user.id)
    .single()

  if (!profile?.is_paid && (profile?.museum_count || 0) >= 1) {
    return NextResponse.json(
      { error: 'FREE_LIMIT', message: 'Upgrade to create unlimited museums.' },
      { status: 403 }
    )
  }

  const { selves, exhibits } = await request.json()
  const slug = nanoid(8)

  const { data, error } = await supabase
    .from('museums')
    .insert({ user_id: user.id, slug, selves, exhibits })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Increment museum count
  await admin
    .from('profiles')
    .update({ museum_count: (profile?.museum_count || 0) + 1 })
    .eq('id', user.id)

  return NextResponse.json({ museum: data })
}
