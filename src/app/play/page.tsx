import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlayClient from './PlayClient'

export default async function PlayPage() {
  const cookieStore = await cookies()
  const teamId = cookieStore.get('team_id')?.value
  const eventId = cookieStore.get('event_id')?.value

  if (!teamId || !eventId) redirect('/login')

  const supabase = await createClient()

  const [{ data: team }, { data: event }, { data: teamZones }, { data: completions }] =
    await Promise.all([
      supabase.from('teams').select('*').eq('id', teamId).single(),
      supabase.from('events').select('*').eq('id', eventId).single(),
      supabase.from('team_zones').select('zone_id').eq('team_id', teamId),
      supabase.from('completions').select('game_id, points_awarded').eq('team_id', teamId),
    ])

  if (!team || !event) redirect('/login')

  const unlockedZoneIds = (teamZones ?? []).map((z) => z.zone_id)
  const completedGameIds = (completions ?? []).map((c) => c.game_id)

  return (
    <PlayClient
      team={team}
      event={event}
      unlockedZoneIds={unlockedZoneIds}
      completedGameIds={completedGameIds}
    />
  )
}
