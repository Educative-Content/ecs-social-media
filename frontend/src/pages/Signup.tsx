
import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signup } from '../api'
import { useAuth } from '../state/auth'

export default function Signup(){
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setToken, setUser } = useAuth()
  const nav = useNavigate()

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    try {
      setLoading(true); setError(null)
      const res = await signup(email, password, name)
      setToken(res.token); setUser(res.user)
      nav('/feed')
    } catch (e: any) { setError(e.message || 'Signup failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6 sm:p-8">
        <h2 className="text-2xl font-semibold">Create an account</h2>
        <p className="text-sm text-gray-500 mt-1">Join the conversation.</p>
        {error && <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="label">Name</label>
            <input className="input" placeholder="Jane Doe" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" placeholder="••••••••" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="text-sm text-gray-600 mt-4">
          Already have an account? <Link to="/login" className="text-brand-700 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
