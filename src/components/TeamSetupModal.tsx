'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, RotateCcw } from 'lucide-react'
import { saveWarCry, uploadTeamPhoto } from '@/app/actions/submit'

interface TeamSetupModalProps {
  teamName: string
  teamNumber: number
  existingWarCry?: string | null
  onDone: (warCry: string, photoUrl?: string) => void
}

type Step = 'war-cry' | 'selfie' | 'saving'

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, 800 / Math.max(img.width, img.height))
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8)
    }
    img.src = url
  })
}

export default function TeamSetupModal({ teamName, teamNumber, existingWarCry, onDone }: TeamSetupModalProps) {
  const [step, setStep] = useState<Step>(existingWarCry ? 'selfie' : 'war-cry')
  const [warCry, setWarCry] = useState(existingWarCry ?? '')
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const blob = await resizeImage(file)
    setPhotoBlob(blob)
    setPhotoPreview(URL.createObjectURL(blob))
  }, [])

  const handleFinish = async (skipPhoto = false) => {
    setStep('saving')
    await saveWarCry(warCry.trim() || 'Let\'s go!')
    let photoUrl: string | undefined
    if (!skipPhoto && photoBlob) {
      const result = await uploadTeamPhoto(photoBlob)
      if (result.success) photoUrl = result.url
    }
    onDone(warCry.trim() || 'Let\'s go!', photoUrl)
  }

  /* ── Saving screen ── */
  if (step === 'saving') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ backgroundColor: '#0E1F3A' }}>
        <div className="text-5xl mb-4">⏳</div>
        <p className="text-white font-black text-xl">Setting up your team...</p>
      </div>
    )
  }

  /* ── Selfie screen ── */
  if (step === 'selfie') {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: '#0E1F3A' }}>
        <div className="min-h-full flex flex-col items-center justify-center px-5 py-10">
          <div className="text-5xl mb-3">📸</div>
          <h2 className="text-white font-black text-2xl text-center mb-1">Team Profile Selfie</h2>
          <p className="text-white/50 text-sm text-center mb-6">This becomes your team photo</p>

          {warCry ? (
            <div className="mb-6 px-4 py-2 rounded-full border border-white/20 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
              <p className="text-white/70 text-sm italic">&ldquo;{warCry}&rdquo;</p>
            </div>
          ) : null}

          <div className="w-full max-w-[340px] space-y-3">
            {photoPreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="preview" className="w-full rounded-2xl border-4 border-white/20 object-cover" style={{ maxHeight: 260 }} />
                <button
                  onClick={() => { setPhotoBlob(null); setPhotoPreview(null) }}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full border-2 border-ink flex items-center justify-center"
                  style={{ backgroundColor: '#FFD43B' }}
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center gap-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <Camera size={36} className="text-white/60" />
                <span className="text-white font-black text-sm">TAP TO TAKE TEAM SELFIE</span>
                <span className="text-white/40 text-xs">Use front camera for best results</span>
              </button>
            )}

            <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileSelect} />

            <button
              onClick={() => handleFinish(false)}
              disabled={!photoBlob}
              className="w-full py-4 font-black text-base border-2 border-ink rounded-xl"
              style={{
                backgroundColor: photoBlob ? '#FFD43B' : '#1A1A1A60',
                color: photoBlob ? '#1A1A1A' : 'rgba(255,255,255,0.3)',
                borderColor: photoBlob ? '#1A1A1A' : 'transparent',
                boxShadow: photoBlob ? '4px 4px 0 rgba(255,255,255,0.1)' : 'none',
              }}
            >
              ✓ SAVE &amp; START THE GAME
            </button>

            <button
              onClick={() => handleFinish(true)}
              className="w-full py-3 font-bold text-sm text-center rounded-xl border-2 border-white/20"
              style={{ color: 'rgba(255,255,255,0.5)', backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              Skip photo — go straight to game
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── War Cry screen ── */
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: '#0E1F3A' }}>
      <div className="min-h-full flex flex-col items-center justify-center px-5 py-10">
        <div className="text-5xl mb-3">🦁</div>
        <h2 className="text-white font-black text-2xl text-center mb-1">Declare Your War Cry!</h2>
        <p className="text-white/50 text-sm text-center mb-6">
          Team <span className="text-white font-bold">#{teamNumber} {teamName}</span>
        </p>

        <div className="w-full max-w-[340px] space-y-3">
          <textarea
            value={warCry}
            onChange={(e) => setWarCry(e.target.value)}
            placeholder="e.g. We conquer, we explore, we win!"
            maxLength={80}
            rows={3}
            className="w-full px-4 py-3 font-bold text-base border-2 border-ink rounded-xl outline-none resize-none text-center"
            style={{ backgroundColor: '#fff', color: '#1A1A1A' }}
          />

          {/* NEXT button — always yellow, always visible */}
          <button
            onClick={() => setStep('selfie')}
            className="w-full py-4 font-black text-lg border-2 border-ink rounded-xl"
            style={{ backgroundColor: '#FFD43B', color: '#1A1A1A', boxShadow: '4px 4px 0 rgba(255,255,255,0.15)' }}
          >
            {warCry.trim() ? 'NEXT — TEAM SELFIE →' : 'SKIP WAR CRY →'}
          </button>
        </div>
      </div>
    </div>
  )
}
