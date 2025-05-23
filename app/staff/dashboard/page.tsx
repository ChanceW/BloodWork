'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Result {
  id: string
  patientId: string
  testName: string
  testDate: string
  values: Record<string, number>
  referenceRange: Record<string, { min: number; max: number }>
  assetId?: string
}

export default function StaffDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingResult, setEditingResult] = useState<Result | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session.user.role !== 'STAFF') {
      router.push('/customer/dashboard')
    }
  }, [status, router, session])

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await fetch('/api/results/all')
        if (!res.ok) throw new Error('Failed to fetch results')
        const data = await res.json()
        setResults(data)
      } catch (error) {
        setError('Failed to load results')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated' && session.user.role === 'STAFF') {
      fetchResults()
    }
  }, [status, session])

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const file = formData.get('pdf') as File
    const patientId = formData.get('patientId') as string
    const testName = formData.get('testName') as string
    const testDate = formData.get('testDate') as string
    const values = JSON.parse(formData.get('values') as string)
    const referenceRange = JSON.parse(formData.get('referenceRange') as string)

    try {
      // First upload the PDF if provided
      let assetId: string | undefined
      if (file) {
        const assetFormData = new FormData()
        assetFormData.append('file', file)
        
        const assetRes = await fetch('/api/assets/upload', {
          method: 'POST',
          body: assetFormData,
        })
        
        if (!assetRes.ok) throw new Error('Failed to upload PDF')
        const assetData = await assetRes.json()
        assetId = assetData.id
      }

      // Then create the result
      const resultRes = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          testName,
          testDate,
          values,
          referenceRange,
          assetId,
        }),
      })

      if (!resultRes.ok) throw new Error('Failed to create result')
      
      // Refresh results
      const updatedRes = await fetch('/api/results/all')
      const updatedData = await updatedRes.json()
      setResults(updatedData)
      
      setShowUploadForm(false)
      e.currentTarget.reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingResult) return

    setUploading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const file = formData.get('pdf') as File
    const testName = formData.get('testName') as string
    const testDate = formData.get('testDate') as string
    const values = JSON.parse(formData.get('values') as string)
    const referenceRange = JSON.parse(formData.get('referenceRange') as string)

    try {
      // First upload the PDF if provided
      let assetId = editingResult.assetId
      if (file) {
        const assetFormData = new FormData()
        assetFormData.append('file', file)
        
        const assetRes = await fetch('/api/assets/upload', {
          method: 'POST',
          body: assetFormData,
        })
        
        if (!assetRes.ok) throw new Error('Failed to upload PDF')
        const assetData = await assetRes.json()
        assetId = assetData.id
      }

      // Then update the result
      const resultRes = await fetch(`/api/results/${editingResult.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName,
          testDate,
          values,
          referenceRange,
          assetId,
        }),
      })

      if (!resultRes.ok) throw new Error('Failed to update result')
      
      // Refresh results
      const updatedRes = await fetch('/api/results/all')
      const updatedData = await updatedRes.json()
      setResults(updatedData)
      
      setEditingResult(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this result?')) return

    try {
      const res = await fetch(`/api/results/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete result')
      
      // Refresh results
      const updatedRes = await fetch('/api/results/all')
      const updatedData = await updatedRes.json()
      setResults(updatedData)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Delete failed')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem' }}>Blood Work Results Management</h1>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="btn btn-primary"
          >
            {showUploadForm ? 'Cancel' : 'Upload New Result'}
          </button>
        </div>

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

        {showUploadForm && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Upload New Result</h2>
            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="patientId" className="form-label">Patient ID</label>
                <input
                  type="text"
                  id="patientId"
                  name="patientId"
                  required
                  className="form-input"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="testName" className="form-label">Test Name</label>
                <input
                  type="text"
                  id="testName"
                  name="testName"
                  required
                  className="form-input"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="testDate" className="form-label">Test Date</label>
                <input
                  type="date"
                  id="testDate"
                  name="testDate"
                  required
                  className="form-input"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="values" className="form-label">Values (JSON)</label>
                <textarea
                  id="values"
                  name="values"
                  required
                  className="form-input"
                  placeholder='{"hemoglobin": 14.5, "whiteBloodCells": 7.2}'
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="referenceRange" className="form-label">Reference Range (JSON)</label>
                <textarea
                  id="referenceRange"
                  name="referenceRange"
                  required
                  className="form-input"
                  placeholder='{"hemoglobin": {"min": 13.5, "max": 17.5}, "whiteBloodCells": {"min": 4.5, "max": 11.0}}'
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="pdf" className="form-label">PDF Result (optional)</label>
                <input
                  type="file"
                  id="pdf"
                  name="pdf"
                  accept=".pdf"
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Result'}
              </button>
            </form>
          </div>
        )}

        {editingResult && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Edit Result</h2>
            <form onSubmit={handleEdit}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="editTestName" className="form-label">Test Name</label>
                <input
                  type="text"
                  id="editTestName"
                  name="testName"
                  required
                  className="form-input"
                  defaultValue={editingResult.testName}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="editTestDate" className="form-label">Test Date</label>
                <input
                  type="date"
                  id="editTestDate"
                  name="testDate"
                  required
                  className="form-input"
                  defaultValue={editingResult.testDate.split('T')[0]}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="editValues" className="form-label">Values (JSON)</label>
                <textarea
                  id="editValues"
                  name="values"
                  required
                  className="form-input"
                  defaultValue={JSON.stringify(editingResult.values, null, 2)}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="editReferenceRange" className="form-label">Reference Range (JSON)</label>
                <textarea
                  id="editReferenceRange"
                  name="referenceRange"
                  required
                  className="form-input"
                  defaultValue={JSON.stringify(editingResult.referenceRange, null, 2)}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="editPdf" className="form-label">New PDF Result (optional)</label>
                <input
                  type="file"
                  id="editPdf"
                  name="pdf"
                  accept=".pdf"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingResult(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {results.length === 0 ? (
          <p>No results found.</p>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
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
                    <td>{result.patientId}</td>
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
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                        <button
                          onClick={() => setEditingResult(result)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(result.id)}
                          className="btn btn-secondary"
                          style={{ 
                            fontSize: '0.875rem', 
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#dc2626'
                          }}
                        >
                          Delete
                        </button>
                      </div>
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