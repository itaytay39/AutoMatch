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
  { name: 'ראשי',   icon: 'home-outline',          iconActive: 'home' },
  { name: 'חיפוש',  icon: 'search-outline',        iconActive: 'search' },
  { name: 'שמורים', icon: 'bookmark-outline',      iconActive: 'bookmark' },
  { name: 'התראות', icon: 'notifications-outline', iconActive: 'notifications' },
]

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets  = useSafeAreaInsets()
  const savedIds = useSaved()
  const savedCount = savedIds.length
  const scaleAnims = useRef<Map<string, Animated.Value>>(new Map()).current

  return (
    <View style={[s.wrap, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {state.routes.map((route, i) => {
        const isFocused = state.index === i
        const tab = TABS.find(t => t.name === route.name) ?? TABS[0]
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
              <View>
                <Ionicons
                  name={isFocused ? tab.iconActive : tab.icon}
                  size={22}
                  color={isFocused ? colors.accent : colors.fg3}
                  style={{ opacity: isFocused ? 1 : 0.8 }}
                />
                {showBadge && (
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{savedCount > 99 ? '99+' : String(savedCount)}</Text>
                  </View>
                )}
              </View>
              <Text style={[s.label, isFocused && s.labelActive]}>
                {route.name}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingTop: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: '#ECE4D8',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  inner: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 14,
  },
  label: {
    fontSize: 10.5,
    fontFamily: fonts.medium,
    color: '#A39A8E',
    fontWeight: '500',
  },
  labelActive: {
    color: colors.accent,
    fontFamily: fonts.semibold,
    fontWeight: '700',
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
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: fonts.semibold,
    lineHeight: 12,
  },
})
