# Implementation Checklist — 8 Phases

> כל phase מסתיים ב-**Approval Gate**. אסור להתחיל את הבא בלי אישור מפורש מהמשתמשת.

לעקוב אחרי הסטטוס — סמן `[x]` בכל פריט שגמרת.

---

## Phase 1 — Foundation (יום 1-2)

### Setup

- [ ] `npx create-next-app@latest automatch --typescript --tailwind --app --turbo --src-dir`
- [ ] התקנת deps: `pnpm add @tanstack/react-query nuqs react-hook-form zod @hookform/resolvers @prisma/client`
- [ ] התקנת dev deps: `pnpm add -D prisma vitest @testing-library/react @testing-library/jest-dom @types/node`
- [ ] הגדרת TypeScript strict ב-`tsconfig.json`
- [ ] ESLint + Prettier config (אופציונלי: `pnpm add -D @automatch/eslint-config`)
- [ ] `.gitignore` כולל `.env.local`, `.next`, `node_modules`

### RTL & Typography

- [ ] `app/layout.tsx`:
  ```tsx
  <html lang="he" dir="rtl">
  ```
- [ ] טעינת Heebo + Inter דרך `next/font/google`
- [ ] קביעת `--font-he` ו-`--font-num` ב-`:root`

### Tokens

- [ ] `src/styles/tokens.css` — כל ה-CSS vars מ-`DESIGN_TOKENS.md`
- [ ] `tailwind.config.ts` עם preset (ראה `ARCHITECTURE.md`)
- [ ] `globals.css` import של tokens + base resets + `.num` utility

### Validation

- [ ] עמוד root מציג רקע `var(--bg-warm)` ✓
- [ ] טקסט עברי בכיוון RTL ✓
- [ ] `<span class="num">₪119,900</span>` מציג Inter עם tabular nums ✓

### 🚦 Approval Gate 1

צרף לchat:
1. screenshot של עמוד root
2. תוצאת `pnpm run typecheck` (אפס שגיאות)
3. אישור שהפרויקט עולה ב-`pnpm dev`

---

## Phase 2 — Primitives & Icons (יום 3-4)

### Icons

- [ ] `src/components/ui/Icon.tsx` — מתורגם מ-`reference/icons.jsx`
- [ ] כל 50+ האייקונים זמינים
- [ ] type-safe `IconName` exported
- [ ] RTL-flipping אוטומטי לאייקונים directional (chevrons, back, share, navigate, exchange)

### UI Primitives

- [ ] `Tag.tsx` — 7 variants × 3 sizes
- [ ] `Card.tsx`
- [ ] `Btn.tsx` — 5 variants
- [ ] `IconBadge.tsx`
- [ ] `Sparkline.tsx`
- [ ] `SourceTag.tsx`
- [ ] `SectionHeader.tsx`
- [ ] `EmptyState.tsx`
- [ ] `Skeleton.tsx` (SkeletonRow + SkeletonCard)
- [ ] `FAB.tsx`
- [ ] `StatusBar.tsx`
- [ ] `TabBar.tsx`
- [ ] `GestureBar.tsx`

### Storybook

- [ ] `pnpm add -D @storybook/nextjs` + init
- [ ] Story לכל primitive עם כל ה-variants
- [ ] RTL toolbar add-on פעיל by default
- [ ] dark/light/system toolbar (light bilbalד עכשיו, dark = v2)

### 🚦 Approval Gate 2

צרף:
1. Storybook URL (deploy ל-Chromatic או local preview)
2. screenshot של כל primitive עם hover + focus states
3. בדיקת keyboard navigation (Tab עובד דרך כל primitive)

---

## Phase 3 — Routing & Shell (יום 5)

### App shell

- [ ] `src/app/(app)/layout.tsx` — TabBar + StatusBar + GestureBar
- [ ] Phone frame (412×892, rounded 52px, 8px ink border) — או full-screen על real device
- [ ] Dynamic Island element (top center, 126×37, rounded 24)

### Routes

- [ ] `/` — Home (placeholder)
- [ ] `/search` — Search (placeholder)
- [ ] `/saved` — Saved (placeholder)
- [ ] `/alerts` — Alerts (placeholder)
- [ ] `/vehicle/[id]` — Detail (placeholder)
- [ ] `/onboarding` — Onboarding (placeholder)

### Parallel modal routes

- [ ] `@modal/(.)filters/page.tsx`
- [ ] `@modal/(.)sort/page.tsx`
- [ ] `@modal/(.)profile/page.tsx`
- [ ] `@modal/(.)alerts/new/page.tsx`
- [ ] `@modal/(.)vehicle/[id]/finance/page.tsx`

