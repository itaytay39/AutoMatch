import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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
  imageUrl?: string
  priceLabel?: 'good' | 'fair' | 'expensive'
  daysOnLot?: number
  odometerSuspicious?: boolean
  redFlags?: string[]
  dealScore?: 'great' | 'good' | 'fair' | 'suspicious'
  condition?: { score: number; grade: 'A' | 'B' | 'C' | 'D' | 'F'; label: string }
}

interface Props {
  listing: Listing
  onPress?: () => void
}

const PRICE_PILL = {
  good:      { bg: colors.successSoft, color: colors.success, label: 'מחיר טוב' },
  fair:      { bg: colors.warningSoft, color: colors.warning, label: 'סביר' },
  expensive: { bg: colors.dangerSoft,  color: colors.danger,  label: 'יקר' },
}

export function ListingCard({ listing, onPress }: Props) {
  const pill = PRICE_PILL[listing.priceLabel ?? 'fair']
  const price = listing.price.toLocaleString('he-IL')
  const km = listing.mileage?.toLocaleString('he-IL')
  const suspicious = listing.odometerSuspicious || listing.dealScore === 'suspicious'

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.88}>
      {/* Image */}
      <View style={s.imageWrap}>
        {listing.imageUrl ? (
          <Image source={{ uri: listing.imageUrl }} style={s.image} resizeMode="cover" />
        ) : (
          <View style={[s.image, s.imageFallback]}>
            <Ionicons name="car-outline" size={40} color={colors.fg4} />
          </View>
        )}
        {/* Gradient overlay bottom */}
        <View style={s.imageGrad} />

        {/* Source badge */}
        <View style={s.sourceBadge}>
          <Text style={s.sourceText}>{listing.source}</Text>
        </View>

        {/* Favorite */}
        <TouchableOpacity style={s.favBtn} activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={18} color="#fff" />
        </TouchableOpacity>

        {/* Days on lot */}
        {listing.daysOnLot !== undefined && (
          <View style={[s.daysBadge, listing.daysOnLot <= 3 && s.daysBadgeNew]}>
            <Text style={[s.daysText, listing.daysOnLot <= 3 && s.daysTextNew]}>
              {listing.daysOnLot <= 3 ? '🔥 ' : ''}{listing.daysOnLot} ימים
            </Text>
          </View>
        )}
      </View>

      {/* Suspicious banner */}
      {suspicious && (
        <View style={s.warningBar}>
          <Ionicons name="warning-outline" size={13} color={colors.danger} />
          <Text style={s.warningText}>נתונים חשודים — בדוק לפני קנייה</Text>
        </View>
      )}

      {/* Info */}
      <View style={s.info}>
        <View style={s.titleRow}>
          <View style={[s.pricePill, { backgroundColor: pill.bg }]}>
            <Text style={[s.pricePillText, { color: pill.color }]}>{pill.label}</Text>
          </View>
          <Text style={s.carTitle}>{listing.make} {listing.model}</Text>
        </View>

        <View style={s.priceRow}>
          <View style={s.metaRow}>
            {km && (
              <View style={s.metaItem}>
                <Ionicons name="speedometer-outline" size={12} color={listing.odometerSuspicious ? colors.danger : colors.fg4} />
                <Text style={[s.metaText, listing.odometerSuspicious && { color: colors.danger }]}>
                  {km} ק״מ
                </Text>
              </View>
            )}
            {listing.city && (
              <View style={s.metaItem}>
                <Ionicons name="location-outline" size={12} color={colors.fg4} />
                <Text style={s.metaText}>{listing.city}</Text>
              </View>
            )}
            <View style={s.metaItem}>
              <Ionicons name="calendar-outline" size={12} color={colors.fg4} />
              <Text style={s.metaText}>{listing.year}</Text>
            </View>
          </View>
          <Text style={s.price}>₪{price}</Text>
        </View>

        {/* Red flags */}
        {listing.redFlags && listing.redFlags.length > 0 && (
          <View style={s.flagsRow}>
            {listing.redFlags.slice(0, 2).map((f, i) => (
              <View key={i} style={s.flagChip}>
                <Text style={s.flagText}>{f}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bg1,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border1,
    marginBottom: spacing[3],
    overflow: 'hidden',
  },

  imageWrap: {
    aspectRatio: 16 / 9,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageGrad: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Bottom shadow effect
    borderBottomWidth: 0,
  },

  sourceBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  sourceText: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.bold,
    color: '#ED2024',
    letterSpacing: 0.3,
  },

  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  daysBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  daysBadgeNew: { backgroundColor: colors.successSoft },
  daysText: { fontSize: 10, color: colors.fg2, fontWeight: fontWeight.medium },
  daysTextNew: { color: colors.success },

  warningBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing[4],
    paddingVertical: 7,
  },
  warningText: {
    color: colors.danger,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
  },

  info: {
    padding: spacing[4],
  },

  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  carTitle: {
    color: colors.fg1,
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
  },
  pricePill: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pricePillText: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.semibold,
  },

  priceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: colors.fg1,
    fontSize: 22,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },

  metaRow: {
    flexDirection: 'row',
    gap: spacing[3],
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.fg3,
    fontSize: fontSize.caption,
  },

  flagsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing[1],
    marginTop: spacing[3],
  },
  flagChip: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  flagText: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: fontWeight.medium,
  },
})
