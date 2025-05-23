import Link from 'next/link'

export default function StaffPortal() {
  return (
    <div className="container">
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Staff Portal</h1>
        <p style={{ marginBottom: '1rem' }}>Please sign in to manage blood work results.</p>
        <Link href="/auth/signin" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    </div>
  )
} 