'use client'

import { useState } from 'react'
import { Lock, Flame, Star, Play } from 'lucide-react'
import { games } from '@/data/games'
import { zones } from '@/data/zones'
import type { Game, GameCategory } from '@/types'

const CATEGORIES: GameCategory[] = [
  'STREET HUNT',
  'TASTE LAB',
  'HERITAGE',
  'CREATIVE',
  'ESCAPE LOGIC',
  'SOCIAL',
  'ARENA',
  'ART OF MAKING',
  'WILDCARD',
  'MUSEUM',
]

const CATEGORY_COLORS: Record<GameCategory, string> = {
  'STREET HUNT': '#FF5A4E',
  'TASTE LAB': '#FFD43B',
  'HERITAGE': '#2EC4F1',
  'CREATIVE': '#9B5DE5',
  'ESCAPE LOGIC': '#3DDC97',
  'SOCIAL': '#FF85A2',
  'ARENA': '#FF5A4E',
  'ART OF MAKING': '#FF85A2',
  'WILDCARD': '#FFD43B',
  'MUSEUM': '#2EC4F1',
}

interface GamesTabProps {
  completedGameIds: number[]
  unlockedZoneIds: string[]
  budget: number
  onPlay: (game: Game) => void
  onUnlockZone: (zoneId: string) => void
}

