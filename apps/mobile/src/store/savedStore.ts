import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'automatch_saved_ids'

let _saved: Set<string> = new Set()
let _loaded = false
const _listeners: Array<(ids: Set<string>) => void> = []

function notify() {
  const copy = new Set(_saved)
  _listeners.forEach(l => l(copy))
}

async function load() {
  if (_loaded) return
  try {
    const raw = await AsyncStorage.getItem(KEY)
    if (raw) _saved = new Set(JSON.parse(raw))
  } catch {}
  _loaded = true
  notify()
}

async function persist() {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify([..._saved]))
  } catch {}
}

export async function toggleSaved(id: string): Promise<boolean> {
  await load()
  if (_saved.has(id)) {
    _saved.delete(id)
  } else {
    _saved.add(id)
  }
  await persist()
  notify()
  return _saved.has(id)
}

export function isSaved(id: string): boolean {
  return _saved.has(id)
}

export function getSavedIds(): string[] {
  return [..._saved]
}

export function useSaved() {
  const [saved, setSaved] = useState<Set<string>>(new Set(_saved))

  useEffect(() => {
    load()
    _listeners.push(setSaved)
    return () => {
      const i = _listeners.indexOf(setSaved)
      if (i > -1) _listeners.splice(i, 1)
    }
  }, [])

  return saved
}
