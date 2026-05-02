import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, radii, spacing, fontSize, fontWeight } from '../theme/tokens'

interface AnomalySignal {
  name: string
  weight: number
  triggered: boolean
  detail: string
}

interface AnomalyResult {
  anomalyScore: number
  anomalyLevel: 'clean' | 'watch' | 'suspicious' | 'alert'
  signals: AnomalySignal[]
}

interface Props {
  anomaly: AnomalyResult
}

const LEVEL_CONFIG = {
  clean:      { color: colors.success,  bg: '#0D2E1A', label: 'תקין' },
  watch:      { color: '#FCD34D',       bg: '#2A2308', label: 'שים לב' },
  suspicious: { color: colors.warning,  bg: '#2A1A08', label: 'חשוד' },
  alert:      { color: colors.danger,   bg: '#2A0D0D', label: '⚠ התראה' },
}

export function AnomalyBadge({ anomaly }: Props) {
  const [expanded, setExpanded] = useState(false)
  const cfg = LEVEL_CONFIG[anomaly.anomalyLevel]
  const triggered = anomaly.signals.filter(s => s.triggered)

  return (
    <TouchableOpacity
      style={[s.container, { backgroundColor: cfg.bg, borderColor: cfg.color }]}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.8}
    >
      <View style={s.header}>
        <Text style={[s.label, { color: cfg.color }]}>{cfg.label}</Text>
        <View style={s.scoreRow}>
          <Text style={[s.score, { color: cfg.color }]}>{anomaly.anomalyScore}</Text>
          <Text style={[s.scoreLabel, { color: cfg.color }]}>/100</Text>
        </View>
        <Text style={[s.chevron, { color: cfg.color }]}>{expanded ? '▲' : '▼'}</Text>
      </View>

      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${anomaly.anomalyScore}%`, backgroundColor: cfg.color }]} />
      </View>

      {expanded && triggered.length > 0 && (
        <View style={s.signals}>
          {triggered.map((sig, i) => (
            <View key={i} style={s.signalRow}>
              <Text style={s.bullet}>•</Text>
              <Text style={[s.signalText, { color: cfg.color }]}>{sig.detail}</Text>
            </View>
          ))}
        </View>
      )}

      {expanded && triggered.length === 0 && (
        <Text style={[s.cleanMsg, { color: cfg.color }]}>לא נמצאו חריגות — מודעה נראית תקינה</Text>
      )}
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  container: {
    borderRadius: radii.lg, borderWidth: 1,
    padding: spacing[3], marginTop: spacing[3],
  },
  header: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
  },
  label: { fontSize: fontSize.caption, fontWeight: fontWeight.bold },
  scoreRow: { flexDirection: 'row-reverse', alignItems: 'baseline' },
  score: { fontSize: 18, fontWeight: fontWeight.bold },
  scoreLabel: { fontSize: 11, marginRight: 2 },
  chevron: { fontSize: 10 },
  barTrack: {
    height: 4, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radii.pill, overflow: 'hidden', marginTop: spacing[2],
  },
  barFill: { height: '100%', borderRadius: radii.pill },
  signals: { marginTop: spacing[3], gap: spacing[1] },
  signalRow: { flexDirection: 'row-reverse', gap: spacing[1] },
  bullet: { color: '#888', fontSize: 12 },
  signalText: { flex: 1, fontSize: fontSize.micro, textAlign: 'right' },
  cleanMsg: { marginTop: spacing[2], fontSize: fontSize.micro, textAlign: 'right' },
})
