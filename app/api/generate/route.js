import { createServerSupabaseClient } from '../../../lib/supabase-server'
import { NextResponse } from 'next/server'

// ── Rate Limit Store ───────────────────────────────────────────────
const rateLimitMap = new Map()

function isRateLimited(userId) {
  const now = Date.now()
  const windowMs = 24 * 60 * 60 * 1000
  const maxRequests = parseInt(process.env.RATE_LIMIT_PER_USER || '5')

  const timestamps = (rateLimitMap.get(userId) || [])
    .filter(t => now - t < windowMs)

  if (timestamps.length >= maxRequests) return true

  timestamps.push(now)
  rateLimitMap.set(userId, timestamps)
  return false
}

function getRequestCount(userId) {
  const now = Date.now()
  const windowMs = 24 * 60 * 60 * 1000
  return (rateLimitMap.get(userId) || [])
    .filter(t => now - t < windowMs).length
}

// ── Main Handler ───────────────────────────────────────────────────
export async function POST(request) {

  // 1. Auth check
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Rate limit — 5 museums per user per 24 hours
  if (isRateLimited(user.id)) {
    const limit = parseInt(process.env.RATE_LIMIT_PER_USER || '5')
    return NextResponse.json(
      {
        error: 'RATE_LIMIT',
        message: `You have created ${limit} museums today. Come back tomorrow.`
      },
      { status: 429 }
    )
  }

  // 3. Validate input
  const body = await request.json().catch(() => ({}))
  const { selves } = body
  const filled = (selves || [])
    .filter(s => typeof s === 'string' && s.trim().length > 3 && s.trim().length < 200)
    .slice(0, 3) // max 3 selves

  if (filled.length < 1) {
    return NextResponse.json(
      { error: 'Please provide at least one abandoned self.' },
      { status: 400 }
    )
  }

  // 4. Check API key
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables')
    return NextResponse.json(
      { error: 'Server configuration error. Please contact support.' },
      { status: 500 }
    )
  }

  // 5. Build prompt
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

  // 6. Call Groq API
  try {
    const res = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile', // best free model — excellent creative writing
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.9,
          max_tokens: 2048,
        }),
      }
    )

    // Handle Groq-specific errors
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const message = err?.error?.message || `Groq error ${res.status}`

      if (res.status === 401) {
        console.error('Groq 401 - invalid API key')
        return NextResponse.json(
          { error: 'API configuration error. Please contact support.' },
          { status: 500 }
        )
      }
      if (res.status === 429) {
        console.error('Groq 429 - rate limit hit')
        return NextResponse.json(
          { error: 'The museum is very busy right now. Please try again in a minute.' },
          { status: 429 }
        )
      }

      throw new Error(message)
    }

    const data = await res.json()

    // Groq uses OpenAI response format
    const text = data.choices?.[0]?.message?.content || ''

    if (!text) {
      throw new Error('Empty response from AI. Please try again.')
    }

    // Safely parse JSON
    const clean = text.replace(/```json\n?|\n?```/g, '').trim()
    let exhibits

    try {
      exhibits = JSON.parse(clean)
    } catch {
      console.error('JSON parse failed. Raw:', text.slice(0, 300))
      throw new Error('Could not parse museum data. Please try again.')
    }

    if (!Array.isArray(exhibits) || exhibits.length === 0) {
      throw new Error('Invalid museum data. Please try again.')
    }

    console.log(`✅ Museum generated: ${filled.length} selves, user ${user.id.slice(0, 8)}...`)

    return NextResponse.json({
      exhibits,
      requestsRemaining: parseInt(process.env.RATE_LIMIT_PER_USER || '5') - getRequestCount(user.id)
    })

  } catch (err) {
    console.error('Generate error:', err.message)
    return NextResponse.json(
      { error: err.message || 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}