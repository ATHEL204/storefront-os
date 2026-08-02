import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Public endpoint — no auth required. Only returns fields safe to show
// to anyone (never email, account IDs, etc. beyond what's already public
// via their posts).
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await db.getUserById(params.id)
  if (!user) return NextResponse.json({ ok: false, error: 'Creator not found' }, { status: 404 })

  const posts = await db.getPostsByAuthor(user.id)
  const reviews = await db.getReviewsForUser(user.id)

  return NextResponse.json({
    ok: true,
    data: {
      id: user.id,
      name: user.name,
      image: user.image,
      avgRating: user.avgRating,
      reviewCount: user.reviewCount,
      completedOrders: user.completedOrders,
      createdAt: user.createdAt,
      posts,
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        authorName: r.author.name,
        postTitle: r.order.post.title,
      })),
    },
  })
}
