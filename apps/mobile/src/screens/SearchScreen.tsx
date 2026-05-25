import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View, Text, FlatList, StyleSheet, StatusBar,
  ActivityIndicator, TouchableOpacity, TextInput,
  ScrollView, Modal, Pressable, ListRenderItem,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { ListingCard, type ListingCardData } from '../components/ListingCard'
import { FilterSheet, FilterBadge, type Filters } from '../components/FilterSheet'
import { SkeletonCard } from '../components/SkeletonCard'
import { EmptyState } from '../components/EmptyState'
import { colors, spacing, fontSize, radii, shadows } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { api } from '../services/api'
import type { RootStackParamList } from '../navigation/types'

type Nav = StackNavigationProp<RootStackParamList>

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

const QUICK_CHIPS = [
  { label: 'חשמלי', key: 'electric' },
  { label: 'היברידי', key: 'hybrid' },
  { label: 'עד 150K ₪', key: 'price150' },
  { label: 'יד 1', key: 'hand1' },
  { label: '2022+', key: 'year2022' },
  { label: 'קרוסאובר', key: 'crossover' },
]

const SORT_OPTIONS = [
  { label: 'הכי חדש',          key: 'newest'     },
  { label: 'מחיר: נמוך לגבוה', key: 'price_asc'  },
  { label: 'מחיר: גבוה לנמוך', key: 'price_desc' },
  { label: 'ק״מ נמוך',         key: 'km_asc'     },
  { label: 'הכי חדש לשנה',     key: 'year_desc'  },
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
  const [showSort, setShowSort] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeChip, setActiveChip] = useState<string | null>(null)
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
    p.sort = sort
    return p
  }, [query, filters, sort])

  const fetchFirst = useCallback(async () => {
    setLoading(true); setError(false); setPage(1); setHasMore(true)
    try {
      const data = await api.getListings(buildParams(1)) as any
      const rows: ListingCardData[] = (data.listings ?? []).map(toCard)
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
      setListings(prev => [...prev, ...rows])
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

  const currentSortLabel = SORT_OPTIONS.find(o => o.key === sort)?.label ?? 'מיין'

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
      <TouchableOpacity onPress={fetchFirst}>
        <Text style={s.retryLink}>נסה שוב</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <EmptyState
      icon="search-outline"
      title="לא מצאנו רכבים תואמים"
      subtitle={filterCount > 0 ? 'נסה לאפס את הפילטרים' : undefined}
      action={filterCount > 0 ? () => setFilters({}) : undefined}
      actionLabel={filterCount > 0 ? 'אפס פילטרים' : undefined}
    />
  )

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={s.header}>
        <Text style={s.headline}>חיפוש</Text>

        <View style={s.searchRow}>
          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={18} color={colors.fg3} style={s.searchIcon} />
            <TextInput
              ref={inputRef}
              style={s.searchInput}
              placeholder="חפש יצרן, דגם..."
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
          <FilterBadge count={filterCount} onPress={() => setShowFilters(true)} />
        </View>

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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsRow}
        >
          {QUICK_CHIPS.map(chip => {
            const isActive = activeChip === chip.key
            return (
              <TouchableOpacity
                key={chip.key}
                style={[s.chip, isActive && s.chipActive]}
                onPress={() => setActiveChip(isActive ? null : chip.key)}
                activeOpacity={0.75}
              >
                <Text style={[s.chipText, isActive && s.chipTextActive]}>{chip.label}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <View style={s.sheet}>
        <View style={s.resultsRow}>
          <TouchableOpacity style={s.sortBtn} onPress={() => setShowSort(true)} activeOpacity={0.75}>
            <Text style={s.sortBtnText}>מיין ↓</Text>
          </TouchableOpacity>
          {!loading && (
            <Text style={s.resultsCount}>
              <Text style={s.resultsNumber}>{total.toLocaleString('he-IL')}</Text>
              {' תוצאות'}
            </Text>
          )}
        </View>

        {loading ? (
          <View style={s.loadingWrap}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
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
      </View>

      <FilterSheet
        visible={showFilters}
        initial={filters}
        onApply={applyFilters}
        onClose={() => setShowFilters(false)}
      />

      <Modal
        visible={showSort}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSort(false)}
      >
        <Pressable style={s.sortOverlay} onPress={() => setShowSort(false)}>
          <Pressable style={s.sortSheet} onPress={e => e.stopPropagation()}>
            <View style={s.sortHandle} />
            {SORT_OPTIONS.map(opt => {
              const isActive = opt.key === sort
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={s.sortOption}
                  onPress={() => { setSort(opt.key); setShowSort(false) }}
                  activeOpacity={0.75}
                >
                  <Text style={[s.sortOptionText, isActive && s.sortOptionTextActive]}>
                    {opt.label}
                  </Text>
                  {isActive && <View style={s.sortActiveDot} />}
                </TouchableOpacity>
              )
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg0,
  },

  header: {
    backgroundColor: colors.tintSearch,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  headline: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.fg1,
    textAlign: 'right',
    marginBottom: spacing[3],
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg1,
    borderRadius: radii.pill,
    height: 52,
    paddingHorizontal: spacing[4],
    ...shadows.sm,
  },
  searchIcon: {
    marginEnd: spacing[2],
  },
  searchInput: {
    flex: 1,
    color: colors.fg1,
    fontSize: fontSize.body,
    fontFamily: fonts.regular,
    textAlign: 'right',
  },

  suggestions: {
    backgroundColor: colors.bg1,
    borderRadius: radii.md,
    marginBottom: spacing[2],
    overflow: 'hidden',
    ...shadows.sm,
  },
  suggRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border1,
  },
  suggEn: {
    flex: 1,
    color: colors.fg1,
    fontSize: fontSize.body,
    fontFamily: fonts.medium,
    textAlign: 'right',
  },
  suggHe: {
    color: colors.fg3,
    fontSize: fontSize.caption,
    fontFamily: fonts.regular,
  },

  chipsRow: {
    gap: spacing[2],
    paddingBottom: spacing[1],
  },
  chip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.70)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.accent,
  },
  chipText: {
    color: colors.fg1,
    fontSize: fontSize.caption,
    fontFamily: fonts.medium,
  },
  chipTextActive: {
    color: colors.onAccent,
    fontFamily: fonts.semibold,
  },

  sheet: {
    flex: 1,
    backgroundColor: colors.bg0,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    marginTop: -16,
    overflow: 'hidden',
  },

  resultsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  resultsCount: {
    color: colors.fg2,
    fontSize: fontSize.body,
    fontFamily: fonts.regular,
    textAlign: 'right',
  },
  resultsNumber: {
    fontFamily: fonts.bold,
    color: colors.fg1,
  },
  sortBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.bg1,
    borderWidth: 0.5,
    borderColor: colors.border2,
    ...shadows.sm,
  },
  sortBtnText: {
    color: colors.fg1,
    fontSize: fontSize.caption,
    fontFamily: fonts.semibold,
  },

  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: 100,
  },
  endText: {
    color: colors.fg4,
    fontSize: fontSize.caption,
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: fonts.regular,
  },

  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyTitle: {
    color: colors.fg2,
    fontSize: fontSize.body,
    fontFamily: fonts.semibold,
  },
  resetBtn: {
    marginTop: 8,
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  resetBtnText: {
    color: colors.onAccent,
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
  },
  retryLink: {
    color: colors.accent,
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
    textDecorationLine: 'underline',
  },

  sortOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sortSheet: {
    backgroundColor: colors.bg1,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[9],
    paddingTop: spacing[3],
  },
  sortHandle: {
    width: 36,
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border2,
    alignSelf: 'center',
    marginBottom: spacing[4],
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border1,
  },
  sortOptionText: {
    color: colors.fg2,
    fontSize: fontSize.title,
    fontFamily: fonts.regular,
    textAlign: 'right',
  },
  sortOptionTextActive: {
    color: colors.fg1,
    fontFamily: fonts.bold,
  },
  sortActiveDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
})
