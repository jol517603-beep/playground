'use client'

import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-navy flex justify-center">
      <div className="relative w-full max-w-[440px] min-h-screen bg-cream flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
