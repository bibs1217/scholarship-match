import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const institutionId = session.metadata?.institution_id
      if (institutionId) {
        await supabase
          .from('institutions')
          .update({
            stripe_customer_id: session.customer as string,
            subscription_status: 'active',
          })
          .eq('id', institutionId)
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('institutions')
        .update({
          subscription_status: sub.status as any,
          plan_tier: getPlanTier(sub),
        })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('institutions')
        .update({ subscription_status: 'canceled' })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase
        .from('institutions')
        .update({ subscription_status: 'past_due' })
        .eq('stripe_customer_id', invoice.customer as string)
      break
    }
  }

  return NextResponse.json({ received: true })
}

function getPlanTier(sub: Stripe.Subscription): string {
  const priceId = sub.items.data[0]?.price.id
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.STRIPE_STANDARD_PRICE_ID) return 'standard'
  return 'enterprise'
}
