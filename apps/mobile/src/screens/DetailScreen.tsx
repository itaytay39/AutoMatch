import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Dimensions, Animated, Linking, ActivityIndicator,
  StatusBar, Platform,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import type { StackScreenProps } from '@react-navigation/stack'
import { colors, spacing, fontSize, radii } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { MarketCompare } from '../components/MarketCompare'
import { PriceHistoryChart } from '../components/PriceHistoryChart'
import { AnomalyBadge } from '../components/AnomalyBadge'
import { ConditionBadge } from '../components/ConditionBadge'
import { api } from '../services/api'
import { toggleSaved, useSaved } from '../store/savedStore'
import type { RootStackParamList } from '../navigation/types'

type Props = StackScreenProps<RootStackParamList, 'Detail'>

const { width: SW, height: SH } = Dimensions.get('window')
const HERO_H = SH * 0.46

interface FullListing {
  id: string; make: string; model: string; year: number
  mileage: number | null; price: number; city: string | null
  source: string; url: string; images: string[]; description: string | null
  createdAt: string
  priceHistory?: { date: string; price: number }[]
  // enriched fields
  daysOnLot?: number; odometerSuspicious?: boolean; odometerReason?: string | null
  redFlags?: string[]; dealScore?: 'great' | 'good' | 'fair' | 'suspicious'
  condition?: { score: number; grade: 'A'|'B'|'C'|'D'|'F'; label: string }
  market?: {
    avgMarketPrice: number | null; priceDiff: number | null; priceDiffPct: number | null
    priceRating: 'great_deal'|'good_deal'|'fair'|'overpriced'|'unknown'
    priceRatingLabel: string; similarCount: number
  }
  anomaly?: {
    anomalyScore: number
    anomalyLevel: 'clean'|'watch'|'suspicious'|'alert'
    signals: { name: string; weight: number; triggered: boolean; detail: string }[]
  }
  salvage?: { salvageRisk: boolean; signals: string[] }
}

const DEAL_LABEL: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  great:      { color: '#34D399', bg: '#0D2E1A', label: 'עסקה מצוינת', icon: 'checkmark-circle' },
  good:       { color: '#6EE7B7', bg: '#0D2A1A', label: 'עסקה טובה',   icon: 'thumbs-up' },
  fair:       { color: colors.fg2, bg: colors.bg2, label: 'מחיר שוק',   icon: 'remove-circle-outline' },
  suspicious: { color: colors.warning, bg: '#2A1A08', label: 'חשוד',    icon: 'warning' },
}

