import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, ActivityIndicator,
  ListRenderItem,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { ListingCard, type ListingCardData } from '../components/ListingCard'
import { colors, spacing, fontSize, radii } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { api } from '../services/api'
import type { RootStackParamList } from '../navigation/types'

type Nav = StackNavigationProp<RootStackParamList>

const PAGE_SIZE = 15

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
  const [goodDeals, setGoodDeals] = useState(0)

  const fetchFirst = useCallback(async () => {
    setError(false); setPage(1); setHasMore(true)
    try {
      const data = await api.getListings({ limit: PAGE_SIZE, page: 1 }) as any
      const rows: ListingCardData[] = (data.listings ?? []).map(toCard)
      setListings(rows)
      setTotal(data.total ?? rows.length)
      setHasMore(rows.length === PAGE_SIZE)
      setGoodDeals(rows.filter(l => l.priceLabel === 'good').length)
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

  const renderItem: ListRenderItem<ListingCardData> = ({ item }) => (
    <ListingCard
      listing={item}
      onPress={() => navigation.navigate('Detail', { listingId: item.id })}
    />
  )

  const Header = () => (
    <>
      {/* App header */}
      <View style={s.header}>
        <TouchableOpacity style={s.notifBtn}>
          <Ionicons name="notifications-outline" size={20} color={colors.fg2} />
        </TouchableOpacity>
        <View>
          <Text style={s.brand}>AutoMatch</Text>
          <Text style={s.brandSub}>
            {loading ? 'טוען...' : total > 0
              ? `${total.toLocaleString('he-IL')} מודעות פעילות`
              : 'מצא את הרכב הבא שלך'}
          </Text>
        </View>
      </View>

      {/* Stats row */}
      {!loading && total > 0 && (
        <View style={s.statsRow}>
          <StatPill icon="layers-outline"          label="מקורות"       value="17" />
          <StatPill icon="shield-checkmark-outline" label="נבדקו"        value={total.toLocaleString('he-IL')} />
          <StatPill icon="trending-down-outline"   label="עסקאות טובות" value={goodDeals > 0 ? goodDeals.toString() : '—'} />
        </View>
      )}

      {/* Error state */}
      {error && (
        <View style={s.errorBanner}>
          <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
          <Text style={s.errorText}>בעיית חיבור — </Text>
          <TouchableOpacity onPress={fetchFirst}>
            <Text style={s.retryLink}>נסה שוב</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Section title */}
      <View style={s.sectionHeader}>
        <TouchableOpacity onPress={() => (navigation as any).navigate('חיפוש')}>
          <Text style={s.seeAll}>ראה הכל</Text>
        </TouchableOpacity>
        <Text style={s.sectionTitle}>מוצע עבורך</Text>
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

  const Empty = () => error ? null : (
    <View style={s.emptyWrap}>
      <Ionicons name="car-sport-outline" size={52} color={colors.fg4} />
      <Text style={s.emptyText}>אין מודעות כרגע</Text>
      <Text style={s.emptyHint}>משוך למטה לרענון</Text>
    </View>
  )

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg0} />
      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={l => l.id}
          renderItem={renderItem}
          ListHeaderComponent={Header}
          ListFooterComponent={Footer}
          ListEmptyComponent={Empty}
          contentContainerStyle={s.listContent}
          onEndReached={fetchMore}
          onEndReachedThreshold={0.5}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

function StatPill({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={sp.pill}>
      <Ionicons name={icon} size={16} color={colors.accent} />
      <Text style={sp.value}>{value}</Text>
      <Text style={sp.label}>{label}</Text>
    </View>
  )
}

const sp = StyleSheet.create({
  pill: {
    flex: 1, alignItems: 'center', gap: 2,
    backgroundColor: colors.bg1, borderRadius: radii.lg,
    paddingVertical: spacing[3], paddingHorizontal: spacing[2],
    borderWidth: 0.5, borderColor: colors.border2,
  },
  value: { color: colors.fg1, fontSize: fontSize.headline, fontFamily: fonts.bold },
  label: { color: colors.fg3, fontSize: 10, fontFamily: fonts.regular },
})

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },

  header: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4], paddingBottom: spacing[4],
  },
  brand: { color: colors.fg1, fontSize: 26, fontFamily: fonts.bold, textAlign: 'right', letterSpacing: -0.8 },
  brandSub: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'right', marginTop: 2 },
  notifBtn: {
    width: 40, height: 40, borderRadius: radii.md,
    backgroundColor: colors.bg1, borderWidth: 0.5, borderColor: colors.border2,
    alignItems: 'center', justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row-reverse', gap: spacing[2],
    paddingHorizontal: spacing[4], marginBottom: spacing[4],
  },

  errorBanner: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
    marginHorizontal: spacing[4], marginBottom: spacing[3],
    backgroundColor: '#2A1A08', borderRadius: radii.md,
    borderWidth: 0.5, borderColor: 'rgba(217,119,6,0.3)',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
  },
  errorText: { color: colors.warning, fontSize: fontSize.caption, fontFamily: fonts.regular },
  retryLink: { color: colors.accent, fontSize: fontSize.caption, fontFamily: fonts.semibold },

  sectionHeader: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4], marginBottom: spacing[3],
  },
  sectionTitle: { color: colors.fg1, fontSize: fontSize.headline, fontFamily: fonts.bold },
  seeAll: { color: colors.accent, fontSize: fontSize.caption, fontFamily: fonts.medium },

  listContent: { paddingHorizontal: spacing[4], paddingBottom: 80 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  endText: { color: colors.fg4, fontSize: fontSize.caption, textAlign: 'center', paddingVertical: 20 },

  emptyWrap: { alignItems: 'center', paddingVertical: 56, gap: 10 },
  emptyText: { color: colors.fg2, fontSize: fontSize.body, fontFamily: fonts.medium },
  emptyHint: { color: colors.fg3, fontSize: fontSize.caption },
})
