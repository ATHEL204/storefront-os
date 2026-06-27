import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { v4 as uuid } from 'uuid'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: 'Login required to contact creators' }, { status: 401 })
  }

  const { postId, fromName, fromEmail, message, budget } = await req.json()
  if (!postId || !fromName || !fromEmail || !message) {
    return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
  }

  const post = db.getPostById(postId)
  if (!post) return NextResponse.json({ ok: false, error: 'Post not found' }, { status: 404 })

  db.createMessage({
    id: uuid(), postId, fromName, fromEmail, message,
    budget: budget || undefined,
    toAuthorId: post.authorId,
    createdAt: new Date().toISOString(),
  })

  // Send email if SMTP is configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', port: 587, secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      })
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.SMTP_USER, // In production, look up author's email
        subject: `New inquiry about: ${post.title}`,
        text: `From: ${fromName} <${fromEmail}>\nPost: ${post.title}\nBudget: ${budget || 'Not specified'}\n\n${message}`,
      })
    } catch (e) {
      console.error('[MAILER]', e)
    }
  }

  return NextResponse.json({ ok: true, message: 'Message sent successfully' })
}
