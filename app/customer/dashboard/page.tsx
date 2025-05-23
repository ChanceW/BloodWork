'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Result {
  id: string
  testName: string
  testDate: string
  values: Record<string, number>
  referenceRange: Record<string, { min: number; max: number }>
  assetId?: string
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch('/api/results')
        if (!res.ok) throw new Error('Failed to fetch results')
        const data = await res.json()
        setResults(data)
      } catch (error) {
        setError('Failed to load results')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchResults()
    }
  }, [status])

  if (status === 'loading' || loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ 
            padding: '0.75rem', 
            marginBottom: '1rem', 
            backgroundColor: '#fee2e2', 
            color: '#dc2626',
            borderRadius: '0.375rem'
          }}>
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Your Blood Work Results</h1>
        
        {results.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Date</th>
                  <th>Results</th>
                  <th>Reference Range</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.testName}</td>
                    <td>{new Date(result.testDate).toLocaleDateString()}</td>
                    <td>
                      {Object.entries(result.values).map(([key, value]) => (
                        <div key={key}>
                          {key}: {value}
                        </div>
                      ))}
                    </td>
                    <td>
                      {Object.entries(result.referenceRange).map(([key, range]) => (
                        <div key={key}>
                          {key}: {range.min} - {range.max}
                        </div>
                      ))}
                    </td>
                    <td>
                      {Object.entries(result.values).map(([key, value]) => {
                        const range = result.referenceRange[key]
                        if (!range) return null
                        
                        const status = value < range.min ? 'Low' :
                                     value > range.max ? 'High' : 'Normal'
                        
                        return (
                          <div key={key} style={{
                            color: status === 'Normal' ? '#059669' :
                                  status === 'High' ? '#dc2626' : '#d97706'
                          }}>
                            {status}
                          </div>
                        )
                      })}
                    </td>
                    <td>
                      {result.assetId && (
                        <a
                          href={`/api/assets/${result.assetId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                        >
                          View PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 