'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '../../lib/supabase-client'
import { useRouter, useSearchParams } from 'next/navigation'
import MuseumViewer from '../../components/MuseumViewer'
import CinematicLoading from '../../components/CinematicLoading'
import ExhibitRoom from '../../components/ExhibitRoom'

const styles = `
  .app-shell { min-height: 100vh; display: flex; flex-direction: column; }

  /* TOP BAR */
  .topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px;
    border-bottom: 1px solid var(--border);
    background: var(--bg2);
    position: sticky; top: 0; z-index: 50;
  }
  .topbar-logo { font-family: 'Playfair Display', serif; font-style: italic; color: var(--amber); font-size: 18px; }
  .topbar-right { display: flex; align-items: center; gap: 16px; }
  .topbar-email { font-size: 13px; color: var(--muted); }
  .topbar-signout {
    background: none; border: none; color: var(--muted);
    font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; font-family: 'Cormorant Garamond', serif;
    transition: color 0.2s;
  }
  .topbar-signout:hover { color: var(--cream); }

  /* MAIN CONTENT */
  .app-content { flex: 1; display: flex; }

  /* SIDEBAR */
  .sidebar {
    width: 280px; flex-shrink: 0;
    border-right: 1px solid var(--border);
    background: var(--bg2);
    padding: 32px 0;
    min-height: calc(100vh - 57px);
  }
  .sidebar-title {
    font-size: 10px; letter-spacing: 5px; text-transform: uppercase;
    color: var(--muted); padding: 0 24px; margin-bottom: 16px;
  }
  .sidebar-new {
    width: calc(100% - 48px); margin: 0 24px 24px;
    padding: 12px;
    background: var(--amber); border: none;
    color: var(--bg);
    font-family: 'Playfair Display', serif;
    font-size: 15px; font-weight: 700;
    cursor: pointer; transition: background 0.2s;
  }
  .sidebar-new:hover { background: #d9a245; }

  .museum-list { display: flex; flex-direction: column; }
  .museum-item {
    padding: 14px 24px;
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: all 0.15s;
  }
  .museum-item:hover { background: var(--panel); }
  .museum-item.active { border-left-color: var(--amber); background: var(--panel); }
  .museum-item-title { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; margin-bottom: 3px; }
  .museum-item-date { font-size: 12px; color: var(--muted); font-style: italic; }
  .museum-item-count { font-size: 12px; color: var(--muted); margin-top: 2px; }

  .sidebar-empty {
    padding: 16px 24px;
    font-size: 15px; color: var(--muted); font-style: italic;
    line-height: 1.5;
  }

  /* UPGRADE BANNER */
  .upgrade-banner {
    margin: 0 24px 24px;
    padding: 16px;
    border: 1px solid var(--amber-dim);
    background: rgba(201,146,58,0.06);
    text-align: center;
  }
  .upgrade-banner p { font-size: 14px; color: var(--amber); font-style: italic; margin-bottom: 10px; line-height: 1.4; }
  .upgrade-btn {
    width: 100%;
    padding: 10px;
    background: none;
    border: 1px solid var(--amber);
    color: var(--amber);
    font-family: 'Cormorant Garamond', serif;
    font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
    cursor: pointer; transition: all 0.2s;
  }
  .upgrade-btn:hover { background: var(--amber); color: var(--bg); }

  /* MAIN PANEL */
  .main-panel { flex: 1; overflow: auto; }

  /* SUCCESS TOAST */
  .toast {
    position: fixed; bottom: 32px; right: 32px; z-index: 200;
    background: var(--panel); border: 1px solid var(--amber-dim);
    border-left: 3px solid var(--amber);
    padding: 16px 20px;
    font-size: 15px; font-style: italic; color: var(--amber);
    animation: fadeUp 0.3s ease;
    max-width: 320px;
  }

  /* CREATE FORM */
  .create-screen {
    max-width: 640px; margin: 0 auto;
    padding: 60px 32px;
    animation: fadeUp 0.5s ease;
  }
  .create-screen h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 900; margin-bottom: 10px;
  }
  .create-hint { font-size: 17px; color: var(--muted); font-style: italic; margin-bottom: 40px; line-height: 1.5; }
  .create-form { display: flex; flex-direction: column; gap: 16px; }
  .self-row { display: flex; align-items: center; gap: 14px; }
  .self-num {
    font-family: 'Playfair Display', serif;
    font-size: 30px; font-style: italic; color: var(--amber-dim);
    min-width: 30px; text-align: center;
  }
  .self-input {
    flex: 1;
    background: var(--panel); border: 1px solid var(--border);
    padding: 14px 18px;
    color: var(--cream);
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .self-input::placeholder { color: var(--muted); font-style: italic; }
  .self-input:focus { border-color: var(--amber-dim); box-shadow: 0 0 12px var(--glow); }
  .create-btn {
    margin-top: 16px; padding: 16px;
    background: var(--amber); border: none;
    color: var(--bg);
    font-family: 'Playfair Display', serif;
    font-size: 17px; font-weight: 700; letter-spacing: 2px;
    cursor: pointer; transition: all 0.2s;
  }
  .create-btn:hover:not(:disabled) { background: #d9a245; box-shadow: 0 4px 24px rgba(201,146,58,0.3); }
  .create-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .error-box {
    background: rgba(180,60,60,0.08);
    border: 1px solid rgba(180,60,60,0.3);
    color: #c88; padding: 14px 18px;
    font-size: 15px; font-style: italic;
  }

  /* LOADING */
  .generating {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    min-height: 60vh; gap: 24px; text-align: center; padding: 40px;
  }
  .generating-candle { font-size: 44px; animation: flicker 1.5s infinite alternate; }
  .generating h3 { font-family: 'Playfair Display', serif; font-size: 26px; font-style: italic; color: var(--amber); }
  .generating p { font-size: 16px; color: var(--muted); font-style: italic; }
  .dots { display: flex; gap: 8px; }
  .dots span {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--amber-dim);
    animation: dot 1.4s infinite both;
  }
  .dots span:nth-child(2) { animation-delay: 0.2s; }
  .dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes flicker { from { opacity:0.7; transform:scale(0.97); } to { opacity:1; transform:scale(1.03); } }
  @keyframes dot { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }
  @media (max-width: 640px) {
    .sidebar { display: none; }
  }
`

