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
      if (searchQuery.trim().length >= 2) {
        params.make = searchQuery.trim()
      }
      const data = await api.getListings(params) as any
      let rows: ReturnType<typeof toCard>[] = (data.listings ?? []).map(toCard)

      // Client-side fallback: if make search returned nothing, filter locally
      if (rows.length === 0 && searchQuery.trim().length >= 2) {
        const all = await api.getListings({ limit: 50 }) as any
        rows = (all.listings ?? []).map(toCard).filter((l: ReturnType<typeof toCard>) => {
          const q = searchQuery.toLowerCase()
          return (
            l.make.toLowerCase().includes(q) ||
            l.model.toLowerCase().includes(q) ||
            (l.city ?? '').toLowerCase().includes(q) ||
            l.source.toLowerCase().includes(q)
          )
        })
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
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={s.pad}>
          <Text style={s.title}>חיפוש</Text>

          {/* Search input */}
          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={17} color={colors.fg3} style={{ marginEnd: 8 }} />
            <TextInput
              style={s.searchInput}
              placeholder="יצרן, דגם, עיר..."
              placeholderTextColor={colors.fg4}
              value={query}
              onChangeText={setQuery}
              textAlign="right"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={17} color={colors.fg3} />
              </TouchableOpacity>
            )}
          </View>

          {/* Sort chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.sortRow}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[s.sortChip, opt.key === sort && s.sortChipActive]}
                onPress={() => setSort(opt.key)}
                activeOpacity={0.7}
              >
                <Text style={[s.sortChipText, opt.key === sort && s.sortChipTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={s.resultsLabel}>
            {loading ? 'מחפש...' : `${total.toLocaleString('he-IL')} תוצאות`}
          </Text>
        </View>

        <View style={s.pad}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
          ) : listings.length === 0 ? (
            <View style={s.emptyWrap}>
              <Ionicons name="search-outline" size={48} color={colors.fg4} />
              <Text style={s.emptyText}>לא נמצאו תוצאות</Text>
              <Text style={s.emptyHint}>נסה לחפש לפי יצרן: Toyota, Kia, Hyundai</Text>
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

  title: {
    color: colors.fg1, fontSize: fontSize.display2,
    fontWeight: fontWeight.bold, marginTop: spacing[4], textAlign: 'right', marginBottom: spacing[3],
  },

  searchBar: {
    flexDirection: 'row-reverse', alignItems: 'center',
    backgroundColor: colors.bg1, borderRadius: radii.md,
    paddingHorizontal: spacing[4], height: 46, marginBottom: spacing[3],
  },
  searchInput: { flex: 1, color: colors.fg1, fontSize: fontSize.body },

  sortRow: { gap: spacing[2], paddingBottom: spacing[3], flexDirection: 'row-reverse' },
  sortChip: {
    height: 30, paddingHorizontal: 12, borderRadius: radii.pill,
    backgroundColor: colors.bg1, alignItems: 'center', justifyContent: 'center',
  },
  sortChipActive: { backgroundColor: colors.accent },
  sortChipText: { color: colors.fg3, fontSize: 12, fontWeight: fontWeight.medium },
  sortChipTextActive: { color: '#fff', fontWeight: fontWeight.semibold },

  resultsLabel: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'right', marginBottom: spacing[3] },

  emptyWrap: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: colors.fg2, fontSize: fontSize.body, fontWeight: fontWeight.medium },
  emptyHint: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'center' },
})
