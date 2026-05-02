import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native'
import { SearchBar } from '../components/SearchBar'
import { ListingCard } from '../components/ListingCard'
import { colors, spacing, fontSize, fontWeight } from '../theme/tokens'

const MOCK = [
  { id: '4', make: 'קיה', model: 'סטוניק', year: 2019, mileage: 68000, price: 87500, city: 'קריית ביאליק', source: 'yad2', priceLabel: 'good' as const },
  { id: '5', make: 'מזדה', model: '3', year: 2020, mileage: 52000, price: 112000, city: 'ראשון לציון', source: 'autoboom', priceLabel: 'fair' as const },
]

export function SearchScreen() {
  const [search, setSearch] = useState('')

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.pad}>
          <Text style={s.title}>חיפוש</Text>
          <SearchBar value={search} onChangeText={setSearch} />
        </View>
        <View style={[s.pad, { marginTop: spacing[5] }]}>
          <Text style={s.resultsLabel}>{MOCK.length} תוצאות</Text>
          {MOCK.map(l => <ListingCard key={l.id} listing={l} />)}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },
  scroll: { flex: 1 },
  pad: { paddingHorizontal: spacing[5] },
  title: { color: colors.fg1, fontSize: fontSize.display2, fontWeight: fontWeight.bold, marginTop: spacing[4], textAlign: 'right' },
  resultsLabel: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'right', marginBottom: spacing[3] },
})
