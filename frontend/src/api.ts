// frontend/src/api.ts
export async function signup(email: string, password: string, name: string) {
  const r = await fetch(`/api/users/signup`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email, password, name})
  }); if (!r.ok) throw new Error(await r.text()); return r.json();
}

export async function login(email: string, password: string) {
  const r = await fetch(`/api/users/login`, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email, password})
  }); if (!r.ok) throw new Error(await r.text()); return r.json();
}

export async function getFeed(token: string) {
  const r = await fetch(`/api/feed/feed`, {
    headers:{ 'Authorization': `Bearer ${token}` }
  }); if (!r.ok) throw new Error(await r.text()); return r.json();
}

export async function createPost(token: string, text: string, file?: File) {
  const fd = new FormData(); fd.append('text', text || ''); if (file) fd.append('file', file);
  const r = await fetch(`/api/posts/posts`, {
    method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd
  }); if (!r.ok) throw new Error(await r.text()); return r.json();
}

export function mediaUrl(postId: string) {
  return `/api/posts/media/${postId}`;
}
