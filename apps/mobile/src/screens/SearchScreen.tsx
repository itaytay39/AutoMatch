import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet, StatusBar,
  ActivityIndicator, TouchableOpacity, TextInput, FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { ListingCard } from '../components/ListingCard'
import { colors, spacing, fontSize, radii } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { api } from '../services/api'
import type { RootStackParamList } from '../navigation/types'

type Nav = StackNavigationProp<RootStackParamList>

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

// Hebrew + English makes for autocomplete
const MAKES = [
  { he: 'טויוטה', en: 'Toyota' },
  { he: 'יונדאי', en: 'Hyundai' },
  { he: 'קיה', en: 'Kia' },
  { he: 'מאזדה', en: 'Mazda' },
  { he: 'הונדה', en: 'Honda' },
  { he: 'ניסאן', en: 'Nissan' },
  { he: 'מיצובישי', en: 'Mitsubishi' },
  { he: 'סוזוקי', en: 'Suzuki' },
  { he: 'סובארו', en: 'Subaru' },
  { he: 'פולקסווגן', en: 'Volkswagen' },
  { he: 'ב.מ.וו', en: 'BMW' },
  { he: 'מרצדס', en: 'Mercedes' },
  { he: 'אאודי', en: 'Audi' },
  { he: 'סקודה', en: 'Skoda' },
  { he: 'סיאט', en: 'SEAT' },
  { he: 'רנו', en: 'Renault' },
  { he: 'פיג׳ו', en: 'Peugeot' },
  { he: 'סיטרואן', en: 'Citroen' },
  { he: 'פורד', en: 'Ford' },
  { he: 'ג׳יפ', en: 'Jeep' },
  { he: 'וולוו', en: 'Volvo' },
  { he: 'אופל', en: 'Opel' },
  { he: 'דאצ׳יה', en: 'Dacia' },
  { he: 'פיאט', en: 'Fiat' },
  { he: 'טסלה', en: 'Tesla' },
  { he: 'שברולט', en: 'Chevrolet' },
  { he: 'אלפא רומיאו', en: 'Alfa Romeo' },
]

function getSuggestions(q: string): typeof MAKES {
  if (q.length < 1) return []
  const lower = q.toLowerCase()
  return MAKES.filter(m =>
    m.he.includes(q) ||
    m.en.toLowerCase().startsWith(lower) ||
    m.en.toLowerCase().includes(lower)
  ).slice(0, 5)
}

const SORT_OPTIONS = [
  { label: 'חדש', key: 'newest' },
  { label: 'מחיר ↑', key: 'price_asc' },
  { label: 'מחיר ↓', key: 'price_desc' },
  { label: 'ק״מ נמוך', key: 'km_asc' },
  { label: 'עסקה', key: 'deal' },
]

export function SearchScreen() {
  const navigation = useNavigation<Nav>()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [listings, setListings] = useState<ReturnType<typeof toCard>[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<TextInput>(null)

  const suggestions = getSuggestions(query)

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
      else if (sort === 'deal') rows.sort((a, b) => {
        const order = { great: 0, good: 1, fair: 2, suspicious: 3 }
        return (order[a.dealScore ?? 'fair'] ?? 2) - (order[b.dealScore ?? 'fair'] ?? 2)
      })

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

  const selectSuggestion = (m: typeof MAKES[0]) => {
    setQuery(m.en)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg0} />

      {/* Sticky search header */}
      <View style={s.topBar}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.fg3} style={{ marginEnd: 8 }} />
          <TextInput
            ref={inputRef}
            style={s.searchInput}
            placeholder="Toyota, קיה, חיפה..."
            placeholderTextColor={colors.fg4}
            value={query}
            onChangeText={v => { setQuery(v); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            textAlign="right"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => setShowSuggestions(false)}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => { setQuery(''); setShowSuggestions(false) }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={16} color={colors.fg3} />
            </TouchableOpacity>
          )}
        </View>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={s.suggestions}>
            {suggestions.map(m => (
              <TouchableOpacity
                key={m.en}
                style={s.suggRow}
                onPress={() => selectSuggestion(m)}
                activeOpacity={0.75}
              >
                <Ionicons name="car-outline" size={14} color={colors.fg3} />
                <Text style={s.suggEn}>{m.en}</Text>
                <Text style={s.suggHe}>{m.he}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
              <Text style={[s.sortChipText, opt.key === sort && s.sortChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Result count */}
        {!loading && (
          <Text style={s.count}>
            {total > 0
              ? `${total.toLocaleString('he-IL')} תוצאות`
              : query.length > 0 ? 'אין תוצאות' : 'כל המודעות'}
          </Text>
        )}
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.pad}>
          {loading ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : listings.length === 0 ? (
            <View style={s.emptyWrap}>
              <Ionicons name="search-outline" size={48} color={colors.fg4} />
              <Text style={s.emptyTitle}>לא נמצאו רכבים</Text>
              <Text style={s.emptyHint}>
                {'נסה לחפש לפי שם היצרן\nלדוגמה: Toyota, Kia, Hyundai'}
              </Text>
            </View>
          ) : (
            listings.map(l => (
              <ListingCard
                key={l.id}
                listing={l}
                onPress={() => navigation.navigate('Detail', { listingId: l.id })}
              />
            ))
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
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row-reverse', alignItems: 'center',
    backgroundColor: colors.bg1, borderRadius: radii.md,
    borderWidth: 0.5, borderColor: colors.border2,
    paddingHorizontal: spacing[4], height: 46, marginBottom: spacing[2],
  },
  searchInput: { flex: 1, color: colors.fg1, fontSize: fontSize.body, fontFamily: fonts.regular },

  suggestions: {
    backgroundColor: colors.bg1, borderRadius: radii.md,
    borderWidth: 0.5, borderColor: colors.border2,
    marginBottom: spacing[2], overflow: 'hidden',
  },
  suggRow: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: spacing[3],
    paddingHorizontal: spacing[4], paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: colors.border1,
  },
  suggEn: { flex: 1, color: colors.fg1, fontSize: fontSize.body, fontFamily: fonts.medium, textAlign: 'right' },
  suggHe: { color: colors.fg3, fontSize: fontSize.caption, fontFamily: fonts.regular },

  sortRow: {
    gap: spacing[2], paddingBottom: spacing[3], flexDirection: 'row-reverse',
  },
  sortChip: {
    height: 30, paddingHorizontal: 14, borderRadius: radii.pill,
    backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: colors.border2,
  },
  sortChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sortChipText: { color: colors.fg3, fontSize: 11, fontFamily: fonts.medium },
  sortChipTextActive: { color: '#fff', fontFamily: fonts.semibold },

  count: {
    color: colors.fg3, fontSize: fontSize.caption, textAlign: 'right', paddingBottom: spacing[2],
  },

  loadingWrap: { paddingVertical: 56, alignItems: 'center' },
  emptyWrap: { alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyTitle: { color: colors.fg2, fontSize: fontSize.body, fontFamily: fonts.semibold },
  emptyHint: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'center', lineHeight: 18 },
})
