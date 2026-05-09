import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Almost Became' }

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        .legal-page { max-width: 720px; margin: 0 auto; padding: 80px 32px; }
        .legal-nav { display:flex; align-items:center; justify-content:space-between; padding:20px 32px; border-bottom:1px solid var(--border); position:sticky; top:0; background:var(--bg); z-index:10; }
        .legal-logo { font-family:'Playfair Display',serif; font-style:italic; color:var(--amber); font-size:18px; text-decoration:none; }
        .legal-page h1 { font-family:'Playfair Display',serif; font-size:38px; font-weight:900; margin-bottom:8px; }
        .legal-updated { font-size:13px; color:var(--muted); font-style:italic; margin-bottom:48px; }
        .legal-page h2 { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; margin:40px 0 12px; color:var(--amber); }
        .legal-page p { font-size:16px; line-height:1.8; color:#c8bcaa; margin-bottom:16px; }
        .legal-page ul { padding-left:24px; margin-bottom:16px; }
        .legal-page li { font-size:16px; line-height:1.8; color:#c8bcaa; margin-bottom:6px; }
        .legal-page a { color:var(--amber); }
      `}</style>
      <nav className="legal-nav">
        <Link href="/" className="legal-logo">Almost Became</Link>
      </nav>
      <div className="legal-page">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: {new Date().toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <h2>1. Who We Are</h2>
        <p>Almost Became is operated by [YOUR FULL LEGAL NAME], based in Canada. This policy explains how we collect, use, and protect your personal information in compliance with Canada's PIPEDA.</p>

        <h2>2. What We Collect</h2>
        <ul>
          <li><strong>Email address</strong> — for authentication only</li>
          <li><strong>Museum content</strong> — the descriptions you provide and generated exhibits</li>
          <li><strong>Payment data</strong> — processed by Stripe. We never store card details.</li>
          <li><strong>Usage data</strong> — anonymous page view counts only</li>
        </ul>

        <h2>3. How We Use It</h2>
        <ul>
          <li>To authenticate you and manage your account</li>
          <li>To generate and store your museums</li>
          <li>To process payments</li>
          <li>To send transactional emails (magic links, receipts)</li>
        </ul>
        <p>We do not sell your data. We do not use your data for advertising. We do not share data with third parties beyond what is required to operate the Service.</p>

        <h2>4. Third-Party Processors</h2>
        <ul>
          <li><strong>Supabase</strong> — database and auth (SOC 2 Type II compliant)</li>
          <li><strong>Stripe</strong> — payments (PCI DSS Level 1 compliant)</li>
          <li><strong>Google Gemini API</strong> — AI content generation (see Google's Privacy Policy)</li>
          <li><strong>Vercel</strong> — hosting</li>
        </ul>

        <h2>5. Your Rights Under PIPEDA</h2>
        <p>You have the right to access, correct, or request deletion of your personal information at any time. To exercise these rights, email <a href="mailto:hello@almostbecame.com">hello@almostbecame.com</a>. We will respond within 30 days.</p>

        <h2>6. Public Museums</h2>
        <p>If you share a museum via its public link, that content is viewable by anyone with the link. You may make any museum private at any time from your account.</p>

        <h2>7. Data Retention</h2>
        <p>We retain your data while your account is active. You may request account deletion at any time by emailing us.</p>

        <h2>8. Security</h2>
        <p>All data is encrypted in transit (TLS) and at rest. Authentication is managed by Supabase, a SOC 2 compliant provider.</p>

        <h2>9. Cookies</h2>
        <p>We use only essential session cookies required for authentication. No advertising or tracking cookies are used.</p>

        <h2>10. Contact & Complaints</h2>
        <p>Privacy questions: <a href="mailto:hello@almostbecame.com">hello@almostbecame.com</a></p>
        <p>If you are unsatisfied with our response, you may contact the Office of the Privacy Commissioner of Canada at <a href="https://www.priv.gc.ca" target="_blank" rel="noreferrer">priv.gc.ca</a>.</p>
      </div>
    </>
  )
}
