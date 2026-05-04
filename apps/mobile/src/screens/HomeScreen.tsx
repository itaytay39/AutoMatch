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
            <Ionicons name="notifications-outline" size={20} color={colors.fg2} />
          </TouchableOpacity>
          <View>
            <Text style={s.brand}>AutoMatch</Text>
            <Text style={s.brandSub}>
              {loading ? 'טוען...' : total > 0 ? `${total.toLocaleString('he-IL')} מודעות פעילות` : 'מצא את הרכב הבא שלך'}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={s.pad}>
          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={16} color={colors.fg3} style={{ marginEnd: 8 }} />
            <TextInput
              style={s.searchInput}
              placeholder="יצרן, דגם, עיר..."
              placeholderTextColor={colors.fg4}
              value={search}
              onChangeText={setSearch}
              textAlign="right"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.fg3} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsRow}
        >
          {CHIPS.map(chip => (
            <TouchableOpacity
              key={chip}
              style={[s.chip, chip === activeChip && s.chipActive]}
              onPress={() => setActiveChip(chip)}
              activeOpacity={0.75}
            >
              <Text style={[s.chipText, chip === activeChip && s.chipTextActive]}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section header */}
        <View style={[s.pad, s.sectionHeader]}>
          <TouchableOpacity>
            <Text style={s.seeAll}>ראה הכל</Text>
          </TouchableOpacity>
          <Text style={s.sectionTitle}>מוצע עבורך</Text>
        </View>

        {/* Listings */}
        <View style={s.pad}>
          {loading ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : listings.length === 0 ? (
            <View style={s.emptyWrap}>
              <Ionicons name="car-sport-outline" size={52} color={colors.fg4} />
              <Text style={s.emptyText}>אין מודעות כרגע</Text>
              <Text style={s.emptyHint}>משוך למטה לרענון</Text>
            </View>
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

  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
  },
  brand: {
    color: colors.fg1,
    fontSize: 24,
    fontWeight: fontWeight.bold,
    textAlign: 'right',
    letterSpacing: -0.5,
  },
  brandSub: {
    color: colors.fg3,
    fontSize: fontSize.caption,
    textAlign: 'right',
    marginTop: 2,
  },
  notifBtn: {
    width: 38, height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.bg1,
    borderWidth: 0.5,
    borderColor: colors.border2,
    alignItems: 'center', justifyContent: 'center',
  },

  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.bg1,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.border2,
    paddingHorizontal: spacing[4],
    height: 48,
    marginBottom: spacing[4],
  },
  searchInput: { flex: 1, color: colors.fg1, fontSize: fontSize.body },

  chipsRow: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    paddingBottom: spacing[5],
  },
  chip: {
    height: 31, paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.bg1,
    borderWidth: 0.5,
    borderColor: colors.border2,
    alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.fg3, fontSize: 12, fontWeight: fontWeight.medium },
  chipTextActive: { color: '#fff', fontWeight: fontWeight.semibold },

  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  sectionTitle: { color: colors.fg1, fontSize: fontSize.headline, fontWeight: fontWeight.bold },
  seeAll: { color: colors.accent, fontSize: fontSize.caption, fontWeight: fontWeight.medium },

  loadingWrap: { paddingVertical: 48, alignItems: 'center' },
  emptyWrap: { alignItems: 'center', paddingVertical: 56, gap: 10 },
  emptyText: { color: colors.fg2, fontSize: fontSize.body, fontWeight: fontWeight.medium },
  emptyHint: { color: colors.fg3, fontSize: fontSize.caption },
})
