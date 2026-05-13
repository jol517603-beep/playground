import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Admin — The PlayGround GM',
  description: 'Game Master control panel',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0E1F3A' }}>
      {children}
    </div>
  )
}
