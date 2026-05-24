# Architecture — React Native / Expo (Android)

## Platform

- **Native Android only** (v1)
- **React Native** + **Expo (managed workflow)**
- Distributed as **APK** via EAS Build → install directly on device
- iOS not in scope for v1

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | **Expo SDK 51+** | OTA updates, EAS Build, no Android Studio for most work |
| Language | **TypeScript (strict)** | Domain has rich types |
| Navigation | **expo-router v3** | File-based routing, deep links, native stack |
| Styling | **NativeWind v4** (Tailwind for RN) | Tokens map directly; matches web ds |
| State (server) | **TanStack Query v5** | Cache, offline support, sync |
| State (local) | **Zustand** | Lean, no boilerplate |
| Forms | **react-hook-form** + zod | Add-Alert wizard, criteria, OTP |
| Auth | **expo-auth-session** (SMS via API) or **Clerk Expo** | Israeli market expects SMS OTP |
| API client | **ky** or native `fetch` + custom wrapper | Type-safe, retry, auth headers |
| DB (local) | **expo-sqlite** + **drizzle-orm** | Offline saved/recent cache |
| Push | **expo-notifications** + FCM | Standard for Android |
| Images | **expo-image** | WebP/AVIF, blur placeholder, memory-efficient |
| Storage | **expo-secure-store** | Tokens, auth state |
| Maps | **react-native-maps** (Google) | For seller location pin |
| Linking | **expo-linking** + **react-native-share** | Phone (`tel:`), WhatsApp, share |
| Animations | **react-native-reanimated v3** | Worklets, 60fps tab transitions |
| Gestures | **react-native-gesture-handler** | Swipe-to-save, bottom-sheet |
| Bottom sheets | **@gorhom/bottom-sheet** | Filter, Sort, Profile, Add-Alert |
| Charts | **victory-native** or **react-native-skia** | Price history, sparklines |
| Toast | **burnt** or **react-native-toast-message** | Native feel |
| Monitoring | **Sentry React Native** + **PostHog Expo** | Errors + analytics |
| Build | **EAS Build** → APK + AAB | One command, cloud builds |
| Backend | **Railway** (Node/Bun + Postgres + Redis) | Already in use |

---

## Folder structure

