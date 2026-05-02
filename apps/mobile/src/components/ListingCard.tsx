import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { colors, radii, spacing, fontSize, fontWeight } from '../theme/tokens'

interface Listing {
  id: string
  make: string
  model: string
  year: number
  mileage?: number
  price: number
  city?: string
  source: string
  priceLabel?: 'good' | 'fair' | 'expensive'
}

interface Props {
  listing: Listing
  onPress?: () => void
}

const PILL = {
  good: { bg: colors.successSoft, color: colors.success, label: 'מחיר טוב' },
  fair: { bg: colors.warningSoft, color: colors.warning, label: 'סביר' },
  expensive: { bg: colors.dangerSoft, color: colors.danger, label: 'יקר' },
}

export function ListingCard({ listing, onPress }: Props) {
  const pill = PILL[listing.priceLabel ?? 'fair']
  const price = listing.price.toLocaleString('he-IL')
  const km = listing.mileage?.toLocaleString('he-IL')

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      {/* Photo placeholder */}
      <View style={s.photo}>
        <View style={s.srcBadge}>
          <Text style={s.srcText}>{listing.source}</Text>
        </View>
        <TouchableOpacity style={s.heartBtn}>
          <Text style={s.heartIcon}>♡</Text>
        </TouchableOpacity>
        {/* Car silhouette */}
        <View style={s.carSilhouette} />
      </View>

      {/* Info */}
      <View style={s.info}>
        <Text style={s.title}>{listing.make} {listing.model}</Text>
        <Text style={s.submeta}>{listing.year} · יד שנייה · אוטומט</Text>

        <View style={s.priceRow}>
          <Text style={s.price}>₪ {price}</Text>
          <View style={[s.pill, { backgroundColor: pill.bg }]}>
            <Text style={[s.pillText, { color: pill.color }]}>{pill.label}</Text>
          </View>
        </View>

        <View style={s.stats}>
          {km && <Text style={s.stat}>{km} ק״מ</Text>}
          {listing.city && <Text style={s.stat}>📍 {listing.city}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bg1,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border2,
    overflow: 'hidden',
    marginBottom: spacing[3],
  },
  photo: {
    aspectRatio: 16 / 10,
    backgroundColor: colors.bg2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  srcBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  srcText: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.bold,
    color: '#ED2024',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(11,15,20,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heartIcon: { color: colors.fg1, fontSize: 16 },
  carSilhouette: {
    width: '60%',
    height: 40,
    backgroundColor: 'rgba(91,112,136,0.5)',
    borderRadius: radii.md,
  },
  info: { padding: spacing[4] },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    color: colors.fg1,
    textAlign: 'right',
  },
  submeta: {
    fontSize: fontSize.caption,
    color: colors.fg3,
    marginTop: 2,
    marginBottom: spacing[3],
    textAlign: 'right',
  },
  priceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 22,
    fontWeight: fontWeight.bold,
    color: colors.fg1,
  },
  pill: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillText: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.semibold,
  },
  stats: {
    flexDirection: 'row-reverse',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  stat: {
    fontSize: fontSize.caption,
    color: colors.fg3,
  },
})
