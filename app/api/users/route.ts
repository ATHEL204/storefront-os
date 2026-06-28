import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 })
  }
  const user = db.getUserByEmail(session.user.email)
  if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
  const posts = db.getPostsByAuthor(user.id)
  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar, role: user.role, emailVerified: user.emailVerified, createdAt: user.createdAt },
    stats: { totalPosts: posts.length, totalViews: posts.reduce((s, p) => s + p.views, 0), categories: [Array.from(new Set(posts.map(p => p.category)))].length },
  })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: 'Auth required' }, { status: 401 })
  const { name } = await req.json()
  const user = db.getUserByEmail(session.user.email)
  if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })
  const updated = db.updateUser(user.id, { name: name || user.name })
  return NextResponse.json({ ok: true, user: updated })
}
