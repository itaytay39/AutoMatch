import React, { useEffect, useRef } from 'react'
import { View, Animated, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, radii } from '../theme/tokens'

const SHIMMER_W = 400

export function SkeletonRow({
  width,
  height,
  style,
}: {
  width?: number | string
  height: number
  style?: object
}) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      })
    ).start()
  }, [anim])

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SHIMMER_W, SHIMMER_W],
  })

  return (
    <View
      style={[
        {
          width: width ?? '100%',
          height,
          borderRadius: 6,
          backgroundColor: colors.bg2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[StyleSheet.absoluteFillObject, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={[colors.bg2, colors.bg3, colors.bg2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: SHIMMER_W, height: '100%' }}
        />
      </Animated.View>
    </View>
  )
}

export function SkeletonCard() {
  return (
    <View style={s.card}>
      <SkeletonRow height={168} style={{ borderRadius: radii.xl, marginBottom: 12 }} />
      <View style={{ paddingHorizontal: 4 }}>
        <SkeletonRow height={12} width="60%" style={{ marginBottom: 8 }} />
        <SkeletonRow height={18} width="80%" style={{ marginBottom: 10 }} />
        <SkeletonRow height={12} width="40%" style={{ marginBottom: 12 }} />
        <View style={s.row}>
          <SkeletonRow height={22} width={80} />
          <SkeletonRow height={14} width={50} />
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
