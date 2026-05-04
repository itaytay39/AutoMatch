import React, { useState } from 'react'
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
}

interface Props {
  listing: Listing
  onPress?: () => void
}

const PRICE_CONFIG = {
  good:      { bg: colors.successSoft, color: colors.success, label: 'מחיר טוב ✓' },
  fair:      { bg: colors.warningSoft, color: colors.warning, label: 'מחיר סביר' },
  expensive: { bg: colors.dangerSoft,  color: colors.danger,  label: 'יקר יחסית' },
}

export function ListingCard({ listing, onPress }: Props) {
  const [saved, setSaved] = useState(false)
  const pill = PRICE_CONFIG[listing.priceLabel ?? 'fair']
  const price = listing.price.toLocaleString('he-IL')
  const km = listing.mileage?.toLocaleString('he-IL')
  const isNew = (listing.daysOnLot ?? 99) <= 3
  const suspicious = listing.odometerSuspicious || listing.dealScore === 'suspicious'

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.9}>
      {/* ── Image ── */}
      <View style={s.imageWrap}>
        {listing.imageUrl ? (
          <Image source={{ uri: listing.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : (
          <View style={s.imgFallback}>
            <Ionicons name="car-sport-outline" size={44} color={colors.fg4} />
          </View>
        )}

        {/* bottom gradient scrim */}
        <View style={s.scrim} />

        {/* Top row: source + fav */}
        <View style={s.imgTopRow}>
          <TouchableOpacity
            style={[s.favBtn, saved && s.favBtnActive]}
            onPress={() => setSaved(v => !v)}
            activeOpacity={0.75}
          >
            <Ionicons name={saved ? 'heart' : 'heart-outline'} size={16} color={saved ? colors.danger : '#fff'} />
          </TouchableOpacity>
          <View style={s.sourceBadge}>
            <Text style={s.sourceText}>{listing.source}</Text>
          </View>
        </View>

        {/* Bottom row: days badge */}
        {listing.daysOnLot !== undefined && (
          <View style={[s.daysBadge, isNew && s.daysBadgeNew]}>
            <Text style={[s.daysText, isNew && s.daysTextNew]}>
              {isNew ? `🔥 ${listing.daysOnLot} ימים` : `${listing.daysOnLot} ימים`}
            </Text>
          </View>
        )}
      </View>

      {/* ── Suspicious bar ── */}
      {suspicious && (
        <View style={s.warningBar}>
          <Text style={s.warningText}>⚠ נתונים חשודים — בדוק לפני קנייה</Text>
        </View>
      )}

      {/* ── Info ── */}
      <View style={s.info}>
        {/* Title row */}
        <View style={s.titleRow}>
          <View style={[s.pricePill, { backgroundColor: pill.bg }]}>
            <Text style={[s.pricePillText, { color: pill.color }]}>{pill.label}</Text>
          </View>
          <Text style={s.carTitle} numberOfLines={1}>
            {listing.make} {listing.model}
          </Text>
        </View>

        {/* Price */}
        <Text style={s.price}>₪{price}</Text>

        {/* Meta chips row — RTL: right to left */}
        <View style={s.metaRow}>
          {listing.year && (
            <View style={s.metaChip}>
              <Ionicons name="calendar-outline" size={11} color={colors.fg3} />
              <Text style={s.metaText}>{listing.year}</Text>
            </View>
          )}
          {km && (
            <View style={[s.metaChip, listing.odometerSuspicious && s.metaChipWarn]}>
              <Ionicons name="speedometer-outline" size={11} color={listing.odometerSuspicious ? colors.danger : colors.fg3} />
              <Text style={[s.metaText, listing.odometerSuspicious && { color: colors.danger }]}>{km} ק״מ</Text>
            </View>
          )}
          {listing.city && (
            <View style={s.metaChip}>
              <Ionicons name="location-outline" size={11} color={colors.fg3} />
              <Text style={s.metaText}>{listing.city}</Text>
            </View>
          )}
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
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing[3],
  },

  // Image
  imageWrap: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.bg2,
    position: 'relative',
  },
  imgFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg2,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Pure CSS gradient not supported in RN — use View overlay at bottom
  },
  imgTopRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceBadge: {
    backgroundColor: 'rgba(6,8,11,0.75)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sourceText: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.semibold,
    color: '#fff',
    letterSpacing: 0.3,
  },
  favBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(6,8,11,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  favBtnActive: {
    backgroundColor: 'rgba(220,38,38,0.15)',
    borderColor: 'rgba(220,38,38,0.3)',
  },
  daysBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(6,8,11,0.65)',
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  daysBadgeNew: { backgroundColor: colors.successSoft },
  daysText: { fontSize: 10, color: colors.fg2, fontWeight: fontWeight.medium },
  daysTextNew: { color: colors.success },

  // Warning
  warningBar: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing[4],
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  warningText: {
    color: colors.danger,
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
  },

  // Info section
  info: {
    padding: spacing[4],
    paddingTop: spacing[3],
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  carTitle: {
    color: colors.fg1,
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    flex: 1,
    textAlign: 'right',
  },
  pricePill: {
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginStart: spacing[2],
  },
  pricePillText: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.2,
  },
  price: {
    color: colors.fg1,
    fontSize: 24,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    letterSpacing: -0.5,
    marginBottom: spacing[2],
  },

  // Meta row — RTL: flexDirection row-reverse so items appear right→left
  metaRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaChip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg2,
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  metaChipWarn: { backgroundColor: colors.dangerSoft },
  metaText: {
    color: colors.fg2,
    fontSize: fontSize.caption,
  },

  // Flags
  flagsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: spacing[2],
  },
  flagChip: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  flagText: {
    fontSize: fontSize.micro,
    color: colors.danger,
    fontWeight: fontWeight.medium,
  },
})
