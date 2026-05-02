export interface AnomalyResult {
  anomalyScore: number       // 0-100, higher = more suspicious
  anomalyLevel: 'clean' | 'watch' | 'suspicious' | 'alert'
  signals: AnomalySignal[]
}

export interface AnomalySignal {
  name: string
  weight: number             // 0-1
  triggered: boolean
  detail: string
}

interface ListingForAnomaly {
  price: number
  mileage: number | null
  year: number
  description: string | null
  images: string | string[]
  source: string
  city: string | null
  make: string
  model: string
}

interface MarketContext {
  avgPrice: number
  stdPrice: number
  avgMileage: number
  stdMileage: number
}

function parseImages(images: string | string[]): string[] {
  if (Array.isArray(images)) return images
  try { return JSON.parse(images) } catch { return [] }
}

function zScore(value: number, mean: number, std: number): number {
  if (std === 0) return 0
  return Math.abs((value - mean) / std)
}

export function detectAnomalies(
  listing: ListingForAnomaly,
  context: MarketContext
): AnomalyResult {
  const signals: AnomalySignal[] = []
  const now = new Date()
  const carAge = now.getFullYear() - listing.year
  const imgs = parseImages(listing.images)

  // 1. Price outlier (z-score > 2 = suspicious)
  const priceZ = zScore(listing.price, context.avgPrice, context.stdPrice)
  const priceTooLow = listing.price < context.avgPrice * 0.6
  const priceTooHigh = listing.price > context.avgPrice * 1.6
  signals.push({
    name: 'price_outlier',
    weight: 0.25,
    triggered: priceZ > 2.5 || priceTooLow || priceTooHigh,
    detail: priceTooLow
      ? `מחיר נמוך מהממוצע ב-${Math.round((1 - listing.price / context.avgPrice) * 100)}%`
      : priceTooHigh
        ? `מחיר גבוה מהממוצע ב-${Math.round((listing.price / context.avgPrice - 1) * 100)}%`
        : `מחיר תקין (z=${priceZ.toFixed(1)})`,
  })

  // 2. Mileage anomaly
  const km = listing.mileage ?? carAge * 15_000
  const expectedKm = carAge * 15_000
  const mileageRatio = km / Math.max(expectedKm, 1)
  const mileageZ = zScore(km, context.avgMileage, context.stdMileage)
  signals.push({
    name: 'mileage_anomaly',
    weight: 0.20,
    triggered: mileageRatio < 0.25 || mileageZ > 3,
    detail: mileageRatio < 0.25
      ? `קילומטרים נמוכים מאוד ביחס לגיל (${km.toLocaleString()} ק"מ לרכב בן ${carAge} שנים)`
      : `קילומטרז תקין`,
  })

  // 3. Price-mileage inversion (high price + high mileage OR low price + low mileage)
  const highPrice = listing.price > context.avgPrice * 1.15
  const highMileage = km > context.avgMileage * 1.3
  const lowPrice = listing.price < context.avgPrice * 0.85
  const lowMileage = km < context.avgMileage * 0.5
  signals.push({
    name: 'price_mileage_inversion',
    weight: 0.15,
    triggered: (highPrice && highMileage) || (lowPrice && lowMileage && mileageRatio < 0.3),
    detail: highPrice && highMileage
      ? 'מחיר גבוה למרות קילומטרים גבוהים'
      : lowPrice && lowMileage
        ? 'מחיר נמוך חשוד למרות קילומטרים נמוכים — אפשרי תיקון מד'
        : 'יחס מחיר/קילומטרים תקין',
  })

  // 4. Image count suspicion
  signals.push({
    name: 'few_images',
    weight: 0.15,
    triggered: imgs.length < 2,
    detail: imgs.length === 0
      ? 'אין תמונות — מפרסם אנונימי?'
      : `${imgs.length} תמונות בלבד`,
  })

  // 5. Description quality
  const desc = (listing.description ?? '').trim()
  const hasKeywords = /תאונ|פגיע|שטפון|שריפה|ברד|ג.*ניבה|גניבה/i.test(desc)
  const descLen = desc.length
  signals.push({
    name: 'description_flags',
    weight: 0.10,
    triggered: hasKeywords || descLen < 20,
    detail: hasKeywords
      ? 'תיאור מזכיר נזק: תאונה/שטפון/גניבה'
      : descLen < 20
        ? 'תיאור קצר מאוד — מידע חסר'
        : 'תיאור תקין',
  })

  // 6. Round-number mileage (Benford-adjacent)
  const lastThree = (listing.mileage ?? 0) % 1000
  signals.push({
    name: 'round_mileage',
    weight: 0.08,
    triggered: lastThree === 0 && (listing.mileage ?? 0) > 5_000,
    detail: lastThree === 0 ? 'קילומטרים מעוגלים לאלפים — ייתכן עיגול מכוון' : 'קילומטרים לא מעוגלים',
  })

  // 7. Year/price mismatch (old car priced like new)
  const newCarThreshold = now.getFullYear() - 2
  signals.push({
    name: 'year_price_mismatch',
    weight: 0.07,
    triggered: carAge > 5 && listing.price > context.avgPrice * 1.3,
    detail: carAge > 5 && listing.price > context.avgPrice * 1.3
      ? `רכב בן ${carAge} שנים במחיר גבוה מאוד (${listing.price.toLocaleString()} ₪)`
      : 'יחס גיל/מחיר תקין',
  })

  // Compute score: weighted sum of triggered signals
  let rawScore = 0
  let maxScore = 0
  for (const sig of signals) {
    maxScore += sig.weight
    if (sig.triggered) rawScore += sig.weight
  }
  const anomalyScore = Math.round((rawScore / maxScore) * 100)

  const anomalyLevel =
    anomalyScore >= 60 ? 'alert'
    : anomalyScore >= 35 ? 'suspicious'
    : anomalyScore >= 15 ? 'watch'
    : 'clean'

  return { anomalyScore, anomalyLevel, signals }
}

export function buildMarketContext(peers: ListingForAnomaly[]): MarketContext {
  if (peers.length === 0) return { avgPrice: 0, stdPrice: 0, avgMileage: 0, stdMileage: 0 }

  const prices = peers.map(p => p.price)
  const mileages = peers.map(p => p.mileage ?? 0)

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length
  const std = (arr: number[], mean: number) =>
    Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length)

  const avgPrice = avg(prices)
  const avgMileage = avg(mileages)

  return {
    avgPrice,
    stdPrice: std(prices, avgPrice),
    avgMileage,
    stdMileage: std(mileages, avgMileage),
  }
}
