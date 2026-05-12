'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { zones } from '@/data/zones'
import { games } from '@/data/games'
import type { TeamRow, EventRow, CompletionRow } from '@/types/supabase'
import type { User } from '@supabase/supabase-js'

type Tab = 'control' | 'photos' | 'standings' | 'zones' | 'adjust'

interface TeamZoneRow { team_id: string; zone_id: string }

interface AdminClientProps {
  user: User
  events: EventRow[]
  teams: TeamRow[]
  completions: CompletionRow[]
  teamZones: TeamZoneRow[]
}

export default function AdminClient({ user, events, teams, completions, teamZones }: AdminClientProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<Tab>('control')
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [adjustTeamId, setAdjustTeamId] = useState('')
  const [adjustScore, setAdjustScore] = useState('')
  const [adjustBudget, setAdjustBudget] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()
  const activeEvent = events.find(e => e.status === 'live') ?? events[0]

  const eventTeams = teams.filter(t => t.event_id === activeEvent?.id)
  const pendingPhotos = completions.filter(c => c.status === 'pending')

  const refresh = () => startTransition(() => router.refresh())

  const setEventStatus = async (status: 'live' | 'finished' | 'draft') => {
    if (!activeEvent) return
    await supabase.from('events').update({ status }).eq('id', activeEvent.id)
    refresh()
  }

  const sendBroadcast = async () => {
    if (!activeEvent || !broadcastMsg.trim()) return
    await supabase.from('broadcasts').insert({
      event_id: activeEvent.id,
      message: broadcastMsg.trim(),
      sent_by: user.email ?? 'GM',
    })
    setBroadcastMsg('')
    refresh()
  }

  const reviewPhoto = async (completionId: string, action: 'approved' | 'rejected') => {
    const completion = completions.find(c => c.id === completionId)
    if (!completion) return
    await supabase.from('completions').update({ status: action }).eq('id', completionId)
    if (action === 'rejected') {
      const game = games.find(g => g.id === completion.game_id)
      if (game) {
        const team = teams.find(t => t.id === completion.team_id)
        if (team) {
          await supabase.from('teams').update({
            score: Math.max(0, team.score - completion.points_awarded),
            budget_remaining: team.budget_remaining + game.cost,
          }).eq('id', team.id)
        }
      }
    }
    refresh()
  }

  const saveAdjust = async () => {
    if (!adjustTeamId) return
    setSaving(true)
    const updates: { score?: number; budget_remaining?: number } = {}
    if (adjustScore !== '') updates.score = Number(adjustScore)
    if (adjustBudget !== '') updates.budget_remaining = Number(adjustBudget)
    await supabase.from('teams').update(updates).eq('id', adjustTeamId)
    setAdjustScore(''); setAdjustBudget(''); setSaving(false)
    refresh()
  }

  // Score chart data — mock time buckets
  const chartData = eventTeams.slice(0, 6).map(t => ({
    name: t.name,
    score: t.score,
  }))

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: 'control', label: '⚡ Control' },
    { id: 'photos', label: '📸 Photos', badge: pendingPhotos.length },
    { id: 'standings', label: '📊 Standings' },
    { id: 'zones', label: '🗺️ Zones' },
    { id: 'adjust', label: '🔧 Adjust' },
  ]

  return (
    <div className="min-h-screen text-white">
      {/* Top bar */}
      <div className="border-b border-white/10 px-6 py-3 flex items-center justify-between" style={{ backgroundColor: '#0E1F3A' }}>
        <div className="flex items-center gap-3">
          <span className="text-coral font-black text-lg">⬡ GM</span>
          <span className="text-white/40 text-sm">The PlayGround</span>
          {activeEvent && (
            <span
              className="px-2 py-0.5 text-xs font-black rounded"
              style={{ backgroundColor: activeEvent.status === 'live' ? '#3DDC97' : '#FFD43B', color: '#1A1A1A' }}
            >
              {activeEvent.status.toUpperCase()}
            </span>
          )}
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login') }}
          className="text-white/40 hover:text-white text-xs font-bold"
        >
          Sign out
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-white/10" style={{ backgroundColor: '#162843' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-shrink-0 px-5 py-3 text-sm font-bold relative transition-all"
            style={{
              color: activeTab === tab.id ? '#FF5A4E' : 'rgba(255,255,255,0.5)',
              borderBottom: activeTab === tab.id ? '2px solid #FF5A4E' : '2px solid transparent',
            }}
          >
            {tab.label}
            {tab.badge ? (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-black rounded-full" style={{ backgroundColor: '#FF5A4E', color: '#fff' }}>
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ── EVENT CONTROL ── */}
        {activeTab === 'control' && (
          <div className="grid gap-4">
            <SectionCard title="Event Control">
              {activeEvent ? (
                <div>
                  <p className="text-white/70 mb-4">{activeEvent.name}</p>
                  <div className="flex flex-wrap gap-2">
                    <AdminBtn color="#3DDC97" onClick={() => setEventStatus('live')}>▶ START EVENT</AdminBtn>
                    <AdminBtn color="#FFD43B" onClick={() => setEventStatus('draft')}>⏸ PAUSE</AdminBtn>
                    <AdminBtn color="#FF5A4E" onClick={() => setEventStatus('finished')}>⏹ END EVENT</AdminBtn>
                  </div>
                </div>
              ) : (
                <p className="text-white/40">No events found. Create one in Supabase first.</p>
              )}
            </SectionCard>

            <SectionCard title="Broadcast Message">
              <div className="flex gap-2">
                <input
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  placeholder="Message to all teams..."
                  className="flex-1 px-3 py-2 rounded border border-white/20 bg-white/5 text-white outline-none text-sm"
                  onKeyDown={e => e.key === 'Enter' && sendBroadcast()}
                />
                <AdminBtn color="#FF5A4E" onClick={sendBroadcast}>SEND</AdminBtn>
              </div>
            </SectionCard>

            <SectionCard title={`Teams Online (${eventTeams.length})`}>
              <div className="grid grid-cols-2 gap-2">
                {eventTeams.map(t => (
                  <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded bg-white/5 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-mint" />
                    <span className="text-sm font-bold truncate">{t.name}</span>
                    <span className="ml-auto text-xs text-lemon font-black">{t.score}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* ── PHOTO REVIEW ── */}
        {activeTab === 'photos' && (
          <div>
            <p className="text-white/50 text-sm mb-4">{pendingPhotos.length} pending review</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {pendingPhotos.map(c => {
                const team = teams.find(t => t.id === c.team_id)
                const game = games.find(g => g.id === c.game_id)
                return (
                  <div key={c.id} className="rounded-lg border border-white/10 overflow-hidden bg-white/5">
                    {c.photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.photo_url} alt="submission" className="w-full h-40 object-cover" />
                    )}
                    <div className="p-3">
                      <p className="font-bold text-sm">Team #{team?.team_number} · {team?.name}</p>
                      <p className="text-white/50 text-xs mt-0.5">{game?.icon} {game?.title} · +{c.points_awarded} pts</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => reviewPhoto(c.id, 'approved')}
                          className="flex-1 py-2 text-sm font-black rounded border border-mint"
                          style={{ backgroundColor: '#3DDC9722', color: '#3DDC97' }}
                        >
                          ✓ APPROVE
                        </button>
                        <button
                          onClick={() => reviewPhoto(c.id, 'rejected')}
                          className="flex-1 py-2 text-sm font-black rounded border border-coral"
                          style={{ backgroundColor: '#FF5A4E22', color: '#FF5A4E' }}
                        >
                          ✗ REJECT
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {pendingPhotos.length === 0 && (
                <div className="col-span-2 text-center py-12 text-white/30">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="font-bold">All caught up</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── LIVE STANDINGS ── */}
        {activeTab === 'standings' && (
          <div>
            <SectionCard title="Score Chart">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#162843', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#FF5A4E" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </SectionCard>

            <div className="mt-4 rounded-lg border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10" style={{ backgroundColor: '#162843' }}>
                    {['Rank', 'Team', '#', 'Score', 'Budget', 'Photos', 'Missions'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-white/40 text-xs font-bold uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {eventTeams.map((t, i) => (
                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2.5 font-black text-lemon">#{i + 1}</td>
                      <td className="px-3 py-2.5 font-bold">{t.name}</td>
                      <td className="px-3 py-2.5 text-white/50">{t.team_number}</td>
                      <td className="px-3 py-2.5 font-black text-coral">{t.score}</td>
                      <td className="px-3 py-2.5 text-mint">RM{t.budget_remaining}</td>
                      <td className="px-3 py-2.5 text-sky">{t.photo_count}</td>
                      <td className="px-3 py-2.5 text-white/60">
                        {completions.filter(c => c.team_id === t.id && c.status === 'approved').length}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ZONE STATUS ── */}
        {activeTab === 'zones' && (
          <div className="grid gap-3">
            {zones.map(z => {
              const teamsInZone = teamZones
                .filter(tz => tz.zone_id === z.id)
                .map(tz => teams.find(t => t.id === tz.team_id))
                .filter(Boolean) as TeamRow[]
              return (
                <div key={z.id} className="rounded-lg border border-white/10 p-4 bg-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{z.emoji}</span>
                    <div>
                      <p className="font-black text-base">{z.name}</p>
                      <p className="text-white/40 text-xs">{z.label}</p>
                    </div>
                    <div className="ml-auto">
                      <span
                        className="px-2 py-1 text-xs font-black rounded"
                        style={{ backgroundColor: z.color + '33', color: z.color, border: `1px solid ${z.color}55` }}
                      >
                        {teamsInZone.length} team{teamsInZone.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  {teamsInZone.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {teamsInZone.map(t => (
                        <span key={t.id} className="px-2 py-0.5 text-xs rounded bg-white/10 text-white/70">
                          #{t.team_number} {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── MANUAL ADJUST ── */}
        {activeTab === 'adjust' && (
          <SectionCard title="Manual Adjustment">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wide block mb-1.5">Team</label>
                <select
                  value={adjustTeamId}
                  onChange={e => {
                    const t = teams.find(x => x.id === e.target.value)
                    setAdjustTeamId(e.target.value)
                    setAdjustScore(t ? String(t.score) : '')
                    setAdjustBudget(t ? String(t.budget_remaining) : '')
                  }}
                  className="w-full px-3 py-2.5 rounded border border-white/20 bg-white/5 text-white outline-none text-sm"
                >
                  <option value="">Select a team...</option>
                  {eventTeams.map(t => (
                    <option key={t.id} value={t.id}>#{t.team_number} {t.name}</option>
                  ))}
                </select>
              </div>
              {adjustTeamId && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/50 text-xs font-bold uppercase tracking-wide block mb-1.5">Score</label>
                      <input
                        type="number"
                        value={adjustScore}
                        onChange={e => setAdjustScore(e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-white/20 bg-white/5 text-white outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs font-bold uppercase tracking-wide block mb-1.5">Budget (RM)</label>
                      <input
                        type="number"
                        value={adjustBudget}
                        onChange={e => setAdjustBudget(e.target.value)}
                        className="w-full px-3 py-2.5 rounded border border-white/20 bg-white/5 text-white outline-none text-sm"
                      />
                    </div>
                  </div>
                  <AdminBtn color="#3DDC97" onClick={saveAdjust}>
                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                  </AdminBtn>
                </>
              )}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/10" style={{ backgroundColor: '#162843' }}>
        <p className="font-black text-sm text-white/80 uppercase tracking-wide">{title}</p>
      </div>
      <div className="p-4 bg-white/[0.03]">{children}</div>
    </div>
  )
}

function AdminBtn({ color, onClick, children }: { color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm font-black rounded border-2 border-ink transition-all"
      style={{ backgroundColor: color, color: '#1A1A1A', boxShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}
    >
      {children}
    </button>
  )
}
