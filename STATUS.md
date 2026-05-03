# סטטוס פרויקט — 2026-05-03

## ✅ עובד
- **Backend API** — רץ על Railway (https://automatch-api.railway.app)
- **PostgreSQL + Redis** — פעילים על Railway
- **17 קונקטורים** — yad2, homeless, autoboom, colmobil, autocenter, eldan, carwiz, trademobile, toyota-select, freesbe, icar, avis, hertz, albar, shlomo, focusnet, winwin
- **זיהוי הונאת קילומטרים** — אלגוריתם + השוואת ק"מ מוצהר מול טסט אחרון
- **בדיקת מספר רישוי** — data.gov.il (תאונות, בעלים, ק"מ אחרון, טסט)
- **AI Anomaly Detection** — זיהוי מודעות חריגות
- **אזהרת שיטפון/אובדן** — salvage detection
- **ציון מצב רכב** — condition score (A-F)
- **השוואת מחיר שוק** — market comparison
- **Push Notifications** — Firebase FCM
- **אפליקציה** — 4 טאבים (ראשי, חיפוש, שמורים, התראות), RTL עברית

## ⚠️ חלקית
- **תמונות** — מוק URLs (Unsplash), לא תמונות אמיתיות מהמודעות
- **בדיקת רישוי** — endpoint קיים, טרם מחובר לאפליקציה
- **חיפוש** — מסך קיים, טרם מחובר ל-API
- **Facebook Marketplace** — בתכנון (ידרוש Apify)

## ❌ לא עובד
- **חיבור API אמיתי לאפליקציה** — האפליקציה מציגה mock data בלבד
- **מסך פרטי רכב** — לא נבנה עדיין
- **EAS Build** — לא הוגדר (אין APK להפצה)

## 🚧 בעבודה
- Deploy API עם vehicle lookup endpoint
- Expo tunnel setup לגישה מהטלפון

## 📋 הצעד הבא
1. חיבור אפליקציה ל-API אמיתי (החלפת mock data)
2. מסך פרטי רכב + כפתור "בדוק מספר רישוי"
3. Facebook Marketplace connector (Apify)
4. EAS Build — APK לגלקסי S24 FE
