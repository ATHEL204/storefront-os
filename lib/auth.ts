import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
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
        port: 465,
        secure: true, // port 465 requires secure:true; port 587 would use secure:false + STARTTLS
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      },
      // Gmail requires the "from" address to match the authenticated SMTP_USER,
      // otherwise it silently drops or bounces the message.
      from: process.env.SMTP_USER,
      async sendVerificationRequest({ identifier, url, provider }) {
        const nodemailer = require('nodemailer')
        const transport = nodemailer.createTransport(provider.server)
        try {
          await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: 'Sign in to STOREFRONT OS',
            text: `Sign in: ${url}`,
            html: `<p>Click below to sign in:</p><p><a href="${url}">${url}</a></p>`,
          })
        } catch (err) {
          console.error('MAGIC LINK SEND FAILED:', err)
          throw new Error('Failed to send verification email')
        }
      },
    }),
  ],

  // With PrismaAdapter + a real database, we can switch to database-backed
  // sessions instead of JWT. This means sessions persist server-side and
  // survive across serverless instances reliably.
  session: { strategy: 'database' },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id
        ;(session.user as any).role = (user as any).role
      }
      return session
    },
  },

  pages: {
    signIn: '/auth/login',
    verifyRequest: '/auth/verify',
    error: '/auth/error',
  },

  secret: process.env.NEXTAUTH_SECRET,
}
