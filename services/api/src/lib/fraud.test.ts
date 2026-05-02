import { describe, it, expect } from 'vitest'
import { analyzeListing } from './fraud.js'

const base = {
  createdAt: new Date(),
  make: 'Kia',
  model: 'Stonic',
  year: new Date().getFullYear() - 3,
  price: 80_000,
  images: JSON.stringify(['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg']),
  description: 'רכב במצב מצוין, שמור, טסט מחודש, בעלים פרטי אחד, ללא תאונות, עור, אוטומט, קמרה אחורית',
}

describe('analyzeListing', () => {
  it('returns 0 daysOnLot for new listing', () => {
    const result = analyzeListing(base)
    expect(result.daysOnLot).toBe(0)
  })

  it('flags suspiciously low mileage', () => {
    const result = analyzeListing({ ...base, mileage: 1_000 })
    expect(result.odometerSuspicious).toBe(true)
    expect(result.redFlags).toContain('קילומטרים חשודים — ייתכן תיקון אוד')
  })

  it('does not flag normal mileage', () => {
    const result = analyzeListing({ ...base, mileage: 45_000 })
    expect(result.odometerSuspicious).toBe(false)
  })

  it('flags too few images', () => {
    const result = analyzeListing({ ...base, images: JSON.stringify(['a.jpg']) })
    expect(result.redFlags.some(f => f.includes('תמונות'))).toBe(true)
  })

  it('flags short description', () => {
    const result = analyzeListing({ ...base, description: 'קצר' })
    expect(result.redFlags.some(f => f.includes('תיאור'))).toBe(true)
  })

  it('marks great deal for clean new listing', () => {
    const result = analyzeListing({ ...base, mileage: 44_731 })
    expect(result.dealScore).toBe('great')
  })

  it('marks suspicious for odometer fraud', () => {
    const result = analyzeListing({ ...base, mileage: 500 })
    expect(result.dealScore).toBe('suspicious')
  })
})
