import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Modal, Animated, Dimensions, ScrollView, TouchableWithoutFeedback,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, radii } from '../theme/tokens'
import { fonts } from '../theme/typography'

const { height: SH } = Dimensions.get('window')
const SHEET_H = SH * 0.82

export interface Filters {
  make?: string
  model?: string
  yearMin?: number
  yearMax?: number
  maxPrice?: number
  maxKm?: number
  city?: string
}

interface Props {
  visible: boolean
  initial: Filters
  onApply: (f: Filters) => void
  onClose: () => void
}

const YEAR_NOW = new Date().getFullYear()
const YEARS = Array.from({ length: YEAR_NOW - 1994 }, (_, i) => YEAR_NOW - i)

const CITIES = [
  'תל אביב', 'חיפה', 'ירושלים', 'ראשון לציון', 'פתח תקווה', 'אשדוד',
  'נתניה', 'באר שבע', 'רמת גן', 'הרצליה', 'חולון', 'רחובות', 'מודיעין',
  'קריית ביאליק', 'קריית מוצקין', 'קריית אתא', 'אילת', 'נס ציונה', 'לוד',
]

const PRICE_PRESETS = [
  { label: 'עד 60K',  value: 60000 },
  { label: 'עד 100K', value: 100000 },
  { label: 'עד 150K', value: 150000 },
  { label: 'עד 200K', value: 200000 },
]

const KM_PRESETS = [
  { label: 'עד 50K',  value: 50000 },
  { label: 'עד 100K', value: 100000 },
  { label: 'עד 150K', value: 150000 },
  { label: 'עד 200K', value: 200000 },
]

function countActive(f: Filters) {
  return [f.make, f.model, f.yearMin, f.yearMax, f.maxPrice, f.maxKm, f.city]
    .filter(v => v !== undefined && v !== '').length
}

export function FilterSheet({ visible, initial, onApply, onClose }: Props) {
  const insets = useSafeAreaInsets()
  const slideY = useRef(new Animated.Value(SHEET_H)).current
  const [f, setF] = useState<Filters>(initial)

  useEffect(() => {
    if (visible) {
      setF(initial)
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start()
    } else {
      Animated.timing(slideY, { toValue: SHEET_H, useNativeDriver: true, duration: 260 }).start()
    }
  }, [visible])

  const set = (key: keyof Filters, val: any) => setF(prev => ({ ...prev, [key]: val || undefined }))

  const reset = () => setF({})
  const apply = () => { onApply(f); onClose() }
  const active = countActive(f)

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View style={[s.sheet, { transform: [{ translateY: slideY }], paddingBottom: insets.bottom + 16 }]}>
        {/* Handle */}
        <View style={s.handle} />

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={reset} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[s.headerAction, { color: active > 0 ? colors.danger : colors.fg4 }]}>איפוס</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>סינון רכבים</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={20} color={colors.fg2} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">

            {/* Make + Model */}
            <Section title="יצרן ודגם">
              <Row>
                <FilterInput
                  placeholder="יצרן (Toyota, Kia...)"
                  value={f.make ?? ''}
                  onChangeText={v => set('make', v)}
                />
                <FilterInput
                  placeholder="דגם"
                  value={f.model ?? ''}
                  onChangeText={v => set('model', v)}
                />
              </Row>
            </Section>

            {/* Price */}
            <Section title="מחיר">
              <ChipRow>
                {PRICE_PRESETS.map(p => (
                  <Chip
                    key={p.value}
                    label={p.label}
                    active={f.maxPrice === p.value}
                    onPress={() => set('maxPrice', f.maxPrice === p.value ? undefined : p.value)}
                  />
                ))}
              </ChipRow>
              <FilterInput
                placeholder="מחיר מקסימום מותאם אישית (₪)"
                value={f.maxPrice?.toString() ?? ''}
                onChangeText={v => set('maxPrice', v ? Number(v.replace(/\D/g, '')) : undefined)}
                keyboardType="numeric"
              />
            </Section>

            {/* KM */}
            <Section title="קילומטרים">
              <ChipRow>
                {KM_PRESETS.map(p => (
                  <Chip
                    key={p.value}
                    label={p.label}
                    active={f.maxKm === p.value}
                    onPress={() => set('maxKm', f.maxKm === p.value ? undefined : p.value)}
                  />
                ))}
              </ChipRow>
            </Section>

            {/* Year */}
            <Section title="שנה">
              <Row>
                <YearPicker
                  label="משנת"
                  value={f.yearMin}
                  years={YEARS}
                  onSelect={y => set('yearMin', y)}
                />
                <YearPicker
                  label="עד שנת"
                  value={f.yearMax}
                  years={YEARS}
                  onSelect={y => set('yearMax', y)}
                />
              </Row>
            </Section>

            {/* City */}
            <Section title="עיר">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cityRow}>
                {CITIES.map(city => (
                  <Chip
                    key={city}
                    label={city}
                    active={f.city === city}
                    onPress={() => set('city', f.city === city ? undefined : city)}
                  />
                ))}
              </ScrollView>
            </Section>

          </ScrollView>
        </KeyboardAvoidingView>

        {/* Apply CTA */}
        <View style={s.ctaWrap}>
          <TouchableOpacity style={s.applyBtn} onPress={apply} activeOpacity={0.88}>
            <Text style={s.applyText}>
              {active > 0 ? `הצג תוצאות (${active} פילטרים)` : 'הצג את כל הרכבים'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  )
}

