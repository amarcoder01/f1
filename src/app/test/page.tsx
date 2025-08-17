export default function TestPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1e293b', 
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
        Test Page Working! 🎉
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>
        If you can see this, the basic Next.js setup is working correctly.
      </p>
      <div style={{ marginTop: '40px' }}>
        <a 
          href="/"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          Go to Home Page
        </a>
      </div>
    </div>
  )
}
