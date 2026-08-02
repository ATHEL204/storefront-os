import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// Allowed status transitions, keyed by who is allowed to make them.
// Keeps a buyer from marking their own order "delivered", etc.
const SELLER_TRANSITIONS: Record<string, string[]> = {
  pending: ['in_progress', 'cancelled'],
  in_progress: ['delivered', 'cancelled'],
}
const BUYER_TRANSITIONS: Record<string, string[]> = {
  delivered: ['completed', 'in_progress'], // in_progress = "request revision"
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: 'Auth required' }, { status: 401 })

  const user = await db.getUserByEmail(session.user.email)
  if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })

  const order = await db.getOrderById(params.id)
  if (!order) return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 })

  const { status, note } = await req.json()
  if (!status) return NextResponse.json({ ok: false, error: 'status is required' }, { status: 400 })

  const isSeller = order.sellerId === user.id
  const isBuyer = order.buyerId === user.id
  if (!isSeller && !isBuyer) return NextResponse.json({ ok: false, error: 'Not your order' }, { status: 403 })

  const allowed = isSeller ? SELLER_TRANSITIONS : BUYER_TRANSITIONS
  const validNextStates = allowed[order.status] || []
  if (!validNextStates.includes(status)) {
    return NextResponse.json({ ok: false, error: `Can't move from ${order.status} to ${status}` }, { status: 400 })
  }

  const fields: Record<string, any> = { status }
  if (status === 'delivered') { fields.deliveredAt = new Date(); if (note) fields.deliveryNote = note }
  if (status === 'completed') { fields.completedAt = new Date() }

  const updated = await db.updateOrder(params.id, fields)

  // Bump the seller's lifetime completed-orders count for the trust/level display
  if (status === 'completed') {
    await db.updateUser(order.sellerId, { completedOrders: { increment: 1 } as any })
  }

  return NextResponse.json({ ok: true, data: updated })
}
