import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma and firebase before importing alertMatcher
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    alert: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'a1',
          make: 'Toyota',
          model: 'קורולה',
          yearMin: 2019,
          yearMax: null,
          maxPrice: 150000,
          maxKm: null,
          city: null,
          user: { id: 'u1', email: 'test@test.com', fcmToken: 'token123' },
        },
        {
          id: 'a2',
          make: 'Kia',
          model: null,
          yearMin: null,
          yearMax: null,
          maxPrice: 100000,
          maxKm: 80000,
          city: 'תל אביב',
          user: { id: 'u2', email: 'test2@test.com', fcmToken: 'token456' },
        },
      ]),
    },
  })),
}))

vi.mock('./firebase.js', () => ({
  sendPush: vi.fn().mockResolvedValue(undefined),
  sendMulticast: vi.fn().mockResolvedValue(undefined),
}))

const { matchAndNotify } = await import('./alertMatcher.js')
const { sendPush } = await import('./firebase.js')

describe('alertMatcher', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sends push for matching new listing', async () => {
    await matchAndNotify([{
      id: 'l1', make: 'Toyota', model: 'קורולה הייבריד', year: 2021,
      mileage: 45000, price: 129000, city: 'תל אביב', source: 'yad2',
    }])
    expect(sendPush).toHaveBeenCalledWith('token123', expect.stringContaining('Toyota'), expect.any(String), expect.any(Object))
  })

  it('does not notify when price exceeds alert maxPrice', async () => {
    await matchAndNotify([{
      id: 'l2', make: 'Toyota', model: 'קורולה', year: 2021,
      mileage: 10000, price: 200000, city: 'תל אביב', source: 'yad2',
    }])
    expect(sendPush).not.toHaveBeenCalled()
  })

  it('does not notify when mileage exceeds alert maxKm', async () => {
    await matchAndNotify([{
      id: 'l3', make: 'Kia', model: 'סטוניק', year: 2020,
      mileage: 90000, price: 85000, city: 'תל אביב', source: 'yad2',
    }])
    expect(sendPush).not.toHaveBeenCalled()
  })

  it('does not notify when year is below yearMin', async () => {
    await matchAndNotify([{
      id: 'l4', make: 'Toyota', model: 'קורולה', year: 2017,
      mileage: 60000, price: 80000, city: 'תל אביב', source: 'yad2',
    }])
    expect(sendPush).not.toHaveBeenCalled()
  })

  it('skips users without FCM token', async () => {
    const { PrismaClient } = await import('@prisma/client')
    const mockPrisma = new (PrismaClient as any)()
    mockPrisma.alert.findMany.mockResolvedValueOnce([{
      id: 'a3', make: 'Toyota', model: null, yearMin: null, yearMax: null,
      maxPrice: null, maxKm: null, city: null,
      user: { id: 'u3', email: 'no-token@test.com', fcmToken: null },
    }])
    await matchAndNotify([{
      id: 'l5', make: 'Toyota', model: 'Corolla', year: 2022,
      mileage: 5000, price: 100000, city: 'חיפה', source: 'yad2',
    }])
    expect(sendPush).not.toHaveBeenCalled()
  })
})
