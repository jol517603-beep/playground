'use client'

import { useState } from 'react'
import { zones } from '@/data/zones'
import { games } from '@/data/games'

// Georgetown bounding box approximation
// lat: 5.410 – 5.425, lng: 100.330 – 100.345
const MAP_W = 380
const MAP_H = 480

const LAT_MIN = 5.410
const LAT_MAX = 5.426
const LNG_MIN = 100.330
const LNG_MAX = 100.346

function toXY(lat: number, lng: number): [number, number] {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * MAP_W
  const y = MAP_H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * MAP_H
  return [x, y]
}

interface MapTabProps {
  completedGameIds: number[]
  unlockedZoneIds: string[]
  onPlay: (game: (typeof games)[0]) => void
}

export default function MapTab({ completedGameIds, unlockedZoneIds, onPlay }: MapTabProps) {
  const [selectedGame, setSelectedGame] = useState<(typeof games)[0] | null>(null)

  const zonePath = zones
    .sort((a, b) => a.order - b.order)
    .map(z => toXY(z.lat, z.lng))
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')

  return (
    <div className="px-3 py-4">
      {/* SVG Map */}
      <div
        className="rounded-xl border-2 border-ink overflow-hidden mb-4"
        style={{ boxShadow: '4px 4px 0 #1A1A1A', backgroundColor: '#E8F4F0' }}
      >
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          width="100%"
          style={{ display: 'block' }}
        >
          {/* Background */}
          <rect width={MAP_W} height={MAP_H} fill="#E8F4F0" />

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((f, i) => (
            <g key={i}>
              <line x1={MAP_W * f} y1={0} x2={MAP_W * f} y2={MAP_H} stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="4 4" />
              <line x1={0} y1={MAP_H * f} x2={MAP_W} y2={MAP_H * f} stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="4 4" />
            </g>
          ))}

          {/* Zone path polyline */}
          <path d={zonePath} fill="none" stroke="#FF5A4E" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />

          {/* Mission pins */}
          {games.map(game => {
            const isLocked = !unlockedZoneIds.includes(game.zone)
            if (isLocked) return null
            const [x, y] = toXY(game.lat, game.lng)
            const isDone = completedGameIds.includes(game.id)
            const isMuseum = game.isMuseum
            return (
              <g
                key={game.id}
                onClick={() => {
                  if (!isDone) setSelectedGame(game)
                }}
                style={{ cursor: isDone ? 'default' : 'pointer' }}
              >
                <circle
                  cx={x} cy={y} r={isDone ? 7 : 8}
                  fill={isDone ? '#3DDC97' : '#fff'}
                  stroke={isDone ? '#0E1F3A' : game.color}
                  strokeWidth="2"
                  opacity={isDone ? 0.8 : 1}
                />
                <text x={x} y={y + 4} textAnchor="middle" fontSize="8" style={{ pointerEvents: 'none' }}>
                  {isDone ? '✓' : isMuseum ? '⭐' : game.icon}
                </text>
              </g>
            )
          })}

          {/* Zone circles */}
          {zones.map(z => {
            const [x, y] = toXY(z.lat, z.lng)
            const isUnlocked = unlockedZoneIds.includes(z.id)
            return (
              <g key={z.id}>
                <circle
                  cx={x} cy={y} r={20}
                  fill={isUnlocked ? z.color : '#94A3B8'}
                  stroke="#1A1A1A"
                  strokeWidth="2"
                  opacity={isUnlocked ? 0.9 : 0.5}
                />
                <text x={x} y={y - 4} textAnchor="middle" fontSize="13" style={{ pointerEvents: 'none' }}>
                  {z.emoji}
                </text>
                <text x={x} y={y + 10} textAnchor="middle" fontSize="8" fontWeight="bold" fill={isUnlocked ? '#fff' : '#475569'} style={{ pointerEvents: 'none' }}>
                  {z.order}
                </text>
              </g>
            )
          })}

          {/* Compass rose */}
          <g transform={`translate(${MAP_W - 28}, ${MAP_H - 28})`}>
            <circle r={18} fill="#0E1F3A" stroke="#fff" strokeWidth="1" opacity="0.8" />
            <text textAnchor="middle" y={-5} fontSize="9" fill="#FFD43B" fontWeight="bold">N</text>
            <text textAnchor="middle" y={13} fontSize="7" fill="rgba(255,255,255,0.5)">S</text>
            <text x={-10} textAnchor="middle" y={5} fontSize="7" fill="rgba(255,255,255,0.5)">W</text>
            <text x={10} textAnchor="middle" y={5} fontSize="7" fill="rgba(255,255,255,0.5)">E</text>
            <polygon points="0,-12 2,0 0,-2 -2,0" fill="#FFD43B" />
          </g>

          {/* Selected pin callout */}
          {selectedGame && (() => {
            const [px, py] = toXY(selectedGame.lat, selectedGame.lng)
            const bx = Math.min(Math.max(px - 60, 4), MAP_W - 124)
            const by = py > MAP_H / 2 ? py - 80 : py + 20
            return (
              <g>
                <rect x={bx} y={by} width={120} height={56} rx={6} fill="#FFF8EE" stroke="#1A1A1A" strokeWidth="1.5" style={{ filter: 'drop-shadow(2px 2px 0 #1A1A1A)' }} />
                <text x={bx + 8} y={by + 16} fontSize="11" fontWeight="bold" fill="#1A1A1A">{selectedGame.icon} {selectedGame.title.slice(0, 14)}</text>
                <text x={bx + 8} y={by + 29} fontSize="9" fill="#1A1A1A99">{selectedGame.points} pts · {selectedGame.cost === 0 ? 'Free' : `RM${selectedGame.cost}`}</text>
                <rect x={bx + 8} y={by + 36} width={50} height={14} rx={3} fill="#FF5A4E" style={{ cursor: 'pointer' }}
                  onClick={() => { onPlay(selectedGame); setSelectedGame(null) }} />
                <text x={bx + 33} y={by + 46} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff" style={{ pointerEvents: 'none' }}>PLAY</text>
                <rect x={bx + 64} y={by + 36} width={48} height={14} rx={3} fill="#E5E7EB" style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedGame(null)} />
                <text x={bx + 88} y={by + 46} textAnchor="middle" fontSize="9" fill="#666" style={{ pointerEvents: 'none' }}>Close</text>
              </g>
            )
          })()}
        </svg>
      </div>

      {/* Zone chip grid */}
      <div className="grid grid-cols-2 gap-2">
        {zones.map(z => {
          const zoneGames = games.filter(g => g.zone === z.id)
          const completed = zoneGames.filter(g => completedGameIds.includes(g.id)).length
          const isUnlocked = unlockedZoneIds.includes(z.id)
          const pct = zoneGames.length > 0 ? Math.round((completed / zoneGames.length) * 100) : 0
          return (
            <div
              key={z.id}
              className="rounded-lg border-2 border-ink p-3"
              style={{
                backgroundColor: isUnlocked ? '#FFF8EE' : '#F5F5F5',
                boxShadow: isUnlocked ? '3px 3px 0 #1A1A1A' : 'none',
                opacity: isUnlocked ? 1 : 0.5,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-lg">{z.emoji}</span>
                <span className="font-black text-xs text-ink truncate">{z.name}</span>
              </div>
              <div className="text-xs text-ink/60 mb-1.5">{completed}/{zoneGames.length} · {pct}%</div>
              <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: z.color }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
