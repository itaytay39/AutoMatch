import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    listing: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'l1', make: 'Toyota', model: 'קורולה', year: 2021, price: 120000,
      }),
    },
    alert: {
      findMany: vi.fn().mockResolvedValue([
        { user: { fcmToken: 'token1' } },
        { user: { fcmToken: 'token2' } },
      ]),
    },
    priceSnapshot: {
      findFirst: vi.fn()
        .mockResolvedValueOnce(null) // first call — no prior snapshot
        .mockResolvedValueOnce({ price: 130000 }), // second call — old price
    },
  })),
}))

vi.mock('./firebase.js', () => ({
  sendPush: vi.fn(),
  sendMulticast: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('./alertMatcher.js', () => ({
  notifyPriceDrop: vi.fn().mockResolvedValue(undefined),
}))

const { detectPriceDrops } = await import('./priceWatcher.js')
const { notifyPriceDrop } = await import('./alertMatcher.js')

describe('priceWatcher', () => {
  beforeEach(() => vi.clearAllMocks())

  it('does not notify when no prior snapshot', async () => {
    await detectPriceDrops([{ id: 'l1', price: 120000 }])
    expect(notifyPriceDrop).not.toHaveBeenCalled()
  })

  it('notifies on drop >= 3%', async () => {
    await detectPriceDrops([{ id: 'l1', price: 120000 }]) // was 130000 → 7.6% drop
    expect(notifyPriceDrop).toHaveBeenCalledWith('l1', 130000, 120000)
  })
})
