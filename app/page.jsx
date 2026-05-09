'use client'
import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

const styles = `
  .landing { min-height: 100vh; }

  /* NAV */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 40px;
    background: linear-gradient(180deg, rgba(10,9,6,0.9) 0%, transparent 100%);
    backdrop-filter: blur(4px);
  }
  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-style: italic;
    color: var(--amber);
    letter-spacing: 1px;
  }
  .nav-cta {
    background: none;
    border: 1px solid var(--amber-dim);
    color: var(--amber);
    font-size: 13px;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 10px 24px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'Cormorant Garamond', serif;
  }
  .nav-cta:hover { background: var(--glow); }

  /* HERO */
  .hero {
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center;
    padding: 100px 24px 60px;
    background: radial-gradient(ellipse at 50% 40%, rgba(201,146,58,0.07) 0%, transparent 65%);
  }
  .hero-ornament {
    font-size: 24px; letter-spacing: 20px;
    color: var(--amber-dim); margin-bottom: 28px;
    animation: fadeUp 1s ease both;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(38px, 8vw, 86px);
    font-weight: 900; line-height: 1.0;
    max-width: 800px;
    animation: fadeUp 1s 0.15s ease both;
  }
  .hero h1 em { font-style: italic; color: var(--amber); }
  .hero-sub {
    margin-top: 24px;
    font-size: clamp(17px, 2.5vw, 22px);
    font-style: italic; color: var(--muted);
    max-width: 540px; line-height: 1.65;
    animation: fadeUp 1s 0.3s ease both;
  }
  .hero-actions {
    margin-top: 48px;
    display: flex; flex-direction: column; align-items: center; gap: 16px;
    animation: fadeUp 1s 0.45s ease both;
  }
  .hero-free-note {
    font-size: 14px; color: var(--muted); font-style: italic;
  }

  /* SAMPLE EXHIBIT PREVIEW */
  .preview-section {
    padding: 80px 24px;
    border-top: 1px solid var(--border);
    display: flex; flex-direction: column; align-items: center;
  }
  .preview-card {
    max-width: 640px; width: 100%;
    background: var(--panel);
    border: 1px solid var(--border);
    border-top: 3px solid var(--amber-dim);
    padding: 40px;
    position: relative;
  }
  .preview-tag {
    position: absolute; top: -12px; left: 28px;
    background: var(--panel);
    padding: 0 10px;
    font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
    color: var(--amber-dim);
  }
  .preview-card h3 {
    font-family: 'Playfair Display', serif;
    font-size: 32px; font-style: italic; font-weight: 900;
    margin-bottom: 6px;
  }
  .preview-dates { font-size: 12px; letter-spacing: 3px; color: var(--muted); margin-bottom: 24px; }
  .preview-plaque {
    border-left: 2px solid var(--amber-dim);
    padding-left: 20px;
    font-style: italic; color: #b5a896; font-size: 17px; line-height: 1.7;
    margin-bottom: 28px;
  }
  .preview-artifacts { display: flex; flex-direction: column; gap: 12px; }
  .preview-artifact {
    display: flex; gap: 14px; align-items: flex-start;
    background: rgba(255,255,255,0.02);
    border: 1px solid var(--border);
    padding: 14px 16px;
  }
  .preview-artifact-icon { font-size: 22px; flex-shrink: 0; }
  .preview-artifact-name { font-weight: 700; font-size: 15px; margin-bottom: 3px; font-family: 'Playfair Display', serif; }
  .preview-artifact-desc { font-size: 14px; color: var(--muted); font-style: italic; line-height: 1.4; }

  /* PRICING */
  .pricing-section {
    padding: 80px 24px;
    border-top: 1px solid var(--border);
    display: flex; flex-direction: column; align-items: center;
    text-align: center;
  }
  .pricing-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 5vw, 48px); font-weight: 900;
    margin-bottom: 48px;
  }
  .pricing-grid {
    display: flex; gap: 24px; flex-wrap: wrap; justify-content: center;
    max-width: 700px; width: 100%;
  }
  .pricing-card {
    flex: 1; min-width: 260px;
    background: var(--panel);
    border: 1px solid var(--border);
    padding: 36px 28px;
    text-align: left;
    position: relative;
  }
  .pricing-card.featured { border-color: var(--amber-dim); }
  .pricing-badge {
    position: absolute; top: -12px; left: 20px;
    background: var(--amber);
    color: var(--bg);
    font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
    padding: 4px 12px;
    font-family: 'Cormorant Garamond', serif;
  }
  .pricing-tier { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  .pricing-price {
    font-family: 'Playfair Display', serif;
    font-size: 42px; font-weight: 900;
    margin-bottom: 4px;
  }
  .pricing-price sup { font-size: 22px; vertical-align: super; }
  .pricing-note { font-size: 13px; color: var(--muted); font-style: italic; margin-bottom: 28px; }
  .pricing-features { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .pricing-features li {
    font-size: 16px; color: #b5a896;
    display: flex; align-items: center; gap: 10px;
  }
  .pricing-features li::before { content: '◆'; color: var(--amber-dim); font-size: 8px; flex-shrink: 0; }

  /* HOW IT WORKS */
  .how-section {
    padding: 80px 24px;
    border-top: 1px solid var(--border);
    display: flex; flex-direction: column; align-items: center;
    text-align: center;
  }
  .how-section h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 4vw, 42px); font-weight: 900;
    margin-bottom: 56px;
  }
  .steps {
    display: flex; gap: 0; flex-wrap: wrap; justify-content: center;
    max-width: 820px; width: 100%;
  }
  .step {
    flex: 1; min-width: 200px;
    padding: 32px 28px;
    border: 1px solid var(--border);
    border-right: none;
    text-align: left;
  }
  .step:last-child { border-right: 1px solid var(--border); }
  .step-num {
    font-family: 'Playfair Display', serif;
    font-size: 52px; font-style: italic; font-weight: 900;
    color: var(--amber-dim); opacity: 0.4;
    line-height: 1; margin-bottom: 16px;
  }
  .step h4 { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  .step p { font-size: 15px; color: var(--muted); font-style: italic; line-height: 1.6; }

  /* FOOTER */
  .footer {
    padding: 40px 40px;
    border-top: 1px solid var(--border);
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 16px;
  }
  .footer-logo { font-family: 'Playfair Display', serif; font-style: italic; color: var(--amber); font-size: 16px; }
  .footer-copy { font-size: 13px; color: var(--muted); }

  /* AUTH MODAL */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.85);
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }
  .modal {
    background: var(--panel);
    border: 1px solid var(--border);
    border-top: 3px solid var(--amber);
    padding: 48px 40px;
    max-width: 420px; width: 100%;
    text-align: center;
    position: relative;
    animation: fadeUp 0.3s ease;
  }
  .modal-close {
    position: absolute; top: 16px; right: 20px;
    background: none; border: none; color: var(--muted);
    font-size: 22px; cursor: pointer; line-height: 1;
  }
  .modal h3 {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 900; font-style: italic;
    margin-bottom: 8px;
  }
  .modal p { font-size: 16px; color: var(--muted); font-style: italic; margin-bottom: 32px; line-height: 1.5; }
  .modal-input {
    width: 100%;
    background: var(--bg2);
    border: 1px solid var(--border);
    padding: 14px 18px;
    color: var(--cream);
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    outline: none;
    margin-bottom: 12px;
    transition: border-color 0.2s;
  }
  .modal-input:focus { border-color: var(--amber-dim); }
  .modal-input::placeholder { color: var(--muted); font-style: italic; }
  .modal-submit {
    width: 100%; padding: 15px;
    background: var(--amber); border: none;
    color: var(--bg);
    font-family: 'Playfair Display', serif;
    font-size: 17px; font-weight: 700; letter-spacing: 1px;
    cursor: pointer; transition: all 0.2s;
    margin-bottom: 16px;
  }
  .modal-submit:hover:not(:disabled) { background: #d9a245; }
  .modal-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .modal-note { font-size: 13px; color: var(--muted); font-style: italic; }
  .modal-success {
    padding: 16px; background: rgba(201,146,58,0.08);
    border: 1px solid var(--amber-dim);
    font-size: 16px; font-style: italic; color: var(--amber);
    margin-bottom: 12px;
  }
`

