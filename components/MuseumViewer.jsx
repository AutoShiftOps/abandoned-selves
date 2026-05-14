'use client'
import { useState } from 'react'
import {
  trackShareClick, trackLinkCopied, trackFinalRoomView,
  trackFeedbackSubmit, trackEmailReminderOptIn
} from '../lib/analytics'
import ExhibitRoom from './ExhibitRoom'

const styles = `
  .museum-viewer { min-height: 100%; }
  .museum-header { text-align:center; padding:52px 24px 36px; border-bottom:1px solid var(--border); background:linear-gradient(180deg,rgba(201,146,58,0.04) 0%,transparent 100%); }
  .museum-header h2 { font-family:'Playfair Display',serif; font-size:clamp(24px,4vw,42px); font-weight:900; }
  .museum-header p { margin-top:8px; font-style:italic; color:var(--muted); font-size:16px; }
  .share-row { display:flex; align-items:center; gap:10px; justify-content:center; margin-top:20px; flex-wrap:wrap; }
  .share-url { background:var(--panel); border:1px solid var(--border); padding:8px 16px; font-size:13px; color:var(--muted); font-family:'Cormorant Garamond',serif; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .copy-btn { background:none; border:1px solid var(--border); color:var(--amber); padding:8px 18px; font-family:'Cormorant Garamond',serif; font-size:13px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:all 0.2s; }
  .copy-btn:hover { background:var(--glow); border-color:var(--amber); }
  .copied-note { font-size:13px; color:var(--amber); font-style:italic; }
  .museum-nav { display:flex; overflow-x:auto; border-bottom:1px solid var(--border); background:var(--bg2); scrollbar-width:none; }
  .museum-nav::-webkit-scrollbar { display:none; }
  .nav-tab { flex-shrink:0; padding:14px 24px; background:none; border:none; border-bottom:2px solid transparent; color:var(--muted); font-family:'Cormorant Garamond',serif; font-size:15px; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
  .nav-tab.active { color:var(--amber); border-bottom-color:var(--amber); }
  .nav-tab:hover:not(.active) { color:var(--cream); }
  .exhibit { max-width:720px; margin:0 auto; padding:48px 28px 80px; animation:fadeUp 0.4s ease both; }
  .exhibit-num { font-size:11px; letter-spacing:5px; text-transform:uppercase; color:var(--amber-dim); margin-bottom:8px; }
  .exhibit-title { font-family:'Playfair Display',serif; font-size:clamp(26px,4vw,42px); font-weight:900; font-style:italic; line-height:1.1; margin-bottom:6px; }
  .exhibit-dates { font-size:13px; letter-spacing:3px; color:var(--muted); margin-bottom:32px; }
  .plaque { background:var(--panel); border:1px solid var(--border); border-left:3px solid var(--amber-dim); padding:24px 28px; margin-bottom:36px; position:relative; }
  .plaque::before { content:'📜'; position:absolute; top:-12px; left:20px; background:var(--panel); padding:0 6px; font-size:16px; }
  .plaque-label { font-size:10px; letter-spacing:4px; text-transform:uppercase; color:var(--amber-dim); margin-bottom:10px; }
  .plaque p { font-size:17px; line-height:1.75; color:var(--cream); font-style:italic; }
  .bio { font-size:17px; line-height:1.85; color:#c8bcaa; margin-bottom:40px; }
  .artifacts-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; margin-bottom:20px; padding-bottom:10px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px; }
  .artifacts-title::before { content:'◆'; color:var(--amber-dim); font-size:10px; }
  .artifact-card { background:var(--panel); border:1px solid var(--border); padding:20px 22px; margin-bottom:12px; display:flex; gap:16px; align-items:flex-start; }
  .artifact-icon { font-size:24px; flex-shrink:0; margin-top:2px; }
  .artifact-name { font-family:'Playfair Display',serif; font-size:16px; font-weight:700; margin-bottom:4px; }
  .artifact-desc { font-size:15px; color:var(--muted); line-height:1.5; font-style:italic; }
  .review-block { margin-top:36px; padding:24px; border:1px solid var(--border); background:rgba(201,146,58,0.03); position:relative; }
  .review-block::before { content:'"'; font-family:'Playfair Display',serif; font-size:80px; color:var(--amber-dim); position:absolute; top:-20px; left:16px; line-height:1; opacity:0.4; }
  .review-label { font-size:10px; letter-spacing:4px; text-transform:uppercase; color:var(--amber-dim); margin-bottom:12px; }
  .review-text { font-size:16px; line-height:1.7; font-style:italic; color:#b5a896; }
  .review-author { margin-top:14px; font-size:13px; color:var(--muted); letter-spacing:1px; }
  .final-room { max-width:720px; margin:0 auto; padding:60px 28px 80px; display:flex; flex-direction:column; align-items:center; text-align:center; animation:fadeUp 0.4s ease; }
  .construction-tape { font-size:12px; letter-spacing:6px; text-transform:uppercase; color:var(--amber); background:rgba(201,146,58,0.08); border:1px dashed var(--amber-dim); padding:10px 24px; margin-bottom:40px; animation:pulse 3s infinite; }
  .final-plaque { max-width:500px; width:100%; background:var(--panel); border:1px solid var(--border); border-top:3px solid var(--amber); padding:32px 36px; margin-top:32px; }
  .final-plaque p { font-family:'Playfair Display',serif; font-size:20px; font-style:italic; line-height:1.6; color:var(--cream); }
  .final-plaque .curator { margin-top:16px; font-size:13px; color:var(--muted); letter-spacing:2px; }
  .feedback-card { max-width:500px; width:100%; margin-top:40px; background:var(--panel); border:1px solid var(--border); padding:28px 32px; text-align:left; animation:fadeUp 0.6s 0.3s ease both; }
  .feedback-label { font-size:10px; letter-spacing:4px; text-transform:uppercase; color:var(--amber-dim); margin-bottom:10px; display:block; }
  .feedback-question { font-family:'Playfair Display',serif; font-size:18px; font-style:italic; margin-bottom:16px; line-height:1.4; }
  .feedback-input { width:100%; background:var(--bg2); border:1px solid var(--border); padding:12px 16px; color:var(--cream); font-family:'Cormorant Garamond',serif; font-size:16px; outline:none; resize:vertical; min-height:80px; transition:border-color 0.2s; margin-bottom:12px; }
  .feedback-input::placeholder { color:var(--muted); font-style:italic; }
  .feedback-input:focus { border-color:var(--amber-dim); }
  .feedback-submit { background:none; border:1px solid var(--amber-dim); color:var(--amber); padding:10px 24px; font-family:'Cormorant Garamond',serif; font-size:14px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:all 0.2s; }
  .feedback-submit:hover:not(:disabled) { background:var(--glow); }
  .feedback-submit:disabled { opacity:0.4; cursor:not-allowed; }
  .feedback-thanks { font-size:15px; color:var(--amber); font-style:italic; }
  .reminder-card { max-width:500px; width:100%; margin-top:20px; background:rgba(201,146,58,0.05); border:1px solid var(--amber-dim); padding:24px 32px; text-align:left; animation:fadeUp 0.6s 0.5s ease both; }
  .reminder-card p { font-size:16px; font-style:italic; color:var(--cream); line-height:1.6; margin-bottom:16px; }
  .reminder-card p strong { color:var(--amber); font-style:normal; }
  .reminder-btns { display:flex; gap:12px; }
  .reminder-yes { flex:1; padding:12px; background:var(--amber); border:none; color:var(--bg); font-family:'Playfair Display',serif; font-size:15px; font-weight:700; cursor:pointer; transition:background 0.2s; }
  .reminder-yes:hover { background:#d9a245; }
  .reminder-no { padding:12px 20px; background:none; border:1px solid var(--border); color:var(--muted); font-family:'Cormorant Garamond',serif; font-size:13px; letter-spacing:2px; text-transform:uppercase; cursor:pointer; transition:all 0.2s; }
  .reminder-no:hover { color:var(--cream); }
  .reminder-confirmed { font-size:15px; color:var(--amber); font-style:italic; }
  @keyframes pulse { 0%,100%{opacity:.7} 50%{opacity:1} }
`

