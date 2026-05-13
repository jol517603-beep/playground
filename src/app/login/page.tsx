'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { loginTeam } from '@/app/actions/auth'

const DEMO_CODE = '7TSGP3' // Storm Riders — Team #1

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

  const handleDemoCode = () => {
    setError('')
    setCode(DEMO_CODE)
    inputRef.current?.focus()
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
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-6 pb-10 overflow-y-auto"
      style={{ backgroundColor: '#0E1F3A' }}
    >
      {/* Branding */}
      <div className="text-center mb-6 w-full max-w-[380px]">
        <p className="font-bold text-xs tracking-widest uppercase mb-2" style={{ color: '#FF5A4E' }}>
          Georgetown, Penang
        </p>
        <h1 className="text-white font-black text-4xl leading-tight">
          The<br />PlayGround
        </h1>
        <p className="text-white/40 text-sm mt-1">8 zones · 100 games · 5 museums</p>
      </div>

      <div
        className="w-full max-w-[380px] rounded-xl border-2 border-ink overflow-hidden"
        style={{ boxShadow: '6px 6px 0 rgba(255,255,255,0.08)' }}
      >
        {/* ── Demo Code ── */}
        <div style={{ backgroundColor: '#FFD43B' }}>
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="font-black text-ink text-sm leading-tight">🎮 DEMO — Try the game</p>
              <p className="text-ink/60 text-xs mt-0.5">Tap to auto-fill the demo code</p>
            </div>
            <button
              type="button"
              onClick={handleDemoCode}
              className="flex-shrink-0 px-4 py-2.5 font-black text-base border-2 border-ink rounded-lg tracking-widest transition-all"
              style={{
                backgroundColor: code === DEMO_CODE ? '#0E1F3A' : '#fff',
                color: code === DEMO_CODE ? '#FFD43B' : '#1A1A1A',
                boxShadow: '3px 3px 0 #1A1A1A',
                letterSpacing: '0.12em',
              }}
            >
              {DEMO_CODE}
            </button>
          </div>
        </div>

        {/* ── Form ── */}
        <div className="px-5 py-5" style={{ backgroundColor: '#FFF8EE' }}>
          <p className="text-ink font-black text-base mb-0.5">Or type your team code</p>
          <p className="text-ink/50 text-xs mb-4">6-character code from your Game Master</p>

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
              <p className="font-bold text-sm text-center mb-3" style={{ color: '#FF5A4E' }}>
                {error}
              </p>
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
