'use client'

import { useRef, useState, useCallback } from 'react'
import { zones } from '@/data/zones'
import { ZonePosterCanvas } from '@/components/admin/ZonePosterPDF'

export default function PostersPage() {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([])
  const [downloading, setDownloading] = useState(false)
  const [readyCount, setReadyCount] = useState(0)

  const handleReady = useCallback(() => {
    setReadyCount(c => c + 1)
  }, [])

  const downloadAll = async () => {
    setDownloading(true)

    // jsPDF is dynamically imported to avoid SSR issues
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a3',
    })

    const canvases = document.querySelectorAll<HTMLCanvasElement>('[data-zone-canvas]')
    canvases.forEach((canvas, i) => {
      if (i > 0) pdf.addPage('a3', 'portrait')
      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      pdf.addImage(imgData, 'JPEG', 0, 0, 297, 420)
    })

    pdf.save('playground-zone-posters.pdf')
    setDownloading(false)
  }

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0E1F3A' }}>
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-xl text-white">Zone Poster Generator</h1>
          <p className="text-white/40 text-sm">Print all 8 A3 posters for zone checkpoints</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs">{readyCount}/8 rendered</span>
          <button
            onClick={downloadAll}
            disabled={downloading || readyCount < 8}
            className="px-5 py-2.5 font-black text-sm border-2 border-ink rounded transition-all"
            style={{
              backgroundColor: readyCount >= 8 ? '#FF5A4E' : '#1A1A1A40',
              color: readyCount >= 8 ? '#fff' : '#1A1A1A60',
              boxShadow: readyCount >= 8 ? '3px 3px 0 rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {downloading ? '⏳ Generating PDF...' : '⬇ Download All 8 Posters'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-2 gap-6">
        {zones.map((zone, i) => (
          <div key={zone.id} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{zone.emoji}</span>
              <span className="font-black text-sm">{zone.name}</span>
              <span
                className="ml-auto px-2 py-0.5 text-xs font-black rounded"
                style={{ backgroundColor: zone.color + '33', color: zone.color }}
              >
                Zone {zone.order}
              </span>
            </div>
            <div ref={el => { canvasRefs.current[i] = el as unknown as HTMLCanvasElement }} data-zone-canvas>
              <ZonePosterCanvas zone={zone} onReady={handleReady} />
            </div>
            <button
              onClick={() => {
                const canvas = document.querySelectorAll<HTMLCanvasElement>('[data-zone-canvas] canvas')[i]
                if (!canvas) return
                const a = document.createElement('a')
                a.href = canvas.toDataURL('image/jpeg', 0.92)
                a.download = `zone-${zone.order}-${zone.id}.jpg`
                a.click()
              }}
              className="w-full py-2 text-xs font-bold rounded border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all"
            >
              ⬇ Download Zone {zone.order}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
