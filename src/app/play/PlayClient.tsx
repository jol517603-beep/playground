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
import { zones } from '@/data/zones'
import { unlockZone } from '@/app/actions/submit'
import type { Game } from '@/types'
import type { TeamRow, EventRow } from '@/types/supabase'

interface PlayClientProps {
  team: TeamRow
  event: EventRow
  unlockedZoneIds: string[]
  completedGameIds: number[]
}

export default function PlayClient({
  team: initialTeam,
  event,
  unlockedZoneIds: initialUnlocked,
  completedGameIds: initialCompleted,
}: PlayClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [activeTab, setActiveTab] = useState<TabId>('games')
  const [passcodeZoneId, setPasscodeZoneId] = useState<string | null>(null)
  const [activeGame, setActiveGame] = useState<Game | null>(null)

  // Optimistic state (refreshed from server after mutations)
  const [localScore, setLocalScore] = useState(initialTeam.score)
  const [localBudget, setLocalBudget] = useState(initialTeam.budget_remaining)
  const [localCompleted, setLocalCompleted] = useState<number[]>(initialCompleted)
  const [localUnlocked, setLocalUnlocked] = useState<string[]>(
    initialUnlocked.length > 0 ? initialUnlocked : ['beach-street']
  )

  const eventEndsAt = event.ends_at ? new Date(event.ends_at) : new Date(Date.now() + 3 * 3600 * 1000)

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
    // Optimistic update
    setLocalScore(newScore ?? localScore + game.points)
    setLocalBudget((b) => Math.max(0, b - game.cost))
    setLocalCompleted((prev) => (prev.includes(game.id) ? prev : [...prev, game.id]))
    setActiveGame(null)
    // Refresh server state
    startTransition(() => router.refresh())
  }

  const rank = 1 // Will be populated from leaderboard data in live mode

  return (
    <AppShell>
      <Header
        team={{ ...optimisticTeam, score: localScore, budget: localBudget, completedGameIds: localCompleted, unlockedZoneIds: localUnlocked, photoCount: optimisticTeam.photo_count, number: optimisticTeam.team_number }}
        currentZone={currentZone}
        eventEndsAt={eventEndsAt}
        rank={rank}
      />

      <main className="flex-1 overflow-y-auto" style={{ paddingTop: '148px', paddingBottom: '72px' }}>
        {activeTab === 'games' && (
          <GamesTab
            completedGameIds={localCompleted}
            unlockedZoneIds={localUnlocked}
            budget={localBudget}
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
          <div className="px-4 py-6">
            <div
              className="rounded-lg border-2 border-ink p-5"
              style={{ backgroundColor: '#0E1F3A', boxShadow: '4px 4px 0 #1A1A1A' }}
            >
              <div className="text-white/50 text-xs uppercase tracking-widest mb-1">Team</div>
              <div className="text-white font-black text-2xl">{initialTeam.name}</div>
              <div className="text-white/60 text-sm">#{initialTeam.team_number}</div>
              {initialTeam.war_cry && (
                <div className="mt-2 text-white/50 italic text-sm">"{initialTeam.war_cry}"</div>
              )}
              <div className="grid grid-cols-2 gap-3 mt-5">
                {[
                  { label: 'Score', value: localScore, color: '#FFD43B' },
                  { label: 'Budget', value: `RM${localBudget}`, color: '#3DDC97' },
                  { label: 'Missions', value: localCompleted.length, color: '#FF85A2' },
                  { label: 'Photos', value: optimisticTeam.photo_count, color: '#2EC4F1' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white/10 rounded p-3 border border-white/10">
                    <div className="font-black text-xl" style={{ color }}>{value}</div>
                    <div className="text-white/50 text-xs uppercase tracking-wide mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
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
          </div>
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
