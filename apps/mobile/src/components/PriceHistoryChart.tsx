import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg'
import { colors, fontSize, fontWeight, spacing, radii } from '../theme/tokens'

interface Snapshot {
  date: string
  price: number
}

interface Props {
  snapshots: Snapshot[]
}

const W = 320
const H = 100
const PAD = 16

export function PriceHistoryChart({ snapshots }: Props) {
  if (!snapshots || snapshots.length < 2) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>אין היסטוריית מחיר עדיין</Text>
      </View>
    )
  }

  const prices = snapshots.map((s) => s.price)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const range = maxP - minP || 1

  const points = snapshots.map((snap, i) => {
    const x = PAD + (i / (snapshots.length - 1)) * (W - PAD * 2)
    const y = PAD + ((maxP - snap.price) / range) * (H - PAD * 2)
    return { x, y, price: snap.price, date: snap.date }
  })

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const first = points[0]
  const last = points[points.length - 1]
  const dropped = last.price < first.price
  const lineColor = dropped ? colors.success : colors.danger

  const formatPrice = (p: number) => `₪${(p / 1000).toFixed(0)}K`
  const formatDate = (d: string) => new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>היסטוריית מחיר</Text>
        {dropped ? (
          <Text style={s.dropped}>▼ ירד ב-₪{(first.price - last.price).toLocaleString('he-IL')}</Text>
        ) : maxP > minP ? (
          <Text style={s.risen}>▲ עלה ב-₪{(last.price - first.price).toLocaleString('he-IL')}</Text>
        ) : null}
      </View>
      <Svg width={W} height={H}>
        {/* Grid line */}
        <Line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke={colors.border1} strokeWidth={1} strokeDasharray="4,4" />
        {/* Price line */}
        <Polyline points={polylinePoints} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* Start dot */}
        <Circle cx={first.x} cy={first.y} r={5} fill={colors.bg1} stroke={lineColor} strokeWidth={2} />
        {/* End dot */}
        <Circle cx={last.x} cy={last.y} r={6} fill={lineColor} />
        {/* Labels */}
        <SvgText x={first.x} y={H - 2} fontSize={9} fill={colors.fg3} textAnchor="middle">{formatDate(snapshots[0].date)}</SvgText>
        <SvgText x={last.x} y={H - 2} fontSize={9} fill={colors.fg3} textAnchor="middle">{formatDate(snapshots[snapshots.length - 1].date)}</SvgText>
      </Svg>
      <View style={s.priceRow}>
        <Text style={s.priceLabel}>{formatPrice(last.price)} כיום</Text>
        <Text style={s.priceLabel}>{formatPrice(first.price)} התחלה</Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.bg1, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border1,
    padding: spacing[4], marginTop: spacing[3],
  },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] },
  title: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, color: colors.fg2 },
  dropped: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, color: colors.success },
  risen: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, color: colors.danger },
  priceRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 4 },
  priceLabel: { fontSize: fontSize.micro, color: colors.fg3 },
  empty: { padding: spacing[4], alignItems: 'center' },
  emptyText: { color: colors.fg3, fontSize: fontSize.caption },
})
