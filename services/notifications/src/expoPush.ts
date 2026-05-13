// Expo Push API — no Firebase credentials needed.
// Mobile app uses expo-notifications which issues ExponentPushToken[xxx] tokens.
// We forward to Expo's servers; Expo routes to FCM (Android) / APNs (iOS).

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

export interface PushMessage {
  to: string | string[]
  title: string
  body: string
  data?: Record<string, string>
  sound?: 'default' | null
  badge?: number
  channelId?: string
  priority?: 'default' | 'normal' | 'high'
}

export async function sendPush(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  await sendBatch([{ to: token, title, body, data, sound: 'default', channelId: 'automatch-alerts', priority: 'high' }])
}

export async function sendMulticast(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> {
  if (!tokens.length) return
  // Expo allows up to 100 messages per batch
  for (let i = 0; i < tokens.length; i += 100) {
    const batch = tokens.slice(i, i + 100).map(to => ({
      to, title, body, data, sound: 'default' as const, channelId: 'automatch-alerts', priority: 'high' as const,
    }))
    await sendBatch(batch)
  }
}

async function sendBatch(messages: PushMessage[]): Promise<void> {
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(messages),
  })

  if (!res.ok) {
    throw new Error(`Expo Push API error: ${res.status} ${await res.text()}`)
  }

  const json = await res.json() as { data: Array<{ status: string; message?: string }> }
  const failed = json.data?.filter(r => r.status === 'error') ?? []
  if (failed.length) {
    console.warn(`[push] ${failed.length}/${messages.length} failed:`, failed[0]?.message)
  }
}
