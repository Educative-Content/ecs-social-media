
import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../state/auth'

export default function App(){
  const { token, setToken, user, setUser } = useAuth()
  return (
    <div className="min-h-full">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="container-app py-4 flex items-center justify-between">
          <Link to="/feed" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-brand-600 grid place-items-center text-white font-bold">S</div>
            <span className="text-lg font-semibold">Social ECS</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-2">
            <Link to="/feed" className="btn btn-ghost">Feed</Link>
            <Link to="/new" className="btn btn-ghost">New Post</Link>
          </nav>
          <div className="flex items-center gap-2">
            {token ? (
              <>
                <span className="hidden sm:inline text-sm text-gray-600">Hi, {user?.name || user?.email}</span>
                <button className="btn btn-ghost" onClick={()=>{setToken(null); setUser(null)}}>Logout</button>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost" to="/login">Login</Link>
                <Link className="btn btn-primary" to="/signup">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container-app py-6">
        <Outlet />
      </main>

      <footer className="mt-12 py-10 text-center text-sm text-gray-500">
        Built for ECS • JWT auth • DynamoDB • S3 uploads
      </footer>
    </div>
  )
}
