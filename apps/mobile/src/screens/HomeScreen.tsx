import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ListingCard } from '../components/ListingCard'
import { colors, spacing, fontSize, fontWeight, radii } from '../theme/tokens'

const CHIPS = ['הכל', 'יד שניה', 'דילרים', 'חשמלי', 'היברידי', '2020+']

const MOCK_LISTINGS = [
  {
    id: '1', make: 'טויוטה', model: 'קורולה הייבריד', year: 2021,
    mileage: 45000, price: 129900, city: 'תל אביב', source: 'yad2',
    priceLabel: 'good' as const,
    imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
  },
  {
    id: '2', make: 'יונדאי', model: 'אייוניק 5', year: 2023,
    mileage: 22500, price: 189500, city: 'חיפה', source: 'homeless',
    priceLabel: 'fair' as const,
    imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
  },
  {
    id: '3', make: 'סקודה', model: 'אוקטביה', year: 2019,
    mileage: 120000, price: 98000, city: 'פתח תקווה', source: 'autocenter',
    priceLabel: 'expensive' as const,
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
  },
]

const STATS = [
  { label: 'רכבים', value: '12,847', delta: '+4.2%', up: true },
  { label: 'ירידות', value: '238', delta: 'היום', up: null },
  { label: 'שמורים', value: '17', delta: '+3', up: true },
]

export function HomeScreen() {
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('הכל')

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg0} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity style={s.notifBtn}>
            <Ionicons name="notifications-outline" size={21} color={colors.fg2} />
            <View style={s.notifDot} />
          </TouchableOpacity>
          <View>
            <Text style={s.greetSub}>שלום, מה נחפש?</Text>
            <Text style={s.greetMain}>AutoMatch</Text>
          </View>
        </View>

        {/* ── Search bar ── */}
        <View style={s.pad}>
          <View style={s.searchBar}>
            <Ionicons name="search-outline" size={17} color={colors.fg3} style={{ marginEnd: 8 }} />
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
                <Ionicons name="close-circle" size={17} color={colors.fg3} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Filter chips ── */}
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
              activeOpacity={0.7}
            >
              <Text style={[s.chipText, chip === activeChip && s.chipTextActive]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Stats row ── */}
        <View style={[s.pad, s.statsRow]}>
          {STATS.map(st => (
            <View key={st.label} style={s.statCard}>
              <Text style={s.statLabel}>{st.label}</Text>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={[s.statDelta, st.up ? s.deltaUp : s.deltaNeutral]}>
                {st.delta}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Alert banner (replaces purple hero) ── */}
        <View style={s.pad}>
          <View style={s.alertBanner}>
            <View style={s.alertBannerLeft}>
              <View style={s.alertIconWrap}>
                <Ionicons name="flash" size={18} color={colors.accent} />
              </View>
            </View>
            <View style={s.alertBannerBody}>
              <Text style={s.alertBannerTitle}>3 רכבים חדשים תואמים את החיפוש</Text>
              <Text style={s.alertBannerSub}>ירידה ממוצעת של ₪4,200 השבוע</Text>
            </View>
            <TouchableOpacity style={s.alertBannerCta}>
              <Ionicons name="chevron-back" size={16} color={colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Listings section ── */}
        <View style={[s.pad, s.sectionHeader]}>
          <TouchableOpacity>
            <Text style={s.seeAll}>הכל</Text>
          </TouchableOpacity>
          <Text style={s.sectionTitle}>מומלצים עבורך</Text>
        </View>

        <View style={s.pad}>
          {MOCK_LISTINGS.map(l => (
            <ListingCard key={l.id} listing={l} />
          ))}
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
    paddingBottom: spacing[3],
  },
  greetSub: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'right' },
  greetMain: {
    color: colors.fg1, fontSize: 22, fontWeight: fontWeight.bold,
    textAlign: 'right', letterSpacing: -0.3,
  },
  notifBtn: {
    width: 40, height: 40, borderRadius: radii.md,
    backgroundColor: colors.bg1, alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: colors.accent,
    borderWidth: 1.5, borderColor: colors.bg0,
  },

  searchBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.bg1,
    borderRadius: radii.md,
    paddingHorizontal: spacing[4],
    height: 46,
    marginBottom: spacing[3],
  },
  searchInput: { flex: 1, color: colors.fg1, fontSize: fontSize.body },

  chipsRow: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    paddingBottom: spacing[4],
  },
  chip: {
    height: 32, paddingHorizontal: 14, borderRadius: radii.pill,
    backgroundColor: colors.bg1,
    alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.fg3, fontSize: 12, fontWeight: fontWeight.medium },
  chipTextActive: { color: '#fff', fontWeight: fontWeight.semibold },

  statsRow: {
    flexDirection: 'row-reverse',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  statCard: {
    flex: 1, backgroundColor: colors.bg1,
    borderRadius: radii.md, padding: spacing[3],
    alignItems: 'flex-end',
  },
  statLabel: { color: colors.fg3, fontSize: 10, fontWeight: fontWeight.medium, marginBottom: 4 },
  statValue: { color: colors.fg1, fontSize: 19, fontWeight: fontWeight.bold },
  statDelta: { fontSize: 10, marginTop: 2 },
  deltaUp: { color: colors.success },
  deltaNeutral: { color: colors.fg3 },

  alertBanner: {
    backgroundColor: colors.bg1,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border2,
    borderStartColor: colors.accent,
    borderStartWidth: 3,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
    gap: spacing[3],
  },
  alertBannerLeft: {},
  alertIconWrap: {
    width: 36, height: 36, borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  alertBannerBody: { flex: 1, alignItems: 'flex-end' },
  alertBannerTitle: {
    color: colors.fg1, fontSize: fontSize.body,
    fontWeight: fontWeight.semibold, textAlign: 'right',
  },
  alertBannerSub: {
    color: colors.fg3, fontSize: fontSize.caption,
    textAlign: 'right', marginTop: 2,
  },
  alertBannerCta: { padding: 4 },

  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  sectionTitle: { color: colors.fg1, fontSize: fontSize.headline, fontWeight: fontWeight.bold },
  seeAll: { color: colors.accent, fontSize: fontSize.caption, fontWeight: fontWeight.medium },
})
