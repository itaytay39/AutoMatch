# CLAUDE.md — AutoMatch / אוטומאץ׳

> **קרא אותי לפני כל session.** זה המקור היחיד לאמת לפרויקט הזה. אם משהו במציאות סותר את הקובץ הזה — המציאות שגויה, לא הקובץ.

---

## 📌 מה זה AutoMatch (2 משפטים)

אפליקציית **Android native** (React Native + Expo), עברית, mobile-first, שמרכזת מודעות רכבי יד שנייה מ-**13 מרקטפלייסים אמיתיים בישראל (Tier-1: יד2, פוקוס, WinWin, Autoboom + 9 נוספים — ראה ARCHITECTURE.md)** (יד2, פוקוס, WinWin, Autoboom, ו-9 נוספים). מציעה ניתוח מחיר חכם, התראות, השוואה, וסימולטור מימון בסגנון ProTrip business — קר, שקט, data-forward. Backend ב-Node/Bun על Railway עם Postgres + Redis + 13 scrapers (4 in MVP) על Playwright.

**קהל:** קונים רציניים (גילאי 28-55) שמחפשים רכב יד-שנייה ולא רוצים להסתבך עם 5+ לוחות פתוחים במקביל.

**פלטפורמה:** **Native Android בלבד ב-v1.** React Native + Expo, מותקנת כ-APK. Backend על Railway. iOS לא בskope של v1.

**שפה:** **עברית RTL בלבד** ב-v1. אנגלית אולי ב-v2.

---

## ⛔ 15 חוקים מוחלטים — אסור לעבור

> אם תפר אחד מהם בלי לעדכן את CLAUDE.md קודם, הקוד נדחה ומחזירים לתיקון.

1. **אסור hex hardcoded ב-StyleSheet/inline styles.** רק tokens מ-NativeWind (`bg-accent`, `text-ink`) או מ-`lib/tokens.ts`. היוצא מהכלל היחיד: `currentColor`-equivalent (`'currentColor'` לא קיים ב-RN — תעבור דרך props), `transparent`, ו-decorative SVG fills.
2. **אסור border-radius חדש.** רק מהסולם: `4 / 6 / 10 / 12 / 14 / 20 / 22 / 24 / 999`. NativeWind classes: `rounded-chip / rounded-btn / rounded-card / rounded-sheet / rounded-hero / rounded-full`.
3. **כל מספר חייב `writingDirection: 'ltr'` + font Inter.** מחיר, שנה, ק״מ, %, סליידרים — הכל. השתמש בקומפוננטה `<Num>` shared.
4. **אסור Roboto Mono / system mono.** כל הספרות הן **Inter** (`Inter-Medium` / `Inter-Bold`) דרך `font-num` / `font-numB` ב-NativeWind.
5. **אסור pastel רקעים פר-טאב.** הרקע אחיד `bg-bg-warm` בכל המסכים.
6. **כפתורי forward בכיוון RTL = `chevron-left`. כפתורי back = `chevron-right`.** ב-RN, `I18nManager.isRTL === true`, אז `flex-direction: row` כבר מתהפך. עם זאת, אייקוני chevron צריכים flip ידני — השתמש ב-`<Icon name="..." flipOnRTL />`.
7. **כל card עם `borderWidth: hairlineWidth` + `borderColor: 'line'` + `elevation: 1` (Android shadow).** אסור border 2px על card.
8. **Royal blue (`accent`) רק ל-5 דברים:** Primary CTA, active tab, link, saved-heart, brand-hero gradient. אקסנט אחר → `ink`.
9. **אסור אימוג'י.** אייקונים בלבד מ-`components/ui/Icon.tsx`.
10. **טקסט בעברית = RTL גלובלי דרך `I18nManager.forceRTL(true)`.** אל תכפה direction על `<Text>` בודד אלא אם זה מספר.
11. **Card padding = 16 (Tailwind `p-4`).** Section title = 15px. אל תגדיל.
12. **`start`/`end` במקום `left`/`right` בstyles.** ב-NativeWind: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`.
13. **Touchables עם `hitSlop` של מינ' 12px לכל interactive < 44×44.**
14. **מינימום tap target = 44×44.** בדוק עם React DevTools או manually. גם dots בפגינציה חייבים hitSlop.
15. **אסור לפתוח PR בלי לעדכן את ה-Checklist במסמך הזה ובסוף-phase Approval Gate.** ✅ ליד כל פריט שגמרת. אם פספסת — אני לא ממזג.

---

## 🎨 Design Tokens (HEX מדויק)

### Colors

```css
/* Surfaces */
--bg-warm:     #F6F2EC;   /* page bg */
--bg-deep:     #ECE5DD;   /* outside-the-phone */
--sheet:       #FFFFFF;
--sheet-2:     #F1ECE4;   /* input/tile fill */
--sheet-3:     #EAE3D8;   /* hover/pressed */

