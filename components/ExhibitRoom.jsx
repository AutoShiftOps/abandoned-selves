'use client'
import { useState, useEffect } from 'react'

const style = `
  /* ── ROOM ENTRANCE ── */
  /* Each exhibit fades in like a light being turned on */
  .exhibit-reveal {
    animation: roomEnter 1.2s ease both;
  }

  @keyframes roomEnter {
    0%   { opacity: 0; transform: translateY(32px); filter: brightness(0); }
    40%  { opacity: 0.3; transform: translateY(16px); filter: brightness(0.3); }
    100% { opacity: 1; transform: translateY(0); filter: brightness(1); }
  }

  .exhibit-wrap {
    max-width: 720px; margin: 0 auto;
    padding: 48px 28px 80px;
  }

  /* ── ROOM HEADER ── */
  .room-label {
    font-size: 10px; letter-spacing: 8px;
    text-transform: uppercase; color: var(--amber-dim);
    margin-bottom: 6px; display: block;
    animation: fadeUp 0.8s 0.3s ease both;
  }

  .exhibit-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 5vw, 52px);
    font-weight: 900; font-style: italic;
    line-height: 1.05; margin-bottom: 8px;
    color: var(--cream);
    animation: fadeUp 0.8s 0.5s ease both;
  }

  .exhibit-years {
    font-size: 13px; letter-spacing: 4px;
    color: var(--muted); margin-bottom: 48px;
    animation: fadeUp 0.8s 0.6s ease both;
  }

  /* ── PLAQUE ── */
  .museum-plaque {
    background: var(--panel);
    border: 1px solid var(--border);
    border-left: 4px solid var(--amber);
    padding: 28px 32px; margin-bottom: 40px;
    position: relative;
    animation: fadeUp 0.8s 0.8s ease both;
  }

  .museum-plaque::before {
    content: '📜';
    position: absolute; top: -14px; left: 24px;
    background: var(--panel); padding: 0 8px; font-size: 18px;
  }

  .plaque-eyebrow {
    font-size: 9px; letter-spacing: 5px;
    text-transform: uppercase; color: var(--amber-dim);
    margin-bottom: 14px; display: block;
  }

  .plaque-text {
    font-size: 18px; line-height: 1.8;
    color: var(--cream); font-style: italic;
    font-family: 'Cormorant Garamond', serif;
  }

  /* ── BIOGRAPHY ── */
  .exhibit-bio {
    font-size: 17px; line-height: 1.9;
    color: #c8bcaa; margin-bottom: 48px;
    font-family: 'Cormorant Garamond', serif;
    animation: fadeUp 0.8s 1s ease both;
  }

  /* ── ARTIFACTS ── */
  .artifacts-section {
    animation: fadeUp 0.8s 1.2s ease both;
  }

  .artifacts-heading {
    font-family: 'Playfair Display', serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 6px; text-transform: uppercase;
    color: var(--muted); margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }

  .artifact {
    display: flex; gap: 20px; align-items: flex-start;
    padding: 20px 24px; margin-bottom: 12px;
    background: var(--panel); border: 1px solid var(--border);
    transition: border-color 0.3s;
  }

  .artifact:hover { border-color: var(--amber-dim); }

  .artifact-icon { font-size: 26px; flex-shrink: 0; margin-top: 3px; }

  .artifact-info {}

  .artifact-name {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 700;
    margin-bottom: 6px; color: var(--cream);
    line-height: 1.3;
  }

  .artifact-desc {
    font-size: 15px; color: var(--muted);
    line-height: 1.65; font-style: italic;
    font-family: 'Cormorant Garamond', serif;
  }

  /* ── GUEST BOOK ── */
  .guest-book {
    margin-top: 40px; padding: 28px 28px 24px;
    border: 1px solid var(--border);
    background: rgba(201,146,58,0.02);
    position: relative;
    animation: fadeUp 0.8s 1.4s ease both;
  }

  .guest-book::before {
    content: '\u201C';
    font-family: 'Playfair Display', serif;
    font-size: 100px; color: var(--amber-dim);
    position: absolute; top: -28px; left: 16px;
    line-height: 1; opacity: 0.3;
    pointer-events: none;
  }

  .guest-book-label {
    font-size: 9px; letter-spacing: 5px;
    text-transform: uppercase; color: var(--amber-dim);
    margin-bottom: 14px; display: block;
  }

  .guest-book-text {
    font-size: 17px; line-height: 1.75;
    font-style: italic; color: #b5a896;
    font-family: 'Cormorant Garamond', serif;
    margin-bottom: 14px;
  }

  .guest-book-author {
    font-size: 13px; color: var(--muted);
    letter-spacing: 2px;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

export default function ExhibitRoom({ exhibit, index, total }) {
    const [visible, setVisible] = useState(false)

    // Slight delay before animating in — feels like a room being entered
    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 80)
        return () => clearTimeout(t)
    }, [exhibit])

    if (!exhibit) return null

    return (
        <>
            <style>{style}</style>
            <div className={`exhibit-wrap ${visible ? 'exhibit-reveal' : ''}`} key={exhibit.title}>

                <span className="room-label">Room {index + 1} of {total}</span>
                <h1 className="exhibit-title">{exhibit.title}</h1>
                <p className="exhibit-years">{exhibit.years}</p>

                {/* Museum Plaque */}
                <div className="museum-plaque">
                    <span className="plaque-eyebrow">Museum Plaque</span>
                    <p className="plaque-text">{exhibit.plaque}</p>
                </div>

                {/* Biography */}
                <p className="exhibit-bio">{exhibit.bio}</p>

                {/* Artifacts */}
                {exhibit.artifacts?.length > 0 && (
                    <div className="artifacts-section">
                        <p className="artifacts-heading">Objects Found in the Collection</p>
                        {exhibit.artifacts.map((a, i) => (
                            <div className="artifact" key={i}>
                                <span className="artifact-icon">{a.icon}</span>
                                <div className="artifact-info">
                                    <p className="artifact-name">{a.name}</p>
                                    <p className="artifact-desc">{a.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Guest Book */}
                {exhibit.review && (
                    <div className="guest-book">
                        <span className="guest-book-label">Guest Book Entry</span>
                        <p className="guest-book-text">{exhibit.review}</p>
                        <p className="guest-book-author">— {exhibit.reviewer}</p>
                    </div>
                )}
            </div>
        </>
    )
}
