# AutoMatch — Design System

> Smart Aggregation. Smarter Decisions.

AutoMatch הוא Web App פרימיום, mobile-first ו-**RTL-first (עברית)**, שמרכז ומנתח רכבי יד שנייה ממספר מרקטפלייסים ישראליים (יד2 וכו'), ומציג אותם דרך חוויה מותאמת-אישית מבוססת-נתונים: מד-מחיר חכם, גרפי מחיר היסטוריים, סינון מתקדם, וסימולטור מימון.

מערכת העיצוב מקודדת זהות פרימיום, בטוחה בעצמה, mobile-first, סביב **גרדיאנט סגול-כחול חשמלי**, פלטת **deep-charcoal**, וטיפוגרפיה ילידית-עברית (Heebo / Assistant).

---

## מקורות

המערכת נבנתה אך ורק מהחומרים שהמשתמש סיפק:

1. **גליון רפרנס** — `uploads/Screen Shot 2026-05-01 at 21.44.55.png`. תמונה אחת המכילה: לוגו, פלטת צבעים עם hex, סולם טיפוגרפיה, אייקונים, רכיבים (כפתורים, שדות קלט, מחווני מחיר, sparklines), ושמונה מסכים לדוגמה (Dashboard, Results, Details, Filters, Interactions, Price History, Desktop).
2. **תקציר מילולי** — מסמך מוצר/מערכת-עיצוב שתואר בצ'אט: positioning, מסכים מרכזיים, פילוסופיית צבעים, טיפוגרפיה, layout, אייקונוגרפיה, tone.

לא סופק codebase או Figma file. השחזור ב-`ui_kits/` מבוסס ישירות על שני המקורות לעיל; כל מקום שדרש הנחה — מצויין מפורשות.

---

## אינדקס

| נתיב | תוכן |
|---|---|
| `README.md` | המסמך הזה — context, content, visual foundations, iconography, fonts |
| `SKILL.md` | מניפסט Skill לסוכן (תאימות גם ל-Claude Code) |
| `colors_and_type.css` | כל ה-CSS variables + סגנונות אלמנטים סמנטיים |
| `assets/` | לוגו, תמונות, רקעי גרדיאנט |
| `preview/` | כרטיסי הצגה לטאב Design System (foundations + components) |
| `ui_kits/mobile/` | אפליקציית web עברית/RTL — Dashboard, Results, Details, Filters, Finance |
| `ui_kits/desktop/` | תצוגת desktop — sidebar + grid תוצאות |
| `uploads/` | חומרי המקור |

קח את `colors_and_type.css` לכל קובץ חדש — הטוקנים מגיעים יחד איתו.

---

## Content Fundamentals

**Voice.** בוטח, תמציתי, data-forward. AutoMatch הוא כלי לקונים רציניים — הקופי לא מתלהב, לא מבקש מהמשתמש "לאהוב" משהו. מספרים ופעלים עושים את העבודה.

**Casing.** תוויות סקשנים בגליון הרפרנס הן **ALL CAPS** עם prefix מספרי (`01 COLOR SYSTEM`). ב-UI חי, השתמש ב-**Sentence case** לכפתורים וכותרות באנגלית. עברית — אין מקרים.

**גוף ראשון/שני.** פנייה ב-**אתה / את** ("שמור חיפוש"), אבל רוב הקופי הוא data-first ומדלג על כינויי גוף. אף פעם "אנחנו" בתוך המוצר.

**מספרים.** מספרים הם אזרחים מדרגה ראשונה. תמיד tabular-figures, תמיד נרנדרים LTR גם בתוך פסקאות RTL. מטבע: `₪ 129,900` עם רווח דק, סימן ה-₪ לפני המספר. קילומטראז': `45,000 ק״מ`. שנה: `2021`. אף פעם לא לקצר מחירים ("129K") ברשימות — מספרים עגולים נראים זולים ולא אמינים.

**דוגמאות לטון.**
- טוב: `מחיר טוב`, `ירידת מחיר היום`, `סך ריבית ₪ 11,940`.
- רע: "וואו, מציאה!", "אל תפספס!", "🔥 רכב לוהט".
- מד המחיר אומר מילה אחת — `טוב` / `סביר` / `יקר` — לא משפט.

**אימוג'י.** אין. המותג משתמש ב-outline icons + נקודות צבע סמנטיות בלבד.

---

## Visual Foundations

**פילוסופיית צבע.** קנבס charcoal עמוק (`#0B0F14`) עם גרדיאנט סגול→כחול חשמלי כצבע הרועש היחיד. כל השאר אפור-סקאלה או סמנטי. המשטחים מטפסים ב-~5 נקודות L*: `#0B0F14 → #12171E → #18212A → #1F2935`. אף פעם לא לבן טהור — גם light mode אופציונלי הוא off-white בניגוד גבוה.

**טיפוגרפיה.** Heebo (עברית + לטינית) ו-Assistant (עברית) עם Inter כ-fallback לטיני. סולם תצוגה הדוק: 32 / 24 / 20 / 16 / 14 / 12. המשקל עושה את העבודה — Bold ל-displays, SemiBold ל-headlines, Medium ל-titles, Regular ל-body. Letter-spacing מתהדק שלילית ככל שהגודל גדל (`-0.02em` ב-display, `0` ב-body). אף פעם לא italic — עברית לא מרנדרת italic יפה.

**Spacing.** בסיס 4px; הקצב הנפוץ הוא 4 / 8 / 12 / 16 / 24 / 32. כרטיסים נושמים — padding פנימי נדיב (`16–20px` במובייל, `24px` בדסקטופ) עם `12–16px` בין siblings. רווח לבן הוא הסיגנל הפרימיום.

**רקעים.** `#0B0F14` ברירת מחדל. מסכי hero / details מניחים **תמונה כהה full-bleed עם protection-gradient תחתון** (`linear-gradient(180deg, transparent 0%, rgba(11,15,20,.85) 100%)`) כדי שכותרות יקראו מעל דימויים. ללא טקסטורות, ללא רעש. אופציונלי: זוהר רדיאלי סגול→כחול מאחורי ה-CTA הראשי, בלור ~120px, אטימות מתחת ל-20%.

**אנימציה.** מהירה ובטוחה — `140ms` ל-hover, `220ms` למעברי רכיבים, `360ms` לכניסת sheet/modal. Easing: `cubic-bezier(.22,.61,.36,1)` (out-quart) לכניסות, ספרינג עדין (`.34,1.56,.64,1`) ללחיצות. ללא bounces על data, ללא לולאות דקורטיביות. RTL-aware: swipes הופכים כיוון.

**Hover.** כפתורים וכרטיסים מתרוממים ב-`2px` עם bump של `1.5×` בצל ו-+4% בהירות. כפתורי איקון: `--fg-3` → `--fg-1`. ה-CTA הגרדיאנט מקבל `--glow-primary` ב-hover.

**Press.** scale `0.97`, ללא שינוי צבע, מיידי (`80ms`) — מרגיש כמו כפתור פיזי. סליידרים ומחוונים מציגים טבעת הפטית (`box-shadow: 0 0 0 8px rgba(91,136,255,.18)`) ב-thumb.

**גבולות.** Hairlines ב-`rgba(255,255,255,.06)` — כמעט בלתי-נראים, רק להפריד משטחים סמוכים. כרטיסים מעדיפים **shadow-and-fill מעל borders**; הגבולות העקביים היחידים הם סביב inputs ו-outline buttons.

**צללים.** שכבתיים, כהים, אף פעם לא צבעוניים מלבד accent-glows. `--shadow-2` (`0 4px 12px rgba(0,0,0,.45)`) לכרטיסים במנוחה, `--shadow-3` לפאנלים צפים, `--shadow-4` ל-modals. הזוהר (`--glow-primary/-purple/-cyan`) שמור ל-CTA הראשי ולמחט מד-המחיר.

**Glassmorphism.** שמור ל-: bottom nav, top status overlays, modals, dropdowns, וווידג'ט המימון הצף. אף פעם לא בלור על משטח צבעוני מלא — רק מעל צילום או מעל רקע הדף. רדיוס בלור תמיד `20px`, רוויה `140%`. גוון: `rgba(18,23,30,.78)` עם גבול `1px` `rgba(255,255,255,.08)`.

**Imagery.** צילומי רכב קרירים, מעט-מודחקים. רוב הצילומים הם 3/4 hero על רקע ניטרלי או סטודיו. תאורה עקבית (key קר, rim חמים) פלטה נוטה כחול-אפור. ללא גרעיניות, ללא חום, ללא פילטרים אינסטגרמיים.

**Corner radii.** `4 / 8 / 12 / 16 / 20 / 28` — קטן ל-chips, `12` ל-inputs, `16` לכרטיסים, `20` ל-hero, `28` ל-sheets ו-modals. מסגרות מכשיר במובייל ב-`44px`.

**כרטיסים.** מילוי `--bg-1`, `1px` `--border-1`, `--shadow-2`. כרטיסי-תמונה עם תמונה full-bleed למעלה ב-`r-lg` clipped, ואחר-כך בלוק מידע ב-padding `16px`. גרפי sparkline נמצאים בתחתית ימין של כרטיסי רישום, בגובה `40px`, ללא תוויות צירים. תגי מקור (`yad2`) למטה משמאל, pill-shaped, עם צבע המקור על קפסולה `rgba(255,255,255,.95)`.

**RTL specifics.** זה לא תרגום של LTR — זה RTL ילידי. סדר Bottom nav, כיוון מסילת slider, כיוון sparkline (נשאר LTR לסדרות-זמן), ושיקוף אייקונים (chevrons, חצי-חזרה, share) — כולם מתהפכים. מספרים ומחרוזות באנגלית נשארים LTR דרך `.num` / `unicode-bidi: bidi-override`. כותרות hero ב-RTL מצדיקות לימין; תוכן מטא ל-flex-end.

---

## Iconography

**מערכת.** סגנון outline, stroke `1.5px`, ברירת מחדל `24px`, line-caps עגולים. גליון הרפרנס מציג 9 אייקונים בשורה אחת (heart, sliders, bell, bookmark, share, exchange, chart-bar, location-pin, menu) — כולם בסגנון הזה.

**תחליף.** לא סופקה ספריית אייקונים. אנחנו משתמשים ב-**[Lucide](https://lucide.dev/)** — אותו משקל outline, אותם line-caps עגולים, אותו scale — נטען מ-CDN ב-`https://unpkg.com/lucide@latest`.

| Reference | Lucide |
|---|---|
| Heart | `heart` |
| Sliders / filter | `sliders-horizontal` |
| Bell | `bell` |
| Bookmark | `bookmark` |
| Share | `share-2` |
| Exchange/compare | `arrow-left-right` |
| Chart / sparkline | `bar-chart-3` |
| Location pin | `map-pin` |
| Menu | `menu` |
| Search | `search` |
| Calculator | `calculator` |
| Chevron / back | `chevron-right` (משוקף ב-RTL) |

> ⚠️ **התחליף מסומן.** אם AutoMatch תשלח סט אייקונים מותאם, יש להניח את ה-SVGs ב-`assets/icons/` ולעדכן את ה-UI kits.

**מודעות RTL.** אייקונים כיווניים (chevrons, back, share, exchange) מקבלים `transform: scaleX(-1)` בתוך `[dir="rtl"]`. אייקונים סימטריים (heart, bookmark, bell, search) — לא הופכים. גליון הרפרנס תייג את השורה כ-"Icons (RTL Aware)".

---

## Fonts

> ⚠️ **תחליף פונט מסומן.** לא סופקו קבצי TTF/WOFF. אנחנו טוענים **Heebo**, **Assistant**, ו-**Inter** מ-Google Fonts דרך `colors_and_type.css`. אם AutoMatch ת רכוש משקל אחר, יש להחליף את ה-`@import` ב-`@font-face` מקומיים.

---

## Caveats

- ללא codebase או Figma — הכל משוחזר מהרפרנס + תקציר.
- אייקונים = Lucide (סימן עד שיגיע סט מקורי).
- פונטים = Google Fonts (סימן עד שיגיעו קבצים מקוריים).
- צילומי רכבים = placeholders אסתטיים (CSS gradient + SVG silhouettes); להחליף בצילומי סטודיו אמיתיים.
- מחירי השוק ב-mock-ups הם demo, לא נתוני פרודקשן.
