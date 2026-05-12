import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Dimensions, Animated, Linking, ActivityIndicator,
  StatusBar, Modal, Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg'
import type { StackScreenProps } from '@react-navigation/stack'
import { colors, spacing, fontSize, radii, shadows } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { MarketCompare } from '../components/MarketCompare'
import { PriceHistoryChart } from '../components/PriceHistoryChart'
import { AnomalyBadge } from '../components/AnomalyBadge'
import { ConditionBadge } from '../components/ConditionBadge'
import { api } from '../services/api'
import { toggleSaved, useSaved } from '../store/savedStore'
import type { RootStackParamList } from '../navigation/types'

type Props = StackScreenProps<RootStackParamList, 'Detail'>

const { width: SW } = Dimensions.get('window')
const GALLERY_H = 288

const SOURCE_DOT: Record<string, string> = {
  yad2:     '#FF6B35',
  homeless: '#6B35FF',
  autoboom: '#35B0FF',
  carwiz:   '#35FF8A',
}

interface FullListing {
  id: string; make: string; model: string; year: number
  mileage: number | null; price: number; city: string | null
  region?: string | null; seller?: string | null
  trim?: string | null; hand?: number | null
  engine?: string | null; power?: number | null; zeroToHundred?: number | null
  source: string; url: string; images: string[]; description: string | null
  createdAt: string
  priceHistory?: { date: string; price: number }[]
  priceDelta?: number | null
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

const DEAL_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  great:      { color: colors.success,  bg: colors.successSoft, label: 'עסקה מצוינת' },
  good:       { color: colors.success,  bg: colors.successSoft, label: 'עסקה טובה' },
  fair:       { color: colors.fg3,      bg: colors.tintDetail,  label: 'מחיר שוק' },
  suspicious: { color: colors.warning,  bg: colors.warningSoft, label: 'חשוד' },
}

