import React from 'react'
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, radii, shadows, fontSize } from '../theme/tokens'
import { fonts } from '../theme/typography'

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
  dealScore?: string
  priceDelta?: number
  deltaPct?: number
  trim?: string
  hand?: number
}

interface Props {
  listing: ListingCardData
  onPress: () => void
  onSave?: () => void
  saved?: boolean
  compact?: boolean
}

// Brand colors — used as text color on white pill background
const SOURCE_COLORS: Record<string, string> = {
  yad2:          '#ED2024',
  autoboom:      '#FF7A45',
  colmobil:      '#0057B7',
  autocenter:    '#10B981',
  homeless:      '#8B5CF6',
  focusnet:      '#D97706',
  carwiz:        '#059669',
  hertz:         '#FFD000',
  avis:          '#CC0000',
  eldan:         '#003DA5',
  albar:         '#E63946',
  shlomo:        '#FF6600',
  freesbe:       '#00B4D8',
  winwin:        '#7C3AED',
  trademobile:   '#2563EB',
  icar:          '#0EA5E9',
  toyota_select: '#EB0A1E',
  default:       '#5B88FF',
}

const SOURCE_NAMES: Record<string, string> = {
  yad2:          'יד2',
  autoboom:      'אוטובום',
  colmobil:      'קולמוביל',
  autocenter:    'אוטוסנטר',
  homeless:      'הומלס',
  focusnet:      'פוקוסנט',
  carwiz:        'קארוויז',
  hertz:         'הרץ',
  avis:          'אביס',
  eldan:         'אלדן',
  albar:         'אלבר',
  shlomo:        'שלמה',
  freesbe:       'פריסבי',
  winwin:        'וינוין',
  trademobile:   'טרייד',
  icar:          'iCar',
  toyota_select: 'טויוטה סלקט',
}

const PRICE_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  good:      { label: 'מחיר טוב',  bg: colors.successSoft, fg: colors.success },
  fair:      { label: 'מחיר סביר', bg: colors.warningSoft, fg: colors.warning },
  expensive: { label: 'יקר',       bg: colors.dangerSoft,  fg: colors.danger },
}

// Sparkline color per price label
const SPARKLINE_COLOR: Record<string, string> = {
  good:      colors.success,   // #22C55E
  fair:      colors.warning,   // #F59E0B
  expensive: colors.danger,    // #EF4444
  default:   colors.accent,    // #5B88FF
}

const fmtPrice = (n: number) => `₪${n.toLocaleString('en-US')}`
const fmtKm    = (n: number) => `${n.toLocaleString('en-US')} ק"מ`

// A simple decorative sparkline SVG — path is a fixed gentle wave
// Width is dynamic (passed as prop); height is fixed at 36
function Sparkline({ color, width }: { color: string; width: number }) {
  const w = width
  const h = 36
  // Control points for a smooth wave anchored at baseline (y=28) with a dip/rise
  const d = `M0,${h * 0.78} C${w * 0.15},${h * 0.78} ${w * 0.2},${h * 0.28} ${w * 0.35},${h * 0.32} S${w * 0.55},${h * 0.70} ${w * 0.65},${h * 0.55} S${w * 0.85},${h * 0.18} ${w},${h * 0.22}`
  return (
    <Svg width={w} height={h} style={{ marginTop: 4 }}>
      <Path
        d={d}
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </Svg>
  )
}