```
automatch-mobile/
├── app/                              # expo-router routes
│   ├── _layout.tsx                   # root: providers + RTL + theme
│   ├── (auth)/
│   │   ├── _layout.tsx               # auth stack
│   │   ├── phone.tsx                 # enter phone
│   │   └── otp.tsx                   # verify code
│   ├── (app)/                        # authed app
│   │   ├── _layout.tsx               # tab navigator (4 tabs)
│   │   ├── (tabs)/
│   │   │   ├── index.tsx             # Home
│   │   │   ├── search.tsx            # Search
│   │   │   ├── saved.tsx             # Saved
│   │   │   └── alerts.tsx            # Alerts
│   │   ├── vehicle/
│   │   │   └── [id].tsx              # Vehicle detail
│   │   ├── filters.tsx               # modal (presentation:modal)
│   │   ├── sort.tsx                  # modal
│   │   ├── profile.tsx               # modal
│   │   ├── alerts/
│   │   │   └── new.tsx               # modal — 3-step wizard
│   │   ├── compare.tsx               # full-screen
│   │   └── finance/
│   │       └── [id].tsx              # modal
│   ├── onboarding.tsx                # 3-slide intro
│   ├── splash.tsx                    # not really used — Expo splash handles cold-start
│   └── +not-found.tsx
├── components/
│   ├── ui/                           # primitives
│   │   ├── Tag.tsx
│   │   ├── Card.tsx
│   │   ├── Btn.tsx
│   │   ├── Icon.tsx                  # SVG via react-native-svg
│   │   ├── IconBadge.tsx
│   │   ├── Sparkline.tsx             # react-native-skia
│   │   ├── SourceTag.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Skeleton.tsx
│   │   ├── FAB.tsx
│   │   └── StatusBarFill.tsx         # safe-area top
│   ├── vehicle/
│   │   ├── VehicleCard.tsx
│   │   ├── SimilarCard.tsx
│   │   ├── RecentThumb.tsx
│   │   └── CarVisual.tsx             # placeholder, replace with expo-image
│   ├── filters/
│   │   ├── FilterSheet.tsx           # uses @gorhom/bottom-sheet
│   │   ├── ChipGroup.tsx
│   │   ├── DualRange.tsx             # custom — two PanResponder thumbs
│   │   └── RangeRow.tsx
│   ├── nav/
│   │   ├── TabBar.tsx                # custom tab bar (overrides expo-router default)
│   │   └── BackHeader.tsx
│   ├── sheets/
│   │   ├── SortSheet.tsx
│   │   ├── ProfileSheet.tsx
│   │   ├── AddAlertSheet.tsx
│   │   └── FinanceSheet.tsx
│   ├── detail/
│   │   ├── PriceGauge.tsx            # react-native-skia or SVG
│   │   ├── PriceHistoryChart.tsx
│   │   ├── SpecGrid.tsx
│   │   ├── SellerCard.tsx
│   │   └── Gallery.tsx               # paginated image strip
│   └── home/
│       ├── InsightHero.tsx
│       ├── StatTile.tsx
│       └── RecentCarousel.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts                 # ky/fetch wrapper + auth + retry
│   │   ├── vehicles.ts               # listVehicles, getVehicle, ...
│   │   ├── saves.ts
│   │   ├── alerts.ts
│   │   ├── auth.ts                   # OTP send/verify
│   │   └── push.ts                   # register FCM token
│   ├── format.ts                     # fmt, fmtPrice, fmtKm, fmtRelativeTime
│   ├── filter.ts                     # filterVehicles, activeFilterCount
│   ├── sort.ts                       # sortVehicles, SORT_OPTIONS
│   ├── tokens.ts                     # design tokens (exported for SVG/skia where NW doesn't reach)
│   └── rtl.ts                        # I18nManager helpers
├── hooks/
│   ├── useAuth.ts
│   ├── useVehicles.ts
│   ├── useVehicle.ts
│   ├── useSaves.ts
│   ├── useRecentViews.ts
│   ├── useAlerts.ts
│   ├── useToast.ts
│   └── useTweaks.ts
├── store/
│   ├── auth.ts                       # Zustand
│   ├── recent.ts
│   └── ui.ts                         # toast, modal flags
├── types/
│   └── index.ts                      # VehicleSummary, FilterState, ... (see types.ts)
├── assets/
│   ├── fonts/
│   │   ├── Heebo-*.ttf
│   │   └── Inter-*.ttf
│   ├── icons/                        # if using SVG sprite
│   └── images/
├── locales/
│   └── he.json                       # all strings here, no inline text
├── android/                          # ejected only if needed
├── app.json                          # Expo config
├── eas.json                          # EAS Build config
├── tailwind.config.ts                # NativeWind preset
├── metro.config.js
└── tsconfig.json
```

---

## RTL on React Native

**Critical:** React Native handles RTL globally via `I18nManager`. Set it once at app launch:

```ts
// app/_layout.tsx
import { I18nManager } from 'react-native';
import { useEffect } from 'react';
import * as Updates from 'expo-updates';

if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  // On first install, may need a one-time reload:
  // Updates.reloadAsync();
}
```

After this, all `flex-direction: row` automatically becomes `row-reverse` visually. Use `start`/`end` instead of `left`/`right` everywhere.

For numbers, RN doesn't have CSS-level `unicode-bidi: isolate`. Workaround:

```tsx
<Text style={{ writingDirection: 'ltr' }}>{price}</Text>
```

Or wrap in a `<View>` with `direction: 'ltr'` from Reanimated layout.

---

## NativeWind Preset

`tailwind.config.ts`:

