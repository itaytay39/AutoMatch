const GOV_API = 'https://data.gov.il/api/3/action/datastore_search'
const RESOURCE_VEHICLES = '851ecab1-0622-4dbe-a6c7-f950cf82abf9'
const RESOURCE_ACCIDENTS = '056b136b-f6d4-4e6f-8f1e-099b4c5b5671'

export interface VehicleRecord {
  plate: string
  manufacturer: string
  model: string
  year: number
  color: string
  engineCC: number | null
  fuelType: string
  lastTestDate: string | null
  lastTestKm: number | null
  ownerCount: number | null
  accidentCount: number | null
  isCommercial: boolean
}

export interface VehicleLookupResult {
  found: boolean
  record?: VehicleRecord
  fraudSignals: string[]
  trustScore: number // 0-100
}

async function fetchGov(resourceId: string, filters: Record<string, string>): Promise<any[]> {
  const q = JSON.stringify(filters)
  const url = `${GOV_API}?resource_id=${resourceId}&q=${encodeURIComponent(q)}&limit=5`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`data.gov.il error: ${res.status}`)
  const json = await res.json()
  return json?.result?.records ?? []
}

export async function lookupVehicle(plate: string): Promise<VehicleLookupResult> {
  const cleanPlate = plate.replace(/[^0-9]/g, '')
  if (cleanPlate.length < 7 || cleanPlate.length > 8) {
    return { found: false, fraudSignals: ['מספר רישוי לא תקין'], trustScore: 0 }
  }

  const fraudSignals: string[] = []

  let records: any[] = []
  try {
    records = await fetchGov(RESOURCE_VEHICLES, { mispar_rechev: cleanPlate })
  } catch {
    return { found: false, fraudSignals: ['שגיאת חיבור ל-data.gov.il'], trustScore: 50 }
  }

  if (records.length === 0) {
    return { found: false, fraudSignals: ['מספר רישוי לא נמצא ברשומות'], trustScore: 0 }
  }

  const r = records[0]
  const year = parseInt(r.shnat_yitzur ?? '0', 10)
  const lastTestKm = r.km_acharon ? parseInt(r.km_acharon, 10) : null
  const ownerCount = r.baalim ? parseInt(r.baalim, 10) : null

  // Accident lookup
  let accidentCount = 0
  try {
    const accidents = await fetchGov(RESOURCE_ACCIDENTS, { mispar_rechev: cleanPlate })
    accidentCount = accidents.length
  } catch {}

  const record: VehicleRecord = {
    plate: cleanPlate,
    manufacturer: r.tozeret_nm ?? '',
    model: r.degem_nm ?? '',
    year,
    color: r.tzeva_rechev ?? '',
    engineCC: r.nefach_manoa ? parseInt(r.nefach_manoa, 10) : null,
    fuelType: r.sug_delek_nm ?? '',
    lastTestDate: r.mivchan_acharon_dt ?? null,
    lastTestKm,
    ownerCount,
    accidentCount,
    isCommercial: r.sug_rechev_nm?.includes('מסחרי') ?? false,
  }

  // Fraud signals from gov data
  if (accidentCount > 0) {
    fraudSignals.push(`${accidentCount} תאונות ברשומות המשטרה`)
  }
  if (ownerCount !== null && ownerCount >= 4) {
    fraudSignals.push(`${ownerCount} בעלים — היסטוריה ארוכה`)
  }
  const lastTestYear = record.lastTestDate ? new Date(record.lastTestDate).getFullYear() : null
  if (lastTestYear && new Date().getFullYear() - lastTestYear > 1) {
    fraudSignals.push('טסט לא עדכני — בדוק תוקף')
  }
  if (record.isCommercial) {
    fraudSignals.push('רכב מסחרי — שימוש כבד אפשרי')
  }

  const trustScore = Math.max(0, 100 - (fraudSignals.length * 20) - (accidentCount * 15))

  return { found: true, record, fraudSignals, trustScore }
}

export function crossCheckMileage(
  listedMileage: number,
  govLastTestKm: number | null,
): { suspicious: boolean; reason: string | null } {
  if (!govLastTestKm) return { suspicious: false, reason: null }
  if (listedMileage < govLastTestKm - 1000) {
    return {
      suspicious: true,
      reason: `ק"מ מוצהר (${listedMileage.toLocaleString()}) נמוך מהק"מ בטסט האחרון (${govLastTestKm.toLocaleString()}) — חשד לתיקון אוד`,
    }
  }
  return { suspicious: false, reason: null }
}
