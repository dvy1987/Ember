# Hatchling — Archetype

**Archetype:** Playful consumer (Duolingo / Habitica / Pou)
**Feels like:** A Tamagotchi for grown-ups — confetti, candy colors, chunky 3D buttons, friendly dragons that look hand-drawn.

## Why this archetype for Ember
Hatchling is the third corner of the design triangle. Dusk is editorial-warm; Forge is brutalist-dense; Hatchling is unapologetically *cute*. The bet is that for ADHD users whose dopamine is hardest to summon, "press the bouncy pink button and a friendly dragon will be happy" is a more honest motivator than any amount of editorial restraint. The aliveness comes from sticker-style bitmap dragons with subtle bobble + sparkle particles, candy gradients, and 3D-shadowed chunk buttons that depress on press.

It defends itself against the soul doc as follows:
- **Resume Card as ritual** — re-skinned as a "Tonight's quest with Cinder" hero card with a chunk-btn primary CTA and a marker-pink streak pill.
- **Dragon as living co-worker** — bitmap dragon stickers (same source assets as Dusk) with `dragon-sticker` bobble animation and corner sparkle particles. They feel like plushies, not painterly cinema.
- **Joy as load-bearing** — the surface itself is allowed to be cheerful. Confetti dots, hand-drawn rules, and cherry-pink XP bars are intentional — they're the variant's argument.

## The "feels like X" claim
> "Like opening a tiny game where every project is a friendly creature that wants you to win — chunky buttons, candy colors, and a dragon that bobbles when you greet it."

## Anti-default tells this avoids
- No system-ui — Bricolage Grotesque (800, opsz 96) for display, Quicksand (600/700) for body. No Inter.
- No `#ff6b35`/`#1a1a2e` — palette is `#FFF4E6` cream base + candy multi-accent (`#FF7AB6` pink / `#4FD1C5` mint / `#7C9EFF` sky / `#FFC940` sun) over a deep ink (`#2D1B4E`).
- No `rounded-2xl shadow-md` — `chunk-btn` uses `border-radius: 999px`, hard 3px ink border, and a 6px solid-color drop-shadow that compresses on `:active` (no soft blur). `blob-card` uses 28px radius with a layered ambient shadow.
- No emoji — all glyphs are inline SVG (Star, Bolt, Heart) and decorative `confetti-dot` / `sparkle` are CSS-animated `<span>` elements.

## Where it could fail
- "Cute" can read "infantilizing" for adult users in a work context. Mitigated by Bricolage Grotesque's editorial weight and the deep ink (`#2D1B4E`) text — it isn't actually a children's app, it's a candy-coated systems app.
- Multi-accent palette risks chaos. Each dragon owns one of (pink / mint / sky), and the layout uses one accent per zone — never three accents in the same card.
