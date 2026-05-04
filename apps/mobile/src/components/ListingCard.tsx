import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
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

const PRICE_LABEL: Record<string, { color: string; label: string }> = {
  good:      { color: colors.success, label: 'מחיר טוב' },
  fair:      { color: colors.fg3,     label: 'מחיר שוק' },
  expensive: { color: colors.danger,  label: 'יקר יחסית' },
}

export function ListingCard({ listing, onPress }: Props) {
  const [saved, setSaved] = useState(false)
  const pill = PRICE_LABEL[listing.priceLabel ?? 'fair']
  const price = listing.price.toLocaleString('he-IL')
  const suspicious = listing.odometerSuspicious || listing.dealScore === 'suspicious'

  // Single meta line: 2021  ·  45,000 ק״מ  ·  תל אביב
  const metaParts = [
    listing.year?.toString(),
    listing.mileage ? `${listing.mileage.toLocaleString('he-IL')} ק״מ` : null,
    listing.city,
  ].filter(Boolean)
  const metaLine = metaParts.join('  ·  ')

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.92}>

      {/* ── Image with overlay ── */}
      <View style={s.imageWrap}>
        {listing.imageUrl ? (
          <Image
            source={{ uri: listing.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : (
          <View style={s.imgFallback}>
            <Ionicons name="car-sport-outline" size={48} color={colors.fg4} />
          </View>
        )}

        {/* Real gradient scrim — image text legibility */}
        <LinearGradient
          colors={['transparent', 'rgba(6,8,11,0.88)']}
          style={s.scrim}
        />

        {/* Top: fav (physical left) | source badge (physical right) */}
        <View style={s.imgTop}>
          <TouchableOpacity
            style={[s.favBtn, saved && s.favBtnSaved]}
            onPress={() => setSaved(v => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={14}
              color={saved ? colors.danger : 'rgba(255,255,255,0.80)'}
            />
          </TouchableOpacity>
          <View style={s.sourceBadge}>
            <Text style={s.sourceText}>{listing.source}</Text>
          </View>
        </View>

        {/* Bottom: year · km · city — rendered ON the gradient */}
        <View style={s.imgBottom}>
          {suspicious && (
            <Ionicons name="warning-outline" size={12} color={colors.warning} style={{ marginEnd: 5 }} />
          )}
          <Text style={s.metaLine} numberOfLines={1}>{metaLine}</Text>
        </View>
      </View>

      {/* ── Info — intentionally minimal ── */}
      <View style={s.info}>
        {/* Car name (right, RTL) + price label (left) */}
        <View style={s.titleRow}>
          <Text style={[s.priceTag, { color: pill.color }]}>{pill.label}</Text>
          <Text style={s.carName} numberOfLines={1}>{listing.make} {listing.model}</Text>
        </View>

        {/* Price — the hero number */}
        <Text style={[s.price, suspicious && s.priceWarn]}>₪{price}</Text>
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
  },
  imgFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrim: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '65%',
  },

  imgTop: {
    position: 'absolute',
    top: 10, left: 10, right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.40)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  favBtnSaved: {
    backgroundColor: 'rgba(220,38,38,0.22)',
    borderColor: 'rgba(220,38,38,0.35)',
  },
  sourceBadge: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radii.pill,
    paddingHorizontal: 9, paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sourceText: {
    fontSize: 10, color: 'rgba(255,255,255,0.78)',
    fontWeight: fontWeight.medium, letterSpacing: 0.3,
  },

  imgBottom: {
    position: 'absolute',
    bottom: 10, left: 12, right: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  metaLine: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.1,
    textAlign: 'right',
    flex: 1,
  },

  // Info section
  info: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[4],
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  carName: {
    color: colors.fg1,
    fontSize: fontSize.title,
    fontWeight: fontWeight.semibold,
    flex: 1,
    textAlign: 'right',
  },
  priceTag: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.3,
    marginStart: spacing[3],
  },
  price: {
    color: colors.fg1,
    fontSize: 23,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    letterSpacing: -0.5,
  },
  priceWarn: {
    color: colors.warning,
  },
})