// ── Sub-components ────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sec.wrap}>
      <Text style={sec.title}>{title}</Text>
      {children}
    </View>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={{ flexDirection: 'row-reverse', gap: spacing[3] }}>{children}</View>
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[3] }}>
      {children}
    </View>
  )
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[chip.base, active && chip.active]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {active && <Ionicons name="checkmark" size={11} color="#fff" />}
      <Text style={[chip.label, active && chip.labelActive]}>{label}</Text>
    </TouchableOpacity>
  )
}

function FilterInput(props: {
  placeholder: string; value: string
  onChangeText: (v: string) => void; keyboardType?: 'default' | 'numeric'
}) {
  return (
    <TextInput
      style={fi.input}
      placeholder={props.placeholder}
      placeholderTextColor={colors.fg4}
      value={props.value}
      onChangeText={props.onChangeText}
      textAlign="right"
      keyboardType={props.keyboardType ?? 'default'}
      autoCorrect={false}
    />
  )
}

function YearPicker({ label, value, years, onSelect }: {
  label: string; value?: number; years: number[]; onSelect: (y: number | undefined) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={yp.btn} onPress={() => setOpen(o => !o)} activeOpacity={0.8}>
        <Ionicons name="chevron-down" size={14} color={colors.fg3} />
        <Text style={[yp.label, value && yp.labelActive]}>
          {value ? String(value) : label}
        </Text>
      </TouchableOpacity>
      {open && (
        <View style={yp.dropdown}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
            <TouchableOpacity style={yp.option} onPress={() => { onSelect(undefined); setOpen(false) }}>
              <Text style={yp.optText}>ללא הגבלה</Text>
            </TouchableOpacity>
            {years.map(y => (
              <TouchableOpacity
                key={y} style={[yp.option, value === y && yp.optActive]}
                onPress={() => { onSelect(y); setOpen(false) }}
              >
                <Text style={[yp.optText, value === y && yp.optTextActive]}>{y}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

// ── Styles ────────────────────────────────────────────────────

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SHEET_H,
    backgroundColor: colors.bg1,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderWidth: 0.5, borderColor: colors.border2,
  },
  handle: {
    alignSelf: 'center', width: 36, height: 4,
    borderRadius: 2, backgroundColor: colors.border2, marginTop: 10,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing[4], paddingVertical: spacing[4],
    borderBottomWidth: 0.5, borderBottomColor: colors.border1,
  },
  headerTitle: { color: colors.fg1, fontSize: fontSize.title, fontFamily: fonts.bold },
  headerAction: { fontSize: fontSize.body, fontFamily: fonts.medium },
  body: { paddingHorizontal: spacing[4], paddingTop: spacing[4], paddingBottom: spacing[4] },
  cityRow: { flexDirection: 'row-reverse', gap: spacing[2], paddingBottom: 4 },
  ctaWrap: {
    paddingHorizontal: spacing[4], paddingTop: spacing[3],
    borderTopWidth: 0.5, borderTopColor: colors.border1,
  },
  applyBtn: {
    backgroundColor: colors.accent, borderRadius: radii.md,
    height: 52, alignItems: 'center', justifyContent: 'center',
  },
  applyText: { color: '#fff', fontFamily: fonts.bold, fontSize: fontSize.title },
})

const sec = StyleSheet.create({
  wrap: { marginBottom: spacing[5] },
  title: { color: colors.fg2, fontSize: fontSize.caption, fontFamily: fonts.semibold, textAlign: 'right', marginBottom: spacing[3] },
})

const chip = StyleSheet.create({
  base: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radii.pill,
    backgroundColor: colors.bg2, borderWidth: 0.5, borderColor: colors.border2,
  },
  active: { backgroundColor: colors.accent, borderColor: colors.accent },
  label: { color: colors.fg2, fontSize: 12, fontFamily: fonts.medium },
  labelActive: { color: '#fff', fontFamily: fonts.semibold },
})

const fi = StyleSheet.create({
  input: {
    flex: 1, backgroundColor: colors.bg2, borderRadius: radii.md,
    borderWidth: 0.5, borderColor: colors.border2,
    paddingHorizontal: spacing[4], height: 46,
    color: colors.fg1, fontSize: fontSize.body, fontFamily: fonts.regular,
    marginBottom: spacing[3],
  },
})

const yp = StyleSheet.create({
  btn: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
    backgroundColor: colors.bg2, borderRadius: radii.md,
    borderWidth: 0.5, borderColor: colors.border2,
    paddingHorizontal: spacing[3], height: 46,
    marginBottom: spacing[3],
  },
  label: { flex: 1, color: colors.fg3, fontSize: fontSize.body, textAlign: 'right', fontFamily: fonts.regular },
  labelActive: { color: colors.fg1, fontFamily: fonts.medium },
  dropdown: {
    position: 'absolute', top: 50, left: 0, right: 0, zIndex: 100,
    backgroundColor: colors.bg1, borderRadius: radii.md,
    borderWidth: 0.5, borderColor: colors.border2,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  option: { paddingHorizontal: spacing[4], paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border1 },
  optActive: { backgroundColor: colors.accentSoft },
  optText: { color: colors.fg2, fontSize: fontSize.body, textAlign: 'right', fontFamily: fonts.regular },
  optTextActive: { color: colors.accent, fontFamily: fonts.semibold },
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
    width: 40, height: 40, borderRadius: radii.md,
    backgroundColor: colors.bg1, borderWidth: 0.5, borderColor: colors.border2,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 9, fontFamily: fonts.bold },
})
