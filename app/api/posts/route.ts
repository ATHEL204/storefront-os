import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { v4 as uuid } from 'uuid'

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category') || undefined
  const posts = await db.getAllPosts(category)
  return NextResponse.json({ ok: true, data: posts, stats: await db.getStats() })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, category, images, link, rate, rateType } = body

  if (!title || !description || !category) {
    return NextResponse.json({ ok: false, error: 'title, description and category are required' }, { status: 400 })
  }

  const user = await db.getUserByEmail(session.user.email)
  const CATEGORIES: Record<string, string> = {
    dev: 'Full-Stack Developer', design: 'Designer',
    engineer: 'Engineer', video: 'Videographer', '3d': '3D Artist', other: 'Creative'
  }

  const post = await db.createPost({
    id: 'post-' + uuid().slice(0, 8),
    title, description, category, images: images || [],
    link: link || '', rate: rate || '',
    rateType: rateType || 'hourly',
    authorId: (session.user as any).id || session.user.email,
    authorName: session.user.name || session.user.email.split('@')[0],
    authorRole: CATEGORIES[category] || 'Creative',
    authorAvatar: session.user.image || undefined,
    createdAt: new Date().toISOString(),
    views: 0,
  })

  return NextResponse.json({ ok: true, data: post }, { status: 201 })
}
