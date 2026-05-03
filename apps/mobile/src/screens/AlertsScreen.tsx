import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight, radii, gradients } from '../theme/tokens'

interface Alert {
  id: string
  make?: string
  model?: string
  yearMin?: number
  maxPrice?: number
  maxKm?: number
  city?: string
}

const MOCK_ALERTS: Alert[] = [
  { id: '1', make: 'טויוטה', model: 'קורולה', yearMin: 2019, maxPrice: 140000, city: 'תל אביב' },
  { id: '2', make: 'קיה', model: 'סטוניק', yearMin: 2018, maxPrice: 100000, maxKm: 80000 },
]

const FIELDS: { key: keyof typeof EMPTY_FORM; label: string; numeric?: boolean }[] = [
  { key: 'make',     label: 'יצרן (טויוטה, קיה...)' },
  { key: 'model',    label: 'דגם' },
  { key: 'maxPrice', label: 'מחיר מקסימום (₪)', numeric: true },
  { key: 'maxKm',    label: 'קילומטרים מקסימום', numeric: true },
  { key: 'city',     label: 'עיר' },
]

const EMPTY_FORM = { make: '', model: '', maxPrice: '', maxKm: '', city: '' }

export function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  function addAlert() {
    if (!form.make) return
    setAlerts(prev => [...prev, {
      id: Date.now().toString(),
      make: form.make || undefined,
      model: form.model || undefined,
      maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
      maxKm: form.maxKm ? Number(form.maxKm) : undefined,
      city: form.city || undefined,
    }])
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  function deleteAlert(id: string) {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.pad}>
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>התראות</Text>
            <View style={s.countBadge}>
              <Text style={s.countText}>{alerts.length}</Text>
            </View>
          </View>
          <Text style={s.sub}>קבל התראה מיידית כשרכב תואם מתפרסם</Text>

          {/* Alert cards */}
          {alerts.map(alert => (
            <View key={alert.id} style={s.alertCard}>
              <View style={s.alertTop}>
                <TouchableOpacity style={s.deleteBtn} onPress={() => deleteAlert(alert.id)}>
                  <Ionicons name="close" size={16} color={colors.fg3} />
                </TouchableOpacity>
                <View style={s.alertIcon}>
                  <Ionicons name="notifications" size={16} color={colors.primaryBlue} />
                </View>
                <Text style={s.alertTitle}>{alert.make} {alert.model}</Text>
              </View>
              <View style={s.tagsRow}>
                {alert.yearMin && (
                  <View style={s.tag}>
                    <Ionicons name="calendar-outline" size={11} color={colors.fg3} />
                    <Text style={s.tagText}>משנת {alert.yearMin}</Text>
                  </View>
                )}
                {alert.maxPrice && (
                  <View style={s.tag}>
                    <Ionicons name="cash-outline" size={11} color={colors.fg3} />
                    <Text style={s.tagText}>עד ₪{alert.maxPrice.toLocaleString()}</Text>
                  </View>
                )}
                {alert.maxKm && (
                  <View style={s.tag}>
                    <Ionicons name="speedometer-outline" size={11} color={colors.fg3} />
                    <Text style={s.tagText}>עד {alert.maxKm.toLocaleString()} ק״מ</Text>
                  </View>
                )}
                {alert.city && (
                  <View style={s.tag}>
                    <Ionicons name="location-outline" size={11} color={colors.fg3} />
                    <Text style={s.tagText}>{alert.city}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Add form */}
          {showForm ? (
            <View style={s.form}>
              <Text style={s.formTitle}>התראה חדשה</Text>
              {FIELDS.map(field => (
                <View key={field.key} style={s.fieldWrap}>
                  <TextInput
                    style={s.input}
                    placeholder={field.label}
                    placeholderTextColor={colors.fg4}
                    value={form[field.key]}
                    onChangeText={v => setForm(p => ({ ...p, [field.key]: v }))}
                    textAlign="right"
                    keyboardType={field.numeric ? 'numeric' : 'default'}
                  />
                </View>
              ))}
              <View style={s.formBtns}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowForm(false); setForm(EMPTY_FORM) }}>
                  <Text style={s.cancelText}>ביטול</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtnWrap} onPress={addAlert}>
                  <LinearGradient colors={gradients.primary} style={s.saveBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={s.saveText}>שמור</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setShowForm(true)} activeOpacity={0.85} style={s.addBtnWrap}>
              <LinearGradient colors={gradients.primary} style={s.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={s.addText}>הוסף התראה חדשה</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Empty state */}
          {alerts.length === 0 && !showForm && (
            <View style={s.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.fg4} />
              <Text style={s.emptyTitle}>אין התראות פעילות</Text>
              <Text style={s.emptySub}>הוסף התראה כדי לקבל עדכונים על רכבים שמתאימים לך</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },
  pad: { paddingHorizontal: spacing[4] },

  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[4],
    marginBottom: spacing[1],
  },
  title: { color: colors.fg1, fontSize: fontSize.display2, fontWeight: fontWeight.bold },
  countBadge: {
    backgroundColor: colors.primaryBlue,
    borderRadius: radii.pill,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  countText: { color: '#fff', fontSize: fontSize.micro, fontWeight: fontWeight.bold },
  sub: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'right', marginBottom: spacing[5] },

  alertCard: {
    backgroundColor: colors.bg1,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border1,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  alertTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  alertIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(91,136,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  alertTitle: {
    flex: 1, color: colors.fg1,
    fontSize: fontSize.title, fontWeight: fontWeight.semibold,
    textAlign: 'right',
  },
  deleteBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },
  tagsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing[2] },
  tag: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg2,
    borderRadius: radii.pill,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  tagText: { color: colors.fg2, fontSize: fontSize.caption },

  form: {
    backgroundColor: colors.bg1,
    borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border1,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  formTitle: {
    color: colors.fg1, fontSize: fontSize.title,
    fontWeight: fontWeight.semibold, textAlign: 'right',
    marginBottom: spacing[4],
  },
  fieldWrap: { marginBottom: spacing[3] },
  input: {
    backgroundColor: colors.bg2,
    borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border1,
    color: colors.fg1,
    paddingHorizontal: spacing[4],
    height: 48,
    fontSize: fontSize.body,
  },
  formBtns: { flexDirection: 'row-reverse', gap: spacing[3], marginTop: spacing[2] },
  saveBtnWrap: { flex: 1 },
  saveBtn: {
    borderRadius: radii.pill, height: 48,
    flexDirection: 'row-reverse',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  saveText: { color: '#fff', fontWeight: fontWeight.semibold, fontSize: fontSize.body },
  cancelBtn: {
    borderRadius: radii.pill, height: 48,
    paddingHorizontal: 20,
    backgroundColor: colors.bg2,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { color: colors.fg2, fontWeight: fontWeight.medium, fontSize: fontSize.body },

  addBtnWrap: { marginTop: spacing[3] },
  addBtn: {
    borderRadius: radii.pill, height: 52,
    flexDirection: 'row-reverse',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  addText: { color: '#fff', fontWeight: fontWeight.semibold, fontSize: fontSize.body },

  emptyState: {
    alignItems: 'center', paddingVertical: spacing[10],
    gap: spacing[3],
  },
  emptyTitle: { color: colors.fg2, fontSize: fontSize.headline, fontWeight: fontWeight.semibold },
  emptySub: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'center', lineHeight: 20 },
})
