import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Animated, Dimensions, ScrollView, TouchableWithoutFeedback,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, radii, shadows } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { DualRange } from './DualRange'

const { height: SH } = Dimensions.get('window')
const SHEET_TOP = 40

export interface Filters {
  make?: string
  model?: string
  yearMin?: number
  yearMax?: number
  maxPrice?: number
  minPrice?: number
  maxKm?: number
  city?: string
  body?: string[]
  fuel?: string[]
  hand?: number | 'any'
  region?: string[]
}

interface Props {
  visible: boolean
  initial: Filters
  resultCount?: number
  onApply: (f: Filters) => void
  onClose: () => void
}

export function countActive(f: Filters): number {
  let n = 0
  if (f.make) n++
  if (f.model) n++
  if (f.yearMin) n++
  if (f.yearMax) n++
  if (f.minPrice) n++
  if (f.maxPrice) n++
  if (f.maxKm) n++
  if (f.city) n++
  if (f.body && f.body.length > 0) n++
  if (f.fuel && f.fuel.length > 0) n++
  if (f.hand !== undefined && f.hand !== 'any') n++
  if (f.region && f.region.length > 0) n++
  return n
}

const BODY_TYPES = ['סדאן', 'האצ\'בק', 'קרוסאובר', 'סטיישן']
const FUEL_TYPES = ['בנזין', 'היברידי', 'חשמלי', 'דיזל']
const REGIONS = ['צפון', 'מרכז', 'ירושלים', 'דרום']

const PRICE_STEPS = [30000, 60000, 90000, 120000, 150000, 180000, 210000, 240000, 270000, 300000]
const YEAR_STEPS = Array.from({ length: 16 }, (_, i) => 2010 + i)
const KM_STEPS = [20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000, 180000, 200000, 220000, 240000, 260000, 280000, 300000]

const HAND_OPTIONS: { label: string; value: number | 'any' }[] = [
  { label: 'הכל', value: 'any' },
  { label: 'יד 1', value: 1 },
  { label: 'יד 2', value: 2 },
  { label: 'יד 3+', value: 3 },
]

function fmtPrice(v: number) {
  return `₪${Math.round(v / 1000)}K`
}

function fmtKm(v: number) {
  return `${Math.round(v / 1000)}ק״מ`
}

