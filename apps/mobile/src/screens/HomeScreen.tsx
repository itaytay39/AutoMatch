import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SearchBar } from '../components/SearchBar'
import { ListingCard } from '../components/ListingCard'
import { colors, spacing, fontSize, fontWeight, radii, gradients } from '../theme/tokens'

const CHIPS = ['הכל', 'היברידי', 'חשמלי', 'עד ₪150K', '2020+']

const MOCK_LISTINGS = [
  { id: '1', make: 'טויוטה', model: 'קורולה הייבריד', year: 2021, mileage: 45000, price: 129900, city: 'תל אביב', source: 'yad2', priceLabel: 'good' as const },
  { id: '2', make: 'יונדאי', model: 'אייוניק 5', year: 2023, mileage: 22500, price: 189500, city: 'חיפה', source: 'yad2', priceLabel: 'fair' as const },
  { id: '3', make: 'סקודה', model: 'אוקטביה', year: 2019, mileage: 120000, price: 98000, city: 'פתח תקווה', source: 'yad2', priceLabel: 'expensive' as const },
]

const STATS = [
  { label: 'רכבים פעילים', value: '12,847', delta: '↑ 4.2%', up: true },
  { label: 'ירידות היום', value: '238', delta: '↑ 12 חדשות', up: true },
  { label: 'שמורים', value: '17', delta: '3 חדשים', up: null },
]

export function HomeScreen() {
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('הכל')

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={[s.pad, { marginTop: spacing[2] }]}>
          <Text style={s.greet}>שלום,</Text>
          <View style={s.nameRow}>
            <Text style={s.greetH}>מה נחפש היום?</Text>
            <LinearGradient colors={gradients.primary} style={s.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={s.avatarText}>ד</Text>
            </LinearGradient>
          </View>
          <SearchBar value={search} onChangeText={setSearch} />
        </View>

        {/* Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {CHIPS.map(chip => (
            <TouchableOpacity key={chip} onPress={() => setActiveChip(chip)}>
              {chip === activeChip ? (
                <LinearGradient colors={gradients.primary} style={[s.chip, s.chipActive]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={s.chipTextActive}>{chip}</Text>
                </LinearGradient>
              ) : (
                <View style={s.chip}>
                  <Text style={s.chipText}>{chip}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Hero card */}
        <View style={s.pad}>
          <View style={s.heroCard}>
            <LinearGradient
              colors={['rgba(91,136,255,0.55)', 'rgba(187,92,246,0.5)']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />
            <Text style={s.heroMicro}>המלצה אישית</Text>
            <Text style={s.heroTitle}>3 רכבים חדשים{'\n'}תואמים את החיפוש שלך</Text>
            <Text style={s.heroSub}>ירידה ממוצעת של ₪ 4,200 השבוע</Text>
            <TouchableOpacity style={s.heroCta}>
              <Text style={s.heroCtaText}>צפה בכולם</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={[s.pad, s.statGrid]}>
          {STATS.map(st => (
            <View key={st.label} style={s.statCard}>
              <Text style={s.statLabel}>{st.label}</Text>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={[s.statDelta, st.up === true ? s.up : st.up === false ? s.dn : s.neutral]}>
                {st.delta}
              </Text>
            </View>
          ))}
        </View>

        {/* Listings */}
        <View style={s.pad}>
          <View style={s.sectionHeader}>
            <TouchableOpacity><Text style={s.seeAll}>הכל</Text></TouchableOpacity>
            <Text style={s.sectionTitle}>מומלצים עבורך</Text>
          </View>
          {MOCK_LISTINGS.map(l => (
            <ListingCard key={l.id} listing={l} />
          ))}
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

  greet: { color: colors.fg3, fontSize: fontSize.caption, marginTop: spacing[2] },
  nameRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  greetH: { color: colors.fg1, fontSize: fontSize.display2, fontWeight: fontWeight.bold, letterSpacing: -0.5 },
  avatar: { width: 40, height: 40, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.title },

  chips: { paddingHorizontal: spacing[5], paddingTop: spacing[4], gap: spacing[2] },
  chip: {
    height: 32, paddingHorizontal: 14, borderRadius: radii.pill,
    backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border1,
    alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { borderWidth: 0 },
  chipText: { color: colors.fg2, fontSize: fontSize.caption, fontWeight: fontWeight.medium },
  chipTextActive: { color: '#fff', fontSize: fontSize.caption, fontWeight: fontWeight.medium },

  heroCard: {
    borderRadius: radii.xl, padding: spacing[5], marginTop: 18,
    backgroundColor: '#14121F', overflow: 'hidden', minHeight: 168,
  },
  heroMicro: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.micro, fontWeight: fontWeight.semibold, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'right' },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: fontWeight.bold, lineHeight: 28, marginTop: 8, marginBottom: 6, textAlign: 'right' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.caption, textAlign: 'right' },
  heroCta: {
    marginTop: 14, height: 40, paddingHorizontal: 16, borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.95)', alignSelf: 'flex-end',
    alignItems: 'center', justifyContent: 'center',
  },
  heroCtaText: { color: '#14121F', fontWeight: fontWeight.semibold, fontSize: fontSize.caption },

  statGrid: { flexDirection: 'row-reverse', gap: spacing[2], marginTop: 18 },
  statCard: {
    flex: 1, backgroundColor: colors.bg1, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border1, padding: 12,
  },
  statLabel: { fontSize: fontSize.micro, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.fg3, fontWeight: fontWeight.semibold, textAlign: 'right' },
  statValue: { fontSize: 18, fontWeight: fontWeight.bold, color: colors.fg1, marginTop: 6, textAlign: 'right' },
  statDelta: { fontSize: 11, marginTop: 2, textAlign: 'right' },
  up: { color: colors.success },
  dn: { color: colors.danger },
  neutral: { color: colors.fg3 },

  sectionHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[6], marginBottom: 12 },
  sectionTitle: { fontSize: fontSize.headline, fontWeight: fontWeight.semibold, color: colors.fg1 },
  seeAll: { color: colors.primaryBlue, fontSize: fontSize.caption, fontWeight: fontWeight.medium },
})
