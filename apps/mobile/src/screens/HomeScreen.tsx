import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  ActivityIndicator, ScrollView, ListRenderItem, FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Path, Circle } from 'react-native-svg'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { ListingCard, type ListingCardData } from '../components/ListingCard'
import { SkeletonCard } from '../components/SkeletonCard'
import { colors, spacing, radii, shadows, gradients } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { api } from '../services/api'
import type { RootStackParamList } from '../navigation/types'

type Nav = StackNavigationProp<RootStackParamList>

const PAGE_SIZE = 20

function toCard(l: any): ListingCardData {
  const rating = l.market?.priceRating ?? 'unknown'
  const priceLabel: 'good' | 'fair' | 'expensive' =
    rating === 'great_deal' || rating === 'good_deal' ? 'good'
    : rating === 'overpriced' ? 'expensive' : 'fair'
  return {
    id: l.id, make: l.make, model: l.model, year: l.year,
    mileage: l.mileage ?? undefined, price: l.price,
    city: l.city ?? undefined, source: l.source,
    imageUrl: l.images?.[0],
    priceLabel, daysOnLot: l.daysOnLot,
    odometerSuspicious: l.odometerSuspicious,
    redFlags: l.redFlags, dealScore: l.dealScore,
    priceDelta: l.priceDelta,
    anomalyLevel: l.anomaly?.anomalyLevel,
    salvageRisk: l.salvage?.salvageRisk,
  }
}

// ── Stat tile ─────────────────────────────────────────────────
function StatTile({ label, value, sub, subGood }: {
  label: string; value: string; sub?: string; subGood?: boolean
}) {
  return (
    <View style={st.card}>
      <Text style={st.eyebrow}>{label}</Text>
      <Text style={st.value}>{value}</Text>
      {sub ? (
        <Text style={[st.sub, subGood && { color: colors.success }]}>{sub}</Text>
      ) : null}
    </View>
  )
}

const st = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bg1,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border1,
    padding: 14,
    ...shadows.sm,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: colors.fg3,
    fontFamily: fonts.semibold,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.fg1,
    fontFamily: fonts.bold,
    marginTop: 4,
    lineHeight: 28,
  },
  sub: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.fg3,
    fontFamily: fonts.semibold,
    marginTop: 4,
  },
})

// ── Recent thumb ──────────────────────────────────────────────
function RecentThumb({ item, onPress }: { item: ListingCardData; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={rt.card}>
      <View style={rt.imgPlaceholder}>
        <Ionicons name="car-outline" size={28} color={colors.fg4} />
      </View>
      <View style={rt.info}>
        <Text style={rt.name} numberOfLines={1}>{item.make} {item.model}</Text>
        <Text style={rt.price}>{item.price ? `₪${item.price.toLocaleString('he-IL')}` : '—'}</Text>
      </View>
    </TouchableOpacity>
  )
}

const rt = StyleSheet.create({
  card: {
    width: 156,
    backgroundColor: colors.bg1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border1,
    overflow: 'hidden',
    flexShrink: 0,
    ...shadows.sm,
  },
  imgPlaceholder: {
    height: 84,
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10 },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.fg1,
    fontFamily: fonts.bold,
    letterSpacing: -0.1,
  },
  price: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.fg1,
    fontFamily: fonts.bold,
    marginTop: 4,
  },
})

// ── SectionHeader ─────────────────────────────────────────────
function SectionHeader({ title, action, onAction }: {
  title: string; action?: string; onAction?: () => void
}) {
  return (
    <View style={sh.row}>
      {action ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={sh.action}>{action}</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={sh.title}>{title}</Text>
    </View>
  )
}

const sh = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.fg1,
    fontFamily: fonts.bold,
    letterSpacing: -0.2,
  },
  action: {
    fontSize: 13,
    color: colors.accent,
    fontFamily: fonts.medium,
  },
})

