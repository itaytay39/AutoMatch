# Data Model & API

## Database schema (Postgres, Prisma)

```prisma
// schema.prisma

generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model User {
  id            String   @id @default(cuid())
  phone         String   @unique          // Israeli SMS-OTP login
  email         String?  @unique
  name          String?
  createdAt     DateTime @default(now())
  saves         Save[]
  alerts        Alert[]
  recentViews   RecentView[]
  pushTokens    PushToken[]
  preferences   UserPreferences?
}

model UserPreferences {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  quietStart    String?  // "22:00"
  quietEnd      String?  // "07:00"
  digestDaily   Boolean  @default(false)
  emailEnabled  Boolean  @default(false)
  pushEnabled   Boolean  @default(true)
}

// ── Vehicles & listings ─────────────────────────────────────────

enum Source { yad2 autoboom colmobil car2 autocenter }
enum FuelType { benzin hybrid electric diesel }
enum Body { sedan hatchback crossover wagon coupe minivan }
enum Gearbox { manual auto cvt }
enum SellerType { private dealer }

model Vehicle {
  id              String   @id @default(cuid())
  externalId      String                    // source-specific listing id
  source          Source
  make            String                    // טויוטה
  model           String                    // קורולה הייבריד
  trim            String?                   // Hybrid LE
  year            Int
  km              Int
  hand            Int                       // 1, 2, 3...
  price           Int                       // current price ₪
  listPrice       Int                       // model-year fair value
  body            Body
  fuel            FuelType
  gearbox         Gearbox
  region          String                    // "מרכז"
  location        String                    // "תל אביב"
  sellerType      SellerType
  sellerName      String?
  sellerPhone     String?                   // hashed/encrypted
  description     String   @db.Text
  postedAt        DateTime
  lastSeenAt      DateTime                  // last scrape that saw it
  status          String   @default("active") // active | sold | gone
  images          VehicleImage[]
  priceHistory    PriceSnapshot[]
  matchesAlerts   AlertMatch[]
  saves           Save[]
  views           RecentView[]
  spec            Json                      // { engine, power, accel, range, ... }
  @@unique([source, externalId])
  @@index([make, model, year])
  @@index([price])
  @@index([fuel])
  @@index([region])
  @@index([postedAt])
}

model VehicleImage {
  id          String  @id @default(cuid())
  vehicleId   String
  vehicle     Vehicle @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  url         String                        // S3 / R2 / Cloudinary
  width       Int
  height      Int
  order       Int     @default(0)
}

model PriceSnapshot {
  id          String   @id @default(cuid())
  vehicleId   String
  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  price       Int
  observedAt  DateTime @default(now())
  @@index([vehicleId, observedAt])
}

// ── User interactions ───────────────────────────────────────────

model Save {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  vehicleId  String
  vehicle    Vehicle  @relation(fields: [vehicleId], references: [id])
  createdAt  DateTime @default(now())
  @@unique([userId, vehicleId])
}

model RecentView {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  vehicleId  String
  vehicle    Vehicle  @relation(fields: [vehicleId], references: [id])
  viewedAt   DateTime @default(now())
  @@index([userId, viewedAt])
}

// ── Alerts (saved searches) ─────────────────────────────────────

model Alert {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  name         String                       // user-given or auto-generated
  criteria     Json                         // { makes, body, fuel, yearMin, priceMax, hand, region, ... }
  notif        Json                         // { push, email, instant }
  createdAt    DateTime @default(now())
  lastFiredAt  DateTime?
  matches      AlertMatch[]
}

model AlertMatch {
  id          String   @id @default(cuid())
  alertId     String
  alert       Alert    @relation(fields: [alertId], references: [id], onDelete: Cascade)
  vehicleId   String
  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id])
  matchedAt   DateTime @default(now())
  notifiedAt  DateTime?
  read        Boolean  @default(false)
  @@unique([alertId, vehicleId])
}

// ── Push ────────────────────────────────────────────────────────

model PushToken {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  platform    String                        // "web" | "ios" | "android"
  token       String   @unique
  createdAt   DateTime @default(now())
}
```

---

## API contract (REST or tRPC)

### Public

| Method | Path | Body / Query | Returns |
|---|---|---|---|
| `GET` | `/api/vehicles` | `q`, `body[]`, `fuel[]`, `priceMin/Max`, `yearMin/Max`, `kmMax`, `hand`, `region[]`, `sources[]`, `sort`, `cursor` | `{ items: VehicleSummary[], nextCursor }` |
| `GET` | `/api/vehicles/:id` | — | `VehicleDetail` |
| `GET` | `/api/vehicles/:id/similar` | — | `VehicleSummary[]` (≤6) |
| `GET` | `/api/vehicles/:id/history` | `days=30` | `PriceSnapshot[]` |
| `GET` | `/api/suggest` | `q` | `{ makes, models, recents }` |

### Authed

