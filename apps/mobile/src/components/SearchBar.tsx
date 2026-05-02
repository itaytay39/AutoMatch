import React from 'react'
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, radii, spacing, gradients } from '../theme/tokens'

interface Props {
  value: string
  onChangeText: (text: string) => void
  onFilterPress?: () => void
}

export function SearchBar({ value, onChangeText, onFilterPress }: Props) {
  return (
    <View style={s.wrap}>
      <Text style={s.icon}>🔍</Text>
      <TextInput
        style={s.input}
        placeholder="חפש רכב, דגם, יצרן..."
        placeholderTextColor={colors.fg3}
        value={value}
        onChangeText={onChangeText}
        textAlign="right"
      />
      <TouchableOpacity onPress={onFilterPress}>
        <LinearGradient colors={gradients.primary} style={s.filterBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={s.filterIcon}>⚙</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    height: 52,
    backgroundColor: colors.bg1,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border1,
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    marginTop: 18,
  },
  icon: { fontSize: 18, color: colors.fg3 },
  input: {
    flex: 1,
    color: colors.fg1,
    fontSize: 14,
    fontFamily: 'System',
  },
  filterBtn: {
    width: 40,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: { color: '#fff', fontSize: 16 },
})