/* Ink */
--ink:         #1B1916;   /* primary text */
--ink-2:       #6D665C;   /* secondary */
--ink-3:       #A39A8E;   /* tertiary */
--ink-4:       #C5BEB1;   /* placeholder */
--ink-5:       #DDD3C3;

/* Lines */
--line:        #ECE4D8;
--line-2:      #DDD3C3;

/* Brand */
--accent:      #3450E8;
--accent-2:    #1F37C2;
--accent-soft: #E0E7FC;
--accent-ink:  #1D2E7A;
--on-accent:   #FFFFFF;

/* Signal */
--good:        #1F5A3D;   --good-bg: #DCEBE0;
--warn:        #7A4A0D;   --warn-bg: #F6E2C4;
--bad:         #9A2A14;   --bad-bg:  #FFE2D6;
```

### Typography

```css
--font-he:  'Heebo', 'Rubik', 'Assistant', system-ui, sans-serif;
--font-num: 'Inter', 'Heebo', system-ui, sans-serif;
```

סולם:
- `.h-display` — 22–34px / 800 / `-0.025em` (hero titles, prices)
- `.h-title` — 15–17px / 700 / `-0.015em` (section titles)
- body — 13–14px / 500
- `.eyebrow` — 11px / 600 / `0.06em` UPPERCASE
- micro — 10.5–12px / 600

### Spacing — בסיס 4

`4 / 8 / 12 / 16 / 20 / 24 / 32`. אסור לסטות.

### Radius — סולם בלבד

`4 / 6 / 10 / 12 / 14 / 20 / 22 / 24 / 999`. אסור 28, אסור 32 (חוץ מ-dot indicators).

### Shadow

```css
--shadow-sm:    0 1px 0 rgba(0,0,0,0.02), 0 4px 16px -8px rgba(40,30,15,0.08);
--shadow-md:    0 2px 0 rgba(0,0,0,0.02), 0 8px 24px -8px rgba(40,30,15,0.10);
--shadow-lg:    0 20px 40px -10px rgba(40,30,15,0.18);
--shadow-brand: 0 12px 30px -12px rgba(52,80,232,0.55);  /* רק על CTA כחול */
```

### Animation

```
am-rise      320ms cubic-bezier(.2,.9,.3,1)
am-slide-up  320ms cubic-bezier(.2,.9,.3,1.05)
am-fade-in   240ms ease-out
am-tab-in    320ms cubic-bezier(.2,.9,.3,1)
press        140ms (scale 0.97 on :active)
```

`@media (prefers-reduced-motion: reduce)` — כל ה-animations יורדות ל-`duration: 0`.

---

## 🧩 Component Inventory

קומפוננטות עם props מדויקים. מי שמייצר variant חדש — מעדכן את הטבלה.

### Primitives (`components/ui/`)

```ts
<Tag
  kind: 'default' | 'good' | 'fair' | 'high' | 'accent' | 'soft' | 'outline'
  size: 'sm' | 'md' | 'lg' = 'md'
>{children}</Tag>

<Card
  padded?: boolean = true   // false אם כבר יש padding פנימי
  radius?: 14 | 20 | 24 = 20
  onClick?: () => void
  className?: string
>{children}</Card>

<Btn
  variant: 'primary' | 'accent' | 'soft' | 'outline' | 'ghost'
  // primary  = --ink bg, white text   (הכפתור הראשי הניטרלי)
  // accent   = --accent bg, white text (CTA הכחול)
  // soft     = --sheet-2 bg, --ink text
  // outline  = --sheet bg, --ink text, hairline
  // ghost    = transparent, --ink text
  full?: boolean
  leftIcon?: ReactNode
  onClick?: () => void
