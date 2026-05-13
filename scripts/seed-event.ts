/**
 * Seed script — creates a sample event with 25 teams and all zones.
 * Run: npx tsx scripts/seed-event.ts
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { zones } from '../src/data/zones'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const TEAM_NAMES = [
  'Storm Riders', 'Night Owls', 'Golden Kites', 'Thunder Hawks',
  'Penang Panthers', 'Sea Dragons', 'Coral Crew', 'Batik Brigade',
  'Laksa Lords', 'Durian Daredevils', 'Char Kway Kings', 'Nasi Lemak Legends',
  'Cendol Crew', 'Trishaw Tribe', 'Peranakan Pack', 'Colonial Crushers',
  'Monkey Bridge', 'Jawi Jokers', 'Kopitiam Kings', 'Satay Squad',
  'Nyonya Ninjas', 'Roti Rangers', 'Clan Jetty Jets', 'Spice Trail',
  'Esplanade Eagles',
]

async function seed() {
  console.log('🌱 Seeding The PlayGround...')

  // 1. Create event
  const endsAt = new Date(Date.now() + 4 * 3600 * 1000).toISOString()
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      name: 'The PlayGround — Georgetown Edition',
      status: 'live',
      ends_at: endsAt,
      timer_duration_seconds: 14400,
    })
    .select()
    .single()

  if (eventError || !event) {
    console.error('Failed to create event:', eventError)
    process.exit(1)
  }
  console.log(`✓ Event created: ${event.id}`)

  // 2. Create 25 teams
  const teamInserts = TEAM_NAMES.map((name, i) => ({
    event_id: event.id,
    name,
    team_number: i + 1,
    login_code: randomCode(),
    score: 0,
    budget_remaining: 100,
  }))

  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .insert(teamInserts)
    .select()

  if (teamsError || !teams) {
    console.error('Failed to create teams:', teamsError)
    process.exit(1)
  }
  console.log(`✓ Created ${teams.length} teams`)

  // 3. Unlock Beach Street for all teams (Zone 1 is always open)
  const zoneUnlocks = teams.map(t => ({
    team_id: t.id,
    zone_id: 'beach-street',
  }))
  await supabase.from('team_zones').insert(zoneUnlocks)
  console.log('✓ Beach Street unlocked for all teams')

  // 4. Print login codes
  console.log('\n📋 Team Login Codes:')
  console.log('─────────────────────────────────────')
  teams.forEach(t => {
    console.log(`  Team ${String(t.team_number).padStart(2, ' ')} · ${t.name.padEnd(22, ' ')} → ${t.login_code}`)
  })
  console.log('─────────────────────────────────────')

  // 5. Print zone passcodes
  console.log('\n🔐 Zone Passcodes:')
  zones.forEach(z => {
    console.log(`  Zone ${z.order} · ${z.name.padEnd(26, ' ')} → ${z.passcode}`)
  })

  console.log('\n✅ Seed complete. Event is LIVE.')
  console.log(`   URL: ${SUPABASE_URL.replace('.supabase.co', '')}.vercel.app/login`)
}

seed().catch(console.error)
