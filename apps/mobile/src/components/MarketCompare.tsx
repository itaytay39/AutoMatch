import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, radii, spacing, fontSize, fontWeight } from '../theme/tokens'

interface Market {
  avgMarketPrice: number | null
  priceDiff: number | null
  priceDiffPct: number | null
  priceRating: 'great_deal' | 'good_deal' | 'fair' | 'overpriced' | 'unknown'
  priceRatingLabel: string
  similarCount: number
}

interface Props {
  market: Market
  currentPrice: number
}

const RATING_COLORS: Record<string, string> = {
  great_deal: colors.success,
  good_deal: '#6EE7B7',
  fair: colors.fg2,
  overpriced: colors.danger,
  unknown: colors.fg3,
}

export function MarketCompare({ market, currentPrice }: Props) {
  if (market.priceRating === 'unknown') return null

  const color = RATING_COLORS[market.priceRating]
  const diffAbs = Math.abs(market.priceDiff ?? 0).toLocaleString('he-IL')
  const avg = market.avgMarketPrice?.toLocaleString('he-IL')

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>השוואת שוק</Text>
        <Text style={[s.rating, { color }]}>{market.priceRatingLabel}</Text>
      </View>

      <View style={s.bar}>
        {/* Market avg indicator */}
        <View style={s.barTrack}>
          <View style={[s.barFill, {
            width: `${Math.min(100, Math.max(10, 50 + (market.priceDiffPct ?? 0) * -1))}%`,
            backgroundColor: color,
          }]} />
        </View>
      </View>

      <View style={s.row}>
        <Text style={s.meta}>ממוצע שוק: ₪{avg}</Text>
        <Text style={s.meta}>{market.similarCount} מכוניות דומות</Text>
      </View>

      {market.priceDiff !== null && (
        <Text style={[s.diff, { color }]}>
          {market.priceDiff < 0 ? `חוסכת ₪${diffAbs}` : `יקר ב-₪${diffAbs}`} מהממוצע
        </Text>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    backgroundColor: colors.bg1, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border1,
    padding: spacing[4], marginTop: spacing[3],
  },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, color: colors.fg2 },
  rating: { fontSize: fontSize.caption, fontWeight: fontWeight.bold },
  bar: { marginVertical: spacing[3] },
  barTrack: { height: 6, backgroundColor: colors.bg2, borderRadius: radii.pill, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radii.pill },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  meta: { fontSize: fontSize.micro, color: colors.fg3 },
  diff: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, marginTop: spacing[2], textAlign: 'right' },
})
