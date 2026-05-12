import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, FlatList, StyleSheet, StatusBar,
  ActivityIndicator, TouchableOpacity, TextInput,
  ListRenderItem,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { ListingCard, type ListingCardData } from '../components/ListingCard'
import { FilterSheet, FilterBadge, type Filters } from '../components/FilterSheet'
import { colors, spacing, fontSize, radii } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { api } from '../services/api'
import type { RootStackParamList } from '../navigation/types'

type Nav = StackNavigationProp<RootStackParamList>

// Hebrew → English make mapping for search
const HE_TO_EN: Record<string, string> = {
  'טויוטה': 'Toyota', 'יונדאי': 'Hyundai', 'קיה': 'Kia', 'מאזדה': 'Mazda',
  'הונדה': 'Honda', 'ניסאן': 'Nissan', 'מיצובישי': 'Mitsubishi', 'סוזוקי': 'Suzuki',
  'סובארו': 'Subaru', 'פולקסווגן': 'Volkswagen', 'ב.מ.וו': 'BMW', 'מרצדס': 'Mercedes',
  'אאודי': 'Audi', 'סקודה': 'Skoda', 'סיאט': 'SEAT', 'רנו': 'Renault',
  "פיג'ו": 'Peugeot', 'סיטרואן': 'Citroen', 'פורד': 'Ford', "ג'יפ": 'Jeep',
  'וולוו': 'Volvo', 'אופל': 'Opel', "דאצ'יה": 'Dacia', 'פיאט': 'Fiat',
  'טסלה': 'Tesla', 'שברולט': 'Chevrolet', 'אלפא רומיאו': 'Alfa Romeo',
}

const MAKES_LIST = [
  { he: 'טויוטה', en: 'Toyota' }, { he: 'יונדאי', en: 'Hyundai' }, { he: 'קיה', en: 'Kia' },
  { he: 'מאזדה', en: 'Mazda' }, { he: 'הונדה', en: 'Honda' }, { he: 'ניסאן', en: 'Nissan' },
  { he: 'מיצובישי', en: 'Mitsubishi' }, { he: 'סוזוקי', en: 'Suzuki' }, { he: 'סובארו', en: 'Subaru' },
  { he: 'פולקסווגן', en: 'Volkswagen' }, { he: 'ב.מ.וו', en: 'BMW' }, { he: 'מרצדס', en: 'Mercedes' },
  { he: 'אאודי', en: 'Audi' }, { he: 'סקודה', en: 'Skoda' }, { he: 'סיאט', en: 'SEAT' },
  { he: 'רנו', en: 'Renault' }, { he: "פיג'ו", en: 'Peugeot' }, { he: 'סיטרואן', en: 'Citroen' },
  { he: 'פורד', en: 'Ford' }, { he: "ג'יפ", en: 'Jeep' }, { he: 'וולוו', en: 'Volvo' },
  { he: 'אופל', en: 'Opel' }, { he: "דאצ'יה", en: 'Dacia' }, { he: 'פיאט', en: 'Fiat' },
  { he: 'טסלה', en: 'Tesla' }, { he: 'שברולט', en: 'Chevrolet' }, { he: 'אלפא רומיאו', en: 'Alfa Romeo' },
]

function normalizeQuery(q: string): string {
  const trimmed = q.trim()
  return HE_TO_EN[trimmed] ?? trimmed
}

function getSuggestions(q: string) {
  if (q.length < 1) return []
  const lower = q.toLowerCase()
  return MAKES_LIST.filter(m =>
    m.he.includes(q) ||
    m.en.toLowerCase().startsWith(lower) ||
    m.en.toLowerCase().includes(lower)
  ).slice(0, 5)
}

const SORT_OPTIONS = [
  { label: 'חדש', key: 'newest' },
  { label: 'מחיר ↑', key: 'price_asc' },
  { label: 'מחיר ↓', key: 'price_desc' },
  { label: 'ק״מ', key: 'km_asc' },
  { label: 'עסקה', key: 'deal' },
]

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
  }
}

