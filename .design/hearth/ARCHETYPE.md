# Hearth — Archetype

**Archetype:** Premium-consumer (with editorial restraint)
**Feels like:** Things 3 × Bear, in a room lit by a fireplace.

## Why this archetype for Ember
The "premium consumer productivity" lineage (Things, Bear, Linear's quieter surfaces, Cron's calm density) treats the workspace as a *room the user inhabits*, not a dashboard they monitor. Hearth pulls that posture into Ember and adds warmth via a dark mahogany surface lit by a slow firelight overlay. The dragon sits in the room with you instead of glowing inside a card.

This archetype defends itself against the soul doc on three counts:
- **Inhabitable surface** — `--bg-base: #170D08` plus a fixed `firelight-flicker` radial overlay reads as ambient light, not background-color.
- **Quiet hierarchy** — small caps for labels, Cormorant Garamond for display moments, Inter Tight 500 for body. No font-weight escalation arms race.
- **Dragon as room-mate** — `dragon-breathing` keyframe nudges the bitmap 1px on a 5s alternate cycle. Subtle enough to be peripheral, present enough to feel alive.

## The "feels like X" claim
> "Like the room you actually want to do your hardest work in — warm, low-lit, and the dragon is on the rug next to you."

## Anti-default tells this avoids
- No system-ui — Inter Tight (500) for body, Cormorant Garamond for display, JetBrains Mono for system labels.
- No `#ff6b35`/`#1a1a2e` — the surface is mahogany (`#170D08`), accent is `#D4421A` (deeper amber-red), highlight is `#F0A04A` (firelight).
- No `rounded-2xl shadow-md` SaaS cards — surfaces use 1px hairline borders + inset firelight glow on CTAs.
- No emoji — all glyphs are inline SVG.

## Where it could fail
- Dark mode + serif display can feel "old book" if the firelight isn't believable. The flicker keyframe + animated room-reveal stagger keep it cinematic.
- High contrast between parchment text (`#F4E8D0`) and mahogany surface is great for legibility but harsh if a user has light-sensitivity. The Reduced Motion follow-up addresses the flicker; surface contrast itself is intentional.
