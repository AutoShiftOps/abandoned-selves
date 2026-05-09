import { createServerSupabaseClient } from '../../../lib/supabase-server'
import { NextResponse } from 'next/server'

// POST /api/feedback — saves how the museum made the user feel
export async function POST(request) {
  const supabase = createServerSupabaseClient(request)
  const { data: { session } } = await supabase.auth.getSession()

  const { feeling, museum_id, is_public_visitor } = await request.json()

  if (!feeling?.trim()) return NextResponse.json({ error: 'Empty feedback' }, { status: 400 })

  const { error } = await supabase.from('feedback').insert({
    user_id: session?.user?.id || null,
    museum_id: museum_id || null,
    feeling: feeling.trim().slice(0, 1000), // cap at 1000 chars
    is_public_visitor: is_public_visitor || false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
