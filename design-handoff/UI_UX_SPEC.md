# AutoMatch — מפרט UI/UX מלא לעיצוב אייפון

**אפליקציה:** AutoMatch — אגרגטור רכבי יד שניה ישראלי  
**פלטפורמה:** iOS (iPhone) — גרסה ראשית. עיצוב ל-iPhone 15 Pro (393×852 pt)  
**כיוון:** RTL עברית לאורך כל האפליקציה  
**פונט:** Rubik (Hebrew-friendly, weights: 300/400/500/600/700)  
**גישה:** Clean, Premium, Trustworthy — כמו Airbnb פוגש AutoTrader

---

## טוקנים (Design Tokens) — חובה לשמור בדיוק

### צבעים

| Token | Hex | שימוש |
|---|---|---|
| bg0 | `#F5F2EA` | רקע האפליקציה — off-white חם |
| bg1 | `#FFFFFF` | כרטיסים, sheets |
| bg2 | `#FBFAF6` | surface משני |
| bg3 | `#F0EDE5` | hover / pressed |
| fg1 | `#1B1E1B` | טקסט ראשי |
| fg2 | `#4A4D4A` | טקסט משני |
| fg3 | `#7A7D7A` | captions, tertiary |
| fg4 | `#A8AAA6` | placeholder, disabled |
| accent | `#2A5BB5` | כחול ראשי — כפתורים, links |
| accentSoft | `#DCE6F5` | רקע כחול רך |
| success | `#1F6E4D` | ירוק — עסקה טובה |
| successSoft | `#E1EFE8` | רקע ירוק רך |
| warning | `#B07A1A` | כתום — זהירות |
| warningSoft | `#F5EBD2` | רקע כתום רך |
| danger | `#B83A2A` | אדום — התראה |
| dangerSoft | `#F5DDD7` | רקע אדום רך |
| border | `rgba(27,30,27,0.08)` | גבולות |

### צבעי tabs (כל טאב קיבל tint ייחודי)

| Tab | Tint Background | Text on Tint |
|---|---|---|
| ראשי (Home) | `#E6EEE7` | `#2E6F4E` |
| חיפוש (Search) | `#F0EADB` | `#8B6F2E` |
| שמורים (Saved) | `#EDE5F0` | `#6A468C` |
| התראות (Alerts) | `#F4E5DC` | `#A1532B` |

### Spacing (4pt grid)
`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`

### Border Radius
`xs=4 / sm=8 / md=12 / lg=16 / xl=20 / xxl=28 / pill=999`

### Typography Scale

| Role | Size | Weight |
|---|---|---|
| display1 | 30pt | 700 |
| display2 | 26pt | 700 |
| headline | 19pt | 600 |
| title | 15pt | 500 |
| body | 14pt | 400 |
| caption | 12pt | 400 |
| micro | 10pt | 400 |

---

## מבנה הניווט

```
App
├── Tab Bar (4 טאבים)
│   ├── ראשי (Home)
│   ├── חיפוש (Search)
│   ├── שמורים (Saved) ← badge עם מספר
│   └── התראות (Alerts)
└── Stack: מסך פרטי רכב (Detail) — push מעל כל טאב
```

**Tab Bar:** Floating pill-style, לא צמוד לתחתית. רקע `bg1`, shadow עדין, border-radius=28. האייקון הפעיל מקבל pill background בצבע ה-tint של הטאב הנוכחי.

---

## מסכים — מפרט מפורט

---

### 1. מסך ראשי (Home)

**מטרה:** Feed של כל הרכבים, מדגיש עסקאות טובות.

#### Header
- גובה: 88pt (safe area + content)
- רקע: `bg0` (ללא card)
- **שמאל (RTL = leading):** לוגו "AutoMatch" — Rubik Bold 22pt, `fg1`
- **ימין (trailing):** אייקון פעמון (התראות) + אייקון פרופיל (עתידי)
- מתחת ל-header: שורת stats קטנה — "1,247 רכבים | 34 עסקאות טובות היום" — caption, fg3

#### Banner "עסקאות היום" (אופציונלי, רק אם יש עסקאות)
- רקע gradient: `#E6EEE7` → `#FFFFFF`
- כותרת: "🔥 34 עסקאות מתחת למחיר שוק"
- Rubik SemiBold 14pt, `#2E6F4E`
- border-radius: 12pt, padding: 12/16

#### כרטיס רכב (ListingCard)
כרטיסים ב-feed אנכי, full-width עם padding 16pt בצדדים.

