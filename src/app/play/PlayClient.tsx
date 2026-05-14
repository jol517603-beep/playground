'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import Header from '@/components/Header'
import BottomNav, { type TabId } from '@/components/BottomNav'
import GamesTab from '@/components/GamesTab'
import PathTab from '@/components/PathTab'
import PasscodeModal from '@/components/PasscodeModal'
import PhotoUploadModal from '@/components/PhotoUploadModal'
import Leaderboard from '@/components/Leaderboard'
import MapTab from '@/components/MapTab'
import TeamSetupModal from '@/components/TeamSetupModal'
import { zones } from '@/data/zones'
import { unlockZone } from '@/app/actions/submit'
import type { Game } from '@/types'
import type { TeamRow, EventRow } from '@/types/supabase'

interface PlayClientProps {
  team: TeamRow
  event: EventRow
  unlockedZoneIds: string[]
  completedGameIds: number[]
  teamPhotos: string[]
}

export default function PlayClient({
  team: initialTeam,
  event,
  unlockedZoneIds: initialUnlocked,
  completedGameIds: initialCompleted,
  teamPhotos,
}: PlayClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [activeTab, setActiveTab] = useState<TabId>('games')
  const [passcodeZoneId, setPasscodeZoneId] = useState<string | null>(null)
  const [activeGame, setActiveGame] = useState<Game | null>(null)
  const [showSetup, setShowSetup] = useState(!initialTeam.war_cry)
  const [teamPhotoUrl, setTeamPhotoUrl] = useState<string | null>(
    (initialTeam as TeamRow & { team_photo_url?: string | null }).team_photo_url ?? null
  )

  // Optimistic state
  const [localScore, setLocalScore] = useState(initialTeam.score)
  const [localBudget, setLocalBudget] = useState(initialTeam.budget_remaining)
  const [localCompleted, setLocalCompleted] = useState<number[]>(initialCompleted)
  const [localUnlocked, setLocalUnlocked] = useState<string[]>(
    initialUnlocked.length > 0 ? initialUnlocked : ['beach-street']
  )
  const [localWarCry, setLocalWarCry] = useState(initialTeam.war_cry)

  const timerDurationMs = (event.timer_duration_seconds ?? 12600) * 1000
  const eventEndsAt = event.ends_at
    ? new Date(event.ends_at)
    : new Date(Date.now() + timerDurationMs)

  const currentZone =
    zones
      .filter((z) => localUnlocked.includes(z.id))
      .sort((a, b) => b.order - a.order)[0] ?? zones[0]

  const optimisticTeam = {
    ...initialTeam,
    score: localScore,
    budget_remaining: localBudget,
  }

  const handlePasscodeSuccess = async (zoneId: string) => {
    setLocalUnlocked((prev) => (prev.includes(zoneId) ? prev : [...prev, zoneId]))
    setPasscodeZoneId(null)
    const result = await unlockZone(zoneId)
    if (result.success) {
      startTransition(() => router.refresh())
    }
  }

  const handlePhotoSubmit = (game: Game, newScore?: number) => {
    setLocalScore(newScore ?? localScore + game.points)
    setLocalBudget((b) => Math.max(0, b - game.cost))
    setLocalCompleted((prev) => (prev.includes(game.id) ? prev : [...prev, game.id]))
    setActiveGame(null)
    startTransition(() => router.refresh())
  }

  const handleSetupDone = (warCry: string, photoUrl?: string) => {
    setLocalWarCry(warCry)
    if (photoUrl) setTeamPhotoUrl(photoUrl)
    setShowSetup(false)
  }

  if (showSetup) {
    return (
      <TeamSetupModal
        teamName={initialTeam.name}
        teamNumber={initialTeam.team_number}
        existingWarCry={localWarCry}
        onDone={handleSetupDone}
      />
    )
  }

  return (
    <AppShell>
      <Header
        team={{
          ...optimisticTeam,
          score: localScore,
          budget: localBudget,
          completedGameIds: localCompleted,
          unlockedZoneIds: localUnlocked,
          photoCount: optimisticTeam.photo_count,
          number: optimisticTeam.team_number,
        }}
        currentZone={currentZone}
        eventEndsAt={eventEndsAt}
        timerDurationMs={timerDurationMs}
        rank={1}
      />

      <main className="flex-1 overflow-y-auto" style={{ paddingTop: '148px', paddingBottom: '72px' }}>
        {activeTab === 'games' && (
          <GamesTab
            completedGameIds={localCompleted}
            unlockedZoneIds={localUnlocked}
            budget={localBudget}
            currentZone={currentZone}
            onPlay={setActiveGame}
            onUnlockZone={setPasscodeZoneId}
          />
        )}

        {activeTab === 'path' && (
          <PathTab
            completedGameIds={localCompleted}
            unlockedZoneIds={localUnlocked}
            onUnlockZone={setPasscodeZoneId}
          />
        )}

        {activeTab === 'map' && (
          <MapTab
            completedGameIds={localCompleted}
            unlockedZoneIds={localUnlocked}
            onPlay={setActiveGame}
          />
        )}

        {activeTab === 'rank' && (
          <Leaderboard
            eventId={event.id}
            currentTeamId={initialTeam.id}
          />
        )}

        {activeTab === 'team' && (
          <TeamTab
            team={{ ...optimisticTeam, score: localScore, budget_remaining: localBudget }}
            localCompleted={localCompleted}
            localUnlocked={localUnlocked}
            localWarCry={localWarCry}
            teamPhotoUrl={teamPhotoUrl}
            teamPhotos={teamPhotos}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {passcodeZoneId && (
        <PasscodeModal
          zoneId={passcodeZoneId}
          completedGameIds={localCompleted}
          onSuccess={handlePasscodeSuccess}
          onClose={() => setPasscodeZoneId(null)}
        />
      )}

      {activeGame && (
        <PhotoUploadModal
          game={activeGame}
          onSubmit={handlePhotoSubmit}
          onClose={() => setActiveGame(null)}
          liveMode={true}
        />
      )}
    </AppShell>
  )
}

// ── Team Tab Component ─────────────────────────────────────────────
interface TeamTabProps {
  team: TeamRow
  localCompleted: number[]
  localUnlocked: string[]
  localWarCry: string | null
  teamPhotoUrl: string | null
  teamPhotos: string[]
}

function TeamTab({
  team,
  localCompleted,
  localUnlocked,
  localWarCry,
  teamPhotoUrl,
  teamPhotos,
}: TeamTabProps) {
  return (
    <div className="px-4 py-6 space-y-4">
      {/* Team card */}
      <div
        className="rounded-lg border-2 border-ink p-5"
        style={{ backgroundColor: '#0E1F3A', boxShadow: '4px 4px 0 #1A1A1A' }}
      >
        <div className="flex items-start gap-4">
          {/* Team photo */}
          <div
            className="w-16 h-16 rounded-full border-3 border-white/30 flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 3 }}
          >
            {teamPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={teamPhotoUrl} alt="Team" className="w-full h-full object-cover" />
            ) : (
              '👥'
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-white/50 text-xs uppercase tracking-widest mb-0.5">Team</div>
            <div className="text-white font-black text-xl leading-tight truncate">{team.name}</div>
            <div className="text-white/50 text-sm">#{team.team_number}</div>
            {localWarCry && (
              <div className="mt-1.5 text-white/60 italic text-xs leading-snug">
                &ldquo;{localWarCry}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          {[
            { label: 'Score', value: team.score, color: '#FFD43B' },
            { label: 'Budget', value: `RM${team.budget_remaining}`, color: '#3DDC97' },
            { label: 'Missions', value: localCompleted.length, color: '#FF85A2' },
            { label: 'Photos', value: team.photo_count, color: '#2EC4F1' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/10 rounded p-3 border border-white/10">
              <div className="font-black text-xl" style={{ color }}>{value}</div>
              <div className="text-white/50 text-xs uppercase tracking-wide mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Zones unlocked */}
        <div className="mt-4">
          <div className="text-white/50 text-xs uppercase tracking-wide mb-2">Zones Unlocked</div>
          <div className="flex flex-wrap gap-2">
            {zones.map((z) => (
              <span
                key={z.id}
                className="px-2 py-1 text-xs font-bold rounded border"
                style={{
                  backgroundColor: localUnlocked.includes(z.id) ? z.color : 'transparent',
                  borderColor: localUnlocked.includes(z.id) ? z.color : 'rgba(255,255,255,0.2)',
                  color: localUnlocked.includes(z.id) ? '#fff' : 'rgba(255,255,255,0.3)',
                }}
              >
                {z.emoji} {z.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Photo gallery */}
      {teamPhotos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-ink text-base">📷 Team Photos</h3>
            <span className="text-ink/40 text-xs">{teamPhotos.length} uploaded</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {teamPhotos.map((url, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg border-2 border-ink overflow-hidden"
                style={{ boxShadow: '2px 2px 0 #1A1A1A' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Mission photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {teamPhotos.length === 0 && (
        <div
          className="rounded-lg border-2 border-dashed p-6 text-center"
          style={{ borderColor: '#1A1A1A30' }}
        >
          <div className="text-3xl mb-2">📷</div>
          <p className="font-bold text-ink/40 text-sm">No photos yet</p>
          <p className="text-ink/30 text-xs mt-1">Complete missions to build your gallery</p>
        </div>
      )}
    </div>
  )
}
