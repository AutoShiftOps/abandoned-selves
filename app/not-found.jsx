import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <style>{`
        .notfound {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 40px 24px;
          background: radial-gradient(ellipse at 50% 40%, rgba(201,146,58,0.05) 0%, transparent 70%);
        }
        .notfound-ornament {
          font-size: 20px; letter-spacing: 16px;
          color: var(--amber-dim); margin-bottom: 24px;
        }
        .notfound h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 5vw, 52px);
          font-weight: 900; font-style: italic;
          color: var(--cream); margin-bottom: 10px;
        }
        .notfound-plaque {
          max-width: 440px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-left: 3px solid var(--amber-dim);
          padding: 24px 28px; margin: 32px auto;
          text-align: left;
        }
        .notfound-plaque p {
          font-size: 17px; font-style: italic;
          color: #b5a896; line-height: 1.7;
        }
        .notfound-label {
          font-size: 10px; letter-spacing: 4px;
          text-transform: uppercase; color: var(--amber-dim);
          margin-bottom: 10px; display: block;
        }
        .back-link {
          display: inline-block; margin-top: 8px;
          background: none; border: 1px solid var(--border);
          color: var(--muted); padding: 12px 32px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px; letter-spacing: 3px; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s; text-decoration: none;
        }
        .back-link:hover { border-color: var(--amber-dim); color: var(--amber); }
      `}</style>

      <div className="notfound">
        <div className="notfound-ornament">✦ ✦ ✦</div>
        <h1>This Room Does Not Exist</h1>
        <div className="notfound-plaque">
          <span className="notfound-label">Curator's Note</span>
          <p>
            The exhibit you are looking for may have been removed, made private,
            or perhaps it only existed in someone's imagination.
            Like most abandoned things, it left no forwarding address.
          </p>
        </div>
        <Link href="/" className="back-link">Return to the Museum</Link>
      </div>
    </>
  )
}
