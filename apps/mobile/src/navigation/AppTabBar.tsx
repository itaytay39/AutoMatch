import React, { useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { useSaved } from '../store/savedStore'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const TABS: { name: string; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: 'פרופיל',  icon: 'person-outline',        iconActive: 'person'        },
  { name: 'התראות',  icon: 'notifications-outline',  iconActive: 'notifications' },
  { name: 'שמורים',  icon: 'heart-outline',          iconActive: 'heart'         },
  { name: 'חיפוש',   icon: 'search-outline',         iconActive: 'search'        },
  { name: 'בית',     icon: 'home-outline',           iconActive: 'home'          },
]

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets   = useSafeAreaInsets()
  const savedIds = useSaved()
  const savedCount = savedIds.length
  const scaleAnims = useRef<Map<string, Animated.Value>>(new Map()).current

  return (
    <View style={[s.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={s.pill}>
        {state.routes.map((route, i) => {
          const isFocused = state.index === i
          const tab = TABS.find(t => t.name === route.name) ?? TABS[TABS.length - 1]
          const showBadge = route.name === 'שמורים' && savedCount > 0

          if (!scaleAnims.has(route.key)) {
            scaleAnims.set(route.key, new Animated.Value(1))
          }
          const scaleAnim = scaleAnims.get(route.key)!

          const onPress = () => {
            Animated.sequence([
              Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, tension: 300, friction: 7 }),
              Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, tension: 200, friction: 9 }),
            ]).start()
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name)
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={s.tab}
            >
              <Animated.View style={[s.inner, { transform: [{ scale: scaleAnim }] }]}>
                <View style={s.iconWrap}>
                  <Ionicons
                    name={isFocused ? tab.iconActive : tab.icon}
                    size={22}
                    color={isFocused ? colors.fg1 : colors.fg3}
                  />
                  {showBadge && (
                    <View style={s.badge}>
                      <Text style={s.badgeText}>{savedCount > 99 ? '99+' : String(savedCount)}</Text>
                    </View>
                  )}
                </View>
                <Text style={[s.label, isFocused && s.labelActive]}>{route.name}</Text>
                {isFocused && <View style={s.activeDot} />}
              </Animated.View>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  pill: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    backgroundColor: 'rgba(18,23,30,0.88)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.50,
    shadowRadius: 24,
    elevation: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 6,
    position: 'relative',
  },
  iconWrap: { position: 'relative' },
  label: {
    fontSize: 10,
    fontFamily: fonts.medium,
    color: colors.fg3,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.fg1,
    fontFamily: fonts.semibold,
    fontWeight: '600',
  },
  activeDot: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.bg1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: fonts.semibold,
    lineHeight: 12,
  },
})
