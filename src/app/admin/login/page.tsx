'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0E1F3A' }}>
      <div className="w-full max-w-[360px] rounded-xl border-2 border-white/20 overflow-hidden" style={{ boxShadow: '6px 6px 0 rgba(255,255,255,0.1)' }}>
        <div className="px-6 py-6 border-b border-white/10" style={{ backgroundColor: '#FF5A4E' }}>
          <p className="text-white/70 text-xs font-bold tracking-widest uppercase">The PlayGround</p>
          <h1 className="text-white font-black text-2xl mt-1">GM Control Panel</h1>
        </div>
        <div className="px-6 py-6" style={{ backgroundColor: '#162843' }}>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded border-2 border-white/20 bg-white/5 text-white outline-none focus:border-coral text-sm"
                placeholder="gm@playground.my"
                required
              />
            </div>
            <div>
              <label className="text-white/60 text-xs font-bold uppercase tracking-wider block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded border-2 border-white/20 bg-white/5 text-white outline-none focus:border-coral text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-black text-base rounded border-2 border-ink transition-all"
              style={{ backgroundColor: '#FF5A4E', color: '#fff', boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}
            >
              {loading ? 'Signing in...' : 'ENTER COMMAND →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
