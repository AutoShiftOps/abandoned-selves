import { createServerSupabaseClient } from '../../../../lib/supabase'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/museum?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/museum`,
    metadata: { supabase_user_id: user.id },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
