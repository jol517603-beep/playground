'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function UnlockInner() {
  const params = useSearchParams()
  const router = useRouter()
  const zoneId = params.get('z')
  const code = params.get('c')

  useEffect(() => {
    if (!zoneId || !code) {
      router.replace('/play')
      return
    }
    // Redirect to /play with the zone pre-selected for passcode entry
    router.replace(`/play?unlock=${zoneId}&code=${code}`)
  }, [zoneId, code, router])

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="text-white text-center">
        <div className="text-5xl mb-4 animate-bounce">🔑</div>
        <p className="font-black text-xl">Opening zone...</p>
      </div>
    </div>
  )
}

export default function UnlockPage() {
  return (
    <Suspense>
      <UnlockInner />
    </Suspense>
  )
}
