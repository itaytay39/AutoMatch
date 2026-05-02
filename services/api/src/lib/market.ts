export interface MarketComparison {
  avgMarketPrice: number | null
  priceDiff: number | null          // negative = cheaper than market
  priceDiffPct: number | null
  priceRating: 'great_deal' | 'good_deal' | 'fair' | 'overpriced' | 'unknown'
  priceRatingLabel: string
  similarCount: number
}

export interface ImportCost {
  basePrice: number
  customs: number       // ~85% of base
  vat: number           // 17%
  licensing: number     // ~2,500₪
  transport: number     // ~3,500₪
  total: number
  savings: number       // local price - import total
  worthImporting: boolean
}

export interface SeasonalAlert {
  isLowSeason: boolean
  tip: string | null
}

// Market comparison: compares listing to others with same make/model/year (±1yr) from DB prices
// In production this would query the DB — here we use a statistical model
export function compareToMarket(listing: {
  make: string
  model: string
  year: number
  mileage: number | null
  price: number
}, peers: { price: number; mileage: number | null }[]): MarketComparison {
  if (peers.length < 3) {
    return {
      avgMarketPrice: null,
      priceDiff: null,
      priceDiffPct: null,
      priceRating: 'unknown',
      priceRatingLabel: 'אין מספיק נתונים',
      similarCount: peers.length,
    }
  }

  // Remove outliers (±2 std dev)
  const prices = peers.map(p => p.price)
  const mean = prices.reduce((a, b) => a + b, 0) / prices.length
  const std = Math.sqrt(prices.map(p => (p - mean) ** 2).reduce((a, b) => a + b, 0) / prices.length)
  const filtered = prices.filter(p => Math.abs(p - mean) <= 2 * std)
  const avg = Math.round(filtered.reduce((a, b) => a + b, 0) / filtered.length)

  const diff = listing.price - avg
  const pct = Math.round((diff / avg) * 100)

  let priceRating: MarketComparison['priceRating']
  let priceRatingLabel: string
  if (pct <= -15) { priceRating = 'great_deal'; priceRatingLabel = `זול ב-${Math.abs(pct)}% מהשוק 🔥` }
  else if (pct <= -5) { priceRating = 'good_deal'; priceRatingLabel = `זול ב-${Math.abs(pct)}% מהשוק` }
  else if (pct <= 5) { priceRating = 'fair'; priceRatingLabel = 'מחיר שוק' }
  else if (pct <= 15) { priceRating = 'overpriced'; priceRatingLabel = `יקר ב-${pct}% מהשוק` }
  else { priceRating = 'overpriced'; priceRatingLabel = `יקר ב-${pct}% מהשוק ⚠` }

  return {
    avgMarketPrice: avg,
    priceDiff: diff,
    priceDiffPct: pct,
    priceRating,
    priceRatingLabel,
    similarCount: filtered.length,
  }
}

// Import cost calculator (Israeli customs law 2024)
export function calcImportCost(foreignPriceILS: number): ImportCost {
  const customs = Math.round(foreignPriceILS * 0.85)
  const vat = Math.round((foreignPriceILS + customs) * 0.17)
  const licensing = 2_500
  const transport = 3_500
  const total = foreignPriceILS + customs + vat + licensing + transport
  return { basePrice: foreignPriceILS, customs, vat, licensing, transport, total, savings: 0, worthImporting: false }
}

export function calcImportSavings(localPrice: number, foreignPriceILS: number): ImportCost {
  const cost = calcImportCost(foreignPriceILS)
  const savings = localPrice - cost.total
  return { ...cost, savings, worthImporting: savings > 10_000 }
}

// Seasonal pricing intelligence (Israeli market)
const LOW_SEASON_MONTHS = [1, 2, 8, 9]   // January, February (post-holiday), August (pre-budget), September
const HOLIDAY_TIPS: Record<number, string> = {
  1: 'ינואר — מחירים נמוכים לאחר עונת החגים, זמן טוב לקנות',
  2: 'פברואר — שוק רגוע, כוח מיקוח גבוה',
  8: 'אוגוסט — לפני השנה החדשה, סוחרים מחסלים מלאי',
  9: 'ספטמבר — לפני החגים, ביקוש עולה — מחירים עלולים לעלות',
  12: 'דצמבר — סוף שנה, סוחרים צריכים לסגור יעדים — מחיר נוח',
}

export function getSeasonalAlert(): SeasonalAlert {
  const month = new Date().getMonth() + 1
  const isLowSeason = LOW_SEASON_MONTHS.includes(month)
  const tip = HOLIDAY_TIPS[month] ?? null
  return { isLowSeason, tip }
}