**מבנה הכרטיס:**
```
┌─────────────────────────────────┐
│  [תמונת רכב — 220pt גובה]       │  ← corner-radius: 16pt (top)
│  [badge עסקה — top-right]       │
│  [badge מקור — top-left]        │
├─────────────────────────────────┤
│  טויוטה קורולה 2021             │  ← Rubik 600, 17pt, fg1
│  ₪ 89,000            [♡ שמור]  │  ← מחיר: Rubik 700, 20pt, accent
│  ─────────────────────────────  │
│  📍 חיפה  🛣️ 45,000 ק"מ  📅 3d │  ← caption row, fg3
│  [badge: עסקה טובה / מחיר שוק] │  ← colored pill
└─────────────────────────────────┘
```

**Badge עסקה (top-right על התמונה):**
- "עסקה מצוינת" → רקע `successSoft`, טקסט `success`, border: 1px solid success/30%
- "עסקה טובה" → אותו ירוק, פחות עז
- "מחיר שוק" → `bg3`, `fg2`
- "יקר" → `warningSoft`, `warning`

**Badge מקור (top-left על התמונה):**
- Pill קטן עם שם האתר (יד2, אוטובום וכו')
- רקע שחור/50%, טקסט לבן, micro font
- dot צבעוני לפי מקור (כל אתר קיבל צבע)

**Badge ימי מודעה:**
- אם > 30 יום: "30+ ימים" באדום רך → רמז שהמחיר גמיש

**Heart / שמור:**
- אייקון לב בpositioning top-right (בתוך התמונה)
- מצב פעיל: לב מלא, `danger`
- אנימציה: scale bounce כשלוחצים

**Separator בין כרטיסים:** 8pt רווח, ללא קו

---

### 2. מסך חיפוש (Search)

**מטרה:** חיפוש ופילטור מלא.

#### Search Bar
- גובה: 48pt
- רקע: `bg1`, border-radius: pill (24pt)
- Border: 1.5px solid `border`
- Placeholder: "חפש יצרן, דגם..." — fg4
- אייקון גדלת (search icon) — ימין (RTL leading)
- כפתור X לניקוי — שמאל (trailing)
- בmicro-interaction: border הופך `accent` כשמfocused

#### Suggestions Dropdown
- מופיע מתחת ל-search bar כשמקלידים
- כרטיס לבן, shadow, border-radius: 12pt
- שורות של suggestions עם icon חיפוש + שם הדגם
- highlight על match text

#### Quick Filter Chips
- שורה אופקית (scroll), מתחת ל-search bar
- Chips: "חשמלי | היברידי | עד 150K ₪ | 4X4 | עד 2020"
- מצב לא-פעיל: `bg3`, `fg2`, border: `border`
- מצב פעיל: `accent`, `onAccent`
- border-radius: pill, height: 34pt, padding: 0/14pt

#### Sort Bar
- שורה מתחת לchips: "מיון: רלוונטי ▾ | 127 תוצאות"
- caption font, fg3
- לחיצה פותחת action sheet עם אפשרויות מיון

#### Filter Sheet (Bottom Sheet)
נפתח כ-modal מלמטה (drag to dismiss).

**פילטרים:**
1. **יצרן ודגם** — Picker / autocomplete
2. **טווח מחיר** — Range slider, ₪0 → ₪500K
3. **שנה** — Range slider, 2005–2025
4. **ק"מ** — Range slider, 0–300K
5. **סוג דלק** — Chips: בנזין | דיזל | חשמלי | היברידי | פלאג-אין
6. **יד** — Chips: 1 | 2 | 3+
7. **עיר / אזור** — Text input עם autocomplete
8. **מקורות** — Toggle buttons לכל אתר

Header של ה-sheet: "פילטרים" + "נקה הכל" + X לסגירה
Footer: כפתור "הצג X רכבים" — full-width, accent, pill-radius

---

### 3. מסך פרטי רכב (Detail)

**מטרה:** כל המידע על רכב ספציפי. המסך הכי חשוב.

#### גלריית תמונות (Hero)
- גובה: 288pt, full-width
- Horizontal scroll עם pager dots
- תמונות ב-object-fit cover
- **חזרה (back button):** top-left, circle לבן עם shadow, chevron אחורה
- **שמור (bookmark):** top-right, circle לבן עם לב
- **שתף:** top-right (שני מימין ללב), circle לבן עם share icon
- Pager dots: center-bottom של הגלריה, dots קטנים

#### Content (Scrollable)
מתחת לגלריה, רקע `bg0`, rounded top corners (28pt).

**Header:**
```
Toyota Corolla Cross 2021          [badge: עסקה מצוינת]
Rubik 700, 22pt

₪ 89,000
Rubik 700, 28pt, accent

📍 חיפה  •  🛣️ 45,200 ק"מ  •  יד 2  •  3 ימים
fg3, caption
```

**Deal Score Bar** (אם קיים):
- Progress bar מ-0 ל-100, צבע לפי ציון
- "ציון עסקה: 84/100 — עסקה טובה"

**Spec Grid (4 תאים):**
```
┌──────────┬──────────┐
│  2021    │  1,800cc │
│  שנה     │  מנוע    │
├──────────┼──────────┤
│  45,200  │  בנזין   │
│  ק"מ     │  דלק     │
└──────────┴──────────┘
```
כל תא: label caption fg3, value title fg1.

---

#### סקשן: ניתוח מחיר שוק
רקע: `tintHome` (#E6EEE7)

- כותרת: "ניתוח מחיר שוק"
- Gauge/נמדד: מחיר נוכחי vs ממוצע שוק
  - Visual bar עם 3 zones: זול / שוק / יקר
  - חץ/pointer על המיקום של הרכב
- טקסט: "מתחת לממוצע השוק ב-₪8,200 (9%)"
- "מבוסס על 34 רכבים דומים ביד2, אוטובום ועוד"

#### סקשן: היסטוריית מחיר
- Line chart קטן: ציר X = תאריכים, ציר Y = מחיר
- נקודות data: מחיר בכל יום שנרשם
- צבע קו: accent
- אם ירד: badge ירוק "ירד ב-₪3,000 ב-30 יום"

#### סקשן: אנומליות ודגלים אדומים
רקע: `warningSoft` אם קיים משהו, `successSoft` אם נקי.

**במידה ויש דגלים:**
- כותרת: "⚠️ נקודות לבדיקה"
- רשימה של דגלים עם אייקון ×
- "קילומטראז' חשוד — נמוך מאוד לגיל הרכב"
- "מודעה חדשה מדי יום — סימן להיסטוריה"

**במידה שנקי:**
- "✓ לא נמצאו חריגות" על רקע ירוק רך

#### סקשן: בדיקת רישוי (Vehicle Lookup)
- כותרת: "בדיקת רישוי"
- Input מספר רישוי: text field עם כפתור "בדוק"
- **אחרי בדיקה — Grid נתוני משרד הרישוי:**
  ```
  דגם מלא:    Toyota Corolla      שנת ייצור: 2021
  בעלים:      פרטי                טסט עד:    03/2026
  ק"מ דיווח:  44,800              תאונות:    ✓ ללא
  ```
- **Trust Score Bar:** 0-100, צבע ירוק/כתום/אדום
- אם יש פער ק"מ > 10K: **Banner כתום** — "⚠️ פער ק"מ גבוה — הרכב מציג 45K אך הדיווח הרשמי 44.8K"

#### סקשן: מחשבון מימון
- כפתור "חשב מימון" — collapse/expand
- **כשפתוח:**
  - Slider: מקדמה 10%-50% (increments 5%)
  - Slider: תקופה 12/24/36/48/60/72 חודשים
  - Output: "₪ 1,847 / חודש (72 חודשים, 6.5% ריבית)"
  - disclaimer micro: "הערכה בלבד, לא מחייבת"

#### Footer
- כפתור "עבור למודעה" — full-width, accent, 52pt height, pill-radius
- כפתור "שיתוף" — outline, border accent

---

### 4. מסך שמורים (Saved)

**מטרה:** רכבים ששמרתי.

#### Empty State
- אייקון לב גדול (מאויר, לא flat)
- "עדיין לא שמרת רכבים"
- "לחץ על הלב בכל רכב כדי לשמור אותו"
- כפתור: "לחיפוש" → navigate לtab חיפוש

#### State עם שמורים
- אותם כרטיסי ListingCard כמו Home
- Badge מיוחד: "ירד מחיר ₪2,000!" על רכבים שהמחיר השתנה
- מיון: "נשמר לאחרונה | ירידת מחיר | מחיר"

---

### 5. מסך התראות (Alerts)

**מטרה:** נוטיפיקציות שהגיעו — רכבים חדשים, ירידות מחיר.

#### Header
- "התראות" + כפתור "קרא הכל"

#### Empty State
- אייקון פעמון מאויר
- "אין התראות עדיין"
- "הפעל התראות כדי לקבל עדכון ברגע שמופיע רכב שמתאים לך"

#### רשימת התראות

**כל התראה:**
```
┌─────────────────────────────────┐
│ [thumbnail 56pt] Toyota Corolla │
│                  ₪89,000        │
│                  🔔 רכב חדש     │  ← badge סוג התראה
│                  לפני 3 דקות    │  ← caption, fg3
└─────────────────────────────────┘
```

**סוגי התראות וצבעים:**
- "רכב חדש" → accent blue
- "ירידת מחיר" → success green
- "עסקה מצוינת" → warning orange (בחיוב)
- "מחיר עלה" → danger red

**Swipe to dismiss** (שמאלה) → מחיקת התראה

---

## קומפוננטים משותפים

### Condition Badge (ConditionBadge)
Pill עם ציון מצב:
- A / B → `successSoft` + `success`
- C → `warningSoft` + `warning`
- D / F → `dangerSoft` + `danger`
- טקסט: "מצב מצוין / טוב / בינוני / גרוע"

### Anomaly Badge (AnomalyBadge)
- clean → ✓ ירוק
- watch → 👁 כתום
- suspicious → ⚠️ כתום-אדום
- alert → 🚨 אדום

### Source Dot
נקודה צבעונית + שם האתר:
- יד2: `#FF6B35` (כתום)
- אוטובום: `#35B0FF` (כחול)
- homeless: `#6B35FF` (סגול)
- carwiz: `#35FF8A` (ירוק)
- שאר: `#A8AAA6` (אפור)

---

## Tab Bar — מפרט מפורט

```
┌─────────────────────────────────────────┐
│  [ראשי]  [חיפוש]  [שמורים ²]  [התראות]  │
└─────────────────────────────────────────┘
```

- **Floating** — לא צמוד לקצה, margin 12pt מהתחתית + safe area
- **רקע:** `bg1`, shadow: 0 4 16 rgba(0,0,0,0.08)
- **border-radius:** 28pt (pill shape)
- **Tab פעיל:** pill background בצבע ה-tint של הטאב, icon + label
- **Tab לא פעיל:** icon בלבד, fg3
- **אנימציה:** spring כשמחליפים טאב, scale 0.9→1 על icon
- **Badge:** על "שמורים" — pill אדום קטן עם מספר

---

## אנימציות ומיקרו-אינטראקציות

| אירוע | אנימציה |
|---|---|
| כניסת כרטיסים ל-feed | Fade + slide up, stagger 50ms |
| לחיצה על לב | Scale bounce: 1→1.4→0.9→1, צבע flip |
| Tab switch | Spring scale 0.9→1 על icon |
| Pull to refresh | Custom spinner (לא default iOS) |
| כפתור ראשי | Scale 0.97 בpress, spring release |
| Bottom sheet open | Slide up + backdrop fade |
| Filter chip toggle | Scale + color transition 150ms |
| Gauge needle | Sweep מ-0 לערך — ease-out 800ms |

---

## Micro-states חשובים לעצב

1. **Loading skeleton** — כרטיסים ריקים עם shimmer animation בזמן טעינה
2. **Error state** — "משהו השתבש, נסה שוב" עם כפתור retry
3. **Empty search** — "לא נמצאו רכבים" עם אייקון ואפשרות לנקות פילטרים
4. **No connection** — "אין חיבור לאינטרנט" עם אנימציה
5. **Pull to refresh** — indicator בעיצוב מותאם

---

## פלטת אייקונים

**ספריה:** Ionicons (כבר בפרויקט)

| פעולה | אייקון |
|---|---|
| Home | home-outline / home |
| Search | search-outline |
| Saved | bookmark-outline / bookmark |
| Alerts | notifications-outline / notifications |
| Back | chevron-back |
| Close | close |
| Share | share-outline |
| Filter | options-outline |
| Sort | swap-vertical-outline |
| Location | location-outline |
| Speedometer | speedometer-outline |
| Calendar | calendar-outline |
| Car | car-outline |
| Price | pricetag-outline |
| Heart | heart-outline / heart |
| Warning | warning-outline |
| Check | checkmark-circle-outline |

---

## מה לא לשנות (Constraints)

1. כיוון RTL — כל layout חייב להיות מירוין ימין-שמאל
2. פונט Rubik בלבד — לא לשנות
3. הטוקנים של הצבעים — כל שינוי צבע = שינוי ב-tokens.ts
4. 4pt grid — spacing תמיד מכפולה של 4
5. הנווט הטאבים הוא floating pill — לא classic tab bar

---

## Deliverable מהמעצב

כשהעיצוב מוכן, תעלה:
1. **Figma Export** או **תמונות PNG** של כל מסך בdensity x3
2. **tokens.json** אם שינית צבעים / spacing
3. **component-list.md** — רשימת קומפוננטים עם variants

אני (הDeveloper) אממש את העיצוב 1:1 ב-React Native ברגע שיגיע.
