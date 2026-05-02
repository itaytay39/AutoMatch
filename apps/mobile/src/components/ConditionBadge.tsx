import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, radii, fontSize, fontWeight } from '../theme/tokens'

interface Props {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  label: string
  compact?: boolean
}

const GRADE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  A: { bg: '#0D2E1A', color: '#34D399', border: '#34D399' },
  B: { bg: '#0D2A1A', color: '#6EE7B7', border: '#6EE7B7' },
  C: { bg: '#2A2308', color: '#FCD34D', border: '#FCD34D' },
  D: { bg: '#2A1508', color: '#FB923C', border: '#FB923C' },
  F: { bg: '#2A0D0D', color: '#F87171', border: '#F87171' },
}

export function ConditionBadge({ score, grade, label, compact = false }: Props) {
  const c = GRADE_COLORS[grade]

  if (compact) {
    return (
      <View style={[s.compact, { backgroundColor: c.bg, borderColor: c.border }]}>
        <Text style={[s.compactGrade, { color: c.color }]}>{grade}</Text>
        <Text style={[s.compactScore, { color: c.color }]}>{score}</Text>
      </View>
    )
  }

  return (
    <View style={[s.container, { backgroundColor: c.bg, borderColor: c.border }]}>
      <View style={s.left}>
        <Text style={[s.grade, { color: c.color }]}>{grade}</Text>
      </View>
      <View style={s.right}>
        <Text style={[s.scoreText, { color: c.color }]}>{score}/10</Text>
        <Text style={[s.label, { color: c.color }]}>{label}</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
  },
  left: { alignItems: 'center', minWidth: 32 },
  grade: { fontSize: 28, fontWeight: fontWeight.bold },
  right: { flex: 1 },
  scoreText: { fontSize: fontSize.title, fontWeight: fontWeight.bold, textAlign: 'right' },
  label: { fontSize: fontSize.caption, textAlign: 'right', marginTop: 1 },
  compact: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 4,
    alignItems: 'center',
  },
  compactGrade: { fontSize: fontSize.caption, fontWeight: fontWeight.bold },
  compactScore: { fontSize: 10 },
})
