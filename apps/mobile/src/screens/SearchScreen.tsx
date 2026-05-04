import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet, StatusBar,
  ActivityIndicator, TouchableOpacity, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ListingCard } from '../components/ListingCard'
import { colors, spacing, fontSize, fontWeight, radii } from '../theme/tokens'
import { api } from '../services/api'

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

const SORT_OPTIONS = [
  { label: 'חדש', key: 'newest' },
  { label: 'מחיר ↑', key: 'price_asc' },
  { label: 'מחיר ↓', key: 'price_desc' },
  { label: 'ק״מ נמוך', key: 'km_asc' },
]

export function SearchScreen() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [listings, setListings] = useState<ReturnType<typeof toCard>[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchListings = useCallback(async (searchQuery: string) => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { limit: 20 }
      if (searchQuery.trim().length >= 2) params.make = searchQuery.trim()

      const data = await api.getListings(params) as any
      let rows: ReturnType<typeof toCard>[] = (data.listings ?? []).map(toCard)

      if (rows.length === 0 && searchQuery.trim().length >= 2) {
        const all = await api.getListings({ limit: 50 }) as any
        const q = searchQuery.toLowerCase()
        rows = (all.listings ?? []).map(toCard).filter((l: ReturnType<typeof toCard>) =>
          l.make.toLowerCase().includes(q) ||
          l.model.toLowerCase().includes(q) ||
          (l.city ?? '').toLowerCase().includes(q)
        )
        setTotal(rows.length)
      } else {
        setTotal(data.total ?? rows.length)
      }

      if (sort === 'price_asc') rows.sort((a, b) => a.price - b.price)
      else if (sort === 'price_desc') rows.sort((a, b) => b.price - a.price)
      else if (sort === 'km_asc') rows.sort((a, b) => (a.mileage ?? 999999) - (b.mileage ?? 999999))

      setListings(rows)
    } catch (e) {
      console.warn('Search error:', e)
    } finally {
      setLoading(false)
    }
  }, [sort])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchListings(query), query.length >= 2 ? 400 : 0)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchListings])

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg0} />

      {/* Sticky search header */}
      <View style={s.topBar}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.fg3} style={{ marginEnd: 8 }} />
          <TextInput
            style={s.searchInput}
            placeholder="Toyota, Kia, חיפה..."
            placeholderTextColor={colors.fg4}
            value={query}
            onChangeText={setQuery}
            textAlign="right"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={colors.fg3} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.sortRow}
        >
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[s.sortChip, opt.key === sort && s.sortChipActive]}
              onPress={() => setSort(opt.key)}
              activeOpacity={0.75}
            >
              <Text style={[s.sortChipText, opt.key === sort && s.sortChipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Result count */}
        {!loading && (
          <Text style={s.count}>
            {total > 0 ? `${total.toLocaleString('he-IL')} תוצאות` : query.length > 0 ? 'אין תוצאות' : 'כל המודעות'}
          </Text>
        )}
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.pad}>
          {loading ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : listings.length === 0 ? (
            <View style={s.emptyWrap}>
              <Ionicons name="search-outline" size={48} color={colors.fg4} />
              <Text style={s.emptyTitle}>לא נמצאו רכבים</Text>
              <Text style={s.emptyHint}>נסה לחפש לפי שם היצרן באנגלית{'\n'}לדוגמה: Toyota, Kia, Hyundai</Text>
            </View>
          ) : (
            listings.map(l => <ListingCard key={l.id} listing={l} />)
          )}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },
  scroll: { flex: 1 },
  pad: { paddingHorizontal: spacing[4] },

  topBar: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border1,
  },
  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.bg1,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.border2,
    paddingHorizontal: spacing[4],
    height: 46,
    marginBottom: spacing[3],
  },
  searchInput: { flex: 1, color: colors.fg1, fontSize: fontSize.body },

  sortRow: {
    gap: spacing[2],
    paddingBottom: spacing[3],
    flexDirection: 'row-reverse',
  },
  sortChip: {
    height: 28, paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },
  sortChipActive: { backgroundColor: colors.accent },
  sortChipText: { color: colors.fg3, fontSize: 11, fontWeight: fontWeight.medium },
  sortChipTextActive: { color: '#fff', fontWeight: fontWeight.semibold },

  count: {
    color: colors.fg3,
    fontSize: fontSize.caption,
    textAlign: 'right',
    paddingBottom: spacing[2],
  },

  loadingWrap: { paddingVertical: 56, alignItems: 'center' },
  emptyWrap: { alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyTitle: { color: colors.fg2, fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  emptyHint: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'center', lineHeight: 18 },
})
