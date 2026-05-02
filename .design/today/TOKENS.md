# Today — Tokens

Source of truth: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-today/_group.css` (declared on `:root` because the wrapper is full-bleed; the wrapper is `.ember-today-wrapper`).

## Color
| Token | Value | Role |
| --- | --- | --- |
| `--ember-bg` | `#F6E5C0` | Golden parchment page background |
| `--ember-dusk-start` | `#F4B98A` | Dusk gradient start (lower hot edge) |
| `--ember-ink` | `#3A1F0E` | Primary ink (deep walnut) |
| `--ember-accent` | `#C45A1F` | Warm terra accent (cinder) |
| `--ember-muted` | `#7A5A3A` | Secondary ink |
| `--ember-highlight` | `rgba(240,216,138,0.5)` | Marker-pen highlight behind emphasized words |
| `--ember-card-bg` | `#FAEBC9` | Raised content surface (slightly lighter than the page) |
| `--ember-border` | `rgba(58,31,14,0.1)` | Hairline border |

## Typography
| Family | Used for |
| --- | --- |
| **Fraunces** (variable, weight 500, opsz 144) | Display headings, magazine-cover titles via `.font-fraunces` |
| **Source Serif 4** (variable) | Body copy, reflective passages via `.font-serif-body` |
| **IBM Plex Mono** (400) | System labels, time stamps, navigation marks via `.font-mono-caps` (with `font-variant-caps: small-caps` + `text-transform: uppercase` + `letter-spacing: 0.12em`) |

## Surface & Motion
- `.bg-dusk` — `linear-gradient(135deg, var(--ember-dusk-start) 0%, var(--ember-bg) 100%)`, 200% size, animated `dusk-shift` 30s ease-in-out infinite. Simulates slow late-afternoon light shift.
- `.animate-highlight` — keyframe expands a `--ember-highlight` background bar from 0% to 100% over 500ms, forwards, ease-out. Used to mark a phrase as it lands.
- `.animate-enter` — 280ms `fade-in-up` (translateY 12px → 0). Universal entry animation.
- `.periphery-moss` / `.periphery-drift` — saturate 70% / 40% on rest, 90% / 60% on hover. Keeps non-focus dragons present but quiet.
- `.cta-button` — hover brightens accent 8% (to `#d66424`) + adds `inset 0 0 24px rgba(240,168,138,0.3)` warm glow.

## Banned in this variant
- system-ui, Inter, Tailwind default palette
- `#ff6b35`, `#1a1a2e` (we use `#C45A1F` warm terra and `#3A1F0E` walnut)
- `rounded-2xl shadow-md` cards — borders only, no drop shadow
- Purple→pink gradients
- Emoji in any UI surface
