import { createAdminClient } from '../../../../lib/supabase-server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const runtime = 'nodejs'

export async function POST(request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.metadata?.supabase_user_id

    if (userId) {
      const admin = createAdminClient()
      await admin
        .from('profiles')
        .update({ is_paid: true })
        .eq('id', userId)

      console.log(`✅ User ${userId} upgraded to paid`)
    }
  }

  return NextResponse.json({ received: true })
}