'use client'

import { Lock, CheckCircle } from 'lucide-react'
import { zones } from '@/data/zones'
import { games } from '@/data/games'

interface PathTabProps {
  completedGameIds: number[]
  unlockedZoneIds: string[]
  onUnlockZone: (zoneId: string) => void
}

export default function PathTab({ completedGameIds, unlockedZoneIds, onUnlockZone }: PathTabProps) {
  const getZoneState = (zoneId: string, order: number) => {
    if (unlockedZoneIds.includes(zoneId)) return 'unlocked'
    const prevZone = zones.find((z) => z.order === order - 1)
    if (!prevZone) return 'unlocked'
    const completedInPrev = games.filter(
      (g) => g.zone === prevZone.id && completedGameIds.includes(g.id)
    ).length
    if (completedInPrev >= prevZone.threshold) return 'ready'
    return 'locked'
  }

  return (
    <div className="px-4 py-4">
      {/* Header card */}
      <div
        className="rounded-lg border-2 border-ink p-4 mb-6"
        style={{ backgroundColor: '#0E1F3A', boxShadow: '4px 4px 0 #1A1A1A' }}
      >
        <div className="text-white font-black text-lg mb-1">The 8-Zone Journey</div>
        <div className="text-white/60 text-sm">
          Complete games in each zone to unlock the next. Enter the passcode at each checkpoint.
          All 8 zones = full Georgetown circuit.
        </div>
      </div>

      {/* Zone cards */}
      <div className="relative">
        {zones.map((zone, idx) => {
          const state = getZoneState(zone.id, zone.order)
          const zoneGames = games.filter((g) => g.zone === zone.id)
          const completed = zoneGames.filter((g) => completedGameIds.includes(g.id)).length
          const isLast = idx === zones.length - 1

          return (
            <div key={zone.id} className="flex gap-3">
              {/* Left column: circle + line */}
              <div className="flex flex-col items-center">
                <div
                  className="w-14 h-14 rounded-full border-2 border-ink flex flex-col items-center justify-center flex-shrink-0 z-10 font-black"
                  style={{
                    backgroundColor:
                      state === 'unlocked' ? zone.color
                      : state === 'ready' ? '#FFD43B'
                      : '#E5E5E5',
                    color: state === 'locked' ? '#1A1A1A80' : '#fff',
                    boxShadow: state !== 'locked' ? '3px 3px 0 #1A1A1A' : 'none',
                    fontSize: '22px',
                    lineHeight: 1,
                  }}
                >
                  <span>{zone.emoji}</span>
                  <span className="text-[10px] font-black opacity-80">{zone.order}</span>
                </div>
                {!isLast && (
                  <div
                    className="w-0.5 flex-1 my-1"
                    style={{
                      borderLeft: '2px dashed',
                      borderColor: state === 'unlocked' ? zone.color : '#1A1A1A30',
                      minHeight: '24px',
                    }}
                  />
                )}
              </div>

              {/* Right column: zone card */}
              <div className="flex-1 mb-4">
                <div
                  className="rounded-lg border-2 overflow-hidden"
                  style={{
                    borderColor: state === 'locked' ? '#1A1A1A30' : '#1A1A1A',
                    borderStyle: state === 'locked' ? 'dashed' : 'solid',
                    boxShadow: state !== 'locked' ? '3px 3px 0 #1A1A1A' : 'none',
                    backgroundColor:
                      state === 'unlocked' ? '#FFF8EE'
                      : state === 'ready' ? '#FFF8EE'
                      : '#F5F5F5',
                  }}
                >
                  {/* Card header band */}
                  {state !== 'locked' && (
                    <div
                      className="px-3 py-1"
                      style={{ backgroundColor: state === 'ready' ? '#FFD43B' : zone.color }}
                    >
                      <span
                        className="text-xs font-black tracking-widest uppercase"
                        style={{ color: state === 'ready' ? '#1A1A1A' : '#fff' }}
                      >
                        {state === 'unlocked' ? '✓ OPEN' : '⚡ READY TO UNLOCK'}
                      </span>
                    </div>
                  )}

                  <div className="p-3">
                    <div
                      className="font-black text-base leading-tight"
                      style={{ color: state === 'locked' ? '#1A1A1A50' : '#1A1A1A' }}
                    >
                      {zone.name}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: state === 'locked' ? '#1A1A1A30' : '#1A1A1A80' }}
                    >
                      {zone.label}
                    </div>

                    {state === 'locked' && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <Lock size={13} className="text-ink/40" />
                        <span className="text-xs text-ink/40">
                          Complete {zone.order > 1
                            ? `${zones[idx - 1].threshold} games in ${zones[idx - 1].name}`
                            : 'previous zone'} to unlock
                        </span>
                      </div>
                    )}

                    {state !== 'locked' && (
                      <div className="mt-2">
                        {/* Progress bar */}
                        <div className="flex items-center justify-between text-xs text-ink/60 mb-1">
                          <span>{completed}/{zoneGames.length} games</span>
                          {zone.order < zones.length && (
                            <span className="font-bold">
                              need {zone.threshold} to unlock next
                            </span>
                          )}
                        </div>
                        <div className="h-2 rounded-full bg-ink/10 overflow-hidden border border-ink/20">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${(completed / zoneGames.length) * 100}%`,
                              backgroundColor: zone.color,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {state === 'ready' && (
                      <button
                        onClick={() => onUnlockZone(zone.id)}
                        className="mt-3 w-full py-2 font-black text-sm border-2 border-ink rounded"
                        style={{ backgroundColor: '#FFD43B', boxShadow: '3px 3px 0 #1A1A1A' }}
                      >
                        ENTER PASSCODE →
                      </button>
                    )}

                    {state === 'unlocked' && (
                      <div className="flex items-center gap-1 mt-2 text-xs font-bold text-mint">
                        <CheckCircle size={13} />
                        Zone unlocked
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