>{children}</Btn>

<Icon name={IconName} size={number = 22} color={string = 'currentColor'} strokeWidth={number = 1.8} />
// 50+ icons in icons.tsx — see ICONS.md

<IconBadge
  tone: 'accent' | 'good' | 'fair' | 'bad' | 'neutral' = 'accent'
  size?: number = 40
  radius?: number = 12
>{children}</IconBadge>

<Sparkline values={number[]} w?: 64 h?: 22 up?: boolean />

<SourceTag source={'yad2' | 'autoboom' | 'colmobil' | 'car2' | 'autocenter'} />

<SectionHeader title={string} action?: string onAction?: () => void />

<EmptyState
  icon: IconName
  title: string
  subtitle?: string
  action?: () => void
  actionLabel?: string
  actionVariant?: 'primary' | 'accent' = 'primary'
/>

<SkeletonRow width?: string|number height?: number style? />
<SkeletonCard />

<FAB icon?: IconName = 'plus' label?: string onClick: () => void />

<StatusBar ink?: string = 'var(--ink)' />
<TabBar active='home'|'search'|'saved'|'alerts' onChange alertCount?: number />
<GestureBar />
```

### Vehicle

```ts
<VehicleCard
  vehicle: VehicleSummary
  saved: boolean
  onSave: () => void
  onClick: () => void
  compact?: boolean   // tighter padding for home/saved feed
/>

<SimilarCard
  vehicle: VehicleSummary
  saved: boolean
  onSave: () => void
  onClick: () => void
/>   // 200×210, horizontal carousel item

<RecentThumb
  vehicle: VehicleSummary
  onClick: () => void
/>   // 156×150, home carousel item

<CarVisual
  vehicle: VehicleSummary
  height: number
  radius?: number = 0
  showSpec?: boolean = false   // tiny spec strip overlay
/>
```

### Detail

```ts
<PriceGauge price={number} list={number} />   // half-circle gauge, 3 zones
<PriceHistoryChart values={number[]} />        // area chart, 130px tall
<SpecStat icon={IconName} label={string} value={ReactNode} />
<SellerCard vehicle: VehicleDetail />
<FinanceModal price={number} onClose: () => void />
```

### Filter

```ts
<FilterSheet
  filters: FilterState
  onChange: (next) => void
  onClose: () => void
  onApply: () => void
  resultCount: number
/>

<ChipGroup
  options: string[] | { value, label }[]
  value: string[] | string
  onChange: (next) => void
  multi?: boolean = true
/>

