import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { colors, shadows } from '../theme/tokens'
import { fonts } from '../theme/typography'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: Record<string, { icon: IoniconName; iconActive: IoniconName }> = {
  'ראשי':    { icon: 'home-outline',          iconActive: 'home' },
  'חיפוש':   { icon: 'search-outline',        iconActive: 'search' },
  'שמורים':  { icon: 'bookmark-outline',      iconActive: 'bookmark' },
  'התראות':  { icon: 'notifications-outline', iconActive: 'notifications' },
}

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[s.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={s.pill}>
        {state.routes.map((route, i) => {
          const { options } = descriptors[route.key]
          const label = options.tabBarLabel as string ?? route.name
          const isFocused = state.index === i
          const icons = TAB_ICONS[route.name] ?? { icon: 'ellipse-outline', iconActive: 'ellipse' }

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name)
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={[s.tab, isFocused && s.tabActive]}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <Ionicons
                name={isFocused ? icons.iconActive : icons.icon}
                size={20}
                color={isFocused ? colors.onAccent : colors.fg3}
                style={isFocused ? undefined : { opacity: 0.9 }}
              />
              {isFocused && (
                <Text style={s.tabLabel}>{label}</Text>
              )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    minWidth: 44,
    justifyContent: 'center',
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
})
