export interface SalvageCheck {
  riskLevel: 'low' | 'medium' | 'high'
  warnings: string[]
  tips: string[]
}

interface ListingForSalvage {
  description: string | null
  price: number
  mileage: number | null
  year: number
  city: string | null
  images: string | string[]
  source: string
}

const FLOOD_KEYWORDS = [
  { he: 'שטפון', en: 'flood' },
  { he: 'מים', en: 'water' },
  { he: 'רטיבות', en: 'humidity' },
  { he: 'חלודה', en: 'rust' },
  { he: 'קרוסייד', en: 'corrosion' },
]

const SALVAGE_KEYWORDS = [
  { he: 'אובדן גמור', en: 'total loss' },
  { he: 'ביטוח שיקום', en: 'salvage title' },
  { he: 'טוטל לוס', en: 'total loss' },
  { he: 'כתוש', en: 'crushed' },
  { he: 'שיקום', en: 'rebuilt' },
]

const FIRE_KEYWORDS = [
  { he: 'שריפה', en: 'fire' },
  { he: 'שרוף', en: 'burned' },
  { he: 'עשן', en: 'smoke' },
]

// Israeli flood risk cities (2023-2024 flood zones)
const FLOOD_RISK_CITIES = [
  'חדרה', 'נהריה', 'עכו', 'כרמיאל', 'קריית שמונה', 'בית שאן',
  'טבריה', 'קריית ביאליק', 'קריית מוצקין',
]

function parseImages(images: string | string[]): string[] {
  if (Array.isArray(images)) return images
  try { return JSON.parse(images) } catch { return [] }
}

export function checkSalvageRisk(listing: ListingForSalvage): SalvageCheck {
  const warnings: string[] = []
  const tips: string[] = []
  const desc = (listing.description ?? '').toLowerCase()
  const imgs = parseImages(listing.images)

  // Keyword detection
  for (const kw of FLOOD_KEYWORDS) {
    if (desc.includes(kw.he) || desc.includes(kw.en)) {
      warnings.push(`תיאור מזכיר נזק מים: "${kw.he}"`)
    }
  }
  for (const kw of SALVAGE_KEYWORDS) {
    if (desc.includes(kw.he) || desc.includes(kw.en)) {
      warnings.push(`תיאור מזכיר אובדן גמור/שיקום: "${kw.he}"`)
    }
  }
  for (const kw of FIRE_KEYWORDS) {
    if (desc.includes(kw.he) || desc.includes(kw.en)) {
      warnings.push(`תיאור מזכיר שריפה: "${kw.he}"`)
    }
  }

  // Price too low for age/mileage — common salvage signal
  const carAge = new Date().getFullYear() - listing.year
  const expectedMinPrice = Math.max(30_000, 180_000 - carAge * 12_000)
  if (listing.price < expectedMinPrice * 0.55 && carAge < 8) {
    warnings.push(`מחיר נמוך מאוד ביחס לגיל הרכב — ייתכן רכב משוקם`)
  }

  // Few images — could be hiding damage
  if (imgs.length < 3) {
    warnings.push(`${imgs.length} תמונות בלבד — קשה לאמת מצב הרכב`)
    tips.push('בקש תמונות תחתית הרכב, מנוע, ותא מטען')
  }

  // Flood risk city
  const city = listing.city ?? ''
  if (FLOOD_RISK_CITIES.some(c => city.includes(c))) {
    tips.push(`${city} הייתה בסיכון שטפונות — בדוק היסטוריית רכב ב-data.gov.il`)
  }

  // Universal tips for high-risk listings
  if (warnings.length >= 2) {
    tips.push('בצע בדיקת רכב מקצועית לפני קנייה')
    tips.push('בדוק לחות בתא המנוע ובצדדים הפנימיים של הדלתות')
    tips.push('בקש דו"ח כרמל/אוטוחיים על היסטוריית הרכב')
  }

  tips.push('בדוק VIN ב-data.gov.il לתאונות מדווחות')

  const hasSalvageKeyword = SALVAGE_KEYWORDS.some(kw => desc.includes(kw.he) || desc.includes(kw.en))
  const riskLevel =
    hasSalvageKeyword || warnings.length >= 3 ? 'high'
    : warnings.length >= 1 ? 'medium'
    : 'low'

  return { riskLevel, warnings, tips }
}