// ═══════════════════════════════════════════════════════════════
// Main screen
// ═══════════════════════════════════════════════════════════════
export function HomeScreen() {
  const navigation = useNavigation<Nav>()
  const [listings, setListings] = useState<ListingCardData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(false)

  const fetchFirst = useCallback(async () => {
    setError(false); setPage(1); setHasMore(true)
    try {
      const data = await api.getListings({ limit: PAGE_SIZE, page: 1 }) as any
      const rows: ListingCardData[] = (data.listings ?? []).map(toCard)
      setListings(rows)
      setTotal(data.total ?? rows.length)
      setHasMore(rows.length === PAGE_SIZE)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const data = await api.getListings({ limit: PAGE_SIZE, page: nextPage }) as any
      const rows: ListingCardData[] = (data.listings ?? []).map(toCard)
      setListings(prev => [...prev, ...rows])
      setPage(nextPage)
      setHasMore(rows.length === PAGE_SIZE)
    } catch {}
    finally { setLoadingMore(false) }
  }, [loadingMore, hasMore, page])

  useEffect(() => { fetchFirst() }, [fetchFirst])
  const onRefresh = () => { setRefreshing(true); fetchFirst() }

  const freshListings = listings.filter(l => (l.daysOnLot ?? 99) === 0)
  const dropListings  = listings.filter(l => l.priceDelta != null && l.priceDelta < 0)
  const newTodayCount = freshListings.length
  const dropsCount    = dropListings.length

  const goSearch = () => (navigation as any).navigate('חיפוש')
  const goAlerts = () => (navigation as any).navigate('התראות')

  const renderItem: ListRenderItem<ListingCardData> = ({ item }) => (
    <ListingCard
      listing={item}
      onPress={() => navigation.navigate('Detail', { listingId: item.id })}
    />
  )

  const Header = () => (
    <>
      {/* ── Top bar ──────────────────────────────────────────── */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.avatar}>
          <Text style={s.avatarText}>א</Text>
        </TouchableOpacity>
        <View style={s.greetBlock}>
          <Text style={s.greetSub}>שלום איתי</Text>
          <Text style={s.greetTitle} numberOfLines={1}>
            {loading ? 'טוען...' : newTodayCount > 0
              ? `${newTodayCount} רכבים חדשים ירדו היום`
              : '2 רכבי יד ראשונה ירדו היום'}
          </Text>
        </View>
        <TouchableOpacity style={s.searchBtn} onPress={goSearch}>
          <Ionicons name="search-outline" size={18} color={colors.fg2} />
        </TouchableOpacity>
      </View>

      {/* ── Hero gradient card ───────────────────────────────── */}
      <View style={s.heroWrap}>
        <LinearGradient
          colors={gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroCard}
        >
          {/* decorative dashed path */}
          <Svg
            width={140} height={100}
            style={s.heroDeco}
          >
            <Path
              d="M0 90 Q 60 30 130 16"
              stroke="#fff"
              strokeWidth={1.5}
              strokeDasharray="3 5"
              fill="none"
            />
            <Circle cx={130} cy={16} r={3} fill="#fff" />
          </Svg>

          <View style={{ position: 'relative' }}>
            <Text style={s.heroEyebrow}>ירידות מחיר השבוע</Text>
            <View style={s.heroNumRow}>
              <Text style={s.heroPct}>3.1%</Text>
              <Text style={s.heroNumLabel}>ירידה ממוצעת</Text>
            </View>
            <Text style={s.heroSub}>קורולה הייבריד יד 1 ירדה ב-₪4,100 בשבוע האחרון</Text>
            <TouchableOpacity style={s.heroCta} onPress={goAlerts}>
              <Text style={s.heroCtaText}>צפו בירידות</Text>
              <Ionicons name="chevron-back" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* ── Stat row ──────────────────────────────────────────── */}
      <View style={s.statSection}>
        <SectionHeader title="היום במערכת" />
        <View style={s.statRow}>
          <StatTile
            label="חדש היום"
            value={loading ? '—' : String(newTodayCount > 0 ? newTodayCount : 3)}
            sub="● תואם חיפוש"
            subGood
          />
          <StatTile
            label="ירידות"
            value={loading ? '—' : String(dropsCount > 0 ? dropsCount : 238)}
            sub="↑ 12 חדשות"
            subGood
          />
          <StatTile
            label="שמורים"
            value="17"
            sub="3 חדשים"
          />
        </View>
      </View>

      {/* ── Recently viewed ───────────────────────────────────── */}
      {listings.length > 0 && (
        <View style={s.recentSection}>
          <View style={s.sectionPad}>
            <SectionHeader title="צפית לאחרונה" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.recentScroll}
          >
            {listings.slice(0, 4).map(item => (
              <RecentThumb
                key={item.id}
                item={item}
                onPress={() => navigation.navigate('Detail', { listingId: item.id })}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* ── Fresh listings ────────────────────────────────────── */}
      {(freshListings.length > 0 || (!loading && listings.length > 0)) && (
        <View style={s.feedSection}>
          <SectionHeader
            title="חדשים תואמים"
            action="הצג הכל"
            onAction={goSearch}
          />
          {(freshListings.length > 0 ? freshListings : listings).slice(0, 2).map(item => (
            <View key={item.id} style={{ marginBottom: 12 }}>
              <ListingCard
                listing={item}
                onPress={() => navigation.navigate('Detail', { listingId: item.id })}
              />
            </View>
          ))}
        </View>
      )}

      {/* ── Price drops ───────────────────────────────────────── */}
      {dropListings.length > 0 && (
        <View style={s.feedSection}>
          <SectionHeader
            title="ירידות מחיר חמות"
            action="הכל"
            onAction={goSearch}
          />
          {dropListings.slice(0, 2).map(item => (
            <View key={item.id} style={{ marginBottom: 12 }}>
              <ListingCard
                listing={item}
                onPress={() => navigation.navigate('Detail', { listingId: item.id })}
              />
            </View>
          ))}
        </View>
      )}

      {/* ── All listings header ───────────────────────────────── */}
      <View style={s.allHeader}>
        <SectionHeader
          title="כל הרכבים"
          action="חיפוש מתקדם"
          onAction={goSearch}
        />
        {error && (
          <View style={s.errorBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.danger} />
            <Text style={s.errorText}>בעיית חיבור — </Text>
            <TouchableOpacity onPress={fetchFirst}>
              <Text style={s.retryLink}>נסה שוב</Text>
            </TouchableOpacity>
          </View>
        )}
        {loading && (
          <View>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        )}
      </View>
    </>
  )

  const Footer = () => (
    loadingMore
      ? <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
      : !hasMore && listings.length > 0
        ? <Text style={s.endText}>סוף הרשימה · {total.toLocaleString('he-IL')} רכבים</Text>
        : null
  )

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg0} />
      <FlatList
        data={loading ? [] : listings}
        keyExtractor={l => l.id}
        renderItem={renderItem}
        ListHeaderComponent={Header}
        ListFooterComponent={Footer}
        ListEmptyComponent={!loading && !error ? (
          <View style={s.emptyWrap}>
            <Ionicons name="car-sport-outline" size={52} color={colors.fg4} />
            <Text style={s.emptyText}>אין מודעות כרגע</Text>
            <Text style={s.emptyHint}>משוך למטה לרענון</Text>
          </View>
        ) : null}
        contentContainerStyle={s.listContent}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        onRefresh={onRefresh}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },
  listContent: { paddingBottom: 110 },

  // top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.accent,
    flexShrink: 0,
  },
  avatarText: { color: '#fff', fontSize: 16, fontFamily: fonts.bold, fontWeight: '800' },
  greetBlock: { flex: 1, minWidth: 0 },
  greetSub: {
    fontSize: 13,
    color: colors.fg2,
    fontFamily: fonts.regular,
  },
  greetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.fg1,
    fontFamily: fonts.bold,
    letterSpacing: -0.2,
    marginTop: 1,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border1,
    backgroundColor: colors.bg1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // hero
  heroWrap: { paddingHorizontal: 20, paddingTop: 10 },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    minHeight: 152,
    overflow: 'hidden',
    position: 'relative',
    ...shadows.accent,
  },
  heroDeco: {
    position: 'absolute',
    left: -10,
    top: -10,
    opacity: 0.22,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    fontFamily: fonts.semibold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroNumRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 8,
  },
  heroPct: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
    fontFamily: fonts.bold,
    lineHeight: 48,
    letterSpacing: -1.5,
  },
  heroNumLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    fontFamily: fonts.semibold,
  },
  heroSub: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.88)',
    fontFamily: fonts.regular,
    lineHeight: 18,
    marginTop: 6,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start',
    marginTop: 14,
  },
  heroCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    fontFamily: fonts.bold,
  },

  // stat
  statSection: { paddingHorizontal: 20, paddingTop: 20 },
  statRow: { flexDirection: 'row', gap: 10 },

  // recently viewed
  recentSection: { marginTop: 20 },
  sectionPad: { paddingHorizontal: 20 },
  recentScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 4,
  },

  // feed sections
  feedSection: { paddingHorizontal: 20, paddingTop: 20 },
  allHeader: { paddingHorizontal: 20, paddingTop: 20 },

  // error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    backgroundColor: colors.bg1,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorText: { color: colors.danger, fontSize: 12, fontFamily: fonts.regular },
  retryLink: { color: colors.accent, fontSize: 12, fontFamily: fonts.semibold },

  endText: {
    color: colors.fg4,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  emptyWrap: { alignItems: 'center', paddingVertical: 56, gap: 10 },
  emptyText: { color: colors.fg2, fontSize: 14, fontFamily: fonts.medium },
  emptyHint: { color: colors.fg3, fontSize: 12 },
})
