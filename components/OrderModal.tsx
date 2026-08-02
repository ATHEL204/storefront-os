'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface PackageOption {
  id: string
  tier: string
  title: string
  description: string
  price: number // cents
  deliveryDays: number
  revisions: number
}

interface Props {
  postTitle: string
  packages: PackageOption[]
  onClose: () => void
}

export default function OrderModal({ postTitle, packages, onClose }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [selected, setSelected] = useState(packages[0]?.id || '')
  const [requirements, setRequirements] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const chosen = packages.find(p => p.id === selected)

  async function handleCheckout() {
    if (!session) { router.push('/auth/login'); return }
    if (!chosen) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: chosen.id, requirements }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error)
      window.location.href = data.url // redirect to Stripe Checkout
    } catch (e: any) {
      setError(e.message || 'Could not start checkout')
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-top">
          <span className="modal-title">ORDER: {postTitle}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ display:'grid', gap:10, marginBottom:20 }}>
            {packages.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => setSelected(pkg.id)}
                style={{
                  border: `1.5px solid ${selected === pkg.id ? 'var(--gold)' : 'var(--border)'}`,
                  background: selected === pkg.id ? 'var(--gold-dim)' : 'var(--bg-elevated)',
                  borderRadius: 'var(--r-lg)', padding: 16, cursor: 'pointer', transition:'all .2s',
                }}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <div>
                    <div style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:1, textTransform:'uppercase', color:'var(--text-muted)' }}>{pkg.tier}</div>
                    <div style={{ fontSize:15, fontWeight:600 }}>{pkg.title}</div>
                  </div>
                  <div style={{ fontFamily:'var(--display)', fontSize:22, color:'var(--gold)' }}>${(pkg.price/100).toFixed(0)}</div>
                </div>
                <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.5, marginBottom:8 }}>{pkg.description}</p>
                <div style={{ display:'flex', gap:14, fontSize:11, color:'var(--text-muted)', fontFamily:'var(--mono)' }}>
                  <span>⏱ {pkg.deliveryDays}-day delivery</span>
                  <span>↻ {pkg.revisions} revision{pkg.revisions !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Project details (optional)</label>
            <textarea
              className="form-input"
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              placeholder="Tell the seller what you need — links, brand assets, deadlines, anything they should know before starting."
              rows={3}
              style={{ resize:'vertical' }}
            />
          </div>

          {error && <div style={{ padding:'10px 14px', background:'rgba(255,59,92,0.08)', border:'1px solid rgba(255,59,92,0.2)', borderRadius:'var(--r)', color:'var(--red)', fontSize:13, marginBottom:14 }}>{error}</div>}

          <button className="btn btn-gold btn-full btn-lg" onClick={handleCheckout} disabled={loading || !chosen}>
            {loading ? 'Redirecting to checkout...' : chosen ? `Continue to Payment — $${(chosen.price/100).toFixed(0)} →` : 'Select a package'}
          </button>
          <div style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)', marginTop:10, fontFamily:'var(--mono)' }}>
            🔒 Secure payment via Stripe
          </div>
        </div>
      </div>
    </div>
  )
}
