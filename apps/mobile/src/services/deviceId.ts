import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Crypto from 'expo-crypto'

const KEY = 'automatch_device_id'
let _cached: string | null = null

/**
 * Returns a persistent anonymous device UUID.
 * Generated once, stored in AsyncStorage, reused forever.
 */
export async function getDeviceId(): Promise<string> {
  if (_cached) return _cached
  const stored = await AsyncStorage.getItem(KEY)
  if (stored) { _cached = stored; return stored }
  const id = Crypto.randomUUID()
  await AsyncStorage.setItem(KEY, id)
  _cached = id
  return id
}
