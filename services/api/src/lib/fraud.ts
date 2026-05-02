const AVG_KM_PER_YEAR = 15000

export interface FraudAnalysis {
  daysOnLot: number
  odometerSuspicious: boolean
  odometerReason: string | null
  redFlags: string[]
  dealScore: 'great' | 'good' | 'fair' | 'suspicious'
}

export function analyzeListing(listing: {
  createdAt: Date
  mileage: number | null
  year: number
  price: number
  images: string
  description: string | null
  make: string
  model: string
}): FraudAnalysis {
  const now = new Date()
  const daysOnLot = Math.floor((now.getTime() - new Date(listing.createdAt).getTime()) / 86_400_000)

  const redFlags: string[] = []
  let odometerSuspicious = false
  let odometerReason: string | null = null

  // Odometer fraud detection
  if (listing.mileage !== null) {
    const carAgeYears = now.getFullYear() - listing.year
    const expectedMinKm = carAgeYears * 5_000
    const expectedMaxKm = carAgeYears * 30_000

    if (carAgeYears >= 2 && listing.mileage < expectedMinKm) {
      odometerSuspicious = true
      odometerReason = `קילומטרים חשודים: ${listing.mileage.toLocaleString()} ק"מ לרכב בן ${carAgeYears} שנים (צפוי מינימום ${expectedMinKm.toLocaleString()})`
      redFlags.push('קילומטרים חשודים — ייתכן תיקון אוד')
    }

    // Last-digit bias test (Benford-adjacent: too many round numbers)
    const lastTwoDigits = listing.mileage % 100
    if (lastTwoDigits === 0 && listing.mileage > 10_000) {
      // Round numbers are suspicious but not definitive — just flag quietly
      redFlags.push('קילומטרים מעוגלים — בדוק היסטוריית רכב')
    }
  }

  // Image count
  let imageCount = 0
  try {
    imageCount = JSON.parse(listing.images).length
  } catch {}
  if (imageCount < 3) {
    redFlags.push(`תמונות מעטות (${imageCount}) — בקש תמונות נוספות`)
  }

  // Short description
  const descLen = (listing.description ?? '').trim().length
  if (descLen < 50) {
    redFlags.push('תיאור קצר מאוד — מידע חסר')
  }

  // Long time on lot — possible issue or overpriced
  if (daysOnLot > 60) {
    redFlags.push(`${daysOnLot} ימים בשוק — ייתכן מחיר גבוה מדי`)
  }

  // Deal score
  let dealScore: FraudAnalysis['dealScore'] = 'fair'
  if (odometerSuspicious || redFlags.length >= 3) dealScore = 'suspicious'
  else if (redFlags.length === 0 && daysOnLot <= 7) dealScore = 'great'
  else if (redFlags.length <= 1 && daysOnLot <= 30) dealScore = 'good'

  return { daysOnLot, odometerSuspicious, odometerReason, redFlags, dealScore }
}
