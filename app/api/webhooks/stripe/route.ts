import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

// Stripe requires the raw request body (unparsed) to verify the webhook
// signature, so this route must NOT use req.json() before verification.
export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { packageId, postId, buyerId, sellerId, tier, requirements } = session.metadata || {}

    if (!packageId || !postId || !buyerId || !sellerId) {
      console.error('Missing metadata on checkout session', session.id)
      return NextResponse.json({ ok: true }) // acknowledge so Stripe doesn't retry forever
    }

    // Avoid creating a duplicate order if Stripe retries this webhook
    const existing = await db.getOrderByStripeSessionId(session.id)
    if (!existing) {
      await db.createOrder({
        postId, packageId, buyerId, sellerId, tier,
        price: session.amount_total || 0,
        status: 'pending',
        requirements: requirements || null,
        stripeSessionId: session.id,
      })
    }
  }

  return NextResponse.json({ ok: true })
}
