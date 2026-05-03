# Hatchling — Icons

## Strategy
Inline SVG icons drawn at **2.5px stroke weight**, rounded caps, 18×18 frame — chunkier and friendlier than Dusk's 1px architectural icons. They sit inside `.pill` badges or chunk-btn affordances, so they need to read at small sizes against bright candy backgrounds. No Lucide at default, no Heroicons, no emoji.

## Inventory
Source: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-hatchling/Hatchling.tsx`

| Icon | Replaces | Used for |
| --- | --- | --- |
| `Star` | ⭐ | Streak pill — "Day 7 streak" |
| `Bolt` | ⚡ | Level / XP / "Auto-distill" pill |
| `Heart` | ❤️ | Streak pill on hero card — "7-day streak" |
| `Plus (text)` | ➕ | "+ New dragon", "+ Add" — rendered as text plus, not an icon |

Plus the dragons: `dragon-sticker` is a bitmap (same painterly source as Dusk) bobbling with CSS, plus `sparkle` and `confetti-dot` `<span>` particles around it. They're the icon system as much as Star/Bolt/Heart are.

## Rationale
- Chunky 2.5px stroke + rounded caps matches the Bricolage Grotesque display weight and the chunk-btn 3px borders. Thin icons would look anemic against this surface.
- Each `.pill` carries one icon + label, color-coded by accent (`pill pink`, `pill mint`, `pill sun`). The icon never has to carry meaning alone — it's always paired with a label.
- "+ Add" and "+ New dragon" use a literal `+` character in Bricolage Grotesque rather than a plus icon — keeps the font doing the work and avoids icon clutter on primary CTAs.

## Hard rule
No emoji in any Hatchling surface. The variant's joy comes from candy color, chunky shadows, and bobbling dragon stickers — never from 🐉 or ⭐ glyphs. Sparkles around dragons are CSS-animated spans, not ✨.
