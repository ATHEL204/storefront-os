import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { db } from './db'
import { v4 as uuid } from 'uuid'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
      if (!user.email) return false

      let dbUser = db.getUserByEmail(user.email)

      if (!dbUser) {
        dbUser = db.createUser({
          id: uuid(),
          email: user.email.toLowerCase(),
          name: user.name || user.email.split('@')[0],
          avatar: user.image || undefined,
          role: 'merchant',
          emailVerified: account?.provider === 'google',
          createdAt: new Date().toISOString(),
        })
      } else {
        db.updateUser(dbUser.id, {
          avatar: user.image || dbUser.avatar,
          emailVerified: dbUser.emailVerified || account?.provider === 'google',
        })
      }

      return true
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = db.getUserByEmail(user.email)
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.emailVerified = dbUser.emailVerified
        }
      }
      return token
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
}
