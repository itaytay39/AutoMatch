# Design Tokens

All values are spec — reproduce exactly. The reference implementation in `reference/styles.css` is the source of truth; this file mirrors it for quick lookup.

---

## Color

### Surfaces

| Token | Hex | Use |
|---|---|---|
| `--bg-warm` | `#F6F2EC` | Page background (warm off-white) |
| `--bg-deep` | `#ECE5DD` | Outside-the-phone area |
| `--sheet` | `#FFFFFF` | Card / sheet / modal background |
| `--sheet-2` | `#F1ECE4` | Subtle alt fill (inputs, spec tiles) |
| `--sheet-3` | `#EAE3D8` | Hover / pressed / inactive track |

### Ink

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#1B1916` | Primary text |
| `--ink-2` | `#6D665C` | Secondary text |
| `--ink-3` | `#A39A8E` | Tertiary text |
| `--ink-4` | `#C5BEB1` | Placeholder / disabled |
| `--ink-5` | `#DDD3C3` | Decorative subtle |

### Lines

| Token | Hex | Use |
|---|---|---|
| `--line` | `#ECE4D8` | Default hairline |
| `--line-2` | `#DDD3C3` | Stronger separator |

### Brand (Royal Blue)

| Token | Hex | Use |
|---|---|---|
| `--accent` | `#3450E8` | Primary CTA, active tab, link, saved-heart, brand hero |
| `--accent-2` | `#1F37C2` | Hover/pressed accent |
| `--accent-soft` | `#E0E7FC` | Badge bg, icon-badge bg |
| `--accent-ink` | `#1D2E7A` | Foreground on `--accent-soft` |
| `--on-accent` | `#FFFFFF` | Text/icon on `--accent` |

### Signal (price/trend)

| Token | Hex / bg | Use |
|---|---|---|
| `--good` / `--good-bg` | `#1F5A3D` / `#DCEBE0` | Price drop |
| `--warn` / `--warn-bg` | `#7A4A0D` / `#F6E2C4` | Fair / sideways |
| `--bad` / `--bad-bg` | `#9A2A14` / `#FFE2D6` | Price up / over-market |

### Source dots (kept for variety)

`--mint #3F8C68` · `--sky #6AA2C2` · `--amber #D69538` · `--lilac #8E7BB1` · `--sand #B49568` · `--coral #EE6A50`

---

## Typography

```
--font-he:  'Heebo', 'Rubik', 'Assistant', system-ui, sans-serif
--font-num: 'Inter', 'Heebo', system-ui, sans-serif
```

### Scale

| Class | Size | Weight | Letter-spacing | Use |
|---|---|---|---|---|
| `.h-display` | 22–34px | 800 | `-0.025em` | Hero titles, prices |
| `.h-title` | 15–17px | 700 | `-0.015em` | Section titles |
| body | 13–14px | 500 | normal | Body copy |
| `.eyebrow` | 11px | 600 | `0.06em` UPPERCASE | Labels above content |
| micro | 10.5–12px | 600 | normal | Meta lines, captions |

### `.num` — critical

Every number (price, year, km, %, sliders) **must** be wrapped in `<span className="num">`:

```css
.num {
  font-family: var(--font-num);   /* Inter */
  font-feature-settings: 'tnum';   /* tabular */
  direction: ltr;
  unicode-bidi: isolate;
}
```

Hebrew strings flow RTL as normal. The isolate is what keeps `₪119,900` from getting mangled inside a Hebrew sentence.

---

## Spacing

Base unit **4px**. Common rhythm: `4 / 8 / 12 / 16 / 20 / 24 / 32`.

- Card padding: `16px` (was 18 in the consumer variant — tightened for business tone)
- Section gap: `12–14px`
- Sheet horizontal padding: `20–22px`
- Tab bar inner padding: `6px 14px`

---

## Radius

| Value | Use |
|---|---|
| `4` | Pills, small chips |
| `6–10` | Tags, mini-pills, source badges |
| `10–12` | Chip buttons, input fields, icon containers, small thumbs |
| `14` | Primary buttons, FAB pill, footer buttons |
| `20` | Cards, vehicle cards, dealer card |
| `22` | Bottom sheets (top corners) |
| `24` | Heroes (Home insight, Finance hero) |
| `999` | Avatar circles, status dots, heart button, FAB icon-only |

**ProTrip rule:** old AutoMatch used `24 / 28 / 32` → too soft/consumer. Business variant pulls these in by 4 across the board.

---

## Shadow

```
--shadow-sm:    0 1px 0 rgba(0,0,0,0.02), 0 4px 16px -8px rgba(40,30,15,0.08)
--shadow-md:    0 2px 0 rgba(0,0,0,0.02), 0 8px 24px -8px rgba(40,30,15,0.10)
--shadow-lg:    0 20px 40px -10px rgba(40,30,15,0.18)
--shadow-brand: 0 12px 30px -12px rgba(52,80,232,0.55)
```

`--shadow-sm` on every card at rest. `--shadow-md` on floating panels. `--shadow-lg` on modal sheets. `--shadow-brand` only on royal-blue CTAs and hero gradients.

**No colored shadows except `--shadow-brand`**, ever.

---

## Animation

| Name | Duration | Easing | Use |
|---|---|---|---|
| `am-rise` | 320ms | `cubic-bezier(.2,.9,.3,1)` | Element enters from below |
| `am-slide-up` | 320ms | `cubic-bezier(.2,.9,.3,1.05)` | Sheet/modal entry |
| `am-fade-in` | 240ms | `ease-out` | Backdrop, transitions |
| `am-pop` | 260ms | `cubic-bezier(.2,.9,.3,1.2)` | Toast, badge |
| `am-tab-in` | 320ms | `cubic-bezier(.2,.9,.3,1)` | Tab switch |
| press | 140ms | `cubic-bezier(.2,.9,.3,1)` | `scale(0.97)` on `:active` |

---

## Iconography

- 24×24 viewBox
- 1.8px stroke (or 2px on the active tab)
- Round line-caps and joins
- Fill variants use `currentColor` and `stroke="none"`

See `reference/icons.jsx` for the full set (50+ icons, all Hebrew-brand-correct).

**RTL flipping** — chevrons, back, share, exchange flip via `scaleX(-1)` in RTL. Heart, bookmark, bell, search are symmetric and don't flip.

---

## Hairline border rule

Cards use:
```
background: var(--sheet);
border: 1px solid var(--line);
border-radius: 20;
box-shadow: var(--shadow-sm);
```

**Never** use a solid 2px border on a card surface. Hairlines + shadow-and-fill is the whole game.

---

## Range slider (custom)

`input[type="range"].am-range` has thin (6px) track with royal-blue fill up to the thumb position. Thumb is a 22px white circle with 2px accent border + soft brand shadow. CSS in `reference/styles.css`.

For the dual-thumb range in Filters, two range inputs stacked with `pointer-events: none` on the track and `pointer-events: auto` on the thumb, with a manually-drawn fill between thumbs. See `reference/filters.jsx → DualRange`.
