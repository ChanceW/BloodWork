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
      backgroundColor: '#1a1a1a',
      padding: '1rem',
      color: 'white'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ 
          color: 'white', 
          textDecoration: 'none',
          fontSize: '1.25rem',
          fontWeight: 'bold'
        }}>
          Blood Work Portal
        </Link>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {status === 'authenticated' ? (
            <>
              {session.user.role === 'STAFF' && (
                <>
                  <Link href="/staff/dashboard" style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#2563eb'
                  }}>
                    Dashboard
                  </Link>
                  <Link href="/staff/patients" style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    backgroundColor: '#2563eb'
                  }}>
                    Patients
                  </Link>
                </>
              )}
              <span style={{ color: '#9ca3af' }}>
                {session.user.email} ({session.user.role})
              </span>
              <button
                onClick={handleSignOut}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth/signin" style={{ 
              color: 'white', 
              textDecoration: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              backgroundColor: '#2563eb'
            }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
} 