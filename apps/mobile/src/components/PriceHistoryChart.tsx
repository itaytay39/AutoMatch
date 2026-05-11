import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
import Svg, { Polyline, Circle, Defs, LinearGradient, Stop, Polygon, Line } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, spacing, radii } from '../theme/tokens'
import { fonts } from '../theme/typography'

interface Snapshot {
  date: string
  price: number
}

interface Props {
  snapshots: Snapshot[]
}

const W = Dimensions.get('window').width - 64  // card padding
const H = 110
const PAD = { top: 16, bottom: 28, left: 8, right: 8 }

export function PriceHistoryChart({ snapshots }: Props) {
  if (!snapshots || snapshots.length < 2) {
    return (
      <View style={s.card}>
        <View style={s.emptyRow}>
          <Ionicons name="analytics-outline" size={18} color={colors.fg4} />
          <Text style={s.emptyText}>אין היסטוריית מחיר עדיין</Text>
        </View>
      </View>
    )
  }

  const prices = snapshots.map(s => s.price)
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const range = maxP - minP || 1

  const first = snapshots[0]
  const last = snapshots[snapshots.length - 1]
  const dropped = last.price < first.price
  const unchanged = last.price === first.price
  const lineColor = dropped ? '#34D399' : unchanged ? colors.fg3 : '#F87171'
  const diffAmt = Math.abs(last.price - first.price)

  const toX = (i: number) =>
    PAD.left + (i / (snapshots.length - 1)) * (W - PAD.left - PAD.right)
  const toY = (p: number) =>
    PAD.top + ((maxP - p) / range) * (H - PAD.top - PAD.bottom)

  const points = snapshots.map((s, i) => ({ x: toX(i), y: toY(s.price), price: s.price, date: s.date }))
  const polyPts = points.map(p => `${p.x},${p.y}`).join(' ')

  // Area fill polygon (line + bottom)
  const areaPts = [
    ...points.map(p => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${H - PAD.bottom}`,
    `${points[0].x},${H - PAD.bottom}`,
  ].join(' ')

  const formatK = (p: number) => `₪${Math.round(p / 1000)}K`
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })

  const gradientId = `price-grad-${dropped ? 'down' : 'up'}`

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          {!unchanged && (
            <View style={[s.changePill, { backgroundColor: dropped ? '#0D2E1A' : '#2A0D0D' }]}>
              <Ionicons
                name={dropped ? 'trending-down' : 'trending-up'}
                size={12} color={lineColor}
              />
              <Text style={[s.changeText, { color: lineColor }]}>
                {dropped ? '-' : '+'}₪{diffAmt.toLocaleString('he-IL')}
              </Text>
            </View>
          )}
        </View>
        <Text style={s.title}>היסטוריית מחיר</Text>
      </View>

      {/* Chart */}
      <Svg width={W} height={H}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0.33, 0.66].map((f, i) => (
          <Line
            key={i}
            x1={PAD.left} y1={PAD.top + f * (H - PAD.top - PAD.bottom)}
            x2={W - PAD.right} y2={PAD.top + f * (H - PAD.top - PAD.bottom)}
            stroke={colors.border1} strokeWidth={1}
          />
        ))}

        {/* Area fill */}
        <Polygon points={areaPts} fill={`url(#${gradientId})`} />

        {/* Line */}
        <Polyline
          points={polyPts}
          fill="none" stroke={lineColor} strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round"
        />

        {/* Start dot */}
        <Circle
          cx={points[0].x} cy={points[0].y}
          r={5} fill={colors.bg1} stroke={lineColor} strokeWidth={2}
        />

        {/* End dot */}
        <Circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={6} fill={lineColor} />
      </Svg>

      {/* Footer */}
      <View style={s.footer}>
        <View style={s.footerCell}>
          <Text style={s.footerDate}>{formatDate(first.date)}</Text>
          <Text style={[s.footerPrice, { color: colors.fg3 }]}>{formatK(first.price)}</Text>
        </View>
        <View style={[s.footerCell, { alignItems: 'flex-start' }]}>
          <Text style={s.footerDate}>{formatDate(last.date)}</Text>
          <Text style={[s.footerPrice, { color: lineColor }]}>{formatK(last.price)}</Text>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bg1, borderRadius: radii.xl,
    borderWidth: 0.5, borderColor: colors.border2, padding: spacing[4],
  },
  header: {
    flexDirection: 'row-reverse', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing[3],
  },
  headerLeft: { flexDirection: 'row-reverse', alignItems: 'center' },
  title: { color: colors.fg2, fontSize: fontSize.caption, fontFamily: fonts.semibold },
  changePill: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4,
  },
  changeText: { fontSize: 11, fontFamily: fonts.bold },

  footer: {
    flexDirection: 'row-reverse', justifyContent: 'space-between',
    marginTop: spacing[2], paddingTop: spacing[2],
    borderTopWidth: 0.5, borderTopColor: colors.border1,
  },
  footerCell: { alignItems: 'flex-end' },
  footerDate: { color: colors.fg4, fontSize: 10, fontFamily: fonts.regular, marginBottom: 2 },
  footerPrice: { fontSize: fontSize.title, fontFamily: fonts.bold },

  emptyRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: spacing[2],
    paddingVertical: spacing[3],
  },
  emptyText: { color: colors.fg3, fontSize: fontSize.caption, fontFamily: fonts.regular },
})