### Behavior

- [ ] Tab change → animate (am-tab-in) — respects `prefers-reduced-motion`
- [ ] Modal close ב-Escape או backdrop click
- [ ] URL share — open the URL → see the right tab + modal

### 🚦 Approval Gate 3

צרף:
1. Loom/screencast 30s של ניווט בין tabs + פתיחת modal + סגירה
2. URL paste-test: `/saved` open בtab חדש → נכנס ל-saved tab ישר
3. Console — אפס שגיאות

---

## Phase 4 — Vehicle UI (יום 6-8)

### Components

- [ ] `VehicleCard.tsx` (כולל `compact` prop)
- [ ] `SimilarCard.tsx`
- [ ] `RecentThumb.tsx`
- [ ] `CarVisual.tsx` (אם משתמשים בplaceholder; אחרת `next/image` עם cover photo)

### Behavior

- [ ] Heart toggle (אופטימיסטי, useMutation + invalidate)
- [ ] Toast confirmation (סוונר או custom)
- [ ] Card hover (rise + shadow strengthen)
- [ ] Card press (`scale 0.97`, 140ms)

### Home

- [ ] Top bar (avatar + greeting + search button)
- [ ] Hero insight card (royal-blue gradient, --shadow-brand)
- [ ] Stat row (3-up StatTile)
- [ ] Recently viewed carousel (RecentThumb × 4-8, horizontal scroll)
- [ ] "חדשים תואמים" section
- [ ] "ירידות מחיר חמות" section

### 🚦 Approval Gate 4

צרף:
1. screenshot של Home — pixel-compare עם `reference/screens/01-home.png`
2. וידאו של scroll + heart toggle + נקודות-snap בcarousel
3. וידאו של hover/press states

---

## Phase 5 — Data Layer (יום 9-11)

### Database

- [ ] `prisma/schema.prisma` מ-`DATA_MODEL.md` (כל המודלים)
- [ ] `pnpm prisma migrate dev --name init`
- [ ] `prisma/seed.ts` עם 10 רכבים אמיתיים + 2 alerts + user
- [ ] `pnpm prisma db seed`

### Auth

- [ ] Auth.js / NextAuth התקנה
- [ ] SMS-OTP provider (Twilio או Vonage)
- [ ] `/login` route עם 2 שלבים (טלפון → קוד)
- [ ] Session middleware מגן על `(app)/*`

### API

- [ ] `GET /api/vehicles` (עם filtering + sorting + cursor pagination)
- [ ] `GET /api/vehicles/[id]`
- [ ] `GET /api/vehicles/[id]/similar`
- [ ] `GET /api/vehicles/[id]/history`
- [ ] `GET /api/suggest`
- [ ] `GET /api/saves` + POST/DELETE
- [ ] `GET /api/recent` + POST
- [ ] `GET /api/alerts` + POST/PATCH/DELETE
- [ ] `POST /api/push/tokens`

### Client

- [ ] TanStack Query setup + provider
- [ ] Hooks: `useVehicles`, `useVehicle`, `useSaves`, `useRecent`, `useAlerts`
- [ ] Server Actions לmutations (toggle save, create alert, …)

### 🚦 Approval Gate 5

צרף:
1. וידאו: login → home → tap vehicle → detail → save → see in /saved
2. Prisma Studio screenshot של DB עם user + saves + alerts
3. Network tab screenshot — כל ה-requests עם 200 status

---

## Phase 6 — Search & Filter (יום 12-14)

### Search

- [ ] `SmartSearchBar.tsx` + autocomplete panel
- [ ] Postgres FTS על `make + model + trim + location` (v1)
- [ ] Recent searches מ-localStorage + sync ל-DB
- [ ] Suggest endpoint (top makes/models/trims)

### Filters

- [ ] `FilterSheet.tsx` — כל 8 הsections
- [ ] `ChipGroup.tsx`
- [ ] `DualRange.tsx` — single track, 2 thumbs, accent fill between
- [ ] `RangeRow.tsx`
- [ ] URL state via nuqs: `?q=&body=&fuel=&priceMin=&priceMax=&...`
- [ ] Active filter count badge ליד הfilter button

### Sort

- [ ] `SortSheet.tsx`
- [ ] 7 sort options מ-`SORT_OPTIONS` array
- [ ] URL state: `?sort=...`

### Empty/error states

