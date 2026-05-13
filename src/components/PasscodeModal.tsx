'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { zones } from '@/data/zones'
import { games } from '@/data/games'

interface PasscodeModalProps {
  zoneId: string
  completedGameIds: number[]
  onSuccess: (zoneId: string) => void
  onClose: () => void
}

type ModalState = 'input' | 'wrong' | 'success'

export default function PasscodeModal({
  zoneId,
  completedGameIds,
  onSuccess,
  onClose,
}: PasscodeModalProps) {
  const zone = zones.find((z) => z.id === zoneId)
  const [digits, setDigits] = useState(['', '', '', ''])
  const [state, setState] = useState<ModalState>('input')
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    refs[0].current?.focus()
  }, [])

  const prevZone = zone ? zones.find((z) => z.order === zone.order - 1) : undefined
  const completedInPrev = prevZone
    ? games.filter((g) => g.zone === prevZone.id && completedGameIds.includes(g.id)).length
    : zone?.order === 1 ? 0 : 0

  const handleChange = useCallback(
    (idx: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1)
      const next = [...digits]
      next[idx] = digit
      setDigits(next)
      setState('input')
      if (digit && idx < 3) refs[idx + 1].current?.focus()
    },
    [digits]
  )

  const handleKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
        refs[idx - 1].current?.focus()
      }
    },
    [digits]
  )

  const handleSubmit = useCallback(() => {
    if (!zone) return
    const entered = digits.join('')
    if (entered === zone.passcode) {
      setState('success')
      setTimeout(() => onSuccess(zoneId), 1800)
    } else {
      setState('wrong')
      setDigits(['', '', '', ''])
      setTimeout(() => {
        refs[0].current?.focus()
        setState('input')
      }, 700)
    }
  }, [digits, zone, zoneId, onSuccess])

  const allFilled = digits.every((d) => d !== '')

  if (!zone) return null

  if (state === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(14,31,58,0.95)' }}>
        <div className="text-center animate-bounce-in">
          <div style={{ fontSize: '72px', lineHeight: 1 }}>{zone.emoji}</div>
          <div
            className="mt-4 px-6 py-3 font-black text-xl border-2 border-ink"
            style={{ backgroundColor: zone.color, color: '#fff', boxShadow: '4px 4px 0 #1A1A1A' }}
          >
            ■ ZONE {zone.order} UNLOCKED ■
          </div>
          <div className="text-white font-bold mt-3 text-lg">{zone.name}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(14,31,58,0.9)' }}
    >
      <div
        className="w-full max-w-[440px] rounded-t-2xl overflow-hidden border-2 border-b-0 border-ink"
        style={{ backgroundColor: '#FFF8EE', boxShadow: '0 -4px 0 #1A1A1A' }}
      >
        {/* Header band */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: zone.color }}
        >
          <div>
            <div className="text-white/70 text-xs font-bold uppercase tracking-widest">
              UNLOCK ZONE {zone.order}/8
            </div>
            <div className="text-white font-black text-lg">
              {zone.emoji} {zone.name}
            </div>
            <div className="text-white/70 text-sm">{zone.label}</div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X size={22} />
          </button>
        </div>

        <div className="px-4 py-5">
          {/* Progress chip */}
          {prevZone && (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-5 border-2 border-ink"
              style={{ backgroundColor: '#3DDC97', color: '#1A1A1A' }}
            >
              ✓ {completedInPrev} games done in {prevZone.name} · threshold met
            </div>
          )}

          {/* OTP inputs */}
          <div className="flex gap-3 justify-center mb-2">
            {digits.map((d, idx) => (
              <input
                key={idx}
                ref={refs[idx]}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-[52px] h-[60px] text-center text-2xl font-black border-2 rounded outline-none transition-all"
                style={{
                  borderColor: state === 'wrong' ? '#FF5A4E' : d ? '#0E1F3A' : '#1A1A1A50',
                  backgroundColor: '#fff',
                  boxShadow: d ? '3px 3px 0 #1A1A1A' : 'none',
                  animation: state === 'wrong' ? 'shake 0.4s ease' : 'none',
                }}
              />
            ))}
          </div>

          {state === 'wrong' && (
            <p className="text-center text-coral font-bold text-sm mb-3">
              Wrong code. Try again.
            </p>
          )}

          {/* Demo hint */}
          <div
            className="flex items-center justify-center gap-2 mt-3 mb-5 px-3 py-1.5 rounded-full border-2 border-ink mx-auto w-fit"
            style={{ backgroundColor: '#FFD43B' }}
          >
            <span className="text-xs font-bold text-ink">Demo code:</span>
            <span className="font-black text-ink tracking-widest">{zone.passcode}</span>
          </div>

          {/* Unlock button */}
          <button
            onClick={handleSubmit}
            disabled={!allFilled}
            className="w-full py-3.5 font-black text-base border-2 border-ink rounded transition-all"
            style={{
              backgroundColor: allFilled ? '#0E1F3A' : '#1A1A1A20',
              color: allFilled ? '#FFD43B' : '#1A1A1A40',
              boxShadow: allFilled ? '4px 4px 0 #1A1A1A' : 'none',
            }}
          >
            UNLOCK ZONE
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}
