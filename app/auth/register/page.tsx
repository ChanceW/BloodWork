'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import Link from 'next/link'

export default function Register() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as 'CUSTOMER' | 'STAFF'
    const patientId = formData.get('patientId') as string

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, patientId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      router.push('/auth/signin')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Register</h1>
        
        {error && (
          <div style={{ 
            padding: '0.75rem', 
            marginBottom: '1rem', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626',
            borderRadius: '0.375rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="form-input"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={8}
              className="form-input"
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="role" className="form-label">Role</label>
            <select
              id="role"
              name="role"
              required
              className="form-input"
            >
              <option value="CUSTOMER">Customer</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="patientId" className="form-label">Patient ID (for customers)</label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={{ marginTop: '1rem', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/auth/signin" style={{ color: '#2563eb' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
} 