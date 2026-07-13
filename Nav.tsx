'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Nav({ onPostClick }: { onPostClick?: () => void }) {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="site-nav">
      {/* Column 1: Logo */}
      <Link href="/" className="nav-logo">
        <span className="nav-dot" />
        <span className="nav-logo-text">STOREFRONT OS</span>
      </Link>

      {/* Column 2 (mobile) / middle links (desktop): Browse Talent */}
      <Link href="/#explore" className="nav-browse">
        <span className="nav-browse-icon">🔍</span>
        <span className="nav-browse-text">Browse Talent</span>
      </Link>

      {/* Desktop-only right-side actions */}
      <div className="nav-desktop-actions">
        {session ? (
          <>
            <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
            <button className="btn btn-gold btn-sm" onClick={onPostClick}>+ Post Work</button>
            <Link href="/dashboard" style={{ display:'flex', alignItems:'center' }}>
              {session.user?.image
                ? <Image src={session.user.image} alt="avatar" width={32} height={32} style={{ borderRadius:'50%', border:'1.5px solid var(--border-gold)' }} />
                : <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--bg-elevated)', border:'1.5px solid var(--border-gold)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:14, color:'var(--gold)' }}>
                    {(session.user?.name || 'U')[0].toUpperCase()}
                  </div>
                }
            </Link>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/auth/login" className="btn btn-gold btn-sm">Get Started →</Link>
          </>
        )}
      </div>

      {/* Column 3 (mobile only): hamburger / avatar trigger */}
      <button className="nav-mobile-trigger" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
        {session?.user?.image
          ? <Image src={session.user.image} alt="avatar" width={30} height={30} style={{ borderRadius:'50%', border:'1.5px solid var(--border-gold)' }} />
          : <span style={{ fontSize:20 }}>{menuOpen ? '✕' : '☰'}</span>
        }
      </button>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="nav-mobile-menu">
          {session ? (
            <>
              <div className="nav-mobile-user">
                <div style={{ fontSize:13, fontWeight:600 }}>{session.user?.name}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)' }}>{session.user?.email}</div>
              </div>
              <Link href="/dashboard" className="nav-mobile-item" onClick={() => setMenuOpen(false)}>📊 Dashboard</Link>
              <button className="nav-mobile-item" onClick={() => { setMenuOpen(false); onPostClick?.() }}>✦ Post Work</button>
              <button className="nav-mobile-item" style={{ color:'var(--red)' }} onClick={() => signOut({ callbackUrl:'/' })}>→ Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="nav-mobile-item" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link href="/auth/login" className="nav-mobile-item" style={{ color:'var(--gold)' }} onClick={() => setMenuOpen(false)}>Get Started →</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.6)} }

        .site-nav {
          position: fixed; top:0; left:0; right:0; z-index:1000; height:64;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; background: rgba(8,10,14,0.9);
          backdrop-filter: blur(20px); border-bottom: 1px solid var(--border);
        }
        .nav-logo { display:flex; align-items:center; gap:8px; font-family:var(--display); font-size:20px; letter-spacing:3px; color:var(--gold); }
        .nav-dot { width:6px; height:6px; background:var(--electric); border-radius:50%; display:inline-block; animation: blink 2s infinite; }
        .nav-browse { display:none; }
        .nav-mobile-trigger { display:none; }
        .nav-mobile-menu { display:none; }

        /* Desktop: show a Browse Talent link inline with actions */
        @media (min-width: 769px) {
          .nav-browse {
            display: flex; align-items:center; gap:6px;
            font-family: var(--mono); font-size:11px; letter-spacing:1px; text-transform:uppercase;
            color: var(--text-dim); margin-right: auto; margin-left: 40px;
          }
          .nav-browse:hover { color: var(--gold); }
        }

        /* Mobile: 3-column layout — logo | browse talent | menu trigger */
        @media (max-width: 768px) {
          .site-nav { padding: 0 16px; display:grid; grid-template-columns: 1fr auto 1fr; align-items:center; }
          .nav-logo-text { display:none; }
          .nav-desktop-actions { display:none; }
          .nav-browse {
            display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;
            font-family: var(--mono); font-size:9px; letter-spacing:.5px; text-transform:uppercase; color:var(--text-dim);
          }
          .nav-browse-icon { font-size:16px; }
          .nav-mobile-trigger {
            display:flex; align-items:center; justify-content:center; justify-self:end;
            width:36px; height:36px; background:none; border:1px solid var(--border); border-radius:var(--r);
            color:var(--text); cursor:pointer;
          }
          .nav-mobile-menu {
            display:flex; flex-direction:column; position:fixed; top:64px; left:0; right:0;
            background: rgba(8,10,14,0.98); backdrop-filter: blur(20px); border-bottom:1px solid var(--border);
            padding: 8px; gap:2px; z-index:999;
          }
          .nav-mobile-user { padding:12px 14px; border-bottom:1px solid var(--border); margin-bottom:6px; }
          .nav-mobile-item {
            display:block; width:100%; text-align:left; padding:12px 14px; background:none; border:none;
            color:var(--text); font-family:var(--body); font-size:14px; border-radius:var(--r); cursor:pointer;
          }
          .nav-mobile-item:hover { background: var(--bg-elevated); }
        }
      `}</style>
    </nav>
  )
}
