import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { colors, radii } from '../theme/tokens'

function SkeletonBox({ width, height, style }: { width?: number | string; height: number; style?: object }) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start()
  }, [anim])

  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] })

  return (
    <Animated.View
      style={[
        { width: width ?? '100%', height, borderRadius: 6, backgroundColor: colors.border2 },
        { opacity },
        style,
      ]}
    />
  )
}

export function SkeletonCard() {
  return (
    <View style={s.card}>
      <SkeletonBox height={168} style={{ borderRadius: radii.xl, marginBottom: 12 }} />
      <View style={{ paddingHorizontal: 4 }}>
        <SkeletonBox height={12} width="60%" style={{ marginBottom: 8 }} />
        <SkeletonBox height={18} width="80%" style={{ marginBottom: 10 }} />
        <SkeletonBox height={12} width="40%" style={{ marginBottom: 12 }} />
        <View style={s.row}>
          <SkeletonBox height={22} width={80} />
          <SkeletonBox height={14} width={50} />
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bg1,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border1,
    padding: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
})
