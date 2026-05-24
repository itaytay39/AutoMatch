import React from 'react'
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radii, shadows } from '../theme/tokens'
import { fonts } from '../theme/typography'

export interface SimilarCardData {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage?: number
  images?: string[]
  saved?: boolean
}

interface SimilarCardProps {
  vehicle: SimilarCardData
  onPress: () => void
  onSave?: () => void
}

export function SimilarCard({ vehicle, onPress, onSave }: SimilarCardProps) {
  const imgUrl = vehicle.images?.[0]
  const kmK = vehicle.mileage ? `${Math.round(vehicle.mileage / 1000)}K` : '—'

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={s.imageWrap}>
        {imgUrl ? (
          <Image source={{ uri: imgUrl }} style={s.image} resizeMode="cover" />
        ) : (
          <View style={s.imagePlaceholder}>
            <Ionicons name="car-outline" size={28} color={colors.fg4} />
          </View>
        )}
        {onSave ? (
          <TouchableOpacity
            style={s.heart}
            onPress={onSave}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={vehicle.saved ? 'heart' : 'heart-outline'}
              size={14}
              color={vehicle.saved ? colors.accent : colors.fg2}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={s.info}>
        <Text style={s.name} numberOfLines={1}>{vehicle.make} {vehicle.model}</Text>
        <Text style={s.meta}>
          <Text style={s.num}>{vehicle.year}</Text>
          {vehicle.mileage ? <Text style={s.metaDot}> · </Text> : null}
          {vehicle.mileage ? <Text style={s.num}>{kmK}</Text> : null}
          {vehicle.mileage ? <Text> ק״מ</Text> : null}
        </Text>
        <Text style={s.price}>
          ₪<Text style={s.priceNum}>{vehicle.price.toLocaleString('he-IL')}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const s = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: colors.bg1,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border1,
    overflow: 'hidden',
    marginEnd: 12,
    ...shadows.sm,
  },
  imageWrap: {
    height: 110,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: colors.bg2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    position: 'absolute',
    top: 8,
    end: 8,
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 10,
    paddingBottom: 12,
  },
  name: {
    fontSize: 13,
    fontFamily: fonts.bold,
    fontWeight: '700',
    color: colors.fg1,
    letterSpacing: -0.1,
    marginBottom: 3,
  },
  meta: {
    fontSize: 10.5,
    fontFamily: fonts.medium,
    color: colors.fg3,
    marginBottom: 8,
  },
  metaDot: {
    color: colors.fg4,
  },
  num: {
    fontFamily: fonts.medium,
    writingDirection: 'ltr',
  } as any,
  price: {
    fontSize: 15,
    fontFamily: fonts.bold,
    fontWeight: '800',
    color: colors.fg1,
    letterSpacing: -0.015,
  },
  priceNum: {
    fontFamily: fonts.bold,
    writingDirection: 'ltr',
  } as any,
})
