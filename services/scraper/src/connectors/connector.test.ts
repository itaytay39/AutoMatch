import { describe, it, expect } from 'vitest'
import { normalizeMake, normalizeCity, normalizePrice } from '../core/normalizer.js'
import { deduplicateListings } from '../core/deduplicator.js'
import type { Listing } from '../core/types.js'

describe('normalizer', () => {
  it('normalizes Hebrew make names', () => {
    expect(normalizeMake('טויוטה')).toBe('Toyota')
    expect(normalizeMake('כיה')).toBe('Kia')
    expect(normalizeMake('קיה')).toBe('Kia')
  })
  it('normalizes city shortcuts', () => {
    expect(normalizeCity('ת"א')).toBe('תל אביב')
    expect(normalizeCity('פ"ת')).toBe('פתח תקווה')
  })
  it('parses price strings', () => {
    expect(normalizePrice('₪ 129,900')).toBe(129900)
    expect(normalizePrice('129900 ₪')).toBe(129900)
  })
})

describe('deduplicator', () => {
  it('merges same car from two sources', () => {
    const a: Listing = { externalId: '1', source: 'yad2', url: '', title: 'Toyota Corolla', make: 'Toyota', model: 'Corolla', year: 2021, mileage: 45000, price: 130000, images: ['a.jpg'] }
    const b: Listing = { externalId: '2', source: 'autoboom', url: '', title: 'Toyota Corolla', make: 'Toyota', model: 'Corolla', year: 2021, mileage: 46000, price: 128000, images: ['b.jpg'] }
    const result = deduplicateListings([a, b])
    expect(result).toHaveLength(1)
    expect(result[0].images).toHaveLength(2)
    expect(result[0].price).toBe(128000)
  })
})
