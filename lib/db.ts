import { prisma } from './prisma'

export const db = {
  // --- Users ---
  createUser: (u: { id?: string; email: string; name?: string; image?: string }) =>
    prisma.user.create({ data: u }),

  getUserById: (id: string) => prisma.user.findUnique({ where: { id } }),

  getUserByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email: email.toLowerCase() } }),

  updateUser: (id: string, fields: Record<string, any>) =>
    prisma.user.update({ where: { id }, data: fields }),

  // --- Posts ---
  getAllPosts: (category?: string) =>
    prisma.post.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    }),

  getPostsByAuthor: (authorId: string) =>
    prisma.post.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
    }),

  getPostById: (id: string) => prisma.post.findUnique({ where: { id } }),

  createPost: (p: any) => prisma.post.create({ data: p }),

  updatePost: (id: string, fields: Record<string, any>) =>
    prisma.post.update({ where: { id }, data: fields }),

  deletePost: (id: string) => prisma.post.delete({ where: { id } }),

  incrementViews: (id: string) =>
    prisma.post.update({ where: { id }, data: { views: { increment: 1 } } }),

  // --- Messages ---
  createMessage: (m: any) => prisma.message.create({ data: m }),

  getMessagesForUser: (authorId: string) =>
    prisma.message.findMany({
      where: { toAuthorId: authorId },
      orderBy: { createdAt: 'desc' },
    }),
}
