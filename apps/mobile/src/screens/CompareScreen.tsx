import React, { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, StatusBar, Linking,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { StackScreenProps } from '@react-navigation/stack'
import { colors, spacing, fontSize, radii, shadows } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { api } from '../services/api'
import type { RootStackParamList } from '../navigation/types'

type Props = StackScreenProps<RootStackParamList, 'Compare'>

interface FullListing {
  id: string; make: string; model: string; year: number
  mileage: number | null; price: number; city: string | null
  trim?: string | null; hand?: number | null; engine?: string | null
  source: string; url: string; images: string[]
  dealScore?: 'great' | 'good' | 'fair' | 'suspicious'
  condition?: { score: number; grade: 'A'|'B'|'C'|'D'|'F'; label: string }
  market?: { priceRating: string; priceDiffPct: number | null; avgMarketPrice: number | null }
  anomaly?: { anomalyLevel: 'clean'|'watch'|'suspicious'|'alert' }
  salvage?: { salvageRisk: boolean }
  odometerSuspicious?: boolean
}

const DEAL_LABEL: Record<string, string> = {
  great: 'עסקה מצוינת', good: 'עסקה טובה', fair: 'מחיר שוק', suspicious: 'חשוד',
}
const DEAL_COLOR: Record<string, string> = {
  great: colors.success, good: colors.success, fair: colors.fg3, suspicious: colors.warning,
}
const GRADE_COLOR: Record<string, string> = {
  A: '#1F6E4D', B: '#2A5BB5', C: '#7A4A0D', D: '#B07A1A', F: '#B83A2A',
}
const ANOMALY_LABEL: Record<string, string> = {
  clean: 'תקין', watch: 'לבדיקה', suspicious: 'חשוד', alert: 'מחשיד',
}
const ANOMALY_COLOR: Record<string, string> = {
  clean: colors.success, watch: '#7A4A0D', suspicious: '#B07A1A', alert: '#B83A2A',
}

// Row: label + values for each car. Highlights the "winner" index.
interface RowDef {
  label: string
  get: (l: FullListing) => string
  winnerIdx?: (listings: FullListing[]) => number | null
}

const ROWS: RowDef[] = [
  {
    label: 'מחיר',
    get: l => `₪${l.price.toLocaleString('he-IL')}`,
    winnerIdx: ls => {
      const [a, b] = ls
      if (!a || !b) return null
      return a.price < b.price ? 0 : b.price < a.price ? 1 : null
    },
  },
  {
    label: 'שנה',
    get: l => l.year.toString(),
    winnerIdx: ls => {
      const [a, b] = ls
      if (!a || !b) return null
      return a.year > b.year ? 0 : b.year > a.year ? 1 : null
    },
  },
  {
    label: 'קילומטרים',
    get: l => l.mileage != null ? `${l.mileage.toLocaleString('he-IL')} ק״מ` : '—',
    winnerIdx: ls => {
      const [a, b] = ls
      if (!a || !b || a.mileage == null || b.mileage == null) return null
      return a.mileage < b.mileage ? 0 : b.mileage < a.mileage ? 1 : null
    },
  },
  {
    label: 'יד',
    get: l => l.hand != null ? `יד ${l.hand}` : '—',
    winnerIdx: ls => {
      const [a, b] = ls
      if (!a || !b || a.hand == null || b.hand == null) return null
      return a.hand < b.hand ? 0 : b.hand < a.hand ? 1 : null
    },
  },
  {
    label: 'מנוע',
    get: l => l.engine ?? '—',
    winnerIdx: () => null,
  },
  {
    label: 'ציון מצב',
    get: l => l.condition ? `${l.condition.grade} (${l.condition.score}/100)` : '—',
    winnerIdx: ls => {
      const [a, b] = ls
      if (!a?.condition || !b?.condition) return null
      return a.condition.score > b.condition.score ? 0 : b.condition.score > a.condition.score ? 1 : null
    },
  },
  {
    label: 'מחיר שוק',
    get: l => {
      if (!l.market?.priceDiffPct) return '—'
      const pct = Math.round(l.market.priceDiffPct)
      return pct < 0 ? `${pct}% מתחת לשוק` : pct > 0 ? `+${pct}% מעל שוק` : 'מחיר שוק'
    },
    winnerIdx: ls => {
      const [a, b] = ls
      const pa = a?.market?.priceDiffPct
      const pb = b?.market?.priceDiffPct
      if (pa == null || pb == null) return null
      return pa < pb ? 0 : pb < pa ? 1 : null
    },
  },
  {
    label: 'ניתוח חריגות',
    get: l => l.anomaly ? ANOMALY_LABEL[l.anomaly.anomalyLevel] ?? '—' : '—',
    winnerIdx: ls => {
      const order = ['clean', 'watch', 'suspicious', 'alert']
      const [a, b] = ls
      const ia = a?.anomaly ? order.indexOf(a.anomaly.anomalyLevel) : -1
      const ib = b?.anomaly ? order.indexOf(b.anomaly.anomalyLevel) : -1
      if (ia < 0 || ib < 0) return null
      return ia < ib ? 0 : ib < ia ? 1 : null
    },
  },
  {
    label: 'סיכון ג׳נק',
    get: l => l.salvage?.salvageRisk ? 'יש סיכון' : 'ללא סיכון',
    winnerIdx: ls => {
      const [a, b] = ls
      const ra = a?.salvage?.salvageRisk ? 1 : 0
      const rb = b?.salvage?.salvageRisk ? 1 : 0
      return ra < rb ? 0 : rb < ra ? 1 : null
    },
  },
  {
    label: 'עיר',
    get: l => l.city ?? '—',
    winnerIdx: () => null,
  },
]

export function CompareScreen({ route, navigation }: Props) {
  const { listingIds } = route.params
  const insets = useSafeAreaInsets()
  const [listings, setListings] = useState<(FullListing | null)[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled(listingIds.map(id => api.getListing(id))).then(results => {
      setListings(results.map(r => r.status === 'fulfilled' ? r.value as FullListing : null))
      setLoading(false)
    })
  }, [listingIds])

  const valid = listings.filter(Boolean) as FullListing[]

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="chevron-forward" size={22} color={colors.fg1} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>השוואת רכבים</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={s.loadingText}>טוען נתונים...</Text>
        </View>
      ) : valid.length < 2 ? (
        <View style={s.centered}>
          <Ionicons name="alert-circle-outline" size={52} color={colors.fg4} />
          <Text style={s.errorText}>לא ניתן לטעון את הרכבים להשוואה</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backLink}>
            <Text style={s.backLinkText}>חזור</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* Car headers */}
          <View style={s.carHeadersRow}>
            <View style={s.rowLabel} />
            {valid.map((car, i) => (
              <View key={car.id} style={s.carHeaderCol}>
                <View style={s.carImgWrap}>
                  {car.images[0] ? (
                    <Image source={{ uri: car.images[0] }} style={s.carImg} resizeMode="cover" />
                  ) : (
                    <View style={[s.carImg, s.carImgFallback]}>
                      <Ionicons name="car-outline" size={32} color={colors.fg4} />
                    </View>
                  )}
                  {i === 0 && valid.length >= 2 && (() => {
                    const wins = ROWS.filter(r => r.winnerIdx && r.winnerIdx(valid) === 0).length
                    return wins > 0 ? (
                      <View style={s.winBadge}>
                        <Text style={s.winBadgeText}>{wins} יתרונות</Text>
                      </View>
                    ) : null
                  })()}
                </View>
                <Text style={s.carName} numberOfLines={1}>{car.make} {car.model}</Text>
                <Text style={s.carYear}>{car.year}</Text>
                {car.dealScore && (
                  <Text style={[s.dealLabel, { color: DEAL_COLOR[car.dealScore] ?? colors.fg3 }]}>
                    {DEAL_LABEL[car.dealScore] ?? ''}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <View style={s.divider} />

          {/* Comparison rows */}
          {ROWS.map((row, ri) => {
            const winnerIdx = row.winnerIdx ? row.winnerIdx(valid) : null
            return (
              <View key={ri} style={[s.compRow, ri % 2 === 0 && s.compRowAlt]}>
                <Text style={s.rowLabel}>{row.label}</Text>
                {valid.map((car, ci) => {
                  const isWinner = winnerIdx === ci
                  return (
                    <View key={car.id} style={[s.cellWrap, isWinner && s.cellWinWrap]}>
                      {isWinner && <View style={s.winnerDot} />}
                      <Text style={[s.cellText, isWinner && s.cellWinText]} numberOfLines={2}>
                        {row.get(car)}
                      </Text>
                    </View>
                  )
                })}
              </View>
            )
          })}

          <View style={s.divider} />

          {/* CTA buttons */}
          <View style={s.ctaRow}>
            <View style={s.rowLabel} />
            {valid.map(car => (
              <TouchableOpacity
                key={car.id}
                style={s.ctaBtn}
                activeOpacity={0.85}
                onPress={() => Linking.openURL(car.url)}
              >
                <Ionicons name="open-outline" size={14} color={colors.onAccent} />
                <Text style={s.ctaBtnText}>פתח</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const LABEL_W = 80

const s = StyleSheet.create({
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16,
    paddingHorizontal: spacing[5],
  },
  loadingText: {
    color: colors.fg3, fontSize: fontSize.body, fontFamily: fonts.regular,
  },
  errorText: {
    color: colors.fg2, fontSize: fontSize.title, fontFamily: fonts.medium, textAlign: 'center',
  },
  backLink: { marginTop: 8 },
  backLinkText: {
    color: colors.accent, fontFamily: fonts.medium, fontSize: fontSize.body,
  },

  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border1,
    backgroundColor: colors.bg0,
  },
  headerTitle: {
    fontSize: fontSize.headline,
    color: colors.fg1,
    fontFamily: fonts.bold,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.bg2,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.sm,
  },

  carHeadersRow: {
    flexDirection: 'row-reverse',
    paddingTop: spacing[4],
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
  carHeaderCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  carImgWrap: {
    position: 'relative',
    width: '90%',
    aspectRatio: 4 / 3,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  carImg: {
    width: '100%',
    height: '100%',
  },
  carImgFallback: {
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winBadge: {
    position: 'absolute',
    bottom: 6, left: 6,
    backgroundColor: colors.success,
    borderRadius: radii.pill,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  winBadgeText: {
    color: '#fff', fontSize: 10, fontFamily: fonts.bold,
  },
  carName: {
    fontSize: fontSize.caption,
    color: colors.fg1,
    fontFamily: fonts.semibold,
    textAlign: 'center',
    marginTop: 4,
  },
  carYear: {
    fontSize: 11,
    color: colors.fg3,
    fontFamily: fonts.regular,
  },
  dealLabel: {
    fontSize: 10,
    fontFamily: fonts.semibold,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border1,
    marginVertical: spacing[2],
    marginHorizontal: spacing[4],
  },

  compRow: {
    flexDirection: 'row-reverse',
    paddingHorizontal: spacing[4],
    paddingVertical: 10,
    alignItems: 'center',
  },
  compRowAlt: {
    backgroundColor: colors.bg1,
  },
  rowLabel: {
    width: LABEL_W,
    fontSize: 11,
    color: colors.fg3,
    fontFamily: fonts.medium,
    textAlign: 'right',
  },
  cellWrap: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    borderRadius: radii.sm,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  cellWinWrap: {
    backgroundColor: colors.successSoft,
  },
  winnerDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.success,
  },
  cellText: {
    fontSize: fontSize.caption,
    color: colors.fg2,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  cellWinText: {
    color: '#1F6E4D',
    fontFamily: fonts.bold,
  },

  ctaRow: {
    flexDirection: 'row-reverse',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[2],
    alignItems: 'center',
  },
  ctaBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: 12,
    ...shadows.sm,
  },
  ctaBtnText: {
    color: colors.onAccent,
    fontSize: fontSize.body,
    fontFamily: fonts.semibold,
  },
})
