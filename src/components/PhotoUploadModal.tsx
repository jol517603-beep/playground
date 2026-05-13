'use client'

import { useState, useRef, useCallback } from 'react'
import { X, Camera, Image as ImageIcon, RotateCcw } from 'lucide-react'
import type { Game } from '@/types'
import { zones } from '@/data/zones'
import { submitMission } from '@/app/actions/submit'

interface PhotoUploadModalProps {
  game: Game
  onSubmit: (game: Game, newScore?: number) => void
  onClose: () => void
  /** When true, uses the real Supabase server action. Falls back to demo mode otherwise. */
  liveMode?: boolean
}

type UploadState = 'choose' | 'preview' | 'submitting' | 'success' | 'error'

function resizeImage(file: File, maxSize: number, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', quality)
    }
    img.src = url
  })
}

function generateDemoDataUrl(game: Game): string {
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 300
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 400, 300)
  grad.addColorStop(0, game.color)
  grad.addColorStop(1, '#0E1F3A')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 400, 300)
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.fillRect(0, 0, 400, 300)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 56px Arial'
  ctx.fillText(game.icon, 200, 130)
  ctx.font = 'bold 18px Arial'
  ctx.fillText(game.title, 200, 170)
  ctx.font = '12px Arial'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('DEMO · THE PLAYGROUND', 200, 200)
  return canvas.toDataURL('image/jpeg', 0.7)
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)![1]
  const binary = atob(data)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export default function PhotoUploadModal({ game, onSubmit, onClose, liveMode = false }: PhotoUploadModalProps) {
  const [uploadState, setUploadState] = useState<UploadState>('choose')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const zone = zones.find((z) => z.id === game.zone)

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const blob = await resizeImage(file, 400, 0.7)
    setPhotoBlob(blob)
    setPreviewUrl(URL.createObjectURL(blob))
    setUploadState('preview')
  }, [])

  const handleDemo = useCallback(() => {
    const dataUrl = generateDemoDataUrl(game)
    const blob = dataUrlToBlob(dataUrl)
    setPhotoBlob(blob)
    setPreviewUrl(dataUrl)
    setUploadState('preview')
  }, [game])

  const handleSubmit = useCallback(async () => {
    if (!photoBlob) return
    setUploadState('submitting')

    if (liveMode) {
      const formData = new FormData()
      formData.set('game_id', String(game.id))
      formData.set('points_awarded', String(game.points))
      formData.set('cost', String(game.cost))
      formData.set('photo', photoBlob, `${game.id}.jpg`)

      const result = await submitMission(formData)
      if (!result.success) {
        setErrorMsg(result.error ?? 'Submission failed.')
        setUploadState('error')
        return
      }
      setUploadState('success')
      setTimeout(() => onSubmit(game, result.newScore), 1800)
    } else {
      // Demo mode — instant success
      setTimeout(() => {
        setUploadState('success')
        setTimeout(() => onSubmit(game), 1800)
      }, 500)
    }
  }, [photoBlob, game, liveMode, onSubmit])

  if (uploadState === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(14,31,58,0.95)' }}>
        <div
          className="mx-4 rounded-xl border-2 border-ink p-8 text-center max-w-[360px] w-full"
          style={{ backgroundColor: '#FFD43B', boxShadow: '6px 6px 0 #1A1A1A' }}
        >
          <div className="text-5xl mb-3">{game.icon}</div>
          <div className="font-black text-2xl text-ink mb-1">MISSION COMPLETE</div>
          <div className="font-bold text-ink/70 text-sm mb-4">{game.title}</div>
          <div
            className="inline-block px-5 py-2 font-black text-xl border-2 border-ink rounded"
            style={{ backgroundColor: '#0E1F3A', color: '#FFD43B', boxShadow: '3px 3px 0 #1A1A1A' }}
          >
            +{game.points} pts
          </div>
          {!liveMode && (
            <div className="mt-3 text-ink/50 text-xs">Demo mode — not saved to database</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(14,31,58,0.9)' }}>
      <div
        className="w-full max-w-[440px] rounded-t-2xl overflow-hidden border-2 border-b-0 border-ink"
        style={{ backgroundColor: '#FFF8EE', boxShadow: '0 -4px 0 #1A1A1A' }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: game.color }}>
          <div>
            <div className="text-white/70 text-xs font-bold uppercase tracking-widest">{game.category}</div>
            <div className="text-white font-black text-lg leading-tight">{game.title}</div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white"><X size={22} /></button>
        </div>

        <div className="px-4 py-4">
          {/* Mission info */}
          <div className="rounded-lg border-2 border-ink p-3 mb-4" style={{ backgroundColor: '#fff', boxShadow: '3px 3px 0 #1A1A1A' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded border-2 border-ink flex items-center justify-center text-xl flex-shrink-0" style={{ backgroundColor: game.color + '22' }}>
                {game.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-ink/70 leading-snug">{game.description}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="px-2 py-0.5 text-xs font-black rounded border border-ink" style={{ backgroundColor: '#0E1F3A', color: '#FFD43B' }}>
                    +{game.points} PTS
                  </span>
                  <span className="px-2 py-0.5 text-xs font-black rounded border border-ink" style={{ backgroundColor: game.cost === 0 ? '#3DDC97' : '#FFD43B', color: '#1A1A1A' }}>
                    {game.cost === 0 ? 'FREE' : `RM${game.cost}`}
                  </span>
                  {zone && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded border border-ink/20 bg-ink/5">
                      {zone.emoji} {zone.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {uploadState === 'choose' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-3 w-full py-4 font-black text-base border-2 border-ink rounded"
                style={{ backgroundColor: '#0E1F3A', color: '#fff', boxShadow: '4px 4px 0 #1A1A1A' }}
              >
                <Camera size={20} /> TAKE PHOTO
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
              <button
                onClick={handleDemo}
                className="flex items-center justify-center gap-3 w-full py-4 font-black text-base border-2 border-ink rounded"
                style={{ backgroundColor: '#FFF8EE', color: '#1A1A1A', boxShadow: '4px 4px 0 #1A1A1A' }}
              >
                <ImageIcon size={20} /> USE DEMO
              </button>
            </div>
          )}

          {uploadState === 'preview' && previewUrl && (
            <div>
              <div className="relative mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="preview" className="w-full rounded-lg border-2 border-ink object-cover" style={{ maxHeight: '200px', boxShadow: '3px 3px 0 #1A1A1A' }} />
                <button
                  onClick={() => { setPreviewUrl(null); setPhotoBlob(null); setUploadState('choose') }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center bg-white"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-4 font-black text-base border-2 border-ink rounded"
                style={{ backgroundColor: '#FF5A4E', color: '#fff', boxShadow: '4px 4px 0 #1A1A1A' }}
              >
                SUBMIT FOR +{game.points} POINTS
              </button>
            </div>
          )}

          {uploadState === 'submitting' && (
            <div className="text-center py-6">
              <div className="text-3xl animate-spin inline-block mb-3">⏳</div>
              <div className="font-bold text-ink/60">Uploading...</div>
            </div>
          )}

          {uploadState === 'error' && (
            <div className="text-center py-4">
              <p className="text-coral font-bold mb-3">{errorMsg}</p>
              <button
                onClick={() => setUploadState('preview')}
                className="px-5 py-2 border-2 border-ink rounded font-bold"
                style={{ backgroundColor: '#FFD43B' }}
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