<DualRange min max step valMin valMax onChange={(min, max) => void} format={(n) => string} />
<RangeRow value min max step onChange={(n) => void} format />
```

---

## 📱 Screens (סדר ניווט הקנוני)

ראה `SCREENS.md` למפרט מלא של כל מסך. סיכום קצר:

| # | מסך | קובץ ב-reference | נתיב מטרה |
|---|---|---|---|
| 0 | Splash | `splash.jsx` | קומפוננטה globalית, לא route |
| 1 | Onboarding | `onboarding.jsx` | `/onboarding` (אם user.firstSeen) |
| 2 | Home | `screens.jsx → HomeScreen` | `/` |
| 3 | Search | `search-screen.jsx` | `/search` |
| 4 | Saved | `screens.jsx → SavedScreen` | `/saved` |
| 5 | Alerts | `screens.jsx → AlertsScreen` | `/alerts` |
| 6 | Vehicle Detail | `vehicle-detail.jsx` | `/vehicle/[id]` |
| 7 | Filter Sheet | `filters.jsx` | `/filters` (parallel route modal) |
| 8 | Sort Sheet | `sort.jsx` | `/sort` (parallel route modal) |
| 9 | Profile | `profile.jsx` | `/profile` (parallel route modal) |
| 10 | Add Alert | `add-alert.jsx` | `/alerts/new` (parallel route modal) |
| 11 | Compare | `compare.jsx` | `/compare?ids=a,b,c` |
| 12 | Finance Modal | `vehicle-detail.jsx → FinanceModal` | `/vehicle/[id]/finance` (parallel) |

---

## ✅ Implementation Phases — 8 שלבים עם Approval Gates

**כלל:** סיימת phase → קח screenshot/test log → סמן ✅ למטה → **חכה לאישור המשתמשת** → רק אז עבור לבא.

### Phase 1: Foundation (יום 1-2)

- [ ] `npx create-expo-app@latest automatch -t default` + TypeScript strict
- [ ] התקנת deps: `expo-router @tanstack/react-query nativewind zustand react-hook-form zod @hookform/resolvers @gorhom/bottom-sheet react-native-gesture-handler react-native-reanimated react-native-svg react-native-safe-area-context expo-image expo-linear-gradient expo-notifications expo-secure-store @shopify/flash-list`
- [ ] התקנת dev deps: `tailwindcss prettier eslint`
- [ ] `I18nManager.forceRTL(true)` ב-`app/_layout.tsx`
- [ ] טעינת Heebo + Inter דרך `expo-font`
- [ ] `tailwind.config.ts` עם preset הצבעים/radii (ראה `ARCHITECTURE.md`)
- [ ] EAS account + `eas init` + `eas.json` עם preview profile
- **Gate:** APK שמותקן על מכשיר Android אמיתי, מציג מסך ריק עם רקע קרם + טקסט "AutoMatch" בעברית RTL.

### Phase 2: Primitives & Icons (יום 3-4)

- [ ] `<Icon>` עם כל 50+ האייקונים מ-`reference/icons.jsx` כ-SVG components (`react-native-svg`)
- [ ] `<Num>` shared component עם `writingDirection: 'ltr'`
- [ ] `<Tag>` — 7 variants × 3 sizes
- [ ] `<Card>`, `<Btn>` — כל ה-variants
- [ ] `<IconBadge>`, `<SectionHeader>`, `<EmptyState>`, `<Skeleton*>`
- [ ] `<Sparkline>` עם `react-native-skia` או SVG
- [ ] `<SourceTag>`
- [ ] `<FAB>` עם elevation
- **Gate:** דף "playground" שמראה את כל הפרימיטיביים. screenshot על Pixel 6 emulator.

### Phase 3: Navigation Shell (יום 5)

- [ ] `expo-router` עם `(auth)` + `(app)/(tabs)` groups
- [ ] 4 tabs: home / search / saved / alerts (TabBar מותאם, לא default)
- [ ] Stack routes ל-vehicle/[id], compare, וכו'
- [ ] Modal presentations ל-filters, sort, profile, alerts/new
- [ ] Android back-button handler ב-modals (לסגירה)
- [ ] Status bar + safe-area integration
- **Gate:** וידאו ניווט מקליט מ-Android: בין tabs, פתיחת modal, חזרה עם hardware back-button.

### Phase 4: Vehicle UI (יום 6-8)

- [ ] `<VehicleCard>`, `<SimilarCard>`, `<RecentThumb>`
- [ ] `<CarVisual>` ← החלף ל-`expo-image` עם cover photo + blurhash placeholder
- [ ] FlashList לרשימות ארוכות (search results, saved)
- [ ] Heart toggle אופטימיסטי + toast
- [ ] Press feedback עם Reanimated `useAnimatedStyle` + scale 0.97
- **Gate:** screenshot Home pixel-compare עם reference. וידאו של scroll smoothness ב-FlashList עם 50+ items.

### Phase 5: API Integration (יום 9-11)

- [ ] Backend על Railway: Hono/Fastify + drizzle + Postgres
- [ ] Routes מ-`DATA_MODEL.md` (כולם)
- [ ] Seed עם 20 רכבים אמיתיים + תמונות
- [ ] Mobile: `lib/api/client.ts` עם auth header + retry
- [ ] TanStack Query hooks (`useVehicles`, `useVehicle`, `useSaves`, …)
- [ ] SMS OTP login flow (Twilio או InforU)
- [ ] Token ב-`expo-secure-store`
- **Gate:** APK preview build. וידאו: login OTP → home שמושך מ-Railway → tap vehicle → detail.

### Phase 6: Search & Filter (יום 12-14)

- [ ] Search bar + autocomplete (debounced)
- [ ] FilterSheet ב-`@gorhom/bottom-sheet` עם snap-points
- [ ] DualRange — שני thumbs עם PanResponder (אין `<input type="range">` ב-RN)
- [ ] SortSheet
- [ ] URL/route state עם expo-router search params
- [ ] Empty state עם `<EmptyState>` shared
- **Gate:** וידאו: search → filter → apply → results refine.

### Phase 7: Detail & Flows (יום 15-17)

- [ ] Vehicle detail — gallery עם `expo-image` paginated + dots
- [ ] PriceGauge עם `react-native-svg` או skia
- [ ] PriceHistoryChart (skia recommended for smooth lines)
- [ ] SellerCard + `expo-linking` ל-`tel:` ו-`whatsapp://`
- [ ] Similar carousel
- [ ] FinanceModal עם 2 sliders (`@react-native-community/slider` או PanResponder)
- [ ] AddAlertSheet — 3-step wizard (`react-hook-form` + zod)
- [ ] Compare screen
- **Gate:** וידאו flow מלא: home → vehicle → save → call seller (tel link) → similar → finance.

