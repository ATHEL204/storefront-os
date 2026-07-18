'use client'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'
import { useTheme } from '@/lib/theme'

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [profileName, setProfileName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (session?.user?.name) setProfileName(session.user.name)
  }, [session])

  async function saveProfile() {
    if (!profileName.trim()) return
    setSaving(true); setSaved(false)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName.trim() }),
      })
      const data = await res.json()
      if (data.ok) {
        setSaved(true)
        await update()
        setTimeout(() => setSaved(false), 2500)
      }
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', color:'var(--text-dim)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:1 }}>LOADING...</div>
  }
  if (!session) return null

  return (
    <>
      <Nav />
      <div style={{ paddingTop:64, minHeight:'100vh', background:'var(--bg)' }}>
        <div className="container" style={{ maxWidth:640, padding:'48px 20px 80px' }}>
          <h1 style={{ fontFamily:'var(--display)', fontSize:'clamp(36px,5vw,52px)', letterSpacing:2, marginBottom:8 }}>SETTINGS</h1>
          <p style={{ color:'var(--text-dim)', fontSize:14, marginBottom:40 }}>Manage your profile and how the app looks.</p>

          {/* Appearance */}
          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:14 }}>Appearance</h2>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>Theme</div>
                <div style={{ fontSize:12, color:'var(--text-dim)' }}>Currently using {theme === 'dark' ? 'Dark' : 'Light'} mode</div>
              </div>
              <button
                onClick={toggleTheme}
                style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:.5, cursor:'pointer' }}
              >
                {theme === 'dark' ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
              </button>
            </div>
          </section>

          {/* Profile */}
          <section style={{ marginBottom:32 }}>
            <h2 style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:14 }}>Profile</h2>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:24 }}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input className="form-input" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="form-group" style={{ marginBottom:0 }}>
                <label className="form-label">Email</label>
                <input className="form-input" value={session.user?.email || ''} disabled style={{ opacity:.5, cursor:'not-allowed' }} />
                <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', marginTop:6 }}>
                  Email is tied to your sign-in method and can&apos;t be changed here.
                </div>
              </div>
              <button className="btn btn-gold btn-full" onClick={saveProfile} disabled={saving || !profileName.trim()} style={{ marginTop:18 }}>
                {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
              </button>
            </div>
          </section>

          {/* Account */}
          <section>
            <h2 style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:14 }}>Account</h2>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:20 }}>
              <button
                onClick={() => signOut({ callbackUrl:'/' })}
                style={{ background:'none', border:'none', color:'var(--red)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:.5, cursor:'pointer', padding:0 }}
              >
                → Sign Out
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
