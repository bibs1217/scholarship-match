import Stripe from 'stripe'
import { NextResponse } from 'next/server'

// Temporary setup endpoint — DELETE after running once
export async function GET() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || !key.startsWith('sk_')) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY missing or invalid', key_prefix: key?.substring(0, 10) }, { status: 400 })
  }
  const stripe = new Stripe(key)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://scholarship-match-blond.vercel.app'
  const results: Record<string, unknown> = {}

  try {
    const sp = await stripe.products.search({ query: 'name:"ScholarMatch Starter"' })
    const sProd = sp.data[0] || await stripe.products.create({ name: 'ScholarMatch Starter' })
    const sps = await stripe.prices.list({ product: sProd.id, active: true })
    const sPrice = sps.data.find((p: { unit_amount: number | null }) => p.unit_amount === 14900) ||
      await stripe.prices.create({ product: sProd.id, unit_amount: 14900, currency: 'usd', recurring: { interval: 'month' } })
    results.STRIPE_STARTER_PRICE_ID = sPrice.id
  } catch (e: unknown) { results.starter_error = e instanceof Error ? e.message : String(e) }

  try {
    const sp = await stripe.products.search({ query: 'name:"ScholarMatch Standard"' })
    const sProd = sp.data[0] || await stripe.products.create({ name: 'ScholarMatch Standard' })
    const sps = await stripe.prices.list({ product: sProd.id, active: true })
    const sPrice = sps.data.find((p: { unit_amount: number | null }) => p.unit_amount === 39900) ||
      await stripe.prices.create({ product: sProd.id, unit_amount: 39900, currency: 'usd', recurring: { interval: 'month' } })
    results.STRIPE_STANDARD_PRICE_ID = sPrice.id
  } catch (e: unknown) { results.standard_error = e instanceof Error ? e.message : String(e) }

  try {
    const whs = await stripe.webhookEndpoints.list()
    const url = appUrl + '/api/webhooks/stripe'
    const existing = whs.data.find((w: { url: string }) => w.url === url)
    if (!existing) {
      const wh = await stripe.webhookEndpoints.create({
        url,
        enabled_events: [
          'checkout.session.completed',
          'customer.subscription.updated',
          'customer.subscription.deleted',
          'invoice.payment_failed'
        ]
      })
      results.STRIPE_WEBHOOK_SECRET = (wh as Record<string, unknown>).secret
      results.webhook_created = true
    } else {
      results.webhook_exists = url
    }
  } catch (e: unknown) { results.webhook_error = e instanceof Error ? e.message : String(e) }

  return NextResponse.json(results)
}
