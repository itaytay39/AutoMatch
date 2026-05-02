import { describe, it, expect } from 'vitest'
import { scoreCondition } from './condition.js'

const base = {
  year: new Date().getFullYear() - 3,
  mileage: 44_731,
  price: 85_000,
  images: JSON.stringify(Array(8).fill('img.jpg')),
  description: 'רכב במצב מצוין, שמור, טסט מחודש, בעלים פרטי אחד, ללא תאונות, עור, אוטומט, קמרה אחורית, רדיו מסך גדול',
  source: 'yad2',
  odometerSuspicious: false,
  redFlags: [],
}

describe('scoreCondition', () => {
  it('returns score between 1 and 10', () => {
    const r = scoreCondition(base)
    expect(r.score).toBeGreaterThanOrEqual(1)
    expect(r.score).toBeLessThanOrEqual(10)
  })

  it('gives A grade for excellent listing', () => {
    const r = scoreCondition(base)
    expect(['A', 'B']).toContain(r.grade)
  })

  it('penalizes suspicious odometer', () => {
    const normal = scoreCondition(base)
    const suspicious = scoreCondition({ ...base, odometerSuspicious: true })
    expect(suspicious.score).toBeLessThan(normal.score)
  })

  it('penalizes high mileage', () => {
    const low = scoreCondition({ ...base, mileage: 20_000 })
    const high = scoreCondition({ ...base, mileage: 180_000 })
    expect(high.score).toBeLessThan(low.score)
  })

  it('penalizes old car', () => {
    const newer = scoreCondition(base)
    const older = scoreCondition({ ...base, year: new Date().getFullYear() - 12 })
    expect(older.score).toBeLessThan(newer.score)
  })

  it('penalizes few images', () => {
    const many = scoreCondition(base)
    const few = scoreCondition({ ...base, images: JSON.stringify(['img.jpg']) })
    expect(few.score).toBeLessThan(many.score)
  })

  it('includes breakdown with correct fields', () => {
    const r = scoreCondition(base)
    expect(r.breakdown.length).toBeGreaterThan(0)
    r.breakdown.forEach(b => {
      expect(b).toHaveProperty('category')
      expect(b).toHaveProperty('points')
      expect(b).toHaveProperty('maxPoints')
    })
  })
})
