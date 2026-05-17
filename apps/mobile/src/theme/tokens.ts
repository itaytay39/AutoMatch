export const colors = {
  // Surfaces
  bg0: '#F6F2EC',       // bg-warm: page background
  bg1: '#FFFFFF',       // sheet: card/panel
  bg2: '#F1ECE4',       // sheet-2: input/tile fill
  bg3: '#EAE3D8',       // sheet-3: hover/pressed

  // Ink hierarchy
  fg1: '#1B1916',       // ink: primary text
  fg2: '#6D665C',       // ink-2: secondary
  fg3: '#A39A8E',       // ink-3: tertiary/captions
  fg4: '#C5BEB1',       // ink-4: placeholder/disabled
  fg5: '#DDD3C3',       // ink-5: decorative

  // Lines/borders
  border1: '#ECE4D8',   // line: hairline
  border2: '#DDD3C3',   // line-2: stronger separator

  // Brand: Royal Blue
  accent:      '#3450E8',
  accentDark:  '#1F37C2',
  accentSoft:  '#E0E7FC',
  accentInk:   '#1D2E7A',
  accentMuted: '#5E78F0',
  onAccent:    '#FFFFFF',

  // Semantic: price/trend signals
  success:      '#1F5A3D',  // good: price drop
  successSoft:  '#DCEBE0',  // good-bg
  warning:      '#7A4A0D',  // warn: fair/sideways
  warningSoft:  '#F6E2C4',  // warn-bg
  danger:       '#9A2A14',  // bad: price up
  dangerSoft:   '#FFE2D6',  // bad-bg

  // Source dot accents
  mint:   '#3F8C68',
  sky:    '#6AA2C2',
  amber:  '#D69538',
  lilac:  '#8E7BB1',
  sand:   '#B49568',
  coral:  '#EE6A50',

  // Legacy aliases (keep existing screens compiling)
  tintHome:   '#F6F2EC',
  tintSearch: '#F6F2EC',
  tintSaved:  '#F6F2EC',
  tintAlerts: '#F6F2EC',
  tintDetail: '#F6F2EC',
  accHome:    '#3450E8',
  accSearch:  '#3450E8',
  accSaved:   '#3450E8',
  accAlerts:  '#3450E8',
  primaryBlue:   '#3450E8',
  electricCyan:  '#3450E8',
  accentPurple:  '#3450E8',
} as const

export const gradients = {
  hero:    ['#1E2A8C', '#3450E8', '#5E78F0'] as [string, string, string],
  accent:  ['#1E2A8C', '#3450E8'] as [string, string],
  finance: ['#1E2A8C', '#3450E8', '#5E78F0'] as [string, string, string],
  primary: ['#1E2A8C', '#3450E8'] as [string, string],
  cool:    ['#3450E8', '#5E78F0'] as [string, string],
  dark:    ['#FFFFFF', '#F1ECE4'] as [string, string],
  heroCard: '#14121F',
} as const

export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 7: 32, 8: 40, 9: 48, 10: 64,
} as const

export const radii = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 999,
} as const

export const fontSize = {
  display1: 30, display2: 26, headline: 20,
  title: 16, body: 14, caption: 12, micro: 10,
} as const

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
  lg: {
    shadowColor: 'rgba(40,30,15,1)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
  accent: {
    shadowColor: '#3450E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
} as const
