import { createServerSupabaseClient } from '../../../lib/supabase-server'
import { NextResponse } from 'next/server'

// ── Rate Limit Store ───────────────────────────────────────────────
const rateLimitMap = new Map()

function isRateLimited(userId) {
  const now = Date.now()
  const windowMs = 24 * 60 * 60 * 1000
  const maxRequests = parseInt(process.env.RATE_LIMIT_PER_USER || '5')
  const timestamps = (rateLimitMap.get(userId) || []).filter(t => now - t < windowMs)
  if (timestamps.length >= maxRequests) return true
  timestamps.push(now)
  rateLimitMap.set(userId, timestamps)
  return false
}

function getRequestCount(userId) {
  const now = Date.now()
  const windowMs = 24 * 60 * 60 * 1000
  return (rateLimitMap.get(userId) || []).filter(t => now - t < windowMs).length
}

// ── The Prompt — This Is Everything ───────────────────────────────
function buildPrompt(selves) {
  return `You are the head curator of "The Museum of Abandoned Selves" — the world's only museum dedicated to lives people almost lived. Your writing has been compared to W.G. Sebald and Joan Didion. You write with surgical specificity and quiet devastation.

Your job: transform each abandoned self below into a museum exhibit so vivid and specific that the person reading it feels their chest tighten.

THE GOLDEN RULES OF YOUR WRITING:
1. NEVER use vague language. Not "she loved music" — instead "she had memorized the exact finger pressure required to coax a clean C-sharp from her grandmother's upright Yamaha."
2. ALWAYS name a specific city, neighbourhood, year, and turning point.
3. The biography must contain ONE moment of irreversible choice — the exact conversation, the exact Tuesday, the exact phone call that closed this door forever.
4. Artifacts must feel found, not invented. Like something discovered in a shoebox, not purchased for display.
5. The museum plaque must make a person feel they have lost something they never had.
6. The guest book review must feel written by a stranger who recognizes something true about their own life.
7. Write dates as specific spans that feel lived: "March 1998 – November 2041" not "1998-2041."
8. The "years" field should feel like a full life compressed — not just when they practiced this self, but the entire arc of who they would have become.

WHAT MAKES AN "AH MOMENT":
- A detail so specific it feels private
- A loss so small it seems unremarkable — yet the reader immediately knows it is everything
- The sense that this life was real and is now irretrievably gone

Abandoned selves to exhibit:
${selves.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Respond ONLY with a valid JSON array. No markdown. No backticks. No explanation. Just the raw JSON array.

[
  {
    "title": "Poetic name — 2-4 words, like a painting title. Evocative, not literal.",
    "years": "Month Year – Month Year (full life arc of this self, spanning decades)",
    "plaque": "3 sentences. Written as if chiseled in bronze. Past tense. Devastating specificity. The final sentence should land like a door closing.",
    "bio": "4-5 sentences. Name a specific city and neighbourhood. Include the exact moment the door closed on this life — the conversation, the decision, the day. Describe what this person looked like at 40, having lived this life fully. End with something they would have known that they now never will.",
    "artifacts": [
      {
        "icon": "(a single relevant emoji)",
        "name": "Specific object name — not 'guitar' but 'Yamaha FG800 Acoustic, natural finish, capo on the third fret'",
        "description": "What this object meant. Not what it is — what it COST this person emotionally. One sentence that makes it impossible to see this object as ordinary ever again."
      },
      {
        "icon": "(a single relevant emoji)",
        "name": "A second artifact — something mundane that became sacred in this life",
        "description": "The emotional weight of this object. Specific. Quiet. True."
      },
      {
        "icon": "(a single relevant emoji)",
        "name": "A third artifact — something the person left behind or never acquired",
        "description": "Its absence is as important as its presence. Write the description from that angle."
      }
    ],
    "review": "Written by a fictional visitor. First person. 3 sentences. They came to see this exhibit and recognized something in it that they have never told anyone. The final sentence should be something the reader cannot forget.",
    "reviewer": "Fictional full name, city, and specific date (e.g., 'M. Chen, Vancouver — March 4, 2026')"
  }
]`
}

// ── Main Handler ───────────────────────────────────────────────────
export async function POST(request) {

  // 1. Auth check
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Rate limit
  if (isRateLimited(user.id)) {
    const limit = parseInt(process.env.RATE_LIMIT_PER_USER || '5')
    return NextResponse.json(
      { error: 'RATE_LIMIT', message: `You have created ${limit} museums today. Come back tomorrow.` },
      { status: 429 }
    )
  }

  // 3. Validate input
  const body = await request.json().catch(() => ({}))
  const { selves } = body
  const filled = (selves || [])
    .filter(s => typeof s === 'string' && s.trim().length > 3 && s.trim().length < 300)
    .slice(0, 3)

  if (filled.length < 1) {
    return NextResponse.json(
      { error: 'Please describe at least one abandoned self.' },
      { status: 400 }
    )
  }

  // 4. Check API key
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set')
    return NextResponse.json(
      { error: 'Server configuration error. Please contact support.' },
      { status: 500 }
    )
  }

  // 5. Call Groq
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
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              // System message sets the emotional tone
              role: 'system',
              content: 'You are a literary curator who writes with the precision of a poet and the honesty of a therapist. Your exhibits make people cry in public. You never write anything generic. Every sentence earns its place.'
            },
            {
              role: 'user',
              content: buildPrompt(filled)
            }
          ],
          temperature: 1.0,   // higher = more creative and specific
          max_tokens: 3000,   // more room for detail
        }),
      }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const message = err?.error?.message || `Groq error ${res.status}`

      if (res.status === 401) {
        return NextResponse.json({ error: 'API configuration error.' }, { status: 500 })
      }
      if (res.status === 429) {
        return NextResponse.json(
          { error: 'The museum is very busy right now. Please try again in a minute.' },
          { status: 429 }
        )
      }
      throw new Error(message)
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''

    if (!text) throw new Error('Empty response. Please try again.')

    // Parse JSON — handle markdown fences if model adds them
    const clean = text.replace(/```json\n?|\n?```/g, '').trim()
    let exhibits

    try {
      exhibits = JSON.parse(clean)
    } catch {
      // Try to extract JSON array if there's surrounding text
      const match = clean.match(/\[[\s\S]*\]/)
      if (match) {
        exhibits = JSON.parse(match[0])
      } else {
        console.error('JSON parse failed. Raw:', text.slice(0, 400))
        throw new Error('Could not parse museum data. Please try again.')
      }
    }

    if (!Array.isArray(exhibits) || exhibits.length === 0) {
      throw new Error('Invalid museum data received. Please try again.')
    }

    console.log(`✅ Museum generated: ${filled.length} exhibits, user ${user.id.slice(0, 8)}...`)

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
