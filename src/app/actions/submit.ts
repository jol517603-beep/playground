'use server'

import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

interface SubmitResult {
  success: boolean
  newScore?: number
  error?: string
}

export async function submitMission(formData: FormData): Promise<SubmitResult> {
  const cookieStore = await cookies()
  const teamId = cookieStore.get('team_id')?.value
  const eventId = cookieStore.get('event_id')?.value

  if (!teamId || !eventId) {
    return { success: false, error: 'Not logged in.' }
  }

  const gameId = Number(formData.get('game_id'))
  const pointsAwarded = Number(formData.get('points_awarded'))
  const cost = Number(formData.get('cost'))
  const photoBlob = formData.get('photo') as Blob | null

  if (!gameId || !pointsAwarded) {
    return { success: false, error: 'Invalid submission data.' }
  }

  const supabase = await createServiceClient()

  // Upload photo to Supabase Storage
  let photoUrl: string | null = null
  if (photoBlob && photoBlob.size > 0) {
    const timestamp = Date.now()
    const path = `events/${eventId}/${teamId}/${gameId}-${timestamp}.jpg`

    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(path, photoBlob, { contentType: 'image/jpeg', upsert: true })

    if (uploadError) {
      return { success: false, error: 'Photo upload failed: ' + uploadError.message }
    }

    const { data: urlData } = supabase.storage.from('submissions').getPublicUrl(path)
    photoUrl = urlData.publicUrl
  }

  // Transactional updates using RPC — or sequential with abort on failure
  // 1. Check team budget
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('score, budget_remaining, photo_count')
    .eq('id', teamId)
    .single()

  if (teamError || !team) {
    return { success: false, error: 'Team not found.' }
  }

  if (team.budget_remaining < cost) {
    return { success: false, error: 'Not enough budget for this mission.' }
  }

  // 2. Check not already completed
  const { data: existing } = await supabase
    .from('completions')
    .select('id')
    .eq('team_id', teamId)
    .eq('game_id', gameId)
    .maybeSingle()

  if (existing) {
    return { success: false, error: 'Mission already submitted.' }
  }

  // 3. Insert completion
  const { error: completionError } = await supabase.from('completions').insert({
    team_id: teamId,
    game_id: gameId,
    photo_url: photoUrl,
    points_awarded: pointsAwarded,
    status: 'pending',
  })

  if (completionError) {
    return { success: false, error: 'Failed to record completion.' }
  }

  // 4. Update team score, budget, photo count atomically
  const newScore = team.score + pointsAwarded
  const { error: updateError } = await supabase
    .from('teams')
    .update({
      score: newScore,
      budget_remaining: team.budget_remaining - cost,
      photo_count: team.photo_count + 1,
    })
    .eq('id', teamId)

  if (updateError) {
    return { success: false, error: 'Failed to update score.' }
  }

  return { success: true, newScore }
}

export async function unlockZone(zoneId: string): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies()
  const teamId = cookieStore.get('team_id')?.value

  if (!teamId) return { success: false, error: 'Not logged in.' }

  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('team_zones')
    .insert({ team_id: teamId, zone_id: zoneId })

  if (error && error.code !== '23505') {
    // 23505 = unique violation (already unlocked — that's fine)
    return { success: false, error: error.message }
  }

  return { success: true }
}
