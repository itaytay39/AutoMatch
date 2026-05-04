// AutoMatch Design Tokens — Premium Automotive Dark Theme
export const colors = {
  // Backgrounds — true dark, not cartoon dark
  bg0: '#06080B',   // app background
  bg1: '#0D1117',   // card surface
  bg2: '#141B24',   // input / chip
  bg3: '#1C2535',   // pressed / hover

  // Foregrounds
  fg1: '#EDF0F4',   // primary text
  fg2: '#8C97A8',   // secondary text
  fg3: '#4F5C6E',   // tertiary / captions
  fg4: '#2E3847',   // disabled / placeholder

  // Borders
  border1: 'rgba(255,255,255,0.05)',
  border2: 'rgba(255,255,255,0.09)',
  border3: '#1E2A3A',

  // Brand accent — warm amber (automotive, not AI)
  accent:      '#E8943A',
  accentSoft:  'rgba(232,148,58,0.12)',
  accentMuted: '#C47B2E',

  // Semantic
  success:     '#16A34A',
  successSoft: 'rgba(22,163,74,0.13)',
  warning:     '#D97706',
  warningSoft: 'rgba(217,119,6,0.13)',
  danger:      '#DC2626',
  dangerSoft:  'rgba(220,38,38,0.13)',
  info:        '#2563EB',
  infoSoft:    'rgba(37,99,235,0.13)',

  // Legacy aliases (keep components working)
  primaryBlue:    '#2563EB',
  accentPurple:   '#E8943A',  // remapped to amber
  electricCyan:   '#E8943A',
  border1Legacy:  'rgba(255,255,255,0.05)',
  border2Legacy:  'rgba(255,255,255,0.09)',
  successSoftLegacy: 'rgba(22,163,74,0.13)',
  warningSoftLegacy: 'rgba(217,119,6,0.13)',
  dangerSoftLegacy:  'rgba(220,38,38,0.13)',
} as const

export const gradients = {
  accent:  ['#E8943A', '#D4731E'] as [string, string],
  success: ['#16A34A', '#15803D'] as [string, string],
  dark:    ['#0D1117', '#06080B'] as [string, string],
  // Legacy aliases
  primary: ['#E8943A', '#D4731E'] as [string, string],
  cool:    ['#2563EB', '#1D4ED8'] as [string, string],
  hero:    ['#E8943A', '#D4731E', '#C47B2E'] as [string, string, string],
} as const

export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48, 10: 64,
} as const

export const radii = {
  xs: 4, sm: 8, md: 10, lg: 14, xl: 18, xxl: 24, pill: 999,
} as const

export const fontSize = {
  display1: 30, display2: 22, headline: 18,
  title: 15, body: 13, caption: 11, micro: 10,
} as const

export const fontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
  black:    '800' as const,
}
