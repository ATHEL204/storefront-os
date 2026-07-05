import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ ok: false, error: 'Auth required' }, { status: 401 })
  const post = await db.getPostById(params.id)
  if (!post) return NextResponse.json({ ok: false, error: 'Post not found' }, { status: 404 })
  const userId = (session.user as any).id || session.user.email
  if (post.authorId !== userId && post.authorId !== session.user.email) {
    return NextResponse.json({ ok: false, error: 'Not your post' }, { status: 403 })
  }
  await db.deletePost(params.id)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await db.incrementViews(params.id)
  return NextResponse.json({ ok: true })
}
