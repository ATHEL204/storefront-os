import { prisma } from './prisma'

export interface User {
  id: string; email: string; name: string; avatar?: string
  role: 'merchant' | 'admin'; emailVerified: boolean
  createdAt: string
}

export interface Post {
  id: string; title: string; description: string
  category: 'dev' | 'design' | 'engineer' | 'video' | '3d' | 'other'
  images: string[]; link: string; rate: string
  rateType: 'hourly' | 'project' | 'open' | 'hide'
  authorId: string; authorName: string; authorRole: string
  authorAvatar?: string; createdAt: string; views: number
}

export interface Message {
  id: string; postId: string; fromName: string; fromEmail: string
  message: string; budget?: string; toAuthorId: string; createdAt: string
}

function toUser(u: any): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name || u.email.split('@')[0],
    avatar: u.image || undefined,
    role: u.role,
    // Prisma/NextAuth store this as a DateTime (or null); our app-facing
    // type just wants a boolean.
    emailVerified: !!u.emailVerified,
    createdAt: u.createdAt.toISOString(),
  }
}

function toPost(p: any): Post {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    images: p.images,
    link: p.link,
    rate: p.rate,
    rateType: p.rateType,
    authorId: p.authorId,
    authorName: p.authorName,
    authorRole: p.authorRole,
    authorAvatar: p.authorAvatar || undefined,
    createdAt: p.createdAt.toISOString(),
    views: p.views,
  }
}

export const db = {
  createUser: async (u: {
    id?: string; email: string; name?: string; avatar?: string
    role?: 'merchant' | 'admin'; emailVerified?: boolean; createdAt?: string
  }) => {
    const created = await prisma.user.create({
      data: {
        email: u.email.toLowerCase(),
        name: u.name,
        image: u.avatar,
        role: u.role || 'merchant',
        emailVerified: u.emailVerified ? new Date() : null,
      },
    })
    return toUser(created)
  },

  getUserById: async (id: string) => {
    const u = await prisma.user.findUnique({ where: { id } })
    return u ? toUser(u) : null
  },

  getUserByEmail: async (email: string) => {
    const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    return u ? toUser(u) : null
  },

  updateUser: async (id: string, fields: Partial<Omit<User, 'id' | 'email'>>) => {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: fields.name,
        image: fields.avatar,
        role: fields.role,
        emailVerified:
          fields.emailVerified === undefined ? undefined : fields.emailVerified ? new Date() : null,
      },
    })
    return toUser(updated)
  },

  getAllPosts: async (category?: string) => {
    const posts = await prisma.post.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    })
    return posts.map(toPost)
  },

  getPostById: async (id: string) => {
    const p = await prisma.post.findUnique({ where: { id } })
    return p ? toPost(p) : null
  },

  createPost: async (p: Omit<Post, 'createdAt' | 'views'> & { createdAt?: string; views?: number }) => {
    const created = await prisma.post.create({
      data: {
        title: p.title,
        description: p.description,
        category: p.category,
        images: p.images,
        link: p.link,
        rate: p.rate,
        rateType: p.rateType,
        authorId: p.authorId,
        authorName: p.authorName,
        authorRole: p.authorRole,
        authorAvatar: p.authorAvatar,
      },
    })
    return toPost(created)
  },

  deletePost: async (id: string) => {
    await prisma.post.delete({ where: { id } }).catch(() => null)
  },

  getPostsByAuthor: async (authorId: string) => {
    const posts = await prisma.post.findMany({ where: { authorId } })
    return posts.map(toPost)
  },

  incrementViews: async (id: string) => {
    await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => null)
  },

  createMessage: async (m: Omit<Message, 'createdAt'> & { createdAt?: string }) => {
    const created = await prisma.message.create({
      data: {
        postId: m.postId,
        fromName: m.fromName,
        fromEmail: m.fromEmail,
        message: m.message,
        budget: m.budget,
        toAuthorId: m.toAuthorId,
      },
    })
    return created
  },

  getStats: async () => {
    const posts = await prisma.post.findMany({ select: { authorId: true, category: true } })
    return {
      totalPosts: posts.length,
      totalCreators: new Set(posts.map(p => p.authorId)).size,
      totalCategories: new Set(posts.map(p => p.category)).size,
    }
  },
}
