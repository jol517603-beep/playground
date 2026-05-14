'use client'

import { useEffect, useState } from 'react'
import type { Team, Zone } from '@/types'

interface HeaderProps {
  team: Team
  currentZone: Zone
  eventEndsAt: Date
  timerDurationMs: number
  rank: number
}

function useCountdown(endsAt: Date) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const tick = () => {
      const diff = endsAt.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('00:00:00')
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  return timeLeft
}

export default function Header({ team, currentZone, eventEndsAt, timerDurationMs, rank }: HeaderProps) {
  const timeLeft = useCountdown(eventEndsAt)
  const remaining = Math.max(0, eventEndsAt.getTime() - Date.now())
  const progress = Math.min(100, ((timerDurationMs - remaining) / timerDurationMs) * 100)

  return (
    <header
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-50"
      style={{ backgroundColor: '#0E1F3A' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-2 right-6 w-12 h-12 rounded-full bg-coral opacity-20 pointer-events-none" />
      <div className="absolute top-4 right-16 w-6 h-6 rounded-full bg-lemon opacity-30 pointer-events-none" />
      <div className="absolute top-1 left-4 w-8 h-8 rounded-full bg-mint opacity-15 pointer-events-none" />

      <div className="px-4 pt-3 pb-2 relative">
        {/* Team info row */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-xs font-bold uppercase tracking-wider">
                TEAM {team.number}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                <span className="text-mint text-xs font-bold">LIVE</span>
              </span>
            </div>
            <div className="text-white font-black text-lg leading-tight">{team.name}</div>
          </div>
          <div className="text-right">
            <div className="text-white/50 text-xs uppercase tracking-wide">Zone</div>
            <div className="text-white font-bold text-sm">
              {currentZone.emoji} {currentZone.name}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-white/10 rounded px-2 py-1.5 text-center border border-white/10">
            <div className="text-lemon font-black text-lg leading-none">{team.score}</div>
            <div className="text-white/60 text-xs uppercase tracking-wide mt-0.5">Score</div>
          </div>
          <div className="bg-white/10 rounded px-2 py-1.5 text-center border border-white/10">
            <div className="text-coral font-black text-lg leading-none">#{rank}</div>
            <div className="text-white/60 text-xs uppercase tracking-wide mt-0.5">Rank</div>
          </div>
          <div className="bg-white/10 rounded px-2 py-1.5 text-center border border-white/10">
            <div className="text-mint font-black text-lg leading-none">RM{team.budget}</div>
            <div className="text-white/60 text-xs uppercase tracking-wide mt-0.5">Budget</div>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/50 text-xs uppercase tracking-wide">Time Left</span>
          <span className="text-white font-mono font-bold text-sm">{timeLeft}</span>
        </div>
      </div>

      {/* Countdown bar */}
      <div className="h-1.5 bg-white/10 w-full">
        <div
          className="h-full bg-coral transition-all duration-1000"
          style={{ width: `${100 - progress}%` }}
        />
      </div>
    </header>
  )
}
