import { describe, it, expect } from 'vitest'
import { checkSalvageRisk } from './salvage.js'

const base = {
  price: 90_000,
  mileage: 65_000,
  year: new Date().getFullYear() - 4,
  description: 'רכב במצב מצוין, שמור, בעלים פרטי אחד',
  images: ['a.jpg', 'b.jpg', 'c.jpg', 'd.jpg'],
  source: 'yad2',
  city: 'תל אביב',
}

describe('checkSalvageRisk', () => {
  it('returns low risk for clean listing', () => {
    const r = checkSalvageRisk(base)
    expect(r.riskLevel).toBe('low')
    expect(r.warnings).toHaveLength(0)
  })

  it('detects flood keyword in description', () => {
    const r = checkSalvageRisk({ ...base, description: 'רכב לאחר שטפון, תוקן כראוי' })
    expect(r.warnings.length).toBeGreaterThan(0)
    expect(r.riskLevel).not.toBe('low')
  })

  it('detects salvage keyword', () => {
    const r = checkSalvageRisk({ ...base, description: 'רכב לאחר אובדן גמור, שיקום מלא' })
    expect(r.warnings.length).toBeGreaterThanOrEqual(2)
    expect(r.riskLevel).toBe('high')
  })

  it('flags suspiciously low price', () => {
    const r = checkSalvageRisk({ ...base, price: 20_000, year: new Date().getFullYear() - 2 })
    const hasPriceWarning = r.warnings.some(w => w.includes('מחיר נמוך'))
    expect(hasPriceWarning).toBe(true)
  })

  it('flags few images', () => {
    const r = checkSalvageRisk({ ...base, images: ['one.jpg'] })
    expect(r.warnings.some(w => w.includes('תמונות'))).toBe(true)
    expect(r.tips.some(t => t.includes('תמונות תחתית'))).toBe(true)
  })

  it('flags flood risk city', () => {
    const r = checkSalvageRisk({ ...base, city: 'קריית ביאליק' })
    expect(r.tips.some(t => t.includes('שטפונות'))).toBe(true)
  })

  it('always includes VIN tip', () => {
    const r = checkSalvageRisk(base)
    expect(r.tips.some(t => t.includes('VIN'))).toBe(true)
  })

  it('result has required fields', () => {
    const r = checkSalvageRisk(base)
    expect(r).toHaveProperty('riskLevel')
    expect(r).toHaveProperty('warnings')
    expect(r).toHaveProperty('tips')
    expect(Array.isArray(r.warnings)).toBe(true)
    expect(Array.isArray(r.tips)).toBe(true)
  })
})
