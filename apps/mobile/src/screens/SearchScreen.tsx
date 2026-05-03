import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ListingCard } from '../components/ListingCard'
import { colors, spacing, fontSize, fontWeight, radii } from '../theme/tokens'

const FILTERS = ['הכל', 'יד שניה', 'דילרים', 'ליסינג', 'חשמלי']

const MOCK = [
  {
    id: '4', make: 'קיה', model: 'סטוניק', year: 2019,
    mileage: 68000, price: 87500, city: 'קריית ביאליק',
    source: 'yad2', priceLabel: 'good' as const,
    imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80',
  },
  {
    id: '5', make: 'מזדה', model: '3', year: 2020,
    mileage: 52000, price: 112000, city: 'ראשון לציון',
    source: 'autoboom', priceLabel: 'fair' as const,
    imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
  },
  {
    id: '6', make: 'פולקסווגן', model: 'גולף', year: 2021,
    mileage: 38000, price: 134000, city: 'ירושלים',
    source: 'colmobil', priceLabel: 'good' as const,
    imageUrl: 'https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=800&q=80',
  },
]

export function SearchScreen() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('הכל')

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.topBar}>
        <Text style={s.title}>חיפוש</Text>
        <TouchableOpacity style={s.filterBtn}>
          <Ionicons name="options-outline" size={20} color={colors.fg2} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.fg4} style={s.searchIcon} />
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
            <Ionicons name="close-circle" size={18} color={colors.fg4} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filtersRow}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.chip, f === activeFilter && s.chipActive]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.7}
          >
            <Text style={[s.chipText, f === activeFilter && s.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.pad}>
          <Text style={s.resultsLabel}>{MOCK.length} תוצאות</Text>
          {MOCK.map(l => <ListingCard key={l.id} listing={l} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },

  topBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  title: {
    color: colors.fg1,
    fontSize: fontSize.display2,
    fontWeight: fontWeight.bold,
  },
  filterBtn: {
    width: 40, height: 40, borderRadius: radii.md,
    backgroundColor: colors.bg2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border1,
  },

  searchWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.bg2,
    borderRadius: radii.md,
    marginHorizontal: spacing[4],
    marginBottom: spacing[3],
    paddingHorizontal: spacing[4],
    height: 48,
    borderWidth: 1,
    borderColor: colors.border1,
  },
  searchIcon: { marginStart: spacing[2] },
  searchInput: { flex: 1, color: colors.fg1, fontSize: fontSize.body },

  filtersRow: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    paddingBottom: spacing[4],
  },
  chip: {
    height: 34, paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.bg2,
    borderWidth: 1, borderColor: colors.border1,
    alignItems: 'center', justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  chipText: { color: colors.fg3, fontSize: 13, fontWeight: fontWeight.medium },
  chipTextActive: { color: '#fff', fontWeight: fontWeight.semibold },

  pad: { paddingHorizontal: spacing[4] },
  resultsLabel: {
    color: colors.fg4, fontSize: fontSize.caption,
    textAlign: 'right', marginBottom: spacing[3],
  },
})
