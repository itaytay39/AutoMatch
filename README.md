# AutoMatch — Car Aggregator

> Smart Aggregation. Smarter Decisions.

אפליקציה מובייל שמאגדת מודעות רכב משומש מ-17 אתרים ישראליים, משווה מחירים, ומתריעה על עסקאות טובות.

---

## Quick Start (Development)

```bash
# 1. Start infrastructure
docker-compose up -d postgres redis

# 2. Run DB migrations
cd packages/database && npx prisma migrate dev

# 3. Start API
cd services/api && npm install && npm run dev

# 4. Start scraper worker
cd services/scraper && npm install && npm run dev

# 5. Start notifications worker
cd services/notifications && npm install && npm run dev

# 6. Start mobile app
cd apps/mobile && npm install && npx expo start
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Mobile App (Expo / React Native)                   │
│  HomeScreen · SearchScreen · AlertsScreen           │
└─────────────────┬───────────────────────────────────┘
                  │ REST API
┌─────────────────▼───────────────────────────────────┐
│  API Service (Fastify + Prisma)    :3000            │
│  /listings · /alerts · /users · /health · /metrics  │
└──────┬──────────────────────────────────────────────┘
       │ PostgreSQL
┌──────▼──────┐     ┌──────────────────────────────────┐
│  Database   │     │  Scraper Service (BullMQ worker) │
│  PostgreSQL │◄────│  17 connectors · dedup · norm    │
│  + Redis    │     │  cron every 2h                   │
└─────────────┘     └──────────────┬───────────────────┘
                                   │ Redis Queue
                    ┌──────────────▼───────────────────┐
                    │  Notifications (Firebase FCM)    │
                    │  alertMatcher · priceWatcher     │
                    └──────────────────────────────────┘
```

---

## Deploy to Railway

### Prerequisites
1. [Railway account](https://railway.app) + project created
2. Firebase project + service account key
3. `RAILWAY_TOKEN` secret in GitHub repo

### Environment Variables (set in Railway dashboard)
```
DATABASE_URL          — auto-provided by Railway Postgres plugin
REDIS_HOST            — auto-provided by Railway Redis plugin
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
BRIGHTDATA_PROXY_URL  — for yad2 anti-bot
```

### Deploy
```bash
npm install -g @railway/cli
railway login
railway link <project-id>
railway up
```

Or push to `main` — GitHub Actions deploys automatically.

---

## Running Tests

```bash
# Unit tests
cd services/scraper && npx vitest run
cd services/notifications && npx vitest run

# E2E (requires running API + DB)
cd tests && npx vitest run --config vitest.e2e.config.ts
```

---

## Success Test

> "Find a real Kia Stonic 2019-2020, under 100K km, in the Krayot area."

```
GET /api/v1/listings?make=Kia&model=Stonic&yearMin=2019&yearMax=2020&maxKm=100000
```

If a real person can find and buy a car through this — MVP is successful.

---

## Connectors (17)

| Site | Type | Method |
|------|------|--------|
| yad2.co.il | Private | Playwright stealth |
| homeless.co.il | Private | axios + cheerio |
| focusnet.co.il | Private | axios + cheerio |
| autoboom.co.il | Private | axios + cheerio |
| winwin.co.il | Private | axios + cheerio |
| colmobil.co.il | Dealer | axios + cheerio |
| autocenter.co.il | Dealer | axios + cheerio |
| eldan.co.il | Dealer | axios + cheerio |
| carwiz.co.il | Dealer | axios + cheerio |
| trademobile.co.il | Dealer | axios + cheerio |
| toyota-select.co.il | Importer | axios + cheerio |
| freesbe.com | Importer | axios + cheerio |
| icar.co.il | Importer | axios + cheerio |
| avis.co.il | Ex-lease | axios + cheerio |
| hertz.co.il | Ex-lease | axios + cheerio |
| albar.co.il | Ex-lease | axios + cheerio |
| shlomo.co.il (SIXT) | Ex-lease | axios + cheerio |
