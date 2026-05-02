# Hearth — Tokens

Source of truth: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-hearth/_group.css` (scoped under `.hearth-container`).

## Color
| Token | Value | Role |
| --- | --- | --- |
| `--bg-base` | `#170D08` | Mahogany room background |
| `--surface-mid` | `#241410` | Raised surface (cards, sidebars) |
| `--surface-mid-hover` | `#2C1A12` | Hover lift on raised surface |
| `--ember-accent` | `#D4421A` | Primary cinder accent (deeper than the old `#ff6b35`) |
| `--amber-glow` | `#F0A04A` | Firelight highlight, CTA inset glow |
| `--text-parchment` | `#F4E8D0` | Primary text on dark surface |
| `--text-muted` | `#A89478` | Secondary text |
| `--border-subtle` | `#3A2F23` | Hairline divider color |

## Typography
| Family | Used for |
| --- | --- |
| **Inter Tight** (500) | Body, labels — letter-spacing -0.005em for the slightly-tightened "premium consumer" feel |
| **Cormorant Garamond** (600 + italic) | Display headings, dragon names, chapter moments via `var(--font-serif)` |
| **JetBrains Mono** (400) | System labels, timestamps, "01 // Roost View" navigation marks |

## Surface & Rhythm
- `.hearth-firelight` — fixed full-bleed radial gradient anchored at 20% / 85% (lower-left), animated `firelight-flicker` 5s alternate. Provides the lit-room ambient that defines the variant.
- `.dragon-breathing` — 5s alternate `translateY(0 → 1px)`. Tiny but visible at the edge of attention.
- `.room-view-stagger` — child elements fade-up with 200ms staggered delays on first reveal (`room-reveal` keyframe).
- `.dragon-container:hover` — lifts and scales 1.02, the rim-light intensifies.

## Motion
- Buttons: 200ms ease-out. CTA gets `inset 0 0 32px #F0A04A30` glow on rest, `inset 0 0 48px #F0A04A50` on hover (firelight intensifies).

## Banned in this variant
- system-ui, Tailwind default colors
- `#ff6b35` (we use `#D4421A` instead — deeper, less SaaS), `#1a1a2e`
- `rounded-2xl shadow-md`, drop shadows in general (lighting comes from the firelight overlay, not box-shadow)
- Purple→pink gradients
- Emoji in any UI surface
