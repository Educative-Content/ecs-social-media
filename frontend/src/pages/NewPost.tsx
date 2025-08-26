
import React, { useState } from 'react'
import { useAuth } from '../state/auth'
import { createPost } from '../api'

export default function NewPost(){
  const { token } = useAuth()
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | undefined>(undefined)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent){
    e.preventDefault()
    try {
      setLoading(true)
      setStatus('Creating post...')
      setError(null)
      await createPost(token!, text, file)
      setText(''); setFile(undefined); setStatus('Posted!')
    } catch (e:any){
      setError(e.message || 'Failed to create post')
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="card p-6 sm:p-8">
        <h2 className="text-xl font-semibold">New Post</h2>
        {status && <p className="mt-3 text-sm text-brand-700 bg-brand-50 border border-brand-200 rounded-lg p-3">{status}</p>}
        {error && <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div>
            <label className="label">Message</label>
            <textarea className="input h-32 resize-y" placeholder="Say something..." value={text} onChange={e=>setText(e.target.value)} />
          </div>
          <div>
            <label className="label">Attachment (optional)</label>
            <input className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:text-white file:px-4 file:py-2 file:hover:bg-brand-700" type='file' onChange={e=>setFile(e.target.files?.[0] || undefined)} />
          </div>
          <div className="flex gap-3">
            <button className="btn btn-primary" disabled={loading} type='submit'>{loading ? 'Posting…' : 'Post'}</button>
            <button className="btn btn-ghost" type="button" onClick={()=>{setText(''); setFile(undefined)}}>Clear</button>
          </div>
        </form>
      </div>
    </div>
  )
}
