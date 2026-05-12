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
import { colors, spacing, fontSize, radii, shadows } from '../theme/tokens'
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

  const newToday = listings.filter(l => (l.daysOnLot ?? 99) === 0).length
  const saved = 0

  const Header = () => (
    <>
      <View style={s.hero}>
        <View style={s.heroHeaderRow}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>א</Text>
          </View>
          <Text style={s.brandText}>AutoMatch</Text>
        </View>
        <Text style={s.heroTitle}>שלום,{'\n'}מה נמצא לך היום?</Text>

        <View style={s.insightCard}>
          <Text style={s.insightEyebrow}>ירידות מחיר השבוע</Text>
          <Text style={s.insightHeadline}>ירידה ממוצעת של 3.1%{'\n'}בקטגוריות שלך</Text>
          <Text style={s.insightSub}>
            {goodDeals > 0
              ? `${goodDeals} מודעות עם מחיר טוב מהממוצע זמינות כעת`
              : 'עדכן העדפות כדי לקבל התראות אישיות'}
          </Text>
          <View style={s.sparklineRow}>
            <View style={s.sparklineBg}>
              <View style={s.sparklineFill} />
            </View>
          </View>
          <TouchableOpacity
            style={s.insightBtn}
            onPress={() => (navigation as any).navigate('התראות')}
          >
            <Text style={s.insightBtnText}>צפה בירידות</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.sheet}>
        {error && (
          <View style={s.errorBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color={colors.danger} />
            <Text style={s.errorText}>בעיית חיבור — </Text>
            <TouchableOpacity onPress={fetchFirst}>
              <Text style={s.retryLink}>נסה שוב</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={s.statsGrid}>
          <StatCard
            label="חדש היום"
            value={loading ? '—' : newToday > 0 ? newToday.toString() : '0'}
            sub={loading ? '' : `מתוך ${total.toLocaleString('he-IL')}`}
            subColor={colors.success}
          />
          <StatCard
            label="ירידות"
            value={loading ? '—' : goodDeals > 0 ? goodDeals.toString() : '—'}
            sub="השבוע"
            subColor={colors.warning}
          />
          <StatCard
            label="שמורים"
            value={saved > 0 ? saved.toString() : '—'}
            sub="17 מקורות"
            subColor={colors.fg3}
          />
        </View>

        <View style={s.sectionHeader}>
          <TouchableOpacity onPress={() => (navigation as any).navigate('חיפוש')}>
            <Text style={s.seeAll}>הצג הכל</Text>
          </TouchableOpacity>
          <Text style={s.sectionTitle}>חדשים תואמים</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
        ) : (
          <>
            {listings.slice(0, 2).map(item => (
              <ListingCard
                key={item.id}
                listing={item}
                onPress={() => navigation.navigate('Detail', { listingId: item.id })}
              />
            ))}
          </>
        )}

        <View style={[s.sectionHeader, { marginTop: spacing[5] }]}>
          <TouchableOpacity onPress={() => (navigation as any).navigate('חיפוש')}>
            <Text style={s.seeAll}>הכל</Text>
          </TouchableOpacity>
          <Text style={s.sectionTitle}>ירידות מחיר חמות</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
        ) : (
          <>
            {listings
              .filter(l => l.priceLabel === 'good')
              .slice(0, 2)
              .map(item => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  onPress={() => navigation.navigate('Detail', { listingId: item.id })}
                />
              ))}
            {listings.filter(l => l.priceLabel === 'good').length === 0 && !loading && (
              listings.slice(2, 4).map(item => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  onPress={() => navigation.navigate('Detail', { listingId: item.id })}
                />
              ))
            )}
          </>
        )}
      </View>
    </>
  )

  const Footer = () => (
    loadingMore
      ? <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24, backgroundColor: colors.bg0 }} />
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.tintHome} />
      {loading && listings.length === 0 ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={listings.slice(4)}
          keyExtractor={l => l.id}
          renderItem={renderItem}
          ListHeaderComponent={Header}
          ListFooterComponent={Footer}
          ListEmptyComponent={listings.length === 0 ? Empty : null}
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

function StatCard({ label, value, sub, subColor }: { label: string; value: string; sub: string; subColor: string }) {
  return (
    <View style={sc.card}>
      <Text style={sc.label}>{label}</Text>
      <Text style={sc.value}>{value}</Text>
      <Text style={[sc.sub, { color: subColor }]}>{sub}</Text>
    </View>
  )
}

const sc = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bg1,
    borderRadius: radii.xxl - 4,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    gap: 2,
    ...shadows.sm,
  },
  label: {
    color: colors.fg3,
    fontSize: fontSize.caption,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  value: {
    color: colors.fg1,
    fontSize: fontSize.display2,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginTop: 2,
  },
  sub: {
    fontSize: fontSize.caption,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: 1,
  },
})

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.tintHome },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg0 },

  hero: {
    backgroundColor: colors.tintHome,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[7],
  },

  heroHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  brandText: {
    color: colors.accHome,
    fontSize: fontSize.title,
    fontFamily: fonts.bold,
    letterSpacing: -0.4,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.onAccent,
    fontSize: fontSize.title,
    fontFamily: fonts.bold,
  },

  heroTitle: {
    color: colors.fg1,
    fontSize: fontSize.display2,
    fontFamily: fonts.bold,
    textAlign: 'right',
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: spacing[4],
  },

  insightCard: {
    backgroundColor: colors.bg1,
    borderRadius: radii.xxl,
    padding: spacing[5],
    ...shadows.sm,
  },
  insightEyebrow: {
    color: colors.fg3,
    fontSize: fontSize.caption,
    fontFamily: fonts.semibold,
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing[2],
  },
  insightHeadline: {
    color: colors.fg1,
    fontSize: 24,
    fontFamily: fonts.bold,
    textAlign: 'right',
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: spacing[2],
  },
  insightSub: {
    color: colors.fg2,
    fontSize: fontSize.body,
    fontFamily: fonts.regular,
    textAlign: 'right',
    lineHeight: 20,
    marginBottom: spacing[3],
  },
  sparklineRow: {
    marginBottom: spacing[4],
  },
  sparklineBg: {
    height: 40,
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  sparklineFill: {
    height: 24,
    backgroundColor: colors.accent,
    opacity: 0.25,
    borderRadius: radii.md,
    width: '68%',
    alignSelf: 'flex-end',
  },
  insightBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingVertical: 10,
    paddingHorizontal: spacing[5],
    alignSelf: 'flex-end',
  },
  insightBtnText: {
    color: colors.onAccent,
    fontSize: fontSize.body,
    fontFamily: fonts.semibold,
  },

  sheet: {
    backgroundColor: colors.bg0,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    marginTop: -16,
    paddingTop: spacing[5],
    paddingHorizontal: spacing[4],
    minHeight: 200,
  },

  errorBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing[3],
    backgroundColor: colors.bg1,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.danger,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...shadows.sm,
  },
  errorText: { color: colors.danger, fontSize: fontSize.caption, fontFamily: fonts.regular },
  retryLink: { color: colors.accent, fontSize: fontSize.caption, fontFamily: fonts.semibold },

  statsGrid: {
    flexDirection: 'row-reverse',
    gap: 10,
    marginBottom: spacing[5],
  },

  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  sectionTitle: { color: colors.fg1, fontSize: fontSize.headline, fontFamily: fonts.bold, textAlign: 'right' },
  seeAll: { color: colors.accent, fontSize: fontSize.caption, fontFamily: fonts.medium },

  listContent: { paddingBottom: 100 },
  endText: { color: colors.fg4, fontSize: fontSize.caption, textAlign: 'center', paddingVertical: 20, backgroundColor: colors.bg0 },

  emptyWrap: { alignItems: 'center', paddingVertical: 56, gap: 10 },
  emptyText: { color: colors.fg2, fontSize: fontSize.body, fontFamily: fonts.medium },
  emptyHint: { color: colors.fg3, fontSize: fontSize.caption },
})
