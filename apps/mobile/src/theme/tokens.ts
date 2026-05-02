export const colors = {
  primaryBlue: '#5B88FF',
  accentPurple: '#BB5CF6',
  electricCyan: '#00E5FF',

  bg0: '#0B0F14',
  bg1: '#12171E',
  bg2: '#18212A',
  bg3: '#1F2935',

  fg1: '#FFFFFF',
  fg2: '#C7CDD6',
  fg3: '#8D95A3',
  fg4: '#5A6472',

  border1: 'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.10)',
  border3: '#2A323C',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',

  successSoft: 'rgba(34,197,94,0.14)',
  warningSoft: 'rgba(245,158,11,0.14)',
  dangerSoft: 'rgba(239,68,68,0.14)',
} as const

export const gradients = {
  primary: ['#5B88FF', '#BB5CF6'] as [string, string],
  cool: ['#00E5FF', '#5B88FF'] as [string, string],
  hero: ['#5B88FF', '#BB5CF6', '#00E5FF'] as [string, string, string],
} as const

export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40,
} as const

export const radii = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, pill: 999,
} as const

export const fontSize = {
  display1: 32, display2: 24, headline: 20,
  title: 16, body: 14, caption: 12, micro: 10,
} as const

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '800' as const,
}
