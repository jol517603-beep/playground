'use client'

import { Target, KeyRound, Map, Trophy, Users } from 'lucide-react'

export type TabId = 'games' | 'path' | 'map' | 'rank' | 'team'

interface BottomNavProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; Icon: typeof Target }[] = [
  { id: 'games', label: 'GAMES', Icon: Target },
  { id: 'path', label: 'PATH', Icon: KeyRound },
  { id: 'map', label: 'MAP', Icon: Map },
  { id: 'rank', label: 'RANK', Icon: Trophy },
  { id: 'team', label: 'TEAM', Icon: Users },
]

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-50 flex"
      style={{
        backgroundColor: '#0E1F3A',
        borderTop: '3px solid #FF5A4E',
      }}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all"
            style={{
              backgroundColor: isActive ? '#FF5A4E' : 'transparent',
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
            }}
          >
            <Icon size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-bold tracking-wider">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
