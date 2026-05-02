# AutoMatch Design System — Skill

You are designing for **AutoMatch**: a premium, dark-mode, RTL-first (Hebrew) car-aggregation web app.

## Quickstart

1. Always pull tokens via `colors_and_type.css`:
   ```html
   <link rel="stylesheet" href="../colors_and_type.css">
   ```
2. The HTML root must be `<html dir="rtl" lang="he">` for product screens. English-only marketing pages can be `dir="ltr"`.
3. Wrap numerics, currency, and English brand strings in `<span class="num">…</span>` so they render LTR inside RTL paragraphs.
4. Use `var(--bg-0)` as the page background. Surfaces step up to `--bg-1` (cards) and `--bg-2` (inputs / nested).
5. The only saturated color in the UI is the brand gradient. Reach for `var(--gradient-primary)` only on the primary CTA, the price-gauge active arc, and hero accents.

## Type rules

- Display 1 — `var(--fs-display-1)` 32px / Bold / `-0.02em`
- Display 2 — `var(--fs-display-2)` 24px / Bold
- Headline — 20 / SemiBold
- Title — 16 / Medium
- Body — 14 / Regular (default)
- Caption — 12 / Regular / `var(--fg-3)`
- Micro — 10 / Medium / uppercase / `letter-spacing: .08em`

Never italic. Never underline (links use color/weight).

## Component rules

- **Primary button** — gradient fill, white text, `r-pill`, height `48px` (mobile) / `44px` (desktop), `--glow-primary` on hover.
- **Secondary button** — outline `1.5px var(--border-3)`, transparent fill, hover lifts to `--bg-2`.
- **Icon button** — `40×40`, ghost background `rgba(255,255,255,.04)`, icon `--fg-3` → `--fg-1` on hover.
- **Input** — `--bg-2` fill, no border, `r-md`, padding `12px 16px`, focus ring `2px var(--primary-blue)` with `4px` rgba glow.
- **Listing card** — photo full-bleed top, `r-lg` clipped, info pad `16px`, sparkline bottom-right `40px` tall, source badge bottom-left.
- **Price gauge** — circular arc, three zones (good/fair/expensive), needle in `--accent`, value label centered.
- **Bottom nav (mobile)** — glass capsule, fixed bottom, 4–5 destinations, active item gets gradient indicator dot.

## RTL hard rules

- `[dir="rtl"]` flips chevrons, back arrows, share, exchange.
- Numbers stay LTR via `.num` (set inline `direction: ltr`).
- Sparklines render LTR (oldest left → newest right) regardless of page direction.
- Bottom-sheet handle stays centered; left/right padding is symmetric.

## When in doubt

- Reach for spacing first. Padding solves more design problems than color.
- Avoid emoji. Avoid native form ornaments. Avoid italic.
- A premium feel comes from restraint — one accent, plenty of whitespace, tabular numbers.
