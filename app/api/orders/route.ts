import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: 'Auth required' }, { status: 401 })

  const user = await db.getUserByEmail(session.user.email)
  if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })

  const as = req.nextUrl.searchParams.get('as') // 'buyer' | 'seller'
  const orders = as === 'seller'
    ? await db.getOrdersAsSeller(user.id)
    : await db.getOrdersAsBuyer(user.id)

  return NextResponse.json({ ok: true, data: orders })
}
