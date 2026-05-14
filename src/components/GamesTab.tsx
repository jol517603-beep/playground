'use client'

import { Lock, Flame, Star, Play, CheckCircle2, MapPin, BookOpen, ChevronRight } from 'lucide-react'
import { games } from '@/data/games'
import { zones } from '@/data/zones'
import type { Game, Zone } from '@/types'

interface GamesTabProps {
  completedGameIds: number[]
  unlockedZoneIds: string[]
  budget: number
  currentZone: Zone
  onPlay: (game: Game) => void
  onUnlockZone: (zoneId: string) => void
}

export default function GamesTab({
  completedGameIds,
  unlockedZoneIds,
  budget,
  currentZone,
  onPlay,
  onUnlockZone,
}: GamesTabProps) {
  const zoneGames = games.filter((g) => g.zone === currentZone.id)
  const completedCount = zoneGames.filter((g) => completedGameIds.includes(g.id)).length
  const nextZone = zones.find((z) => z.order === currentZone.order + 1)
  const nextUnlocked = nextZone ? unlockedZoneIds.includes(nextZone.id) : false
  const canUnlockNext = nextZone && !nextUnlocked && completedCount >= currentZone.threshold
  const progressPct = Math.min(100, (completedCount / currentZone.threshold) * 100)

  return (
    <div style={{ backgroundColor: '#FFF8EE' }}>
      {/* ── Zone Header ────────────────────────────────── */}
      <div style={{ backgroundColor: currentZone.color }}>
        {/* Title */}
        <div className="px-4 pt-5 pb-2">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-widest mb-2"
            style={{ backgroundColor: 'rgba(0,0,0,0.18)', color: '#fff' }}
          >
            ZONE {currentZone.order}
          </div>
          <h2 className="text-white font-black text-2xl leading-tight">
            {currentZone.emoji} {currentZone.name}
          </h2>
          <p className="text-white/70 text-sm font-medium mt-0.5">{currentZone.label}</p>
        </div>

        {/* Game Area */}
        {currentZone.gameArea && (
          <div className="mx-4 mb-3 rounded-xl overflow-hidden border border-white/20">
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{ backgroundColor: 'rgba(0,0,0,0.22)' }}
            >
              <MapPin size={14} className="text-white/70 flex-shrink-0" />
              <span className="text-white/60 text-xs font-black uppercase tracking-wider">Game Area</span>
            </div>
            <div
              className="px-3 py-2.5"
              style={{ backgroundColor: 'rgba(0,0,0,0.14)' }}
            >
              <p className="text-white font-semibold text-sm leading-snug">{currentZone.gameArea}</p>
            </div>
          </div>
        )}

        {/* Game Rules */}
        {currentZone.rules && currentZone.rules.length > 0 && (
          <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-white/20">
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{ backgroundColor: 'rgba(0,0,0,0.22)' }}
            >
              <BookOpen size={14} className="text-white/70 flex-shrink-0" />
              <span className="text-white/60 text-xs font-black uppercase tracking-wider">Game Rules</span>
            </div>
            <div
              className="px-3 py-2.5 space-y-1.5"
              style={{ backgroundColor: 'rgba(0,0,0,0.14)' }}
            >
              {currentZone.rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-white/40 text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <p className="text-white/90 text-xs leading-snug">{rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress to next zone */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-white/70 text-xs font-bold">
              {completedCount}/{currentZone.threshold} missions to unlock Zone {currentZone.order + 1}
            </span>
            <span className="text-white/60 text-xs">{zoneGames.length} missions total</span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: '#FFD43B' }}
            />
          </div>
          {completedCount >= currentZone.threshold && (
            <p className="text-white font-black text-xs mt-1.5">
              ✓ Threshold met — you can now unlock {nextZone ? nextZone.name : 'the next zone'}!
            </p>
          )}
        </div>
      </div>

      {/* ── Mission Cards ───────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 flex flex-col gap-3">
        {zoneGames.map((game) => (
          <MissionCard
            key={game.id}
            game={game}
            completed={completedGameIds.includes(game.id)}
            affordable={budget >= game.cost}
            onPlay={() => onPlay(game)}
          />
        ))}
        {zoneGames.length === 0 && (
          <div className="text-center py-12 text-ink/40">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-bold">No missions for this zone</p>
          </div>
        )}
      </div>

      {/* ── Next Zone Card ──────────────────────────────── */}
      {nextZone && !nextUnlocked && (
        <div className="px-4 pb-6">
          <div
            className="rounded-xl border-2 overflow-hidden"
            style={{
              borderColor: canUnlockNext ? nextZone.color : '#1A1A1A30',
              boxShadow: canUnlockNext ? `4px 4px 0 ${nextZone.color}60` : 'none',
            }}
          >
            {/* Header band */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                backgroundColor: canUnlockNext ? nextZone.color + '22' : '#1A1A1A08',
              }}
            >
              <div className="flex items-center gap-3">
                <Lock
                  size={20}
                  style={{ color: canUnlockNext ? nextZone.color : '#1A1A1A40' }}
                />
                <div>
                  <div
                    className="text-xs font-black uppercase tracking-widest mb-0.5"
                    style={{ color: canUnlockNext ? nextZone.color : '#1A1A1A40' }}
                  >
                    Zone {nextZone.order} — Locked
                  </div>
                  <div className="font-black text-ink text-base">
                    {nextZone.emoji} {nextZone.name}
                  </div>
                  <div className="text-xs text-ink/40">{nextZone.label}</div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 py-3" style={{ backgroundColor: '#fff' }}>
              {canUnlockNext ? (
                <>
                  <p className="text-sm text-ink/70 mb-3">
                    You&apos;ve completed <span className="font-black text-ink">{completedCount}</span> missions — threshold met!
                    Enter the zone passcode to continue.
                  </p>
                  <button
                    onClick={() => onUnlockZone(nextZone.id)}
                    className="w-full py-3 font-black text-sm border-2 border-ink rounded flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: nextZone.color,
                      color: '#fff',
                      boxShadow: '3px 3px 0 #1A1A1A',
                    }}
                  >
                    UNLOCK {nextZone.name.toUpperCase()}
                    <ChevronRight size={16} strokeWidth={3} />
                  </button>
                </>
              ) : (
                <p className="text-sm text-ink/60">
                  Complete{' '}
                  <span className="font-black text-ink">
                    {currentZone.threshold - completedCount} more mission
                    {currentZone.threshold - completedCount !== 1 ? 's' : ''}
                  </span>{' '}
                  in {currentZone.name} to unlock.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Already unlocked next zone */}
      {nextZone && nextUnlocked && (
        <div className="px-4 pb-4">
          <div
            className="rounded-lg border-2 border-ink py-3 px-4 flex items-center gap-3"
            style={{ backgroundColor: '#3DDC97', boxShadow: '3px 3px 0 #1A1A1A' }}
          >
            <CheckCircle2 size={20} className="text-white flex-shrink-0" />
            <div>
              <div className="font-black text-white text-sm">Zone {nextZone.order} Unlocked!</div>
              <div className="text-white/80 text-xs">{nextZone.emoji} {nextZone.name} is now active</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface MissionCardProps {
  game: Game
  completed: boolean
  affordable: boolean
  onPlay: () => void
}

function MissionCard({ game, completed, affordable, onPlay }: MissionCardProps) {
  const zone = zones.find((z) => z.id === game.zone)

  return (
    <div
      className="rounded-lg overflow-hidden border-2 border-ink"
      style={{
        boxShadow: '4px 4px 0px #1A1A1A',
        opacity: completed ? 0.72 : 1,
      }}
    >
      {/* Completed band */}
      {completed && (
        <div
          className="px-3 py-1.5 flex items-center gap-2"
          style={{ backgroundColor: '#3DDC97' }}
        >
          <CheckCircle2 size={13} className="text-white" />
          <span className="text-white font-black text-xs tracking-wide">
            COMPLETED · +{game.points} pts
          </span>
        </div>
      )}

      {/* Category band (only when not completed) */}
      {!completed && (
        <div
          className="px-3 py-1.5 flex items-center justify-between"
          style={{ backgroundColor: game.color }}
        >
          <span className="text-white font-black text-xs tracking-widest uppercase">
            {game.category}
          </span>
          {game.category === 'WILDCARD' && (
            <span className="flex items-center gap-1 text-white/90 text-xs font-bold">
              <Flame size={11} /> BONUS
            </span>
          )}
          {game.isMuseum && (
            <span className="flex items-center gap-1 text-xs font-black" style={{ color: '#FFD43B' }}>
              <Star size={11} /> MUSEUM
            </span>
          )}
        </div>
      )}

      <div className="p-3" style={{ backgroundColor: '#fff' }}>
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
            <p className="text-xs text-ink/55 mt-0.5 leading-snug line-clamp-2">
              {game.description}
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <span
            className="px-2 py-0.5 text-xs font-black rounded border border-ink"
            style={{ backgroundColor: '#0E1F3A', color: '#FFD43B' }}
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
          <span
            className="px-2 py-0.5 text-xs rounded border border-ink/20 text-ink/50"
          >
            {game.time} min
          </span>
          {zone && (
            <span className="px-2 py-0.5 text-xs rounded border text-xs font-medium" style={{ borderColor: zone.color + '60', color: zone.color, backgroundColor: zone.color + '12' }}>
              {zone.emoji}
            </span>
          )}

          <div className="flex-1" />

          {!completed && (
            <button
              onClick={onPlay}
              disabled={!affordable}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black border-2 border-ink rounded"
              style={{
                backgroundColor: affordable ? '#0E1F3A' : '#1A1A1A20',
                color: affordable ? '#FFD43B' : '#1A1A1A40',
                boxShadow: affordable ? '3px 3px 0 #1A1A1A' : 'none',
              }}
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
