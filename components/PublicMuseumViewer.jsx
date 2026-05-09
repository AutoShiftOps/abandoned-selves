'use client'
import { useState } from 'react'
import Link from 'next/link'

const styles = `
  .public-museum { min-height: 100vh; }

  .pub-nav {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 36px;
    border-bottom: 1px solid var(--border);
    background: var(--bg2);
  }
  .pub-logo { font-family: 'Playfair Display', serif; font-style: italic; color: var(--amber); font-size: 18px; }
  .pub-cta {
    background: var(--amber); border: none;
    color: var(--bg);
    font-family: 'Playfair Display', serif;
    font-size: 14px; font-weight: 700; letter-spacing: 1px;
    padding: 10px 22px; cursor: pointer;
    text-decoration: none; display: inline-block;
  }
  .pub-cta:hover { background: #d9a245; }

  .pub-header {
    text-align: center;
    padding: 52px 24px 36px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(180deg, rgba(201,146,58,0.04) 0%, transparent 100%);
  }
  .pub-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(24px, 4vw, 42px); font-weight: 900;
  }
  .pub-header p { margin-top: 8px; font-style: italic; color: var(--muted); font-size: 16px; }

  .pub-nav-tabs {
    display: flex; overflow-x: auto;
    border-bottom: 1px solid var(--border);
    background: var(--bg2); scrollbar-width: none;
  }
  .pub-nav-tabs::-webkit-scrollbar { display: none; }
  .tab {
    flex-shrink: 0; padding: 14px 24px;
    background: none; border: none; border-bottom: 2px solid transparent;
    color: var(--muted);
    font-family: 'Cormorant Garamond', serif; font-size: 15px;
    cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .tab.active { color: var(--amber); border-bottom-color: var(--amber); }

  .exhibit { max-width: 720px; margin: 0 auto; padding: 48px 28px 80px; animation: fadeUp 0.4s ease; }

  .exhibit-num { font-size: 11px; letter-spacing: 5px; text-transform: uppercase; color: var(--amber-dim); margin-bottom: 8px; }
  .exhibit-title { font-family: 'Playfair Display', serif; font-size: clamp(26px,4vw,42px); font-weight: 900; font-style: italic; line-height: 1.1; margin-bottom: 6px; }
  .exhibit-dates { font-size: 13px; letter-spacing: 3px; color: var(--muted); margin-bottom: 32px; }

  .plaque { background: var(--panel); border: 1px solid var(--border); border-left: 3px solid var(--amber-dim); padding: 24px 28px; margin-bottom: 36px; position: relative; }
  .plaque::before { content: '📜'; position: absolute; top: -12px; left: 20px; background: var(--panel); padding: 0 6px; font-size: 16px; }
  .plaque-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--amber-dim); margin-bottom: 10px; }
  .plaque p { font-size: 17px; line-height: 1.75; font-style: italic; }

  .bio { font-size: 17px; line-height: 1.85; color: #c8bcaa; margin-bottom: 40px; }

  .artifacts-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
  .artifacts-title::before { content: '◆'; color: var(--amber-dim); font-size: 10px; }

  .artifact-card { background: var(--panel); border: 1px solid var(--border); padding: 20px 22px; margin-bottom: 12px; display: flex; gap: 16px; align-items: flex-start; }
  .artifact-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
  .artifact-name { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .artifact-desc { font-size: 15px; color: var(--muted); line-height: 1.5; font-style: italic; }

  .review-block { margin-top: 36px; padding: 24px; border: 1px solid var(--border); background: rgba(201,146,58,0.03); position: relative; }
  .review-block::before { content: '"'; font-family: 'Playfair Display', serif; font-size: 80px; color: var(--amber-dim); position: absolute; top: -20px; left: 16px; line-height: 1; opacity: 0.4; }
  .review-label { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: var(--amber-dim); margin-bottom: 12px; }
  .review-text { font-size: 16px; line-height: 1.7; font-style: italic; color: #b5a896; }
  .review-author { margin-top: 14px; font-size: 13px; color: var(--muted); letter-spacing: 1px; }

  .final-room { min-height: 55vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 24px; text-align: center; }
  .construction-tape { font-size: 12px; letter-spacing: 6px; text-transform: uppercase; color: var(--amber); background: rgba(201,146,58,0.08); border: 1px dashed var(--amber-dim); padding: 10px 24px; margin-bottom: 40px; animation: pulse 3s infinite; }
  .final-plaque { max-width: 500px; background: var(--panel); border: 1px solid var(--border); border-top: 3px solid var(--amber); padding: 32px 36px; margin-top: 32px; }
  .final-plaque p { font-family: 'Playfair Display', serif; font-size: 20px; font-style: italic; line-height: 1.6; }
  .final-plaque .curator { margin-top: 16px; font-size: 13px; color: var(--muted); letter-spacing: 2px; }

  /* Bottom CTA banner */
  .bottom-cta {
    border-top: 1px solid var(--border);
    background: var(--bg2);
    padding: 40px 24px;
    text-align: center;
  }
  .bottom-cta h3 { font-family: 'Playfair Display', serif; font-size: 28px; font-style: italic; margin-bottom: 10px; }
  .bottom-cta p { color: var(--muted); font-style: italic; font-size: 16px; margin-bottom: 24px; }

  @keyframes pulse { 0%,100%{opacity:.7} 50%{opacity:1} }
`

