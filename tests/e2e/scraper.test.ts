import { describe, it, expect } from 'vitest'
import { normalizeMake, normalizeCity, normalizePrice, normalizeMileage, normalizeYear } from '../../services/scraper/src/core/normalizer.js'
import { deduplicateListings } from '../../services/scraper/src/core/deduplicator.js'
import type { Listing } from '../../services/scraper/src/core/types.js'

describe('normalizer — Hebrew make names', () => {
  const cases: [string, string][] = [
    ['טויוטה', 'Toyota'], ['toyota', 'Toyota'],
    ['קיה', 'Kia'], ['כיה', 'Kia'], ['kia', 'Kia'],
    ['יונדאי', 'Hyundai'], ['hyundai', 'Hyundai'],
    ['מזדה', 'Mazda'], ['mazda', 'Mazda'],
    ['טסלה', 'Tesla'], ['tesla', 'Tesla'],
  ]
  for (const [input, expected] of cases) {
    it(`"${input}" → "${expected}"`, () => expect(normalizeMake(input)).toBe(expected))
  }
})

describe('normalizer — city shortcuts', () => {
  it('expands ת"א', () => expect(normalizeCity('ת"א')).toBe('תל אביב'))
  it('expands פ"ת', () => expect(normalizeCity('פ"ת')).toBe('פתח תקווה'))
  it('expands ר"ג', () => expect(normalizeCity('ר"ג')).toBe('רמת גן'))
  it('expands ב"ש', () => expect(normalizeCity('ב"ש')).toBe('באר שבע'))
  it('passes through full city name', () => expect(normalizeCity('חיפה')).toBe('חיפה'))
})

describe('normalizer — price & mileage parsing', () => {
  it('parses ₪ 129,900', () => expect(normalizePrice('₪ 129,900')).toBe(129900))
  it('parses 89000 ₪', () => expect(normalizePrice('89000 ₪')).toBe(89000))
  it('parses km string', () => expect(normalizeMileage('45,000 ק"מ')).toBe(45000))
  it('parses year 2021', () => expect(normalizeYear('2021')).toBe(2021))
  it('rejects future year 2099', () => expect(normalizeYear('2099')).toBe(0))
  it('rejects old year 1980', () => expect(normalizeYear('1980')).toBe(0))
})

describe('deduplicator', () => {
  const base: Omit<Listing, 'source' | 'externalId' | 'url' | 'price' | 'images'> = {
    title: 'Toyota Corolla', make: 'Toyota', model: 'Corolla', year: 2021, mileage: 45000,
  }

  it('keeps unique cars separate', () => {
    const listings: Listing[] = [
      { ...base, externalId: '1', source: 'yad2', url: '', price: 130000, images: ['a.jpg'] },
      { ...base, make: 'Kia', model: 'Stonic', externalId: '2', source: 'yad2', url: '', price: 90000, images: ['b.jpg'] },
    ]
    expect(deduplicateListings(listings)).toHaveLength(2)
  })

  it('merges same car from two sources — keeps lower price', () => {
    const listings: Listing[] = [
      { ...base, externalId: '1', source: 'yad2', url: '', price: 132000, images: ['a.jpg'] },
      { ...base, externalId: '2', source: 'autoboom', url: '', price: 128000, images: ['b.jpg'] },
    ]
    const result = deduplicateListings(listings)
    expect(result).toHaveLength(1)
    expect(result[0].price).toBe(128000)
  })

  it('merges images from both sources', () => {
    const listings: Listing[] = [
      { ...base, externalId: '1', source: 'yad2', url: '', price: 130000, images: ['a.jpg', 'c.jpg'] },
      { ...base, externalId: '2', source: 'autoboom', url: '', price: 131000, images: ['b.jpg'] },
    ]
    const result = deduplicateListings(listings)
    expect(result[0].images).toContain('a.jpg')
    expect(result[0].images).toContain('b.jpg')
  })

  it('rejects listing with 5000km tolerance mismatch', () => {
    const listings: Listing[] = [
      { ...base, mileage: 45000, externalId: '1', source: 'yad2', url: '', price: 130000, images: ['a.jpg'] },
      { ...base, mileage: 85000, externalId: '2', source: 'autoboom', url: '', price: 130000, images: ['b.jpg'] },
    ]
    expect(deduplicateListings(listings)).toHaveLength(2)
  })
})
