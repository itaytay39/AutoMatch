// AutoMatch — Canonical TypeScript types
// Drop this file at `packages/types/index.ts` or `apps/web/lib/types.ts`.
// Every other file imports from here — never inline types.

// ════════════════════════════════════════════════════════════════
// Enums
// ════════════════════════════════════════════════════════════════

export type Source = 'yad2' | 'autoboom' | 'colmobil' | 'car2' | 'autocenter';

export type FuelType = 'בנזין' | 'היברידי' | 'חשמלי' | 'דיזל';

export type Body = 'סדאן' | 'האצ׳בק' | 'קרוסאובר' | 'סטיישן' | 'קופה' | 'מיניוואן';

export type Gearbox = 'אוטומט' | 'ידני' | 'CVT';

export type SellerType = 'פרטי' | 'סוכנות';

export type Region = 'צפון' | 'מרכז' | 'ירושלים' | 'דרום';

export type BadgeKind = 'good' | 'fair' | 'high';

export type PriceBadge = 'מחיר טוב' | 'מחיר סביר' | 'מעל מחירון';

// ════════════════════════════════════════════════════════════════
// Vehicle
// ════════════════════════════════════════════════════════════════

export interface VehicleSpec {
  engine: string;       // "1.8L Hybrid"
  power: string;        // "122 כ״ס"
  accel: string;        // "10.9 שנ׳"
  range?: string;       // "1,000 ק״מ" (electric/hybrid)
  battery?: string;     // "77 kWh"
  drivetrain?: string;  // "FWD" | "RWD" | "AWD"
}

export interface VehicleImage {
  url: string;          // signed URL
  width: number;
  height: number;
  order: number;
}

/** Lightweight summary used in lists, cards, carousels. */
export interface VehicleSummary {
  id: string;
  make: string;             // טויוטה
  model: string;            // קורולה הייבריד
  trim?: string;            // Hybrid LE

  year: number;
  km: number;
  hand: number;             // 1, 2, 3, …

  price: number;            // current ₪
  listPrice: number;        // computed fair value
  priceDelta: number;       // last-week diff (-4100 = dropped)
  deltaPct: number;         // 30-day trend %

  body: Body;
  fuel: FuelType;
  gearbox: Gearbox;

  region: Region;
  location: string;         // "תל אביב"

  source: Source;
  badge: PriceBadge;
  badgeKind: BadgeKind;

  postedDays: number;       // 0 = today, 1 = yesterday, …
  images: number;           // photo count
  thumbnail: string;        // signed URL of cover image
  history: number[];        // last 30 daily prices for sparkline
}

/** Full detail returned for /vehicle/[id]. */
export interface VehicleDetail extends VehicleSummary {
  description: string;
  spec: VehicleSpec;
  sellerType: SellerType;
  sellerName?: string;
  sellerPhoneMasked?: string;     // "050-***-1234" — call goes through proxy
  sellerRating?: number;          // 4.0..5.0
  sellerListingsCount?: number;
  imagesList: VehicleImage[];
  externalUrl?: string;           // link back to source listing
}

// ════════════════════════════════════════════════════════════════
// Filter & Sort
// ════════════════════════════════════════════════════════════════

export interface FilterState {
  body: Body[];
  fuel: FuelType[];
  gearbox: Gearbox | 'any';
  yearMin: number;
  yearMax: number;
  priceMin: number;
  priceMax: number;
  kmMax: number;
  hand: number | 'any';
  region: Region[];
  sources: Source[];
}

export const FILTER_DEFAULTS: FilterState = {
  body: [],
  fuel: [],
  gearbox: 'any',
  yearMin: 2018,
  yearMax: 2024,
  priceMin: 30_000,
  priceMax: 250_000,
  kmMax: 200_000,
  hand: 'any',
  region: [],
  sources: [],
};

export type SortId =
  | 'rel'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'year'
  | 'km'
  | 'drop';

// ════════════════════════════════════════════════════════════════
// User & interactions
// ════════════════════════════════════════════════════════════════

