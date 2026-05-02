import { describe, it, expect } from 'vitest'
import { compareToMarket, calcImportSavings, getSeasonalAlert } from './market.js'

const listing = { make: 'Kia', model: 'Stonic', year: 2019, mileage: 68_000, price: 87_500 }

describe('compareToMarket', () => {
  it('returns unknown when fewer than 3 peers', () => {
    const r = compareToMarket(listing, [{ price: 90_000, mileage: 70_000 }])
    expect(r.priceRating).toBe('unknown')
  })

  it('detects great deal when price is 20% below avg', () => {
    const peers = Array(10).fill({ price: 110_000, mileage: 65_000 })
    const r = compareToMarket({ ...listing, price: 87_000 }, peers)
    expect(r.priceRating).toBe('great_deal')
  })

  it('detects overpriced when 20% above avg', () => {
    const peers = Array(10).fill({ price: 70_000, mileage: 65_000 })
    const r = compareToMarket(listing, peers)
    expect(r.priceRating).toBe('overpriced')
  })

  it('returns avg market price', () => {
    const peers = Array(5).fill({ price: 90_000, mileage: 65_000 })
    const r = compareToMarket(listing, peers)
    expect(r.avgMarketPrice).toBe(90_000)
  })
})

describe('calcImportSavings', () => {
  it('calculates total import cost', () => {
    const r = calcImportSavings(200_000, 80_000)
    expect(r.total).toBeGreaterThan(80_000)
    expect(r.customs).toBeGreaterThan(0)
    expect(r.vat).toBeGreaterThan(0)
  })

  it('marks worth importing when savings > 10k', () => {
    const r = calcImportSavings(300_000, 50_000)
    expect(r.worthImporting).toBe(true)
  })
})

describe('getSeasonalAlert', () => {
  it('returns seasonal info', () => {
    const r = getSeasonalAlert()
    expect(typeof r.isLowSeason).toBe('boolean')
  })
})
