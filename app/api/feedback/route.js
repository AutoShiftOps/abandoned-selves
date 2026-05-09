import { createServerSupabaseClient } from '../../../lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { feeling, museum_id, is_public_visitor } = await request.json()

  if (!feeling?.trim()) {
    return NextResponse.json({ error: 'Empty feedback' }, { status: 400 })
  }

  const { error } = await supabase.from('feedback').insert({
    user_id: user?.id || null,
    museum_id: museum_id || null,
    feeling: feeling.trim().slice(0, 1000),
    is_public_visitor: is_public_visitor || false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}