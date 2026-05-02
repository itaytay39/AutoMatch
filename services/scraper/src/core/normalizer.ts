// Canonical make/model normalization for Hebrew + English variants
const MAKE_MAP: Record<string, string> = {
  'טויוטה': 'Toyota', 'toyota': 'Toyota',
  'יונדאי': 'Hyundai', 'hyundai': 'Hyundai',
  'קיה': 'Kia', 'כיה': 'Kia', 'kia': 'Kia',
  'מזדה': 'Mazda', 'mazda': 'Mazda',
  'סקודה': 'Skoda', 'skoda': 'Skoda',
  'פולקסווגן': 'Volkswagen', 'vw': 'Volkswagen', 'volkswagen': 'Volkswagen',
  'פורד': 'Ford', 'ford': 'Ford',
  'שברולט': 'Chevrolet', 'chevrolet': 'Chevrolet',
  'ניסן': 'Nissan', 'nissan': 'Nissan',
  'הונדה': 'Honda', 'honda': 'Honda',
  'מיצובישי': 'Mitsubishi', 'mitsubishi': 'Mitsubishi',
  'סובארו': 'Subaru', 'subaru': 'Subaru',
  'סיאט': 'Seat', 'seat': 'Seat',
  'אאודי': 'Audi', 'audi': 'Audi',
  'ב.מ.ו': 'BMW', 'bmw': 'BMW',
  'מרצדס': 'Mercedes-Benz', 'mercedes': 'Mercedes-Benz',
  'וולוו': 'Volvo', 'volvo': 'Volvo',
  'לקסוס': 'Lexus', 'lexus': 'Lexus',
  'ג\'יפ': 'Jeep', 'jeep': 'Jeep',
  'פיג\'ו': 'Peugeot', 'peugeot': 'Peugeot',
  'רנו': 'Renault', 'renault': 'Renault',
  'סיטרואן': 'Citroën', 'citroen': 'Citroën',
  'אופל': 'Opel', 'opel': 'Opel',
  'פיאט': 'Fiat', 'fiat': 'Fiat',
  'אלפא רומיאו': 'Alfa Romeo', 'alfa romeo': 'Alfa Romeo',
  'טסלה': 'Tesla', 'tesla': 'Tesla',
  'בי.וואי.די': 'BYD', 'byd': 'BYD',
}

const CITY_MAP: Record<string, string> = {
  'ת"א': 'תל אביב', 'תל-אביב': 'תל אביב', 'tel aviv': 'תל אביב',
  'י-ם': 'ירושלים', "ירושלים": 'ירושלים', 'jerusalem': 'ירושלים',
  'חיפה': 'חיפה', 'haifa': 'חיפה',
  'ב"ש': 'באר שבע', 'באר-שבע': 'באר שבע', 'beer sheva': 'באר שבע',
  'פ"ת': 'פתח תקווה', 'petah tikva': 'פתח תקווה',
  'ר"ג': 'רמת גן', 'ramat gan': 'רמת גן',
  'ר"ל': 'ראשון לציון', 'rishon lezion': 'ראשון לציון',
  'נתניה': 'נתניה', 'netanya': 'נתניה',
  'אשדוד': 'אשדוד', 'ashdod': 'אשדוד',
  'חולון': 'חולון', 'holon': 'חולון',
}

export function normalizeMake(raw: string): string {
  const key = raw.trim().toLowerCase()
  return MAKE_MAP[key] ?? MAKE_MAP[raw.trim()] ?? raw.trim()
}

export function normalizeCity(raw: string): string {
  const key = raw.trim()
  return CITY_MAP[key.toLowerCase()] ?? CITY_MAP[key] ?? key
}

export function normalizePrice(raw: string): number {
  return parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0
}

export function normalizeMileage(raw: string): number {
  return parseInt(raw.replace(/[^0-9]/g, ''), 10) || 0
}

export function normalizeYear(raw: string): number {
  const y = parseInt(raw.replace(/[^0-9]/g, ''), 10)
  return y > 1990 && y <= new Date().getFullYear() + 1 ? y : 0
}
