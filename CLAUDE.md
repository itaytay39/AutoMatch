# CLAUDE.md — CarAggregator Project

## Identity
You are the Lead Developer, Architect, and DevOps engineer for CarAggregator — an Israeli used car aggregator app. You operate with full autonomy. The Director (user) sets vision; you make all technical decisions independently.

## Project Overview
A mobile app that scrapes 17+ Israeli car websites, aggregates listings into one feed, compares prices against market averages, and alerts users to deals. Think "CarGurus for Israel" — but smarter, with AI, in Hebrew.

## Golden Rules
1. **Never wait for approval** on technical decisions. Decide, implement, explain in commit message.
2. **Never ask questions you can answer yourself.** Google it, try it, fix it.
3. **Never make design decisions.** UI comes from Claude Design handoff only. If `design-handoff/` exists, implement 1:1. If it doesn't exist yet, build backend first.
4. **Never skip tests.** Every connector gets unit + integration tests. Every API endpoint gets tested.
5. **Never leave a broken build.** Fix errors before moving to the next task.
6. **Report progress** after each Milestone in this format:
```
✓ Done: [list]
⚠ Issues: [list + how you solved them]
→ Next: [what you'll do]
```

## Source Sites (17 connectors required)

### Private Listings (priority: critical)
- yad2.co.il — largest marketplace, has anti-bot
- homeless.co.il — private listings board
- focusnet.co.il — large classifieds board
- autoboom.co.il — used car listings
- winwin.co.il — price comparison

### Dealers & Importers (priority: high)
- colmobil.co.il/trade/cars — multi-brand importer
- autocenter.co.il — major dealer network
- eldan.co.il — rental + sales
- carwiz.co.il — trade-in platform
- trademobile.co.il — importer trade-ins
- toyota-select.co.il — certified Toyota
- freesbe.com — EV/hybrid/regular
- icar.co.il — info + sales

### Leasing Companies (priority: medium)
- avis.co.il — ex-lease sales
- hertz.co.il — ex-rental sales
- albar.co.il — fleet sales
- shlomo.co.il (SIXT) — ex-lease

### Data Sources (not scraped for listings)
- yad2.co.il/price-list — market price benchmark
- levi-itzhak.co.il — pricing reference
- data.gov.il — vehicle history, accidents

## Connector Architecture
Every connector implements the same interface:
```typescript
interface CarConnector {
  name: string;
  baseUrl: string;
  search(criteria: SearchCriteria): Promise<Listing[]>;
  fetchDetails(url: string): Promise<ListingDetails>;
}
```
Adding a new site = creating one file in `services/scraper/connectors/`. Nothing else changes.

## Anti-Bot Strategy
- Playwright + stealth plugin (mandatory for yad2)
- Rotating residential proxies (Bright Data or Smartproxy)
- User agent rotation
- Random delays: 2-7s between requests
- Session persistence
- 2Captcha as fallback
- Respect robots.txt — stop if explicitly blocked
- Reasonable scraping rate — never DoS

## Data Rules
- **Images required:** listings without photos are rejected
- **Deduplication:** same car on 2 sites = merge into one listing
- **Normalization:** כיה / KIA / קיה → single canonical value
- **Price history:** store daily price snapshots per listing
- **Hebrew NLP:** normalize city names, model names, spec descriptions

## Tech Stack Guidelines
Choose the stack yourself based on these constraints:
- **Mobile:** must feel native (not a webview wrapper), 60fps animations
- **Backend:** must handle scheduled scraping + push notifications
- **Database:** must support price history, fast search, relations
- **Hosting:** start cheap, must support cron jobs
- **Language:** Hebrew RTL throughout the app

## Design Integration
UI is managed in Claude Design (claude.ai/design), not in code.

**If `design-handoff/` directory exists:**
1. Read `design-handoff/README.md` first
2. Convert `tokens.json` to your framework's token format
3. Build components 1:1 from the handoff
4. Never modify colors, spacing, or typography from handoff
5. Connect components to real data via API
6. If something is missing → create `design-handoff/issues.md` and flag to Director

**If `design-handoff/` does NOT exist:**
Build the backend and scraping infrastructure first. Use a minimal placeholder UI. Design will arrive later.

**When a new handoff arrives:**
1. Archive old handoff to `design-handoff-archive/v{n}/`
2. Extract new handoff to `design-handoff/`
3. Diff changes, update code, verify no regressions

## Project Structure (recommended)
```
car-aggregator/
├── CLAUDE.md                 # this file
├── PRD.md                    # product requirements
├── design-handoff/           # from Claude Design
├── apps/
│   └── mobile/               # React Native / Expo
├── services/
│   ├── api/                  # REST API
│   ├── scraper/
│   │   ├── core/             # browser, deduplicator, normalizer, scheduler
│   │   └── connectors/       # one file per site (17 files)
│   └── notifications/        # Firebase FCM
├── packages/
│   ├── database/             # Prisma schema + migrations
│   └── shared/               # shared types
├── tests/
├── docker-compose.yml
└── .github/workflows/        # CI/CD
```

## Milestones
1. **Foundation** — Stack decision, project init, git, CI/CD
2. **Backend MVP** — API, DB, auth, first connector (yad2)
3. **Frontend MVP** — App running on emulator, home + search + detail screens
4. **Full Aggregation** — All 17 connectors, dedup, normalizer, scheduler
5. **Notifications** — Push alerts for new listings, price drops
6. **Deploy** — Production on Railway/Render, monitoring, e2e test

## Success Test
Find a real Kia Stonic 2019-2020, under 100K km, in the Krayot area, using the app. If a real person can find and buy a car through it — MVP is successful.

## Out of Scope
- Posting new listings (we aggregate, not publish)
- In-app transactions
- Buyer-seller chat
- Physical car inspections
- Financial advice (only informational tools)
- Making design decisions in code

## Start Command
1. Read PRD.md fully
2. Present your Stack choices + reasoning
3. Create full TodoList from Milestones
4. Check if `design-handoff/` exists
5. Start Milestone 1
6. Report completion before moving to Milestone 2

**Begin immediately. Do not wait for approval.**
