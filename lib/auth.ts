import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  // Required so the Email (magic link) provider has somewhere to store
  // verification tokens. Also lets Google-linked accounts persist properly.
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider({
      server: {
        host: 'smtp.gmail.com',
        port: 587,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      try {
        if (!user.email) return false

        let dbUser = await db.getUserByEmail(user.email)

        if (!dbUser) {
          dbUser = await db.createUser({
            email: user.email.toLowerCase(),
            name: user.name || user.email.split('@')[0],
            avatar: user.image || undefined,
            role: 'merchant',
            emailVerified: account?.provider === 'google',
          })
        } else {
          await db.updateUser(dbUser.id, {
            avatar: user.image || dbUser.avatar,
            emailVerified: dbUser.emailVerified || account?.provider === 'google',
          })
        }

        return true
      } catch (err) {
        console.error('AUTH_SIGNIN_ERROR', err)
        return false
      }
    },

    async jwt({ token, user }) {
      try {
        if (user?.email) {
          const dbUser = await db.getUserByEmail(user.email)
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            token.emailVerified = dbUser.emailVerified
          }
        }
        return token
      } catch (err) {
        console.error('AUTH_JWT_ERROR', err)
        return token
      }
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        ;(session.user as any).role = token.role
        ;(session.user as any).emailVerified = token.emailVerified
      }
      return session
    },
  },

  pages: {
    signIn: '/auth/login',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },

  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // TEMP: remove once magic link + Google are both confirmed working
}
