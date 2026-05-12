// AutoMatch Design Tokens — Google Health / Material 3 Expressive
// Light warm theme with section tints per tab. Blue accent.
export const colors = {
  // Backgrounds — warm off-white
  bg0: '#F5F2EA',        // app background
  bg1: '#FFFFFF',        // card / sheet
  bg2: '#FBFAF6',        // secondary surface
  bg3: '#F0EDE5',        // pressed / hover

  // Foregrounds — ink hierarchy
  fg1: '#1B1E1B',        // primary text
  fg2: '#4A4D4A',        // secondary text
  fg3: '#7A7D7A',        // tertiary / captions
  fg4: '#A8AAA6',        // disabled / placeholder

  // Borders
  border1: 'rgba(27,30,27,0.06)',
  border2: 'rgba(27,30,27,0.10)',
  border3: 'rgba(27,30,27,0.14)',

  // Brand accent — calm premium blue
  accent:      '#2A5BB5',
  accentSoft:  '#DCE6F5',
  accentMuted: '#3D72D1',
  onAccent:    '#FFFFFF',

  // Section tints — unique pastel bg per tab
  tintHome:   '#E6EEE7',
  tintSearch: '#F0EADB',
  tintSaved:  '#EDE5F0',
  tintAlerts: '#F4E5DC',
  tintDetail: '#E8E4D8',

  // Section accent darks (text on tint)
  accHome:   '#2E6F4E',
  accSearch: '#8B6F2E',
  accSaved:  '#6A468C',
  accAlerts: '#A1532B',

  // Semantic
  success:     '#1F6E4D',
  successSoft: '#E1EFE8',
  warning:     '#B07A1A',
  warningSoft: '#F5EBD2',
  danger:      '#B83A2A',
  dangerSoft:  '#F5DDD7',
  info:        '#2563EB',
  infoSoft:    'rgba(37,99,235,0.13)',

  // Legacy aliases — keep existing components building
  primaryBlue:    '#2A5BB5',
  accentPurple:   '#2A5BB5',
  electricCyan:   '#2A5BB5',
  border1Legacy:  'rgba(27,30,27,0.06)',
  border2Legacy:  'rgba(27,30,27,0.10)',
  successSoftLegacy: '#E1EFE8',
  warningSoftLegacy: '#F5EBD2',
  dangerSoftLegacy:  '#F5DDD7',
} as const

export const gradients = {
  accent:  ['#2A5BB5', '#3D72D1'] as [string, string],
  success: ['#1F6E4D', '#2E8B57'] as [string, string],
  dark:    ['#FFFFFF', '#FBFAF6'] as [string, string],
  primary: ['#2A5BB5', '#3D72D1'] as [string, string],
  cool:    ['#2A5BB5', '#1D4ED8'] as [string, string],
  hero:    ['#2A5BB5', '#3D72D1', '#4A84E5'] as [string, string, string],
} as const

export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48, 10: 64,
} as const

export const radii = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, pill: 999,
} as const

export const fontSize = {
  display1: 30, display2: 26, headline: 19,
  title: 15, body: 14, caption: 12, micro: 10,
} as const

export const fontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
  black:    '800' as const,
}

// React Native shadow helpers
export const shadows = {
  sm: {
    shadowColor: '#1B1E1B' as string,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  md: {
    shadowColor: '#1B1E1B' as string,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  lg: {
    shadowColor: '#1B1E1B' as string,
    shadowOpacity: 0.12,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
} as const
