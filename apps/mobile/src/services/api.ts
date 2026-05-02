const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json()
}

export const api = {
  registerUser: (email: string, fcmToken?: string) =>
    req('/users', { method: 'POST', body: JSON.stringify({ email, fcmToken }) }),

  updateFcmToken: (userId: string, fcmToken: string) =>
    req(`/users/${userId}/fcm-token`, { method: 'PATCH', body: JSON.stringify({ fcmToken }) }),

  getListings: (params: Record<string, string | number>) =>
    req(`/listings?${new URLSearchParams(params as Record<string, string>)}`),

  getListing: (id: string) =>
    req(`/listings/${id}`),

  createAlert: (alert: {
    userId: string; make?: string; model?: string
    yearMin?: number; yearMax?: number; maxPrice?: number; maxKm?: number; city?: string
  }) => req('/alerts', { method: 'POST', body: JSON.stringify(alert) }),

  deleteAlert: (id: string) =>
    req(`/alerts/${id}`, { method: 'DELETE' }),
}
