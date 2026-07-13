'use client'
import { Post } from '@/lib/db'

const CATS: Record<string, { label: string; icon: string }> = {
  dev:      { label:'Developer',  icon:'💻' },
  design:   { label:'Designer',   icon:'🎨' },
  engineer: { label:'Engineer',   icon:'⚙️' },
  video:    { label:'Video/Film', icon:'🎬' },
  '3d':     { label:'3D / Art',   icon:'🧊' },
  other:    { label:'Other',      icon:'✦'  },
}

function timeAgo(value: string | Date) {
  const diff = Date.now() - new Date(value).getTime()
  const m = Math.floor(diff/60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m/60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

export default function PostCard({ post, onContact }: { post: Post; onContact: (post: Post) => void }) {
  const cat = CATS[post.category] || CATS.other
  const initials = (post.authorName || 'U')[0].toUpperCase()

  const rateDisplay = post.rateType === 'open' ? 'Open to offers'
    : post.rateType === 'hide' ? 'Rate on request'
    : `${post.rate}/${post.rateType === 'hourly' ? 'hr' : 'project'}`

  const rateColor = post.rateType === 'open' ? 'var(--green)'
    : post.rateType === 'hide' ? 'var(--text-muted)'
    : 'var(--gold)'

  return (
    <div onClick={() => onContact(post)} style={{
      background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:'var(--r-lg)', overflow:'hidden', cursor:'pointer',
      transition:'all .25s var(--ease)', display:'flex', flexDirection:'column',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLElement
      el.style.borderColor = 'var(--border-gold)'
      el.style.transform = 'translateY(-3px)'
      el.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4)'
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement
      el.style.borderColor = 'var(--border)'
      el.style.transform = ''
      el.style.boxShadow = ''
    }}>
      {/* Image area */}
      <div style={{ height:200, background:'var(--bg-elevated)', position:'relative', overflow:'hidden', flexShrink:0 }}>
        {post.images[0]
          ? <img src={post.images[0]} alt={post.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, color:'var(--text-muted)' }}>
              <span style={{ fontSize:36 }}>{cat.icon}</span>
              <span style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:1, textTransform:'uppercase' }}>{cat.label}</span>
            </div>
        }
        <span className={`cat-${post.category}`} style={{ position:'absolute', top:12, left:12, fontFamily:'var(--mono)', fontSize:9, letterSpacing:1, textTransform:'uppercase', padding:'4px 10px', borderRadius:2, border:'1px solid' }}>
          {cat.icon} {cat.label}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding:20, flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--bg-elevated)', border:'1.5px solid var(--border-gold)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--display)', fontSize:14, color:'var(--gold)', flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{post.authorName}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5 }}>{post.authorRole}</div>
          </div>
          <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{timeAgo(post.createdAt)}</div>
        </div>

        <div style={{ fontSize:15, fontWeight:600, marginBottom:8, lineHeight:1.4, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>{post.title}</div>
        <div style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.6, flex:1, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden', marginBottom:16 }}>{post.description}</div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:14, borderTop:'1px solid var(--border)', marginTop:'auto' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:11, color:rateColor, fontWeight:700 }}>{rateDisplay}</span>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {post.link && (
              <a href={post.link} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ fontFamily:'var(--mono)', fontSize:9, textTransform:'uppercase', letterSpacing:.5, color:'var(--text-muted)', transition:'color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.color='var(--electric)')}
                onMouseLeave={e => (e.currentTarget.style.color='var(--text-muted)')}>
                ↗ View
              </a>
            )}
            <button onClick={e => { e.stopPropagation(); onContact(post) }}
              style={{ padding:'7px 14px', background:'var(--gold-dim)', border:'1px solid var(--border-gold)', borderRadius:'var(--r)', fontFamily:'var(--mono)', fontSize:9, letterSpacing:1, textTransform:'uppercase', color:'var(--gold)', cursor:'pointer', transition:'all .2s' }}>
              ✉ Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
