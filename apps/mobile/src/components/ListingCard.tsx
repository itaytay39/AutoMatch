import React from 'react'
import {
  View, Text, TouchableOpacity, Image, StyleSheet,
} from 'react-native'
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

const SOURCE_COLORS: Record<string, string> = {
  yad2:       '#F5C842',
  autoboom:   '#FF7A45',
  colmobil:   '#5BC0EB',
  autocenter: '#34D399',
  homeless:   '#8E7BB1',
  focusnet:   '#D69538',
  carwiz:     '#3F8C68',
  default:    '#A39A8E',
}

const SOURCE_NAMES: Record<string, string> = {
  yad2:       'יד2',
  autoboom:   'אוטובום',
  colmobil:   'קולמוביל',
  autocenter: 'אוטוסנטר',
  homeless:   'הומלס',
  focusnet:   'פוקוסנט',
  carwiz:     'קארוויז',
  hertz:      'הרץ',
  avis:       'אביס',
  eldan:      'אלדן',
  albar:      'אלבר',
  shlomo:     'שלמה',
  freesbe:    'פריסבי',
  winwin:     'וינוין',
  trademobile:'טרייד',
  icar:       'iCar',
  toyota_select: 'טויוטה סלקט',
}

const PRICE_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  good:      { label: 'מחיר טוב',  bg: colors.successSoft, fg: colors.success },
  fair:      { label: 'מחיר סביר', bg: colors.warningSoft, fg: colors.warning },
  expensive: { label: 'יקר',       bg: colors.dangerSoft,  fg: colors.danger },
}

const fmtPrice = (n: number) => `₪${n.toLocaleString('en-US')}`
const fmtKm    = (n: number) => `${n.toLocaleString('en-US')} ק"מ`

export function ListingCard({ listing: v, onPress, onSave, saved = false, compact = false }: Props) {
  const sourceColor = SOURCE_COLORS[v.source] ?? SOURCE_COLORS.default
  const sourceName  = SOURCE_NAMES[v.source] ?? v.source
  const badge       = v.priceLabel ? PRICE_BADGE[v.priceLabel] : null
  const isNew       = v.daysOnLot !== undefined && v.daysOnLot <= 1
  const priceDrop   = v.priceDelta && v.priceDelta < 0

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={styles.card}
    >
      {/* Image area */}
      <View style={[styles.imgWrap, compact && styles.imgWrapCompact]}>
        {v.imageUrl ? (
          <Image source={{ uri: v.imageUrl }} style={styles.img} resizeMode="cover"/>
        ) : (
          <View style={[styles.img, styles.imgPlaceholder]}>
            <Ionicons name="car-outline" size={40} color={colors.fg4}/>
          </View>
        )}

        {/* Source tag — top start */}
        <View style={styles.sourceTag}>
          <View style={[styles.sourceDot, { backgroundColor: sourceColor }]}/>
          <Text style={styles.sourceText}>{sourceName}</Text>
        </View>

        {/* Heart — top end */}
        <TouchableOpacity
          onPress={onSave}
          style={styles.heartBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={saved ? 'heart' : 'heart-outline'}
            size={17}
            color={saved ? colors.accent : colors.fg2}
          />
        </TouchableOpacity>

        {/* New today chip — bottom start */}
        {isNew && (
          <View style={styles.newChip}>
            <View style={styles.newDot}/>
            <Text style={styles.newChipText}>{v.daysOnLot === 0 ? 'חדש היום' : 'אתמול'}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.title} numberOfLines={1}>
              {v.make} {v.model}
            </Text>
            {(v.trim || v.hand) && (
              <Text style={styles.subtitle}>
                {[v.trim, v.hand != null ? `יד ${v.hand}` : null].filter(Boolean).join(' · ')}
              </Text>
            )}
          </View>
          {badge && (
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.fg }]}>{badge.label}</Text>
            </View>
          )}
        </View>

        {/* Price row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{fmtPrice(v.price)}</Text>
          {priceDrop && (
            <Text style={styles.priceDrop}>
              ↓ {fmtPrice(Math.abs(v.priceDelta!))}
            </Text>
          )}
        </View>

        {/* Spec line */}
        <View style={styles.specRow}>
          <Text style={styles.specText}>{v.year}</Text>
          <View style={styles.dot}/>
          {v.mileage != null && (
            <>
              <Text style={styles.specText}>{fmtKm(v.mileage)}</Text>
              <View style={styles.dot}/>
            </>
          )}
          {v.city && <Text style={styles.specText}>{v.city}</Text>}
        </View>

        {/* Flags */}
        {v.odometerSuspicious && (
          <View style={styles.flagRow}>
            <Ionicons name="warning-outline" size={13} color={colors.warning}/>
            <Text style={styles.flagText}>קילומטראז' חשוד</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg1,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border1,
    overflow: 'hidden',
    ...shadows.sm,
  },
  imgWrap: {
    position: 'relative',
    margin: 6,
    borderRadius: radii.lg,
    overflow: 'hidden',
    height: 172,
  },
  imgWrapCompact: { height: 148 },
  img: {
    width: '100%',
    height: '100%',
    borderRadius: radii.lg,
    backgroundColor: colors.bg2,
  },
  imgPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sourceDot: { width: 6, height: 6, borderRadius: 3 },
  sourceText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.fg2,
    fontWeight: '600',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  newChip: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  newDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff' },
  newChipText: { fontSize: 10.5, fontWeight: '700', color: '#fff', fontFamily: fonts.bold },
  content: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.fg1,
    letterSpacing: -0.2,
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 12,
    color: colors.fg3,
    marginTop: 3,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
  badge: {
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '600', fontFamily: fonts.medium },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.fg1,
    letterSpacing: -0.5,
    fontFamily: fonts.bold,
    writingDirection: 'ltr',
  },
  priceDrop: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
    fontFamily: fonts.medium,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  specText: {
    fontSize: 12,
    color: colors.fg2,
    fontWeight: '500',
    fontFamily: fonts.regular,
    writingDirection: 'ltr',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.fg4,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  flagText: {
    fontSize: 11.5,
    color: colors.warning,
    fontWeight: '500',
    fontFamily: fonts.regular,
  },
})