export function FilterSheet({ visible, initial, resultCount, onApply, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const slideY = useRef(new Animated.Value(SH)).current
  const [f, setF] = useState<Filters>(initial)

  useEffect(() => {
    if (visible) {
      setF(initial)
      Animated.spring(slideY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 12,
      }).start()
    } else {
      Animated.timing(slideY, {
        toValue: SH,
        useNativeDriver: true,
        duration: 280,
      }).start()
    }
  }, [visible])

  const set = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setF(prev => ({ ...prev, [key]: val }))

  const toggleArr = (key: 'body' | 'fuel' | 'region', val: string) => {
    setF(prev => {
      const arr: string[] = (prev[key] as string[]) ?? []
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val],
      }
    })
  }

  const reset = () => setF({})
  const apply = () => { onApply(f); onClose() }
  const active = countActive(f)

  const totalSections = 7
  const filledSections = [
    f.body && f.body.length > 0,
    f.fuel && f.fuel.length > 0,
    f.minPrice || f.maxPrice,
    f.yearMin || f.yearMax,
    f.maxKm,
    f.hand !== undefined && f.hand !== 'any',
    f.region && f.region.length > 0,
  ].filter(Boolean).length
  const progress = filledSections / totalSections

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          s.sheet,
          shadows.lg,
          { transform: [{ translateY: slideY }], paddingBottom: insets.bottom + 16, top: SHEET_TOP },
        ]}
      >
        <View style={s.handle} />

        <View style={s.header}>
          <TouchableOpacity
            onPress={active > 0 ? reset : undefined}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[s.headerReset, { color: active > 0 ? colors.accent : colors.fg4 }]}>
              איפוס
            </Text>
          </TouchableOpacity>

          <Text style={s.headerTitle}>סינון</Text>

          <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.75}>
            <Ionicons name="close" size={18} color={colors.fg2} />
          </TouchableOpacity>
        </View>

        <View style={s.progressTrack}>
          <Animated.View style={[s.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.body}
          keyboardShouldPersistTaps="handled"
        >
          <Section title="סוג רכב">
            <ChipGroup>
              {BODY_TYPES.map(item => (
                <Chip
                  key={item}
                  label={item}
                  active={(f.body ?? []).includes(item)}
                  onPress={() => toggleArr('body', item)}
                />
              ))}
            </ChipGroup>
          </Section>

          <Section title="סוג מנוע">
            <ChipGroup>
              {FUEL_TYPES.map(item => (
                <Chip
                  key={item}
                  label={item}
                  active={(f.fuel ?? []).includes(item)}
                  onPress={() => toggleArr('fuel', item)}
                />
              ))}
            </ChipGroup>
          </Section>

          <Section title="טווח מחיר">
            <DualRange
              min={30000}
              max={300000}
              step={5000}
              valMin={f.minPrice ?? 30000}
              valMax={f.maxPrice ?? 300000}
              onChange={(mn, mx) => { set('minPrice', mn); set('maxPrice', mx) }}
              format={fmtPrice}
            />
          </Section>

          <Section title="שנת ייצור">
            <DualRange
              min={2010}
              max={2025}
              step={1}
              valMin={f.yearMin ?? 2010}
              valMax={f.yearMax ?? 2025}
              onChange={(mn, mx) => { set('yearMin', mn); set('yearMax', mx) }}
              format={String}
            />
          </Section>

          <Section title="קילומטראז'">
            <RangePresets
              label="מקסימום ק״מ"
              value={f.maxKm}
              steps={KM_STEPS}
              format={fmtKm}
              onSelect={v => set('maxKm', v)}
            />
          </Section>

          <Section title="יד">
            <View style={s.handRow}>
              {HAND_OPTIONS.map(opt => {
                const cur = f.hand ?? 'any'
                const isActive = cur === opt.value
                return (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[s.handBtn, isActive && s.handBtnActive]}
                    onPress={() => set('hand', opt.value)}
                    activeOpacity={0.75}
                  >
                    <Text style={[s.handLabel, isActive && s.handLabelActive]}>{opt.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </Section>

          <Section title="אזור">
            <ChipGroup>
              {REGIONS.map(item => (
                <Chip
                  key={item}
                  label={item}
                  active={(f.region ?? []).includes(item)}
                  onPress={() => toggleArr('region', item)}
                />
              ))}
            </ChipGroup>
          </Section>
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity style={s.ctaBtn} onPress={apply} activeOpacity={0.85}>
            <Text style={s.ctaText}>
              {resultCount !== undefined
                ? `הצג ${resultCount} תוצאות`
                : 'הצג את כל הרכבים'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sec.wrap}>
      <Text style={sec.title}>{title}</Text>
      {children}
    </View>
  )
}

function ChipGroup({ children }: { children: React.ReactNode }) {
  return (
    <View style={cg.row}>
      {children}
    </View>
  )
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[chip.base, active && chip.active]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      <Text style={[chip.label, active && chip.labelActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

function RangePresets({
  label,
  value,
  steps,
  format,
  onSelect,
}: {
  label: string
  value?: number
  steps: number[]
  format: (v: number) => string
  onSelect: (v: number | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <View style={rp.wrap}>
      <TouchableOpacity
        style={rp.trigger}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.fg3}
        />
        <Text style={[rp.triggerText, value !== undefined && rp.triggerTextActive]}>
          {value !== undefined ? format(value) : label}
        </Text>
      </TouchableOpacity>
      {open && (
        <View style={rp.dropdown}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
            <TouchableOpacity
              style={rp.option}
              onPress={() => { onSelect(undefined); setOpen(false) }}
            >
              <Text style={rp.optText}>ללא הגבלה</Text>
            </TouchableOpacity>
            {steps.map(v => (
              <TouchableOpacity
                key={v}
                style={[rp.option, value === v && rp.optActive]}
                onPress={() => { onSelect(v); setOpen(false) }}
              >
                <Text style={[rp.optText, value === v && rp.optTextActive]}>{format(v)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27,30,27,0.32)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg1,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.fg4,
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  headerTitle: {
    color: colors.fg1,
    fontSize: 22,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  headerReset: {
    fontSize: fontSize.body,
    fontFamily: fonts.medium,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.bg2,
    marginHorizontal: 0,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 12,
  },
  handRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  handBtn: {
    flex: 1,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.bg1,
    borderWidth: 1,
    borderColor: colors.border2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  handLabel: {
    color: colors.fg1,
    fontSize: fontSize.body,
    fontFamily: fonts.medium,
  },
  handLabelActive: {
    color: colors.onAccent,
    fontFamily: fonts.semibold,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border1,
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 22,
  },
  ctaBtn: {
    backgroundColor: colors.accent,
    borderRadius: radii.pill,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: colors.onAccent,
    fontSize: fontSize.title,
    fontFamily: fonts.bold,
  },
})

const sec = StyleSheet.create({
  wrap: {
    marginBottom: 24,
  },
  title: {
    color: colors.fg2,
    fontSize: fontSize.caption,
    fontFamily: fonts.semibold,
    textAlign: 'right',
    marginBottom: 10,
  },
})

const cg = StyleSheet.create({
  row: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
})

const chip = StyleSheet.create({
  base: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.bg1,
    borderWidth: 1,
    borderColor: colors.border2,
  },
  active: {
    backgroundColor: colors.fg1,
    borderColor: colors.fg1,
  },
  label: {
    color: colors.fg1,
    fontSize: fontSize.body,
    fontFamily: fonts.medium,
  },
  labelActive: {
    color: '#fff',
    fontFamily: fonts.semibold,
  },
})

const rp = StyleSheet.create({
  wrap: {
    marginBottom: 10,
    zIndex: 10,
  },
  trigger: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border2,
    paddingHorizontal: 14,
    height: 46,
  },
  triggerText: {
    flex: 1,
    color: colors.fg3,
    fontSize: fontSize.body,
    fontFamily: fonts.regular,
    textAlign: 'right',
  },
  triggerTextActive: {
    color: colors.fg1,
    fontFamily: fonts.medium,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: colors.bg1,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border2,
    ...shadows.md,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border1,
  },
  optActive: {
    backgroundColor: colors.accentSoft,
  },
  optText: {
    color: colors.fg2,
    fontSize: fontSize.body,
    fontFamily: fonts.regular,
    textAlign: 'right',
  },
  optTextActive: {
    color: colors.accent,
    fontFamily: fonts.semibold,
  },
})

export function FilterBadge({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <TouchableOpacity style={fb.btn} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="options-outline" size={16} color={count > 0 ? colors.accent : colors.fg2} />
      {count > 0 && (
        <View style={fb.badge}>
          <Text style={fb.badgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const fb = StyleSheet.create({
  btn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.bg1,
    borderWidth: 1,
    borderColor: colors.border2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.onAccent,
    fontSize: 9,
    fontFamily: fonts.bold,
  },
})
