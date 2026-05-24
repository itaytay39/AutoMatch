# Handoff: AutoMatch — Israeli Used-Car Aggregator

## Overview

AutoMatch is a Hebrew-first, **RTL-first** **native Android app** built with **React Native + Expo**, distributed as an **APK**. It aggregates used-car listings from **13 Israeli marketplaces (4 Tier-1 for MVP, then 4 Tier-2 and 5 Tier-3 — see ARCHITECTURE.md)** (yad2, focusnet, winwin, autoboom — plus 9 secondary/specialty sites — full list in `ARCHITECTURE.md`), normalizes them, and exposes a unified consumer experience with smart price analysis, alerts, comparison, and finance simulation. Backend is a **Node/Bun + Postgres + Redis service hosted on Railway** that handles scraping, normalization, and push delivery.

Visual language is the **ProTrip business variant** — warm cream surfaces (`#F6F2EC`), white sheets with hairline borders, a single royal-blue accent (`#3450E8`), and Inter for all numerals. The app deliberately avoids the playful Material 3 / Google Health vocabulary; everything is data-forward and trustworthy.

---

## About the Design Files

The files in this bundle are **design references created in HTML/React-via-Babel**. They are working prototypes that demonstrate the intended look, behavior, animations, and information hierarchy — they are **not production code to ship**.

Your task is to **recreate these designs in React Native (Expo)**, using NativeWind for styling and the patterns described in `ARCHITECTURE.md`. The HTML is just a visual + interaction reference — every component must be re-implemented natively. See `ARCHITECTURE.md → Critical RN Gotchas` for the differences that matter most (no CSS gradients/shadows, RTL via `I18nManager`, FlashList for lists, etc.).

---

## Fidelity

**High-fidelity (hifi)** — the mocks are pixel-perfect. Colors, typography, spacing, radii, and animations are final and intentional. Reproduce them exactly. Every numeric token in `DESIGN_TOKENS.md` is part of the spec.

The only "rough" parts of the prototype are:
- **Mock car imagery** — `car-visual.jsx` draws colorful CSS+SVG silhouettes per vehicle. Replace with real listing photographs.
- **Mock data** — `data.jsx` has 6 vehicles + 3 alerts hardcoded. Replace with real DB-backed data.
- **Mock "scraping"** — there is none. The pipeline is described in `DATA_MODEL.md` but must be built.

---

## What's in the Box

```
design_handoff_automatch/
├── README.md                    ← you are here
├── DESIGN_TOKENS.md             ← colors, type, spacing, radii, shadows
├── SCREENS.md                   ← screen-by-screen spec
├── DATA_MODEL.md                ← DB schema + API contract + scraping pipeline
├── ARCHITECTURE.md              ← recommended Next.js folder structure
└── reference/                   ← working prototype source (read-only)
    ├── AutoMatch.html
    ├── *.jsx, *.css
    └── ...
```

To run the reference: open `reference/AutoMatch.html` in a browser. No build step.

---

## Screens & Flows (high level)

5 main surfaces + several sheets/modals. Detailed specs in `SCREENS.md`.

| Surface | File | Purpose |
|---|---|---|
| **Home** | `screens.jsx → HomeScreen` | Greeting + price-drops hero + stats + fresh listings + drops list + recently-viewed carousel |
| **Search** | `search-screen.jsx → SearchScreen` | Search bar + autocomplete + quick-chip filters + sort + results list |
| **Saved** | `screens.jsx → SavedScreen` | Saved-vehicle list + compare mode (multi-select 2–3) |
| **Alerts** | `screens.jsx → AlertsScreen` | List of saved-search alerts with match counts |
| **Vehicle Detail** | `vehicle-detail.jsx → VehicleDetail` | Hero gallery + price card with gauge + spec grid + 30-day price history + description + seller card + similar-vehicles carousel + finance modal |

Sheets/modals: Filter, Sort, Profile, Add-Alert (3-step), Compare, Onboarding (3-slide), Splash, Toast.

---

## Interactions & Behavior