export function ListingCard({ listing: v, onPress, onSave, saved = false, compact = false }: Props) {
  const sourceColor = SOURCE_COLORS[v.source] ?? SOURCE_COLORS.default
  const sourceName  = SOURCE_NAMES[v.source] ?? v.source
  const badge       = v.priceLabel ? PRICE_BADGE[v.priceLabel] : null
  const priceDrop   = v.priceDelta != null && v.priceDelta < 0
  const sparkColor  = SPARKLINE_COLOR[v.priceLabel ?? 'default'] ?? SPARKLINE_COLOR.default

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.card}
    >
      {/* ── Image area ── */}
      <View style={[styles.imgWrap, compact && styles.imgWrapCompact]}>
        {v.imageUrl ? (
          <Image source={{ uri: v.imageUrl }} style={styles.img} resizeMode="cover"/>
        ) : (
          <View style={[styles.img, styles.imgPlaceholder]}>
            <Ionicons name="car-sport-outline" size={44} color={colors.fg4}/>
          </View>
        )}

        {/* Source badge — BOTTOM-LEFT, pill, white bg with brand-colored text */}
        <View style={styles.sourceBadge}>
          <View style={[styles.sourceDot, { backgroundColor: sourceColor }]}/>
          <Text style={[styles.sourceBadgeText, { color: sourceColor }]}>
            {sourceName}
          </Text>
        </View>

        {/* Heart button — TOP-RIGHT, dark circle */}
        <TouchableOpacity
          onPress={onSave}
          style={styles.heartBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={16}
            color={saved ? '#EF4444' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {v.make} {v.model}
        </Text>

        {/* Subtitle: year · hand · city */}
        {(v.year || v.hand || v.city) && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {[
              v.year ? String(v.year) : null,
              v.hand != null ? `יד ${v.hand}` : null,
              v.city ?? null,
            ].filter(Boolean).join(' · ')}
          </Text>
        )}

        {/* Price row */}
        <View style={styles.priceRow}>
          <View style={styles.priceLeft}>
            <Text style={styles.price}>{fmtPrice(v.price)}</Text>
            {priceDrop && (
              <Text style={styles.priceDrop}>
                ↓ {fmtPrice(Math.abs(v.priceDelta!))}
              </Text>
            )}
          </View>
          {badge && (
            <View style={[styles.pricePill, { backgroundColor: badge.bg }]}>
              <Text style={[styles.pricePillText, { color: badge.fg }]}>{badge.label}</Text>
            </View>
          )}
        </View>

        {/* Stats row: km + city */}
        {(v.mileage != null || v.city) && (
          <View style={styles.statsRow}>
            {v.mileage != null && (
              <View style={styles.statItem}>
                <Ionicons name="speedometer-outline" size={12} color={colors.fg3} style={styles.statIcon}/>
                <Text style={styles.statText}>{fmtKm(v.mileage)}</Text>
              </View>
            )}
            {v.city && (
              <View style={styles.statItem}>
                <Ionicons name="location-outline" size={12} color={colors.fg3} style={styles.statIcon}/>
                <Text style={styles.statText}>{v.city}</Text>
              </View>
            )}
          </View>
        )}

        {/* Sparkline */}
        <View style={styles.sparklineWrap} onLayout={undefined}>
          <SparklineContainer color={sparkColor}/>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// SparklineContainer uses a fixed width that fills the card content area
function SparklineContainer({ color }: { color: string }) {
  const [width, setWidth] = React.useState(280)
  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ width: '100%' }}
    >
      <Sparkline color={color} width={width}/>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    ...shadows.sm,
  },

  // ── Image ──
  imgWrap: {
    position: 'relative',
    aspectRatio: 16 / 10,
    width: '100%',
    overflow: 'hidden',
  },
  imgWrapCompact: {
    aspectRatio: 16 / 9,
  },
  img: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.bg2,
  },
  imgPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg2,
  },

  // Source badge — bottom-left, white pill with brand-colored text
  sourceBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sourceBadgeText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    fontWeight: '600',
  },

  // Heart button — top-right, dark circle
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(11,15,20,0.60)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Content ──
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.fg1,
    fontFamily: fonts.semibold,
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.fg3,
    fontFamily: fonts.regular,
    fontWeight: '400',
    marginBottom: 0,
  },

  // Price row: price on left, badge on right, space-between
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg1,
    fontFamily: fonts.bold,
    letterSpacing: -0.3,
    writingDirection: 'ltr',
  },
  priceDrop: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
    fontFamily: fonts.medium,
  },
  pricePill: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  pricePillText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: fonts.medium,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statIcon: {
    marginTop: 0,
  },
  statText: {
    fontSize: 11,
    color: colors.fg3,
    fontFamily: fonts.regular,
    fontWeight: '400',
    writingDirection: 'ltr',
  },

  // Sparkline
  sparklineWrap: {
    marginTop: 2,
    marginHorizontal: -14,
    marginBottom: 0,
    height: 40,
    overflow: 'hidden',
  },
})