```ts
import { hairlineWidth } from 'nativewind/theme';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg:    { warm: '#F6F2EC', deep: '#ECE5DD' },
        sheet: { DEFAULT: '#FFFFFF', 2: '#F1ECE4', 3: '#EAE3D8' },
        ink:   { DEFAULT: '#1B1916', 2: '#6D665C', 3: '#A39A8E', 4: '#C5BEB1', 5: '#DDD3C3' },
        line:  { DEFAULT: '#ECE4D8', 2: '#DDD3C3' },
        accent:{ DEFAULT: '#3450E8', 2: '#1F37C2', soft: '#E0E7FC', ink: '#1D2E7A' },
        good:  { DEFAULT: '#1F5A3D', bg: '#DCEBE0' },
        warn:  { DEFAULT: '#7A4A0D', bg: '#F6E2C4' },
        bad:   { DEFAULT: '#9A2A14', bg: '#FFE2D6' },
      },
      fontFamily: {
        he:  ['Heebo-Regular'],
        heB: ['Heebo-Bold'],
        num: ['Inter-Medium'],
        numB:['Inter-Bold'],
      },
      borderRadius: {
        chip: 10, btn: 14, card: 20, sheet: 22, hero: 24,
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
};
```

---

## Backend — Railway

API hosted at `https://api.automatch.co.il` (Railway service). Structure:

```
automatch-api/                        (Railway repo)
├── src/
│   ├── server.ts                     # Hono / Fastify entry
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── vehicles.ts
│   │   ├── saves.ts
│   │   ├── alerts.ts
│   │   ├── suggest.ts
│   │   └── push.ts
│   ├── scrapers/                     # 17 sites
│   │   ├── _base.ts                  # shared Playwright wrapper
│   │   ├── yad2.ts
│   │   ├── focuznet.ts
│   │   ├── winwin.ts
│   │   ├── ... 14 more
│   │   └── index.ts                  # registry + cron
│   ├── normalizers/
│   │   ├── make.ts                   # map source-specific → canonical Hebrew
│   │   ├── price.ts
│   │   └── location.ts
│   ├── jobs/
│   │   ├── scrape.ts                 # cron entry per source
│   │   ├── alert-matcher.ts          # checks matches, emits notifications
│   │   ├── price-watcher.ts          # detect drops on saved
│   │   ├── notifier.ts               # FCM fan-out
│   │   └── pricing.ts                # recompute "fair price" per (make, model, year, region)
│   ├── lib/
│   │   ├── db.ts                     # drizzle
│   │   ├── redis.ts
│   │   ├── fcm.ts
│   │   └── sms.ts
│   └── types.ts                      # same shape as mobile app
├── drizzle/
│   └── schema.ts                     # mirrors DATA_MODEL.md
├── package.json
└── railway.json
```

**Railway services:**
1. **API** — Bun + Hono on port 3000
2. **Worker** — BullMQ worker container, no public port
3. **Postgres** — Railway plugin
4. **Redis** — Railway plugin (BullMQ queue + caching)

---

## The Source Marketplaces

> Verified May 2026 via web research. List the realistic, viable scraping targets for the Israeli used-car market.

