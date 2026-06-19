import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: instUser } = await supabase
    .from('institution_users')
    .select('institutions(stripe_customer_id)')
    .eq('supabase_auth_user_id', user.id)
    .single()

  const customerId = (instUser as any)?.institutions?.stripe_customer_id
  if (!customerId) return NextResponse.json({ error: 'No billing account found' }, { status: 404 })

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  return NextResponse.json({ url: portalSession.url })
}
