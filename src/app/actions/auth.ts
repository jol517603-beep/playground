'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

function getClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function loginTeam(loginCode: string): Promise<{ error?: string }> {
  try {
    const supabase = getClient()

    const { data: team, error } = await supabase
      .from('teams')
      .select('id, event_id, name, team_number, login_code')
      .eq('login_code', loginCode.toUpperCase())
      .single()

    if (error || !team) {
      return { error: 'Invalid team code. Check with your Game Master.' }
    }

    const { data: event } = await supabase
      .from('events')
      .select('status')
      .eq('id', team.event_id)
      .single()

    if (!event || event.status !== 'live') {
      return { error: "The event hasn't started yet. Stand by!" }
    }

    const cookieStore = await cookies()
    cookieStore.set('team_id', team.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 12,
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
  } catch {
    return { error: 'Server error. Please try again.' }
  }
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

  const supabase = getClient()
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()

  return team ?? null
}
