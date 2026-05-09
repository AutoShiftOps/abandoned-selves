# Almost Became — Production Deployment Guide
> almostbecame.com · Canada · Built to monetize from Day 1

---

## BEFORE YOU DEPLOY — Read This First

### Two things to do RIGHT NOW (before touching code):

**1. Fill in your name in legal docs**
Search for `[YOUR FULL LEGAL NAME]` in:
- `app/terms/page.jsx`
- `app/privacy/page.jsx`

Replace with your full legal name (e.g. "Jane Smith"). This is required for Stripe.

**2. Start Stripe identity verification today**
It takes 1–2 business days. Go to stripe.com → Activate Account → complete verification.
Without this, live payments will not process.

---

## Accounts Needed

| Service | URL | Cost | Status |
|---|---|---|---|
| GitHub | github.com | Free | ✅ You have this |
| Vercel | vercel.com | Free | ✅ You have this |
| Domain | almostbecame.com | Purchased | ✅ Done |
| Supabase | supabase.com | Free | ⬜ Create today |
| Stripe | stripe.com | Free (2.9% + 30¢/txn) | ⬜ Create + verify today |
| Gemini API | aistudio.google.com | Free | ⬜ Get key today |

---

## Step 1 — Set Up Supabase (20 min)

1. Go to supabase.com → New Project
   - Name: `almostbecame`
   - Password: generate a strong one, save it
   - Region: **Canada (Central)** — important for PIPEDA compliance

2. Wait ~2 min for project to spin up

3. Go to **SQL Editor** → paste entire contents of `supabase/schema.sql` → click Run

4. Go to **Settings → API** → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

5. Go to **Authentication → URL Configuration**:
   - Site URL: `https://almostbecame.com`
   - Redirect URLs: add `https://almostbecame.com/auth/callback`

---

## Step 2 — Set Up Stripe (15 min)

1. Go to stripe.com → create account
2. **Complete identity verification immediately** — it takes 1–2 days

3. Create a product:
   - Name: "Museum Upgrade"
   - Price: $4.99 CAD, one-time
   - Copy the **Price ID** (starts with `price_`) → `STRIPE_PRICE_ID`

4. Go to **Developers → API Keys**:
   - Copy **Secret key** → `STRIPE_SECRET_KEY`

5. Add webhook (after deploy):
   - URL: `https://almostbecame.com/api/stripe/webhook`
   - Events: select `checkout.session.completed`
   - Copy **Webhook signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## Step 3 — Get Gemini API Key (5 min)

1. Go to aistudio.google.com
2. Sign in with Google
3. Click **Get API Key** → Create API key
4. Copy it → `GEMINI_API_KEY`

---

## Step 4 — Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in all values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
GEMINI_API_KEY=AIza...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://almostbecame.com
```

> ⚠️ Use `sk_test_` keys while testing locally. Switch to `sk_live_` only in Vercel for production.

---

## Step 5 — Test Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

Test the full flow:
- [ ] Sign up with email → get magic link → click → arrive at /museum
- [ ] Create a museum → exhibits generate → museum saves
- [ ] Try to create a 2nd museum → see upgrade gate
- [ ] Click upgrade → Stripe test checkout opens → complete with card `4242 4242 4242 4242`
- [ ] Return to app → museum count unlimited
- [ ] Share link → /m/[slug] loads publicly with "Build Your Own" CTA

---

## Step 6 — Deploy to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "launch: almost became production"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/almostbecame.git
git push -u origin main
```

Then in Vercel:
1. Import the GitHub repo
2. Add all env vars (same as .env.local but use live Stripe keys)
3. Click Deploy
4. Go to **Settings → Domains** → add `almostbecame.com`

In Namecheap:
- Change nameservers to Vercel's (shown in Vercel dashboard after adding domain)
- Propagation takes 10–60 minutes

---

## Step 7 — Add Stripe Webhook (after deploy)

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://almostbecame.com/api/stripe/webhook`
3. Events: `checkout.session.completed`
4. Copy the signing secret → update `STRIPE_WEBHOOK_SECRET` in Vercel env vars
5. Redeploy (Vercel → Deployments → Redeploy)

---

## Step 8 — Final Pre-Launch Checklist

- [ ] Legal name filled in terms/privacy pages
- [ ] Stripe identity verification complete (live payments active)
- [ ] Domain resolving to Vercel (test: visit almostbecame.com)
- [ ] Full sign-up → museum → payment flow tested with live card
- [ ] Favicon shows in browser tab
- [ ] OG image shows when you share the URL on Twitter/iMessage
- [ ] /terms and /privacy pages load correctly
- [ ] Supabase region set to Canada Central (PIPEDA)

---

## File Map

```
almostbecame/
├── app/
│   ├── layout.jsx           ← Root layout, fonts, OG/favicon meta
│   ├── globals.css          ← Global styles + CSS variables
│   ├── page.jsx             ← Landing page + auth modal
│   ├── not-found.jsx        ← 404 page
│   ├── museum/page.jsx      ← Main app (auth-protected)
│   ├── m/[id]/page.jsx      ← Public share page
│   ├── terms/page.jsx       ← Terms of Service (update your name!)
│   ├── privacy/page.jsx     ← Privacy Policy (update your name!)
│   ├── auth/callback/       ← Supabase magic link callback
│   └── api/
│       ├── generate/        ← Gemini AI call (server-side)
│       ├── museums/         ← Save/load museums
│       └── stripe/          ← Checkout + webhook
├── components/
│   ├── MuseumViewer.jsx     ← Full museum UI + share button
│   └── PublicMuseumViewer.jsx ← Public view + viral CTA
├── lib/supabase.js          ← DB client helpers
├── middleware.js            ← Protects /museum route
├── public/
│   ├── favicon.svg          ← Browser tab icon
│   └── og-image.svg        ← Social share card
├── supabase/schema.sql      ← Run once in Supabase SQL editor
├── logos-kit/               ← All logo SVGs + preview
├── next.config.js
├── vercel.json
└── .env.example
```

---

## Canadian Tax Note

If you earn over CAD $30,000/year from this business, you must register for GST/HST.
Below that threshold, no registration required. Track your revenue from day one.
Consider opening a separate business bank account to keep income trackable.

---

## Support

If you get stuck on any step, the error messages are usually self-explanatory.
Google the exact error + "Supabase" or "Vercel" — Stack Overflow will have the answer.
