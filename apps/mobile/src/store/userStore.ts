import { useState, useEffect, useCallback } from 'react'
import { registerForPushNotifications } from '../services/pushNotifications'
import { api } from '../services/api'

const USER_KEY = 'automatch_user'

interface User { id: string; email: string; fcmToken?: string }

let _user: User | null = null
const _listeners: Array<(u: User | null) => void> = []

function notify() { _listeners.forEach(l => l(_user)) }

export async function initUser(email: string): Promise<User> {
  const fcmToken = await registerForPushNotifications() ?? undefined
  const user = await api.registerUser(email, fcmToken) as User
  _user = user
  notify()
  return user
}

export function getUser() { return _user }

export function useUser() {
  const [user, setUser] = useState<User | null>(_user)
  useEffect(() => {
    _listeners.push(setUser)
    return () => { const i = _listeners.indexOf(setUser); if (i > -1) _listeners.splice(i, 1) }
  }, [])
  return user
}
