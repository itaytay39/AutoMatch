import React from 'react'
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { colors, spacing, fontSize, radii } from '../theme/tokens'
import { fonts } from '../theme/typography'

export function ProfileScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>א</Text>
        </View>
        <Text style={s.name}>איתי</Text>
        <Text style={s.sub}>פרופיל יהיה זמין בקרוב</Text>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  avatar: {
    width: 72, height: 72, borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  avatarText: { color: '#fff', fontSize: 28, fontFamily: fonts.bold },
  name: { color: colors.fg1, fontSize: fontSize.headline, fontFamily: fonts.bold },
  sub:  { color: colors.fg3, fontSize: fontSize.body, fontFamily: fonts.regular },
})
