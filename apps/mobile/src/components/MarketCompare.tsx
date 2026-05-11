import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, radii, spacing, fontSize } from '../theme/tokens'
import { fonts } from '../theme/typography'

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

const RATING_CFG: Record<string, { color: string; bg: string; icon: string; gradient: [string, string] }> = {
  great_deal: { color: '#34D399', bg: '#0D2E1A', icon: 'trending-down', gradient: ['#34D399', '#16A34A'] },
  good_deal:  { color: '#6EE7B7', bg: '#0D2A1A', icon: 'checkmark-circle', gradient: ['#6EE7B7', '#34D399'] },
  fair:       { color: colors.fg2, bg: colors.bg2, icon: 'remove-circle-outline', gradient: [colors.fg2, colors.fg3] },
  overpriced: { color: '#F87171', bg: '#2A0D0D', icon: 'trending-up', gradient: ['#F87171', '#DC2626'] },
  unknown:    { color: colors.fg3, bg: colors.bg2, icon: 'help-circle-outline', gradient: [colors.fg3, colors.fg4] },
}

export function MarketCompare({ market, currentPrice }: Props) {
  if (market.priceRating === 'unknown') return null

  const cfg = RATING_CFG[market.priceRating] ?? RATING_CFG.fair
  const diffAbs = Math.abs(market.priceDiff ?? 0).toLocaleString('he-IL')
  const avg = market.avgMarketPrice?.toLocaleString('he-IL')
  const pct = market.priceDiffPct

  // Position on bar: 50% = at market, <50% = cheaper, >50% = pricier
  const barPct = Math.min(100, Math.max(5, 50 + (pct ?? 0) * -0.5))
  const cheaper = (market.priceDiff ?? 0) < 0

  return (
    <View style={[s.card, { borderColor: `${cfg.color}22` }]}>
      {/* Header */}
      <View style={s.header}>
        <View style={[s.ratingBadge, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon as any} size={14} color={cfg.color} />
          <Text style={[s.ratingText, { color: cfg.color }]}>{market.priceRatingLabel}</Text>
        </View>
        <Text style={s.similarCount}>{market.similarCount} מכוניות דומות</Text>
      </View>

      {/* Bar */}
      <View style={s.barSection}>
        <View style={s.barTrack}>
          <View style={s.barMidLine} />
          {/* Gradient fill from left to position */}
          <View style={[s.barFillWrap, { width: `${barPct}%` }]}>
            <LinearGradient
              colors={cfg.gradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.barFill}
            />
          </View>
          {/* Thumb */}
          <View style={[s.barThumb, { left: `${barPct}%`, borderColor: cfg.color }]} />
        </View>
        <View style={s.barLabels}>
          <Text style={s.barLabel}>יקר</Text>
          <Text style={s.barLabelCenter}>שוק</Text>
          <Text style={s.barLabel}>זול</Text>
        </View>
      </View>

      {/* Price rows */}
      <View style={s.priceGrid}>
        <PriceCell label="מחיר המודעה" value={`₪${currentPrice.toLocaleString('he-IL')}`} highlight />
        <View style={s.divider} />
        <PriceCell label="ממוצע שוק" value={`₪${avg}`} />
      </View>

      {/* Diff summary */}
      {market.priceDiff !== null && Math.abs(market.priceDiff) > 100 && (
        <View style={[s.diffRow, { backgroundColor: cfg.bg }]}>
          <Text style={[s.diffText, { color: cfg.color }]}>
            {cheaper ? `חוסכת ₪${diffAbs} מהממוצע` : `יקר ב-₪${diffAbs} מהממוצע`}
          </Text>
          {pct !== null && (
            <Text style={[s.diffPct, { color: cfg.color }]}>
              {Math.abs(pct).toFixed(1)}%
            </Text>
          )}
        </View>
      )}
    </View>
  )
}

function PriceCell({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  return (
    <View style={pc.cell}>
      <Text style={pc.label}>{label}</Text>
      <Text style={[pc.value, highlight && pc.valueHighlight]}>{value ?? '—'}</Text>
    </View>
  )
}

const pc = StyleSheet.create({
  cell: { flex: 1, alignItems: 'center', gap: 3 },
  label: { color: colors.fg3, fontSize: fontSize.micro, fontFamily: fonts.regular },
  value: { color: colors.fg2, fontSize: fontSize.title, fontFamily: fonts.bold },
  valueHighlight: { color: colors.fg1 },
})

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bg1, borderRadius: radii.xl,
    borderWidth: 0.5, padding: spacing[4],
  },
  header: {
    flexDirection: 'row-reverse', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing[4],
  },
  ratingBadge: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
    borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 6,
  },
  ratingText: { fontSize: fontSize.caption, fontFamily: fonts.bold },
  similarCount: { color: colors.fg3, fontSize: fontSize.micro, fontFamily: fonts.regular },

  barSection: { marginBottom: spacing[4] },
  barTrack: {
    height: 8, backgroundColor: colors.bg2, borderRadius: radii.pill,
    overflow: 'visible', position: 'relative', marginBottom: spacing[2],
  },
  barMidLine: {
    position: 'absolute', left: '50%', top: -4, bottom: -4,
    width: 1, backgroundColor: colors.border2,
  },
  barFillWrap: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    overflow: 'hidden', borderRadius: radii.pill,
  },
  barFill: { flex: 1 },
  barThumb: {
    position: 'absolute', top: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.bg1, borderWidth: 2,
    marginLeft: -8,
  },
  barLabels: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', paddingHorizontal: 2,
  },
  barLabel: { color: colors.fg4, fontSize: 10, fontFamily: fonts.regular },
  barLabelCenter: { color: colors.fg4, fontSize: 10, fontFamily: fonts.regular },

  priceGrid: {
    flexDirection: 'row-reverse', marginBottom: spacing[3],
    backgroundColor: colors.bg2, borderRadius: radii.md, padding: spacing[3],
  },
  divider: { width: 0.5, backgroundColor: colors.border2, marginHorizontal: spacing[3] },

  diffRow: {
    flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: radii.md, paddingHorizontal: spacing[3], paddingVertical: spacing[2],
  },
  diffText: { fontSize: fontSize.caption, fontFamily: fonts.semibold },
  diffPct: { fontSize: fontSize.caption, fontFamily: fonts.bold },
})
