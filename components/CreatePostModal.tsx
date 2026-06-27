'use client'
import { useState, useRef } from 'react'

const CATS = [
  { id:'dev', label:'Developer', icon:'💻' },
  { id:'design', label:'Designer', icon:'🎨' },
  { id:'engineer', label:'Engineer', icon:'⚙️' },
  { id:'video', label:'Video/Film', icon:'🎬' },
  { id:'3d', label:'3D / Art', icon:'🧊' },
  { id:'other', label:'Other', icon:'✦' },
]

interface Props { onClose: () => void; onSuccess: () => void }

export default function CreatePostModal({ onClose, onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [link, setLink] = useState('')
  const [rate, setRate] = useState('')
  const [rateType, setRateType] = useState<'hourly'|'project'|'open'|'hide'>('hourly')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const remaining = 4 - images.length
    Array.from(files).slice(0, remaining).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = e => setImages(prev => [...prev, e.target!.result as string])
      reader.readAsDataURL(file)
    })
  }

  async function handleSubmit() {
    if (!title.trim()) { setError('Please add a title'); return }
    if (!category) { setError('Please select a category'); return }
    if (!description.trim()) { setError('Please add a description'); return }

    setLoading(true); setError('')
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, images, link, rate, rateType }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error)
      onSuccess()
    } catch (e: any) {
      setError(e.message || 'Failed to post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-top">
          <span className="modal-title">POST WORK</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {CATS.map(c => (
                <div key={c.id} onClick={() => setCategory(c.id)}
                  style={{ padding:12, border:`1px solid ${category===c.id?'var(--gold)':'var(--border)'}`, borderRadius:'var(--r)', textAlign:'center', cursor:'pointer', background:category===c.id?'var(--gold-dim)':'var(--bg-elevated)', transition:'all .2s' }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{c.icon}</div>
                  <div style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:1, textTransform:'uppercase', color:category===c.id?'var(--gold)':'var(--text-dim)' }}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Full-Stack Web App, Brand Identity Package..." />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-input" value={description} onChange={e=>setDescription(e.target.value)} placeholder="What did you build? Technologies used, results achieved..." rows={4} style={{ resize:'vertical', minHeight:90 }} />
          </div>

          {/* Images */}
          <div className="form-group">
            <label className="form-label">Images (up to 4)</label>
            <div onClick={() => fileRef.current?.click()}
              style={{ border:'1.5px dashed var(--border)', borderRadius:'var(--r-lg)', padding:28, textAlign:'center', cursor:'pointer', background:'var(--bg-elevated)', transition:'all .2s' }}
              onMouseEnter={e=>(e.currentTarget.style.borderColor='var(--border-gold)')}
              onMouseLeave={e=>(e.currentTarget.style.borderColor='var(--border)')}>
              <div style={{ fontSize:28, marginBottom:6 }}>📸</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', letterSpacing:1, textTransform:'uppercase' }}>Drop images or click to upload</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>PNG, JPG · Max 4 images</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={e=>handleFiles(e.target.files)} />
            {images.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginTop:10 }}>
                {images.map((src, i) => (
                  <div key={i} style={{ aspectRatio:'1', borderRadius:'var(--r)', overflow:'hidden', position:'relative' }}>
                    <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    <button onClick={() => setImages(prev=>prev.filter((_,j)=>j!==i))}
                      style={{ position:'absolute', top:4, right:4, width:20, height:20, background:'rgba(0,0,0,.7)', border:'none', borderRadius:'50%', color:'#fff', fontSize:10, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Link */}
          <div className="form-group">
            <label className="form-label">Work Link (GitHub, Behance, Live URL...)</label>
            <input className="form-input" value={link} onChange={e=>setLink(e.target.value)} placeholder="https://github.com/yourname/project" type="url" />
          </div>

          {/* Rate */}
          <div className="form-group">
            <label className="form-label">Rate Type</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
              {(['hourly','project','open','hide'] as const).map(rt => (
                <button key={rt} onClick={() => setRateType(rt)}
                  style={{ padding:'7px 14px', border:`1px solid ${rateType===rt?'var(--gold)':'var(--border)'}`, borderRadius:'var(--r)', fontFamily:'var(--mono)', fontSize:10, textTransform:'uppercase', letterSpacing:.5, color:rateType===rt?'var(--gold)':'var(--text-dim)', background:rateType===rt?'var(--gold-dim)':'var(--bg-elevated)', cursor:'pointer', transition:'all .2s' }}>
                  {rt === 'hourly' ? 'Hourly' : rt === 'project' ? 'Per Project' : rt === 'open' ? 'Open to Offers' : "Don't Show"}
                </button>
              ))}
            </div>
            {!['open','hide'].includes(rateType) && (
              <input className="form-input" value={rate} onChange={e=>setRate(e.target.value)} placeholder="e.g. $50" />
            )}
          </div>

          {error && <div style={{ padding:'10px 14px', background:'rgba(255,59,92,0.08)', border:'1px solid rgba(255,59,92,0.2)', borderRadius:'var(--r)', color:'var(--red)', fontSize:13, marginBottom:14 }}>{error}</div>}

          <button className="btn btn-gold btn-full btn-lg" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Post →'}
          </button>
        </div>
      </div>
    </div>
  )
}
