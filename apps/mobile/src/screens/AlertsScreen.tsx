import React, { useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
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
  { id: '1', make: 'Toyota', model: 'קורולה', yearMin: 2019, maxPrice: 140000, city: 'תל אביב' },
  { id: '2', make: 'Kia', model: 'סטוניק', yearMin: 2018, maxPrice: 100000, maxKm: 80000 },
]

export function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ make: '', model: '', maxPrice: '', city: '' })

  function addAlert() {
    if (!form.make) return
    setAlerts(prev => [...prev, { id: Date.now().toString(), ...form, maxPrice: form.maxPrice ? Number(form.maxPrice) : undefined }])
    setForm({ make: '', model: '', maxPrice: '', city: '' })
    setShowForm(false)
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.pad}>
          <Text style={s.title}>התראות</Text>
          <Text style={s.sub}>קבל התראה כשרכב תואם מתפרסם</Text>

          {/* Alert list */}
          {alerts.map(alert => (
            <View key={alert.id} style={s.alertCard}>
              <View style={s.alertHeader}>
                <TouchableOpacity onPress={() => setAlerts(p => p.filter(a => a.id !== alert.id))}>
                  <Text style={s.deleteBtn}>✕</Text>
                </TouchableOpacity>
                <Text style={s.alertTitle}>{alert.make} {alert.model}</Text>
              </View>
              <View style={s.tags}>
                {alert.yearMin && <View style={s.tag}><Text style={s.tagText}>משנת {alert.yearMin}</Text></View>}
                {alert.maxPrice && <View style={s.tag}><Text style={s.tagText}>עד ₪ {alert.maxPrice.toLocaleString()}</Text></View>}
                {alert.maxKm && <View style={s.tag}><Text style={s.tagText}>עד {alert.maxKm.toLocaleString()} ק״מ</Text></View>}
                {alert.city && <View style={s.tag}><Text style={s.tagText}>📍 {alert.city}</Text></View>}
              </View>
            </View>
          ))}

          {/* Add form */}
          {showForm ? (
            <View style={s.form}>
              <Text style={s.formTitle}>התראה חדשה</Text>
              {(['make', 'model', 'maxPrice', 'city'] as const).map(field => (
                <TextInput
                  key={field}
                  style={s.input}
                  placeholder={{ make: 'יצרן (למשל Toyota)', model: 'דגם', maxPrice: 'מחיר מקסימום', city: 'עיר' }[field]}
                  placeholderTextColor={colors.fg4}
                  value={form[field]}
                  onChangeText={v => setForm(p => ({ ...p, [field]: v }))}
                  textAlign="right"
                  keyboardType={field === 'maxPrice' ? 'numeric' : 'default'}
                />
              ))}
              <View style={s.formBtns}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setShowForm(false)}>
                  <Text style={s.cancelText}>ביטול</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addAlert}>
                  <LinearGradient colors={gradients.primary} style={s.saveBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                    <Text style={s.saveText}>שמור התראה</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setShowForm(true)}>
              <LinearGradient colors={gradients.primary} style={s.addBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={s.addText}>+ הוסף התראה</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg0 },
  scroll: { flex: 1 },
  pad: { paddingHorizontal: spacing[5] },
  title: { color: colors.fg1, fontSize: fontSize.display2, fontWeight: fontWeight.bold, marginTop: spacing[4], textAlign: 'right' },
  sub: { color: colors.fg3, fontSize: fontSize.caption, textAlign: 'right', marginBottom: spacing[5] },

  alertCard: { backgroundColor: colors.bg1, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border1, padding: spacing[4], marginBottom: spacing[3] },
  alertHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[3] },
  alertTitle: { color: colors.fg1, fontSize: fontSize.title, fontWeight: fontWeight.semibold },
  deleteBtn: { color: colors.fg3, fontSize: 16, padding: 4 },
  tags: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: spacing[2] },
  tag: { backgroundColor: colors.bg2, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: colors.fg2, fontSize: fontSize.caption },

  form: { backgroundColor: colors.bg1, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border1, padding: spacing[5], marginBottom: spacing[4] },
  formTitle: { color: colors.fg1, fontSize: fontSize.title, fontWeight: fontWeight.semibold, textAlign: 'right', marginBottom: spacing[4] },
  input: { backgroundColor: colors.bg2, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border1, color: colors.fg1, padding: spacing[3], marginBottom: spacing[3], fontSize: fontSize.body },
  formBtns: { flexDirection: 'row-reverse', gap: spacing[3], marginTop: spacing[2] },
  saveBtn: { borderRadius: radii.pill, paddingHorizontal: 20, paddingVertical: 12 },
  saveText: { color: '#fff', fontWeight: fontWeight.semibold, fontSize: fontSize.body },
  cancelBtn: { borderRadius: radii.pill, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.bg2 },
  cancelText: { color: colors.fg2, fontWeight: fontWeight.medium, fontSize: fontSize.body },

  addBtn: { borderRadius: radii.pill, paddingVertical: 14, alignItems: 'center', marginTop: spacing[3] },
  addText: { color: '#fff', fontWeight: fontWeight.semibold, fontSize: fontSize.body },
})
