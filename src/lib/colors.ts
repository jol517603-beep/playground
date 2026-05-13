export const colors = {
  coral: '#FF5A4E',
  navy: '#0E1F3A',
  lemon: '#FFD43B',
  mint: '#3DDC97',
  cream: '#FFF8EE',
  ink: '#1A1A1A',
  plum: '#9B5DE5',
  sky: '#2EC4F1',
  rose: '#FF85A2',
} as const

export type ColorKey = keyof typeof colors
