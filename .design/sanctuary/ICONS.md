# Sanctuary — Icons

## Strategy
Custom inline SVG, hand-drawn at **1.25 stroke weight**, rounded line caps and joins, 24×24 viewBox. The palette and weight are tuned to live next to Cormorant Garamond display type without competing with it. No external icon library, no Lucide-at-default-stroke.

## Defined icons
Source: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-sanctuary/Sanctuary.tsx`

| Icon | Replaces | Used for |
| --- | --- | --- |
| `FlameIcon` | 🔥 | Cinder accent (Resume Card, project header) |
| `LeafIcon` | 🌿 | Moss accent |
| `FeatherIcon` | 🪶 | Drift accent |
| `QuillIcon` | ✍️ | Brain Dump composer |
| `FoldedPageIcon` | 📋 | Task list / project chapters |
| `CheckIcon` | ✅ | Task complete |
| `SettingsIcon` | ⚙️ | Settings entry |
| `TrendIcon` | 📈 | Analytics entry |
| `ArrowLeftIcon` / `ArrowRightIcon` | ← → | Navigation, "begin training" CTA |

## Rationale
- Stroke 1.25, not 1 or 2: thicker than the body serif descenders, thinner than the heading weights — sits in the middle so icons feel like illustrations, not signage.
- Rounded caps + joins: matches the soft-corner rhythm of Cormorant ascenders.
- All icons inherit `currentColor`, so dragon accents (cinder/moss/drift) propagate correctly per project context.

## Hard rule
No emoji in any Sanctuary surface. Every glyph is one of the icons above. New glyph needs → add to the same file using the same stroke + viewBox conventions.
