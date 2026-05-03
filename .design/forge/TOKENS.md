# Forge — Tokens

Source of truth: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-forge/_group.css`. Tokens declared on `.forge-theme`.

## Color
| Token | Value | Role |
| --- | --- | --- |
| `--bg-0` | `#0A0A0A` | Terminal black — page background |
| `--bg-1` | `#141414` | Panel background |
| `--bg-2` | `#1F1F1F` | Panel head / row hover |
| `--rule` | `#2A2A2A` | 1px hairline borders |
| `--ink` | `#E8E8E8` | Primary monospace text |
| `--ink-dim` | `#6E6E6E` | Secondary labels, IDs |
| `--ink-faint` | `#3A3A3A` | Disabled, sparkline gridlines |
| `--accent-cinder` | `#FFE600` | CRT yellow — Cinder ticker, primary CTA |
| `--accent-moss` | `#00FF9C` | Phosphor green — Moss ticker, "ok" status |
| `--accent-drift` | `#00D4FF` | Cyan — Drift ticker |
| `--warn` | `#FF2D6F` | Magenta warn — overdue, missed streak |
| `--ok` | `#00FF9C` | Same as moss — success states |

## Typography
| Family | Used for |
| --- | --- |
| **Space Grotesk** (700, -0.02em) | Display moments via `.display` — project names, KPI numerals |
| **JetBrains Mono** (400/500/700) | Everything else — body via root `font-family`, labels via `.mono` |
| `.uppercase-tight` | 0.08em tracking for micro-labels |

## Surface & motion (the systems-feel layer)
- 24px baseline grid via `repeating-linear-gradient` with 2.5% white scanline. This is the only ambient texture.
- Panels are flat: `border-radius: 0`, 1px `--rule` border, no shadow.
- Row hover swaps background to `--bg-2`. No transitions — the surface is meant to feel mechanical, not animated.
- KPI numerals are large Space Grotesk; everything else is monospace. The contrast is the design.

## Banned in this variant
- system-ui, Inter, Tailwind default palette
- `#ff6b35`, `#1a1a2e`
- Any `border-radius` > 0
- Any `box-shadow`
- Purple→pink gradients
- Emoji in any UI surface