export function DetailScreen({ route, navigation }: Props) {
  const { listingId } = route.params
  const [listing, setListing] = useState<FullListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [financeOpen, setFinanceOpen] = useState(false)
  const [downPayment, setDownPayment] = useState(20)
  const [months, setMonths] = useState(60)
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
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    )
  }

  if (!listing) {
    return (
      <View style={s.centered}>
        <StatusBar barStyle="dark-content" />
        <Ionicons name="alert-circle-outline" size={52} color={colors.fg4} />
        <Text style={s.errorText}>המודעה לא נמצאה</Text>
        <TouchableOpacity style={s.backLink} onPress={() => navigation.goBack()}>
          <Text style={s.backLinkText}>חזור</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const images = listing.images.length > 0 ? listing.images : ['']
  const deal = DEAL_CONFIG[listing.dealScore ?? 'fair']
  const km = listing.mileage?.toLocaleString('he-IL')
  const price = listing.price.toLocaleString('he-IL')
  const sourceDotColor = SOURCE_DOT[listing.source] ?? colors.fg4
  const priceDeltaAbs = listing.priceDelta ? Math.abs(listing.priceDelta).toLocaleString('he-IL') : null
  const marketPct = listing.market?.priceDiffPct ?? null
  const marketAvg = listing.market?.avgMarketPrice?.toLocaleString('he-IL') ?? null

  const loanPrincipal = listing.price * (1 - downPayment / 100)
  const monthlyRate = 0.06 / 12
  const monthlyPayment = loanPrincipal > 0 && months > 0
    ? Math.round(loanPrincipal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months)))
    : 0
  const totalPayment = monthlyPayment * months

  const gaugeLabel =
    marketPct == null ? '' :
    marketPct < -8 ? 'מחיר מעולה' :
    marketPct < 5  ? 'מחיר סביר'  : 'מעל מחירון'

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* 1 — TINTED HERO */}
        <View style={{ backgroundColor: colors.tintDetail }}>
          <View style={{ height: GALLERY_H }}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              onMomentumScrollEnd={(e: any) =>
                setImgIdx(Math.round(e.nativeEvent.contentOffset.x / SW))
              }
              scrollEventThrottle={16}
            >
              {images.map((uri: string, i: number) => (
                <View key={i} style={{ width: SW, height: GALLERY_H }}>
                  {uri ? (
                    <Image
                      source={{ uri }}
                      style={StyleSheet.absoluteFillObject}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={s.imgFallback}>
                      <Ionicons name="car-sport-outline" size={72} color={colors.fg4} />
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {images.length > 1 && (
              <View style={s.counterPill}>
                <Text style={s.counterText}>{imgIdx + 1}/{images.length}</Text>
              </View>
            )}

            {images.length > 1 && (
              <View style={s.dotsRow}>
                {images.map((_: string, i: number) => (
                  <View
                    key={i}
                    style={[s.dot, i === imgIdx ? s.dotActive : s.dotInactive]}
                  />
                ))}
              </View>
            )}

            <View style={[s.sourceBadge, { top: insets.top + 56 }]}>
              <View style={[s.sourceDot, { backgroundColor: sourceDotColor }]} />
              <Text style={s.sourceBadgeText}>{listing.source}</Text>
            </View>
          </View>
        </View>

        {/* 2 — WHITE SHEET LIFTING */}
        <View style={s.sheet}>

          <View style={s.titleRow}>
            <View style={s.titleLeft}>
              <Text style={s.carName} numberOfLines={1}>
                {listing.make} {listing.model}
              </Text>
              {(listing.trim || listing.hand) && (
                <Text style={s.trimSub}>
                  {[listing.trim, listing.hand ? `יד ${listing.hand}` : null]
                    .filter(Boolean).join(' · ')}
                </Text>
              )}
            </View>
            {listing.dealScore && listing.dealScore !== 'fair' && (
              <View style={[s.dealBadge, { backgroundColor: deal.bg }]}>
                <Text style={[s.dealBadgeText, { color: deal.color }]}>{deal.label}</Text>
              </View>
            )}
          </View>

          {/* PRICE CARD */}
          <View style={[s.card, { borderRadius: radii.xxl }]}>
            <Text style={s.eyebrow}>מחיר</Text>
            <View style={s.priceMainRow}>
              <Text style={s.bigPrice}>₪{price}</Text>
              {listing.priceDelta && listing.priceDelta < 0 && (
                <View style={s.priceDrop}>
                  <Text style={s.priceDropText}>↓ ₪{priceDeltaAbs}</Text>
                </View>
              )}
            </View>
            {listing.priceDelta && listing.priceDelta < 0 && (
              <Text style={s.priceDropSub}>ירדה לפני 2 ימים</Text>
            )}

            <View style={s.divider} />

            {marketPct != null && (
              <View style={s.gaugeWrap}>
                <PriceGauge pct={marketPct} />
                <Text style={s.gaugeLabel}>{gaugeLabel}</Text>
                {marketAvg && (
                  <Text style={s.gaugeDetail}>
                    {marketPct > 0 ? '+' : ''}{Math.round(marketPct)}% · מחירון ₪{marketAvg}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* SPEC GRID */}
          <View style={[s.card, { padding: 10, borderRadius: 24 }]}>
            <View style={s.specGrid}>
              {[
                { label: 'שנה',  value: listing.year.toString() },
                { label: 'ק״מ',  value: km ? `${km}` : '—' },
                { label: 'יד',   value: listing.hand ? listing.hand.toString() : '—' },
                { label: 'מנוע', value: listing.engine ?? '—' },
                { label: 'כ״ס',  value: listing.power ? `${listing.power}` : '—' },
                { label: '0–100', value: listing.zeroToHundred ? `${listing.zeroToHundred}ש` : '—' },
              ].map((item, i) => (
                <View key={i} style={s.specTile}>
                  <Text style={s.specEyebrow}>{item.label}</Text>
                  <Text style={s.specValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* PRICE HISTORY CARD */}
          {listing.priceHistory && listing.priceHistory.length > 0 && (
            <View style={[s.card, { borderRadius: 24 }]}>
              <Text style={s.cardTitle}>היסטוריית מחיר</Text>
              <Text style={s.eyebrow}>30 ימים אחרונים</Text>
              <PriceHistoryChart snapshots={listing.priceHistory} />
            </View>
          )}

          {/* CONDITION + ANOMALY */}
          {(listing.condition || listing.anomaly) && (
            <View style={s.card}>
              <Text style={s.cardTitle}>ניתוח מצב</Text>
              {listing.condition && (
                <ConditionBadge
                  score={listing.condition.score}
                  grade={listing.condition.grade}
                  label={listing.condition.label}
                />
              )}
              {listing.anomaly && <AnomalyBadge anomaly={listing.anomaly} />}
            </View>
          )}

          {/* MARKET COMPARISON */}
          {listing.market && listing.market.priceRating !== 'unknown' && (
            <View style={s.card}>
              <Text style={s.cardTitle}>השוואת שוק</Text>
              <MarketCompare market={listing.market} currentPrice={listing.price} />
            </View>
          )}

          {/* RED FLAGS */}
          {listing.redFlags && listing.redFlags.length > 0 && (
            <View style={[s.card, s.flagsCard]}>
              <Text style={[s.cardTitle, { color: colors.warning }]}>דגלים אדומים</Text>
              {listing.redFlags.map((flag: string, i: number) => (
                <View key={i} style={s.flagRow}>
                  <Ionicons name="alert-circle-outline" size={14} color={colors.warning} />
                  <Text style={s.flagText}>{flag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* SALVAGE */}
          {listing.salvage?.salvageRisk && (
            <View style={[s.card, s.salvageBanner]}>
              <Ionicons name="warning" size={18} color={colors.danger} />
              <Text style={s.salvageText}>סיכון גנוב / ג׳נק — בדוק לפני רכישה</Text>
            </View>
          )}

          {/* DESCRIPTION */}
          {listing.description && listing.description.trim().length > 0 && (
            <View style={s.card}>
              <Text style={s.descText}>{listing.description}</Text>
            </View>
          )}

          {/* LOCATION */}
          {(listing.city || listing.region || listing.seller) && (
            <View style={s.card}>
              <View style={s.locationRow}>
                <View style={s.locationIcon}>
                  <Ionicons name="location" size={16} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  {listing.city && (
                    <Text style={s.locationCity}>
                      {listing.city}{listing.region ? `, ${listing.region}` : ''}
                    </Text>
                  )}
                  {listing.seller && (
                    <Text style={s.locationSeller}>{listing.seller}</Text>
                  )}
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Absolute header overlay */}
      <View style={[s.headerOverlay, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <TouchableOpacity style={s.headerCircle} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-forward" size={22} color={colors.fg1} />
        </TouchableOpacity>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerCircle}>
            <Ionicons name="share-outline" size={20} color={colors.fg1} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.headerCircle, isSavedNow && s.headerCircleSaved]}
            onPress={handleSave}
          >
            <Ionicons
              name={isSavedNow ? 'heart' : 'heart-outline'}
              size={20}
              color={isSavedNow ? colors.danger : colors.fg1}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3 — STICKY BOTTOM */}
      <View style={[s.stickyBottom, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={s.financeBtn}
          onPress={() => setFinanceOpen(true)}
          activeOpacity={0.85}
        >
          <Text style={s.financeBtnEye}>החל מ-</Text>
          <Text style={s.financeBtnPrice}>₪{monthlyPayment.toLocaleString('he-IL')} / חודש</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.ctaBtn} onPress={openListing} activeOpacity={0.88}>
          <Ionicons name="open-outline" size={18} color={colors.onAccent} />
          <Text style={s.ctaText}>פתח מודעה מקורית</Text>
        </TouchableOpacity>
      </View>

      {/* 4 — FINANCE MODAL */}
      <Modal
        visible={financeOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setFinanceOpen(false)}
      >
        <TouchableOpacity
          style={s.modalBackdrop}
          activeOpacity={1}
          onPress={() => setFinanceOpen(false)}
        />
        <View style={[s.financeSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={s.financeHandle} />
          <Text style={s.financeTitle}>מחשבון מימון</Text>

          <View style={s.paymentDisplayCard}>
            <Text style={s.paymentEyebrow}>תשלום חודשי משוער</Text>
            <Text style={s.paymentBig}>₪{monthlyPayment.toLocaleString('he-IL')}</Text>
            <Text style={s.paymentTotal}>
              סה״כ: ₪{totalPayment.toLocaleString('he-IL')} · {months} חודשים
            </Text>
          </View>

          <View style={s.sliderBlock}>
            <View style={s.sliderLabelRow}>
              <Text style={s.sliderLabel}>מקדמה</Text>
              <Text style={s.sliderValue}>{downPayment}%</Text>
            </View>
            <View style={s.sliderTrack}>
              <View style={[s.sliderFill, { width: `${downPayment}%` }]} />
              <TouchableOpacity
                style={[s.sliderThumb, { left: `${downPayment}%` as any }]}
                onPress={() => {}}
              />
            </View>
            <View style={s.sliderRow}>
              {[10, 20, 30, 40, 50].map(v => (
                <TouchableOpacity
                  key={v}
                  style={[s.sliderPip, downPayment === v && s.sliderPipActive]}
                  onPress={() => setDownPayment(v)}
                >
                  <Text style={[s.sliderPipText, downPayment === v && s.sliderPipTextActive]}>
                    {v}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.sliderBlock}>
            <View style={s.sliderLabelRow}>
              <Text style={s.sliderLabel}>תקופה</Text>
              <Text style={s.sliderValue}>{months} חודשים</Text>
            </View>
            <View style={s.sliderRow}>
              {[12, 24, 36, 48, 60, 72, 84].map(v => (
                <TouchableOpacity
                  key={v}
                  style={[s.sliderPip, months === v && s.sliderPipActive]}
                  onPress={() => setMonths(v)}
                >
                  <Text style={[s.sliderPipText, months === v && s.sliderPipTextActive]}>
                    {v}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function PriceGauge({ pct }: { pct: number }) {
  const W = SW - 64
  const H = W * 0.5
  const cx = W / 2
  const cy = H
  const r = H - 12
  const clampedPct = Math.max(-30, Math.min(30, pct))
  const normalised = (clampedPct + 30) / 60
  const angle = Math.PI + normalised * Math.PI
  const nx = cx + r * Math.cos(angle)
  const ny = cy + r * Math.sin(angle)
  const arcGreen  = describeArc(cx, cy, r, 180, 240)
  const arcYellow = describeArc(cx, cy, r, 240, 300)
  const arcRed    = describeArc(cx, cy, r, 300, 360)
  return (
    <Svg width={W} height={H + 12} viewBox={`0 0 ${W} ${H + 12}`}>
      <Path d={arcGreen}  stroke={colors.success} strokeWidth={12} fill="none" strokeLinecap="round" />
      <Path d={arcYellow} stroke={colors.warning} strokeWidth={12} fill="none" strokeLinecap="round" />
      <Path d={arcRed}    stroke={colors.danger}  strokeWidth={12} fill="none" strokeLinecap="round" />
      <Path
        d={`M ${cx} ${cy} L ${nx} ${ny}`}
        stroke={colors.fg1}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  )
}

function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startDeg))
  const y1 = cy + r * Math.sin(toRad(startDeg))
  const x2 = cx + r * Math.cos(toRad(endDeg))
  const y2 = cy + r * Math.sin(toRad(endDeg))
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
}

const s = StyleSheet.create({
  centered: {
    flex: 1, backgroundColor: colors.bg0,
    alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  errorText: { color: colors.fg2, fontSize: fontSize.title, fontFamily: fonts.medium },
  backLink: { marginTop: 8 },
  backLinkText: { color: colors.accent, fontFamily: fonts.medium, fontSize: fontSize.body },

  imgFallback: {
    flex: 1, backgroundColor: colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },

  counterPill: {
    position: 'absolute', bottom: 14, left: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radii.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  counterText: {
    fontSize: fontSize.caption, color: colors.fg1,
    fontFamily: fonts.medium,
  },

  dotsRow: {
    position: 'absolute', bottom: 14,
    left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 5,
  },
  dot: { height: 5, borderRadius: 2.5 },
  dotActive:   { width: 16, backgroundColor: colors.accent },
  dotInactive: { width: 5,  backgroundColor: 'rgba(255,255,255,0.60)' },

  sourceBadge: {
    position: 'absolute', left: 14,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: radii.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  sourceDot: { width: 7, height: 7, borderRadius: 3.5 },
  sourceBadgeText: {
    fontSize: fontSize.caption, color: colors.fg2, fontFamily: fonts.medium,
  },

  headerOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
    ...shadows.sm,
  },
  headerCircleSaved: {
    backgroundColor: colors.dangerSoft,
  },

  sheet: {
    backgroundColor: colors.bg0,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    marginTop: -20,
    paddingTop: 22,
    paddingHorizontal: spacing[4],
  },

  titleRow: {
    flexDirection: 'row-reverse', alignItems: 'flex-start',
    justifyContent: 'space-between', marginBottom: spacing[4],
  },
  titleLeft: { flex: 1, alignItems: 'flex-end' },
  carName: {
    color: colors.fg1, fontSize: fontSize.display2,
    fontFamily: fonts.bold, letterSpacing: -0.5, textAlign: 'right',
  },
  trimSub: {
    color: colors.fg3, fontSize: fontSize.caption,
    fontFamily: fonts.regular, textAlign: 'right', marginTop: 3,
  },
  dealBadge: {
    borderRadius: radii.pill, paddingHorizontal: 12, paddingVertical: 5,
    marginStart: 12, marginTop: 4,
  },
  dealBadgeText: { fontSize: fontSize.caption, fontFamily: fonts.semibold },

  card: {
    backgroundColor: colors.bg1,
    borderRadius: radii.xxl,
    padding: 22,
    marginBottom: spacing[4],
    ...shadows.sm,
  },

  eyebrow: {
    fontSize: fontSize.caption, color: colors.fg3,
    fontFamily: fonts.semibold, textAlign: 'right',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: fontSize.headline, color: colors.fg1,
    fontFamily: fonts.bold, textAlign: 'right', marginBottom: 4,
  },

  priceMainRow: {
    flexDirection: 'row-reverse', alignItems: 'center',
    gap: 10, marginBottom: 4,
  },
  bigPrice: {
    fontSize: 38, color: colors.fg1,
    fontFamily: fonts.bold, letterSpacing: -1,
  },
  priceDrop: {
    backgroundColor: colors.successSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  priceDropText: {
    fontSize: fontSize.caption, color: colors.success,
    fontFamily: fonts.semibold,
  },
  priceDropSub: {
    fontSize: fontSize.caption, color: colors.fg3,
    fontFamily: fonts.regular, textAlign: 'right', marginBottom: 14,
  },

  divider: {
    height: 1, backgroundColor: colors.border1, marginVertical: 16,
  },

  gaugeWrap: { alignItems: 'center', gap: 6 },
  gaugeLabel: {
    fontSize: fontSize.title, color: colors.fg1,
    fontFamily: fonts.semibold,
  },
  gaugeDetail: {
    fontSize: fontSize.caption, color: colors.fg3,
    fontFamily: fonts.regular,
  },

  specGrid: {
    flexDirection: 'row-reverse', flexWrap: 'wrap',
    gap: 8,
  },
  specTile: {
    backgroundColor: colors.bg2,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: (SW - 32 - 20 - 16) / 3,
    flex: 1,
  },
  specEyebrow: {
    fontSize: fontSize.caption - 1, color: colors.fg3,
    fontFamily: fonts.medium, textTransform: 'uppercase',
    letterSpacing: 0.4, marginBottom: 4,
  },
  specValue: {
    fontSize: fontSize.title, color: colors.fg1,
    fontFamily: fonts.bold,
  },

  flagsCard: {
    backgroundColor: colors.warningSoft,
    borderWidth: 1, borderColor: 'rgba(176,122,26,0.25)',
    gap: spacing[3],
  },
  flagRow: {
    flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing[2],
  },
  flagText: {
    flex: 1, color: colors.warning, fontSize: fontSize.caption,
    fontFamily: fonts.regular, textAlign: 'right', lineHeight: 18,
  },

  salvageBanner: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: spacing[3],
    backgroundColor: colors.dangerSoft,
    borderWidth: 1, borderColor: 'rgba(184,58,42,0.25)',
  },
  salvageText: {
    flex: 1, color: colors.danger, fontSize: fontSize.caption,
    fontFamily: fonts.semibold, textAlign: 'right',
  },

  descText: {
    color: colors.fg2, fontSize: fontSize.body,
    fontFamily: fonts.regular, lineHeight: 22, textAlign: 'right',
  },

  locationRow: {
    flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 12,
  },
  locationIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  locationCity: {
    fontSize: fontSize.title, color: colors.fg1,
    fontFamily: fonts.semibold, textAlign: 'right',
  },
  locationSeller: {
    fontSize: fontSize.caption, color: colors.fg3,
    fontFamily: fonts.regular, textAlign: 'right', marginTop: 2,
  },

  stickyBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    backgroundColor: 'rgba(245,242,234,0.92)',
    borderTopWidth: 1, borderTopColor: colors.border1,
    flexDirection: 'row-reverse', gap: 10, alignItems: 'center',
  },
  financeBtn: {
    flex: 1,
    backgroundColor: colors.bg1,
    borderRadius: radii.pill,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border2,
    ...shadows.sm,
  },
  financeBtnEye: {
    fontSize: fontSize.caption - 1, color: colors.fg3,
    fontFamily: fonts.regular,
  },
  financeBtnPrice: {
    fontSize: fontSize.title, color: colors.fg1,
    fontFamily: fonts.bold,
  },
  ctaBtn: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: 14, paddingHorizontal: 22,
    ...shadows.sm,
  },
  ctaText: {
    color: colors.onAccent, fontFamily: fonts.bold, fontSize: fontSize.title,
  },

  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(27,30,27,0.35)',
  },
  financeSheet: {
    backgroundColor: colors.bg1,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing[5],
    paddingTop: 16,
  },
  financeHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.border2,
    alignSelf: 'center', marginBottom: 16,
  },
  financeTitle: {
    fontSize: fontSize.headline, color: colors.fg1,
    fontFamily: fonts.bold, textAlign: 'right', marginBottom: 20,
  },
  paymentDisplayCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.xl,
    padding: 20, alignItems: 'center',
    marginBottom: 24,
  },
  paymentEyebrow: {
    fontSize: fontSize.caption, color: colors.accent,
    fontFamily: fonts.semibold,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  paymentBig: {
    fontSize: 36, color: colors.accent,
    fontFamily: fonts.bold, letterSpacing: -1, marginBottom: 4,
  },
  paymentTotal: {
    fontSize: fontSize.caption, color: colors.fg2,
    fontFamily: fonts.regular,
  },
  sliderBlock: { marginBottom: 20 },
  sliderLabelRow: {
    flexDirection: 'row-reverse', justifyContent: 'space-between',
    marginBottom: 12,
  },
  sliderLabel: {
    fontSize: fontSize.title, color: colors.fg1, fontFamily: fonts.semibold,
  },
  sliderValue: {
    fontSize: fontSize.title, color: colors.accent, fontFamily: fonts.bold,
  },
  sliderTrack: {
    height: 4, backgroundColor: colors.border2, borderRadius: 2,
    marginBottom: 12, position: 'relative',
  },
  sliderFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: colors.accent, borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute', top: -8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.accent,
    marginLeft: -10,
  },
  sliderRow: {
    flexDirection: 'row-reverse', justifyContent: 'space-between',
  },
  sliderPip: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border2,
  },
  sliderPipActive: {
    backgroundColor: colors.accentSoft, borderColor: colors.accent,
  },
  sliderPipText: {
    fontSize: fontSize.caption, color: colors.fg3, fontFamily: fonts.medium,
  },
  sliderPipTextActive: {
    color: colors.accent, fontFamily: fonts.bold,
  },
})