- **RTL-native** — not a flipped LTR. Read `RTL specifics` in the design system README. Numbers stay LTR via `.num` class (`unicode-bidi: isolate`, Inter, tabular-nums).
- **Nav** — bottom tab bar with backdrop-blur, 4 tabs (Home / Search / Saved / Alerts). Active tab in royal blue with stroke-weight bump on icon.
- **Animations** — entries use `cubic-bezier(0.2, 0.9, 0.3, 1)` at 320ms. Press feedback is `scale(0.97)` at 140ms. Tab change has an `am-tab-in` fade-rise. Sheets slide up at 320ms.
- **Modals/sheets** — close on backdrop click. Sheet headers have a 38×4px drag handle. Bottom action bars have `backdrop-filter: blur(20px)` over warm-cream tint.
- **Save (heart)** — toggles on tap; toast confirms with `kind:'good'`. Heart fills royal blue (not red).
- **Compare** — in Saved, "השווה" toggles a select mode; tap up to 3 cards. CTA pill rises from bottom when ≥2 selected.
- **Recently viewed** — pushed to state on every detail open (max 8, dedup). Shown as a horizontal carousel on Home.

See `SCREENS.md` for per-screen interaction detail.

---

## State Management

Reference prototype keeps everything in `app.jsx → AppShell` with `useState`. For production, split into:

- **Server state** (TanStack Query / RSC) — vehicles, saved, alerts, price history
- **URL state** — current tab, open vehicle id, search query, filter object, sort id (encoded in route params)
- **Local UI state** — modal open/close, form drafts, compare-mode selection
- **Auth/user** — separate context or auth provider

See `ARCHITECTURE.md → State` for a concrete proposal.

---

## Assets

- **Fonts** — Heebo (Hebrew + Latin), Inter (numerals). Both from Google Fonts. Pin versions in production.
- **Icons** — custom 24×24 stroke-1.8 set in `icons.jsx` (Hebrew brand). Treat as the icon system; do not swap for Lucide/Heroicons.
- **Logo** — `logo.jsx`. Supports `inline`, `stacked`, `icon` layouts. App-icon variant is a rounded square with a stylized "A" mark.
- **Vehicle imagery** — placeholders only. Replace with real listing photos from the scraping pipeline (`DATA_MODEL.md`).

---

## Open Decisions for the Developer

These are intentionally not specified — pick based on integration constraints:

1. **SMS-OTP provider** — Twilio, Vonage, or an Israeli provider like InforU/SMS4Free.
2. **Image hosting** — Cloudinary (transform-on-the-fly) or R2 + a thumbnail Lambda.
3. **Search infrastructure** — Postgres FTS for v1; Meilisearch with Hebrew analyzer for scale.
4. **Job queue for scrapers** — BullMQ + Redis is the recommendation. Inngest or Trigger.dev are valid alternatives.
5. **APK distribution channel** — Direct download from a marketing site, internal Google Play track, or both.

---

## Quality Checklist (for the dev to verify post-implementation)

- [ ] All four bottom tabs visually distinct only by content — same warm bg
- [ ] Every price/year/km/% has tabular Inter numerals via `.num`
- [ ] Heart fills royal blue (not red) when saved
- [ ] "חדש היום" overlays the car image when `postedDays ≤ 1`
- [ ] Hero gradient on Home reads as indigo → royal → light-blue (not flat)
- [ ] All forward chevrons point **left** in RTL (use `chevron-left`)
- [ ] No `var(--tint-*)` references remain (removed in ProTrip pass)
- [ ] FAB in Alerts is a solid royal-blue pill, not lifted Material style
- [ ] Filter chips use `--ink` (high contrast) when active, not `--accent`
- [ ] Dual-range slider has a single track with two thumbs and blue fill between
- [ ] Empty states use shared `EmptyState` component
- [ ] All radii follow the 14 (buttons) / 20 (cards/sheets) / 24 (heroes) scale
- [ ] Lighthouse a11y score ≥ 95, including Hebrew screen-reader pass

---

## Contact

Questions about design intent → see in-line comments in `reference/*.jsx` and the section headers in `styles.css`. Every token has a rationale.
