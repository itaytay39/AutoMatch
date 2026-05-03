import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { ListingCard } from '../components/ListingCard'
import { colors, spacing, fontSize, fontWeight, radii, gradients } from '../theme/tokens'

const CHIPS = ['הכל', 'היברידי', 'חשמלי', 'עד ₪150K', '2020+']

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
  { label: 'ירידות מחיר', value: '238', delta: 'היום', up: null },
  { label: 'שמורים', value: '17', delta: '3 חדשים', up: null },
]

export function HomeScreen() {
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('הכל')

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg0} />
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <LinearGradient colors={gradients.primary} style={s.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={s.avatarText}>א</Text>
            </LinearGradient>
          </View>
          <View style={s.headerRight}>
            <Text style={s.greetSub}>שלום,</Text>
            <Text style={s.greetMain}>מה נחפש היום?</Text>
          </View>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Ionicons name="search-outline" size={18} color={colors.fg4} style={s.searchIcon} />
          <TextInput
            style={s.searchInput}
            placeholder="חפש לפי יצרן, דגם, עיר..."
            placeholderTextColor={colors.fg4}
            value={search}
            onChangeText={setSearch}
            textAlign="right"
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipsRow}
        >
          {CHIPS.map(chip => (
            <TouchableOpacity key={chip} onPress={() => setActiveChip(chip)} activeOpacity={0.7}>
              {chip === activeChip ? (
                <LinearGradient colors={gradients.primary} style={s.chip} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
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

        {/* Hero */}
        <View style={s.pad}>
          <LinearGradient
            colors={['#1A1F35', '#1C1628']}
            style={s.hero}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={s.heroBadge}>
              <View style={s.heroDot} />
              <Text style={s.heroBadgeText}>המלצה אישית</Text>
            </View>
            <Text style={s.heroTitle}>3 רכבים חדשים{'\n'}תואמים את החיפוש שלך</Text>
            <Text style={s.heroSub}>ירידה ממוצעת של ₪4,200 השבוע</Text>
            <TouchableOpacity activeOpacity={0.8}>
              <LinearGradient colors={gradients.primary} style={s.heroCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={s.heroCtaText}>צפה בכולם</Text>
                <Ionicons name="chevron-back" size={14} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Stats */}
        <View style={[s.pad, s.statsRow]}>
          {STATS.map(st => (
            <View key={st.label} style={s.statCard}>
              <Text style={s.statLabel}>{st.label}</Text>
              <Text style={s.statValue}>{st.value}</Text>
              <Text style={[s.statDelta, st.up === true ? s.deltaUp : s.deltaNeutral]}>{st.delta}</Text>
            </View>
          ))}
        </View>

        {/* Section */}
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
  scroll: { flex: 1 },
  pad: { paddingHorizontal: spacing[4] },

  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  headerRight: { alignItems: 'flex-end' },
  headerLeft: {},
  greetSub: { color: colors.fg3, fontSize: fontSize.caption },
  greetMain: { color: colors.fg1, fontSize: 22, fontWeight: fontWeight.bold, marginTop: 2 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.title },

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

  chipsRow: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    paddingBottom: spacing[4],
  },
  chip: {
    height: 34, paddingHorizontal: 16, borderRadius: radii.pill,
    backgroundColor: colors.bg2, borderWidth: 1, borderColor: colors.border1,
    alignItems: 'center', justifyContent: 'center',
  },
  chipText: { color: colors.fg3, fontSize: 13, fontWeight: fontWeight.medium },
  chipTextActive: { color: '#fff', fontSize: 13, fontWeight: fontWeight.semibold },

  hero: {
    borderRadius: radii.xl, padding: spacing[5],
    marginBottom: spacing[4], overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(91,136,255,0.2)',
  },
  heroBadge: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
    marginBottom: spacing[3],
  },
  heroDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.primaryBlue,
  },
  heroBadgeText: {
    color: colors.primaryBlue, fontSize: fontSize.micro,
    fontWeight: fontWeight.semibold, letterSpacing: 0.5,
  },
  heroTitle: {
    color: colors.fg1, fontSize: 21, fontWeight: fontWeight.bold,
    lineHeight: 28, textAlign: 'right', marginBottom: spacing[2],
  },
  heroSub: {
    color: colors.fg3, fontSize: fontSize.caption,
    textAlign: 'right', marginBottom: spacing[4],
  },
  heroCta: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    alignSelf: 'flex-end', borderRadius: radii.pill,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  heroCtaText: { color: '#fff', fontWeight: fontWeight.semibold, fontSize: 13 },

  statsRow: {
    flexDirection: 'row-reverse', gap: spacing[2],
    marginBottom: spacing[5],
  },
  statCard: {
    flex: 1, backgroundColor: colors.bg1, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border1,
    padding: spacing[3], alignItems: 'flex-end',
  },
  statLabel: {
    color: colors.fg4, fontSize: 10,
    fontWeight: fontWeight.medium, marginBottom: 4,
  },
  statValue: {
    color: colors.fg1, fontSize: 18,
    fontWeight: fontWeight.bold,
  },
  statDelta: { fontSize: 10, marginTop: 2 },
  deltaUp: { color: colors.success },
  deltaNeutral: { color: colors.fg3 },

  sectionHeader: {
    flexDirection: 'row-reverse', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: spacing[3],
  },
  sectionTitle: {
    color: colors.fg1, fontSize: fontSize.headline,
    fontWeight: fontWeight.semibold,
  },
  seeAll: { color: colors.primaryBlue, fontSize: fontSize.caption, fontWeight: fontWeight.medium },
})
