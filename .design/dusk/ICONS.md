# Dusk — Icons

## Strategy
Inline SVG icons drawn at **1px stroke weight**, 20×20 frame. Geometric, square caps, no flourish — they need to read at the periphery against an animated firelit background without competing with Fraunces italic display moments. No Lucide at default, no Heroicons, no emoji.

## Inventory
Source: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-dusk/Dusk.tsx`

| Icon | Replaces | Used for |
| --- | --- | --- |
| `FlameIcon` | 🔥 | Cinder accent, project header |
| `CircleIcon` | 🔵 | Filled status pip / current focus |
| `BeginIcon` | ▶️ | Resume Card "Begin training" affordance |
| `ClockIcon` | 🕒 / ⏰ | Last session timestamp, 20-min duration |
| `FeatherIcon` | 🪶 | Reflection / journal entry |
| `ArrowRightIcon` | → | Forward navigation |
| `SettingsIcon` | ⚙️ | Settings entry |

Plus the dragon: `CinderAnimated.tsx` is a *living illustration* (painterly bitmap + 3 overlays + outer sway/bobble/head-turn wrappers), not an icon, but it functions as the visual anchor of the variant.

## Rationale
- 1px stroke + square caps: matches Fraunces and IBM Plex Mono's architectural posture and stays legible against the firelit surface.
- All icons inherit `currentColor`, so accent colors propagate per dragon (Cinder uses `--ember-accent`, equivalents for Moss/Drift via inline color overrides).
- The Begin icon (`BeginIcon`) is a play-glyph inside a circle so the most important affordance reads as "press this" without needing a label color change.

## Hard rule
No emoji in any Dusk surface — including ember effects, which are CSS-animated `<span>` particles, never 🔥. Every glyph is an inline SVG drawn to the conventions above.