### Phase 8: Scrapers, Push, Polish, Launch (יום 18-25)

#### Backend (Railway)

- [ ] 13 scrapers (4 in MVP) על Playwright headless
- [ ] Normalizer per source (canonical Hebrew make/model)
- [ ] Cron job per source (10-30 min) דרך BullMQ
- [ ] Price-drop detector → אירוע ל-Redis pub/sub
- [ ] Alert-matcher worker → צובר matches → FCM
- [ ] Fair-price model v1 (median per group)

#### Mobile polish

- [ ] Skeleton בכל list fetch
- [ ] Empty states בכל מסך
- [ ] Toast מערכת
- [ ] Push: `expo-notifications` + FCM, register token, deep-link `automatch://vehicle/[id]`
- [ ] Offline support: cached vehicles ב-SQLite + drizzle
- [ ] Sentry + PostHog
- [ ] `prefers-reduced-motion` (RN: `AccessibilityInfo.isReduceMotionEnabled`)
- [ ] TalkBack pass בעברית
- [ ] APK size optimization (< 30MB)

#### Release

- [ ] `eas build --profile production --platform android` → AAB
- [ ] Internal Play Store track upload
- [ ] APK URL מעוצב ב-landing-page לhosting ישיר
- [ ] Sentry release tagged
- **Final Gate:** Lighthouse-like audit (Bundle size + cold-start time) + 3 בדיקות עם משתמשים אמיתיים על מכשירי Android שונים (Samsung A54, Pixel 6, Xiaomi Redmi).

---

## 🐛 Common Mistakes (טעויות שתעשה — איך לזהות)

> אם נתפסת באחת מהן — עצור, תקן, ועדכן את הפיסקה הזו כדי שלא תחזור.

### 1. שכחת `.num` על מספר

**סימן:** מחיר נראה Heebo + לא tabular, או הסדר מתבלגן בתוך משפט עברי.
**תיקון:** עטוף ב-`<span className="num">`. בכל המקומות.

### 2. השתמשת ב-`left`/`right` במקום logical properties

**סימן:** ב-RTL הכפתור נמצא בצד הלא נכון.
**תיקון:** `insetInlineStart` / `insetInlineEnd` / `marginInlineStart` / `paddingInlineEnd`. או Tailwind `start-*` / `end-*`.

### 3. צ'יפ פעיל עם `--accent` במקום `--ink`

**סימן:** הרבה כחול בכל מסך — נראה צרכני.
**תיקון:** בפילטרים וב-toggles צ'יפ active = `--ink` (שחור). כחול שמור ל-CTA אחד למסך.

### 4. radius חדש שלא בסולם

**סימן:** עיגול של 18 או 26 או 30. נראה לא-עקבי.
**תיקון:** מצא הכי קרוב ב-`14 / 20 / 22 / 24`. אם באמת אין מתאים — שאל לפני שתוסיף.

### 5. כפתור chevron בכיוון הפוך

**סימן:** "הבא" מצביע ימינה ב-RTL. לא הגיוני.
**תיקון:** ב-RTL forward = `chevron-left`, back = `chevron-right`. חוץ מ-icons סימטריים (heart, search, bell, bookmark).

### 6. השתמשת ב-`window.*` globals

**סימן:** הקוד עובד אבל ה-TypeScript לא בודק אותו.
**תיקון:** ייבא דרך module imports. ה-`window.AM_*` היו רק לפרוטוטיפ.

### 7. שכחת `prefers-reduced-motion`

