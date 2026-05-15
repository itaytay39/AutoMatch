// AutoMatch Design Tokens — ProTrip language (warm off-white + royal blue)
export const colors = {
  // Surfaces
  bg0: '#F6F2EC',        // page background (warm off-white)
  bg1: '#FFFFFF',        // sheet / card
  bg2: '#F1ECE4',        // subtle alt fill (inputs, tiles)
  bg3: '#EAE3D8',        // hover / pressed

  // Ink hierarchy
  fg1: '#1B1916',        // primary text
  fg2: '#6D665C',        // secondary
  fg3: '#A39A8E',        // tertiary / captions
  fg4: '#C5BEB1',        // placeholder

  // Borders
  border1: '#ECE4D8',
  border2: '#DDD3C3',

  // Brand: Royal Blue
  accent:      '#3450E8',
  accentSoft:  '#E0E7FC',
  accentMuted: '#5E78F0',
  accentInk:   '#1D2E7A',
  onAccent:    '#FFFFFF',

  // Semantic: price signals
  success:     '#1F5A3D',
  successSoft: '#DCEBE0',
  warning:     '#7A4A0D',
  warningSoft: '#F6E2C4',
  danger:      '#9A2A14',
  dangerSoft:  '#FFE2D6',

  // Category accents (source dots)
  mint:   '#3F8C68',
  sky:    '#6AA2C2',
  amber:  '#D69538',
  lilac:  '#8E7BB1',
  sand:   '#B49568',
  coral:  '#EE6A50',

  // Legacy aliases (keep existing components compiling)
  tintHome:   '#F6F2EC',
  tintSearch: '#F6F2EC',
  tintSaved:  '#F6F2EC',
  tintAlerts: '#F6F2EC',
  tintDetail: '#F6F2EC',
  accHome:    '#3450E8',
  accSearch:  '#3450E8',
  accSaved:   '#3450E8',
  accAlerts:  '#3450E8',
  primaryBlue:    '#3450E8',
  accentPurple:   '#3450E8',
  electricCyan:   '#3450E8',
  border1Legacy:  '#ECE4D8',
  border2Legacy:  '#DDD3C3',
  successSoftLegacy: '#DCEBE0',
  warningSoftLegacy: '#F6E2C4',
  dangerSoftLegacy:  '#FFE2D6',
} as const

export const gradients = {
  accent:  ['#1E2A8C', '#3450E8'] as [string, string],
  success: ['#1F5A3D', '#2E7D5B'] as [string, string],
  dark:    ['#FFFFFF', '#F1ECE4'] as [string, string],
  primary: ['#1E2A8C', '#3450E8'] as [string, string],
  cool:    ['#3450E8', '#5E78F0'] as [string, string],
  hero:    ['#1E2A8C', '#3450E8', '#5E78F0'] as [string, string, string],
} as const

export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48, 10: 64,
} as const

export const radii = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, pill: 999,
} as const

export const fontSize = {
  display1: 30, display2: 26, headline: 20,
  title: 16, body: 14, caption: 12, micro: 10,
} as const

// Legacy fontWeight export — kept for AnomalyBadge, ConditionBadge compatibility
export const fontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
  black:    '800' as const,
}

export const shadows = {
  sm: {
    shadowColor: 'rgba(40,30,15,1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  md: {
    shadowColor: 'rgba(40,30,15,1)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
  },
  accent: {
    shadowColor: '#3450E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  // Legacy alias — kept for FilterSheet compatibility
  lg: {
    shadowColor: 'rgba(40,30,15,1)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
  },
} as const
