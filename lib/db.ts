import { prisma } from './prisma'
export type { Post, User, Account, Session, Message, GigPackage, Order, Review } from '@prisma/client'

export const db = {
  // --- Users ---
  createUser: (u: { id?: string; email: string; name?: string; image?: string }) =>
    prisma.user.create({ data: u }),

  getUserById: (id: string) => prisma.user.findUnique({ where: { id } }),

  getUserByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email: email.toLowerCase() } }),

  updateUser: (id: string, fields: Record<string, any>) =>
    prisma.user.update({ where: { id }, data: fields }),

  // --- Posts / Gigs ---
  getAllPosts: (category?: string) =>
    prisma.post.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { packages: { orderBy: { price: 'asc' } } },
    }),

  getPostsByAuthor: (authorId: string) =>
    prisma.post.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      include: { packages: true },
    }),

  getPostById: (id: string) =>
    prisma.post.findUnique({
      where: { id },
      include: { packages: { orderBy: { price: 'asc' } } },
    }),

  createPost: (p: any) => prisma.post.create({ data: p }),

  updatePost: (id: string, fields: Record<string, any>) =>
    prisma.post.update({ where: { id }, data: fields }),

  deletePost: (id: string) => prisma.post.delete({ where: { id } }),

  incrementViews: (id: string) =>
    prisma.post.update({ where: { id }, data: { views: { increment: 1 } } }),

  // --- Gig Packages ---
  createPackages: (postId: string, packages: Array<{ tier: string; title: string; description: string; price: number; deliveryDays: number; revisions: number }>) =>
    prisma.gigPackage.createMany({ data: packages.map(p => ({ ...p, postId })) }),

  getPackageById: (id: string) =>
    prisma.gigPackage.findUnique({ where: { id }, include: { post: true } }),

  // --- Orders ---
  createOrder: (o: any) => prisma.order.create({ data: o }),

  getOrderById: (id: string) =>
    prisma.order.findUnique({
      where: { id },
      include: { post: true, package: true, buyer: true, seller: true, review: true },
    }),

  getOrderByStripeSessionId: (stripeSessionId: string) =>
    prisma.order.findUnique({ where: { stripeSessionId } }),

  getOrdersAsBuyer: (buyerId: string) =>
    prisma.order.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'desc' },
      include: { post: true, package: true, seller: true, review: true },
    }),

  getOrdersAsSeller: (sellerId: string) =>
    prisma.order.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: { post: true, package: true, buyer: true, review: true },
    }),

  updateOrder: (id: string, fields: Record<string, any>) =>
    prisma.order.update({ where: { id }, data: fields }),

  // --- Reviews ---
  createReview: (r: { orderId: string; authorId: string; targetId: string; rating: number; comment: string }) =>
    prisma.review.create({ data: r }),

  getReviewsForUser: (targetId: string) =>
    prisma.review.findMany({
      where: { targetId },
      orderBy: { createdAt: 'desc' },
      include: { author: true, order: { include: { post: true } } },
    }),

  // Recomputes and stores a seller's average rating + review count.
  // Called after every new review so profile/gig cards can read the cached
  // values directly instead of aggregating reviews on every page load.
  async recomputeSellerRating(sellerId: string) {
    const agg = await prisma.review.aggregate({
      where: { targetId: sellerId },
      _avg: { rating: true },
      _count: true,
    })
    return prisma.user.update({
      where: { id: sellerId },
      data: { avgRating: agg._avg.rating ?? null, reviewCount: agg._count },
    })
  },

  // --- Messages ---
  createMessage: (m: any) => prisma.message.create({ data: m }),

  getMessagesForUser: (authorId: string) =>
    prisma.message.findMany({
      where: { toAuthorId: authorId },
      orderBy: { createdAt: 'desc' },
    }),
}