| Method | Path | Body | Returns |
|---|---|---|---|
| `POST` | `/api/auth/otp/send` | `{ phone }` | `202` |
| `POST` | `/api/auth/otp/verify` | `{ phone, code }` | `{ token, user }` |
| `GET` | `/api/me` | — | `User` |
| `GET` | `/api/saves` | — | `VehicleSummary[]` |
| `POST` | `/api/saves` | `{ vehicleId }` | `Save` |
| `DELETE` | `/api/saves/:vehicleId` | — | `204` |
| `GET` | `/api/recent` | `limit=8` | `VehicleSummary[]` |
| `POST` | `/api/recent` | `{ vehicleId }` | `204` |
| `GET` | `/api/alerts` | — | `Alert[]` |
| `POST` | `/api/alerts` | `AlertCriteria + notif` | `Alert` |
| `PATCH` | `/api/alerts/:id` | partial | `Alert` |
| `DELETE` | `/api/alerts/:id` | — | `204` |
| `POST` | `/api/push/tokens` | `{ platform, token }` | `204` |

### Types (TS)

```ts
type VehicleSummary = {
  id: string;
  make: string; model: string; trim?: string;
  year: number; km: number; hand: number;
  price: number; listPrice: number;
  priceDelta: number;        // computed: latest - prev_week
  deltaPct: number;          // computed: 30-day trend
  body: string; fuel: string;
  region: string; location: string;
  source: 'yad2' | 'autoboom' | 'colmobil' | 'car2' | 'autocenter';
  badge: 'מחיר טוב' | 'מחיר סביר' | 'מעל מחירון';
  badgeKind: 'good' | 'fair' | 'high';
  postedDays: number;
  images: number;             // count
  thumbnail: string;          // signed url
  history: number[];          // last 30 daily prices for sparkline
};

type VehicleDetail = VehicleSummary & {
  description: string;
  spec: { engine: string; power: string; accel: string; range?: string };
  sellerType: 'private' | 'dealer';
  sellerName?: string;
  sellerRating?: number;     // 4.0..5.0
  sellerListings?: number;
  imagesList: { url: string; w: number; h: number }[];
};
```

---

## Scraping pipeline

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│ Cron worker │───▶│ Source       │───▶│ Normalizer   │───▶│ Postgres │
│ per source  │    │ scraper      │    │ + dedupe     │    │          │
└─────────────┘    │ (Playwright) │    │ (per source) │    └─────┬────┘
                   └──────────────┘    └──────────────┘          │
                                                                 ▼
                                                          ┌─────────────┐
                                                          │ Diff engine │
                                                          │ (price ↓↑,  │
                                                          │  new, gone) │
                                                          └──────┬──────┘
                                                                 │
                                            ┌────────────────────┼────────────────────┐
                                            ▼                    ▼                    ▼
                                    ┌───────────────┐   ┌──────────────┐    ┌──────────────────┐
                                    │ Alert matcher │   │ Saved-watch  │    │ "List price"     │
                                    │ (per alert)   │   │ price-drop   │    │ recompute (model │
                                    └──────┬────────┘   │ notifier     │    │ year & region)   │
                                           ▼            └──────────────┘    └──────────────────┘
                                    ┌─────────────┐
                                    │ Notification│
                                    │ fan-out     │
                                    │ (FCM/APNs/  │
                                    │ Web Push/   │
                                    │ email)      │
                                    └─────────────┘
```

**Cadence:** every source every 10–30 min depending on traffic. Worker queues via BullMQ + Redis or Inngest.

**Dedupe key:** `(source, externalId)`. Cross-source dedupe (same VIN/plate across yad2 + autoboom) is a v2 feature — store both and link via a `canonicalVehicleId` later.

**Price-drop detection:** compare new price to most recent `PriceSnapshot`. If different, append snapshot and emit event. Notify saved-watchers + check alerts.

**Hebrew normalization:**
- Make/model dictionary per source → canonical Hebrew strings (e.g., "Hyundai Ioniq 5" → "יונדאי איוניק 5")
- Strip vowel marks (`nikud`) before indexing
- Lowercase + remove diacritics for fuzzy search

---

## "Fair price" model (v1 → v2)

**v1 (statistical):** for each `(make, model, year, ±10K km, ±1 hand)` group, compute median `price`. That's `listPrice`. Badge:
- `price < listPrice * 0.97` → good
- `price > listPrice * 1.03` → high
- else → fair

**v2 (ML):** XGBoost regression on `(make, model, year, km, hand, body, fuel, region, source, daysOnMarket)` → predicted price + confidence interval. Surface in UI as "מבוסס על N רכבים דומים, סטיית תקן ₪X".

---

## Search

**v1 (Postgres FTS):** `to_tsvector('simple', make || ' ' || model || ' ' || trim || ' ' || location)` with a Hebrew-friendly normalize function (strip nikud, lowercase). Good for ≤200K listings.

**v2 (Meilisearch):** Hebrew analyzer plugin. Synonyms (e.g., "BMW" ↔ "ב.מ.וו"). Typo tolerance. Faceted filters mirror the Filter sheet.

---

## Notifications

- **Web Push** — VAPID. Token stored in `PushToken`. Service Worker on the PWA shell.
- **iOS/Android** — FCM + APNs via Firebase Admin SDK. Tokens registered from native shells.
- **Email** — Postmark / SendGrid. Hebrew RTL templates with the same brand colors. Daily-digest sends at 18:00 local.

**Quiet hours** — defer push between `quietStart` and `quietEnd`; queue and send at next allowed window.
