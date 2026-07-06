import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Visit /api/debug in your browser after deploying to see what's actually
// broken, without needing to dig through Vercel's log UI.
// DELETE THIS FILE once auth is confirmed working — it reveals which
// env vars are set (not their values) and should not stay in production.
export async function GET() {
  const envCheck = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    SMTP_USER: !!process.env.SMTP_USER,
    SMTP_PASS: !!process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM || null,
  }

  let dbStatus: any = { connected: false }
  try {
    const userCount = await prisma.user.count()
    dbStatus = { connected: true, userCount }
  } catch (err: any) {
    dbStatus = {
      connected: false,
      error: err?.message || String(err),
      code: err?.code || null,
    }
  }

  return NextResponse.json({ envCheck, dbStatus })
}