export default function GamesTab({
  completedGameIds,
  unlockedZoneIds,
  budget,
  onPlay,
  onUnlockZone,
}: GamesTabProps) {
  const [activeZone, setActiveZone] = useState<string>('all')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filtered = games.filter((g) => {
    const zoneMatch = activeZone === 'all' || g.zone === activeZone
    const catMatch = activeCategory === 'all' || g.category === activeCategory
    return zoneMatch && catMatch
  })

  const isZoneLocked = (zoneId: string) => !unlockedZoneIds.includes(zoneId)

  const isZoneReady = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId)
    if (!zone) return false
    const prevZone = zones.find((z) => z.order === zone.order - 1)
    if (!prevZone) return true
    const completedInPrev = games.filter(
      (g) => g.zone === prevZone.id && completedGameIds.includes(g.id)
    ).length
    return completedInPrev >= prevZone.threshold
  }

  return (
    <div>
      {/* Zone filter */}
      <div
        className="sticky top-0 z-10 flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar"
        style={{ backgroundColor: '#0E1F3A' }}
      >
        <ZonePill
          label="ALL"
          active={activeZone === 'all'}
          onClick={() => setActiveZone('all')}
          color="#FF5A4E"
        />
        {zones.map((z) => (
          <ZonePill
            key={z.id}
            label={z.emoji + ' ' + z.name.split(' ')[0]}
            active={activeZone === z.id}
            onClick={() => setActiveZone(z.id)}
            color={z.color}
            locked={isZoneLocked(z.id)}
          />
        ))}
      </div>

      {/* Category filter */}
      <div
        className="flex gap-2 overflow-x-auto px-4 py-2 no-scrollbar border-b-2 border-ink/10"
        style={{ backgroundColor: '#FFF8EE' }}
      >
        <CategoryPill label="ALL" active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} />
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat}
            label={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            color={CATEGORY_COLORS[cat]}
          />
        ))}
      </div>

      {/* Mission cards */}
      <div className="px-4 py-3 flex flex-col gap-3">
        {filtered.map((game) => (
          <MissionCard
            key={game.id}
            game={game}
            completed={completedGameIds.includes(game.id)}
            locked={isZoneLocked(game.zone)}
            ready={isZoneReady(game.zone)}
            affordable={budget >= game.cost}
            onPlay={() => onPlay(game)}
            onUnlock={() => onUnlockZone(game.zone)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-ink/40">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-bold">No missions found</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ZonePill({
  label,
  active,
  onClick,
  color,
  locked,
}: {
  label: string
  active: boolean
  onClick: () => void
  color: string
  locked?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full border-2 transition-all"
      style={{
        backgroundColor: active ? color : 'transparent',
        borderColor: active ? color : 'rgba(255,255,255,0.3)',
        color: active ? '#fff' : locked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
      }}
    >
      {locked && !active ? '🔒 ' : ''}{label}
    </button>
  )
}

function CategoryPill({
  label,
  active,
  onClick,
  color,
}: {
  label: string
  active: boolean
  onClick: () => void
  color?: string
}) {
  const bg = active ? (color ?? '#FF5A4E') : 'transparent'
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full border-2 transition-all whitespace-nowrap"
      style={{
        backgroundColor: bg,
        borderColor: active ? (color ?? '#FF5A4E') : '#1A1A1A30',
        color: active ? '#fff' : '#1A1A1A',
      }}
    >
      {label}
    </button>
  )
}

interface MissionCardProps {
  game: Game
  completed: boolean
  locked: boolean
  ready: boolean
  affordable: boolean
  onPlay: () => void
  onUnlock: () => void
}

function MissionCard({ game, completed, locked, ready, affordable, onPlay, onUnlock }: MissionCardProps) {
  const zone = zones.find((z) => z.id === game.zone)

  if (locked) {
    return (
      <div
        className="rounded-lg overflow-hidden border-2 border-dashed opacity-60"
        style={{ borderColor: '#1A1A1A50' }}
      >
        <div className="p-3 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0 border-2 border-dashed"
            style={{ borderColor: '#1A1A1A40' }}
          >
            <Lock size={18} className="text-ink/40" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-ink/50 truncate">{game.title}</div>
            <div className="text-xs text-ink/40">
              {zone?.emoji} {zone?.name} · Locked
            </div>
          </div>
          {ready && (
            <button
              onClick={onUnlock}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-black border-2 border-ink rounded"
              style={{ backgroundColor: '#FFD43B', boxShadow: '3px 3px 0 #1A1A1A' }}
            >
              UNLOCK
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="rounded-lg overflow-hidden border-2 border-ink relative"
      style={{
        boxShadow: '4px 4px 0px #1A1A1A',
        opacity: completed ? 0.7 : 1,
      }}
    >
      {/* Completed badge */}
      {completed && (
        <div
          className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded text-xs font-black text-white"
          style={{ backgroundColor: '#3DDC97' }}
        >
          +{game.points} pts ✓
        </div>
      )}

      {/* Wildcard badge */}
      {game.category === 'WILDCARD' && !completed && (
        <div
          className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded text-xs font-black text-white flex items-center gap-1"
          style={{ backgroundColor: '#FF5A4E' }}
        >
          <Flame size={11} />
          BONUS
        </div>
      )}

      {/* Museum badge */}
      {game.isMuseum && !completed && (
        <div
          className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded text-xs font-black flex items-center gap-1"
          style={{ backgroundColor: '#FFD43B', color: '#1A1A1A' }}
        >
          <Star size={11} />
          MUSEUM
        </div>
      )}

      {/* Color band */}
      <div
        className="px-3 py-1.5 flex items-center gap-2"
        style={{ backgroundColor: game.color }}
      >
        <span className="text-white font-black text-xs tracking-widest uppercase">
          {game.category}
        </span>
      </div>

      <div className="p-3" style={{ backgroundColor: '#FFF8EE' }}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded flex items-center justify-center text-xl flex-shrink-0 border-2 border-ink"
            style={{ backgroundColor: game.color + '22' }}
          >
            {game.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm text-ink leading-tight">
              #{game.id} {game.title}
            </div>
            <div className="text-xs text-ink/60 mt-0.5">
              {zone?.emoji} {zone?.name} · {game.time} min
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center gap-2 mt-2.5">
          <span
            className="px-2 py-0.5 text-xs font-black rounded border border-ink"
            style={{ backgroundColor: '#FF5A4E', color: '#fff' }}
          >
            {game.points} PTS
          </span>
          <span
            className="px-2 py-0.5 text-xs font-black rounded border border-ink"
            style={{
              backgroundColor: game.cost === 0 ? '#3DDC97' : '#FFD43B',
              color: '#1A1A1A',
            }}
          >
            {game.cost === 0 ? 'FREE' : `RM${game.cost}`}
          </span>

          <div className="flex-1" />

          {!completed && (
            <button
              onClick={onPlay}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black border-2 border-ink rounded"
              style={{
                backgroundColor: affordable ? '#0E1F3A' : '#1A1A1A40',
                color: '#FFD43B',
                boxShadow: affordable ? '3px 3px 0 #1A1A1A' : 'none',
              }}
              disabled={!affordable}
            >
              <Play size={11} strokeWidth={3} />
              PLAY
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
