import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Sign in required to place an order' }, { status: 401 })
  }

  const { packageId, requirements } = await req.json()
  if (!packageId) return NextResponse.json({ ok: false, error: 'packageId is required' }, { status: 400 })

  const pkg = await db.getPackageById(packageId)
  if (!pkg) return NextResponse.json({ ok: false, error: 'Package not found' }, { status: 404 })

  const buyer = await db.getUserByEmail(session.user.email)
  if (!buyer) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })

  if (buyer.id === pkg.post.authorId) {
    return NextResponse.json({ ok: false, error: "You can't order your own gig" }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get('host')}`

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: buyer.email,
    line_items: [{
      price_data: {
        currency: 'usd',
        unit_amount: pkg.price,
        product_data: {
          name: `${pkg.post.title} — ${pkg.title}`,
          description: pkg.description,
        },
      },
      quantity: 1,
    }],
    metadata: {
      packageId: pkg.id,
      postId: pkg.postId,
      buyerId: buyer.id,
      sellerId: pkg.post.authorId,
      tier: pkg.tier,
      requirements: (requirements || '').slice(0, 450), // Stripe metadata values cap at 500 chars
    },
    success_url: `${appUrl}/dashboard?panel=orders&checkout=success`,
    cancel_url: `${appUrl}/dashboard?panel=orders&checkout=cancelled`,
  })

  return NextResponse.json({ ok: true, url: checkoutSession.url })
}
