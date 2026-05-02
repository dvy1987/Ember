# Dusk — Tokens

Source of truth: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-dusk/_group.css`. Tokens declared on `:root` (full-bleed wrapper); component wrapper is `.ember-dusk-wrapper`.

## Color
| Token | Value | Role |
| --- | --- | --- |
| `--bg-base` | `#170D08` | Deep mahogany room background |
| `--surface-mid` | `#241410` | Raised surface (cards, modal chrome) |
| `--surface-mid-hover` | `#2C1A12` | Hover state on raised surface |
| `--ember-accent` | `#D4421A` | Primary cinder accent (deeper than `#ff6b35`) |
| `--amber-glow` | `#F0A04A` | Firelight highlight, CTA glow, ember particles |
| `--text-parchment` | `#F4E8D0` | Primary text on dark surface |
| `--text-muted` | `#A89478` | Secondary text |
| `--border-subtle` | `#3A2F23` | Hairline divider color |
| `--ember-highlight` | `rgba(240,160,74,0.28)` | Marker-pen highlight behind emphasized phrase |

## Typography
| Family | Used for |
| --- | --- |
| **Fraunces** (italic 500, opsz 144) | Display moments via `.font-fraunces` — "Tonight at Ember Keep", dragon names |
| **Source Serif 4** (400/600 + italic) | Body copy via `.font-serif-body` |
| **IBM Plex Mono** (400) | System labels, timestamps, navigation marks via `.font-mono-caps` (small-caps + uppercase + 0.12em letter-spacing) |

## Surface & Motion (the alive layer)
- `.firelight-overlay` — fixed full-bleed radial gradient anchored at 20%/85%, animated `firelight-flicker` 5s alternate. Ambient room light.
- 16 ambient embers + 4 brighter flare embers — `<span>` particles drifting upward with randomized size, position, drift, and duration, so the air around the room visibly moves.
- `.cinder-aura-radial` (4.2s), `.cinder-aura-pulse` (3.7s) — breathing halo + chest ring around Cinder.
- `.cinder-mouth-breath` with 5 staggered `.cinder-ember` particles (0–2.8s delay, 3.4–4.2s duration) — concentrated stream from the dragon's face area.
- Outer wrappers: `.cinder-sway` (body sway), `.cinder-bobble` (vertical bobble), `.cinder-headturn` (occasional head-turn).
- All overlay layers carry `will-change: transform, opacity` for compositor performance.
- `.animate-enter` — 280ms `fade-in-up` (translateY 12px → 0). Universal entry animation.
- `.animate-highlight` — keyframe expands `--ember-highlight` bar 0%→100% over 500ms behind a phrase as it lands.

## Banned in this variant
- system-ui, Inter, Tailwind default palette
- `#ff6b35`, `#1a1a2e`
- `rounded-2xl shadow-md` SaaS cards
- Purple→pink gradients
- Emoji in any UI surface (the ember particles are CSS spans, not 🔥)
