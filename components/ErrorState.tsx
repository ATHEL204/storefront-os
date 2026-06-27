interface Props { message?: string; onRetry?: () => void }

export default function ErrorState({ message = 'Something went wrong', onRetry }: Props) {
  return (
    <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'80px 20px' }}>
      <div style={{ fontSize:48, marginBottom:16, opacity:.4 }}>⚠</div>
      <h3 style={{ fontFamily:'var(--display)', fontSize:24, letterSpacing:2, marginBottom:8, color:'var(--text-dim)' }}>FAILED TO LOAD</h3>
      <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:24 }}>{message}</p>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry}>Try Again</button>
      )}
    </div>
  )
}
