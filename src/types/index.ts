export interface Zone {
  id: string
  name: string
  label: string
  color: string
  order: number
  threshold: number
  passcode: string
  emoji: string
  lat: number
  lng: number
  gameArea?: string
  rules?: string[]
}

export interface Game {
  id: number
  title: string
  category: GameCategory
  color: string
  zone: string
  points: number
  cost: number
  time: number
  icon: string
  difficulty: 'easy' | 'medium' | 'hard'
  lat: number
  lng: number
  description: string
  isMuseum: boolean
}

export interface Team {
  id: string
  name: string
  number: number
  score: number
  completedGameIds: number[]
  budget: number
  photoCount: number
  unlockedZoneIds: string[]
}

export interface Museum {
  id: string
  name: string
  short: string
  zone: string
  color: string
  entry: number
  lat: number
  lng: number
  game: number
}

export type GameCategory =
  | 'STREET HUNT'
  | 'TASTE LAB'
  | 'HERITAGE'
  | 'CREATIVE'
  | 'ESCAPE LOGIC'
  | 'SOCIAL'
  | 'ARENA'
  | 'ART OF MAKING'
  | 'WILDCARD'
  | 'MUSEUM'