export function DetailScreen({ route, navigation }: Props) {
  const { listingId } = route.params
  const [listing, setListing] = useState<FullListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const scrollX = useRef(new Animated.Value(0)).current
  const insets = useSafeAreaInsets()
  const saved = useSaved()
  const isSavedNow = saved.has(listingId)

  useEffect(() => {
    api.getListing(listingId).then(data => {
      setListing(data as FullListing)
    }).catch(console.warn).finally(() => setLoading(false))
  }, [listingId])

  const handleSave = useCallback(() => { toggleSaved(listingId) }, [listingId])
  const openListing = useCallback(() => {
    if (listing?.url) Linking.openURL(listing.url)
  }, [listing])

  if (loading) {
    return (
      <View style={s.centered}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    )
  }

  if (!listing) {
    return (
      <View style={s.centered}>
        <Ionicons name="alert-circle-outline" size={52} color={colors.fg4} />
        <Text style={s.errorText}>המודעה לא נמצאה</Text>
        <TouchableOpacity style={s.backLink} onPress={() => navigation.goBack()}>
          <Text style={s.backLinkText}>חזור</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const images = listing.images.length > 0 ? listing.images : ['']
  const deal = DEAL_LABEL[listing.dealScore ?? 'fair']
  const km = listing.mileage?.toLocaleString('he-IL')
  const price = listing.price.toLocaleString('he-IL')

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}
        bounces={false}
      >
        {/* ── Hero Gallery ── */}
        <View style={{ height: HERO_H }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
            onMomentumScrollEnd={(e: any) => setImgIdx(Math.round(e.nativeEvent.contentOffset.x / SW))}
            scrollEventThrottle={16}
          >
            {images.map((uri: string, i: number) => (
              <View key={i} style={{ width: SW, height: HERO_H }}>
                {uri ? (
                  <Image source={{ uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                ) : (
                  <View style={s.imgFallback}>
                    <Ionicons name="car-sport-outline" size={72} color={colors.fg4} />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Deep gradient scrim at bottom of hero */}
          <LinearGradient
            colors={['transparent', 'rgba(6,8,11,0.6)', colors.bg0]}
            style={s.heroScrim}
          />

          {/* Top controls — back + save */}
          <View style={[s.heroControls, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={s.heroBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[s.heroBtn, isSavedNow && s.heroBtnSaved]} onPress={handleSave}>
              <Ionicons
                name={isSavedNow ? 'heart' : 'heart-outline'}
                size={20}
                color={isSavedNow ? colors.danger : '#fff'}
              />
            </TouchableOpacity>
          </View>

          {/* Image count / dots */}
          {images.length > 1 && (
            <View style={s.dotsRow}>
              {images.map((_: string, i: number) => (
                <View key={i} style={[s.dot, i === imgIdx && s.dotActive]} />
              ))}
            </View>
          )}

          {/* Source badge */}
          <View style={s.sourceBadge}>
            <Ionicons name="globe-outline" size={10} color="rgba(255,255,255,0.7)" />
            <Text style={s.sourceText}>{listing.source}</Text>
          </View>
        </View>

        {/* ── Content ── */}
        <View style={s.content}>

          {/* Car name + deal badge */}
          <View style={s.nameRow}>
            <View style={[s.dealBadge, { backgroundColor: deal.bg }]}>
              <Ionicons name={deal.icon as any} size={11} color={deal.color} />
              <Text style={[s.dealText, { color: deal.color }]}>{deal.label}</Text>
            </View>
            <Text style={s.carName}>{listing.make} {listing.model}</Text>
          </View>

          {/* Price — hero number */}
          <Text style={s.price}>₪{price}</Text>

          {/* Stat chips row */}
          <View style={s.chipsRow}>
            <StatChip icon="calendar-outline" value={listing.year.toString()} />
            {km && <StatChip icon="speedometer-outline" value={`${km} ק״מ`} alert={listing.odometerSuspicious} />}
            {listing.city && <StatChip icon="location-outline" value={listing.city} />}
            {listing.daysOnLot !== undefined && listing.daysOnLot > 0 && (
              <StatChip icon="time-outline" value={`${listing.daysOnLot} ימים`} />
            )}
          </View>

          {/* ── Condition + Anomaly row ── */}
          {(listing.condition || listing.anomaly) && (
            <View style={s.section}>
              <SectionTitle>ניתוח מצב</SectionTitle>
              {listing.condition && (
                <ConditionBadge
                  score={listing.condition.score}
                  grade={listing.condition.grade}
                  label={listing.condition.label}
                />
              )}
              {listing.anomaly && (
                <AnomalyBadge anomaly={listing.anomaly} />
              )}
            </View>
          )}

          {/* ── Market comparison ── */}
          {listing.market && listing.market.priceRating !== 'unknown' && (
            <View style={s.section}>
              <SectionTitle>השוואת שוק</SectionTitle>
              <MarketCompare market={listing.market} currentPrice={listing.price} />
            </View>
          )}

          {/* ── Price history ── */}
          {listing.priceHistory && listing.priceHistory.length > 0 && (
            <View style={s.section}>
              <SectionTitle>היסטוריית מחיר</SectionTitle>
              <PriceHistoryChart snapshots={listing.priceHistory} />
            </View>
          )}

          {/* ── Red flags ── */}
          {listing.redFlags && listing.redFlags.length > 0 && (
            <View style={s.section}>
              <SectionTitle>דגלים אדומים</SectionTitle>
              <View style={s.flagsCard}>
                {listing.redFlags.map((flag: string, i: number) => (
                  <View key={i} style={s.flagRow}>
                    <Ionicons name="alert-circle-outline" size={14} color={colors.warning} />
                    <Text style={s.flagText}>{flag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── Salvage ── */}
          {listing.salvage?.salvageRisk && (
            <View style={s.section}>
              <View style={s.salvageBanner}>
                <Ionicons name="warning" size={18} color={colors.danger} />
                <Text style={s.salvageText}>סיכון גנוב / ג׳נק — בדוק לפני רכישה</Text>
              </View>
            </View>
          )}

          {/* ── Description ── */}
          {listing.description && listing.description.trim().length > 0 && (
            <View style={s.section}>
              <SectionTitle>תיאור</SectionTitle>
              <View style={s.descCard}>
                <Text style={s.descText}>{listing.description}</Text>
              </View>
            </View>
          )}

          {/* Bottom spacer for sticky CTA */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View style={[s.ctaBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={s.ctaBtn} onPress={openListing} activeOpacity={0.88}>
          <LinearGradient
            colors={['#E8943A', '#C47B2E']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.ctaGradient}
          >
            <Ionicons name="open-outline" size={18} color="#fff" />
            <Text style={s.ctaText}>פתח מודעה מקורית</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function StatChip({ icon, value, alert }: { icon: any; value: string; alert?: boolean }) {
  return (
    <View style={[sc.chip, alert && sc.chipAlert]}>
      <Ionicons name={icon} size={12} color={alert ? colors.warning : colors.fg3} />
      <Text style={[sc.chipText, alert && sc.chipTextAlert]}>{value}</Text>
    </View>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <View style={st.row}>
      <Text style={st.text}>{children}</Text>
      <View style={st.line} />
    </View>
  )
}

const sc = StyleSheet.create({
  chip: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bg2,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 0.5,
    borderColor: colors.border2,
  },
  chipAlert: {
    backgroundColor: '#2A1A08',
    borderColor: colors.warning,
  },
  chipText: { color: colors.fg2, fontSize: 12, fontFamily: fonts.medium },
  chipTextAlert: { color: colors.warning },
})

const st = StyleSheet.create({
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginBottom: spacing[3] },
  text: { color: colors.fg3, fontSize: fontSize.caption, fontFamily: fonts.semibold, letterSpacing: 0.5 },
  line: { flex: 1, height: 0.5, backgroundColor: colors.border2 },
})

const s = StyleSheet.create({
  centered: { flex: 1, backgroundColor: colors.bg0, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { color: colors.fg2, fontSize: fontSize.title, fontFamily: fonts.medium },
  backLink: { marginTop: 8 },
  backLinkText: { color: colors.accent, fontFamily: fonts.medium, fontSize: fontSize.body },

  imgFallback: {
    flex: 1, backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center',
  },
  heroScrim: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
  },
  heroControls: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  heroBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(12px)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
  },
  heroBtnSaved: {
    backgroundColor: 'rgba(220,38,38,0.3)',
    borderColor: 'rgba(220,38,38,0.5)',
  },
  dotsRow: {
    position: 'absolute', bottom: 14,
    left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  dot: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: { width: 16, backgroundColor: '#fff' },
  sourceBadge: {
    position: 'absolute', top: 14, right: 14,
    // pushes down by insets handled by parent
    flexDirection: 'row-reverse', gap: 4, alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: radii.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)',
    marginTop: 40,
  },
  sourceText: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontFamily: fonts.medium },

  content: { paddingHorizontal: spacing[4], paddingTop: spacing[4] },

  nameRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: spacing[1],
  },
  carName: {
    color: colors.fg1, fontSize: 22, fontFamily: fonts.bold,
    letterSpacing: -0.4, textAlign: 'right', flex: 1,
  },
  dealBadge: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    borderRadius: radii.pill,
    paddingHorizontal: 10, paddingVertical: 5,
    marginStart: 12,
  },
  dealText: { fontSize: 11, fontFamily: fonts.semibold },

  price: {
    color: colors.fg1, fontSize: 36, fontFamily: fonts.bold,
    letterSpacing: -1, textAlign: 'right', marginBottom: spacing[4],
  },

  chipsRow: {
    flexDirection: 'row-reverse', flexWrap: 'wrap',
    gap: spacing[2], marginBottom: spacing[5],
  },

  section: { marginBottom: spacing[5] },

  flagsCard: {
    backgroundColor: '#1A1206',
    borderRadius: radii.lg,
    borderWidth: 0.5, borderColor: 'rgba(217,119,6,0.3)',
    padding: spacing[4], gap: spacing[3],
  },
  flagRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing[2] },
  flagText: {
    flex: 1, color: colors.warning, fontSize: fontSize.caption,
    fontFamily: fonts.regular, textAlign: 'right', lineHeight: 18,
  },

  salvageBanner: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: spacing[3],
    backgroundColor: '#1A0A0A',
    borderRadius: radii.lg, borderWidth: 0.5, borderColor: 'rgba(220,38,38,0.4)',
    padding: spacing[4],
  },
  salvageText: {
    flex: 1, color: colors.danger, fontSize: fontSize.caption,
    fontFamily: fonts.semibold, textAlign: 'right',
  },

  descCard: {
    backgroundColor: colors.bg1, borderRadius: radii.lg,
    borderWidth: 0.5, borderColor: colors.border2, padding: spacing[4],
  },
  descText: {
    color: colors.fg2, fontSize: fontSize.body,
    fontFamily: fonts.regular, lineHeight: 22, textAlign: 'right',
  },

  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    backgroundColor: colors.bg0,
    borderTopWidth: 0.5, borderTopColor: colors.border1,
  },
  ctaBtn: { borderRadius: radii.md, overflow: 'hidden' },
  ctaGradient: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center',
    gap: 10, height: 52,
  },
  ctaText: { color: '#fff', fontFamily: fonts.bold, fontSize: fontSize.title },
})