| # | Source | URL | Tier | Notes |
|---|---|---|---|---|
| 1 | **יד2** | yad2.co.il | T1 | Largest marketplace in Israel. ~85% of private listings pass through here. Has anti-bot protection — use headless Chromium + residential proxy rotation. |
| 2 | **לוח פוקוס** | focusnet.co.il | T1 | "Largest and most up-to-date inventory" per their own marketing. Heavy dealer presence. |
| 3 | **WinWin** | winwin.co.il | T1 | Established second-hand marketplace, dominant alongside יד2 historically. |
| 4 | **Autoboom** | autoboom.co.il | T1 | Cars + motorcycles + scooters. Has price guide. Multilingual (HE/EN/RU). |
| 5 | **תתניע** | tatnia.co.il | T2 | Self-described as "one of the largest car boards in Israel". |
| 6 | **רכב זה כאן** | cars.zehcan.co.il | T2 | Search by category/city/model. Mid-size board. |
| 7 | **Centro** | centro.co.il | T2 | Buy/sell second-hand cars directly. |
| 8 | **4Israel** | 4israel.co.il | T2 | Multi-language (HE/AR/RU/EN) — captures non-Hebrew sellers. |
| 9 | **ACol** | acol.co.il | T3 | Private-seller marketplace. Often duplicates from T1. |
| 10 | **מציאה** | mezia.co.il | T3 | General second-hand portal, has cars section. |
| 11 | **Carros** | carros.com | T3 | International site, small Israel section. |
| 12 | **Janglo** | janglo.net/cars | T3 (niche) | English-speaking community board. Anglos sometimes list under market price. |
| 13 | **Sparky** | sparky.co.il | T3 (specialty) | **Electric vehicles only.** ~270 listings. Useful if positioning AutoMatch on the EV angle. |

### Tier strategy

- **MVP (Tier 1, 4 sources):** יד2 + פוקוס + WinWin + Autoboom → ~95% of the Israeli used-car market coverage with minimal duplication.
- **v1.1 (add Tier 2, 4 sources):** Adds 3-5% more unique inventory; mostly dealer overlap with T1.
- **v1.2 (add Tier 3, 5 sources):** Diminishing returns; mostly duplicates. Sparky is worth adding for the EV niche. Janglo for the anglos. Skip others unless cross-source dedupe is in place.

### Important — not on this list (intentionally)

- **Facebook Marketplace + Facebook groups** ("פשפשוק", "רכב יד 2 בכל הארץ", ~280K members) — huge inventory but **scraping FB violates their TOS**. Requires Graph API access via partnership, or manual posting by users. Discuss legally before pursuing.
- **Dealer-specific sites** (Colmobil, Karasso, Albert Mayer, Auto-Op) — these are individual dealer catalogs, **not** classifieds boards. Their inventory already appears on T1 boards via dealer feeds. Scraping them creates duplicates without adding new inventory.
- **לוי יצחק (Levi Yitzchak)** — pricing guide / מחירון, **not** a listings board. Use as the source of truth for "fair price" calculation, but it doesn't have listings.
- **Government auctions** (data.gov.il fleet sales) — niche, not typical consumer journey. Could be a v2 "ex-government" filter.

### Cross-source deduplication strategy

Multiple sources publishing the same vehicle is the #1 quality risk. Dedupe approach:

1. **License plate match (when present):** strongest signal. Same plate across sources → same vehicle, link as canonical.
2. **VIN last-4 + make/model/year** when plate not exposed.
3. **Fuzzy match fallback:** `(make, model, year, hand, ±5K km, ±5K price, posted within 14 days)` → likely duplicate.
4. **Source priority for canonical listing:** T1 > T2 > T3. Display data from highest-tier source; link to all sources from detail.

### Per-source scraper requirements