export interface User {
  id: string;
  phone: string;             // E.164 (+9725...)
  email?: string;
  name?: string;
  avatarInitial: string;     // "א"
  memberSince: string;       // ISO date
  preferences: UserPreferences;
}

export interface UserPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  digestDaily: boolean;
  quietStart?: string;       // "22:00"
  quietEnd?: string;         // "07:00"
}

export interface SavedVehicle {
  vehicleId: string;
  savedAt: string;
}

export interface RecentView {
  vehicleId: string;
  viewedAt: string;
}

// ════════════════════════════════════════════════════════════════
// Alerts
// ════════════════════════════════════════════════════════════════

export interface AlertCriteria {
  makes: string[];           // ["טויוטה", "יונדאי"]
  body?: Body[];
  fuel?: FuelType[];
  yearMin?: number;
  priceMax?: number;
  kmMax?: number;
  hand?: number | 'any';
  region?: Region[];
}

export interface AlertNotif {
  push: boolean;
  email: boolean;
  instant: boolean;          // true = real-time, false = daily digest
}

export interface Alert {
  id: string;
  userId: string;
  name: string;
  criteria: AlertCriteria;
  notif: AlertNotif;
  createdAt: string;
  lastMatchAt?: string;
  matches: number;           // total match count
  filters: string[];         // human-readable summary chips
}

export interface AlertMatch {
  id: string;
  alertId: string;
  vehicle: VehicleSummary;
  matchedAt: string;
  notifiedAt?: string;
  read: boolean;
}

// ════════════════════════════════════════════════════════════════
// Comparison
// ════════════════════════════════════════════════════════════════

export type CompareRowKey =
  | 'price' | 'badge' | 'year' | 'km' | 'hand'
  | 'fuel' | 'body' | 'gearbox' | 'power' | 'accel'
  | 'location' | 'source';

export interface CompareRow {
  key: CompareRowKey;
  label: string;
  get: (v: VehicleSummary | VehicleDetail) => string | number;
  winnerKey?: 'price' | 'km' | 'year' | 'hand';   // which row picks a winner
  winnerNote?: string;                              // "הכי זול"
}

// ════════════════════════════════════════════════════════════════
// Finance
// ════════════════════════════════════════════════════════════════

export interface FinanceInputs {
  price: number;
  down: number;
  months: number;        // 12..84
  annualRate: number;    // 0.065 = 6.5%
}

export interface FinanceResult {
  monthly: number;
  totalPaid: number;
  totalInterest: number;
}

// ════════════════════════════════════════════════════════════════
// Toast
// ════════════════════════════════════════════════════════════════

export type ToastKind = 'good' | 'warn' | 'bad' | 'neutral';

export interface ToastPayload {
  message: string;
  kind?: ToastKind;
  icon?: string;         // IconName from icons.tsx
  duration?: number;     // ms, default 2500
}

// ════════════════════════════════════════════════════════════════
// Source metadata
// ════════════════════════════════════════════════════════════════

export interface SourceMeta {
  id: Source;
  name: string;          // יד2
  color: string;         // dot color
  baseUrl: string;       // for "view on source" links
}

export const SOURCES: Record<Source, SourceMeta> = {
  yad2:       { id: 'yad2',       name: 'יד2',       color: '#F5C842', baseUrl: 'https://www.yad2.co.il' },
  autoboom:   { id: 'autoboom',   name: 'אוטובום',   color: '#FF7A45', baseUrl: 'https://www.autoboom.co.il' },
  colmobil:   { id: 'colmobil',   name: 'קולמוביל',  color: '#5BC0EB', baseUrl: 'https://www.colmobil.co.il' },
  car2:       { id: 'car2',       name: 'CAR2',      color: '#A78BFA', baseUrl: 'https://www.car2.co.il' },
  autocenter: { id: 'autocenter', name: 'אוטוסנטר', color: '#34D399', baseUrl: 'https://www.autocenter.co.il' },
};