export default function PublicMuseumViewer({ museum }) {
  const [activeTab, setActiveTab] = useState(0)
  const exhibits = museum.exhibits || []

  return (
    <>
      <style>{styles}</style>
      <div className="public-museum">
        {/* NAV */}
        <nav className="pub-nav">
          <span className="pub-logo">Almost Became</span>
          <Link href="/" className="pub-cta">Build Your Own Museum</Link>
        </nav>

        {/* HEADER */}
        <div className="pub-header">
          <span className="section-label">Permanent Collection</span>
          <h2>The Museum of Abandoned Selves</h2>
          <p>Admission free. No photography. Please do not touch the memories.</p>
        </div>

        {/* TABS */}
        <div className="pub-nav-tabs">
          {exhibits.map((ex, i) => (
            <button key={i} className={`tab ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
              Room {i + 1} — {ex.title}
            </button>
          ))}
          <button
            className={`tab ${activeTab === exhibits.length ? 'active' : ''}`}
            onClick={() => setActiveTab(exhibits.length)}
          >
            Final Room — Current You
          </button>
        </div>

        {/* EXHIBIT */}
        {activeTab < exhibits.length && (() => {
          const ex = exhibits[activeTab]
          return (
            <div className="exhibit" key={activeTab}>
              <p className="exhibit-num">Exhibit {activeTab + 1} of {exhibits.length}</p>
              <h2 className="exhibit-title">{ex.title}</h2>
              <p className="exhibit-dates">{ex.years}</p>
              <div className="plaque">
                <p className="plaque-label">Museum Plaque</p>
                <p>{ex.plaque}</p>
              </div>
              <p className="bio">{ex.bio}</p>
              <p className="artifacts-title">Objects Found in the Collection</p>
              {ex.artifacts?.map((a, j) => (
                <div className="artifact-card" key={j}>
                  <span className="artifact-icon">{a.icon}</span>
                  <div>
                    <p className="artifact-name">{a.name}</p>
                    <p className="artifact-desc">{a.description}</p>
                  </div>
                </div>
              ))}
              <div className="review-block">
                <p className="review-label">Guest Book Entry</p>
                <p className="review-text">{ex.review}</p>
                <p className="review-author">— {ex.reviewer}</p>
              </div>
            </div>
          )
        })()}

        {activeTab === exhibits.length && (
          <div className="final-room">
            <div className="construction-tape">⚠ Under Construction ⚠</div>
            <span className="section-label">Final Room</span>
            <h2 className="exhibit-title" style={{fontFamily:"'Playfair Display',serif"}}>Current You</h2>
            <div className="final-plaque">
              <p style={{fontSize:10,letterSpacing:5,textTransform:'uppercase',color:'var(--amber-dim)',marginBottom:16}}>Museum Plaque</p>
              <p>"This exhibit is still under construction.<br />The artifacts are being gathered.<br />The biography is being written — daily."</p>
              <p className="curator">Curator: Unknown. Subject: Present.</p>
            </div>
          </div>
        )}

        {/* BOTTOM CTA — the viral growth engine */}
        <div className="bottom-cta">
          <h3>Who did <em>you</em> almost become?</h3>
          <p>Build your own museum. Free to start.</p>
          <Link href="/" className="pub-cta">Enter the Museum →</Link>
        </div>
      </div>
    </>
  )
}
