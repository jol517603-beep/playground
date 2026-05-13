'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import type { Zone } from '@/types'

const APP_URL = 'https://playground.teambuddy.my'

interface ZonePosterProps {
  zone: Zone
  onReady?: () => void
}

export function ZonePosterCanvas({ zone, onReady }: ZonePosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    // A3 at 150 DPI ≈ 1240 × 1754 px
    const W = 1240
    const H = 1754
    canvas.width = W
    canvas.height = H

    // Background
    ctx.fillStyle = '#FFF8EE'
    ctx.fillRect(0, 0, W, H)

    // Top color band
    ctx.fillStyle = zone.color
    ctx.fillRect(0, 0, W, 320)

    // Border
    ctx.strokeStyle = '#1A1A1A'
    ctx.lineWidth = 12
    ctx.strokeRect(16, 16, W - 32, H - 32)

    // Zone emoji (huge)
    ctx.font = '160px serif'
    ctx.textAlign = 'center'
    ctx.fillText(zone.emoji, W / 2, 230)

    // Eyebrow
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = 'bold 42px Arial'
    ctx.fillText(`ZONE ${zone.order}/8`, W / 2, 300)

    // Zone name
    ctx.fillStyle = '#1A1A1A'
    ctx.font = 'black 130px Arial'
    const name = zone.name.toUpperCase()
    // Shrink font if long
    let fontSize = 130
    ctx.font = `black ${fontSize}px Arial`
    while (ctx.measureText(name).width > W - 120 && fontSize > 60) {
      fontSize -= 4
      ctx.font = `900 ${fontSize}px Arial`
    }
    ctx.fillText(name, W / 2, 490)

    // Zone label
    ctx.fillStyle = '#1A1A1A80'
    ctx.font = '500 52px Arial'
    ctx.fillText(zone.label, W / 2, 570)

    // Divider
    ctx.strokeStyle = zone.color
    ctx.lineWidth = 6
    ctx.beginPath(); ctx.moveTo(80, 620); ctx.lineTo(W - 80, 620); ctx.stroke()

    // Passcode section
    ctx.fillStyle = '#FFD43B'
    const pillW = 600, pillH = 140, pillX = (W - pillW) / 2, pillY = 660
    ctx.beginPath()
    ctx.roundRect(pillX, pillY, pillW, pillH, 24)
    ctx.fill()
    ctx.strokeStyle = '#1A1A1A'
    ctx.lineWidth = 6
    ctx.stroke()

    // Passcode shadow
    ctx.fillStyle = '#1A1A1A'
    ctx.font = '900 110px "Courier New", monospace'
    ctx.fillText(zone.passcode, W / 2 + 3, pillY + 105 + 3)
    ctx.fillStyle = '#1A1A1A'
    ctx.fillText(zone.passcode, W / 2, pillY + 105)

    // Instruction
    ctx.fillStyle = '#1A1A1A'
    ctx.font = 'bold 44px Arial'
    ctx.fillText('ENTER THIS CODE IN THE APP', W / 2, 870)

    // QR code
    const qrUrl = `${APP_URL}/unlock?z=${zone.id}&c=${zone.passcode}`
    const qrCanvas = document.createElement('canvas')
    QRCode.toCanvas(
      qrCanvas,
      qrUrl,
      { width: 300, margin: 2, color: { dark: '#1A1A1A', light: '#FFF8EE' } },
      (err: Error | null | undefined) => {
        if (err) return
        const qrX = (W - 300) / 2
        ctx.drawImage(qrCanvas, qrX, 920, 300, 300)

        // QR label
        ctx.fillStyle = '#1A1A1A60'
        ctx.font = '32px Arial'
        ctx.fillText('Scan to auto-fill code', W / 2, 1250)

        // Footer
        ctx.fillStyle = zone.color
        ctx.fillRect(0, H - 160, W, 160)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 52px Arial'
        ctx.fillText('THE PLAYGROUND', W / 2, H - 100)
        ctx.font = '36px Arial'
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.fillText('Georgetown, Penang', W / 2, H - 52)

        onReady?.()
      }
    )
  }, [zone, onReady])

  return (
    <canvas
      ref={canvasRef}
      className="w-full border-2 border-ink rounded"
      style={{ boxShadow: '4px 4px 0 #1A1A1A' }}
    />
  )
}
