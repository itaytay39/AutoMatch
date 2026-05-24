import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radii, shadows } from '../theme/tokens'
import { fonts } from '../theme/typography'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

interface EmptyStateProps {
  icon: IoniconName
  title: string
  subtitle?: string
  action?: () => void
  actionLabel?: string
}

export function EmptyState({ icon, title, subtitle, action, actionLabel }: EmptyStateProps) {
  return (
    <View style={s.wrap}>
      <View style={s.iconBadge}>
        <Ionicons name={icon} size={28} color={colors.accent} />
      </View>
      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
      {action && actionLabel ? (
        <TouchableOpacity style={s.btn} onPress={action} activeOpacity={0.8}>
          <Text style={s.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: colors.fg1,
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.fg3,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.lg,
    backgroundColor: colors.fg1,
    ...shadows.sm,
  },
  btnText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: '#fff',
  },
})
