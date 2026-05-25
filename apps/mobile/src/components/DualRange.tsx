import React, { useRef, useCallback } from 'react'
import { View, PanResponder, StyleSheet, Text } from 'react-native'
import { colors } from '../theme/tokens'
import { fonts } from '../theme/typography'

interface DualRangeProps {
  min: number
  max: number
  step: number
  valMin: number
  valMax: number
  onChange: (min: number, max: number) => void
  format: (n: number) => string
}

const THUMB = 22
const TRACK_H = 6

function snap(value: number, min: number, max: number, step: number): number {
  const snapped = Math.round((value - min) / step) * step + min
  return Math.max(min, Math.min(max, snapped))
}

export function DualRange({ min, max, step, valMin, valMax, onChange, format }: DualRangeProps) {
  const trackWidth = useRef(0)

  const pctMin = ((valMin - min) / (max - min)) * 100
  const pctMax = ((valMax - min) / (max - min)) * 100

  const minResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        if (!trackWidth.current) return
        const raw = min + (gs.moveX / trackWidth.current) * (max - min)
        const next = snap(raw, min, max, step)
        if (next < valMax - step) onChange(next, valMax)
      },
    })
  ).current

  const maxResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        if (!trackWidth.current) return
        const raw = min + (gs.moveX / trackWidth.current) * (max - min)
        const next = snap(raw, min, max, step)
        if (next > valMin + step) onChange(valMin, next)
      },
    })
  ).current

  const onLayout = useCallback((e: any) => {
    trackWidth.current = e.nativeEvent.layout.width
  }, [])

  return (
    <View>
      <View style={s.labels}>
        <Text style={s.val}>{format(valMin)}</Text>
        <Text style={s.dash}>—</Text>
        <Text style={s.val}>{format(valMax)}</Text>
      </View>

      <View style={s.trackWrap} onLayout={onLayout}>
        {/* base track */}
        <View style={s.track} />
        {/* fill */}
        <View style={[s.fill, { left: `${pctMin}%`, right: `${100 - pctMax}%` }]} />
        {/* min thumb */}
        <View
          {...minResponder.panHandlers}
          style={[s.thumb, { left: `${pctMin}%`, marginLeft: -(THUMB / 2) }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        />
        {/* max thumb */}
        <View
          {...maxResponder.panHandlers}
          style={[s.thumb, { left: `${pctMax}%`, marginLeft: -(THUMB / 2) }]}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        />
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    direction: 'ltr',
  } as any,
  val: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.fg1,
    fontFamily: fonts.bold,
    writingDirection: 'ltr',
  } as any,
  dash: {
    fontSize: 11,
    color: colors.fg3,
    fontWeight: '600',
  },
  trackWrap: {
    height: THUMB,
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_H,
    borderRadius: 999,
    backgroundColor: colors.bg3,
    top: (THUMB - TRACK_H) / 2,
  },
  fill: {
    position: 'absolute',
    height: TRACK_H,
    borderRadius: 999,
    backgroundColor: colors.accent,
    top: (THUMB - TRACK_H) / 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: 999,
    backgroundColor: colors.bg1,
    borderWidth: 2,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
})
