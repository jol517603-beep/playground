'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { loginTeam } from '@/app/actions/auth'

export default function LoginPage() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleChange = (v: string) => {
    setError('')
    setCode(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length < 6) return
    setLoading(true)
    setError('')
    const result = await loginTeam(code)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      setCode('')
      inputRef.current?.focus()
    } else {
      router.push('/play')
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div
        className="w-full max-w-[380px] rounded-xl border-2 border-ink overflow-hidden"
        style={{ boxShadow: '6px 6px 0 #1A1A1A' }}
      >
        {/* Header */}
        <div
          className="px-6 py-8 text-center relative overflow-hidden"
          style={{ backgroundColor: '#0E1F3A' }}
        >
          <div className="absolute top-3 left-4 w-12 h-12 rounded-full bg-coral opacity-20" />
          <div className="absolute bottom-2 right-6 w-8 h-8 rounded-full bg-lemon opacity-25" />
          <p className="text-coral font-bold text-xs tracking-widest uppercase mb-2">Georgetown, Penang</p>
          <h1 className="text-white font-black text-4xl leading-tight">The<br />PlayGround</h1>
          <p className="text-white/50 text-sm mt-2">8 zones · 100 games · 5 museums</p>
        </div>

        {/* Form */}
        <div className="px-6 py-8" style={{ backgroundColor: '#FFF8EE' }}>
          <p className="text-ink font-black text-lg mb-1">Enter Team Code</p>
          <p className="text-ink/50 text-sm mb-5">6-character code from your Game Master</p>

          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              autoComplete="off"
              autoCapitalize="characters"
              className="w-full text-center text-3xl font-black tracking-[0.3em] py-4 border-2 border-ink rounded-lg outline-none mb-3 transition-all"
              style={{
                backgroundColor: '#fff',
                boxShadow: code.length === 6 ? '3px 3px 0 #1A1A1A' : 'none',
                borderColor: error ? '#FF5A4E' : '#1A1A1A',
              }}
            />

            {error && (
              <p className="text-coral font-bold text-sm text-center mb-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={code.length < 6 || loading}
              className="w-full py-4 font-black text-lg border-2 border-ink rounded-lg transition-all"
              style={{
                backgroundColor: code.length === 6 && !loading ? '#FF5A4E' : '#1A1A1A20',
                color: code.length === 6 && !loading ? '#fff' : '#1A1A1A40',
                boxShadow: code.length === 6 && !loading ? '4px 4px 0 #1A1A1A' : 'none',
              }}
            >
              {loading ? 'Checking...' : 'JOIN THE GAME →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
