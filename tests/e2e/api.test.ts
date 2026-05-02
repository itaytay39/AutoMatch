import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import axios, { AxiosInstance } from 'axios'

const BASE = process.env.API_URL ?? 'http://localhost:3000'
let client: AxiosInstance
let createdUserId: string
let createdAlertId: string

beforeAll(() => {
  client = axios.create({ baseURL: BASE, validateStatus: () => true })
})

describe('health', () => {
  it('GET /health returns ok', async () => {
    const res = await client.get('/health')
    expect(res.status).toBe(200)
    expect(res.data.status).toBe('ok')
  })

  it('GET /metrics returns uptime', async () => {
    const res = await client.get('/metrics')
    expect(res.status).toBe(200)
    expect(res.data.uptime).toBeGreaterThan(0)
  })
})

describe('users', () => {
  it('POST /api/v1/users creates user', async () => {
    const res = await client.post('/api/v1/users', {
      email: `e2e-${Date.now()}@automatch.test`,
      fcmToken: 'test-fcm-token',
    })
    expect(res.status).toBe(201)
    expect(res.data.id).toBeTruthy()
    createdUserId = res.data.id
  })

  it('POST /api/v1/users is idempotent (upsert)', async () => {
    const email = `idempotent-${Date.now()}@automatch.test`
    const res1 = await client.post('/api/v1/users', { email })
    const res2 = await client.post('/api/v1/users', { email, fcmToken: 'updated-token' })
    expect(res1.status).toBe(201)
    expect(res2.status).toBe(201)
    expect(res1.data.id).toBe(res2.data.id)
  })

  it('PATCH /api/v1/users/:id/fcm-token updates token', async () => {
    const res = await client.patch(`/api/v1/users/${createdUserId}/fcm-token`, {
      fcmToken: 'new-fcm-token-456',
    })
    expect(res.status).toBe(204)
  })
})

describe('listings', () => {
  it('GET /api/v1/listings returns paginated results', async () => {
    const res = await client.get('/api/v1/listings')
    expect(res.status).toBe(200)
    expect(res.data).toHaveProperty('listings')
    expect(res.data).toHaveProperty('total')
    expect(res.data).toHaveProperty('page')
    expect(Array.isArray(res.data.listings)).toBe(true)
  })

  it('GET /api/v1/listings with filters', async () => {
    const res = await client.get('/api/v1/listings?make=Toyota&maxPrice=200000&page=1&limit=5')
    expect(res.status).toBe(200)
    expect(res.data.limit).toBe(5)
  })

  it('GET /api/v1/listings/:id returns 404 for unknown id', async () => {
    const res = await client.get('/api/v1/listings/nonexistent-id-xyz')
    expect(res.status).toBe(404)
  })
})

describe('alerts', () => {
  it('POST /api/v1/alerts creates alert', async () => {
    if (!createdUserId) return
    const res = await client.post('/api/v1/alerts', {
      userId: createdUserId,
      make: 'Toyota',
      model: 'קורולה',
      yearMin: 2019,
      maxPrice: 150000,
    })
    expect(res.status).toBe(201)
    expect(res.data.id).toBeTruthy()
    createdAlertId = res.data.id
  })

  it('DELETE /api/v1/alerts/:id removes alert', async () => {
    if (!createdAlertId) return
    const res = await client.delete(`/api/v1/alerts/${createdAlertId}`)
    expect(res.status).toBe(204)
  })
})
