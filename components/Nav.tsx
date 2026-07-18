'use client'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Nav({ onPostClick }: { onPostClick?: () => void }) {
  const { data: session } = useSession()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <nav className="site-nav">
      {/* Column 1: Logo */}
      <Link href="/" className="nav-logo">
        <span className="nav-dot" />
        <span className="nav-logo-text">STOREFRONT OS</span>
      </Link>

      {/* Column 2 (mobile) / middle link (desktop): Browse Talent */}
      <Link href="/#explore" className="nav-browse">
        <span className="nav-browse-icon">🔍</span>
        <span className="nav-browse-text">Browse Talent</span>
      </Link>

      {/* Desktop-only right-side actions — Dashboard/Post Work stay exactly here */}
      <div className="nav-desktop-actions">
        {session ? (
          <>
            <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
            <button className="btn btn-gold btn-sm" onClick={onPostClick}>+ Post Work</button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/auth/login" className="btn btn-gold btn-sm">Get Started →</Link>
          </>
        )}
      </div>

      {/* Hamburger — opens the side drawer, visible on both desktop and mobile */}
      <button className="nav-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      {/* Side drawer */}
      {drawerOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)} />
          <div className="drawer">
            <div className="drawer-top">
              <span style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)' }}>Menu</span>
              <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
            </div>

            {session && (
              <div className="drawer-user">
                {session.user?.image
                  ? <Image src={session.user.image} alt="avatar" width={40} height={40} style={{ borderRadius:'50%', border:'1.5px solid var(--border-gold)' }} />
                  : <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--bg-elevated)', border:'1.5px solid var(--border-gold)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:16, color:'var(--gold)' }}>
                      {(session.user?.name || 'U')[0].toUpperCase()}
                    </div>
                }
                <div>
                  <div style={{ fontSize:14, fontWeight:600 }}>{session.user?.name}</div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)' }}>{session.user?.email}</div>
                </div>
              </div>
            )}

            <div className="drawer-links">
              {/* These duplicate the desktop buttons but only actually show on mobile,
                  since Dashboard/Post Work already have dedicated buttons on desktop. */}
              {session && (
                <>
                  <Link href="/dashboard" className="drawer-item drawer-item-mobile-only" onClick={() => setDrawerOpen(false)}>📊 Dashboard</Link>
                  <button className="drawer-item drawer-item-mobile-only" onClick={() => { setDrawerOpen(false); onPostClick?.() }}>✦ Post Work</button>
                </>
              )}

              {session ? (
                <>
                  <Link href="/settings" className="drawer-item" onClick={() => setDrawerOpen(false)}>⚙️ Settings</Link>
                  <button className="drawer-item" style={{ color:'var(--red)' }} onClick={() => signOut({ callbackUrl:'/' })}>→ Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="drawer-item" onClick={() => setDrawerOpen(false)}>Sign In</Link>
                  <Link href="/auth/login" className="drawer-item" style={{ color:'var(--gold)' }} onClick={() => setDrawerOpen(false)}>Get Started →</Link>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.6)} }

        .site-nav {
          position: fixed; top:0; left:0; right:0; z-index:1000; height:64px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; background: rgba(8,10,14,0.9);
          backdrop-filter: blur(20px); border-bottom: 1px solid var(--border);
        }
        .nav-logo { display:flex; align-items:center; gap:8px; font-family:var(--display); font-size:20px; letter-spacing:3px; color:var(--gold); }
        .nav-dot { width:6px; height:6px; background:var(--electric); border-radius:50%; display:inline-block; animation: blink 2s infinite; }
        .nav-browse { display:none; }

        .nav-desktop-actions { display:flex; align-items:center; gap:10px; }

        .nav-hamburger {
          display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;
          width:36px; height:36px; margin-left:10px;
          background: var(--bg-elevated); border:1px solid var(--border); border-radius:var(--r);
          cursor:pointer;
        }
        .hamburger-line { width:16px; height:1.5px; background:var(--text); display:block; }

        .drawer-backdrop {
          position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1998;
          animation: fade-in .2s ease;
        }
        @keyframes fade-in { from{opacity:0} to{opacity:1} }
        @keyframes slide-in { from{ transform:translateX(100%) } to{ transform:translateX(0) } }

        .drawer {
          position:fixed; top:0; right:0; bottom:0; width:300px; max-width:85vw; z-index:1999;
          background: var(--bg-2); border-left:1px solid var(--border);
          display:flex; flex-direction:column; padding:20px;
          animation: slide-in .25s var(--ease);
        }
        .drawer-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .drawer-close {
          width:28px; height:28px; display:flex; align-items:center; justify-content:center;
          background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--r);
          color:var(--text-dim); cursor:pointer;
        }
        .drawer-user {
          display:flex; align-items:center; gap:12px; padding:14px;
          background: var(--bg-card); border:1px solid var(--border); border-radius:var(--r-lg);
          margin-bottom:16px;
        }
        .drawer-links { display:flex; flex-direction:column; gap:4px; }
        .drawer-item {
          display:block; width:100%; text-align:left; padding:12px 14px; background:none; border:none;
          color:var(--text); font-family:var(--body); font-size:14px; border-radius:var(--r); cursor:pointer;
        }
        .drawer-item:hover { background: var(--bg-elevated); }
        .drawer-item-mobile-only { display:none; }

        /* Desktop: show Browse Talent link inline */
        @media (min-width: 769px) {
          .nav-browse {
            display: flex; align-items:center; gap:6px;
            font-family: var(--mono); font-size:11px; letter-spacing:1px; text-transform:uppercase;
            color: var(--text-dim); margin-right: auto; margin-left: 40px;
          }
          .nav-browse:hover { color: var(--gold); }
        }

        /* Mobile: 3-column layout — logo | browse talent | hamburger */
        @media (max-width: 768px) {
          .site-nav { padding: 0 16px; display:grid; grid-template-columns: 1fr auto 1fr; align-items:center; }
          .nav-logo-text { display:none; }
          .nav-desktop-actions { display:none; }
          .nav-browse {
            display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;
            font-family: var(--mono); font-size:9px; letter-spacing:.5px; text-transform:uppercase; color:var(--text-dim);
          }
          .nav-browse-icon { font-size:16px; }
          .nav-hamburger { justify-self:end; margin-left:0; }
          .drawer-item-mobile-only { display:block; }
        }
      `}</style>
    </nav>
  )
}
