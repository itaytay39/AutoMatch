import React, { useState, useMemo } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, FlatList, Modal, Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ListingCard } from '../components/ListingCard'
import { colors, spacing, fontSize, fontWeight, radii } from '../theme/tokens'

// ── Car database for autocomplete ──
const MAKES: { he: string; models: string[] }[] = [
  { he: 'טויוטה',      models: ['קורולה', 'קמרי', 'RAV4', 'יאריס', 'אורבן קרוזר', 'C-HR', 'קורולה הייבריד', 'אוורלנד'] },
  { he: 'קיה',         models: ['ספורטאג', 'סטוניק', 'ריו', 'פיקנטו', 'סורנטו', 'EV6', 'ניירו', 'סיד'] },
  { he: 'יונדאי',      models: ['טוסון', 'i35', 'i25', 'קונה', 'סנטה פה', 'אייוניק 5', 'אייוניק 6', 'אקסנט'] },
  { he: 'מזדה',        models: ['3', '6', 'CX-3', 'CX-5', 'MX-5', 'CX-30', 'CX-60'] },
  { he: 'סקודה',       models: ['אוקטביה', 'פאביה', 'ינסה', 'קמיק', 'קוראק', 'סקאלה', 'סוברב'] },
  { he: 'פולקסווגן',   models: ['גולף', 'פולו', 'ג׳טה', 'טיגואן', 'T-ROC', 'פאסאט', 'ID.4'] },
  { he: 'ב.מ.וו',      models: ['סדרה 3', 'סדרה 5', 'סדרה 1', 'X1', 'X3', 'X5', 'סדרה 7'] },
  { he: 'מרצדס',       models: ['C200', 'E200', 'A-Class', 'GLC', 'GLB', 'CLA', 'B-Class'] },
  { he: 'אאודי',       models: ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'A1'] },
  { he: 'ניסאן',       models: ['מיקרה', 'ג׳וק', 'X-Trail', 'קשקאי', 'אלמרה', 'ליף'] },
  { he: 'הונדה',       models: ['סיוויק', 'ג׳אז', 'CR-V', 'HR-V', 'אקורד'] },
  { he: 'פיאט',        models: ['500', 'פונטו', 'טיפו', 'פנדה'] },
  { he: 'מיצובישי',    models: ['אאוטלנדר', 'ASX', 'Eclipse Cross', 'L200'] },
  { he: 'סיטרואן',     models: ['C3', 'C4', 'C5X', 'ברלינגו'] },
  { he: 'פיג׳ו',       models: ['208', '308', '3008', '2008', '508'] },
  { he: 'רנו',         models: ['קליאו', 'מגאן', 'קפצ׳ור', 'קדג׳אר', 'ZOE'] },
  { he: 'סוזוקי',      models: ['סוויפט', 'ויטרה', 'אס-קרוס', 'ג׳ימני'] },
  { he: 'סיאט',        models: ['איביזה', 'לאון', 'ארונה', 'אטקה'] },
  { he: 'אופל',        models: ['אסטרה', 'קורסה', 'מוקה', 'קרוסלנד'] },
  { he: 'פורד',        models: ['פוקוס', 'פיאסטה', 'קוגה', 'אקו-ספורט', 'מוסטנג'] },
  { he: 'סובארו',      models: ['אימפרזה', 'פורסטר', 'XV', 'אאוטבק', 'WRX'] },
  { he: 'וולוו',       models: ['XC40', 'XC60', 'XC90', 'S60', 'V60'] },
]

const ALL_SUGGESTIONS = MAKES.flatMap(m =>
  [m.he, ...m.models.map(model => `${m.he} ${model}`)]
)