const PLACEHOLDERS = [
  "The jazz musician I almost became at 19",
  "The architect who moved to Barcelona",
  "The marine biologist who studied coral reefs",
]

const LOADING_MSGS = [
  "Dusting off forgotten corridors...",
  "Hanging portraits of paths not taken...",
  "Labeling artifacts with trembling hands...",
  "Lighting candles in empty rooms...",
]

function SearchParamsHandler({ onUpgraded }) {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      onUpgraded()
    }
  }, [searchParams, onUpgraded])
  return null
}

export default function MuseumPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [museums, setMuseums] = useState([])
  const [view, setView] = useState('create') // create | generating | exhibit
  const [activeMuseum, setActiveMuseum] = useState(null)
  const [selves, setSelf] = useState(['', '', ''])
  const [error, setError] = useState('')
  const [loadingMsg, setLoadingMsg] = useState('')
  const [toast, setToast] = useState('')
  const [upgrading, setUpgrading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)
      fetchProfile(session.user.id)
      fetchMuseums()
    })
  }, [])

  const fetchProfile = async (uid) => {
    if (!uid) return
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    setProfile(data)
  }

  const fetchMuseums = async () => {
    const res = await fetch('/api/museums')
    const data = await res.json()
    if (data.museums) setMuseums(data.museums)
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setUpgrading(false)
  }

  const handleGenerate = async () => {
    const filled = selves.filter(s => s.trim().length > 3)
    if (filled.length < 1) { setError('Please describe at least one abandoned self.'); return }
    setError('')
    setView('generating')

    let msgIdx = 0
    setLoadingMsg(LOADING_MSGS[0])
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MSGS.length
      setLoadingMsg(LOADING_MSGS[msgIdx])
    }, 2200)

    try {
      // Generate exhibits
      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selves: filled }),
      })
      const genData = await genRes.json()
      if (!genRes.ok) {
        if (genData.error === 'FREE_LIMIT') {
          clearInterval(interval)
          setView('create')
          setError('You\'ve reached the free limit. Upgrade for unlimited museums!')
          return
        }
        throw new Error(genData.error)
      }

      // Save museum
      const saveRes = await fetch('/api/museums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selves: filled, exhibits: genData.exhibits }),
      })
      const saveData = await saveRes.json()

      if (!saveRes.ok) {
        if (saveData.error === 'FREE_LIMIT') {
          clearInterval(interval)
          setView('create')
          setError('Upgrade to create more museums!')
          return
        }
        throw new Error(saveData.error)
      }

      clearInterval(interval)
      await fetchMuseums()
      setActiveMuseum({ ...saveData.museum, exhibits: genData.exhibits })
      setSelf(['', '', ''])
      setView('exhibit')
      showToast('Your museum is ready.')
    } catch (e) {
      clearInterval(interval)
      setError(e.message)
      setView('create')
    }
  }

  const openMuseum = async (m) => {
    // Fetch full museum data including exhibits
    const { data } = await supabase
      .from('museums')
      .select('*')
      .eq('id', m.id)
      .single()
    setActiveMuseum(data)
    setView('exhibit')
  }

  const isPaid = profile?.is_paid
  const atFreeLimit = !isPaid && museums.length >= 1

  const handleUpgraded = () => {
    showToast('🎉 Welcome to unlimited museums!')
    fetchProfile(user?.id)
  }

  return (
    <>
      <style>{styles}</style>

      <Suspense fallback={null}>
        <SearchParamsHandler onUpgraded={handleUpgraded} />
      </Suspense>

      {toast && <div className="toast">{toast}</div>}

      <div className="app-shell">
        {/* TOPBAR */}
        <div className="topbar">
          <span className="topbar-logo">Almost Became</span>
          <div className="topbar-right">
            <span className="topbar-email">{user?.email}</span>
            <button className="topbar-signout" onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>

        <div className="app-content">
          {/* SIDEBAR */}
          <div className="sidebar">
            <p className="sidebar-title">Your Museums</p>

            {!isPaid && (
              <div className="upgrade-banner">
                <p>Unlock unlimited museums for a one-time $4.99</p>
                <button className="upgrade-btn" onClick={handleUpgrade} disabled={upgrading}>
                  {upgrading ? 'Loading...' : 'Upgrade →'}
                </button>
              </div>
            )}

            <button className="sidebar-new" onClick={() => setView('create')}>
              + New Museum
            </button>

            <div className="museum-list">
              {museums.length === 0 && (
                <p className="sidebar-empty">Your first museum will appear here.</p>
              )}
              {museums.map(m => (
                <div
                  key={m.id}
                  className={`museum-item ${activeMuseum?.id === m.id && view === 'exhibit' ? 'active' : ''}`}
                  onClick={() => openMuseum(m)}
                >
                  <p className="museum-item-title">{m.selves[0]?.split(' ').slice(0, 4).join(' ')}...</p>
                  <p className="museum-item-count">{m.selves.length} exhibit{m.selves.length !== 1 ? 's' : ''}</p>
                  <p className="museum-item-date">{new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN PANEL */}
          <div className="main-panel">
            {view === 'create' && (
              <div className="create-screen">
                <span className="section-label">New Exhibition</span>
                <h2>Who did you almost become?</h2>
                <p className="create-hint">
                  Name up to three versions of yourself that never made it out of the imagination. Be honest. Be specific.
                </p>
                <div className="create-form">
                  {selves.map((val, i) => (
                    <div className="self-row" key={i}>
                      <span className="self-num">{i + 1}</span>
                      <input
                        className="self-input"
                        value={val}
                        placeholder={PLACEHOLDERS[i]}
                        onChange={e => {
                          const next = [...selves]
                          next[i] = e.target.value
                          setSelf(next)
                        }}
                      />
                    </div>
                  ))}
                  {error && <div className="error-box">{error}</div>}
                  {atFreeLimit ? (
                    <div style={{ padding: '20px', border: '1px solid var(--amber-dim)', textAlign: 'center' }}>
                      <p style={{ color: 'var(--amber)', fontStyle: 'italic', marginBottom: 12 }}>You've used your free museum. Upgrade for unlimited.</p>
                      <button className="create-btn" onClick={handleUpgrade} disabled={upgrading}>
                        {upgrading ? 'Loading...' : 'Upgrade for $4.99 →'}
                      </button>
                    </div>
                  ) : (
                    <button className="create-btn" onClick={handleGenerate}>
                      Open the Museum
                    </button>
                  )}
                </div>
              </div>
            )}

            {view === 'generating' && <CinematicLoading selves={selves.filter(s => s.trim())} />}

            {view === 'exhibit' && activeMuseum && (
              <MuseumViewer museum={activeMuseum} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