export function SearchScreen() {
  const navigation = useNavigation<Nav>()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [filters, setFilters] = useState<Filters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [listings, setListings] = useState<ListingCardData[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<TextInput>(null)

  const suggestions = getSuggestions(query)
  const filterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length

  const buildParams = useCallback((pg: number) => {
    const p: Record<string, string | number> = { limit: PAGE_SIZE, page: pg }
    const q = normalizeQuery(query)
    if (q.length >= 2) p.make = q
    if (filters.model)    p.model    = filters.model
    if (filters.yearMin)  p.yearMin  = filters.yearMin
    if (filters.yearMax)  p.yearMax  = filters.yearMax
    if (filters.maxPrice) p.maxPrice = filters.maxPrice
    if (filters.maxKm)    p.maxKm    = filters.maxKm
    if (filters.city)     p.city     = filters.city
    return p
  }, [query, filters])

  const fetchFirst = useCallback(async () => {
    setLoading(true); setError(false); setPage(1); setHasMore(true)
    try {
      const data = await api.getListings(buildParams(1)) as any
      let rows: ListingCardData[] = (data.listings ?? []).map(toCard)
      rows = applySort(rows, sort)
      setListings(rows)
      setTotal(data.total ?? rows.length)
      setHasMore(rows.length === PAGE_SIZE)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [buildParams, sort])

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const data = await api.getListings(buildParams(nextPage)) as any
      const rows: ListingCardData[] = (data.listings ?? []).map(toCard)
      setListings(prev => [...prev, ...applySort(rows, sort)])
      setPage(nextPage)
      setHasMore(rows.length === PAGE_SIZE)
    } catch {}
    finally { setLoadingMore(false) }
  }, [loadingMore, hasMore, page, buildParams, sort])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchFirst, query.length >= 2 ? 400 : 50)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [fetchFirst])

  const selectSuggestion = (m: typeof MAKES_LIST[0]) => {
    setQuery(m.en); setShowSuggestions(false); inputRef.current?.blur()
  }

  const applyFilters = (f: Filters) => { setFilters(f) }

  const renderItem: ListRenderItem<ListingCardData> = ({ item }) => (
    <ListingCard
      listing={item}
      onPress={() => navigation.navigate('Detail', { listingId: item.id })}
    />
  )

  const ListFooter = () => (
    loadingMore
      ? <ActivityIndicator color={colors.accent} style={{ paddingVertical: 24 }} />
      : !hasMore && listings.length > 0
        ? <Text style={s.endText}>סוף הרשימה · {total.toLocaleString('he-IL')} רכבים</Text>
        : null
  )

  const ListEmpty = () => error ? (
    <View style={s.emptyWrap}>
      <Ionicons name="cloud-offline-outline" size={52} color={colors.fg4} />
      <Text style={s.emptyTitle}>בעיית חיבור</Text>
      <Text style={s.emptyHint}>בדוק את החיבור לאינטרנט ונסה שוב</Text>
      <TouchableOpacity style={s.retryBtn} onPress={fetchFirst}>
        <Text style={s.retryText}>נסה שוב</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <View style={s.emptyWrap}>
      <Ionicons name="search-outline" size={52} color={colors.fg4} />
      <Text style={s.emptyTitle}>לא נמצאו רכבים</Text>
      <Text style={s.emptyHint}>נסה לשנות את הפילטרים או לחפש בעברית / אנגלית</Text>
      {filterCount > 0 && (
        <TouchableOpacity style={s.retryBtn} onPress={() => setFilters({})}>
          <Text style={s.retryText}>נקה פילטרים</Text>
        </TouchableOpacity>
      )}
    </View>
  )

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg0} />

      {/* Top bar */}
      <View style={s.topBar}>
        <View style={s.searchRow}>
          <FilterBadge count={filterCount} onPress={() => setShowFilters(true)} />
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
              <TouchableOpacity onPress={() => { setQuery(''); setShowSuggestions(false) }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={colors.fg3} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Autocomplete */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={s.suggestions}>
            {suggestions.map(m => (
              <TouchableOpacity key={m.en} style={s.suggRow} onPress={() => selectSuggestion(m)} activeOpacity={0.75}>
                <Ionicons name="car-outline" size={14} color={colors.fg3} />
                <Text style={s.suggEn}>{m.en}</Text>
                <Text style={s.suggHe}>{m.he}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Sort chips */}
        <FlatList
          data={SORT_OPTIONS}
          horizontal
          inverted
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.sortRow}
          keyExtractor={o => o.key}
          renderItem={({ item: opt }) => (
            <TouchableOpacity
              style={[s.sortChip, opt.key === sort && s.sortChipActive]}
              onPress={() => setSort(opt.key)}
              activeOpacity={0.75}
            >
              <Text style={[s.sortChipText, opt.key === sort && s.sortChipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Count */}
        {!loading && (
          <Text style={s.count}>
            {total > 0 ? `${total.toLocaleString('he-IL')} תוצאות` : query.length > 0 || filterCount > 0 ? 'אין תוצאות' : 'כל המודעות'}
          </Text>
        )}
      </View>

      {loading ? (
        <View style={s.loadingWrap}><ActivityIndicator size="large" color={colors.accent} /></View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={l => l.id}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          onEndReached={fetchMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      <FilterSheet
        visible={showFilters}
        initial={filters}
        onApply={applyFilters}
        onClose={() => setShowFilters(false)}
      />
    </SafeAreaView>
  )
}

function applySort(rows: ListingCardData[], sort: string): ListingCardData[] {
  const sorted = [...rows]
  if (sort === 'price_asc')  sorted.sort((a, b) => a.price - b.price)
  if (sort === 'price_desc') sorted.sort((a, b) => b.price - a.price)
  if (sort === 'km_asc')     sorted.sort((a, b) => (a.mileage ?? 999999) - (b.mileage ?? 999999))
  if (sort === 'deal') {
    const order = { great: 0, good: 1, fair: 2, suspicious: 3 }
    sorted.sort((a, b) => (order[a.dealScore ?? 'fair'] ?? 2) - (order[b.dealScore ?? 'fair'] ?? 2))
  }
  return sorted
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },

  topBar: {
    paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: spacing[2],
    borderBottomWidth: 0.5, borderBottomColor: colors.border1, zIndex: 10,
  },
  searchRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[2], alignItems: 'center' },
  searchBar: {
    flex: 1, flexDirection: 'row-reverse', alignItems: 'center',
    backgroundColor: colors.bg1, borderRadius: radii.md,
    borderWidth: 0.5, borderColor: colors.border2,
    paddingHorizontal: spacing[4], height: 46,
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

  sortRow: { gap: spacing[2], paddingBottom: spacing[2] },
  sortChip: {
    height: 30, paddingHorizontal: 14, borderRadius: radii.pill,
    backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: colors.border2,
  },
  sortChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sortChipText: { color: colors.fg3, fontSize: 11, fontFamily: fonts.medium },
  sortChipTextActive: { color: '#fff', fontFamily: fonts.semibold },

  count: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'right', paddingBottom: spacing[2] },

  listContent: { paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: 80 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  endText: { color: colors.fg4, fontSize: fontSize.caption, textAlign: 'center', paddingVertical: 20 },

  emptyWrap: { alignItems: 'center', paddingVertical: 64, gap: 12 },
  emptyTitle: { color: colors.fg2, fontSize: fontSize.body, fontFamily: fonts.semibold },
  emptyHint: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'center', lineHeight: 18, paddingHorizontal: 32 },
  retryBtn: {
    marginTop: 8, backgroundColor: colors.accentSoft, borderRadius: radii.pill,
    paddingHorizontal: 24, paddingVertical: 10, borderWidth: 0.5, borderColor: colors.accent,
  },
  retryText: { color: colors.accent, fontFamily: fonts.semibold, fontSize: fontSize.body },
})
