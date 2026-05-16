import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  StatusBar, TouchableOpacity, Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { colors, spacing, fontSize, radii, shadows } from '../theme/tokens'
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
  const [compareMode, setCompareMode] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const ctaAnim = useRef(new Animated.Value(0)).current

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

  useEffect(() => {
    Animated.spring(ctaAnim, {
      toValue: compareMode && selected.length >= 2 ? 1 : 0,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start()
  }, [compareMode, selected.length])

  function toggleSelect(id: string) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  function exitCompare() {
    setCompareMode(false)
    setSelected([])
  }

  const ctaTranslate = ctaAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 0],
  })

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.tintSaved} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={s.tintHeader}>
          <View style={s.headerRow}>
            <Text style={s.eyebrow}>השמורים שלך</Text>
            <TouchableOpacity
              style={[s.compareToggle, compareMode && s.compareToggleActive]}
              onPress={() => compareMode ? exitCompare() : setCompareMode(true)}
              activeOpacity={0.8}
            >
              <Text style={[s.compareToggleText, compareMode && s.compareToggleTextActive]}>
                {compareMode ? 'ביטול' : 'השווה'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={s.h1}>רכבים שאתה עוקב אחריהם</Text>

          <View style={s.statsCard}>
            <View style={s.statsMain}>
              <Text style={s.statsCount}>{cards.length}</Text>
              <View style={s.statsMeta}>
                <Text style={s.statsLabel}>רכבים שמורים</Text>
                <Text style={s.statsUpdated}>עדכון אחרון לפני 18 דק׳</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={s.sheet}>
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
                <Ionicons name="bookmark-outline" size={40} color={colors.accSaved} />
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
            <View style={s.listWrap}>
              {cards.map((l) => {
                const isSelected = selected.includes(l.id)
                return (
                  <TouchableOpacity
                    key={l.id}
                    activeOpacity={compareMode ? 0.85 : 1}
                    onPress={() => compareMode ? toggleSelect(l.id) : undefined}
                    style={[s.cardWrap, compareMode && isSelected && s.cardWrapSelected]}
                  >
                    {compareMode && isSelected && (
                      <View style={s.selectBadge}>
                        <Text style={s.selectBadgeText}>{selected.indexOf(l.id) + 1}</Text>
                      </View>
                    )}
                    <ListingCard
                      listing={l}
                      onPress={() => !compareMode && navigation.navigate('Detail', { listingId: l.id })}
                    />
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <Animated.View
        style={[s.compareCta, { transform: [{ translateY: ctaTranslate }] }]}
        pointerEvents={compareMode && selected.length >= 2 ? 'auto' : 'none'}
      >
        <TouchableOpacity style={s.compareCtaBtn} activeOpacity={0.9}>
          <Text style={s.compareCtaText}>השווה {selected.length} רכבים</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F2EA',
  },

  tintHeader: {
    backgroundColor: '#EDE5F0',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[7],
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  eyebrow: {
    color: '#6A468C',
    fontSize: fontSize.caption,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  compareToggle: {
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(106,70,140,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(106,70,140,0.20)',
  },
  compareToggleActive: {
    backgroundColor: '#6A468C',
    borderColor: '#6A468C',
  },
  compareToggleText: {
    color: '#6A468C',
    fontSize: fontSize.caption,
    fontFamily: fonts.semibold,
  },
  compareToggleTextActive: {
    color: '#FFFFFF',
  },
  h1: {
    color: '#1B1E1B',
    fontSize: 26,
    fontFamily: fonts.bold,
    textAlign: 'right',
    lineHeight: 34,
    marginBottom: spacing[4],
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 20,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    ...shadows.sm,
  },
  statsMain: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[3],
  },
  statsCount: {
    color: '#6A468C',
    fontSize: 40,
    fontFamily: fonts.bold,
    lineHeight: 46,
  },
  statsMeta: {
    gap: 2,
    alignItems: 'flex-end',
  },
  statsLabel: {
    color: '#1B1E1B',
    fontSize: fontSize.title,
    fontFamily: fonts.semibold,
  },
  statsUpdated: {
    color: '#7A7D7A',
    fontSize: fontSize.caption,
    fontFamily: fonts.regular,
  },

  sheet: {
    backgroundColor: '#F5F2EA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
    paddingTop: spacing[5],
    paddingHorizontal: spacing[4],
    minHeight: 200,
  },

  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },

  errorBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing[3],
    backgroundColor: '#F5EBD2',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(176,122,26,0.25)',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  errorText: {
    color: '#B07A1A',
    fontSize: fontSize.caption,
    fontFamily: fonts.regular,
  },
  retryLink: {
    color: '#2A5BB5',
    fontSize: fontSize.caption,
    fontFamily: fonts.semibold,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: spacing[4],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDE5F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(106,70,140,0.15)',
  },
  emptyTitle: {
    color: '#1B1E1B',
    fontSize: fontSize.headline,
    fontFamily: fonts.semibold,
  },
  emptySub: {
    color: '#7A7D7A',
    fontSize: fontSize.caption,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing[6],
  },
  browseBtn: {
    marginTop: spacing[2],
    backgroundColor: '#DCE6F5',
    borderRadius: radii.pill,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: '#2A5BB5',
  },
  browseBtnText: {
    color: '#2A5BB5',
    fontFamily: fonts.semibold,
    fontSize: fontSize.body,
  },

  listWrap: {
    gap: spacing[3],
  },
  cardWrap: {
    position: 'relative',
    borderRadius: 16,
  },
  cardWrapSelected: {
    borderWidth: 2,
    borderColor: '#2A5BB5',
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2A5BB5',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadows.sm,
  },
  selectBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.caption,
    fontFamily: fonts.bold,
  },

  compareCta: {
    position: 'absolute',
    bottom: 32,
    left: spacing[5],
    right: spacing[5],
    alignItems: 'center',
  },
  compareCtaBtn: {
    backgroundColor: '#2A5BB5',
    borderRadius: radii.pill,
    paddingHorizontal: 36,
    paddingVertical: 15,
    ...shadows.md,
  },
  compareCtaText: {
    color: '#FFFFFF',
    fontSize: fontSize.title,
    fontFamily: fonts.bold,
  },
})
