import React from 'react'
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native'
import Svg, { Polyline } from 'react-native-svg'
import { Ionicons } from '@expo/vector-icons'
import { colors, radii, shadows } from '../theme/tokens'
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
  anomalyLevel?: 'clean' | 'watch' | 'suspicious' | 'alert'
  salvageRisk?: boolean
}

interface Props {
  listing: ListingCardData
  onPress: () => void
  onSave?: () => void
  saved?: boolean
  compact?: boolean
}

// Source dot colors
const SOURCE_COLORS: Record<string, string> = {
  yad2:          '#F5A623',
  autoboom:      '#FF7A45',
  colmobil:      '#3450E8',
  autocenter:    '#34D399',
  homeless:      '#8E7BB1',
  focusnet:      '#D69538',
  carwiz:        '#3F8C68',
  hertz:         '#D4A800',
  avis:          '#CC0000',
  eldan:         '#003DA5',
  albar:         '#E63946',
  shlomo:        '#FF6600',
  freesbe:       '#00B4D8',
  winwin:        '#7C3AED',
  trademobile:   '#2563EB',
  icar:          '#0EA5E9',
  toyota_select: '#EB0A1E',
  default:       '#A39A8E',
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
  good:      { label: 'מחיר טוב',  bg: '#DCEBE0', fg: '#1F5A3D' },
  fair:      { label: 'מחיר סביר', bg: '#F6E2C4', fg: '#7A4A0D' },
  expensive: { label: 'יקר',       bg: '#FFE2D6', fg: '#9A2A14' },
}

const ANOMALY_CFG: Record<string, { label: string; color: string; bg: string }> = {
  watch:      { label: 'מצריך בדיקה', color: '#7A4A0D', bg: '#F6E2C4' },
  suspicious: { label: 'חשוד',        color: '#B07A1A', bg: '#FFF3D0' },
  alert:      { label: 'מחשיד מאוד',  color: '#9A2A14', bg: '#FFE2D6' },
}

const fmtPrice = (n: number) => `₪${n.toLocaleString('en-US')}`
const fmtKm    = (n: number) => `${n.toLocaleString('en-US')} ק״מ`

// Simple sparkline using Polyline — 3-segment path representing a trend
// Points layout: flat → dip/rise based on priceLabel
function Sparkline({ priceLabel }: { priceLabel?: string }) {
  const isGood = priceLabel === 'good'
  const isBad  = priceLabel === 'expensive'

  const lineColor = isGood ? '#1F5A3D' : isBad ? '#9A2A14' : '#A39A8E'

  // Points: x goes 0→50, y goes 18→top/bottom depending on trend
  // good: trending down (price dropped → good deal)
  // expensive: trending up
  // fair/default: flat with slight wave
  let points: string
  if (isGood) {
    points = '0,14 12,12 25,9 38,6 50,4'
  } else if (isBad) {
    points = '0,4 12,6 25,9 38,12 50,14'
  } else {
    points = '0,9 10,7 22,10 34,8 50,9'
  }

  return (
    <Svg width={50} height={18}>
      <Polyline
        points={points}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
    </Svg>
  )
}

