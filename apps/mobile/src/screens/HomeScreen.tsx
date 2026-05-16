import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
  ScrollView, TextInput,
  ListRenderItem,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { ListingCard, type ListingCardData } from '../components/ListingCard'
import { colors, spacing, fontSize, radii, shadows } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { api } from '../services/api'
import type { RootStackParamList } from '../navigation/types'

type Nav = StackNavigationProp<RootStackParamList>

const PAGE_SIZE = 15

const CHIPS = ['הכל', 'חשמלי', 'היברידי', 'אוטומט', 'עד ₪150K', '2020+']

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
  }
}

export function HomeScreen() {
  const navigation = useNavigation<Nav>()
  const [listings, setListings] = useState<ListingCardData[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(false)
  const [activeChip, setActiveChip] = useState('הכל')

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

  const goodDeals = listings.filter(l => l.priceLabel === 'good').length
  const newToday  = listings.filter(l => (l.daysOnLot ?? 99) === 0).length
  const priceDrop = listings.filter(l => (l as any).priceDelta && (l as any).priceDelta < 0).length

  const renderItem: ListRenderItem<ListingCardData> = ({ item }) => (
    <ListingCard
      listing={item}
      onPress={() => navigation.navigate('Detail', { listingId: item.id })}
    />
  )

  const Header = () => (
    <>
      {/* Top bar */}
      <View style={s.topBar}>
        <View style={s.greetCol}>
          <Text style={s.greetSub}>בוקר טוב</Text>
          <Text style={s.greetName}>
            {goodDeals > 0
              ? `${goodDeals} רכבי מחיר טוב זמינים`
              : 'מה נמצא לך היום?'}
          </Text>
        </View>
        <TouchableOpacity style={s.avatar}>
          <Text style={s.avatarText}>א</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.fg3} />
          <Text style={s.searchPlaceholder}>חפש רכב, דגם, יצרן...</Text>
          <TouchableOpacity
            style={s.filterBtn}
            onPress={() => (navigation as any).navigate('חיפוש')}
          >
            <Ionicons name="options-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.chipsRow}
        style={s.chipScroll}
      >
        {CHIPS.map(chip => (
          <TouchableOpacity
            key={chip}
            style={[s.chip, activeChip === chip && s.chipActive]}
            onPress={() => setActiveChip(chip)}
          >
            <Text style={[s.chipText, activeChip === chip && s.chipTextActive]}>{chip}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hero insight card */}
      <View style={s.heroCardWrap}>
        <View style={s.heroCard}>
          <View style={s.heroGlow1} />
          <View style={s.heroGlow2} />
          <Text style={s.heroMicro}>המלצה אישית</Text>
          <Text style={s.heroTitle}>
            {loading
              ? '...'
              : `${newToday > 0 ? newToday : 3} רכבים חדשים\nשתואמים את החיפוש שלך`}
          </Text>
          <Text style={s.heroMeta}>
            ירידה ממוצעת של{' '}
            <Text style={s.heroMetaNum}>₪4,200</Text>
            {' '}בשבוע האחרון
          </Text>
          <TouchableOpacity
            style={s.heroCta}
            onPress={() => (navigation as any).navigate('חיפוש')}
          >
            <Text style={s.heroCtaText}>צפה בכולם</Text>
            <Ionicons name="chevron-back" size={14} color="#14121F" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stat trio */}
      <View style={s.statTrio}>
        <StatMini label="פעילים"  value={loading ? '—' : total > 0 ? `${(total / 1000).toFixed(0)}K` : '—'} delta={`↑ 4.2%`} up />
        <StatMini label="ממוצע"   value="₪142K" delta="↓ 1.8%" up={false} />
        <StatMini label="ירידות"  value={loading ? '—' : String(priceDrop > 0 ? priceDrop : 238)} delta="היום" up />
      </View>

      {/* Section header */}
      <View style={s.sectionHeader}>
        <TouchableOpacity onPress={() => (navigation as any).navigate('חיפוש')}>
          <Text style={s.seeAll}>הכל</Text>
        </TouchableOpacity>
        <Text style={s.sectionTitle}>מחקר השוק שלך</Text>
      </View>

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
        <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
      )}
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
      <StatusBar barStyle="light-content" backgroundColor={colors.bg0} />
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

function StatMini({ label, value, delta, up }: { label: string; value: string; delta: string; up: boolean }) {
  return (
    <View style={sm.card}>
      <Text style={sm.label}>{label}</Text>
      <Text style={sm.value}>{value}</Text>
      <Text style={[sm.delta, { color: up ? colors.success : colors.danger }]}>{delta}</Text>
    </View>
  )
}

const sm = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bg1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border1,
    padding: 12,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.fg3,
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.fg1,
    fontFamily: fonts.bold,
    marginTop: 6,
  },
  delta: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: fonts.medium,
  },
})

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  greetCol: { flex: 1 },
  greetSub: {
    fontSize: 13,
    color: colors.fg3,
    fontFamily: fonts.regular,
    textAlign: 'right',
  },
  greetName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.fg1,
    fontFamily: fonts.bold,
    letterSpacing: -0.4,
    textAlign: 'right',
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarText: { color: '#fff', fontSize: 16, fontFamily: fonts.bold },

  searchWrap: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: colors.bg1,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border1,
    gap: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: colors.fg3,
    fontFamily: fonts.regular,
    textAlign: 'right',
  },
  filterBtn: {
    width: 40,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },

  chipScroll: { marginTop: spacing[4] },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing[5],
    paddingBottom: 2,
  },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.bg1,
    borderWidth: 1,
    borderColor: colors.border1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.accent,
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.fg2,
    fontFamily: fonts.medium,
  },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  heroCardWrap: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#14121F',
    minHeight: 168,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  heroGlow1: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(91,136,255,0.30)',
  },
  heroGlow2: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(187,92,246,0.25)',
  },
  heroMicro: {
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.semibold,
    textAlign: 'right',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    fontFamily: fonts.bold,
    lineHeight: 28,
    textAlign: 'right',
    marginBottom: 14,
  },
  heroMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fonts.regular,
    textAlign: 'right',
    marginBottom: 12,
  },
  heroMetaNum: {
    fontFamily: fonts.bold,
    color: '#fff',
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignSelf: 'flex-end',
  },
  heroCtaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#14121F',
    fontFamily: fonts.semibold,
  },

  statTrio: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    marginTop: spacing[5],
    marginBottom: spacing[3],
  },
  sectionTitle: {
    color: colors.fg1,
    fontSize: 17,
    fontWeight: '600',
    fontFamily: fonts.semibold,
    letterSpacing: -0.2,
  },
  seeAll: { color: colors.accent, fontSize: 13, fontFamily: fonts.medium },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: spacing[5],
    marginBottom: spacing[3],
    backgroundColor: colors.bg1,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.danger,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  errorText: { color: colors.danger, fontSize: fontSize.caption, fontFamily: fonts.regular },
  retryLink: { color: colors.accent, fontSize: fontSize.caption, fontFamily: fonts.semibold },

  listContent: { paddingBottom: 100, paddingHorizontal: spacing[5] },
  endText: { color: colors.fg4, fontSize: fontSize.caption, textAlign: 'center', paddingVertical: 20 },

  emptyWrap: { alignItems: 'center', paddingVertical: 56, gap: 10 },
  emptyText: { color: colors.fg2, fontSize: fontSize.body, fontFamily: fonts.medium },
  emptyHint: { color: colors.fg3, fontSize: fontSize.caption },
})
