'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function loginTeam(loginCode: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: team, error } = await supabase
    .from('teams')
    .select('id, event_id, name, team_number, login_code')
    .eq('login_code', loginCode.toUpperCase())
    .single()

  if (error || !team) {
    return { error: 'Invalid team code. Check with your Game Master.' }
  }

  // Verify the event is live
  const { data: event } = await supabase
    .from('events')
    .select('status')
    .eq('id', team.event_id)
    .single()

  if (!event || event.status !== 'live') {
    return { error: 'The event hasn\'t started yet. Stand by!' }
  }

  const cookieStore = await cookies()
  cookieStore.set('team_id', team.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12, // 12 hours
    path: '/',
  })
  cookieStore.set('event_id', team.event_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 12,
    path: '/',
  })

  return {}
}

export async function logoutTeam(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('team_id')
  cookieStore.delete('event_id')
}

export async function getSessionTeam() {
  const cookieStore = await cookies()
  const teamId = cookieStore.get('team_id')?.value
  const eventId = cookieStore.get('event_id')?.value
  if (!teamId || !eventId) return null

  const supabase = await createClient()
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()

  return team ?? null
}
