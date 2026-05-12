import React, { useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Polyline } from 'react-native-svg'
import { colors, radii, spacing, fontSize, shadows } from '../theme/tokens'
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
  trim?: string
  hand?: number
  priceLabel?: 'good' | 'fair' | 'expensive'
  daysOnLot?: number
  odometerSuspicious?: boolean
  redFlags?: string[]
  dealScore?: 'great' | 'good' | 'fair' | 'suspicious'
  priceDelta?: number
  priceHistory?: number[]
}

interface Props {
  listing: ListingCardData
  onPress?: () => void
}

const SOURCE_DOT: Record<string, string> = {
  yad2:     '#FF6B35',
  homeless: '#6B35FF',
  autoboom: '#35B0FF',
  carwiz:   '#35FF8A',
}

const DEAL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  great:      { color: colors.success,  bg: colors.successSoft, label: 'עסקה מצוינת' },
  good:       { color: colors.success,  bg: colors.successSoft, label: 'עסקה טובה' },
  fair:       { color: colors.warning,  bg: colors.warningSoft, label: 'מחיר שוק' },
  expensive:  { color: colors.danger,   bg: colors.dangerSoft,  label: 'יקר יחסית' },
  suspicious: { color: colors.warning,  bg: colors.warningSoft, label: 'חשוד' },
}

const { width: SW } = Dimensions.get('window')

function Sparkline({ values, width = 64, height = 22 }: { values: number[]; width?: number; height?: number }) {
  if (!values || values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = width / (values.length - 1)
  const pts = values
    .map((v, i) => `${i * stepX},${height - ((v - min) / range) * (height - 2) - 1}`)
    .join(' ')
  const trendDown = values[values.length - 1] <= values[0]
  const lineColor = trendDown ? colors.success : colors.danger
  return (
    <Svg width={width} height={height}>
      <Polyline
        points={pts}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  )
}

export function ListingCard({ listing, onPress }: Props) {
  const saved = useSaved()
  const isSaved = saved.has(listing.id)

  const handleSave = useCallback((e: any) => {
    e?.stopPropagation?.()
    toggleSaved(listing.id)
  }, [listing.id])

  const deal = DEAL_CONFIG[listing.dealScore ?? 'fair']
  const price = listing.price.toLocaleString('he-IL')
  const sourceDotColor = SOURCE_DOT[listing.source] ?? colors.fg4
  const priceDeltaAbs = listing.priceDelta && listing.priceDelta < 0
    ? Math.abs(listing.priceDelta).toLocaleString('he-IL')
    : null
  const metaParts = [
    listing.year?.toString(),
    listing.mileage ? `${listing.mileage.toLocaleString('he-IL')} ק״מ` : null,
    listing.city,
  ].filter(Boolean)

  const hasTrend = listing.priceHistory && listing.priceHistory.length >= 2
  const trendDown = hasTrend
    ? listing.priceHistory![listing.priceHistory!.length - 1] <= listing.priceHistory![0]
    : true
  const trendPct = hasTrend
    ? Math.round(
        ((listing.priceHistory![listing.priceHistory!.length - 1] - listing.priceHistory![0]) /
          listing.priceHistory![0]) * 100
      )
    : null

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.93}>

      <View style={s.imageArea}>
        <View style={s.imageInner}>
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

          <TouchableOpacity
            style={[s.heartBtn, isSaved && s.heartBtnSaved]}
            onPress={handleSave}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSaved ? 'heart' : 'heart-outline'}
              size={15}
              color={isSaved ? colors.danger : colors.fg2}
            />
          </TouchableOpacity>

          <View style={s.sourceBadge}>
            <View style={[s.sourceDot, { backgroundColor: sourceDotColor }]} />
            <Text style={s.sourceBadgeText}>{listing.source}</Text>
          </View>
        </View>
      </View>

      <View style={s.content}>
        <View style={s.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.carName} numberOfLines={1}>
              {listing.make} {listing.model}
            </Text>
            {(listing.trim || listing.hand) && (
              <Text style={s.trimHand}>
                {[listing.trim, listing.hand ? `יד ${listing.hand}` : null]
                  .filter(Boolean).join(' · ')}
              </Text>
            )}
          </View>
          {listing.dealScore && (
            <View style={[s.dealBadge, { backgroundColor: deal.bg }]}>
              <Text style={[s.dealBadgeText, { color: deal.color }]}>{deal.label}</Text>
            </View>
          )}
        </View>

        <View style={s.priceRow}>
          <Text style={s.bigPrice}>₪{price}</Text>
          {priceDeltaAbs && (
            <View style={s.priceDrop}>
              <Text style={s.priceDropText}>↓ ₪{priceDeltaAbs}</Text>
            </View>
          )}
        </View>

        {metaParts.length > 0 && (
          <Text style={s.specLine} numberOfLines={1}>
            {metaParts.join(' · ')}
          </Text>
        )}

        <View style={s.footer}>
          <View style={s.footerLeft}>
            {hasTrend && (
              <>
                <Sparkline values={listing.priceHistory!} width={64} height={22} />
                <Text style={s.trendLabel}>מגמת מחיר · 30 ימים</Text>
              </>
            )}
          </View>
          {trendPct !== null && (
            <Text style={[s.trendPct, { color: trendDown ? colors.success : colors.danger }]}>
              {trendDown ? '' : '+'}{trendPct}%
            </Text>
          )}
        </View>
      </View>

    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bg1,
    borderRadius: radii.xxl,
    overflow: 'hidden',
    marginBottom: spacing[3],
    ...shadows.sm,
  },

  imageArea: {
    padding: 8,
  },
  imageInner: {
    height: 176,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.bg2,
  },
  imgFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg2,
  },

  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  heartBtnSaved: {
    backgroundColor: colors.dangerSoft,
  },

  sourceBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  sourceDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  sourceBadgeText: {
    fontSize: fontSize.caption - 1,
    color: colors.fg2,
    fontFamily: fonts.medium,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
  },

  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  carName: {
    fontSize: 17,
    color: colors.fg1,
    fontFamily: fonts.bold,
    textAlign: 'right',
  },
  trimHand: {
    fontSize: fontSize.caption,
    color: colors.fg3,
    fontFamily: fonts.regular,
    textAlign: 'right',
    marginTop: 2,
  },

  dealBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginStart: 10,
    marginTop: 2,
  },
  dealBadgeText: {
    fontSize: fontSize.caption,
    fontFamily: fonts.semibold,
  },

  priceRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bigPrice: {
    fontSize: 22,
    color: colors.fg1,
    fontFamily: fonts.bold,
    letterSpacing: -0.5,
  },
  priceDrop: {
    backgroundColor: colors.successSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  priceDropText: {
    fontSize: fontSize.caption,
    color: colors.success,
    fontFamily: fonts.semibold,
  },

  specLine: {
    fontSize: fontSize.caption,
    color: colors.fg2,
    fontFamily: fonts.regular,
    textAlign: 'right',
    marginBottom: 10,
  },

  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border1,
  },
  footerLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  trendLabel: {
    fontSize: 11,
    color: colors.fg3,
    fontFamily: fonts.regular,
  },
  trendPct: {
    fontSize: fontSize.caption,
    fontFamily: fonts.bold,
  },
})
