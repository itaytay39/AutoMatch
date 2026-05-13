import React, { useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors, shadows } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { useSaved } from '../store/savedStore'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: Record<string, { icon: IoniconName; iconActive: IoniconName }> = {
  'ראשי':    { icon: 'home-outline',          iconActive: 'home' },
  'חיפוש':   { icon: 'search-outline',        iconActive: 'search' },
  'שמורים':  { icon: 'bookmark-outline',      iconActive: 'bookmark' },
  'התראות':  { icon: 'notifications-outline', iconActive: 'notifications' },
}

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const savedIds = useSaved()
  const savedCount = savedIds.length
  const scaleAnims = useRef<Map<string, Animated.Value>>(new Map()).current

  return (
    <View style={[s.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={s.pill}>
        {state.routes.map((route, i) => {
          const { options } = descriptors[route.key]
          const label = options.tabBarLabel as string ?? route.name
          const isFocused = state.index === i
          const icons = TAB_ICONS[route.name] ?? { icon: 'ellipse-outline', iconActive: 'ellipse' }

          if (!scaleAnims.has(route.key)) {
            scaleAnims.set(route.key, new Animated.Value(1))
          }
          const scaleAnim = scaleAnims.get(route.key)!

          const onPress = () => {
            Animated.sequence([
              Animated.spring(scaleAnim, { toValue: 0.84, useNativeDriver: true, tension: 300, friction: 7 }),
              Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, tension: 200, friction: 9 }),
            ]).start()
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name)
          }

          const showBadge = route.name === 'שמורים' && savedCount > 0

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={1}
              style={[s.tab, isFocused && s.tabActive]}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <Animated.View style={[s.tabInner, { transform: [{ scale: scaleAnim }] }]}>
              <View>
                <Ionicons
                  name={isFocused ? icons.iconActive : icons.icon}
                  size={20}
                  color={isFocused ? colors.onAccent : colors.fg3}
                  style={isFocused ? undefined : { opacity: 0.9 }}
                />
                {showBadge && !isFocused && (
                  <View style={s.badge}>
                    <Text style={s.badgeText}>{savedCount > 99 ? '99+' : String(savedCount)}</Text>
                  </View>
                )}
              </View>
              {isFocused && (
                <Text style={s.tabLabel}>{label}</Text>
              )}
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
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  pill: {
    backgroundColor: colors.bg1,
    borderRadius: 32,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border1,
    ...shadows.md,
  },
  tab: {
    borderRadius: 24,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  tabActive: {
    backgroundColor: colors.accent,
    paddingHorizontal: 18,
  },
  tabLabel: {
    color: colors.onAccent,
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: -0.1,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -7,
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
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: fonts.semibold,
    lineHeight: 12,
  },
})
