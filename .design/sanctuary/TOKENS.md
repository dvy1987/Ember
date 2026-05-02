# Sanctuary — Tokens

Source of truth: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-sanctuary/_group.css` (scoped under `.sanctuary-theme`).

## Color
| Token | Value | Role |
| --- | --- | --- |
| `--bg-color` | `#F3EBE1` | Parchment page background |
| `--ink-color` | `#2A1F18` | Primary ink (body, headings) |
| `--ink-light` | `#5A4A3D` | Secondary ink (captions, marginalia) |
| `--accent-cinder` | `#A2381A` | Cinder dragon accent (oxblood, not orange) |
| `--accent-moss` | `#3F5D3A` | Moss dragon accent (deep forest) |
| `--accent-drift` | `#3E5C7A` | Drift dragon accent (slate blue) |

A subtle SVG fractal-noise texture is layered on the page background at 4% opacity to break the flat-color sheen.

## Typography
| Family | Used for |
| --- | --- |
| **Cormorant Garamond** (400/600 + italic) | All headings, drop caps, display text via `.display-font` |
| **Source Serif 4** (variable, optical sizes 8–60) | Body copy (the default), reflective passages |
| **IBM Plex Sans** (400/500) | Utility labels, buttons, mono-feeling system chrome via `.system-font` |

`.small-caps` adds `font-variant-caps: small-caps` + `letter-spacing: 0.05em` for chapter-head and label use. `.drop-cap::first-letter` enlarges the first letter to 3.5em in cinder accent.

## Surface & Rhythm
- `.hairline-rule` — 1px ink-color line at 15% opacity (the only divider in the system).
- `.chapter-head` — centered title block with a 40px ink rule beneath it (margin 4rem top, 2rem bottom).
- `.dragon-plate` — wraps a bitmap with a `radial-gradient` halo (white, 0–70% radius) so the painterly dragon reads as a printed plate rather than a sticker.

## Motion
- All buttons: `transition: all 250ms ease-out`, hover lifts `-1px` and dims `filter: brightness(0.94)`. No bounces, no bigger-than-life scale-ups.

## Banned in this variant
- system-ui, Inter, Tailwind defaults
- `#ff6b35`, `#1a1a2e`
- `rounded-2xl shadow-md` SaaS cards
- Purple→pink gradients
- Emoji in any UI surface