// Sample exhibit shown on landing page
const SAMPLE_EXHIBIT = {
  title: "The Jazz Musician",
  years: "1999 – 2038",
  plaque: "She played trumpet in dive bars across New Orleans for three weeks in 1999. Then she went back to Toronto, enrolled in law school, and never touched the instrument again. This exhibit collects what that life would have held.",
  artifacts: [
    { icon: "🎺", name: "King Super 20 Trumpet", description: "Bought second-hand in the French Quarter for $200. She played it every night until her lips bled." },
    { icon: "📓", name: "Setlist Notebook, Vol. 1", description: "Spiral-bound. Every song she ever learned, annotated with keys, tempos, and which bars she always botched." },
  ]
}

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // If redirected here with ?auth=required, open modal
  useEffect(() => {
    if (searchParams.get('auth') === 'required') setShowAuth(true)
  }, [searchParams])

  // If user is already logged in, redirect to museum
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/museum')
    })
  }, [supabase, router])

  const handleMagicLink = async () => {
    if (!email.trim()) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` }
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <>
      <style>{styles}</style>

      {/* AUTH MODAL */}
      {showAuth && (
        <div className="modal-overlay" onClick={() => setShowAuth(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuth(false)}>×</button>
            <p className="section-label">Welcome</p>
            <h3>Enter the Museum</h3>
            <p>We'll send you a magic link — no password needed.</p>

            {sent ? (
              <div className="modal-success">
                ✉ Check your email. Your link is waiting.
              </div>
            ) : (
              <>
                <input
                  className="modal-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleMagicLink()}
                />
                {error && <p style={{ color: '#c88', fontSize: 14, marginBottom: 12, fontStyle: 'italic' }}>{error}</p>}
                <button className="modal-submit" onClick={handleMagicLink} disabled={loading || !email.trim()}>
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
                <p className="modal-note">Free to start. No credit card required.</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="landing">
        {/* NAV */}
        <nav className="nav">
          <span className="nav-logo">Almost Became</span>
          <button className="nav-cta" onClick={() => setShowAuth(true)}>Enter</button>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-ornament">✦ ✦ ✦</div>
          <h1>The Museum of Your<br /><em>Abandoned Selves</em></h1>
          <p className="hero-sub">
            A collection of lives almost lived. Tell us who you almost became — and we'll build the exhibit.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => setShowAuth(true)}>
              Build Your Museum
            </button>
            <p className="hero-free-note">Free to start — 1 museum, no credit card</p>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-section">
          <span className="section-label">How It Works</span>
          <h2>Three Steps. One Museum.</h2>
          <div className="steps">
            <div className="step">
              <div className="step-num">I</div>
              <h4>Name Your Selves</h4>
              <p>Tell us who you almost became. The musician. The traveller. The one who said yes.</p>
            </div>
            <div className="step">
              <div className="step-num">II</div>
              <h4>We Build the Exhibit</h4>
              <p>AI writes the biography, the artifacts, the museum plaque. The life that almost was.</p>
            </div>
            <div className="step">
              <div className="step-num">III</div>
              <h4>Share the Museum</h4>
              <p>Every museum gets a unique link. Share it. Watch people feel something.</p>
            </div>
          </div>
        </section>

        {/* SAMPLE */}
        <section className="preview-section">
          <span className="section-label" style={{ marginBottom: 32 }}>Sample Exhibit</span>
          <div className="preview-card">
            <span className="preview-tag">Room I — Permanent Collection</span>
            <h3>{SAMPLE_EXHIBIT.title}</h3>
            <p className="preview-dates">{SAMPLE_EXHIBIT.years}</p>
            <p className="preview-plaque">{SAMPLE_EXHIBIT.plaque}</p>
            <div className="preview-artifacts">
              {SAMPLE_EXHIBIT.artifacts.map((a, i) => (
                <div className="preview-artifact" key={i}>
                  <span className="preview-artifact-icon">{a.icon}</span>
                  <div>
                    <p className="preview-artifact-name">{a.name}</p>
                    <p className="preview-artifact-desc">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="pricing-section">
          <span className="section-label">Pricing</span>
          <h2>Honest. Simple.</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <p className="pricing-tier">Free</p>
              <p className="pricing-price"><sup>$</sup>0</p>
              <p className="pricing-note">Forever free</p>
              <ul className="pricing-features">
                <li>1 museum</li>
                <li>All 3 exhibit rooms</li>
                <li>Shareable link</li>
                <li>Guest book</li>
              </ul>
            </div>
            <div className="pricing-card featured">
              <span className="pricing-badge">One-time</span>
              <p className="pricing-tier">Unlimited</p>
              <p className="pricing-price"><sup>$</sup>4.99</p>
              <p className="pricing-note">Pay once, own forever</p>
              <ul className="pricing-features">
                <li>Unlimited museums</li>
                <li>Clean share links</li>
                <li>PDF export</li>
                <li>Gift a museum</li>
                <li>Priority generation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer">
          <span className="footer-logo">Almost Became</span>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <p className="footer-copy">© {new Date().getFullYear()} Almost Became</p>
            <a href="/terms" style={{ fontSize: 13, color: 'var(--muted)' }}>Terms</a>
            <a href="/privacy" style={{ fontSize: 13, color: 'var(--muted)' }}>Privacy</a>
            <a href="mailto:hello@almostbecame.com" style={{ fontSize: 13, color: 'var(--muted)' }}>Contact</a>
          </div>
        </footer>
      </div>
    </>
  )
}
