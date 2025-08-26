
import React, { useEffect, useState } from 'react'
import { useAuth } from '../state/auth'
import { getFeed, mediaUrl } from '../api'

function timeAgo(ts: number){
  const diff = (Date.now()/1000 - ts)
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return new Date(ts*1000).toLocaleString()
}

export default function Feed(){
  const { token } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    (async ()=>{
      try {
        setError(null); setLoading(true)
        const data = await getFeed(token!)
        setItems(data)
      } catch (e:any){
        setError(e.message || 'Failed to load feed')
      } finally {
        setLoading(false)
      }
    })()
  }, [token])

  return (
    <div className="grid gap-4">
      <h2 className="text-xl font-semibold">Feed</h2>
      {loading && <div className="text-sm text-gray-500">Loading feed…</div>}
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}
      {items.map(p => (
        <article key={p.postId} className="card p-5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>by <span className="font-medium text-gray-700">{p.authorId}</span></span>
            <time>{timeAgo(p.createdAt)}</time>
          </div>
          <p className="mt-3 text-gray-900 whitespace-pre-line">{p.text}</p>
          {p.mediaKey && (
              <img
                src={mediaUrl(p.postId)}
                alt="attachment"
                className="mt-3 rounded-xl border border-gray-200 max-h-96 object-contain"
              />
            )}
          <div className="mt-4 flex gap-2">
            <button className="btn btn-ghost">Like</button>
            <button className="btn btn-ghost">Comment</button>
          </div>
        </article>
      ))}
      {!loading && items.length === 0 && (
        <div className="card p-6 text-center text-gray-600">No posts yet.</div>
      )}
    </div>
  )
}
