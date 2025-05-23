'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Patient {
  id: string
  patientId: string
  name: string
  email: string
  role: string
  createdAt: string
  lastLogin: string | null
}

export default function PatientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && session.user.role !== 'STAFF') {
      router.push('/customer/dashboard')
    }
  }, [status, router, session])

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch('/api/patients')
        if (!res.ok) throw new Error('Failed to fetch patients')
        const data = await res.json()
        setPatients(data)
        setFilteredPatients(data)
      } catch (error) {
        setError('Failed to load patients')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated' && session.user.role === 'STAFF') {
      fetchPatients()
    }
  }, [status, session])

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const filtered = patients.filter(patient =>
        patient.patientId.toLowerCase().includes(term) ||
        patient.name.toLowerCase().includes(term) ||
        patient.email.toLowerCase().includes(term)
      )
      setFilteredPatients(filtered)
    } else {
      setFilteredPatients(patients)
    }
  }, [searchTerm, patients])

  async function handleAddPatient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      patientId: formData.get('patientId'),
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    }

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to add patient')

      // Refresh patients list
      const updatedRes = await fetch('/api/patients')
      const updatedData = await updatedRes.json()
      setPatients(updatedData)
      setFilteredPatients(updatedData)
      setShowAddForm(false)
      e.currentTarget.reset()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add patient')
    }
  }

  async function handleUpdatePatient(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingPatient) return
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password') || undefined,
    }

    try {
      const res = await fetch(`/api/patients/${editingPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to update patient')

      // Refresh patients list
      const updatedRes = await fetch('/api/patients')
      const updatedData = await updatedRes.json()
      setPatients(updatedData)
      setFilteredPatients(updatedData)
      setEditingPatient(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update patient')
    }
  }

  async function handleDeletePatient(id: string) {
    if (!confirm('Are you sure you want to delete this patient?')) return

    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete patient')

      // Refresh patients list
      const updatedRes = await fetch('/api/patients')
      const updatedData = await updatedRes.json()
      setPatients(updatedData)
      setFilteredPatients(updatedData)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete patient')
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
          <h1 style={{ fontSize: '1.5rem' }}>Patient Management</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? 'Cancel' : 'Add New Patient'}
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

        {/* Search Control */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="search" className="form-label">Search Patients</label>
          <input
            type="text"
            id="search"
            className="form-input"
            placeholder="Search by patient ID, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showAddForm && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add New Patient</h2>
            <form onSubmit={handleAddPatient}>
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
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="form-input"
                />
              </div>

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

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
              >
                Add Patient
              </button>
            </form>
          </div>
        )}

        {editingPatient && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Edit Patient</h2>
            <form onSubmit={handleUpdatePatient}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="editName" className="form-label">Name</label>
                <input
                  type="text"
                  id="editName"
                  name="name"
                  required
                  className="form-input"
                  defaultValue={editingPatient.name}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="editEmail" className="form-label">Email</label>
                <input
                  type="email"
                  id="editEmail"
                  name="email"
                  required
                  className="form-input"
                  defaultValue={editingPatient.email}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="editPassword" className="form-label">New Password (optional)</label>
                <input
                  type="password"
                  id="editPassword"
                  name="password"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingPatient(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {filteredPatients.length === 0 ? (
          <p>No patients found.</p>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.patientId}</td>
                    <td>{patient.name}</td>
                    <td>{patient.email}</td>
                    <td>{new Date(patient.createdAt).toLocaleDateString()}</td>
                    <td>{patient.lastLogin ? new Date(patient.lastLogin).toLocaleDateString() : 'Never'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setEditingPatient(patient)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id)}
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