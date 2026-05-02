# Today — Icons

## Strategy
Inline SVG icons drawn at **1px stroke weight**, 20×20 frame, square-cut line endings. Match Fraunces and IBM Plex Mono's geometric posture — minimal flourish, deliberate proportions. No Lucide-at-default, no Heroicons, no emoji.

## Inventory
Source: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-today/Today.tsx`

Glyph set covers: flame (Cinder accent), the time-stamped session badge ("20:00" set in `font-mono-caps`), settings, analytics, peripheral nav, the begin-session arrow. All icons inherit `currentColor`.

## Rationale
- 1px stroke matches Fraunces' fine modulation — anything heavier would clash with the variable display weight at opsz 144.
- Square caps (rather than round): the magazine archetype is architectural; rounded caps would pull it toward "playful" which Today is not.
- The `font-mono-caps` time stamp doubles as a glyph element (e.g. inside the begin-session badge) — so "icons" includes the typographic time chip, not just SVGs.

## Hard rule
No emoji in any Today surface. Every glyph is either an inline SVG drawn to the conventions above, or a `font-mono-caps` typographic chip. New glyph → add to the same file using the same stroke + viewBox conventions.
