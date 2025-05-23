import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Blood Work Results Portal</h1>
        <p style={{ marginBottom: '2rem' }}>Welcome to the secure blood work results management system.</p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/customer" className="btn btn-primary">
            Customer Portal
          </Link>
          <Link href="/staff" className="btn btn-primary">
            Staff Portal
          </Link>
        </div>
      </div>
    </div>
  )
} 