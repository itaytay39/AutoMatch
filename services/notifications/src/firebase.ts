import admin from 'firebase-admin'

let initialized = false

export function getFirebase() {
  if (!initialized) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    })
    initialized = true
  }
  return admin
}

export async function sendPush(fcmToken: string, title: string, body: string, data?: Record<string, string>) {
  const fb = getFirebase()
  await fb.messaging().send({
    token: fcmToken,
    notification: { title, body },
    data,
    android: { priority: 'high', notification: { channelId: 'automatch-alerts', sound: 'default' } },
    apns: { payload: { aps: { sound: 'default', badge: 1 } } },
  })
}

export async function sendMulticast(tokens: string[], title: string, body: string, data?: Record<string, string>) {
  if (!tokens.length) return
  const fb = getFirebase()
  const res = await fb.messaging().sendEachForMulticast({ tokens, notification: { title, body }, data })
  const failed = res.responses.filter(r => !r.success).length
  if (failed) console.warn(`FCM: ${failed}/${tokens.length} failed`)
  return res
}