- [ ] Empty results → `EmptyState` עם reset filters CTA
- [ ] Loading → SkeletonCard × 3
- [ ] Error → friendly retry message

### 🚦 Approval Gate 6

צרף:
1. Loom 60s: search "טויוטה" → results → open filter → set priceMax → apply → results refine → URL contains all state
2. screenshot של autocomplete panel
3. screenshot של empty state

---

## Phase 7 — Detail & Flows (יום 15-17)

### Vehicle Detail

- [ ] Header overlay (back, share, heart) — glass blur
- [ ] Image gallery (5+ images, dots, photo count chip)
- [ ] Title + trim + badge tag
- [ ] Hero price card + PriceGauge
- [ ] PriceHistoryChart (130px area chart)
- [ ] Spec grid (6 SpecStat tiles)
- [ ] Description card
- [ ] **SellerCard** with avatar, stars rating, listings count, location row, navigate button
- [ ] **Similar vehicles carousel**
- [ ] Bottom action bar (finance preview + צור קשר CTA)

### Modals

- [ ] `FinanceModal.tsx` — hero card + 2 sliders, real calc
- [ ] `AlertForm.tsx` — 3-step wizard, react-hook-form + zod validation
- [ ] `Compare.tsx` — table with winner highlighting

### Profile

- [ ] `ProfileSheet.tsx` — hero card + stats + settings rows + logout

### 🚦 Approval Gate 7

צרף:
1. וידאו: home → vehicle → save → similar → open similar → finance modal → adjust sliders
2. וידאו: alerts → + → 3-step wizard → save → see in list
3. וידאו: saved → toggle compare → select 2 → see comparison table

---

## Phase 8 — Polish & Launch (יום 18-20)

### Loading & Empty states

- [ ] SkeletonCard בכל list fetch (home sections, search results, saved, alerts)
- [ ] EmptyState בכל מקום שיכול להיות ריק
- [ ] Spinners ב-mutations (button loading)

### PWA

- [ ] `app/manifest.ts` עם name, short_name, icons (192, 512), theme_color
- [ ] Service worker (next-pwa)
- [ ] Offline page
- [ ] Install prompt

### Push

- [ ] Web Push (VAPID keys ב-.env)
- [ ] Permission request UI
- [ ] Push subscription endpoint
- [ ] Worker שאוסף matches → שולח push דרך VAPID

### Monitoring

- [ ] Sentry SDK + source maps upload
- [ ] PostHog SDK + screen-view tracking
- [ ] Custom events: `save_vehicle`, `create_alert`, `view_finance`, `tap_contact_seller`

### A11y & Perf

- [ ] Lighthouse audit (mobile) → ≥ 95 בכל הקטגוריות
- [ ] VoiceOver pass בעברית (10 דק׳ בכל מסך)
- [ ] TalkBack pass בעברית
- [ ] All animations respect `prefers-reduced-motion`
- [ ] All inputs have associated `<label>`
- [ ] All buttons have `aria-label` שלי דקור-טכסט
- [ ] Skip-to-content link
- [ ] Focus rings ב-`:focus-visible` בכל interactive

### Pre-launch

- [ ] `pnpm build` — no warnings
- [ ] בדיקה במכשיר אמיתי (Galaxy S24 + iPhone 15)
- [ ] OAuth/SMS end-to-end עובד
- [ ] אין `console.log` בproduction
- [ ] `.env.local` ב-`.gitignore` (וודא: `git status` לא מראה אותו)
- [ ] Sentry release tagged
- [ ] CHANGELOG.md מעודכן

### Deploy

- [ ] Push to GitHub
- [ ] Vercel: import repo → add env vars → deploy
- [ ] Domain: `automatch.co.il` או דומה
- [ ] Cloudflare DNS + SSL
- [ ] Status page (UptimeRobot חינמי)

### 🚦 Approval Gate 8 (Final)

צרף:
1. Lighthouse PDF (mobile, slow 4G) — כל הקטגוריות ≥ 95
2. a11y audit report (axe-core או similar)
3. 3 וידאו walkthroughs ממכשירים אמיתיים: Galaxy + iPhone + Desktop browser
4. URL production עובד
5. דוח של 3 user testing sessions בעברית (15 דק׳ כל אחד)

---

## ⏱️ זמן משוער

- Solo developer (full-time): **20-25 ימי עבודה**
- 2 developers: **12-15 ימי עבודה**
- כולל QA + deployment: + 3-5 ימים

תאריך יעד מומלץ מ-day 1: **5 שבועות לproduction-ready PWA.**
