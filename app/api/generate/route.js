import { createServerSupabaseClient } from '../../../lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request) {
  // 1. Verify user is authenticated
  const supabase = createServerSupabaseClient(request)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { selves } = await request.json()

  if (!selves || selves.filter(s => s.trim().length > 3).length < 1) {
    return NextResponse.json({ error: 'Please provide at least one abandoned self.' }, { status: 400 })
  }

  const filled = selves.filter(s => s.trim().length > 3)

  const prompt = `You are the curator of "The Museum of Abandoned Selves" — a surreal, poetic, slightly melancholic museum that displays lives people almost lived.

For each of these abandoned selves, create a detailed museum exhibit. Be evocative, specific, and gently haunting. Write as if these lives really happened.

Abandoned selves:
${filled.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Respond ONLY with a valid JSON array (no markdown, no backticks, no preamble) with this exact structure:
[
  {
    "title": "short poetic name for this self",
    "years": "e.g. 1998 – 2031",
    "plaque": "2-3 sentence museum plaque written in past tense, poetic and specific",
    "bio": "3-4 sentences — a biography of this life. Include: city, a pivotal moment, what they gave up for this path, how they aged into it.",
    "artifacts": [
      { "icon": "🎸", "name": "artifact name", "description": "what this object meant to this self" },
      { "icon": "📓", "name": "artifact name", "description": "what this object meant to this self" },
      { "icon": "🗺️", "name": "artifact name", "description": "what this object meant to this self" }
    ],
    "review": "A short imaginary visitor review from the museum guest book — 2-3 sentences, emotional, personal.",
    "reviewer": "A fictional visitor name and date"
  }
]`

  try {
    const res = await fetch('https://api.together.xyz/inference', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-2-70b-chat-hf',
        prompt: prompt,
        max_tokens: 2048,
        temperature: 0.9,
        top_p: 0.95,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Together AI error ${res.status}`)
    }

    const data = await res.json()
    const text = data.output?.choices?.[0]?.text || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const exhibits = JSON.parse(clean)

    return NextResponse.json({ exhibits })
  } catch (err) {
    console.error('Generation error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
