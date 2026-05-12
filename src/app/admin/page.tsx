import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const gmEmails = (process.env.GM_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase())
  if (!gmEmails.includes(user.email?.toLowerCase() ?? '')) redirect('/admin/login')

  const [{ data: events }, { data: teams }, { data: completions }, { data: teamZones }] =
    await Promise.all([
      supabase.from('events').select('*').order('created_at', { ascending: false }),
      supabase.from('teams').select('*').order('score', { ascending: false }),
      supabase.from('completions').select('*').order('submitted_at', { ascending: false }),
      supabase.from('team_zones').select('*'),
    ])

  return (
    <AdminClient
      user={user}
      events={events ?? []}
      teams={teams ?? []}
      completions={completions ?? []}
      teamZones={teamZones ?? []}
    />
  )
}
