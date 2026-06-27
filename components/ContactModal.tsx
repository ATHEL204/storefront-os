'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Post } from '@/lib/db'

interface Props { post: Post; onClose: () => void }

export default function ContactModal({ post, onClose }: Props) {
  const { data: session } = useSession()
  const [fromName, setFromName] = useState(session?.user?.name || '')
  const [fromEmail, setFromEmail] = useState(session?.user?.email || '')
  const [message, setMessage] = useState('')
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const initials = (post.authorName || 'U')[0].toUpperCase()

  async function handleSend() {
    if (!fromName || !fromEmail || !message) return
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ postId: post.id, fromName, fromEmail, message, budget }),
      })
      const data = await res.json()
      if (data.ok) setSent(true)
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:480 }}>
        <div className="modal-top">
          <span className="modal-title">CONTACT</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Profile hero */}
        <div style={{ background:'linear-gradient(160deg,var(--bg-elevated),var(--bg-card))', padding:'28px 24px', borderBottom:'1px solid var(--border)', textAlign:'center' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', margin:'0 auto 12px', border:'2px solid var(--border-gold)', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:24, color:'var(--gold)' }}>{initials}</div>
          <div style={{ fontFamily:'var(--display)', fontSize:22, letterSpacing:2 }}>{post.authorName}</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', letterSpacing:1, textTransform:'uppercase', marginTop:4 }}>{post.authorRole}</div>
          <div style={{ fontSize:13, color:'var(--text-dim)', marginTop:8 }}>Re: <strong style={{ color:'var(--text)' }}>{post.title}</strong></div>
        </div>

        <div style={{ padding:24 }}>
          {!session ? (
            /* Login gate */
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:36, marginBottom:14 }}>🔐</div>
              <h3 style={{ fontFamily:'var(--display)', fontSize:22, letterSpacing:2, marginBottom:8 }}>LOGIN TO CONTACT</h3>
              <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6, marginBottom:24 }}>
                Create a free account to message {post.authorName} about their work.
              </p>
              <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                <Link href="/auth/login" className="btn btn-gold btn-lg">Sign In →</Link>
                <Link href="/auth/login" className="btn btn-outline btn-lg">Create Account</Link>
              </div>
            </div>
          ) : sent ? (
            /* Success */
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:40, marginBottom:14 }}>✅</div>
              <h3 style={{ fontFamily:'var(--display)', fontSize:22, letterSpacing:2, marginBottom:8 }}>MESSAGE SENT</h3>
              <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6, marginBottom:24 }}>Your message has been sent to {post.authorName}. They&apos;ll get back to you soon.</p>
              <button className="btn btn-outline btn-full" onClick={onClose}>Close</button>
            </div>
          ) : (
            /* Contact form */
            <>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" value={fromName} onChange={e=>setFromName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label">Your Email</label>
                <input className="form-input" value={fromEmail} onChange={e=>setFromEmail(e.target.value)} placeholder="your@email.com" type="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea className="form-input" value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe your project or what you need..." rows={4} style={{ resize:'vertical', minHeight:100 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Budget (optional)</label>
                <input className="form-input" value={budget} onChange={e=>setBudget(e.target.value)} placeholder="e.g. $500 or Open to discussion" />
              </div>
              <button className="btn btn-gold btn-full btn-lg" onClick={handleSend} disabled={loading||!message}>
                {loading ? 'Sending...' : 'Send Message →'}
              </button>
              {post.link && (
                <a href={post.link} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-full btn-lg" style={{ marginTop:10, display:'flex' }}>
                  ↗ View Their Work
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
