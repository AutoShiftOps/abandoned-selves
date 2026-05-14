'use client'
import { useState, useEffect } from 'react'

const style = `
  .cinematic-loading {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 24px;
    background: var(--bg);
    position: relative;
    overflow: hidden;
  }

  /* Slow ambient pulse behind everything */
  .cinematic-loading::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,146,58,0.06) 0%, transparent 70%);
    animation: ambientPulse 4s ease-in-out infinite;
    pointer-events: none;
  }

  .loading-candle {
    font-size: 52px;
    margin-bottom: 48px;
    animation: candleFlicker 2s ease-in-out infinite alternate;
    filter: drop-shadow(0 0 12px rgba(201,146,58,0.4));
  }

  .loading-eyebrow {
    font-size: 11px;
    letter-spacing: 6px;
    text-transform: uppercase;
    color: var(--amber-dim);
    margin-bottom: 32px;
  }

  /* The main message — types in character by character */
  .loading-message {
    font-family: 'Playfair Display', serif;
    font-size: clamp(20px, 4vw, 32px);
    font-style: italic;
    color: var(--cream);
    text-align: center;
    max-width: 600px;
    line-height: 1.5;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* The self being built — shown below */
  .loading-subject {
    margin-top: 24px;
    font-size: 14px;
    color: var(--muted);
    font-style: italic;
    text-align: center;
    max-width: 440px;
    line-height: 1.6;
    min-height: 40px;
    padding: 0 24px;
  }

  .loading-subject span {
    color: var(--amber-dim);
  }

  /* Progress dots */
  .loading-progress {
    display: flex;
    gap: 10px;
    margin-top: 48px;
  }

  .loading-progress-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--border);
    transition: background 0.4s ease;
  }

  .loading-progress-dot.active {
    background: var(--amber);
    box-shadow: 0 0 8px rgba(201,146,58,0.5);
  }

  .loading-progress-dot.done {
    background: var(--amber-dim);
  }

  @keyframes candleFlicker {
    0%   { transform: scale(1) rotate(-1deg);   opacity: 0.85; }
    25%  { transform: scale(1.04) rotate(1deg); opacity: 1; }
    50%  { transform: scale(0.98) rotate(-0.5deg); opacity: 0.9; }
    75%  { transform: scale(1.02) rotate(0.5deg); opacity: 1; }
    100% { transform: scale(1) rotate(-1deg);   opacity: 0.88; }
  }

  @keyframes ambientPulse {
    0%, 100% { transform: scale(0.8); opacity: 0.5; }
    50%       { transform: scale(1.2); opacity: 1; }
  }
`

// Messages that rotate — building atmosphere
const CURATOR_MESSAGES = [
    "Unlocking the archive...",
    "Gathering dust from forgotten rooms...",
    "The curator is reviewing the collection...",
    "Lighting candles in empty corridors...",
    "Hanging portraits of paths not taken...",
    "The plaques are being engraved...",
    "Artifacts are being labelled...",
    "The museum opens shortly...",
]

// Personalised messages using the user's actual input
function getPersonalisedMessages(selves) {
    const msgs = []
    selves.forEach(self => {
        const trimmed = self.trim()
        msgs.push(`Building the exhibit for ${trimmed}...`)
        msgs.push(`Searching for the artifacts ${trimmed} would have owned...`)
        msgs.push(`Writing the biography of ${trimmed}...`)
    })
    return msgs
}

export default function CinematicLoading({ selves = [] }) {
    const [messageIndex, setMessageIndex] = useState(0)
    const [dotIndex, setDotIndex] = useState(0)

    // Build alternating personalised + curator messages
    const allMessages = []
    const personalised = getPersonalisedMessages(selves)
    const curator = CURATOR_MESSAGES

    const maxLen = Math.max(personalised.length, curator.length)
    for (let i = 0; i < maxLen; i++) {
        if (i < personalised.length) allMessages.push({ text: personalised[i], type: 'personal' })
        if (i < curator.length) allMessages.push({ text: curator[i], type: 'curator' })
    }

    useEffect(() => {
        const msgInterval = setInterval(() => {
            setMessageIndex(i => (i + 1) % allMessages.length)
        }, 2400)

        const dotInterval = setInterval(() => {
            setDotIndex(i => (i + 1) % (selves.length + 1))
        }, 2000)

        return () => {
            clearInterval(msgInterval)
            clearInterval(dotInterval)
        }
    }, [allMessages.length, selves.length])

    const current = allMessages[messageIndex] || { text: 'The museum is being built...', type: 'curator' }

    return (
        <>
            <style>{style}</style>
            <div className="cinematic-loading">
                <div className="loading-candle">🕯️</div>

                <span className="loading-eyebrow">Building Your Museum</span>

                <p className="loading-message">
                    {current.text}
                </p>

                {current.type === 'personal' && selves.length > 1 && (
                    <p className="loading-subject">
                        {selves.map((s, i) => (
                            <span key={i}>
                                {i > 0 && <> · </>}
                                <span>{s}</span>
                            </span>
                        ))}
                    </p>
                )}

                {/* One dot per exhibit being built */}
                <div className="loading-progress">
                    {selves.map((_, i) => (
                        <div
                            key={i}
                            className={`loading-progress-dot ${i < dotIndex ? 'done' : i === dotIndex ? 'active' : ''
                                }`}
                        />
                    ))}
                    {/* Final dot for the "Current You" room */}
                    <div
                        className={`loading-progress-dot ${dotIndex >= selves.length ? 'active' : ''
                            }`}
                    />
                </div>
            </div>
        </>
    )
}