export default function MuseumViewer({ museum }) {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const [feeling, setFeeling] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [reminderDone, setReminderDone] = useState(null)
  const [reminderLoading, setReminderLoading] = useState(false)
  const [finalRoomSeen, setFinalRoomSeen] = useState(false)

  const exhibits = museum.exhibits || []
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/m/${museum.slug}` : ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    trackShareClick(museum.slug)
    trackLinkCopied()
    setTimeout(() => setCopied(false), 2500)
  }

  const handleTabChange = (idx) => {
    setActiveTab(idx)
    if (idx === exhibits.length && !finalRoomSeen) {
      setFinalRoomSeen(true)
      trackFinalRoomView()
    }
  }

  const handleFeedback = async () => {
    if (!feeling.trim()) return
    setFeedbackLoading(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeling, museum_id: museum.id }),
      })
      trackFeedbackSubmit(feeling.length)
      setFeedbackSent(true)
    } catch (e) {
      console.error('Feedback submission failed:', e)
    }
    setFeedbackLoading(false)
  }

  const handleReminderOptIn = async () => {
    setReminderLoading(true)
    try {
      await fetch('/api/reminder-opt-in', { method: 'POST' })
      trackEmailReminderOptIn()
      setReminderDone('yes')
    } catch (e) {
      console.error('Reminder opt-in failed:', e)
    }
    setReminderLoading(false)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="museum-viewer">
        <div className="museum-header">
          <span className="section-label">Permanent Collection</span>
          <h2>The Museum of Your Abandoned Selves</h2>
          <p>Admission free. No photography. Please do not touch the memories.</p>
          <div className="share-row">
            <span className="share-url">{shareUrl}</span>
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? '✓ Copied' : 'Share'}
            </button>
            {copied && <span className="copied-note">Link copied — send it to someone</span>}
          </div>
        </div>

        <div className="museum-nav">
          {exhibits.map((ex, i) => (
            <button key={i}
              className={`nav-tab ${activeTab === i ? 'active' : ''}`}
              onClick={() => handleTabChange(i)}>
              Room {i + 1} — {ex.title}
            </button>
          ))}
          <button
            className={`nav-tab ${activeTab === exhibits.length ? 'active' : ''}`}
            onClick={() => handleTabChange(exhibits.length)}>
            Final Room — Current You
          </button>
        </div>

        {activeTab < exhibits.length && (
          <ExhibitRoom
            exhibit={exhibits[activeTab]}
            index={activeTab}
            total={exhibits.length}
          />
        )}

        {activeTab === exhibits.length && (
          <div className="final-room">
            <div className="construction-tape">⚠ Under Construction ⚠</div>
            <span className="section-label">Final Room</span>
            <h2 className="exhibit-title" style={{ fontFamily: "'Playfair Display',serif" }}>
              Current You
            </h2>
            <div className="final-plaque">
              <p style={{ fontSize: 10, letterSpacing: 5, textTransform: 'uppercase', color: 'var(--amber-dim)', marginBottom: 16 }}>
                Museum Plaque
              </p>
              <p>"This exhibit is still under construction.<br />
                The artifacts are being gathered.<br />
                The biography is being written — daily."
              </p>
              <p className="curator">Curator: Unknown. Subject: Present.</p>
            </div>

            {/* FEEDBACK */}
            {!feedbackSent ? (
              <div className="feedback-card">
                <span className="feedback-label">Guest Book</span>
                <p className="feedback-question">"How did this make you feel?" <em style={{ fontWeight: 300 }}>(optional)</em></p>
                <textarea
                  className="feedback-input"
                  placeholder="Write anything — we read every single one..."
                  value={feeling}
                  onChange={e => setFeeling(e.target.value)}
                />
                <button className="feedback-submit"
                  onClick={handleFeedback}
                  disabled={!feeling.trim() || feedbackLoading}>
                  {feedbackLoading ? 'Sending...' : 'Leave a Note'}
                </button>
              </div>
            ) : (
              <div className="feedback-card">
                <p className="feedback-thanks">✦ Thank you. Your words matter more than you know.</p>
              </div>
            )}

            {/* EMAIL REMINDER OPT-IN */}
            {!reminderDone && (
              <div className="reminder-card">
                <p><strong>Remind me next year.</strong><br />
                  One email, this time next year — a quiet nudge to update your museum
                  and see how your abandoned selves have changed.
                </p>
                <div className="reminder-btns">
                  <button className="reminder-yes"
                    onClick={handleReminderOptIn}
                    disabled={reminderLoading}>
                    {reminderLoading ? '...' : 'Yes, remind me'}
                  </button>
                  <button className="reminder-no" onClick={() => setReminderDone('no')}>
                    No thanks
                  </button>
                </div>
              </div>
            )}
            {reminderDone === 'yes' && (
              <p className="reminder-confirmed" style={{ marginTop: 20 }}>
                ✦ We will see you this time next year.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
