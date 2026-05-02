export interface ConditionScore {
  score: number        // 1-10
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  label: string        // "מצב מצוין" etc.
  breakdown: { category: string; points: number; maxPoints: number; note: string }[]
}

const GRADE_LABELS: Record<string, string> = {
  A: 'מצב מצוין',
  B: 'מצב טוב',
  C: 'מצב סביר',
  D: 'דורש בדיקה',
  F: 'מצב ירוד',
}

export function scoreCondition(listing: {
  year: number
  mileage: number | null
  price: number
  images: string | string[]
  description: string | null
  source: string
  odometerSuspicious?: boolean
  redFlags?: string[]
}): ConditionScore {
  const now = new Date()
  const carAgeYears = now.getFullYear() - listing.year
  const breakdown: ConditionScore['breakdown'] = []

  // 1. Age (0-2 pts)
  let agePts = 2
  if (carAgeYears > 10) agePts = 0
  else if (carAgeYears > 7) agePts = 0.5
  else if (carAgeYears > 5) agePts = 1
  else if (carAgeYears > 3) agePts = 1.5
  breakdown.push({
    category: 'גיל הרכב',
    points: agePts,
    maxPoints: 2,
    note: `${carAgeYears} שנים`,
  })

  // 2. Mileage (0-3 pts)
  let kmPts = 3
  const km = listing.mileage ?? carAgeYears * 15_000
  if (km > 200_000) kmPts = 0
  else if (km > 150_000) kmPts = 0.5
  else if (km > 120_000) kmPts = 1
  else if (km > 80_000) kmPts = 1.5
  else if (km > 50_000) kmPts = 2
  else if (km > 30_000) kmPts = 2.5
  if (listing.odometerSuspicious) kmPts = Math.min(kmPts, 0.5)
  breakdown.push({
    category: 'קילומטרז',
    points: kmPts,
    maxPoints: 3,
    note: `${km.toLocaleString('he-IL')} ק"מ`,
  })

  // 3. Images (0-2 pts)
  let imgCount = 0
  try { imgCount = Array.isArray(listing.images) ? listing.images.length : JSON.parse(listing.images as string).length } catch {}
  let imgPts = 0
  if (imgCount >= 10) imgPts = 2
  else if (imgCount >= 6) imgPts = 1.5
  else if (imgCount >= 3) imgPts = 1
  else if (imgCount >= 1) imgPts = 0.5
  breakdown.push({
    category: 'תמונות',
    points: imgPts,
    maxPoints: 2,
    note: `${imgCount} תמונות`,
  })

  // 4. Description quality (0-1.5 pts)
  const descLen = (listing.description ?? '').trim().length
  let descPts = 0
  if (descLen >= 200) descPts = 1.5
  else if (descLen >= 100) descPts = 1
  else if (descLen >= 50) descPts = 0.5
  breakdown.push({
    category: 'תיאור',
    points: descPts,
    maxPoints: 1.5,
    note: `${descLen} תווים`,
  })

  // 5. Source trust (0-1.5 pts)
  const trustedSources = ['yad2', 'colmobil', 'toyota-select', 'freesbe', 'eldan', 'carwiz']
  const sourcePts = trustedSources.some(s => listing.source.toLowerCase().includes(s)) ? 1.5 : 0.5
  breakdown.push({
    category: 'מקור',
    points: sourcePts,
    maxPoints: 1.5,
    note: listing.source,
  })

  // Total → scale to 1-10
  const total = breakdown.reduce((s, b) => s + b.points, 0)
  const maxTotal = breakdown.reduce((s, b) => s + b.maxPoints, 0)
  const raw = (total / maxTotal) * 9 + 1  // maps [0,max] → [1,10]
  const score = Math.round(raw * 10) / 10

  // Penalty for red flags
  const flags = listing.redFlags?.length ?? 0
  const penalized = Math.max(1, score - flags * 0.5)
  const final = Math.round(penalized * 10) / 10

  const grade: ConditionScore['grade'] =
    final >= 8.5 ? 'A' : final >= 7 ? 'B' : final >= 5.5 ? 'C' : final >= 4 ? 'D' : 'F'

  return { score: final, grade, label: GRADE_LABELS[grade], breakdown }
}
