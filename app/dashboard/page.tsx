'use client'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import CreatePostModal from '@/components/CreatePostModal'
import { Post, Order } from '@/lib/db'
import { getSellerLevel, formatRating } from '@/lib/sellerLevel'
import Image from 'next/image'
import Link from 'next/link'

type OrderWithRelations = Order & { post: Post; package: any; buyer?: any; seller?: any; review?: any }

export default function Dashboard() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [panel, setPanel] = useState('overview')
  const [showCreate, setShowCreate] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [ordersAs, setOrdersAs] = useState<'buyer'|'seller'>('buyer')
  const [buyerOrders, setBuyerOrders] = useState<OrderWithRelations[]>([])
  const [sellerOrders, setSellerOrders] = useState<OrderWithRelations[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersLoadedOnce, setOrdersLoadedOnce] = useState(false)
  const [reviewingOrderId, setReviewingOrderId] = useState<string|null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [profileStats, setProfileStats] = useState<{ avgRating: number|null; reviewCount: number; completedOrders: number } | null>(null)

  const orders = ordersAs === 'buyer' ? buyerOrders : sellerOrders

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchMyPosts()
      fetchOrders('buyer')
      fetchOrders('seller')
      fetchProfileStats()
    }
    if (session?.user?.name) setProfileName(session.user.name)
  }, [session])

  async function fetchProfileStats() {
    const userId = (session?.user as any)?.id
    if (!userId) return
    try {
      const res = await fetch(`/api/creators/${userId}`)
      const data = await res.json()
      if (data.ok) setProfileStats({ avgRating: data.data.avgRating, reviewCount: data.data.reviewCount, completedOrders: data.data.completedOrders })
    } catch {}
  }

  async function saveProfile() {
    if (!profileName.trim()) return
    setSavingProfile(true); setProfileSaved(false)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName.trim() }),
      })
      const data = await res.json()
      if (data.ok) {
        setProfileSaved(true)
        await update()
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

  async function fetchOrders(as: 'buyer'|'seller') {
    setOrdersLoading(true)
    try {
      const res = await fetch(`/api/orders?as=${as}`)
      const data = await res.json()
      if (data.ok) {
        if (as === 'buyer') setBuyerOrders(data.data)
        else setSellerOrders(data.data)
      }
    } finally {
      setOrdersLoading(false)
      setOrdersLoadedOnce(true)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string, note?: string) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note }),
    })
    const data = await res.json()
    if (data.ok) { fetchOrders(ordersAs); fetchProfileStats() }
    else alert(data.error || 'Could not update order')
  }

  async function submitReview(orderId: string) {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, rating: reviewRating, comment: reviewComment }),
    })
    const data = await res.json()
    if (data.ok) {
      setReviewingOrderId(null); setReviewComment(''); setReviewRating(5)
      fetchOrders('buyer')
    } else {
      alert(data.error || 'Could not submit review')
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

  const earnings = sellerOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.price, 0) / 100
  const pendingSellerOrders = sellerOrders.filter(o => ['pending','in_progress'].includes(o.status)).length
  const level = getSellerLevel(profileStats?.completedOrders ?? 0, profileStats?.avgRating ?? null)
  const recentActivity = [...buyerOrders, ...sellerOrders]
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  function EmptyState({ icon, message, action }: { icon: string; message: string; action?: React.ReactNode }) {
    return (
      <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
        <div style={{ fontSize:40, marginBottom:12, opacity:.3 }}>{icon}</div>
        <div style={{ fontFamily:'var(--mono)', fontSize:11, textTransform:'uppercase', letterSpacing:1, marginBottom: action ? 16 : 0 }}>{message}</div>
        {action}
      </div>
    )
  }

  return (
    <>
      <Nav onPostClick={() => setShowCreate(true)} />
      <div style={{ paddingTop:64, minHeight:'100vh' }}>
        <div className="container">
          <div className="dash-grid" style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:32, padding:'40px 0 80px' }}>

            {/* Sidebar */}
            <div style={{ position:'sticky', top:88, height:'fit-content' }}>
              <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:24, textAlign:'center', marginBottom:16 }}>
                <Link href={`/creator/${(user as any)?.id}`}>
                  {user?.image
                    ? <Image src={user.image} alt="avatar" width={64} height={64} style={{ borderRadius:'50%', margin:'0 auto 12px', border:'2px solid var(--border-gold)' }} />
                    : <div style={{ width:64, height:64, borderRadius:'50%', margin:'0 auto 12px', border:'2px solid var(--border-gold)', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:24, color:'var(--gold)' }}>{(user?.name||'U')[0].toUpperCase()}</div>
                  }
                </Link>
                <div style={{ fontSize:15, fontWeight:600, marginBottom:2 }}>{user?.name}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', marginBottom:8 }}>{user?.email}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'center' }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', background:'rgba(0,255,136,0.08)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:2, fontFamily:'var(--mono)', fontSize:9, color:'var(--green)', textTransform:'uppercase', letterSpacing:1 }}>● Verified</div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 8px', background:'var(--bg-elevated)', border:`1px solid ${level.color}`, borderRadius:2, fontFamily:'var(--mono)', fontSize:9, color:level.color, textTransform:'uppercase', letterSpacing:1 }}>
                    {level.label}
                  </div>
                  {profileStats && (
                    <div style={{ fontSize:11, color:'var(--text-dim)' }}>★ {formatRating(profileStats.avgRating, profileStats.reviewCount)}</div>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {[
                  { id:'overview', icon:'📊', label:'Overview' },
                  { id:'posts', icon:'📁', label:'My Posts' },
                  { id:'orders', icon:'🛒', label:'Orders', badge: pendingSellerOrders > 0 ? pendingSellerOrders : undefined },
                  { id:'profile', icon:'👤', label:'Profile' },
                ].map(item => (
                  <button key={item.id} onClick={() => setPanel(item.id)}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:'var(--r)', fontFamily:'var(--mono)', fontSize:10, letterSpacing:.5, textTransform:'uppercase', color:panel===item.id?'var(--gold)':'var(--text-dim)', background:panel===item.id?'var(--gold-dim)':'none', border:panel===item.id?'1px solid var(--border-gold)':'1px solid transparent', cursor:'pointer', transition:'all .2s', textAlign:'left' }}>
                    <span>{item.icon}</span>{item.label}
                    {item.badge && <span style={{ marginLeft:'auto', background:'var(--gold)', color:'#1A1815', borderRadius:10, padding:'1px 7px', fontSize:9, fontWeight:700 }}>{item.badge}</span>}
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

                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }} className="overview-stats-grid">
                    {[
                      { num: `$${earnings.toFixed(0)}`, label:'Total Earnings', accent:'var(--green)' },
                      { num: posts.length, label:'Your Posts', accent:'var(--gold)' },
                      { num: posts.reduce((s,p)=>s+p.views,0), label:'Total Views', accent:'var(--gold)' },
                      { num: profileStats?.avgRating ? profileStats.avgRating.toFixed(1) : '—', label:`Rating (${profileStats?.reviewCount || 0})`, accent:'var(--electric)' },
                    ].map(s => (
                      <div key={s.label} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:20 }}>
                        <div style={{ fontFamily:'var(--display)', fontSize:34, letterSpacing:1, color:s.accent, lineHeight:1 }}>{s.num}</div>
                        <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:1, marginTop:6 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Recent activity */}
                  <div style={{ marginBottom:24 }}>
                    <h3 style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:12 }}>Recent Activity</h3>
                    {ordersLoading && !ordersLoadedOnce ? (
                      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:20, color:'var(--text-muted)', fontFamily:'var(--mono)', fontSize:11 }}>LOADING...</div>
                    ) : recentActivity.length === 0 ? (
                      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:20, color:'var(--text-muted)', fontSize:13 }}>
                        No orders yet. Sell a gig or hire someone to see activity here.
                      </div>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {recentActivity.map(o => {
                          const asSeller = sellerOrders.some(so => so.id === o.id)
                          return (
                            <div key={o.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                              <div style={{ minWidth:0 }}>
                                <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{o.post?.title}</div>
                                <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5 }}>
                                  {asSeller ? 'Sold' : 'Bought'} · {o.status.replace('_',' ')}
                                </div>
                              </div>
                              <div style={{ fontFamily:'var(--display)', fontSize:16, color:'var(--gold)', flexShrink:0 }}>${(o.price/100).toFixed(0)}</div>
                            </div>
                          )
                        })}
                      </div>
                    )}
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
                    <EmptyState icon="📭" message="No posts yet" action={<button className="btn btn-gold btn-sm" onClick={() => setShowCreate(true)}>Post Your First Work</button>} />
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

              {panel === 'orders' && (
                <div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
                    <h2 style={{ fontFamily:'var(--display)', fontSize:32, letterSpacing:2 }}>ORDERS</h2>
                    <div style={{ display:'flex', gap:6, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:4 }}>
                      {(['buyer','seller'] as const).map(tab => (
                        <button key={tab} onClick={() => setOrdersAs(tab)}
                          style={{ padding:'7px 16px', borderRadius:'var(--r)', border:'none', fontFamily:'var(--mono)', fontSize:10, letterSpacing:.5, textTransform:'uppercase', cursor:'pointer', background:ordersAs===tab?'var(--gold)':'transparent', color:ordersAs===tab?'#1A1815':'var(--text-dim)', fontWeight:ordersAs===tab?700:400 }}>
                          {tab === 'buyer' ? 'As Buyer' : 'As Seller'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {ordersLoading && !ordersLoadedOnce ? (
                    <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-muted)', fontFamily:'var(--mono)', fontSize:11 }}>LOADING...</div>
                  ) : orders.length === 0 ? (
                    <EmptyState icon="🛒" message={`No orders ${ordersAs === 'buyer' ? 'placed' : 'received'} yet`} />
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      {orders.map(order => {
                        const counterparty = ordersAs === 'buyer' ? order.seller : order.buyer
                        const STATUS_COLORS: Record<string,string> = {
                          pending:'var(--text-muted)', in_progress:'var(--electric)', delivered:'var(--gold)',
                          completed:'var(--green)', cancelled:'var(--red)', disputed:'var(--red)',
                        }
                        return (
                          <div key={order.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:20 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12, flexWrap:'wrap', gap:8 }}>
                              <div>
                                <div style={{ fontSize:15, fontWeight:600, marginBottom:4 }}>{order.post?.title}</div>
                                <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text-muted)' }}>
                                  {ordersAs === 'buyer' ? 'Seller' : 'Buyer'}: {counterparty?.name || counterparty?.email} · {order.tier} package
                                </div>
                              </div>
                              <div style={{ textAlign:'right' }}>
                                <div style={{ fontFamily:'var(--display)', fontSize:20, color:'var(--gold)' }}>${(order.price/100).toFixed(0)}</div>
                                <div style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:1, textTransform:'uppercase', color:STATUS_COLORS[order.status] || 'var(--text-muted)' }}>
                                  ● {order.status.replace('_',' ')}
                                </div>
                              </div>
                            </div>

                            {order.requirements && (
                              <div style={{ fontSize:13, color:'var(--text-dim)', background:'var(--bg-elevated)', borderRadius:'var(--r)', padding:12, marginBottom:12 }}>
                                <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5 }}>Requirements: </span>
                                {order.requirements}
                              </div>
                            )}

                            {ordersAs === 'seller' && order.status === 'pending' && (
                              <button className="btn btn-gold btn-sm" onClick={() => updateOrderStatus(order.id, 'in_progress')}>Start Work</button>
                            )}
                            {ordersAs === 'seller' && order.status === 'in_progress' && (
                              <button className="btn btn-gold btn-sm" onClick={() => updateOrderStatus(order.id, 'delivered')}>Mark as Delivered</button>
                            )}

                            {ordersAs === 'buyer' && order.status === 'delivered' && (
                              <div style={{ display:'flex', gap:8 }}>
                                <button className="btn btn-gold btn-sm" onClick={() => updateOrderStatus(order.id, 'completed')}>Accept Delivery</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => updateOrderStatus(order.id, 'in_progress')}>Request Revision</button>
                              </div>
                            )}
                            {ordersAs === 'buyer' && order.status === 'completed' && !order.review && (
                              reviewingOrderId === order.id ? (
                                <div style={{ marginTop:8 }}>
                                  <div style={{ display:'flex', gap:4, marginBottom:8 }}>
                                    {[1,2,3,4,5].map(n => (
                                      <button key={n} onClick={() => setReviewRating(n)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', opacity: n <= reviewRating ? 1 : 0.3 }}>★</button>
                                    ))}
                                  </div>
                                  <textarea className="form-input" value={reviewComment} onChange={e=>setReviewComment(e.target.value)} placeholder="How was your experience?" rows={2} style={{ resize:'vertical', marginBottom:8 }} />
                                  <div style={{ display:'flex', gap:8 }}>
                                    <button className="btn btn-gold btn-sm" onClick={() => submitReview(order.id)}>Submit Review</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setReviewingOrderId(null)}>Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <button className="btn btn-outline btn-sm" onClick={() => setReviewingOrderId(order.id)}>★ Leave a Review</button>
                              )
                            )}
                            {order.review && (
                              <div style={{ fontSize:12, color:'var(--text-dim)', marginTop:4 }}>
                                {'★'.repeat(order.review.rating)}{'☆'.repeat(5-order.review.rating)} — you reviewed this order
                              </div>
                            )}
                          </div>
                        )
                      })}
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
                      <input className="form-input" value={profileName} onChange={e => setProfileName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" value={user?.email || ''} disabled style={{ opacity:.5, cursor:'not-allowed' }} />
                      <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', marginTop:6 }}>
                        Email is tied to your sign-in method and can&apos;t be changed here.
                      </div>
                    </div>
                    <button className="btn btn-gold btn-full" onClick={saveProfile} disabled={savingProfile || !profileName.trim()} style={{ marginTop:8 }}>
                      {savingProfile ? 'Saving...' : profileSaved ? '✓ Saved' : 'Save Changes'}
                    </button>
                  </div>
                  <div style={{ marginTop:16 }}>
                    <Link href={`/creator/${(user as any)?.id}`} className="btn btn-outline btn-sm">View my public profile →</Link>
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
          .overview-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  )
}
