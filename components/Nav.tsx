'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Nav({ onPostClick }: { onPostClick?: () => void }) {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:1000, height:64,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 40px', background:'rgba(8,10,14,0.9)',
      backdropFilter:'blur(20px)', borderBottom:'1px solid var(--border)',
    }}>
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'var(--display)', fontSize:20, letterSpacing:3, color:'var(--gold)' }}>
        <span style={{ width:6, height:6, background:'var(--electric)', borderRadius:'50%', display:'inline-block', animation:'blink 2s infinite' }} />
        STOREFRONT OS
      </Link>

      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {session ? (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => window.location.href='/dashboard'}>Dashboard</button>
            <button className="btn btn-gold btn-sm" onClick={onPostClick}>+ Post Work</button>
            <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }} onClick={() => window.location.href='/dashboard'}>
              {session.user?.image
                ? <Image src={session.user.image} alt="avatar" width={32} height={32} style={{ borderRadius:'50%', border:'1.5px solid var(--border-gold)' }} />
                : <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--bg-elevated)', border:'1.5px solid var(--border-gold)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:14, color:'var(--gold)' }}>
                    {(session.user?.name || 'U')[0].toUpperCase()}
                  </div>
              }
            </div>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/auth/login" className="btn btn-gold btn-sm">Get Started →</Link>
          </>
        )}
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.6)} }`}</style>
    </nav>
  )
}
