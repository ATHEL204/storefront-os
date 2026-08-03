'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { useTheme } from '@/lib/theme'
import { getSellerLevel } from '@/lib/sellerLevel'
import Link from 'next/link'

function Chevron() {
  return <span style={{ color:'var(--text-muted)', fontSize:16, flexShrink:0 }}>›</span>
}

function Row({ icon, label, sublabel, trailing, onClick, danger, chevron = true }: {
  icon: string; label: string; sublabel?: string; trailing?: React.ReactNode;
  onClick?: () => void; danger?: boolean; chevron?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display:'flex', alignItems:'center', gap:14, padding:'16px 20px',
        cursor: onClick ? 'pointer' : 'default', transition:'background .15s',
        borderBottom:'1px solid var(--border)',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = 'var(--bg-elevated)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ width:36, height:36, borderRadius:'var(--r)', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:500, color: danger ? 'var(--red)' : 'var(--text)' }}>{label}</div>
        {sublabel && <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{sublabel}</div>}
      </div>
      {trailing}
      {chevron && onClick && !trailing && <Chevron />}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', padding:'24px 20px 10px' }}>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [editingName, setEditingName] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [saving, setSaving] = useState(false)
  const [profileStats, setProfileStats] = useState<{ avgRating: number|null; completedOrders: number } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (session?.user?.name) setProfileName(session.user.name)
    const userId = (session?.user as any)?.id
    if (userId) {
      fetch(`/api/creators/${userId}`).then(r => r.json()).then(d => {
        if (d.ok) setProfileStats({ avgRating: d.data.avgRating, completedOrders: d.data.completedOrders })
      }).catch(() => {})
    }
  }, [session])

  async function saveProfile() {
    if (!profileName.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName.trim() }),
      })
      const data = await res.json()
      if (data.ok) { await update(); setEditingName(false) }
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', color:'var(--text-dim)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:1 }}>LOADING...</div>
  }
  if (!session) return null

  const user = session.user
  const level = getSellerLevel(profileStats?.completedOrders ?? 0, profileStats?.avgRating ?? null)
  const initials = (user?.name || 'U')[0].toUpperCase()

  return (
    <>
      <Nav />
      <div style={{ paddingTop:64, minHeight:'100vh', background:'var(--bg)' }}>

        {/* Banner header */}
        <div style={{
          background:'linear-gradient(135deg, #1a1509, #0d0c08 60%)',
          borderBottom:'1px solid var(--border-gold)', padding:'40px 20px',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:-80, right:-80, width:260, height:260, background:'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div className="container" style={{ maxWidth:720, display:'flex', alignItems:'center', gap:18, position:'relative' }}>
            {user?.image
              ? <img src={user.image} alt={user.name || ''} style={{ width:64, height:64, borderRadius:'50%', border:'2px solid var(--border-gold)', objectFit:'cover' }} />
              : <div style={{ width:64, height:64, borderRadius:'50%', border:'2px solid var(--border-gold)', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:24, color:'var(--gold)' }}>{initials}</div>
            }
            <div>
              <div style={{ fontFamily:'var(--display)', fontSize:24, letterSpacing:1, color:'#F0EDE6' }}>{user?.name}</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4 }}>
                <span style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:1, textTransform:'uppercase', padding:'2px 8px', borderRadius:2, border:`1px solid ${level.color}`, color:level.color }}>{level.label}</span>
                <span style={{ fontSize:12, color:'#8B929E' }}>{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container" style={{ maxWidth:720, padding:'0 20px 80px' }}>

          <SectionLabel>Account</SectionLabel>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden' }}>
            {editingName ? (
              <div style={{ padding:20 }}>
                <label className="form-label">Display Name</label>
                <input className="form-input" value={profileName} onChange={e => setProfileName(e.target.value)} autoFocus />
                <div style={{ display:'flex', gap:8, marginTop:10 }}>
                  <button className="btn btn-gold btn-sm" onClick={saveProfile} disabled={saving || !profileName.trim()}>{saving ? 'Saving...' : 'Save'}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setEditingName(false); setProfileName(user?.name || '') }}>Cancel</button>
                </div>
              </div>
            ) : (
              <Row icon="👤" label="Display Name" sublabel={user?.name || ''} onClick={() => setEditingName(true)} />
            )}
            <Row icon="✉️" label="Email" sublabel={`${user?.email} · tied to your sign-in method`} chevron={false} />
            <Row icon="🌍" label="Public Profile" sublabel="See how buyers view your gigs" onClick={() => router.push(`/creator/${(user as any)?.id}`)} />
          </div>

          <SectionLabel>Preferences</SectionLabel>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden' }}>
            <Row
              icon={theme === 'dark' ? '🌙' : '☀️'}
              label="Theme"
              sublabel={theme === 'dark' ? 'Dark mode' : 'Light mode'}
              onClick={toggleTheme}
              chevron={false}
              trailing={
                <div style={{ width:40, height:22, borderRadius:11, background: theme === 'dark' ? 'var(--gold)' : 'var(--border)', position:'relative', flexShrink:0 }}>
                  <div style={{ width:16, height:16, borderRadius:'50%', background:'#fff', position:'absolute', top:3, left: theme === 'dark' ? 21 : 3, transition:'all .2s' }} />
                </div>
              }
            />
          </div>

          <SectionLabel>Resources</SectionLabel>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden' }}>
            <Row icon="📊" label="Dashboard" sublabel="Posts, orders, and earnings" onClick={() => router.push('/dashboard')} />
            <Row icon="✦" label="Post New Work" sublabel="Add a portfolio piece or gig" onClick={() => router.push('/dashboard?create=1')} />
          </div>

          <SectionLabel>Account Actions</SectionLabel>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden' }}>
            <Row icon="→" label="Sign Out" onClick={() => signOut({ callbackUrl:'/' })} danger chevron={false} />
          </div>

        </div>
      </div>
    </>
  )
}
