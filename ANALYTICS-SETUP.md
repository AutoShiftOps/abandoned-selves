# Google Analytics Setup — Free, Takes 10 Minutes

## Why GA4 and Not Plausible/Others?

Google Analytics 4 is 100% free, forever.
No credit card. No trial. No limits on traffic.
It gives you everything you need for Stage 1.

---

## Step 1 — Create a GA4 Property

1. Go to analytics.google.com
2. Sign in with your Google account
3. Click **Start measuring**
4. Account name: `Almost Became`
5. Property name: `almostbecame.com`
6. Time zone: **Canada — Eastern Time** (or your province)
7. Currency: **Canadian Dollar (CAD)**
8. Click Next → Industry: **Arts & Entertainment**
9. Click Create → Accept terms

---

## Step 2 — Get Your Measurement ID

1. After creation, click **Web** as your platform
2. Website URL: `almostbecame.com`
3. Stream name: `Almost Became Web`
4. Click **Create stream**
5. Copy the **Measurement ID** — it looks like `G-AB12CD34EF`

---

## Step 3 — Add to Your App

Open `.env.local` and set:
```
NEXT_PUBLIC_GA_ID=G-AB12CD34EF
```

In Vercel, go to Settings → Environment Variables → add:
- Key: `NEXT_PUBLIC_GA_ID`
- Value: `G-AB12CD34EF`
- Environment: Production

Redeploy. Done.

---

## Step 4 — Verify It's Working

1. Open almostbecame.com in your browser
2. In GA4: go to **Reports → Realtime**
3. You should see **1 active user** (yourself)

If you see it — analytics is live. ✅

---

## What You Can Track (All Free)

### In GA4 Dashboard → Reports:

| Report | What it tells you |
|---|---|
| Realtime | Who's on your site right now |
| Acquisition → Traffic | Where visitors come from (Reddit, Twitter, direct) |
| Engagement → Events | Which buttons people click (share, upgrade, feedback) |
| Engagement → Pages | Which pages people visit most |
| Monetization → Purchases | Revenue tracking (wire Stripe later) |
| Retention | How many people come back |

### Custom Events Already Wired In Your App:

These fire automatically thanks to `lib/analytics.js`:

| Event | Triggers when |
|---|---|
| `museum_generation_start` | User clicks "Open the Museum" |
| `museum_generation_complete` | Museum successfully created |
| `share_click` | Share button clicked |
| `share_link_copied` | Link copied to clipboard |
| `upgrade_click` | Upgrade button clicked |
| `checkout_start` | Stripe checkout opened |
| `upgrade_complete` | Payment successful |
| `final_room_view` | User reaches "Current You" room |
| `feedback_submit` | User leaves a feeling note |
| `email_reminder_opt_in` | User opts in to annual reminder |
| `public_museum_view` | Someone views a shared museum |
| `public_cta_click` | Visitor clicks "Build Your Own" |

---

## The 3 Numbers That Matter Most in Stage 1

Check these every morning:

**1. Sessions → Museum Created (conversion rate)**
- Go to Explore → Funnel exploration
- Step 1: `page_view` on `/museum`
- Step 2: `museum_generation_complete`
- If under 40% — the creation flow has friction. Fix it.

**2. Share Rate**
- `share_link_copied` ÷ `museum_generation_complete`
- If under 20% — the product isn't emotional enough yet.
- If over 40% — you have viral potential. Double down on distribution.

**3. Public CTA Click Rate**
- `public_cta_click` ÷ `public_museum_view`
- If over 15% — your viral loop is working. Scale sharing.

---

## Reading Feedback in Supabase (The Most Important Data)

Every feeling your users write goes into Supabase.
To read them, go to Supabase → SQL Editor → run:

```sql
select
  f.feeling,
  f.created_at,
  f.is_public_visitor,
  m.selves[1] as what_they_almost_became
from feedback f
left join museums m on m.id = f.museum_id
order by f.created_at desc
limit 50;
```

Read these every day. These words will tell you exactly what to build next,
what to put on your landing page, and whether Stage 1 is working.
