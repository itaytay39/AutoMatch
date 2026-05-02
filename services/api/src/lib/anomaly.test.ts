import { describe, it, expect } from 'vitest'
import { detectAnomalies, buildMarketContext } from './anomaly.js'

const base = {
  price: 90_000,
  mileage: 68_000,
  year: new Date().getFullYear() - 4,
  description: 'רכב במצב מצוין, שמור, טסט מחודש, אוטומט, קמרה אחורית',
  images: ['img1.jpg', 'img2.jpg', 'img3.jpg', 'img4.jpg', 'img5.jpg'],
  source: 'yad2',
  city: 'תל אביב',
  make: 'Kia',
  model: 'Stonic',
}

const peers = Array(15).fill({ ...base })
const ctx = buildMarketContext(peers)

describe('detectAnomalies', () => {
  it('returns clean for a normal listing', () => {
    const r = detectAnomalies(base, ctx)
    expect(r.anomalyLevel).toBe('clean')
    expect(r.anomalyScore).toBeLessThan(15)
  })

  it('flags suspiciously low price', () => {
    const r = detectAnomalies({ ...base, price: 40_000 }, ctx)
    const priceSig = r.signals.find(s => s.name === 'price_outlier')
    expect(priceSig?.triggered).toBe(true)
    expect(r.anomalyScore).toBeGreaterThan(15)
  })

  it('flags very low mileage for age', () => {
    const r = detectAnomalies({ ...base, mileage: 1_000 }, ctx)
    const sig = r.signals.find(s => s.name === 'mileage_anomaly')
    expect(sig?.triggered).toBe(true)
  })

  it('flags no images', () => {
    const r = detectAnomalies({ ...base, images: [] }, ctx)
    const sig = r.signals.find(s => s.name === 'few_images')
    expect(sig?.triggered).toBe(true)
  })

  it('flags round mileage', () => {
    const r = detectAnomalies({ ...base, mileage: 50_000 }, ctx)
    const sig = r.signals.find(s => s.name === 'round_mileage')
    expect(sig?.triggered).toBe(true)
  })

  it('flags description with accident keywords', () => {
    const r = detectAnomalies({ ...base, description: 'רכב לאחר תאונה קטנה, תוקן' }, ctx)
    const sig = r.signals.find(s => s.name === 'description_flags')
    expect(sig?.triggered).toBe(true)
  })

  it('returns alert level when multiple signals fire', () => {
    const suspicious = { ...base, price: 40_000, mileage: 2_000, images: [], description: 'מכירה דחופה' }
    const r = detectAnomalies(suspicious, ctx)
    expect(['suspicious', 'alert']).toContain(r.anomalyLevel)
    expect(r.anomalyScore).toBeGreaterThan(35)
  })

  it('signal array has required fields', () => {
    const r = detectAnomalies(base, ctx)
    r.signals.forEach(s => {
      expect(s).toHaveProperty('name')
      expect(s).toHaveProperty('weight')
      expect(s).toHaveProperty('triggered')
      expect(s).toHaveProperty('detail')
    })
  })
})

describe('buildMarketContext', () => {
  it('returns zero context for empty peers', () => {
    const ctx = buildMarketContext([])
    expect(ctx.avgPrice).toBe(0)
  })

  it('computes correct avg price', () => {
    const peers = [
      { ...base, price: 80_000 },
      { ...base, price: 100_000 },
    ]
    const ctx = buildMarketContext(peers)
    expect(ctx.avgPrice).toBe(90_000)
  })
})
