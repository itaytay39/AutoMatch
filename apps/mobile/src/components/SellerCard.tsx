import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radii, shadows } from '../theme/tokens'
import { fonts } from '../theme/typography'

interface SellerCardProps {
  seller?: string
  city?: string
  phone?: string
  url?: string
}

export function SellerCard({ seller, city, phone, url }: SellerCardProps) {
  const name = seller || 'מוכר פרטי'
  const initials = name.charAt(0)

  const handleCall = () => {
    if (phone) Linking.openURL(`tel:${phone}`)
  }

  const handleWhatsApp = () => {
    if (phone) Linking.openURL(`whatsapp://send?phone=972${phone.replace(/^0/, '')}`)
  }

  return (
    <View style={s.card}>
      <Text style={s.sectionTitle}>על המוכר</Text>

      <View style={s.row}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1, marginStart: 12 }}>
          <Text style={s.name}>{name}</Text>
          {city ? (
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={13} color={colors.fg3} />
              <Text style={s.location}>{city}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={s.divider} />

      <View style={s.actions}>
        <TouchableOpacity style={s.btnOutline} onPress={handleCall} activeOpacity={0.8}>
          <Ionicons name="call-outline" size={16} color={colors.fg1} />
          <Text style={s.btnOutlineText}>התקשר</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.btnWhatsApp} onPress={handleWhatsApp} activeOpacity={0.8}>
          <Ionicons name="logo-whatsapp" size={16} color="#fff" />
          <Text style={s.btnWhatsAppText}>וואטסאפ</Text>
        </TouchableOpacity>
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
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: colors.fg1,
    letterSpacing: -0.2,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: colors.accentInk,
  },
  name: {
    fontSize: 15,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: colors.fg1,
    letterSpacing: -0.1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  location: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.fg3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border1,
    marginVertical: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  btnOutline: {
    flex: 1,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border1,
    backgroundColor: colors.bg1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnOutlineText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: colors.fg1,
  },
  btnWhatsApp: {
    flex: 1,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnWhatsAppText: {
    fontSize: 14,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: '#fff',
  },
})
