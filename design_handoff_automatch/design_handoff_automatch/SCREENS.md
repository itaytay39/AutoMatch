# Screens — Detailed Spec

Each section maps to a file in `reference/`. The reference is the source of truth; this doc summarizes purpose, layout, components, and notable behavior.

---

## 1. Splash (`reference/splash.jsx`)

**Purpose:** Brand cold-start, ~1.8 seconds. Wordmark slides up + underline animates in + Hebrew subtitle fades.

**Layout:** Centered radial gradient (#FFFFFF → `--bg-warm`). Inter wordmark "AutoMatch" 42px, the "Match" part in `--accent`. 2px×72px underline animates from 0→72 width. Hebrew "אוטומאץ׳" 26px Heebo, faded ink.

**Behavior:** Fires `onDone` after `duration` (default 1800ms).

---

## 2. Onboarding (`reference/onboarding.jsx`)

**Purpose:** 3-slide intro for first-time users.

**Slides:**
1. **כל המודעות במקום אחד** — feed visual (stacked mini-listings inside a phone mock + rotating "2,341 מודעות" badge)
2. **חיפוש חכם 24/7** — notification visual (push card mock + pulse rings)
3. **מחיר הוגן עם היסטוריה אמיתית** — price-history chart visual

**Layout:** Top: Logo (inline) + "דלג" link. Center: visual (260×260) + eyebrow + display title + body. Bottom: progress dots (active=28px wide) + back button (52px square, 14 radius) + primary CTA pill (14 radius, royal-blue, `--shadow-brand`).

**Behavior:** Forward via primary, back via back-button, dot-tap jumps. Last slide CTA reads "בוא נתחיל" and fires `onComplete`.

---

## 3. Home (`reference/screens.jsx → HomeScreen`)

**Purpose:** Daily check-in. Greeting, market pulse, fresh listings, recent activity.

**Sections (top→bottom):**

1. **Top bar** — Avatar pill (44×44, `--accent` bg, init "א", `--shadow-brand`), greeting "שלום איתי" + headline "2 רכבי יד ראשונה ירדו היום", trailing search button (40×40 outline circle).

2. **Hero insight card** — Royal-blue gradient (155°, `#1E2A8C → --accent → #5E78F0`), 24 radius. Decorative dashed path + dot in top-left at 22% opacity. Eyebrow "ירידות מחיר השבוע" → big `.num` "3.1%" (44px, 800) + label "ירידה ממוצעת" → subtitle "קורולה הייבריד יד 1 ירדה ב-₪4,100 בשבוע האחרון" → glass pill "צפו בירידות →" (36px, semi-transparent white).

3. **Stat row** — Section "היום במערכת" + 3 `StatTile`s (חדש היום / ירידות / שמורים). Each: eyebrow + `.num` 24px 800 + sub line.

4. **Recently viewed** — Section "צפית לאחרונה" + horizontal `RecentThumb` carousel (156×~150px each, scroll-snap). Populated from `recentIds` state (max 8, dedup'd on each detail open).

5. **חדשים תואמים** — 2 `VehicleCard` (compact) where `postedDays ≤ 1`.

6. **ירידות מחיר חמות** — 2 `VehicleCard` (compact) where `priceDelta < 0`.

**Behavior:** Tapping the search button → switches tab to "search" + opens autocomplete. Hero CTA → "alerts" tab.

---

## 4. Search (`reference/search-screen.jsx`)

**Purpose:** Query + filter + sort + browse results.

**Layout:**
- Header strip: title "חיפוש" + `SmartSearchBar` + horizontal quick-chip rail (6 chips: חשמלי, היברידי, עד 150K, יד 1, 2022+, קרוסאובר). Active chip uses `--ink` bg + white text (business tone).
- Results pane: count + sort dropdown (chevron). List of `VehicleCard` (full, not compact).
- Empty state: `EmptyState` with `icon="search"`, action button resets filters.

**Behavior:** Search bar focus → autocomplete panel slides in. Filter button (with active count badge) opens `FilterSheet`. Sort button opens `SortSheet`.

---

## 5. Saved (`reference/screens.jsx → SavedScreen`)

**Purpose:** Tracked vehicles + compare flow.

**Sections:**
- Header: eyebrow "השמורים שלך" + display "רכבים שאתה עוקב אחריהם" + compare-toggle pill (right). When active: pill turns `--ink`/white, label flips to "בטל".
- Count strip card: big `.num` count in `--accent` + "רכבים שמורים" + sub "עדכון לפני 18 דק׳" + small "3 ירידות" tag.
- List of `VehicleCard`s. In compare mode: overlay border + numbered badge (1, 2, 3) on tap.
- Floating CTA "השווה N רכבים" when ≥2 selected. Opens `CompareScreen`.

**Empty state:** `EmptyState` with `icon="bookmark"`.

---

## 6. Alerts (`reference/screens.jsx → AlertsScreen`)

**Purpose:** Saved-search list, each tracking matches over time.

**Layout:**
- Header: eyebrow + display "תקבל הודעה ברגע שיש התאמה" + summary card (icon-badge + match count + last-match line).
- List of alert cards: title + match-count chip + criteria pills + "התאמה אחרונה: לפני X" footer with clock icon.
- FAB "התראה חדשה" (royal-blue pill, bottom-right) → opens `AlertForm`.

---

## 7. Vehicle Detail (`reference/vehicle-detail.jsx`)

**Purpose:** Deep view of a single listing.

**Top→bottom sections:**

1. **Header overlay** — back chevron (right in RTL), share + heart (right-end). All 40×40, glass-blur backdrop.

2. **Hero** — Full-width car image (300px). 5-dot pagination (active=22px×6px pill). Photo count chip (e.g., "1/12") bottom-start.

3. **Title row** — h-display title + trim subtitle + price-quality `Tag` (good/fair/high) right.

4. **Hero price card** — eyebrow "מחיר" + big `.num` `--fmtPrice` + delta chip if dropped + "ירדה לפני 2 ימים" sub + divider + `PriceGauge` (gradient arc with needle, three zones: good/warn/bad based on % vs listPrice).

5. **Spec grid** — h-title "נתונים טכניים" + 6 `SpecStat` tiles in two 3-up rows: שנה, ק״מ, יד, מנוע, הספק, 0-100.

6. **Price history** — h-title "היסטוריית מחיר" + eyebrow "30 ימים אחרונים" + delta in big `.num` h-display + `PriceHistoryChart` (130px area chart, royal-blue line + 25% opacity area, gridlines).

7. **Description** — h-title "תיאור המוכר" + body text card.

8. **Seller card** — h-title "על המוכר". Avatar (14-radius square, accent-soft or `--ink` depending on private/dealer) + name + ★ rating + listings count + chevron. Divider. Then: pin icon + location/region + "ניווט" outline button.

9. **Similar vehicles** — h-title "רכבים דומים" + horizontal `SimilarCard` carousel (200×~210px each).

10. **Bottom action bar** (`position: absolute`) — Finance preview (60% width, outline button, "החל מ-" + monthly estimate) + "צור קשר" (40%, royal-blue pill, phone icon).

11. **Finance modal** — slide-up sheet. Hero card (royal-blue gradient) with monthly payment + total + rate. Two sliders: down payment %, term months.

---

## 8. Filter Sheet (`reference/filters.jsx`)

**Purpose:** Multi-section filtering, modal-style.

**Sections:** סוג רכב, סוג מנוע, טווח מחיר (dual-range), שנת ייצור (dual-range), קילומטראז' (single range), יד, אזור, מקור המודעה.

**Chip style:** 10-radius pill. Active = `--ink` bg + white + check icon. Inactive = `--sheet` bg + 1px line border.

**DualRange:** Single horizontal track. Two thumbs (22px white circles, 2px accent border). Fill between thumbs is `--accent`. Implementation in `reference/filters.jsx` (stacked `<input type="range">` with pointer-events trick).

**Footer:** Royal-blue CTA "הצג N תוצאות" (14 radius, `--shadow-brand`).

---

## 9. Sort Sheet (`reference/sort.jsx`)

**Purpose:** Pick one of 7 sort orders.

**Each row:** Icon container (36×36, 10 radius, royal-blue when active) + label + sub + check pill (right, royal-blue 22×22 circle when active).

---

## 10. Profile Sheet (`reference/profile.jsx`)

**Purpose:** Account/settings hub.

**Layout:**
- Hero card (white, hairline): avatar (64px circle, accent, init "א") + name + member-since + close button. Stats row (3-up: נצפו / שמורים / התראות) on a `--sheet-2` 14-radius track.
- Settings rows card: 5 items (פרטים אישיים, התראות, חיפושים שמורים, פרטיות, עזרה), each with icon-square (40×40, 12 radius), title, sub, left-chevron.
- "התנתק" outline button (14 radius, bad-color text).
- Version footer.

---

## 11. Add Alert (`reference/add-alert.jsx`)

**Purpose:** 3-step wizard to create a saved-search alert.

**Steps:**
1. **איזה רכב מעניין אותך?** — Optional alert-name input + manufacturer chip multi-select (8 brands).
2. **מה הקריטריונים?** — Year-min slider, max-price slider, hand segmented (4-up), fuel chips.
3. **איך להודיע לך?** — Notification toggles (push, email) + Frequency big-box selector (מיידי / יומי).

**Footer:** Back button (52px square, 14 radius) + primary CTA "הבא"/"צור התראה" (`--shadow-brand`).

**Progress bar:** 4px high, top, advances by step.

---

## 12. Compare (`reference/compare.jsx`)

**Purpose:** Side-by-side 2–3 vehicle comparison.

**Layout:**
- Header: back button (40×40 outline) + center title + counter "N רכבים".
- Mini-cards row: each vehicle (image + name + price) with × remove button.
- Comparison table: 12 rows × N columns. Per-row winner cell highlighted with `--good-bg` + winner-note (e.g., "✓ הכי זול").

---

## 13. Toast (`reference/toast.jsx`)

**Purpose:** Confirmation snackbar.

Pops from bottom, auto-dismisses ~2.5s, icon + message + optional kind (good/warn/bad).

---

## Shared Components

`reference/ui.jsx` exports `window.AM_UI` with:

- `Tag` — Pill chip with 7 palette variants (default/good/fair/high/accent/soft/outline) × 3 sizes.
- `Sparkline` — Mini inline trend chart (default 64×22).
- `SourceTag` — Pill with colored dot + source name (yad2, אוטובום, etc.).
- `Card` — Standard hairline-bordered card.
- `SectionHeader` — Title + optional action link.
- `IconBadge` — Square rounded backdrop for icons (5 tones).
- `StatusBar` / `TabBar` / `GestureBar` — iOS-style chrome.
- `FAB` — Floating royal-blue pill (icon or icon+label).
- `Btn` — Reusable button (primary/accent/soft/outline/ghost).
- `EmptyState` — Centered glyph + title + subtitle + CTA. Used in Saved, Search-empty.
- `SkeletonCard` / `SkeletonRow` — Shimmer placeholders for loading states (not currently wired — use during async list loads in production).

---

## RTL Specifics (must-haves)

1. All forward chevrons point **left** (`chevron-left`). Back-chevrons point right.
2. Numbers always LTR via `.num` class.
3. Use `insetInlineStart` / `insetInlineEnd` instead of `left`/`right` for any absolute positioning.
4. Sparklines stay LTR (time axis) — wrap in `direction: ltr`.
5. Sliders' `direction: ltr` so min is on the left visually.
6. Heart, bookmark, bell, search icons do **not** flip in RTL. Chevrons, back, share, navigate do flip.