Each source needs:
- **`scrapers/[source].ts`** — Playwright script, extracts the listings index + each detail page
- **`selectors/[source].yaml`** — CSS/XPath selectors, externalized so non-developers can update when DOM changes
- **`normalizers/[source].ts`** — maps source-specific make/model strings → canonical Hebrew
- **`__fixtures__/[source]/`** — saved HTML snapshots for unit tests (so tests don't hit the live site)
- **Rate-limit config:** max 1 req/sec per source, 200-800ms jitter, 5 rotating user-agents
- **Captcha/Cloudflare detection:** back off 30 min if hit, alert ops

### Cadence

- **T1 sources** — every 15 min (fast-moving, high freshness value)
- **T2 sources** — every 30 min
- **T3 sources** — every 60 min
- After-hours (00:00-06:00 Israel time) — halve frequency to be polite

### Legal note

Israeli law and the EU's Computer Fraud and Abuse principles generally permit scraping of **publicly visible** data. However, each marketplace's ToS may explicitly forbid automated access. Before launch, recommended:

- Send a courtesy email to each T1 source describing the use case (aggregator, not republisher; deep-link to source listing on every card)
- Always include `User-Agent: AutoMatch-Aggregator/1.0 (https://automatch.co.il)`
- Respect `robots.txt` directives
- Provide a `noscrape@automatch.co.il` contact so sources can request inclusion/exclusion

If a source formally objects → remove and use their public API if offered.

---

## EAS Build & Distribution

`eas.json`:

```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal",
      "channel": "preview",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api-staging.automatch.co.il"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "channel": "production",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.automatch.co.il"
      }
    }
  },
  "submit": {
    "production": {
      "android": { "track": "internal" }
    }
  }
}
```

**Distribution flow:**
1. `eas build --profile preview --platform android` → APK URL emailed
2. Share URL or QR code → user downloads APK → installs
3. For Play Store (later): `eas build --profile production` → AAB → `eas submit`

**OTA updates:** JS bundle changes ship via `eas update` without rebuilding APK. Only native code changes need a new build.

---

## Push Notifications

- **Firebase Cloud Messaging (FCM)** — Android push
- **expo-notifications** — wraps FCM, handles permissions, registration
- Token registered on app open → `POST /api/push/tokens`
- Worker fan-out reads tokens for users with matching alerts → sends via FCM Admin SDK
- Deep link `automatch://vehicle/[id]` opens detail on tap

---

## Performance Budgets

- **Cold start** < 2.5s on Pixel 6 / Galaxy A54 (Snapdragon mid-range)
- **Tab switch** < 100ms (memoize lists, use FlashList)
- **Vehicle list scroll** 60fps (FlashList + expo-image with caching)
- **APK size** < 30MB (strip unused locales, optimize images)

---

## Critical RN Gotchas

1. **No CSS shadow:** Use `elevation` (Android) + `shadowOpacity/Color/Offset` (iOS, even though we're Android-only — keep portable).
2. **No CSS gradients:** Use `expo-linear-gradient`. Hero card uses 3-stop gradient.
3. **`flex` not `display: flex`:** RN has flex by default. Just `flexDirection`, `gap`, etc.
4. **Numbers in mixed RTL text:** Wrap in `<Text style={{ writingDirection: 'ltr' }}>`.
5. **Bottom sheet:** Use `@gorhom/bottom-sheet` — handles drag, backdrop, snap-points natively. Don't roll your own.
6. **Text wrapping:** No `text-wrap: pretty`. RN handles word-breaking automatically; just set `textBreakStrategy="balanced"`.
7. **Custom fonts:** Load via `useFonts` from `expo-font` at root. Block rendering until loaded.
8. **SafeArea:** Wrap screens in `<SafeAreaView edges={['top']}>` from `react-native-safe-area-context`. Don't hardcode 44px status-bar.
9. **Keyboard:** `KeyboardAvoidingView` + `behavior="padding"` on screens with inputs.
10. **Back button (Android):** Handle via `useFocusEffect` + `BackHandler.addEventListener`. Forgetting this breaks UX on phones with hardware back.

---

## Testing

- **Unit:** Vitest for `lib/*` (format, filter, sort)
- **Component:** `@testing-library/react-native` + Jest
- **E2E:** Maestro flows (lighter than Detox) — `flows/login.yaml`, `flows/save-vehicle.yaml`, …
- **Visual regression:** Storybook for RN (optional, costly) OR manual screenshot diffs on PR
- **Backend:** Vitest + Testcontainers Postgres

---

## CI/CD

- GitHub Actions:
  - PR → lint + typecheck + tests + EAS preview build (APK URL in PR comment)
  - Merge to `main` → EAS production build + OTA update push
- Backend (Railway): auto-deploy on push to `main`
- Sentry release tags per build
- Maestro Cloud for E2E on real Android emulators (optional)