const MOCK_RESULTS = [
  { id: '4', make: 'קיה', model: 'סטוניק', year: 2019, mileage: 68000, price: 87500, city: 'קריית ביאליק', source: 'yad2', priceLabel: 'good' as const, imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80' },
  { id: '5', make: 'מזדה', model: '3', year: 2020, mileage: 52000, price: 112000, city: 'ראשון לציון', source: 'autoboom', priceLabel: 'fair' as const, imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80' },
  { id: '6', make: 'פולקסווגן', model: 'גולף', year: 2021, mileage: 38000, price: 134000, city: 'ירושלים', source: 'colmobil', priceLabel: 'good' as const, imageUrl: 'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=800&q=80' },
  { id: '7', make: 'טויוטה', model: 'RAV4', year: 2022, mileage: 31000, price: 172000, city: 'תל אביב', source: 'yad2', priceLabel: 'good' as const, imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80' },
]

// ── Filter sheet types ──
type SortOption = 'price_asc' | 'price_desc' | 'mileage_asc' | 'newest'

export function SearchScreen() {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sort, setSort] = useState<SortOption>('newest')
  const [maxPrice, setMaxPrice] = useState('')
  const [maxKm, setMaxKm] = useState('')
  const [yearFrom, setYearFrom] = useState('')

  const suggestions = useMemo(() => {
    if (query.length < 2) return []
    return ALL_SUGGESTIONS
      .filter(s => s.includes(query))
      .slice(0, 6)
  }, [query])

  function selectSuggestion(s: string) {
    setQuery(s)
    setShowSuggestions(false)
  }

  const activeFiltersCount = [maxPrice, maxKm, yearFrom].filter(Boolean).length

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Top bar ── */}
      <View style={s.topBar}>
        <TouchableOpacity
          style={[s.filterBtn, activeFiltersCount > 0 && s.filterBtnActive]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={19} color={activeFiltersCount > 0 ? colors.accent : colors.fg2} />
          {activeFiltersCount > 0 && (
            <View style={s.filterCount}>
              <Text style={s.filterCountText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={s.title}>חיפוש</Text>
      </View>

      {/* ── Search + suggestions ── */}
      <View style={s.pad}>
        <View style={[s.searchBar, showSuggestions && s.searchBarOpen]}>
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => { setQuery(''); setShowSuggestions(false) }}>
              <Ionicons name="close-circle" size={18} color={colors.fg3} style={{ marginEnd: 8 }} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search-outline" size={18} color={colors.fg3} style={{ marginEnd: 8 }} />
          )}
          <TextInput
            style={s.searchInput}
            placeholder="חפש רכב — טויוטה, קיה, עיר..."
            placeholderTextColor={colors.fg4}
            value={query}
            onChangeText={t => { setQuery(t); setShowSuggestions(t.length >= 2) }}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            textAlign="right"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        {/* Autocomplete suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={s.suggestions}>
            {suggestions.map((s2, i) => (
              <TouchableOpacity
                key={i}
                style={[s.suggItem, i < suggestions.length - 1 && s.suggItemBorder]}
                onPress={() => selectSuggestion(s2)}
                activeOpacity={0.7}
              >
                <Ionicons name="search-outline" size={14} color={colors.fg3} />
                <Text style={s.suggText}>{s2}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* ── Sort chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.sortRow}
      >
        {([
          { key: 'newest',      label: 'חדש ביותר' },
          { key: 'price_asc',   label: 'מחיר ↑' },
          { key: 'price_desc',  label: 'מחיר ↓' },
          { key: 'mileage_asc', label: 'ק"מ נמוך' },
        ] as { key: SortOption; label: string }[]).map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[s.sortChip, sort === opt.key && s.sortChipActive]}
            onPress={() => setSort(opt.key)}
          >
            <Text style={[s.sortChipText, sort === opt.key && s.sortChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Results ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.pad}>
          <Text style={s.resultsLabel}>{MOCK_RESULTS.length} תוצאות</Text>
          {MOCK_RESULTS.map(l => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </View>
      </ScrollView>

      {/* ── Filter sheet ── */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <Pressable style={s.modalOverlay} onPress={() => setShowFilters(false)} />
        <View style={s.filterSheet}>
          <View style={s.sheetHandle} />
          <Text style={s.sheetTitle}>סינון</Text>

          <Text style={s.filterLabel}>מחיר מקסימום (₪)</Text>
          <TextInput
            style={s.filterInput}
            placeholder="למשל 150000"
            placeholderTextColor={colors.fg4}
            value={maxPrice}
            onChangeText={setMaxPrice}
            keyboardType="numeric"
            textAlign="right"
          />

          <Text style={s.filterLabel}>קילומטרים מקסימום</Text>
          <TextInput
            style={s.filterInput}
            placeholder="למשל 80000"
            placeholderTextColor={colors.fg4}
            value={maxKm}
            onChangeText={setMaxKm}
            keyboardType="numeric"
            textAlign="right"
          />

          <Text style={s.filterLabel}>שנה מ-</Text>
          <TextInput
            style={s.filterInput}
            placeholder="למשל 2018"
            placeholderTextColor={colors.fg4}
            value={yearFrom}
            onChangeText={setYearFrom}
            keyboardType="numeric"
            textAlign="right"
          />

          <View style={s.sheetBtns}>
            <TouchableOpacity
              style={s.clearBtn}
              onPress={() => { setMaxPrice(''); setMaxKm(''); setYearFrom('') }}
            >
              <Text style={s.clearBtnText}>נקה הכל</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.applyBtn} onPress={() => setShowFilters(false)}>
              <Text style={s.applyBtnText}>הצג תוצאות</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },
  pad: { paddingHorizontal: spacing[4] },

  topBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  title: { color: colors.fg1, fontSize: fontSize.display2, fontWeight: fontWeight.bold },
  filterBtn: {
    width: 40, height: 40, borderRadius: radii.md,
    backgroundColor: colors.bg1,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: colors.accentSoft },
  filterCount: {
    position: 'absolute', top: 6, right: 6,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  filterCountText: { color: '#fff', fontSize: 8, fontWeight: fontWeight.bold },

  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.bg1,
    borderRadius: radii.md,
    paddingHorizontal: spacing[4],
    height: 46,
    marginBottom: 0,
  },
  searchBarOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  searchInput: { flex: 1, color: colors.fg1, fontSize: fontSize.body },

  suggestions: {
    backgroundColor: colors.bg1,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
    borderTopWidth: 1,
    borderTopColor: colors.border1,
    marginBottom: spacing[3],
  },
  suggItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: 12,
  },
  suggItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border1 },
  suggText: { color: colors.fg1, fontSize: fontSize.body, flex: 1, textAlign: 'right' },

  sortRow: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  sortChip: {
    height: 30, paddingHorizontal: 12, borderRadius: radii.pill,
    backgroundColor: colors.bg1,
    alignItems: 'center', justifyContent: 'center',
  },
  sortChipActive: { backgroundColor: colors.accent },
  sortChipText: { color: colors.fg3, fontSize: 12, fontWeight: fontWeight.medium },
  sortChipTextActive: { color: '#fff', fontWeight: fontWeight.semibold },

  resultsLabel: {
    color: colors.fg3, fontSize: fontSize.caption,
    textAlign: 'right', marginBottom: spacing[3],
  },

  // Filter modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  filterSheet: {
    backgroundColor: colors.bg1,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    padding: spacing[5],
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.fg4,
    alignSelf: 'center', marginBottom: spacing[4],
  },
  sheetTitle: {
    color: colors.fg1, fontSize: fontSize.headline,
    fontWeight: fontWeight.bold, textAlign: 'right', marginBottom: spacing[5],
  },
  filterLabel: {
    color: colors.fg2, fontSize: fontSize.caption,
    textAlign: 'right', marginBottom: spacing[2],
  },
  filterInput: {
    backgroundColor: colors.bg2,
    borderRadius: radii.md,
    color: colors.fg1,
    paddingHorizontal: spacing[4],
    height: 46,
    fontSize: fontSize.body,
    marginBottom: spacing[4],
  },
  sheetBtns: {
    flexDirection: 'row-reverse',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  applyBtn: {
    flex: 1, height: 48, borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  applyBtnText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.body },
  clearBtn: {
    height: 48, paddingHorizontal: 20, borderRadius: radii.pill,
    backgroundColor: colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },
  clearBtnText: { color: colors.fg2, fontWeight: fontWeight.medium, fontSize: fontSize.body },
})
