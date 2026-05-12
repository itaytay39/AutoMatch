export const fonts = {
  light:    'Rubik_300Light',
  regular:  'Rubik_400Regular',
  medium:   'Rubik_500Medium',
  semibold: 'Rubik_600SemiBold',
  bold:     'Rubik_700Bold',
  num:      'Rubik_500Medium',  // used for prices and numeric values
}

export const textStyles = {
  display:  { fontFamily: fonts.bold,     fontSize: 26, lineHeight: 30, letterSpacing: -0.8 },
  title:    { fontFamily: fonts.semibold, fontSize: 19, lineHeight: 24, letterSpacing: -0.3 },
  body:     { fontFamily: fonts.regular,  fontSize: 14, lineHeight: 22 },
  bodyBold: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 22 },
  caption:  { fontFamily: fonts.medium,   fontSize: 12, lineHeight: 18 },
  eyebrow:  { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' as const },
}