**סימן:** באודיטור a11y מקבל ציון נמוך.
**תיקון:** הוסף media query שמאפס `animation-duration` ו-`transition-duration` ל-0.01ms.

### 8. הוספת פיצ'ר שלא ב-spec

**סימן:** "החלטתי להוסיף breadcrumbs כדי לעזור לניווט".
**תיקון:** **עצור.** זה לא ב-SCREENS.md. שאל את המשתמשת. אם מאשרת — קודם עדכן את CLAUDE.md/SCREENS.md, אז כתוב קוד.

### 9. תמונת רכב חתוכה ב-aspect ratio שלא ב-spec

**סימן:** התמונה נראית מעוותת.
**תיקון:** Card image = 16:10. Detail hero = 16:11. Similar = 16:9. השתמש ב-`next/image` עם `aspectRatio` מפורש.

### 10. צל צבעוני לא-מותג

**סימן:** הוספת `box-shadow: 0 4px 12px rgba(34,197,94,0.4)` ירוק על success card.
**תיקון:** רק `--shadow-sm/md/lg` (חם-שחור) או `--shadow-brand` (כחול). שום צל אחר.

---

## 🔐 Environment Variables

### Mobile (`.env` for Expo)

```
EXPO_PUBLIC_API_URL=https://api.automatch.co.il       # Railway production
EXPO_PUBLIC_API_URL_DEV=http://192.168.1.10:3000      # local dev (your machine IP, not localhost)
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_POSTHOG_KEY=

# Only public-safe values here. Never put secrets in EXPO_PUBLIC_*.
```

### Backend (`.env` on Railway)

```
DATABASE_URL=                          # Railway Postgres plugin
REDIS_URL=                             # Railway Redis plugin

JWT_SECRET=                            # openssl rand -base64 32

# SMS provider (Twilio / Vonage / InforU)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=AutoMatch

# Storage — Cloudinary or R2
CLOUDINARY_CLOUD=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# FCM (push)
FCM_SERVICE_ACCOUNT_JSON=              # base64-encoded JSON

# Monitoring
SENTRY_DSN=
POSTHOG_KEY=

# Israeli gov
GOV_VEHICLE_API_KEY=                   # data.gov.il for plate lookups
```

`.env` ב-`.gitignore`. Expo: גם `.env.local`.

---

## 🎯 Definition of Done — לכל קומפוננטה/מסך

- [ ] Pixel-perfect לscreenshot ב-`reference/screens/`
- [ ] TypeScript types מלאים, no `any`
- [ ] Storybook story עם variants
- [ ] Vitest test (rendering + interaction)
- [ ] בדיקת keyboard navigation
- [ ] בדיקת VoiceOver בעברית (קצרה — 30 שניות)
- [ ] No `console.log`, no commented code
- [ ] Bundle size delta < 5KB gzipped (אם קומפוננטה)
- [ ] Updated `CHANGELOG.md`

---

## 📞 If You're Stuck

1. **בעיה ויזואלית** — תפתח את `reference/AutoMatch.html` בדפדפן ותעשה inspect element. הקוד שם הוא ה-reference.
2. **בעיה ארכיטקטונית** — `ARCHITECTURE.md` כיסוי כל הdecisions.
3. **בעיית data shape** — `DATA_MODEL.md` עם schema מלא.
4. **לא ברור מה הseparation בין מסכים** — `SCREENS.md`.
5. **כל דבר אחר** — שאל את המשתמשת. אל תנחש.

---

## 🚦 Final Checklist Before Saying "Done"

- [ ] קראתי את כל ה-15 חוקים. לא הפרתי אף אחד.
- [ ] עברתי על כל 8 ה-Phases. כל פריט מסומן ✅ עם הוכחה (screenshot/test).
- [ ] קיבלתי אישור מהמשתמשת אחרי כל Phase.
- [ ] עברתי על "Common Mistakes". לא עשיתי אף אחת.
- [ ] Lighthouse ≥ 95 בכל הקטגוריות.
- [ ] בדיקה במכשיר אמיתי (לא רק browser DevTools mobile).
- [ ] OAuth/Auth עובד end-to-end.
- [ ] אין console errors בproduction build.
- [ ] `.env.local` ב-`.gitignore`. בדקתי `git status` כדי לוודא שלא דלף.
- [ ] עדכנתי את ה-CHANGELOG.md.
