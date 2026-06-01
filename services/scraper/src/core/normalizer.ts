// Canonical make/model/city normalization for Hebrew + English variants
const MAKE_MAP: Record<string, string> = {
  'טויוטה': 'Toyota', 'toyota': 'Toyota',
  'יונדאי': 'Hyundai', 'hyundai': 'Hyundai',
  'קיה': 'Kia', 'כיה': 'Kia', 'kia': 'Kia',
  'מזדה': 'Mazda', 'מאזדה': 'Mazda', 'mazda': 'Mazda',
  'סקודה': 'Skoda', 'skoda': 'Skoda',
  'פולקסווגן': 'Volkswagen', 'vw': 'Volkswagen', 'volkswagen': 'Volkswagen',
  'פורד': 'Ford', 'ford': 'Ford',
  'שברולט': 'Chevrolet', 'chevrolet': 'Chevrolet',
  'ניסן': 'Nissan', 'ניסאן': 'Nissan', 'nissan': 'Nissan',
  'הונדה': 'Honda', 'honda': 'Honda',
  'מיצובישי': 'Mitsubishi', 'mitsubishi': 'Mitsubishi',
  'סובארו': 'Subaru', 'subaru': 'Subaru',
  'סיאט': 'Seat', 'seat': 'Seat',
  'אאודי': 'Audi', 'audi': 'Audi',
  'ב.מ.ו': 'BMW', 'ב.מ.וו': 'BMW', 'bmw': 'BMW',
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
  'סוזוקי': 'Suzuki', 'suzuki': 'Suzuki',
  'דאצ\'יה': 'Dacia', 'dacia': 'Dacia',
}

export const MODEL_MAP: Record<string, string> = {
  // Toyota
  'קורולה': 'Corolla', 'קאמרי': 'Camry', 'יאריס': 'Yaris', 'ראב4': 'RAV4', 'c-hr': 'C-HR',
  'פריוס': 'Prius', 'היילוקס': 'Hilux', 'לנד קרוזר': 'Land Cruiser',
  // Hyundai
  'טוסון': 'Tucson', 'איוניק': 'Ioniq', 'i20': 'i20', 'i30': 'i30', 'i35': 'i35',
  'סנטה פה': 'Santa Fe', 'אקסנט': 'Accent', 'אלנטרה': 'Elantra', 'קונה': 'Kona',
  // Kia
  'סטוניק': 'Stonic', 'ספורטאג': 'Sportage', 'סורנטו': 'Sorento', 'ניירו': 'Niro',
  'פיקנטו': 'Picanto', 'סיד': 'Ceed', 'סול': 'Soul', 'טלורייד': 'Telluride',
  'קרניבל': 'Carnival', 'ev6': 'EV6', 'ev9': 'EV9',
  // Mazda
  'מאזדה 3': 'Mazda3', 'מאזדה 6': 'Mazda6', 'cx-5': 'CX-5', 'cx-3': 'CX-3',
  // Volkswagen
  'גולף': 'Golf', 'פולו': 'Polo', 'טיגואן': 'Tiguan', 'פאסאט': 'Passat', 't-roc': 'T-Roc',
  // BMW
  'סדרה 3': 'Series 3', 'סדרה 5': 'Series 5', 'x1': 'X1', 'x3': 'X3', 'x5': 'X5',
  // Mercedes
  'c class': 'C-Class', 'e class': 'E-Class', 'gla': 'GLA', 'glc': 'GLC',
  // Skoda
  'אוקטביה': 'Octavia', 'קודיאק': 'Kodiaq', 'קאמיק': 'Kamiq', 'פאביה': 'Fabia',
  // Nissan
  'קשקאי': 'Qashqai', 'ג\'וק': 'Juke', 'מיקרה': 'Micra', 'ליף': 'Leaf',
  // Ford
  'פוקוס': 'Focus', 'פיאסטה': 'Fiesta', 'קוגה': 'Kuga', 'מוסטנג': 'Mustang',
  // Honda
  'סיויק': 'Civic', 'ג\'אז': 'Jazz', 'HR-V': 'HR-V', 'CR-V': 'CR-V',
  // Tesla
  'מודל 3': 'Model 3', 'מודל y': 'Model Y', 'מודל s': 'Model S', 'מודל x': 'Model X',
  // Mitsubishi
  'אאוטלנדר': 'Outlander', 'ASX': 'ASX', 'ספייס סטאר': 'Space Star',
}

const CITY_MAP: Record<string, string> = {
  'ת"א': 'תל אביב', 'תל-אביב': 'תל אביב', 'tel aviv': 'תל אביב',
  'י-ם': 'ירושלים', 'ירושלים': 'ירושלים', 'jerusalem': 'ירושלים',
  'חיפה': 'חיפה', 'haifa': 'חיפה',
  'ב"ש': 'באר שבע', 'באר-שבע': 'באר שבע', 'beer sheva': 'באר שבע',
  'פ"ת': 'פתח תקווה', 'petah tikva': 'פתח תקווה',
  'ר"ג': 'רמת גן', 'ramat gan': 'רמת גן',
  'ר"ל': 'ראשון לציון', 'rishon lezion': 'ראשון לציון',
  'נתניה': 'נתניה', 'netanya': 'נתניה',
  'אשדוד': 'אשדוד', 'ashdod': 'אשדוד',
  'חולון': 'חולון', 'holon': 'חולון',
  'אילת': 'אילת', 'eilat': 'אילת',
  'קריות': 'קריות', 'krayot': 'קריות',
  'קרית ביאליק': 'קריות', 'קרית אתא': 'קריות', 'קרית מוצקין': 'קריות',
}

export function normalizeMake(raw: string): string {
  const key = raw.trim().toLowerCase()
  return MAKE_MAP[key] ?? MAKE_MAP[raw.trim()] ?? raw.trim()
}

export function normalizeModel(raw: string): string {
  const key = raw.trim().toLowerCase()
  return MODEL_MAP[key] ?? MODEL_MAP[raw.trim()] ?? raw.trim()
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
