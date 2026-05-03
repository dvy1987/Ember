# Hatchling — Tokens

Source of truth: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-hatchling/_group.css`. Tokens declared on `.hatchling-theme`.

## Color
| Token | Value | Role |
| --- | --- | --- |
| `--bg-0` | `#FFF4E6` | Cream background |
| `--bg-1` | `#FFFFFF` | Card surface |
| `--bg-shadow` | `#2D1B4E` | Deep ink — used as hard drop-shadow color on chunk-btn |
| `--ink` | `#2D1B4E` | Primary text + button border + button shadow |
| `--ink-soft` | `#6B5B8C` | Secondary text |
| `--pink` | `#FF7AB6` | Cinder accent in this variant |
| `--pink-deep` | `#E94B95` | Pink streak pill / pressed state |
| `--mint` | `#4FD1C5` | Moss accent |
| `--mint-deep` | `#2BAF9F` | Moss pressed / "+XP" badge |
| `--sky` | `#7C9EFF` | Drift accent |
| `--sky-deep` | `#5470FF` | Drift pressed |
| `--sun` | `#FFC940` | "Hatch a new dragon" CTA gradient |
| `--candy-rule` | `rgba(45,27,78,0.08)` | Hairline rule on cards |

## Typography
| Family | Used for |
| --- | --- |
| **Bricolage Grotesque** (800, opsz 96, -0.025em) | Display via `.display` — dragon names, hero titles, chunk-btn labels |
| **Quicksand** (600/700) | Body text via root `font-family` |

## Surface & motion (the joy layer)
- Page background is cream + three soft radial-gradient blobs (pink/mint/sky) at fixed positions, giving every screen an ambient candy wash.
- `.blob-card` — 28px radius, layered shadow stack (`0 1px 0`, `0 8px 0 -2px`, `0 24px 48px -16px`), 2px ink border at 6% alpha.
- `.chunk-btn` — pill shape (`border-radius: 999px`), 3px solid ink border, 6px solid ink drop-shadow (no blur). On `:hover` shadow compresses to 4px and button drops 2px. On `:active` shadow goes to 0 and button drops 6px — physical-feeling press.
- `.dragon-sticker` — bitmap with subtle bobble keyframe (translateY 2–3px, ~3.5s ease-in-out) and a `delay-1`/`delay-2` modifier so multiple dragons don't bobble in sync.
- `.sparkle` and `.confetti-dot` — CSS-animated colored circles drifting / pulsing around dragons and section dividers.

## Banned in this variant
- system-ui, Inter, Tailwind default palette
- `#ff6b35`, `#1a1a2e`
- Soft `box-shadow` blurs on buttons (must be hard offset shadow)
- Purple→pink gradients (the pink here is candy `#FF7AB6`, paired with mint/sky/sun, never with violet)
- Emoji in any UI surface — all glyphs are inline SVG, all sparkles are CSS spans
