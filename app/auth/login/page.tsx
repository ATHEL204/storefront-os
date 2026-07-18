'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const errorParam = searchParams.get('error')

  async function handleGoogleLogin() {
    setLoading(true)
    await signIn('google', { callbackUrl })
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true); setError('')
    const res = await signIn('email', { email, callbackUrl, redirect: false })
    setLoading(false)
    if (res?.error) setError('Failed to send email. Please try again.')
    else setSent(true)
  }

  return (
    <div className="login-grid">
      <style>{`
        .login-grid {
          display: grid;
          grid-template-columns: 1fr 480px;
          min-height: 100vh;
        }
        .login-left {
          display: flex;
        }
        @media (max-width: 860px) {
          .login-grid {
            grid-template-columns: 1fr;
          }
          .login-left {
            display: none;
          }
          .login-right {
            padding: 32px 20px !important;
            min-height: 100vh;
          }
          .login-mobile-brand {
            display: flex !important;
          }
        }
      `}</style>

      {/* Left panel — intentionally always dark, regardless of site theme,
          so its text colors are hardcoded rather than using var(--text) etc. */}
      <div className="login-left" style={{ background:'linear-gradient(160deg,#0a0d14,#080A0E)', padding:60, flexDirection:'column', justifyContent:'space-between', borderRight:'1px solid rgba(255,255,255,0.06)', position:'relative', overflow:'hidden', color:'#F0EDE6' }}>
        <div style={{ position:'absolute', top:-200, left:-200, width:600, height:600, background:'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ fontFamily:'var(--display)', fontSize:22, letterSpacing:4, color:'#C9A84C', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:6, height:6, background:'#00E5FF', borderRadius:'50%', display:'inline-block' }} />
          STOREFRONT OS
        </div>
        <div>
          <h1 style={{ fontFamily:'var(--display)', fontSize:'clamp(56px,7vw,88px)', lineHeight:.9, letterSpacing:3, marginBottom:20, color:'#F0EDE6' }}>
            SHOW YOUR<br/><span style={{ color:'#C9A84C' }}>WORK.</span><br/>GET HIRED.
          </h1>
          <p style={{ color:'#8B929E', fontSize:15, lineHeight:1.7, maxWidth:380 }}>
            The portfolio platform for developers, designers, engineers and creators.
          </p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { icon:'🚀', title:'Launch your portfolio', desc:'Post your work in minutes — no code needed' },
            { icon:'🌍', title:'Get discovered globally', desc:'Public browsing, private contact info' },
            { icon:'💬', title:'Get hired directly', desc:'Clients message you through the platform' },
          ].map(f => (
            <div key={f.title} style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:36, height:36, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'var(--r)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:2, color:'#F0EDE6' }}>{f.title}</div>
                <div style={{ fontSize:12, color:'#8B929E' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right" style={{ background:'var(--bg-card)', display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 40px' }}>
        <div style={{ width:'100%', maxWidth:360 }}>
          <div className="login-mobile-brand" style={{ display:'none', fontFamily:'var(--display)', fontSize:18, letterSpacing:4, color:'var(--gold)', alignItems:'center', gap:8, marginBottom:32 }}>
            <span style={{ width:6, height:6, background:'var(--electric)', borderRadius:'50%', display:'inline-block' }} />
            STOREFRONT OS
          </div>
          <div style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:12, display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ width:20, height:1, background:'var(--text-muted)', display:'inline-block' }} />
            Merchant Access
          </div>
          <h2 style={{ fontFamily:'var(--display)', fontSize:36, letterSpacing:2, marginBottom:24 }}>SIGN IN</h2>

          {(errorParam || error) && (
            <div style={{ padding:'12px 14px', background:'rgba(255,59,92,0.08)', border:'1px solid rgba(255,59,92,0.2)', borderRadius:'var(--r)', color:'var(--red)', fontSize:13, marginBottom:20 }}>
              {errorParam === 'OAuthAccountNotLinked' ? 'Account already exists with a different sign-in method.' : error || 'An error occurred. Please try again.'}
            </div>
          )}

          {sent ? (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:40, marginBottom:16 }}>📬</div>
              <h3 style={{ fontFamily:'var(--display)', fontSize:24, letterSpacing:2, marginBottom:8 }}>CHECK YOUR INBOX</h3>
              <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6, marginBottom:20 }}>We sent a magic link to <strong style={{ color:'var(--text)' }}>{email}</strong>. Click it to sign in.</p>
              <button onClick={() => setSent(false)} style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--gold)', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Try a different email</button>
            </div>
          ) : (
            <>
              {/* Google */}
              <button onClick={handleGoogleLogin} disabled={loading}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:12, padding:13, background:'#fff', border:'none', borderRadius:'var(--r)', fontFamily:'var(--body)', fontSize:14, fontWeight:600, color:'#3c4043', cursor:'pointer', marginBottom:20, transition:'all .2s', opacity:loading?0.7:1 }}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'0 0 20px' }}>
                <div style={{ flex:1, height:1, background:'var(--border)' }} />
                <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', letterSpacing:1 }}>or email</span>
                <div style={{ flex:1, height:1, background:'var(--border)' }} />
              </div>

              {/* Magic link */}
              <form onSubmit={handleEmailLogin}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading||!email}>
                  {loading ? 'Sending...' : 'Send Magic Link →'}
                </button>
              </form>
            </>
          )}

          <div style={{ marginTop:20, textAlign:'center', fontSize:13, color:'var(--text-dim)' }}>
            No account? Just enter your email above — we&apos;ll create one automatically.
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
