import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, TextInput, ActivityIndicator, RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ListingCard } from '../components/ListingCard'
import { colors, spacing, fontSize, fontWeight, radii } from '../theme/tokens'
import { api } from '../services/api'

const CHIPS = ['הכל', 'יד שניה', 'דילרים', 'חשמלי', 'היברידי', '2020+']

interface ApiListing {
  id: string; make: string; model: string; year: number; mileage: number | null
  price: number; city: string | null; source: string; images: string[]
  daysOnLot?: number; odometerSuspicious?: boolean; redFlags?: string[]
  dealScore?: 'great' | 'good' | 'fair' | 'suspicious'
  market?: { priceRating: string }
}

function toCard(l: ApiListing) {
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
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('הכל')
  const [listings, setListings] = useState<ReturnType<typeof toCard>[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchListings = useCallback(async () => {
    try {
      const data = await api.getListings({ limit: 10 }) as any
      setListings((data.listings ?? []).map(toCard))
      setTotal(data.total ?? 0)
    } catch (e) {
      console.warn('API error:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchListings() }, [fetchListings])

  const onRefresh = () => { setRefreshing(true); fetchListings() }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg0} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.notifBtn}>
            <Ionicons name="notifications-outline" size={21} color={colors.fg2} />
            <View style={s.notifDot} />
          </TouchableOpacity>
          <View>
            <Text style={s.greetSub}>שלום, מה נחפש?</Text>
            <Text style={s.greetMain}>AutoMatch</Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={s.pad}>
          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={17} color={colors.fg3} style={{ marginEnd: 8 }} />
            <TextInput
              style={s.searchInput}
              placeholder="יצרן, דגם, עיר, מחיר..."
              placeholderTextColor={colors.fg4}
              value={search}
              onChangeText={setSearch}
              textAlign="right"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={17} color={colors.fg3} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
          {CHIPS.map(chip => (
            <TouchableOpacity
              key={chip}
              style={[s.chip, chip === activeChip && s.chipActive]}
              onPress={() => setActiveChip(chip)}
              activeOpacity={0.7}
            >
              <Text style={[s.chipText, chip === activeChip && s.chipTextActive]}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats row */}
        <View style={[s.pad, s.statsRow]}>
          {[
            { label: 'רכבים', value: total > 0 ? total.toLocaleString('he-IL') : '…', delta: 'במאגר', up: null },
            { label: 'חדשים', value: listings.filter(l => (l.daysOnLot ?? 99) <= 3).length.toString(), delta: 'ב-3 ימים', up: true },
            { label: 'שמורים', value: '0', delta: 'לחץ ❤️', up: null },
          ].map(st => (
            <View key={st.label} style={s.statCard}>
              <Text style={s.statLabel}>{st.label}</Text>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={[s.statDelta, st.up ? s.deltaUp : s.deltaNeutral]}>{st.delta}</Text>
            </View>
          ))}
        </View>

        {/* Alert banner */}
        <View style={s.pad}>
          <View style={s.alertBanner}>
            <View style={s.alertIconWrap}>
              <Ionicons name="flash" size={18} color={colors.accent} />
            </View>
            <View style={s.alertBannerBody}>
              <Text style={s.alertBannerTitle}>
                {loading ? 'טוען נתונים מהשרת...' : `${total.toLocaleString('he-IL')} רכבים במאגר`}
              </Text>
              <Text style={s.alertBannerSub}>משוך למטה לרענון הנתונים</Text>
            </View>
            <TouchableOpacity style={s.alertBannerCta}>
              <Ionicons name="chevron-back" size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Listings */}
        <View style={[s.pad, s.sectionHeader]}>
          <TouchableOpacity>
            <Text style={s.seeAll}>הכל</Text>
          </TouchableOpacity>
          <Text style={s.sectionTitle}>מומלצים עבורך</Text>
        </View>

        <View style={s.pad}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
          ) : listings.length === 0 ? (
            <Text style={s.emptyText}>לא נמצאו מודעות — נסה לרענן</Text>
          ) : (
            listings.map(l => <ListingCard key={l.id} listing={l} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },
  pad: { paddingHorizontal: spacing[4] },
  emptyText: { color: colors.fg3, textAlign: 'center', marginTop: 40, fontSize: fontSize.body },

  header: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[3],
  },
  greetSub: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'right' },
  greetMain: { color: colors.fg1, fontSize: 22, fontWeight: fontWeight.bold, textAlign: 'right', letterSpacing: -0.3 },
  notifBtn: {
    width: 40, height: 40, borderRadius: radii.md,
    backgroundColor: colors.bg1, alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: colors.accent, borderWidth: 1.5, borderColor: colors.bg0,
  },

  searchBar: {
    flexDirection: 'row-reverse', alignItems: 'center',
    backgroundColor: colors.bg1, borderRadius: radii.md,
    paddingHorizontal: spacing[4], height: 46, marginBottom: spacing[3],
  },
  searchInput: { flex: 1, color: colors.fg1, fontSize: fontSize.body },

  chipsRow: { paddingHorizontal: spacing[4], gap: spacing[2], paddingBottom: spacing[4] },
  chip: {
    height: 32, paddingHorizontal: 14, borderRadius: radii.pill,
    backgroundColor: colors.bg1, alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.fg3, fontSize: 12, fontWeight: fontWeight.medium },
  chipTextActive: { color: '#fff', fontWeight: fontWeight.semibold },

  statsRow: { flexDirection: 'row-reverse', gap: spacing[2], marginBottom: spacing[4] },
  statCard: { flex: 1, backgroundColor: colors.bg1, borderRadius: radii.md, padding: spacing[3], alignItems: 'flex-end' },
  statLabel: { color: colors.fg3, fontSize: 10, fontWeight: fontWeight.medium, marginBottom: 4 },
  statValue: { color: colors.fg1, fontSize: 19, fontWeight: fontWeight.bold },
  statDelta: { fontSize: 10, marginTop: 2 },
  deltaUp: { color: colors.success },
  deltaNeutral: { color: colors.fg3 },

  alertBanner: {
    backgroundColor: colors.bg1, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border2,
    borderStartColor: colors.accent, borderStartWidth: 3,
    flexDirection: 'row-reverse', alignItems: 'center',
    paddingVertical: spacing[3], paddingHorizontal: spacing[4],
    marginBottom: spacing[4], gap: spacing[3],
  },
  alertIconWrap: {
    width: 36, height: 36, borderRadius: radii.md,
    backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  alertBannerBody: { flex: 1, alignItems: 'flex-end' },
  alertBannerTitle: { color: colors.fg1, fontSize: fontSize.body, fontWeight: fontWeight.semibold, textAlign: 'right' },
  alertBannerSub: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'right', marginTop: 2 },
  alertBannerCta: { padding: 4 },

  sectionHeader: {
    flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3],
  },
  sectionTitle: { color: colors.fg1, fontSize: fontSize.headline, fontWeight: fontWeight.bold },
  seeAll: { color: colors.accent, fontSize: fontSize.caption, fontWeight: fontWeight.medium },
})
