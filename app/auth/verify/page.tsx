export default function VerifyPage() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ textAlign:'center', padding:40 }}>
        <div style={{ fontSize:48, marginBottom:20 }}>📬</div>
        <h1 style={{ fontFamily:'var(--display)', fontSize:36, letterSpacing:2, marginBottom:12 }}>CHECK YOUR INBOX</h1>
        <p style={{ color:'var(--text-dim)', fontSize:14, lineHeight:1.7, maxWidth:400 }}>
          A sign-in link has been sent to your email. Click it to access your account.
          The link expires in 24 hours.
        </p>
      </div>
    </div>
  )
}
