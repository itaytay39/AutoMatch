import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, radii, spacing, fontSize } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { toggleSaved, useSaved } from '../store/savedStore'

export interface ListingCardData {
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
  listing: ListingCardData
  onPress?: () => void
}

const PRICE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  good:      { color: '#34D399', bg: '#0D2E1A', label: 'מחיר טוב' },
  fair:      { color: colors.fg3, bg: colors.bg2, label: 'מחיר שוק' },
  expensive: { color: '#F87171', bg: '#2A0D0D', label: 'יקר יחסית' },
}

const DEAL_DOTS: Record<string, string> = {
  great: '#34D399', good: '#6EE7B7', fair: colors.fg3, suspicious: colors.warning,
}

export function ListingCard({ listing, onPress }: Props) {
  const saved = useSaved()
  const isSaved = saved.has(listing.id)

  const handleSave = useCallback((_e: unknown) => {
    e.stopPropagation?.()
    toggleSaved(listing.id)
  }, [listing.id])

  const pill = PRICE_CONFIG[listing.priceLabel ?? 'fair']
  const dealDot = DEAL_DOTS[listing.dealScore ?? 'fair']
  const price = listing.price.toLocaleString('he-IL')
  const suspicious = listing.odometerSuspicious || listing.dealScore === 'suspicious'

  const metaParts = [
    listing.year?.toString(),
    listing.mileage ? `${listing.mileage.toLocaleString('he-IL')} ק״מ` : null,
    listing.city,
  ].filter(Boolean)

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.93}>

      {/* ── Image ── */}
      <View style={s.imageWrap}>
        {listing.imageUrl ? (
          <Image
            source={{ uri: listing.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View style={s.imgFallback}>
            <Ionicons name="car-sport-outline" size={44} color={colors.fg4} />
          </View>
        )}

        <LinearGradient
          colors={['transparent', 'rgba(6,8,11,0.92)']}
          style={s.scrim}
        />

        {/* Top overlay */}
        <View style={s.imgTop}>
          <TouchableOpacity
            style={[s.favBtn, isSaved && s.favBtnSaved]}
            onPress={handleSave}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={14}
              color={isSaved ? colors.danger : 'rgba(255,255,255,0.85)'}
            />
          </TouchableOpacity>
          <View style={s.sourcePill}>
            <Text style={s.sourceText}>{listing.source}</Text>
          </View>
        </View>

        {/* Bottom overlay — meta info */}
        <View style={s.imgBottom}>
          {suspicious && (
            <Ionicons name="warning" size={12} color={colors.warning} style={{ marginEnd: 4 }} />
          )}
          <Text style={s.metaLine} numberOfLines={1}>
            {metaParts.join('  ·  ')}
          </Text>
        </View>
      </View>

      {/* ── Info ── */}
      <View style={s.info}>
        {/* Name row */}
        <View style={s.nameRow}>
          <Text style={s.carName} numberOfLines={1}>{listing.make} {listing.model}</Text>
          {/* Deal quality dot */}
          <View style={[s.dealDot, { backgroundColor: dealDot }]} />
        </View>

        {/* Price row — price + label pill */}
        <View style={s.priceRow}>
          <View style={[s.pricePill, { backgroundColor: pill.bg }]}>
            <Text style={[s.pillText, { color: pill.color }]}>{pill.label}</Text>
          </View>
          <Text style={[s.price, suspicious && { color: colors.warning }]}>₪{price}</Text>
        </View>

        {/* Red flag count if any */}
        {listing.redFlags && listing.redFlags.length > 0 && (
          <View style={s.flagsHint}>
            <Ionicons name="alert-circle-outline" size={11} color={colors.warning} />
            <Text style={s.flagsText}>{listing.redFlags.length} אזהרות · לחץ לפרטים</Text>
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
    overflow: 'hidden',
    marginBottom: spacing[3],
    borderWidth: 0.5,
    borderColor: colors.border2,
  },

  imageWrap: { aspectRatio: 16 / 9, backgroundColor: colors.bg2 },
  imgFallback: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },

  imgTop: {
    position: 'absolute', top: 10, left: 10, right: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  favBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)',
  },
  favBtnSaved: {
    backgroundColor: 'rgba(220,38,38,0.25)',
    borderColor: 'rgba(220,38,38,0.45)',
  },
  sourcePill: {
    backgroundColor: 'rgba(0,0,0,0.48)',
    borderRadius: radii.pill,
    paddingHorizontal: 9, paddingVertical: 3,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)',
  },
  sourceText: { fontSize: 10, color: 'rgba(255,255,255,0.80)', fontFamily: fonts.medium },

  imgBottom: {
    position: 'absolute', bottom: 10, left: 12, right: 12,
    flexDirection: 'row-reverse', alignItems: 'center',
  },
  metaLine: {
    color: 'rgba(255,255,255,0.75)', fontSize: 11,
    fontFamily: fonts.medium, letterSpacing: 0.1, textAlign: 'right', flex: 1,
  },

  info: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
  },
  nameRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 5,
  },
  carName: {
    color: colors.fg1, fontSize: fontSize.title, fontFamily: fonts.semibold,
    flex: 1, textAlign: 'right',
  },
  dealDot: { width: 8, height: 8, borderRadius: 4, marginStart: spacing[2] },

  priceRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: colors.fg1, fontSize: 22, fontFamily: fonts.bold,
    letterSpacing: -0.5, textAlign: 'right',
  },
  pricePill: {
    borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4,
  },
  pillText: { fontSize: 11, fontFamily: fonts.semibold },

  flagsHint: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4, marginTop: spacing[2],
  },
  flagsText: { color: colors.warning, fontSize: 10, fontFamily: fonts.medium },
})