export function ListingCard({ listing: v, onPress, onSave, saved = false, compact = false }: Props) {
  const sourceColor = SOURCE_COLORS[v.source] ?? SOURCE_COLORS.default
  const sourceName  = SOURCE_NAMES[v.source] ?? v.source
  const badge       = v.priceLabel ? PRICE_BADGE[v.priceLabel] : null
  const priceDrop   = v.priceDelta != null && v.priceDelta < 0
  const isNew       = v.daysOnLot != null && v.daysOnLot <= 1
  const imgHeight   = compact ? 168 : 192

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.card}
    >
      {/* ── Image section ── */}
      <View style={[styles.imgWrap, { height: imgHeight }]}>
        {v.imageUrl ? (
          <Image source={{ uri: v.imageUrl }} style={styles.img} resizeMode="cover" />
        ) : (
          <View style={[styles.img, styles.imgPlaceholder]}>
            <Ionicons name="car-sport-outline" size={44} color={colors.fg4} />
          </View>
        )}

        {/* "חדש היום" chip — top-left */}
        {isNew && (
          <View style={styles.newChip}>
            <View style={styles.newChipDot} />
            <Text style={styles.newChipText}>חדש היום</Text>
          </View>
        )}

        {/* Heart button — top-right */}
        <TouchableOpacity
          onPress={onSave}
          style={styles.heartBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={16}
            color={saved ? '#3450E8' : '#6D665C'}
          />
        </TouchableOpacity>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>

        {/* Meta line: source dot + source name + separator + city + badge */}
        <View style={styles.metaRow}>
          <View style={[styles.sourceDot, { backgroundColor: sourceColor }]} />
          <Text style={styles.sourceName}>{sourceName}</Text>
          <View style={styles.metaSep} />
          {v.city ? <Text style={styles.cityText}>{v.city}</Text> : null}
          <View style={styles.metaSpacer} />
          {badge && (
            <View style={[styles.badgeTag, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeTagText, { color: badge.fg }]}>{badge.label}</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {v.make} {v.model}{v.trim ? ` ${v.trim}` : ''}
        </Text>

        {/* Spec strip: year · km · hand */}
        <View style={styles.specStrip}>
          <Ionicons name="calendar-outline" size={11} color={colors.fg3} />
          <Text style={styles.specText} suppressHighlighting>{v.year}</Text>

          <View style={styles.specSep} />

          {v.mileage != null && (
            <>
              <Ionicons name="speedometer-outline" size={11} color={colors.fg3} />
              <Text style={styles.specText} suppressHighlighting>{fmtKm(v.mileage)}</Text>
              <View style={styles.specSep} />
            </>
          )}

          {v.hand != null && (
            <>
              <Ionicons name="person-outline" size={11} color={colors.fg3} />
              <Text style={styles.specText} suppressHighlighting>יד {v.hand}</Text>
            </>
          )}
        </View>

        {/* Odometer warning */}
        {v.odometerSuspicious && (
          <View style={styles.warningRow}>
            <Ionicons name="warning-outline" size={12} color="#7A4A0D" />
            <Text style={styles.warningText}>קילומטראז' חשוד</Text>
          </View>
        )}

        {/* Salvage risk */}
        {v.salvageRisk && (
          <View style={styles.salvageRow}>
            <Ionicons name="warning" size={12} color="#B83A2A" />
            <Text style={styles.salvageText}>בדוק ג׳נק / גנוב</Text>
          </View>
        )}

        {/* Anomaly level */}
        {v.anomalyLevel && v.anomalyLevel !== 'clean' && ANOMALY_CFG[v.anomalyLevel] && (
          <View style={[styles.anomalyRow, { backgroundColor: ANOMALY_CFG[v.anomalyLevel].bg }]}>
            <Ionicons name="alert-circle-outline" size={12} color={ANOMALY_CFG[v.anomalyLevel].color} />
            <Text style={[styles.anomalyText, { color: ANOMALY_CFG[v.anomalyLevel].color }]}>
              {ANOMALY_CFG[v.anomalyLevel].label}
            </Text>
          </View>
        )}

        {/* Price row */}
        <View style={styles.priceRow}>
          {/* Left: sparkline + delta% */}
          <View style={styles.priceLeft}>
            <Sparkline priceLabel={v.priceLabel} />
            {v.deltaPct != null && (
              <Text style={[
                styles.deltaPct,
                { color: v.deltaPct < 0 ? '#1F5A3D' : v.deltaPct > 0 ? '#9A2A14' : '#A39A8E' },
              ]}>
                {v.deltaPct > 0 ? '+' : ''}{v.deltaPct}%
              </Text>
            )}
          </View>

          {/* Right: price drop chip + price */}
          <View style={styles.priceRight}>
            {priceDrop && (
              <View style={styles.priceDropChip}>
                <Text style={styles.priceDropText}>↓ {fmtPrice(Math.abs(v.priceDelta!))}</Text>
              </View>
            )}
            <Text style={styles.price}>{fmtPrice(v.price)}</Text>
          </View>
        </View>

      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ECE4D8',
    overflow: 'hidden',
    ...shadows.sm,
  },

  // ── Image ──
  imgWrap: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  imgPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1ECE4',
  },

  // "חדש היום" chip — top-left
  newChip: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#3450E8',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newChipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FFFFFF',
  },
  newChipText: {
    fontSize: 10.5,
    color: '#FFFFFF',
    fontFamily: fonts.semibold,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // Heart button — top-right
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Body ──
  body: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
  },

  // Meta line
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sourceName: {
    fontSize: 11,
    color: colors.fg3,
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },
  metaSep: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.fg4,
  },
  cityText: {
    fontSize: 11,
    color: colors.fg3,
    fontFamily: fonts.regular,
    fontWeight: '400',
  },
  metaSpacer: {
    flex: 1,
  },
  badgeTag: {
    borderRadius: radii.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeTagText: {
    fontSize: 10.5,
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },

  // Title
  title: {
    fontSize: 16.5,
    fontWeight: '700',
    color: colors.fg1,
    fontFamily: fonts.bold,
    letterSpacing: -0.25,
    marginBottom: 0,
  },

  // Spec strip
  specStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  specText: {
    fontSize: 12,
    color: colors.fg2,
    fontFamily: fonts.medium,
    fontWeight: '500',
    writingDirection: 'ltr',
  },
  specSep: {
    width: 1,
    height: 10,
    backgroundColor: '#DDD3C3',
    marginHorizontal: 2,
  },

  // Odometer warning
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  warningText: {
    fontSize: 11,
    color: '#7A4A0D',
    fontFamily: fonts.medium,
    fontWeight: '500',
  },

  salvageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  salvageText: {
    fontSize: 11,
    color: '#B83A2A',
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },

  anomalyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  anomalyText: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },

  // Price row
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECE4D8',
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deltaPct: {
    fontSize: 11.5,
    fontFamily: fonts.semibold,
    fontWeight: '600',
    writingDirection: 'ltr',
  },
  priceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceDropChip: {
    backgroundColor: '#DCEBE0',
    borderRadius: radii.xs,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  priceDropText: {
    fontSize: 11,
    color: '#1F5A3D',
    fontFamily: fonts.semibold,
    fontWeight: '600',
    writingDirection: 'ltr',
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.fg1,
    fontFamily: fonts.bold,
    letterSpacing: -0.4,
    writingDirection: 'ltr',
  },
})
