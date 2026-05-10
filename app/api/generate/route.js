import { createServerSupabaseClient } from '../../../lib/supabase-server'
import { NextResponse } from 'next/server'

// ── Rate Limit Store ───────────────────────────────────────────────
// In-memory map: userId → array of request timestamps
// Resets naturally when Vercel restarts the serverless function
const rateLimitMap = new Map()

function isRateLimited(userId) {
  const now = Date.now()
  const windowMs = 24 * 60 * 60 * 1000                          // 24 hour window
  const maxRequests = parseInt(process.env.RATE_LIMIT_PER_USER || '5') // 5 per day default

  // Get existing timestamps for this user, remove expired ones
  const timestamps = (rateLimitMap.get(userId) || [])
    .filter(t => now - t < windowMs)

  if (timestamps.length >= maxRequests) {
    return true // blocked
  }

  // Record this request
  timestamps.push(now)
  rateLimitMap.set(userId, timestamps)
  return false // allowed
}

// ── How many requests has this user made today ─────────────────────
function getRequestCount(userId) {
  const now = Date.now()
  const windowMs = 24 * 60 * 60 * 1000
  const timestamps = (rateLimitMap.get(userId) || [])
    .filter(t => now - t < windowMs)
  return timestamps.length
}

// ── Main Handler ───────────────────────────────────────────────────
export async function POST(request) {

  // 1. Auth check — no session = instant reject
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 2. Rate limit check — max 5 museums per user per 24 hours
  if (isRateLimited(user.id)) {
    const count = parseInt(process.env.RATE_LIMIT_PER_USER || '5')
    return NextResponse.json(
      {
        error: 'RATE_LIMIT',
        message: `You have created ${count} museums today. Come back tomorrow for more.`
      },
      {
        status: 429,
        headers: {
          'Retry-After': '86400', // tell client to retry after 24 hours
          'X-RateLimit-Limit': String(count),
          'X-RateLimit-Remaining': '0',
        }
      }
    )
  }

  // 3. Validate input
  const body = await request.json().catch(() => ({}))
  const { selves } = body
  const filled = (selves || []).filter(s =>
    typeof s === 'string' && s.trim().length > 3 && s.trim().length < 200
  )

  if (filled.length < 1) {
    return NextResponse.json(
      { error: 'Please provide at least one abandoned self.' },
      { status: 400 }
    )
  }

  // Cap at 3 selves maximum — no one needs more
  const safeSelf = filled.slice(0, 3)

  // 4. Check Gemini API key exists before making the call
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables')
    return NextResponse.json(
      { error: 'Server configuration error. Please contact support.' },
      { status: 500 }
    )
  }

  // 5. Build prompt
  const prompt = `You are the curator of "The Museum of Abandoned Selves" — a surreal, poetic, slightly melancholic museum that displays lives people almost lived.

For each of these abandoned selves, create a detailed museum exhibit. Be evocative, specific, and gently haunting. Write as if these lives really happened.

Abandoned selves:
${safeSelf.map((s, i) => `${i + 1}. ${s}`).join('\n')}

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

  // 6. Call Gemini
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 2048,
            thinkingConfig: {
              thinkingBudget: 0  // disables thinking mode — faster responses
            }
          },
        }),
      }
    )

    // Handle Gemini-specific errors clearly
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const message = err?.error?.message || `Gemini error ${res.status}`

      // Specific error messages for common failures
      if (res.status === 400) {
        console.error('Gemini 400 - bad request:', message)
        return NextResponse.json(
          { error: 'Generation failed. Please try different wording.' },
          { status: 400 }
        )
      }
      if (res.status === 403 || message.includes('API key')) {
        console.error('Gemini 403 - invalid API key')
        return NextResponse.json(
          { error: 'API key error. Please contact support.' },
          { status: 500 }
        )
      }
      if (res.status === 429) {
        console.error('Gemini 429 - quota exceeded')
        return NextResponse.json(
          { error: 'The museum is very busy right now. Please try again in a few minutes.' },
          { status: 429 }
        )
      }

      throw new Error(message)
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!text) {
      throw new Error('Empty response from Gemini')
    }

    // Safely parse JSON — strip markdown fences if present
    const clean = text.replace(/```json\n?|\n?```/g, '').trim()
    let exhibits

    try {
      exhibits = JSON.parse(clean)
    } catch {
      console.error('JSON parse failed. Raw text:', text.slice(0, 200))
      throw new Error('Could not parse museum data. Please try again.')
    }

    // Validate the response has the right shape
    if (!Array.isArray(exhibits) || exhibits.length === 0) {
      throw new Error('Invalid museum data received. Please try again.')
    }

    // Log usage for monitoring (no personal data)
    console.log(`Museum generated: ${safeSelf.length} selves, user ${user.id.slice(0, 8)}...`)

    return NextResponse.json({
      exhibits,
      // Tell client how many requests they have left today
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