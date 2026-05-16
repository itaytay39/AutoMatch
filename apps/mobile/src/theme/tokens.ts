// AutoMatch Design Tokens — Dark theme (deep charcoal + electric blue/purple)
export const colors = {
  // Surfaces
  bg0: '#0B0F14',        // deep-charcoal page background
  bg1: '#12171E',        // card / panel surface
  bg2: '#18212A',        // input / nested surface
  bg3: '#1F2935',        // hover state

  // Ink hierarchy
  fg1: '#FFFFFF',        // primary text
  fg2: '#C7CDD6',        // secondary text
  fg3: '#8D95A3',        // tertiary / captions
  fg4: '#5A6472',        // disabled

  // Borders
  border1: 'rgba(255,255,255,0.06)',   // hairline
  border2: 'rgba(255,255,255,0.10)',   // card edge

  // Brand: Electric Blue
  accent:       '#5B88FF',            // primary-blue
  accentPurple: '#BB5CF6',            // accent-purple
  electricCyan: '#00E5FF',            // electric cyan
  accentSoft:   'rgba(91,136,255,0.14)',
  onAccent:     '#FFFFFF',

  // Semantic: price signals
  success:     '#22C55E',
  successSoft: 'rgba(34,197,94,0.14)',
  warning:     '#F59E0B',
  warningSoft: 'rgba(245,158,11,0.14)',
  danger:      '#EF4444',
  dangerSoft:  'rgba(239,68,68,0.14)',

  // Legacy aliases for existing screens — pointing to new values
  tintHome:   '#0B0F14',
  tintSearch: '#0B0F14',
  tintSaved:  '#0B0F14',
  tintAlerts: '#0B0F14',
  tintDetail: '#0B0F14',
  accHome:    '#5B88FF',
  accSearch:  '#5B88FF',
  accSaved:   '#5B88FF',
  accAlerts:  '#5B88FF',
  primaryBlue:   '#5B88FF',
  accentMuted:   '#BB5CF6',
  accentInk:     '#FFFFFF',
} as const

export const gradients = {
  primary:  ['#5B88FF', '#BB5CF6'] as [string, string],           // purple-blue electric
  cool:     ['#00E5FF', '#5B88FF'] as [string, string],           // cyan-blue
  hero:     ['#5B88FF', '#BB5CF6', '#00E5FF'] as [string, string, string],
  heroCard: '#14121F',                                             // hero card base color
  // Legacy aliases
  accent:   ['#5B88FF', '#BB5CF6'] as [string, string],
  success:  ['#22C55E', '#16A34A'] as [string, string],
  dark:     ['#12171E', '#18212A'] as [string, string],
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius: 24,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.55,
    shadowRadius: 40,
    elevation: 10,
  },
  accent: {
    shadowColor: '#5B88FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
} as const
