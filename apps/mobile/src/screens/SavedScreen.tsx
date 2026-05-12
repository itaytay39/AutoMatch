import React, { useEffect, useState, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  StatusBar, TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { colors, spacing, fontSize, radii } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { ListingCard } from '../components/ListingCard'
import { useSaved } from '../store/savedStore'
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

export function SavedScreen() {
  const navigation = useNavigation<Nav>()
  const savedIds = useSaved()
  const [cards, setCards] = useState<ReturnType<typeof toCard>[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const fetchSaved = useCallback(async () => {
    const ids = [...savedIds]
    if (ids.length === 0) { setCards([]); return }
    setLoading(true)
    setError(false)
    try {
      const results = await Promise.allSettled(ids.map(id => api.getListing(id)))
      const listings = results
        .filter(r => r.status === 'fulfilled')
        .map(r => toCard((r as PromiseFulfilledResult<any>).value))
      setCards(listings)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [savedIds])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg0} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={s.pad}>

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>שמורים</Text>
            {cards.length > 0 && (
              <View style={s.countBadge}>
                <Text style={s.countText}>{cards.length}</Text>
              </View>
            )}
          </View>
          <Text style={s.sub}>רכבים שסימנת למעקב</Text>

          {error && !loading && (
            <View style={s.errorBanner}>
              <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
              <Text style={s.errorText}>בעיית חיבור — </Text>
              <TouchableOpacity onPress={fetchSaved}>
                <Text style={s.retryLink}>נסה שוב</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : cards.length === 0 && !error ? (
            <View style={s.emptyState}>
              <View style={s.emptyIcon}>
                <Ionicons name="heart-outline" size={40} color={colors.fg3} />
              </View>
              <Text style={s.emptyTitle}>אין רכבים שמורים</Text>
              <Text style={s.emptySub}>לחץ על ♥ בכרטיס רכב כדי לשמור אותו כאן</Text>
              <TouchableOpacity
                style={s.browseBtn}
                onPress={() => navigation.navigate('Main')}
                activeOpacity={0.85}
              >
                <Text style={s.browseBtnText}>גלוש ברכבים</Text>
              </TouchableOpacity>
            </View>
          ) : (
            cards.map(l => (
              <ListingCard
                key={l.id}
                listing={l}
                onPress={() => navigation.navigate('Detail', { listingId: l.id })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },
  pad: { paddingHorizontal: spacing[4] },

  header: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: spacing[2],
    marginTop: spacing[5], marginBottom: spacing[1],
  },
  title: { color: colors.fg1, fontSize: 24, fontFamily: fonts.bold, letterSpacing: -0.3 },
  countBadge: {
    backgroundColor: colors.accentSoft, borderRadius: radii.pill,
    paddingHorizontal: 9, paddingVertical: 3,
    borderWidth: 0.5, borderColor: colors.accent,
  },
  countText: { color: colors.accent, fontSize: fontSize.micro, fontFamily: fonts.bold },
  sub: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'right', marginBottom: spacing[5] },

  loadingWrap: { paddingVertical: 48, alignItems: 'center' },

  errorBanner: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
    marginBottom: spacing[3],
    backgroundColor: '#2A1A08', borderRadius: radii.md,
    borderWidth: 0.5, borderColor: 'rgba(217,119,6,0.3)',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
  },
  errorText: { color: colors.warning, fontSize: fontSize.caption, fontFamily: fonts.regular },
  retryLink: { color: colors.accent, fontSize: fontSize.caption, fontFamily: fonts.semibold },

  emptyState: { alignItems: 'center', paddingVertical: 64, gap: spacing[4] },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.bg2, alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: colors.border2,
  },
  emptyTitle: { color: colors.fg1, fontSize: fontSize.headline, fontFamily: fonts.semibold },
  emptySub: {
    color: colors.fg3, fontSize: fontSize.caption,
    textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing[6],
  },
  browseBtn: {
    marginTop: spacing[2],
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 24, paddingVertical: 12,
    borderWidth: 0.5, borderColor: colors.accent,
  },
  browseBtnText: { color: colors.accent, fontFamily: fonts.semibold, fontSize: fontSize.body },
})
