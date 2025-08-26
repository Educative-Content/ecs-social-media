
import React, { createContext, useContext, useEffect, useState } from 'react'

type AuthCtx = { token: string | null, setToken: (t: string | null) => void, user: any, setUser: (u:any)=>void }
const Ctx = createContext<AuthCtx>({ token: null, setToken: ()=>{}, user: null, setUser: ()=>{} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<any>(token ? JSON.parse(localStorage.getItem('user') || 'null') : null)

  useEffect(()=>{
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token')
    if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user')
  }, [token, user])

  return <Ctx.Provider value={{ token, setToken, user, setUser }}>{children}</Ctx.Provider>
}
export function useAuth(){ return useContext(Ctx) }
