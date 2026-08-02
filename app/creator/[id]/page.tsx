'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import PostCard from '@/components/PostCard'
import ContactModal from '@/components/ContactModal'
import OrderModal from '@/components/OrderModal'
import { getSellerLevel, formatRating } from '@/lib/sellerLevel'

export default function CreatorProfile() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [contactPost, setContactPost] = useState<any>(null)
  const [orderPost, setOrderPost] = useState<any>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true); setError('')
      try {
        const res = await fetch(`/api/creators/${id}`)
        const json = await res.json()
        if (!json.ok) throw new Error(json.error)
        if (!cancelled) setData(json.data)
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Could not load this profile')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  if (loading) {
    return (
      <>
        <Nav />
        <div style={{ paddingTop:64, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:1 }}>LOADING...</div>
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        <Nav />
        <div style={{ paddingTop:64, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
          <div style={{ fontSize:40, opacity:.3 }}>⚠️</div>
          <div style={{ color:'var(--text-dim)', fontSize:14 }}>{error || 'Creator not found'}</div>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/')}>← Back to browse</button>
        </div>
      </>
    )
  }

  const level = getSellerLevel(data.completedOrders, data.avgRating)
  const initials = (data.name || 'U')[0].toUpperCase()
  const memberSince = new Date(data.createdAt).toLocaleDateString('en-US', { month:'long', year:'numeric' })

  return (
    <>
      <Nav onPostClick={() => {}} />
      <div style={{ paddingTop:64, minHeight:'100vh', background:'var(--bg)' }}>
        <div className="container" style={{ maxWidth:1000, padding:'48px 20px 80px' }}>

          {/* Header */}
          <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap', marginBottom:40, paddingBottom:32, borderBottom:'1px solid var(--border)' }}>
            {data.image
              ? <img src={data.image} alt={data.name} style={{ width:88, height:88, borderRadius:'50%', border:'2px solid var(--border-gold)', objectFit:'cover' }} />
              : <div style={{ width:88, height:88, borderRadius:'50%', border:'2px solid var(--border-gold)', background:'var(--bg-elevated)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:32, color:'var(--gold)' }}>{initials}</div>
            }
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
                <h1 style={{ fontFamily:'var(--display)', fontSize:32, letterSpacing:1 }}>{data.name}</h1>
                <span style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:1, textTransform:'uppercase', padding:'4px 10px', borderRadius:2, border:`1px solid ${level.color}`, color:level.color }}>
                  {level.label}
                </span>
              </div>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:13, color:'var(--text-dim)' }}>
                <span>★ {formatRating(data.avgRating, data.reviewCount)}</span>
                <span>· {data.completedOrders} order{data.completedOrders !== 1 ? 's' : ''} completed</span>
                <span>· Member since {memberSince}</span>
              </div>
            </div>
          </div>

          {/* Gigs */}
          <section style={{ marginBottom:48 }}>
            <h2 style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:16 }}>
              {data.posts.length} Gig{data.posts.length !== 1 ? 's' : ''}
            </h2>
            {data.posts.length === 0 ? (
              <div style={{ color:'var(--text-muted)', fontSize:13, padding:'20px 0' }}>No posts yet.</div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
                {data.posts.map((post: any) => (
                  <PostCard key={post.id} post={post} onContact={setContactPost} onOrder={setOrderPost} />
                ))}
              </div>
            )}
          </section>

          {/* Reviews */}
          <section>
            <h2 style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:2, textTransform:'uppercase', color:'var(--text-muted)', marginBottom:16 }}>
              {data.reviewCount} Review{data.reviewCount !== 1 ? 's' : ''}
            </h2>
            {data.reviews.length === 0 ? (
              <div style={{ color:'var(--text-muted)', fontSize:13, padding:'20px 0' }}>No reviews yet — be the first to hire and review this creator.</div>
            ) : (
              <div style={{ display:'grid', gap:12 }}>
                {data.reviews.map((r: any) => (
                  <div key={r.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:18 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{r.authorName}</div>
                      <div style={{ color:'var(--gold)', fontSize:13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                    </div>
                    <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', marginBottom:8 }}>on {r.postTitle}</div>
                    {r.comment && <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6 }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      {contactPost && <ContactModal post={contactPost} onClose={() => setContactPost(null)} />}
      {orderPost && orderPost.packages && (
        <OrderModal postTitle={orderPost.title} packages={orderPost.packages} onClose={() => setOrderPost(null)} />
      )}
    </>
  )
}
