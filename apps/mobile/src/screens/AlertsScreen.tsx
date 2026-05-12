import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, radii } from '../theme/tokens'
import { fonts } from '../theme/typography'
import { api } from '../services/api'
import { getDeviceId } from '../services/deviceId'

interface Alert {
  id: string
  make?: string
  model?: string
  yearMin?: number
  maxPrice?: number
  maxKm?: number
  city?: string
}

const FIELDS: { key: keyof typeof EMPTY_FORM; label: string; numeric?: boolean }[] = [
  { key: 'make',     label: 'יצרן (Toyota, Kia...)' },
  { key: 'model',    label: 'דגם' },
  { key: 'maxPrice', label: 'מחיר מקסימום (₪)', numeric: true },
  { key: 'maxKm',    label: 'קילומטרים מקסימום', numeric: true },
  { key: 'city',     label: 'עיר' },
]

const EMPTY_FORM = { make: '', model: '', maxPrice: '', maxKm: '', city: '' }

export function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [userId, setUserId] = useState<string | null>(null)

  // Initialize device ID and load alerts
  useEffect(() => {
    getDeviceId().then(id => {
      setUserId(id)
      loadAlerts(id)
    })
  }, [])

  const loadAlerts = useCallback(async (uid: string) => {
    setError(false)
    try {
      const rows = await api.getAlerts(uid) as Alert[]
      setAlerts(rows)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  async function addAlert() {
    if (!form.make || !userId) return
    try {
      const created = await api.createAlert({
        userId,
        make: form.make || undefined,
        model: form.model || undefined,
        maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined,
        maxKm: form.maxKm ? Number(form.maxKm) : undefined,
        city: form.city || undefined,
      }) as Alert
      setAlerts(prev => [...prev, created])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } catch (e) {
      console.warn('Failed to create alert:', e)
    }
  }

  async function deleteAlert(id: string) {
    try {
      await api.deleteAlert(id)
      setAlerts(prev => prev.filter(a => a.id !== id))
    } catch (e) {
      console.warn('Failed to delete alert:', e)
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={s.pad}>

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>התראות</Text>
            {alerts.length > 0 && (
              <View style={s.countBadge}>
                <Text style={s.countText}>{alerts.length}</Text>
              </View>
            )}
          </View>
          <Text style={s.sub}>קבל עדכון מיידי כשרכב תואם מתפרסם</Text>

          {/* Loading state */}
          {loading && (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          )}

          {/* Error state */}
          {!loading && error && (
            <View style={s.errorBanner}>
              <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
              <Text style={s.errorText}>בעיית חיבור — </Text>
              <TouchableOpacity onPress={() => userId && loadAlerts(userId)}>
                <Text style={s.retryLink}>נסה שוב</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Alert cards */}
          {!loading && alerts.map(alert => (
            <View key={alert.id} style={s.alertCard}>
              <View style={s.alertTop}>
                <View style={s.alertIconWrap}>
                  <Ionicons name="notifications" size={15} color={colors.accent} />
                </View>
                <Text style={s.alertTitle} numberOfLines={1}>{alert.make} {alert.model}</Text>
                <TouchableOpacity
                  style={s.deleteBtn}
                  onPress={() => deleteAlert(alert.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={14} color={colors.fg3} />
                </TouchableOpacity>
              </View>

              <View style={s.tagsRow}>
                {alert.yearMin && (
                  <View style={s.tag}>
                    <Ionicons name="calendar-outline" size={10} color={colors.fg3} />
                    <Text style={s.tagText}>משנת {alert.yearMin}</Text>
                  </View>
                )}
                {alert.maxPrice && (
                  <View style={s.tag}>
                    <Ionicons name="cash-outline" size={10} color={colors.fg3} />
                    <Text style={s.tagText}>עד ₪{alert.maxPrice.toLocaleString()}</Text>
                  </View>
                )}
                {alert.maxKm && (
                  <View style={s.tag}>
                    <Ionicons name="speedometer-outline" size={10} color={colors.fg3} />
                    <Text style={s.tagText}>עד {alert.maxKm.toLocaleString()} ק״מ</Text>
                  </View>
                )}
                {alert.city && (
                  <View style={s.tag}>
                    <Ionicons name="location-outline" size={10} color={colors.fg3} />
                    <Text style={s.tagText}>{alert.city}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* Add new alert form */}
          {showForm ? (
            <View style={s.form}>
              <Text style={s.formTitle}>התראה חדשה</Text>
              {FIELDS.map(field => (
                <TextInput
                  key={field.key}
                  style={s.input}
                  placeholder={field.label}
                  placeholderTextColor={colors.fg4}
                  value={form[field.key]}
                  onChangeText={v => setForm(p => ({ ...p, [field.key]: v }))}
                  textAlign="right"
                  keyboardType={field.numeric ? 'numeric' : 'default'}
                />
              ))}
              <View style={s.formBtns}>
                <TouchableOpacity
                  style={s.cancelBtn}
                  onPress={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                >
                  <Text style={s.cancelText}>ביטול</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={addAlert}>
                  <Text style={s.saveBtnText}>שמור התראה</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={s.addBtn} onPress={() => setShowForm(true)} activeOpacity={0.85}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={s.addBtnText}>הוסף התראה חדשה</Text>
            </TouchableOpacity>
          )}

          {/* Empty state */}
          {!loading && alerts.length === 0 && !showForm && (
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
    marginTop: spacing[5],
    marginBottom: spacing[1],
  },
  title: { color: colors.fg1, fontSize: 24, fontFamily: fonts.bold, letterSpacing: -0.3 },
  countBadge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radii.pill,
    paddingHorizontal: 9, paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: colors.accent,
  },
  countText: { color: colors.accent, fontSize: fontSize.micro, fontFamily: fonts.bold },
  sub: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'right', marginBottom: spacing[5] },
  loadingWrap: { paddingVertical: 32, alignItems: 'center' },

  errorBanner: {
    flexDirection: 'row-reverse', alignItems: 'center', gap: 6,
    marginBottom: spacing[3],
    backgroundColor: '#2A1A08', borderRadius: radii.md,
    borderWidth: 0.5, borderColor: 'rgba(217,119,6,0.3)',
    paddingHorizontal: spacing[4], paddingVertical: spacing[3],
  },
  errorText: { color: colors.warning, fontSize: fontSize.caption, fontFamily: fonts.regular },
  retryLink: { color: colors.accent, fontSize: fontSize.caption, fontFamily: fonts.semibold },

  alertCard: {
    backgroundColor: colors.bg1,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.border2,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  alertTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  alertIconWrap: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.accentSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  alertTitle: {
    flex: 1,
    color: colors.fg1,
    fontSize: fontSize.title,
    fontFamily: fonts.semibold,
    textAlign: 'right',
  },
  deleteBtn: {
    width: 26, height: 26, borderRadius: 13,
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
  tagText: { color: colors.fg2, fontSize: fontSize.caption, fontFamily: fonts.regular },

  form: {
    backgroundColor: colors.bg1,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.border2,
    padding: spacing[4],
    marginBottom: spacing[4],
  },
  formTitle: {
    color: colors.fg1,
    fontSize: fontSize.title,
    fontFamily: fonts.semibold,
    textAlign: 'right',
    marginBottom: spacing[4],
  },
  input: {
    backgroundColor: colors.bg2,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.border2,
    color: colors.fg1,
    fontFamily: fonts.regular,
    paddingHorizontal: spacing[4],
    height: 46,
    fontSize: fontSize.body,
    marginBottom: spacing[3],
  },
  formBtns: {
    flexDirection: 'row-reverse',
    gap: spacing[3],
    marginTop: spacing[1],
  },
  saveBtn: {
    flex: 1, height: 46,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontFamily: fonts.semibold, fontSize: fontSize.body },
  cancelBtn: {
    height: 46, paddingHorizontal: 20,
    backgroundColor: colors.bg2,
    borderRadius: radii.md,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelText: { color: colors.fg2, fontFamily: fonts.medium, fontSize: fontSize.body },

  addBtn: {
    height: 50,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    flexDirection: 'row-reverse',
    alignItems: 'center', justifyContent: 'center',
    gap: 8,
    marginTop: spacing[3],
  },
  addBtnText: { color: '#fff', fontFamily: fonts.semibold, fontSize: fontSize.body },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 56,
    gap: spacing[3],
  },
  emptyTitle: { color: colors.fg2, fontSize: fontSize.headline, fontFamily: fonts.semibold },
  emptySub: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'center', lineHeight: 20 },
})
