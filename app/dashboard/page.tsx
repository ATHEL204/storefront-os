'use client'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import CreatePostModal from '@/components/CreatePostModal'
import { Post } from '@/lib/db'
import Image from 'next/image'

export default function Dashboard() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [panel, setPanel] = useState('overview')
  const [showCreate, setShowCreate] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (session) fetchMyPosts()
    if (session?.user?.name) setProfileName(session.user.name)
  }, [session])

  async function saveProfile() {
    if (!profileName.trim()) return
    setSavingProfile(true)
    setProfileSaved(false)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName.trim() }),
      })
      const data = await res.json()
      if (data.ok) {
        setProfileSaved(true)
        await update() // refresh client-side session so the new name shows immediately
        setTimeout(() => setProfileSaved(false), 2500)
      }
    } finally {
      setSavingProfile(false)
    }
  }

  async function fetchMyPosts() {
    const res = await fetch('/api/posts')
    const data = await res.json()
    if (data.ok) {
      const userId = (session?.user as any)?.id || session?.user?.email
      setPosts(data.data.filter((p: Post) => p.authorId === userId || p.authorName === session?.user?.name))
    }
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    fetchMyPosts()
  }

  if (status === 'loading') return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', color:'var(--text-dim)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:1 }}>LOADING...</div>
  if (!session) return null

  const user = session.user
  const CATS: Record<string, string> = { dev:'💻', design:'🎨', engineer:'⚙️', video:'🎬', '3d':'🧊', other:'✦' }

  return (
    <>
      <Nav onPostClick={() => setShowCreate(true)} />
      <div style={{ paddingTop:64, minHeight:'100vh' }}>
        <div className="container">
          <div className="dash-grid" style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:32, padding:'40px 0 80px' }}>

            {/* Sidebar */}
            <div style={{ position:'sticky', top:88, height:'fit-content' }}>
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:24, textAlign:'center', marginBottom:16 }}>
                {user?.image
                  ? <Image src={user.image} alt="avatar" width={64} height={64} style={{ borderRadius:'50%', margin:'0 auto 12px', border:'2px solid var(--border-gold)' }} />
                  : <div style={{ width:64, height:64, borderRadius:'50%', margin:'0 auto 12px', border:'2px solid var(--border-gold)', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:24, color:'var(--gold)' }}>{(user?.name||'U')[0].toUpperCase()}</div>
                }
                <div style={{ fontSize:15, fontWeight:600, marginBottom:2 }}>{user?.name}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)' }}>{user?.email}</div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:8, padding:'3px 8px', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:2, fontFamily:'var(--mono)', fontSize:9, color:'var(--green)', textTransform:'uppercase', letterSpacing:1 }}>● Verified</div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {[
                  { id:'overview', icon:'📊', label:'Overview' },
                  { id:'posts', icon:'📁', label:'My Posts' },
                  { id:'profile', icon:'👤', label:'Profile' },
                ].map(item => (
                  <button key={item.id} onClick={() => setPanel(item.id)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:'var(--r)', fontFamily:'var(--mono)', fontSize:10, letterSpacing:.5, textTransform:'uppercase', color:panel===item.id?'var(--gold)':'var(--text-dim)', background:panel===item.id?'var(--gold-dim)':'none', border:panel===item.id?'1px solid var(--border-gold)':'1px solid transparent', cursor:'pointer', transition:'all .2s', textAlign:'left' }}>
                    <span>{item.icon}</span>{item.label}
                  </button>
                ))}
                <button onClick={() => setShowCreate(true)}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:'var(--r)', fontFamily:'var(--mono)', fontSize:10, letterSpacing:.5, textTransform:'uppercase', color:'var(--text-dim)', background:'none', border:'1px solid transparent', cursor:'pointer', transition:'all .2s', textAlign:'left' }}>
                  <span>✦</span>Post Work
                </button>
                <button onClick={() => router.push('/')}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:'var(--r)', fontFamily:'var(--mono)', fontSize:10, letterSpacing:.5, textTransform:'uppercase', color:'var(--text-dim)', background:'none', border:'1px solid transparent', cursor:'pointer', textAlign:'left' }}>
                  <span>🌍</span>Browse Feed
                </button>
                <button onClick={() => signOut({ callbackUrl:'/' })}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:'var(--r)', fontFamily:'var(--mono)', fontSize:10, letterSpacing:.5, textTransform:'uppercase', color:'var(--red)', background:'none', border:'1px solid transparent', cursor:'pointer', marginTop:8, textAlign:'left' }}>
                  <span>→</span>Sign Out
                </button>
              </div>
            </div>

            {/* Main */}
            <div>
              {panel === 'overview' && (
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                    <h2 style={{ fontFamily:'var(--display)', fontSize:32, letterSpacing:2 }}>OVERVIEW</h2>
                    <button className="btn btn-gold btn-sm" onClick={() => setShowCreate(true)}>+ New Post</button>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
                    {[
                      { num: posts.length, label:'Your Posts' },
                      { num: posts.reduce((s,p)=>s+p.views,0), label:'Total Views' },
                      { num: new Set(posts.map(p=>p.category)).size, label:'Categories' },
                    ].map(s => (
                      <div key={s.label} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:20 }}>
                        <div style={{ fontFamily:'var(--display)', fontSize:40, letterSpacing:2, color:'var(--gold)', lineHeight:1 }}>{s.num}</div>
                        <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginTop:6 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-gold)', borderRadius:'var(--r-lg)', padding:24 }}>
                    <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--gold)', letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>Pro Tip</div>
                    <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6 }}>Posts with images get <strong style={{ color:'var(--text)' }}>3× more views</strong>. Upload screenshots, mockups, or photos of your work.</p>
                  </div>
                </div>
              )}

              {panel === 'posts' && (
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
                    <h2 style={{ fontFamily:'var(--display)', fontSize:32, letterSpacing:2 }}>MY POSTS</h2>
                    <button className="btn btn-gold btn-sm" onClick={() => setShowCreate(true)}>+ New Post</button>
                  </div>
                  {posts.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
                      <div style={{ fontSize:40, marginBottom:12, opacity:.3 }}>📭</div>
                      <div style={{ fontFamily:'var(--mono)', fontSize:11, textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>No posts yet</div>
                      <button className="btn btn-gold btn-sm" onClick={() => setShowCreate(true)}>Post Your First Work</button>
                    </div>
                  ) : (
                    <div className="dash-posts-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                      {posts.map(post => (
                        <div key={post.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', transition:'all .2s' }}>
                          <div style={{ height:140, background:'var(--bg-elevated)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {post.images[0]
                              ? <img src={post.images[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                              : <span style={{ fontSize:32 }}>{CATS[post.category]||'📦'}</span>
                            }
                          </div>
                          <div style={{ padding:14 }}>
                            <div style={{ fontSize:13, fontWeight:600, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{post.title}</div>
                            <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5, marginBottom:12 }}>{post.views} views</div>
                            <div style={{ display:'flex', gap:6 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => deletePost(post.id)}>Delete</button>
                              {post.link && <a href={post.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">↗ Link</a>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {panel === 'profile' && (
                <div>
                  <h2 style={{ fontFamily:'var(--display)', fontSize:32, letterSpacing:2, marginBottom:24 }}>PROFILE</h2>
                  <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:24, maxWidth:440 }}>
                    <div className="form-group">
                      <label className="form-label">Display Name</label>
                      <input
                        className="form-input"
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" value={user?.email || ''} disabled style={{ opacity:.5, cursor:'not-allowed' }} />
                      <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', marginTop:6 }}>
                        Email is tied to your sign-in method and can&apos;t be changed here.
                      </div>
                    </div>
                    <button
                      className="btn btn-gold btn-full"
                      onClick={saveProfile}
                      disabled={savingProfile || !profileName.trim()}
                      style={{ marginTop:8 }}
                    >
                      {savingProfile ? 'Saving...' : profileSaved ? '✓ Saved' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchMyPosts() }} />}
      <style>{`
        @media (max-width: 768px) {
          .dash-grid { grid-template-columns: 1fr !important; }
          .dash-posts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
