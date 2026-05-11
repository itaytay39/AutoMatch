# AutoMatch — PROGRESS

_עדכון אחרון: 2026-05-11_

---

## ✅ שלב 9 — DetailScreen + Navigation + Visual Overhaul

**מה נעשה:**
- `DetailScreen.tsx` — מסך פרטי רכב מלא: גלריית תמונות swipeable, מחיר גדול, chips לנתונים, MarketCompare, PriceHistoryChart, AnomalyBadge, ConditionBadge, דגלים אדומים, CTA פתח מודעה
- `SavedScreen.tsx` — מסך "שמורים" עם AsyncStorage, כרטיסי רכב + empty state
- `savedStore.ts` — global store עם AsyncStorage לשמירת רכבים (cross-screen sync)
- `App.tsx` — Stack Navigator ראשי: Tabs + Detail (slide animation), SavedScreen מחליפה HomeScreen בטאב שמורים
- `navigation/types.ts` — RootStackParamList עם DetailScreen params
- `ListingCard.tsx` — `onPress` prop מחובר לnavigation, heart button מחובר לsavedStore, pill עיצוב שיפור
- `HomeScreen.tsx` — מחובר לnavigation: כרטיסים → Detail, stat pills (מקורות / נבדקו / עסקאות)
- `SearchScreen.tsx` — autocomplete בעברית + אנגלית ל-27 יצרנים, sort option "עסקה"
- `MarketCompare.tsx` — עיצוב premium: gradient bar עם thumb, price grid, diff pill
- `PriceHistoryChart.tsx` — area fill SVG, gradient, dots indicator, footer עם תאריכים ומחירים
- `.github/workflows/ci.yml` — הוסף branch triggers (`claude/**`, `feature/**`) + mobile TypeScript job

**סטטוס:** ✅ כל השינויים committed

---

---

## ✅ שלב 1 — Stealth browser עם playwright-extra

**מה נעשה:**
- `services/scraper/src/core/browser.ts` — החלפת `playwright` ב-`playwright-extra` + `StealthPlugin`
- `StealthPlugin` עוקף 11+ דרכי זיהוי bot (webdriver, navigator plugins, etc.)
- נוסף: residential proxy support דרך `PROXY_URL` / `BRIGHTDATA_PROXY_URL` env var

**סטטוס:** ✅ קוד מוכן — יופעל בפריסה הבאה של ה-scraper

---

## ⏳ שלב 2 — Apify Fallback ל-yad2

**סטטוס:** לא התחיל — דורש `APIFY_TOKEN` מהמשתמש.

---

## ✅ שלב 3 — DB עם נתונים אמיתיים

**מה נעשה:**
- `railway up --service api` — פריסה ידנית שהריצה `prisma db push` + seed בסטארטאפ
- **95 רישומים** ב-DB כרגע (seed data ריאליסטי)
- API חי: `GET /api/v1/listings?limit=5` → מחזיר Kia, Toyota, Hyundai...

**בדיקה:**
```
curl https://api-production-3f4f.up.railway.app/api/v1/listings?limit=1
→ {"total":95,"listings":[{"make":"Kia","model":"Stonic",...}]}
```

**האם המסך מציג רכב?** ✅ כן — OTA update נשלח, הטלפון יקבל בפתיחה הבאה

---

## ✅ שלב 4 — הסרת MOCK_ALERTS

**מה נעשה:**
- `AlertsScreen.tsx` — הסרת `MOCK_ALERTS` לחלוטין
- `useEffect` שקורא ל-`api.getAlerts(userId)` בטעינה
- שמירה/מחיקה מחוברת ל-API (POST/DELETE /alerts)
- `deviceId.ts` — UUID אנונימי עקבי (AsyncStorage + expo-crypto)
- `GET /alerts?userId=xxx` — endpoint חדש ב-API
- auto-create user אנונימי בפוסט (ללא auth)

**סטטוס:** ✅ מחובר ל-API

---

## ✅ שלב 5 — תיקון expo-notifications

**מה נעשה:**
- `pushNotifications.ts` — בדיקת `Constants.appOwnership === 'expo'`
- ב-Expo Go: מדלג בשקט (ללא crash אדום)
- ב-build אמיתי: מעביר `projectId` ל-`getExpoPushTokenAsync`

**סטטוס:** ✅ אין יותר שגיאה אדומה

---

## ✅ שלב 6 — פונט Rubik

**מה נעשה:**
- התקנת `@expo-google-fonts/rubik`
- `App.tsx` — `useFonts({ Rubik_300Light, 400, 500, 600, 700 })`
- `SplashScreen.preventAutoHideAsync()` → מסתיר כשהפונטים מוכנים
- `src/theme/typography.ts` — `fonts` + `textStyles` exports
- כל הקומפוננטים: `fontFamily: fonts.xxx` במקום `fontWeight: string`
- הוסר `@expo-google-fonts/heebo` (לא היה בשימוש)

**סטטוס:** ✅ עברית + אנגלית באותו פונט

---

## ✅ שלב 7 — RTL גלובלי

**מה נעשה:**
- `App.tsx` — `I18nManager.forceRTL(true)` בטעינה
- הרנדור מתחיל ימין → שמאל בכל המסכים

**הערה:** שינוי RTL דורש restart של האפליקציה. לאחר OTA update — סגור ופתח שוב.

---

## ⏳ שלב 8 — Autocomplete בעברית

**סטטוס:** לא התחיל — יבוצע בשלב הבא.

---

## OTA Update האחרון

```
Branch:  preview
Message: DB live + RTL + no-mock-alerts + push fix + stealth
Update:  a77e878c-543c-4c96-befd-b063c4e6ccf8
```

**כדי לקבל עדכון:** פתח את האפליקציה, המתן 5 שניות, סגור ופתח שוב.

---

## מה עובד עכשיו

| פיצ'ר | סטטוס |
|-------|--------|
| API ב-Railway | ✅ |
| 95 רישומים ב-DB | ✅ |
| HomeScreen מציג רכבים | ✅ (אחרי OTA) |
| SearchScreen עובד | ✅ |
| RTL כל האפליקציה | ✅ |
| פונט Rubik עברית+אנגלית | ✅ |
| התראות מחוברות ל-API | ✅ |
| אין שגיאת notifications | ✅ |
| Stealth scraper | ✅ (קוד) |

## מה עוד חסר

| | |
|--|--|
| רכב אמיתי מ-yad2 | ❌ עדיין seed data (APIFY_TOKEN נדרש) |
| Autocomplete | ❌ שלב 8 |
| Auth / login | ❌ scope עתידי |
| מסך פרטי רכב (detail) | ❌ scope עתידי |
