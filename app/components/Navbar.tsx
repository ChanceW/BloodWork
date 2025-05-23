'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  return (
    <nav style={{
      backgroundColor: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      padding: '1rem',
      marginBottom: '2rem'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold',
          color: '#2563eb',
          textDecoration: 'none'
        }}>
          Blood Work Portal
        </Link>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {status === 'authenticated' ? (
            <>
              <span style={{ color: '#4b5563' }}>
                {session.user.email} ({session.user.role.toLowerCase()})
              </span>
              <button
                onClick={handleSignOut}
                className="btn btn-secondary"
                style={{ fontSize: '0.875rem' }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth/signin" className="btn btn-primary">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
} 