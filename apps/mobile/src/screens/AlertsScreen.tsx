import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
  Modal, SafeAreaView as RNSafeAreaView, Switch,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, radii, shadows } from '../theme/tokens'
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

const MAKES = ['Toyota', 'Kia', 'Hyundai', 'Mazda', 'Honda', 'Skoda', 'VW', 'Ford', 'BMW', 'Audi']
const FUELS = ['בנזין', 'דיזל', 'היברידי', 'חשמלי']
const HANDS = ['1', '2', '3', '4+']

interface AlertFormProps {
  visible: boolean
  onClose: () => void
  onSubmit: (data: {
    make?: string
    model?: string
    yearMin?: number
    maxPrice?: number
    maxKm?: number
    pushEnabled: boolean
    emailEnabled: boolean
    frequency: 'instant' | 'daily'
  }) => void
}

function AlertForm({ visible, onClose, onSubmit }: AlertFormProps) {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [yearMin, setYearMin] = useState(2015)
  const [maxPrice, setMaxPrice] = useState(120000)
  const [hand, setHand] = useState('')
  const [fuel, setFuel] = useState('')
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [frequency, setFrequency] = useState<'instant' | 'daily'>('instant')

  function reset() {
    setStep(0)
    setName('')
    setMake('')
    setModel('')
    setYearMin(2015)
    setMaxPrice(120000)
    setHand('')
    setFuel('')
    setPushEnabled(true)
    setEmailEnabled(false)
    setFrequency('instant')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleNext() {
    if (step < 2) {
      setStep(s => s + 1)
    } else {
      onSubmit({
        make: make || undefined,
        model: model || undefined,
        yearMin,
        maxPrice,
        pushEnabled,
        emailEnabled,
        frequency,
      })
      reset()
      onClose()
    }
  }

  const stepLabels = ['פרטי הרכב', 'פרמטרים', 'הגדרות']

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <RNSafeAreaView style={f.container}>
        <View style={f.progressBar}>
          {stepLabels.map((_, i) => (
            <View key={i} style={[f.progressSegment, i <= step && f.progressSegmentActive]} />
          ))}
        </View>

        <View style={f.topRow}>
          <TouchableOpacity style={f.closeCircle} onPress={handleClose} activeOpacity={0.8}>
            <Ionicons name="close" size={18} color="#4A4D4A" />
          </TouchableOpacity>
          <Text style={f.sheetTitle}>התראה חדשה</Text>
          <Text style={f.stepLabel}>{stepLabels[step]}</Text>
        </View>

        <ScrollView style={f.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {step === 0 && (
            <View style={f.stepContent}>
              <Text style={f.fieldLabel}>שם ההתראה</Text>
              <TextInput
                style={f.input}
                placeholder="לדוגמה: קיה סטוניק לחיפה"
                placeholderTextColor="#A8AAA6"
                value={name}
                onChangeText={setName}
                textAlign="right"
              />

              <Text style={f.fieldLabel}>יצרן</Text>
              <View style={f.chipsWrap}>
                {MAKES.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[f.chip, make === m && f.chipActive]}
                    onPress={() => setMake(prev => prev === m ? '' : m)}
                    activeOpacity={0.8}
                  >
                    <Text style={[f.chipText, make === m && f.chipTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={f.fieldLabel}>דגם</Text>
              <TextInput
                style={f.input}
                placeholder="לדוגמה: Stonic"
                placeholderTextColor="#A8AAA6"
                value={model}
                onChangeText={setModel}
                textAlign="right"
              />
            </View>
          )}

          {step === 1 && (
            <View style={f.stepContent}>
              <Text style={f.fieldLabel}>שנה מינימלית: {yearMin}</Text>
              <View style={f.sliderRow}>
                <TouchableOpacity style={f.sliderBtn} onPress={() => setYearMin(y => Math.max(2005, y - 1))}>
                  <Ionicons name="remove" size={16} color="#2A5BB5" />
                </TouchableOpacity>
                <View style={f.sliderTrack}>
                  <View style={[f.sliderFill, { width: `${((yearMin - 2005) / 20) * 100}%` }]} />
                </View>
                <TouchableOpacity style={f.sliderBtn} onPress={() => setYearMin(y => Math.min(2025, y + 1))}>
                  <Ionicons name="add" size={16} color="#2A5BB5" />
                </TouchableOpacity>
              </View>

              <Text style={f.fieldLabel}>מחיר מקסימום: ₪{maxPrice.toLocaleString()}</Text>
              <View style={f.sliderRow}>
                <TouchableOpacity style={f.sliderBtn} onPress={() => setMaxPrice(p => Math.max(20000, p - 5000))}>
                  <Ionicons name="remove" size={16} color="#2A5BB5" />
                </TouchableOpacity>
                <View style={f.sliderTrack}>
                  <View style={[f.sliderFill, { width: `${((maxPrice - 20000) / 280000) * 100}%` }]} />
                </View>
                <TouchableOpacity style={f.sliderBtn} onPress={() => setMaxPrice(p => Math.min(300000, p + 5000))}>
                  <Ionicons name="add" size={16} color="#2A5BB5" />
                </TouchableOpacity>
              </View>

              <Text style={f.fieldLabel}>יד</Text>
              <View style={f.chipsWrap}>
                {HANDS.map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[f.chip, hand === h && f.chipActive]}
                    onPress={() => setHand(prev => prev === h ? '' : h)}
                    activeOpacity={0.8}
                  >
                    <Text style={[f.chipText, hand === h && f.chipTextActive]}>יד {h}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={f.fieldLabel}>סוג דלק</Text>
              <View style={f.chipsWrap}>
                {FUELS.map(fu => (
                  <TouchableOpacity
                    key={fu}
                    style={[f.chip, fuel === fu && f.chipActive]}
                    onPress={() => setFuel(prev => prev === fu ? '' : fu)}
                    activeOpacity={0.8}
                  >
                    <Text style={[f.chipText, fuel === fu && f.chipTextActive]}>{fu}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={f.stepContent}>
              <View style={f.toggleRow}>
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: '#FBFAF6', true: '#DCE6F5' }}
                  thumbColor={pushEnabled ? '#2A5BB5' : '#A8AAA6'}
                />
                <View style={f.toggleMeta}>
                  <Text style={f.toggleTitle}>התראות Push</Text>
                  <Text style={f.toggleSub}>קבל התראה ישירות לטלפון</Text>
                </View>
              </View>

              <View style={f.divider} />

              <View style={f.toggleRow}>
                <Switch
                  value={emailEnabled}
                  onValueChange={setEmailEnabled}
                  trackColor={{ false: '#FBFAF6', true: '#DCE6F5' }}
                  thumbColor={emailEnabled ? '#2A5BB5' : '#A8AAA6'}
                />
                <View style={f.toggleMeta}>
                  <Text style={f.toggleTitle}>התראות אימייל</Text>
                  <Text style={f.toggleSub}>סיכום יומי לתיבת הדואר</Text>
                </View>
              </View>

              <View style={f.divider} />

              <Text style={f.fieldLabel}>תדירות</Text>
              <View style={f.freqRow}>
                <TouchableOpacity
                  style={[f.freqBtn, frequency === 'instant' && f.freqBtnActive]}
                  onPress={() => setFrequency('instant')}
                  activeOpacity={0.8}
                >
                  <Text style={[f.freqText, frequency === 'instant' && f.freqTextActive]}>מיידי</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[f.freqBtn, frequency === 'daily' && f.freqBtnActive]}
                  onPress={() => setFrequency('daily')}
                  activeOpacity={0.8}
                >
                  <Text style={[f.freqText, frequency === 'daily' && f.freqTextActive]}>יומי</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={f.footer}>
          {step > 0 ? (
            <TouchableOpacity style={f.backCircle} onPress={() => setStep(s => s - 1)} activeOpacity={0.8}>
              <Ionicons name="chevron-forward" size={20} color="#4A4D4A" />
            </TouchableOpacity>
          ) : (
            <View style={f.backCircle} />
          )}
          <TouchableOpacity style={f.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <Text style={f.nextBtnText}>{step < 2 ? 'הבא' : 'צור התראה'}</Text>
          </TouchableOpacity>
        </View>
      </RNSafeAreaView>
    </Modal>
  )
}

export function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [userId, setUserId] = useState<string | null>(null)

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

  const weekMatches = 4
  const lastMatch = '18 דק׳'

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={s.tintHeader}>
          <Text style={s.eyebrow}>התראות פעילות</Text>
          <Text style={s.h1}>תקבל הודעה ברגע שיש התאמה</Text>

          <View style={s.statsCard}>
            <View style={s.statsIconCircle}>
              <Ionicons name="notifications" size={22} color="#A1532B" />
            </View>
            <View style={s.statsMeta}>
              <Text style={s.statsCount}>{weekMatches} התאמות חדשות השבוע</Text>
              <Text style={s.statsUpdated}>התאמה אחרונה לפני {lastMatch}</Text>
            </View>
          </View>
        </View>

        <View style={s.sheet}>
          <Text style={s.sectionTitle}>ההתראות שלי</Text>

          {loading && (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="large" color="#2A5BB5" />
            </View>
          )}

          {!loading && error && (
            <View style={s.errorBanner}>
              <Ionicons name="cloud-offline-outline" size={16} color="#B07A1A" />
              <Text style={s.errorText}>בעיית חיבור — </Text>
              <TouchableOpacity onPress={() => userId && loadAlerts(userId)}>
                <Text style={s.retryLink}>נסה שוב</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && alerts.length === 0 && (
            <View style={s.emptyState}>
              <View style={s.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={36} color="#A1532B" />
              </View>
              <Text style={s.emptyTitle}>אין התראות פעילות</Text>
              <Text style={s.emptySub}>לחץ על הכפתור למטה כדי ליצור התראה חדשה</Text>
            </View>
          )}

          {!loading && alerts.map(alert => (
            <View key={alert.id} style={s.alertCard}>
              <View style={s.alertTop}>
                <View style={s.alertIconWrap}>
                  <Ionicons name="notifications" size={15} color="#2A5BB5" />
                </View>
                <Text style={s.alertTitle} numberOfLines={1}>{alert.make} {alert.model}</Text>
                <View style={s.newsBadge}>
                  <Text style={s.newsBadgeText}>3 חדשים</Text>
                </View>
                <TouchableOpacity
                  style={s.deleteBtn}
                  onPress={() => deleteAlert(alert.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={14} color="#7A7D7A" />
                </TouchableOpacity>
              </View>

              <View style={s.tagsRow}>
                {alert.yearMin && (
                  <View style={s.tag}>
                    <Ionicons name="calendar-outline" size={10} color="#7A7D7A" />
                    <Text style={s.tagText}>משנת {alert.yearMin}</Text>
                  </View>
                )}
                {alert.maxPrice && (
                  <View style={s.tag}>
                    <Ionicons name="cash-outline" size={10} color="#7A7D7A" />
                    <Text style={s.tagText}>עד ₪{alert.maxPrice.toLocaleString()}</Text>
                  </View>
                )}
                {alert.maxKm && (
                  <View style={s.tag}>
                    <Ionicons name="speedometer-outline" size={10} color="#7A7D7A" />
                    <Text style={s.tagText}>עד {alert.maxKm.toLocaleString()} ק״מ</Text>
                  </View>
                )}
                {alert.city && (
                  <View style={s.tag}>
                    <Ionicons name="location-outline" size={10} color="#7A7D7A" />
                    <Text style={s.tagText}>{alert.city}</Text>
                  </View>
                )}
              </View>

              <View style={s.alertFooter}>
                <Text style={s.alertFooterText}>
                  התאמה אחרונה: <Text style={s.alertFooterBold}>לפני {lastMatch}</Text>
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={s.fab}
        onPress={() => setShowForm(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={s.fabText}>התראה חדשה</Text>
      </TouchableOpacity>

      <AlertForm
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={() => {
          addAlert()
        }}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F2EA',
  },

  tintHeader: {
    backgroundColor: '#F4E5DC',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[7],
  },
  eyebrow: {
    color: '#A1532B',
    fontSize: fontSize.caption,
    fontFamily: fonts.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'right',
    marginBottom: spacing[2],
  },
  h1: {
    color: '#1B1E1B',
    fontSize: 26,
    fontFamily: fonts.bold,
    textAlign: 'right',
    lineHeight: 34,
    marginBottom: spacing[4],
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.60)',
    borderRadius: 20,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[3],
    ...shadows.sm,
  },
  statsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F4E5DC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(161,83,43,0.15)',
  },
  statsMeta: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 3,
  },
  statsCount: {
    color: '#1B1E1B',
    fontSize: fontSize.title,
    fontFamily: fonts.semibold,
  },
  statsUpdated: {
    color: '#7A7D7A',
    fontSize: fontSize.caption,
    fontFamily: fonts.regular,
  },

  sheet: {
    backgroundColor: '#F5F2EA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
    paddingTop: spacing[5],
    paddingHorizontal: spacing[4],
    minHeight: 200,
  },

  sectionTitle: {
    color: '#1B1E1B',
    fontSize: fontSize.headline,
    fontFamily: fonts.bold,
    textAlign: 'right',
    marginBottom: spacing[4],
  },

  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },

  errorBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing[3],
    backgroundColor: '#F5EBD2',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(176,122,26,0.25)',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  errorText: {
    color: '#B07A1A',
    fontSize: fontSize.caption,
    fontFamily: fonts.regular,
  },
  retryLink: {
    color: '#2A5BB5',
    fontSize: fontSize.caption,
    fontFamily: fonts.semibold,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 56,
    gap: spacing[3],
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F4E5DC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(161,83,43,0.15)',
  },
  emptyTitle: {
    color: '#4A4D4A',
    fontSize: fontSize.headline,
    fontFamily: fonts.semibold,
  },
  emptySub: {
    color: '#7A7D7A',
    fontSize: fontSize.caption,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing[6],
  },

  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: spacing[4],
    marginBottom: spacing[3],
    ...shadows.sm,
  },
  alertTop: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  alertIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCE6F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    flex: 1,
    color: '#1B1E1B',
    fontSize: fontSize.title,
    fontFamily: fonts.semibold,
    textAlign: 'right',
  },
  newsBadge: {
    backgroundColor: '#E1EFE8',
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  newsBadgeText: {
    color: '#1F6E4D',
    fontSize: fontSize.caption,
    fontFamily: fonts.semibold,
  },
  deleteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FBFAF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  tag: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FBFAF6',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: '#4A4D4A',
    fontSize: fontSize.caption,
    fontFamily: fonts.regular,
  },
  alertFooter: {
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(27,30,27,0.06)',
    paddingTop: spacing[2],
  },
  alertFooterText: {
    color: '#7A7D7A',
    fontSize: fontSize.caption,
    fontFamily: fonts.regular,
    textAlign: 'right',
  },
  alertFooterBold: {
    color: '#4A4D4A',
    fontFamily: fonts.semibold,
  },

  fab: {
    position: 'absolute',
    bottom: 32,
    left: spacing[5],
    right: spacing[5],
    height: 52,
    backgroundColor: '#2A5BB5',
    borderRadius: radii.pill,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.md,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: fontSize.title,
    fontFamily: fonts.bold,
  },
})

const f = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  progressBar: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    paddingBottom: spacing[2],
  },
  progressSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(27,30,27,0.10)',
  },
  progressSegmentActive: {
    backgroundColor: '#2A5BB5',
  },

  topRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FBFAF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(27,30,27,0.10)',
  },
  sheetTitle: {
    flex: 1,
    color: '#1B1E1B',
    fontSize: fontSize.headline,
    fontFamily: fonts.bold,
    textAlign: 'right',
  },
  stepLabel: {
    color: '#7A7D7A',
    fontSize: fontSize.caption,
    fontFamily: fonts.medium,
  },

  body: {
    flex: 1,
    paddingHorizontal: spacing[5],
  },
  stepContent: {
    gap: spacing[2],
    paddingTop: spacing[2],
  },

  fieldLabel: {
    color: '#4A4D4A',
    fontSize: fontSize.caption,
    fontFamily: fonts.semibold,
    textAlign: 'right',
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  input: {
    backgroundColor: '#FBFAF6',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(27,30,27,0.10)',
    color: '#1B1E1B',
    fontFamily: fonts.regular,
    paddingHorizontal: spacing[4],
    height: 48,
    fontSize: fontSize.body,
  },

  chipsWrap: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    backgroundColor: '#FBFAF6',
    borderWidth: 0.5,
    borderColor: 'rgba(27,30,27,0.10)',
  },
  chipActive: {
    backgroundColor: '#DCE6F5',
    borderColor: '#2A5BB5',
  },
  chipText: {
    color: '#4A4D4A',
    fontSize: fontSize.caption,
    fontFamily: fonts.medium,
  },
  chipTextActive: {
    color: '#2A5BB5',
    fontFamily: fonts.semibold,
  },

  sliderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[1],
  },
  sliderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCE6F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(27,30,27,0.10)',
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#2A5BB5',
    borderRadius: 3,
  },

  toggleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[3],
  },
  toggleMeta: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  toggleTitle: {
    color: '#1B1E1B',
    fontSize: fontSize.body,
    fontFamily: fonts.semibold,
  },
  toggleSub: {
    color: '#7A7D7A',
    fontSize: fontSize.caption,
    fontFamily: fonts.regular,
  },

  divider: {
    height: 0.5,
    backgroundColor: 'rgba(27,30,27,0.06)',
  },

  freqRow: {
    flexDirection: 'row-reverse',
    gap: spacing[2],
    marginTop: spacing[1],
  },
  freqBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBFAF6',
    borderWidth: 0.5,
    borderColor: 'rgba(27,30,27,0.10)',
  },
  freqBtnActive: {
    backgroundColor: '#DCE6F5',
    borderColor: '#2A5BB5',
  },
  freqText: {
    color: '#4A4D4A',
    fontSize: fontSize.body,
    fontFamily: fonts.medium,
  },
  freqTextActive: {
    color: '#2A5BB5',
    fontFamily: fonts.semibold,
  },

  footer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    gap: spacing[3],
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(27,30,27,0.06)',
  },
  backCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FBFAF6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(27,30,27,0.10)',
  },
  nextBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#2A5BB5',
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.title,
    fontFamily: fonts.bold,
  },
})
