import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { colors, radii, spacing, fontSize, fontWeight } from '../theme/tokens'
import { ConditionBadge } from './ConditionBadge'

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
  market?: { priceRatingLabel: string; priceRating: string }
}

interface Props {
  listing: Listing
  onPress?: () => void
}

const PRICE_PILL = {
  good: { bg: colors.successSoft, color: colors.success, label: 'מחיר טוב' },
  fair: { bg: colors.warningSoft, color: colors.warning, label: 'סביר' },
  expensive: { bg: colors.dangerSoft, color: colors.danger, label: 'יקר' },
}

const DEAL_BORDER: Record<string, string> = {
  great: colors.success,
  good: colors.border2,
  fair: colors.border2,
  suspicious: colors.danger,
}

function DaysOnLotBadge({ days }: { days: number }) {
  const hot = days <= 3
  const stale = days > 60
  const bg = hot ? colors.successSoft : stale ? colors.dangerSoft : 'rgba(0,0,0,0.55)'
  const color = hot ? colors.success : stale ? colors.danger : '#fff'
  const label = hot ? `חדש · ${days} ימים` : stale ? `${days} ימים ⚠` : `${days} ימים`
  return (
    <View style={[s.daysBadge, { backgroundColor: bg }]}>
      <Text style={[s.daysBadgeText, { color }]}>{label}</Text>
    </View>
  )
}

export function ListingCard({ listing, onPress }: Props) {
  const pill = PRICE_PILL[listing.priceLabel ?? 'fair']
  const price = listing.price.toLocaleString('he-IL')
  const km = listing.mileage?.toLocaleString('he-IL')
  const borderColor = DEAL_BORDER[listing.dealScore ?? 'fair'] ?? colors.border2
  const suspicious = listing.odometerSuspicious || listing.dealScore === 'suspicious'

  return (
    <TouchableOpacity style={[s.card, { borderColor }]} onPress={onPress} activeOpacity={0.85}>
      {/* Photo */}
      <View style={s.photo}>
        {listing.imageUrl ? (
          <Image source={{ uri: listing.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : (
          <View style={s.photoPlaceholder} />
        )}
        <View style={s.photoOverlay} />
        <View style={s.srcBadge}>
          <Text style={s.srcText}>{listing.source}</Text>
        </View>
        <TouchableOpacity style={s.heartBtn}>
          <Text style={s.heartIcon}>♡</Text>
        </TouchableOpacity>
        {listing.daysOnLot !== undefined && (
          <View style={s.daysOverlay}>
            <DaysOnLotBadge days={listing.daysOnLot} />
          </View>
        )}
      </View>

      {/* Suspicious banner */}
      {suspicious && (
        <View style={s.suspiciousBanner}>
          <Text style={s.suspiciousText}>⚠ נתונים חשודים — בדוק לפני קנייה</Text>
        </View>
      )}

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
          {km && (
            <Text style={[s.stat, listing.odometerSuspicious && s.statWarn]}>
              {listing.odometerSuspicious ? '⚠ ' : ''}{km} ק״מ
            </Text>
          )}
          {listing.city && <Text style={s.stat}>📍 {listing.city}</Text>}
          {listing.condition && (
            <ConditionBadge
              score={listing.condition.score}
              grade={listing.condition.grade}
              label={listing.condition.label}
              compact
            />
          )}
        </View>

        {listing.redFlags && listing.redFlags.length > 0 && (
          <View style={s.flagsRow}>
            {listing.redFlags.slice(0, 2).map((f, i) => (
              <View key={i} style={s.flagChip}>
                <Text style={s.flagText}>{f}</Text>
              </View>
            ))}
            {listing.redFlags.length > 2 && (
              <View style={s.flagChip}>
                <Text style={s.flagText}>+{listing.redFlags.length - 2} עוד</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bg1, borderRadius: radii.lg,
    borderWidth: 1.5, overflow: 'hidden', marginBottom: spacing[3],
  },
  photo: {
    aspectRatio: 16 / 10, backgroundColor: colors.bg2,
    position: 'relative', overflow: 'hidden',
  },
  photoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg2,
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,15,20,0.25)',
  },
  srcBadge: {
    position: 'absolute', bottom: 12, left: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4,
  },
  srcText: { fontSize: fontSize.micro, fontWeight: fontWeight.bold, color: '#ED2024' },
  heartBtn: {
    position: 'absolute', top: 12, right: 12,
    width: 36, height: 36, borderRadius: radii.pill,
    backgroundColor: 'rgba(11,15,20,0.6)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  heartIcon: { color: colors.fg1, fontSize: 16 },
  daysOverlay: { position: 'absolute', bottom: 12, right: 12 },
  daysBadge: { borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 3 },
  daysBadgeText: { fontSize: 10, fontWeight: fontWeight.semibold },
  suspiciousBanner: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: spacing[4], paddingVertical: 6,
  },
  suspiciousText: {
    color: colors.danger, fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold, textAlign: 'right',
  },
  info: { padding: spacing[4] },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.semibold, color: colors.fg1, textAlign: 'right' },
  submeta: { fontSize: fontSize.caption, color: colors.fg3, marginTop: 2, marginBottom: spacing[3], textAlign: 'right' },
  priceRow: { flexDirection: 'row-reverse', alignItems: 'baseline', justifyContent: 'space-between' },
  price: { fontSize: 22, fontWeight: fontWeight.bold, color: colors.fg1 },
  pill: { borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 3 },
  pillText: { fontSize: fontSize.micro, fontWeight: fontWeight.semibold },
  stats: { flexDirection: 'row-reverse', gap: spacing[3], marginTop: spacing[2] },
  stat: { fontSize: fontSize.caption, color: colors.fg3 },
  statWarn: { color: colors.danger },
  flagsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing[1], marginTop: spacing[2] },
  flagChip: { backgroundColor: colors.dangerSoft, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 3 },
  flagText: { fontSize: 10, color: colors.danger, fontWeight: fontWeight.medium },
})
