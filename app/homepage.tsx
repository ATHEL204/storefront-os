'use client'
import { useState, useEffect, useCallback } from 'react'
import Nav from '@/components/Nav'
import PostCard from '@/components/PostCard'
import CreatePostModal from '@/components/CreatePostModal'
import ContactModal from '@/components/ContactModal'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import ErrorState from '@/components/ErrorState'
import { Post } from '@/lib/db'

const CATS = [
  { id:'all',      label:'All Work',   icon:'✦' },
  { id:'dev',      label:'Developer',  icon:'💻' },
  { id:'design',   label:'Designer',   icon:'🎨' },
  { id:'engineer', label:'Engineer',   icon:'⚙️' },
  { id:'video',    label:'Video/Film', icon:'🎬' },
  { id:'3d',       label:'3D / Art',   icon:'🧊' },
  { id:'other',    label:'Other',      icon:'✦' },
]
export default function Home() {
  const [allPosts, setAllPosts] = useState<Post[]>([])
  const [stats, setStats] = useState({ totalPosts:0, totalCreators:0, totalCategories:0 })
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [contactPost, setContactPost] = useState<Post|null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchPosts = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/posts')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      if (data.ok) { setAllPosts(data.data); setStats(data.stats || { totalPosts: data.data.length, totalCreators: 0, totalCategories: 0 }) }
    } catch (e) {
      setError('Could not load posts. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // Filter + search locally
  const posts = allPosts.filter(p => {
    const matchCat = filter === 'all' || p.category === filter
    const q = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  function handleContact(post: Post) {
    // Increment view count
    fetch(`/api/posts/${post.id}`, { method:'PATCH' }).catch(() => {})
    setContactPost(post)
  }

  return (
    <>
      <Nav onPostClick={() => setShowCreate(true)} />
      <main style={{ paddingTop:64 }}>

        {/* ── HERO ─────────────────────── */}
        <section style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'120px 40px 80px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:800, height:800, background:'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', pointerEvents:'none' }} />

          <div className="fade-up" style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:'var(--mono)', fontSize:10, color:'var(--green)', letterSpacing:2, textTransform:'uppercase', border:'1px solid rgba(0,255,136,0.2)', padding:'6px 14px', borderRadius:2, background:'rgba(0,255,136,0.06)', marginBottom:32 }}>
            <span className="live-dot" /> Live Platform · Professionals Welcome
          </div>

          <h1 className="fade-up fade-up-delay-1" style={{ fontFamily:'var(--display)', fontSize:'clamp(72px,11vw,140px)', lineHeight:.85, letterSpacing:4 }}>SHOW YOUR</h1>
          <div className="fade-up fade-up-delay-1" style={{ fontFamily:'var(--serif)', fontSize:'clamp(56px,9vw,112px)', fontStyle:'italic', fontWeight:300, color:'var(--gold)', letterSpacing:2 }}>Work.</div>
          <h1 className="fade-up fade-up-delay-1" style={{ fontFamily:'var(--display)', fontSize:'clamp(72px,11vw,140px)', lineHeight:.85, letterSpacing:4, marginBottom:28 }}>GET HIRED.</h1>

          <p className="fade-up fade-up-delay-2" style={{ color:'var(--text-dim)', fontSize:16, lineHeight:1.7, maxWidth:520, marginBottom:40 }}>
            The portfolio platform for developers, designers, engineers, videographers and creators. Post your work. Share your links. Let the world find you.
          </p>

          <div className="fade-up fade-up-delay-2" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-gold btn-lg" onClick={() => setShowCreate(true)}>✦ Post Your Work</button>
            <a href="#explore" className="btn btn-outline btn-lg">Browse Creators →</a>
          </div>

          {/* Stats */}
          <div className="fade-up fade-up-delay-3" style={{ display:'flex', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', background:'var(--bg-card)', marginTop:64, maxWidth:600, width:'100%' }}>
            {[
              { num: stats.totalPosts || allPosts.length, label:'Posts' },
              { num: stats.totalCreators, label:'Creators' },
              { num: stats.totalCategories, label:'Categories' },
              { num:'∞', label:'Opportunities' },
            ].map((s, i, arr) => (
              <div key={s.label} style={{ flex:1, padding:'20px 24px', textAlign:'center', borderRight:i<arr.length-1?'1px solid var(--border)':'none' }}>
                <div style={{ fontFamily:'var(--display)', fontSize:36, letterSpacing:2, color:'var(--gold)', lineHeight:1 }}>{s.num}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', marginTop:6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EXPLORE ──────────────────── */}
        <section id="explore" style={{ padding:'80px 0' }}>
          <div className="container">
            <div className="section-label">Live Feed</div>
            <h2 style={{ fontFamily:'var(--display)', fontSize:'clamp(48px,6vw,80px)', lineHeight:.9, letterSpacing:2, marginBottom:4 }}>
              BROWSE <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300, color:'var(--gold)' }}>Talent</span>
            </h2>
            <p style={{ color:'var(--text-dim)', fontSize:14, marginBottom:20 }}>Click any card to contact the creator. No account needed to browse.</p>

            {/* Search */}
            <div style={{ position:'relative', marginBottom:4 }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)', fontSize:14, pointerEvents:'none' }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title, skill, or creator name..."
                style={{ width:'100%', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'11px 14px 11px 40px', color:'var(--text)', fontFamily:'var(--body)', fontSize:14, outline:'none', transition:'border-color .2s' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:16 }}>✕</button>
              )}
            </div>

            {/* Filter bar */}
            <div style={{ display:'flex', gap:8, padding:'16px 0 8px', overflowX:'auto', flexWrap:'wrap' }}>
              {CATS.map(c => {
                const count = c.id === 'all' ? allPosts.length : allPosts.filter(p => p.category === c.id).length
                const active = filter === c.id
                return (
                  <button key={c.id} onClick={() => setFilter(c.id)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', background:active?'var(--gold-dim)':'var(--bg-card)', border:`1px solid ${active?'var(--gold)':'var(--border)'}`, borderRadius:2, fontFamily:'var(--mono)', fontSize:10, letterSpacing:.5, textTransform:'uppercase', color:active?'var(--gold)':'var(--text-dim)', cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s' }}>
                    {c.icon} {c.label}
                    <span style={{ background:'var(--bg-elevated)', padding:'1px 6px', borderRadius:2, fontSize:9, color:active?'var(--gold)':'var(--text-muted)' }}>{count}</span>
                  </button>
                )
              })}
            </div>

            {/* Results label */}
            {(search || filter !== 'all') && !loading && (
              <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', marginBottom:12, letterSpacing:.5 }}>
                {posts.length} result{posts.length !== 1 ? 's' : ''}{search ? ` for "${search}"` : ''}{filter !== 'all' ? ` in ${CATS.find(c=>c.id===filter)?.label}` : ''}
              </div>
            )}

            {/* Grid */}
            {loading ? <LoadingSkeleton /> : error ? (
              <div style={{ display:'grid' }}><ErrorState message={error} onRetry={fetchPosts} /></div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign:'center', padding:'80px 0' }}>
                <div style={{ fontSize:48, opacity:.3, marginBottom:16 }}>📭</div>
                <h3 style={{ fontFamily:'var(--display)', fontSize:28, letterSpacing:2, marginBottom:8, color:'var(--text-dim)' }}>NO RESULTS</h3>
                <p style={{ color:'var(--text-muted)', fontSize:13, marginBottom:20 }}>
                  {search ? `No posts match "${search}"` : 'No posts in this category yet.'}
                </p>
                {search && <button className="btn btn-ghost" onClick={() => setSearch('')}>Clear search</button>}
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20, marginTop:8 }}>
                {posts.map(post => <PostCard key={post.id} post={post} onContact={handleContact} />)}
              </div>
            )}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────── */}
        <section style={{ background:'var(--bg-2)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'80px 0' }}>
          <div className="container">
            <div className="section-label">The Process</div>
            <h2 style={{ fontFamily:'var(--display)', fontSize:'clamp(48px,6vw,80px)', lineHeight:.9, letterSpacing:2, marginBottom:48 }}>
              HOW IT <span style={{ fontFamily:'var(--serif)', fontStyle:'italic', fontWeight:300, color:'var(--gold)' }}>Works</span>
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20 }}>
              {[
                { icon:'🔐', step:'01', title:'SIGN UP FREE', desc:'Create your account with Google or email in under 60 seconds. No subscription needed.' },
                { icon:'📸', step:'02', title:'POST YOUR WORK', desc:'Upload images, add a portfolio link, write a description, and set your rate.' },
                { icon:'🌍', step:'03', title:'GET DISCOVERED', desc:'Anyone can browse your work publicly. Logged-in users can contact and hire you.' },
                { icon:'💬', step:'04', title:'GET HIRED', desc:'Clients browse, find the right talent, send a message, and close the deal.' },
              ].map(item => (
                <div key={item.step} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:28 }}>
                  <div style={{ fontSize:32, marginBottom:16 }}>{item.icon}</div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--electric)', letterSpacing:2, textTransform:'uppercase', marginBottom:8 }}>Step {item.step}</div>
                  <h3 style={{ fontFamily:'var(--display)', fontSize:22, letterSpacing:1, marginBottom:8 }}>{item.title}</h3>
                  <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────── */}
        <div style={{ background:'linear-gradient(135deg,var(--bg-2),#0d1420)', borderTop:'1px solid var(--border-gold)', padding:'80px 40px', textAlign:'center' }}>
          <div className="section-label" style={{ justifyContent:'center' }}>Join the Platform</div>
          <h2 style={{ fontFamily:'var(--serif)', fontSize:'clamp(24px,4vw,42px)', fontStyle:'italic', fontWeight:300, maxWidth:600, margin:'0 auto 16px' }}>
            Ready to put your <strong style={{ color:'var(--gold)', fontStyle:'normal', fontWeight:600 }}>work in front of clients?</strong>
          </h2>
          <p style={{ color:'var(--text-dim)', fontSize:14, maxWidth:440, margin:'0 auto 32px', lineHeight:1.7 }}>
            Free to join. Free to post. Your talent is the product — STOREFRONT OS is just the stage.
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:12, flexWrap:'wrap' }}>
            <button className="btn btn-gold btn-lg" onClick={() => setShowCreate(true)}>✦ Post Your Work</button>
            <a href="https://github.com/ATHEL204" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">GitHub · ATHEL204</a>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ background:'var(--bg)', borderTop:'1px solid var(--border)', padding:'32px 40px' }}>
          <div style={{ maxWidth:1300, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
            <div style={{ fontFamily:'var(--display)', fontSize:18, letterSpacing:3, color:'var(--gold)' }}>STOREFRONT OS</div>
            <div style={{ display:'flex', gap:20 }}>
              {[['#explore','Explore'],['#','About'],['https://github.com/ATHEL204','GitHub']].map(([href,label]) => (
                <a key={label} href={href} style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5 }}>{label}</a>
              ))}
            </div>
            <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)' }}>© 2026 ATHEL204 · Built for creators</div>
          </div>
        </footer>
      </main>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); fetchPosts() }} />}
      {contactPost && <ContactModal post={contactPost} onClose={() => setContactPost(null)} />}
    </>
  )
}
