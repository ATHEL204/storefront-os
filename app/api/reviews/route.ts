import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: 'Auth required' }, { status: 401 })

  const user = await db.getUserByEmail(session.user.email)
  if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })

  const { orderId, rating, comment } = await req.json()
  if (!orderId || !rating) return NextResponse.json({ ok: false, error: 'orderId and rating are required' }, { status: 400 })
  if (rating < 1 || rating > 5) return NextResponse.json({ ok: false, error: 'rating must be 1-5' }, { status: 400 })

  const order = await db.getOrderById(orderId)
  if (!order) return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 })
  if (order.buyerId !== user.id) return NextResponse.json({ ok: false, error: 'Only the buyer can review this order' }, { status: 403 })
  if (order.status !== 'completed') return NextResponse.json({ ok: false, error: 'Order must be completed before reviewing' }, { status: 400 })
  if (order.review) return NextResponse.json({ ok: false, error: 'This order already has a review' }, { status: 400 })

  const review = await db.createReview({
    orderId, authorId: user.id, targetId: order.sellerId, rating, comment: comment || '',
  })
  await db.recomputeSellerRating(order.sellerId)

  return NextResponse.json({ ok: true, data: review }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ ok: false, error: 'userId is required' }, { status: 400 })
  const reviews = await db.getReviewsForUser(userId)
  return NextResponse.json({ ok: true, data: reviews })
}
