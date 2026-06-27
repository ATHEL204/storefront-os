'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const ERRORS: Record<string, { title: string; desc: string }> = {
  OAuthAccountNotLinked: { title: 'ACCOUNT CONFLICT', desc: 'This email is already registered with a different sign-in method. Try signing in with email instead.' },
  OAuthSignin:           { title: 'GOOGLE ERROR',     desc: 'There was a problem connecting to Google. Please try again.' },
  OAuthCallback:         { title: 'CALLBACK ERROR',   desc: 'Something went wrong after Google sign-in. Please try again.' },
  EmailSignin:           { title: 'EMAIL ERROR',      desc: 'The magic link could not be sent. Check your email address and try again.' },
  SessionRequired:       { title: 'LOGIN REQUIRED',   desc: 'You need to be signed in to access this page.' },
  Default:               { title: 'AUTH ERROR',       desc: 'An unexpected error occurred during sign-in. Please try again.' },
}

function ErrorContent() {
  const params = useSearchParams()
  const errorKey = params.get('error') || 'Default'
  const error = ERRORS[errorKey] || ERRORS.Default

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:40 }}>
      <div style={{ textAlign:'center', maxWidth:480 }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,59,92,0.1)', border:'1px solid rgba(255,59,92,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 24px' }}>⚠</div>
        <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--red)', letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Sign-in Error</div>
        <h1 style={{ fontFamily:'var(--display)', fontSize:36, letterSpacing:2, marginBottom:12 }}>{error.title}</h1>
        <p style={{ color:'var(--text-dim)', fontSize:14, lineHeight:1.7, marginBottom:32 }}>{error.desc}</p>
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/auth/login" className="btn btn-gold btn-lg">Try Again →</Link>
          <Link href="/" className="btn btn-outline btn-lg">Go Home</Link>
        </div>
        <div style={{ marginTop:24, fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)' }}>
          Error code: <span style={{ color:'var(--text-dim)' }}>{errorKey}</span>
        </div>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return <Suspense><ErrorContent /></Suspense>
}
