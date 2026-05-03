# Forge — Icons

## Strategy
Almost no SVG icons. The icon system is **monospace ASCII glyphs and uppercase 3–5 letter codes**. The whole surface is JetBrains Mono, so a `▸` or `BEGIN ⏎` reads as native UI without needing an inline SVG. Where a true icon is required (sparkline, status pip), it is a 12×12 inline SVG drawn at 1px stroke against the panel background.

## Inventory
Source: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-forge/Forge.tsx`

| Glyph / code | Replaces | Used for |
| --- | --- | --- |
| `▸` | ▶️ | Begin training affordance |
| `⏎` | ↵ | Keyboard hint inside primary CTAs |
| `●` | 🔴 | Live / active session pip (color via `--accent-*`) |
| `○` | ⚪ | Inactive / off-duty pip |
| `↑ / ↓` | 📈 / 📉 | KPI delta direction (raw arrows, no emoji) |
| `HTCHL / ADLSC / ADLT / ANCT` | Stage emoji | Dragon stage codes in row badges |
| `OK / WARN / IDLE / OVRDU` | Status emoji | Project status badge text |
| `+15 XP` | ⚡+15 | XP delta as plain text |

Plus inline SVGs for: tiny sparkline (12×24), checkbox glyph (12×12), small chevron (8×8). All drawn at 1px stroke, square caps.

## Rationale
- Monospace + ASCII glyphs let every row align without measuring icon widths. The whole surface is rhythmic by typography alone.
- Color carries dragon identity (yellow / green / cyan) so we don't need per-dragon icon variants — the same `▸` glyph in `--accent-cinder` is Cinder's CTA.
- Uppercase 3–5 letter codes (HTCHL, ADLSC) take the place of emoji stage badges and reinforce the trading-terminal posture.

## Hard rule
No emoji in any Forge surface. Where a glyph is needed, use a monospace Unicode character (▸ ⏎ ● ○ ↑ ↓) drawn in the appropriate `--accent-*` color, or a 12×12 inline SVG. No 🔥, no 🐉, no ⏱️ — ever.
