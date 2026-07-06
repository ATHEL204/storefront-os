import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Visit /api/setup-db ONCE in your browser after deploying to create all
// database tables. Safe to run more than once (uses IF NOT EXISTS).
// DELETE THIS FILE once your tables are confirmed created — it shouldn't
// stay in a production app.
export async function GET() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS "users" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT,
      "email" TEXT UNIQUE NOT NULL,
      "emailVerified" TIMESTAMP(3),
      "image" TEXT,
      "role" TEXT NOT NULL DEFAULT 'merchant',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS "Account" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "type" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      "refresh_token" TEXT,
      "access_token" TEXT,
      "expires_at" INTEGER,
      "token_type" TEXT,
      "scope" TEXT,
      "id_token" TEXT,
      "session_state" TEXT,
      UNIQUE ("provider", "providerAccountId")
    )`,
    `CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT PRIMARY KEY,
      "sessionToken" TEXT UNIQUE NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "expires" TIMESTAMP(3) NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS "VerificationToken" (
      "identifier" TEXT NOT NULL,
      "token" TEXT UNIQUE NOT NULL,
      "expires" TIMESTAMP(3) NOT NULL,
      UNIQUE ("identifier", "token")
    )`,
    `CREATE TABLE IF NOT EXISTS "posts" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "images" TEXT[] NOT NULL DEFAULT '{}',
      "link" TEXT NOT NULL DEFAULT '',
      "rate" TEXT NOT NULL DEFAULT '',
      "rateType" TEXT NOT NULL DEFAULT 'hourly',
      "authorId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "authorName" TEXT NOT NULL,
      "authorRole" TEXT NOT NULL,
      "authorAvatar" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "views" INTEGER NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS "messages" (
      "id" TEXT PRIMARY KEY,
      "postId" TEXT NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
      "fromName" TEXT NOT NULL,
      "fromEmail" TEXT NOT NULL,
      "message" TEXT NOT NULL,
      "budget" TEXT,
      "toAuthorId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  ]

  const results: { statement: string; ok: boolean; error?: string }[] = []

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql)
      results.push({ statement: sql.slice(0, 40) + '...', ok: true })
    } catch (err: any) {
      results.push({ statement: sql.slice(0, 40) + '...', ok: false, error: err?.message || String(err) })
    }
  }

  const allOk = results.every(r => r.ok)
  return NextResponse.json({ success: allOk, results })
}
