'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster, toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { LeaderboardRow } from '@/types/supabase'

interface LeaderboardProps {
  eventId: string
  currentTeamId: string
}

export default function Leaderboard({ eventId, currentTeamId }: LeaderboardProps) {
  const [rows, setRows] = useState<LeaderboardRow[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from('live_leaderboard')
      .select('*')
      .eq('event_id', eventId)
      .order('score', { ascending: false })
    if (data) setRows(data as LeaderboardRow[])
    setLoading(false)
  }, [eventId, supabase])

  useEffect(() => {
    fetchLeaderboard()

    const channel = supabase
      .channel(`leaderboard-${eventId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'teams', filter: `event_id=eq.${eventId}` },
        async (payload) => {
          const updated = payload.new as { name: string; score: number; id: string }
          if (updated.id !== currentTeamId) {
            toast(`🔥 ${updated.name} just scored!`, {
              description: `Score: ${updated.score}`,
              duration: 3000,
            })
          }
          await fetchLeaderboard()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId, currentTeamId, fetchLeaderboard, supabase])

  if (loading) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="text-3xl animate-pulse mb-3">🏆</div>
        <div className="font-bold text-ink/50">Loading standings...</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <Toaster position="top-center" richColors />

      <div
        className="rounded-lg border-2 border-ink p-4 mb-4"
        style={{ backgroundColor: '#0E1F3A', boxShadow: '4px 4px 0 #1A1A1A' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="text-white font-black text-lg">Live Standings</div>
            <div className="text-white/50 text-xs">Updates in real-time</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
            <span className="text-mint text-xs font-bold">LIVE</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {rows.map((row, idx) => {
          const isMe = row.id === currentTeamId
          const isFirst = idx === 0
          return (
            <motion.div
              key={row.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="mb-2"
            >
              <div
                className="rounded-lg border-2 overflow-hidden"
                style={{
                  borderColor: isMe ? '#FF5A4E' : '#1A1A1A',
                  boxShadow: isMe ? '4px 4px 0 #FF5A4E' : '3px 3px 0 #1A1A1A',
                  backgroundColor: isMe ? '#FFF0EE' : '#FFF8EE',
                }}
              >
                <div className="flex items-center gap-3 px-3 py-3">
                  {/* Rank badge */}
                  <div
                    className="w-9 h-9 rounded-full border-2 border-ink flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{
                      backgroundColor:
                        idx === 0 ? '#FFD43B'
                        : idx === 1 ? '#E5E5E5'
                        : idx === 2 ? '#FFB347'
                        : '#FFF8EE',
                      color: '#1A1A1A',
                    }}
                  >
                    {isFirst ? '👑' : `#${idx + 1}`}
                  </div>

                  {/* Team info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-ink truncate">{row.name}</span>
                      {isMe && (
                        <span
                          className="px-1.5 py-0.5 text-[10px] font-black rounded border border-coral"
                          style={{ backgroundColor: '#FF5A4E', color: '#fff' }}
                        >
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ink/50">
                      Team #{row.team_number} · {row.approved_count} missions
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <div
                      className="font-black text-xl"
                      style={{ color: isMe ? '#FF5A4E' : '#1A1A1A' }}
                    >
                      {row.score}
                    </div>
                    <div className="text-xs text-ink/40">pts</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {rows.length === 0 && (
        <div className="text-center py-10 text-ink/40">
          <p className="text-3xl mb-2">📋</p>
          <p className="font-bold">No teams yet</p>
        </div>
      )}
    </div>
  )
}
