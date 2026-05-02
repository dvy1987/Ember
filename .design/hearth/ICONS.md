# Hearth — Icons

## Strategy
Inline SVG icons drawn at **1px stroke weight** (thinner than Sanctuary's 1.25) to match Inter Tight's tight letterforms and JetBrains Mono's hairline. 20×20 default frame so they sit naturally inline with body text. No Lucide, no Heroicons, no emoji.

## Inventory
Source: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-hearth/Hearth.tsx`

Glyph set covers: flame (Cinder), leaf (Moss), feather (Drift), check, plus, settings, clock, arrow-right, search. All inherit `currentColor` and respect the per-dragon accent (`--ember-accent` for Cinder, equivalents for Moss/Drift via inline color overrides on the icon's container).

## Rationale
- 1px stroke + 20px frame: matches the room's quiet density. Anything thicker would feel branded; anything thinner would disappear against `--text-muted`.
- Geometric over hand-drawn: the room is architectural (sidebars, hairlines, mono labels), so icons match — straight lines, simple curves, no ornamental flourishes.
- Firelight-aware: when an icon sits inside a `.cta-button`, it inherits the parchment text color and reads against the inset amber glow.

## Hard rule
No emoji in any Hearth surface. Every glyph is an inline SVG component. If a new glyph is needed, draw it at 20×20 with stroke="1" to match the existing inventory.
