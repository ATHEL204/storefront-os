export default function LoadingSkeleton() {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:20, marginTop:8 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', animation:'skeleton-pulse 1.5s ease-in-out infinite', animationDelay:`${i * 0.1}s` }}>
          <div style={{ height:200, background:'var(--bg-elevated)' }} />
          <div style={{ padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--bg-elevated)' }} />
              <div style={{ flex:1 }}>
                <div style={{ height:12, background:'var(--bg-elevated)', borderRadius:4, marginBottom:6, width:'60%' }} />
                <div style={{ height:9, background:'var(--bg-elevated)', borderRadius:4, width:'40%' }} />
              </div>
            </div>
            <div style={{ height:15, background:'var(--bg-elevated)', borderRadius:4, marginBottom:8 }} />
            <div style={{ height:13, background:'var(--bg-elevated)', borderRadius:4, marginBottom:6, width:'80%' }} />
            <div style={{ height:13, background:'var(--bg-elevated)', borderRadius:4, width:'65%', marginBottom:16 }} />
            <div style={{ height:1, background:'var(--border)', marginBottom:14 }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ height:11, background:'var(--bg-elevated)', borderRadius:4, width:'25%' }} />
              <div style={{ height:30, background:'var(--bg-elevated)', borderRadius:'var(--r)', width:'30%' }} />
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
