const USERS_URL = import.meta.env.VITE_USERS_URL || 'http://localhost:8001'
const POSTS_URL = import.meta.env.VITE_POSTS_URL || 'http://localhost:8002'
const FEED_URL  = import.meta.env.VITE_FEED_URL  || 'http://localhost:8003'

export async function signup(email: string, password: string, name: string) {
  const r = await fetch(`${USERS_URL}/signup`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email, password, name})
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function login(email: string, password: string) {
  const r = await fetch(`${USERS_URL}/login`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email, password})
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

export async function getFeed(token: string) {
  const r = await fetch(`${FEED_URL}/feed`, {
    headers:{ 'Authorization': `Bearer ${token}` }
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

// NEW: multipart upload through the Posts service
export async function createPost(token: string, text: string, file?: File) {
  const fd = new FormData()
  fd.append('text', text || '')
  if (file) fd.append('file', file)

  const r = await fetch(`${POSTS_URL}/posts`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: fd
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json()
}

// Helper to build media URL for an <img src>
export function mediaUrl(postId: string) {
  return `${POSTS_URL}/media/${postId}`
}
