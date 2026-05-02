# Dragons of Ember Keep — alive

> Prove the existing painterly dragon art can be brought to life through layered CSS animation, SVG overlays, and particle systems — without regenerating a single image. Three dragons in their own atmospheric scenes, each breathing at a rhythm that matches their state, plus an evolution arc panel showing the character DNA carried across egg → hatchling → adolescent → adult → ancient.

## What this fixes

The three variant mockups currently use the dragon webp art as static cutouts pasted on top of each other. Even when the layout is right, the scene reads as dead. The user said: *"You are showing me static images on top of one another. The whole thing looks dead. Is it possible to draw inspiration and create animated dragons?"*

Answer: yes. We keep the gorgeous painterly art (which is already character-consistent across stages — verified) and bring it alive through motion overlays. This component is a standalone proof-of-life demo that, once approved, gets ported into the chosen variant page.

## Layout

A wide horizontal canvas, ~2400×1400. Single component, self-contained CSS, no edits to `index.css`.

**Top band — header (~80px)**
- Centered: `DRAGONS OF EMBER KEEP — ALIVE` in IBM Plex Mono small caps, 13px, letter-spaced +0.16em, color `#A89478`.
- Subtle one-line subhead in Cormorant Garamond italic 18px muted: *"Three dragons. Three rhythms. The art you have, brought to life."*

**Middle band — three living scenes side-by-side (~880px tall)**

Three equal-width panels. NO card borders. Each panel is its own atmospheric biome:

**Panel 1 — CINDER (recently tended, calm warm rhythm)**
- Background: deep mahogany base `#170D08`, layered with a *radial firelight* `radial-gradient(ellipse at 30% 80%, #D4421A40 0%, #8A2A0E1F 30%, transparent 60%)`. The radial center shifts ±8px and opacity flickers between 0.85–1.0 over a 4–6s `keyframes` loop.
- The dragon: `/__mockup/images/dragons/cinder/adolescent-cinder.webp` rendered at ~360px tall, centered slightly left of panel center.
- **Breath:** `transform: scaleY(1) → scaleY(1.012)` over 4s ease-in-out infinite alternate. Origin: bottom center. Calm rhythm.
- **Blink:** an SVG `<ellipse>` colored `#1a0f08` (matching dragon's dark hide) absolutely positioned over the dragon's eye location, scaleY animated 0 → 1 → 0 over 240ms every 6s (with random offset so it doesn't feel mechanical). The eye blink is the strongest "alive" signal — get this exact.
- **Filigree glow:** `filter: drop-shadow(0 0 0 #F0A04A00)` → `drop-shadow(0 0 12px #F0A04A40)` cycling over 5s. The gold scrollwork on Cinder's body breathes warm.
- **Particles — embers:** 8–12 small absolutely positioned divs (1×1px to 3×3px), `background: #F0A04A` to `#D4421A`, `border-radius: 50%`, with a small `box-shadow: 0 0 4px currentColor`. Each ember has its own animation: `translateY(0) → translateY(-280px)` + `opacity: 0 → 0.9 → 0` + slight horizontal `translateX` drift, over 3.5–5.5s, infinite, with staggered delays. Spawn from the lower-left of the panel (where the firelight is).
- **Hover state:** on `:hover`, the dragon `transform: rotateY(-3deg) scale(1.02)` + the firelight intensity boosts (radial gradient opacity → 1.0 sustained) + filigree glow pulses faster.
- **Caption beneath dragon:**
  - Cormorant Garamond italic 22px parchment `#F4E8D0`: *Cinder*
  - Tiny mono small-caps line beneath: `RECENTLY TENDED · 2H AGO` in `#A89478`.
  - Mono micro: `Q2 PRODUCT LAUNCH`.

**Panel 2 — MOSS (sleeping, slow rhythm)**
- Background: deep forest-loam base `#1A2014`, layered with a *soft dappled green* `radial-gradient(ellipse at 50% 30%, #4A6B3A33 0%, #2D3D2622 35%, transparent 65%)`. Subtle slow lateral shift over 18s — like wind moving leaves overhead.
- The dragon: `/__mockup/images/dragons/moss/hatchling-moss.webp` at ~340px tall.
- **Breath:** scaleY 1 → 1.018 over 6s (slower, deeper) — sleeping rhythm.
- **Blink:** very rare — every 9–12s. Same SVG eyelid technique, color `#1A2014`.
- **Filigree glow:** Moss doesn't have visible gold filigree like Cinder — instead, give a very subtle warm chartreuse glow `#9BB868` to the leafy patterns. Slower cycle, ~7s.
- **Particles — leaf petals:** 6–8 small SVG leaf shapes (a hand-drawn 12×8px leaf path, color `#7A9B5A`), drifting downward with rotation. Animation: `translateY(0) → translateY(220px)` + `rotate(0deg → 180deg)` + `opacity 0 → 0.7 → 0` over 6–9s, infinite, staggered. Spawn from the top of the panel.
- **Hover state:** Moss stirs awake — breath rhythm speeds up to 4s, eyelid flutters, the dragon `transform: rotateY(2deg)` (small turn).
- **Caption:** *Moss* / `RESTED · 4 DAYS QUIET` / `GREEK LESSONS`.

**Panel 3 — DRIFT (overdue, restless rhythm)**
- Background: deep storm-blue base `#0F1820`, layered with a *cool storm ambient* `radial-gradient(ellipse at 50% 50%, #2A3B5033 0%, #14202C22 40%, transparent 70%)`. Add a very subtle horizontal `linear-gradient` overlay that drifts left-to-right over 12s — the mist moving across the panel.
- The dragon: `/__mockup/images/dragons/drift/adolscent-drift.webp` at ~360px tall (preserve typo in filename).
- **Breath:** scaleY 1 → 1.02 over 2.4s — faster, restless. Add a tiny shoulder-twitch keyframe at 30% (1px vertical jolt) to suggest agitation.
- **Blink:** more frequent than the others — every 3–4s. Eyelid color `#0a1018`.
- **Filigree glow:** Drift's silver-grey scales get a faint cool blue rim glow `#6B8AA8` cycling at 3s — anxious shimmer.
- **Particles — mist wisps:** 5–7 small absolutely positioned divs, ~24×8px, `background: linear-gradient(90deg, transparent, #B0C4D8AA, transparent)`, `border-radius: 50%`, `filter: blur(3px)`. Animation: `translateX(-40px) → translateX(panel-width + 40px)` + slight `translateY` drift + opacity fade in/out, 7–11s infinite, staggered. Spawn from off-screen-left, drift across.
- **Indicator dot:** a small `8×8px` circle filled `#D4421A` with a soft glow `box-shadow: 0 0 8px #D4421A`, positioned near the top-right of Drift — pulsing opacity 0.6 → 1 over 1.5s. The "needs you" signal.
- **Hover state:** the indicator dot brightens, Drift's restless rhythm slows momentarily (breath transitions to 3s for 2 cycles before returning to 2.4s) — like the dragon noticing you arrived. Faint warm rim-light `radial-gradient(ellipse, #D4421A20, transparent 60%)` fades in behind Drift.
- **Caption:** *Drift* / `OVERDUE · 11 DAYS QUIET` (set in `#D4421A` to flag the urgency, mono small-caps) / `NOVEL CHAPTER 7`.

**Lower band — Cinder's evolution arc (~440px tall)**

This panel proves the character consistency across the lineage.

- Section header above: `EMBER LINEAGE · CINDER` in IBM Plex Mono small caps 12px letter-spaced.
- Subhead in Cormorant Garamond italic 18px muted: *"The same dragon. Five stages. You can see it in the gold."*
- Five evolution panels horizontal, each ~440px wide × ~280px tall, equal spacing:
  1. **EGG** — `/__mockup/images/dragons/cinder/egg-cinder.webp` at ~220px tall on a small dark plinth (the existing art already includes a plinth).
  2. **HATCHLING** — `/__mockup/images/dragons/cinder/hatchling-cinder.webp` at ~240px tall.
  3. **ADOLESCENT** *(current)* — `/__mockup/images/dragons/cinder/adolescent-cinder.webp` at ~260px tall, full saturation, **active** with the breath + blink + filigree-glow animations applied.
  4. **ADULT** — `/__mockup/images/dragons/cinder/adult-cinder.webp` at ~260px tall, **filter: saturate(0.5) brightness(0.8)** — locked, future stage, ghosted.
  5. **ANCIENT** — `/__mockup/images/dragons/cinder/ancient-cinder.webp` at ~260px tall, **filter: saturate(0.4) brightness(0.7)** — locked, future stage, more ghosted.
- Below each: Cormorant Garamond italic 16px stage label, mono micro line beneath:
  - EGG · `BEFORE THE FIRST SESSION`
  - HATCHLING · `0–10 SESSIONS · 0–4H TOTAL`
  - ADOLESCENT · `CURRENT · 12H 45M TOTAL`  ← parchment text full bright, with a small ember dot dot on the left
  - ADULT · `30+ SESSIONS · LOCKED`
  - ANCIENT · `100+ SESSIONS · LOCKED`
- A delicate gold thread/line connecting all five panels through their centerlines — `<svg>` `<path>` with `stroke: #D4A74A`, `stroke-width: 1`, `stroke-dasharray: 2 4`, opacity 0.3. Light visual rhythm tying them together.
- Hover any panel: it lifts 4px (`translateY(-4px)`), brightness +10%. Locked panels can show a tiny mono tooltip *"unlocks at 30 sessions"*.

## Tokens
Use the per-panel tokens listed above. The ONLY shared tokens used across all three:
- Parchment text: `#F4E8D0`
- Muted text: `#A89478`
- Mono accent (urgent): `#D4421A`
- Page background (the canvas around the three panels): `#0F0A07` — extremely dark warm-brown, framing the three biomes.

## Typography
- **Display / dragon names:** Cormorant Garamond italic 22–24px
- **Stage labels:** Cormorant Garamond italic 16px
- **Mono small-caps lines:** IBM Plex Mono 11px letter-spaced +0.14em, uppercase via CSS `text-transform: uppercase`
- **Subheads:** Cormorant Garamond italic 18px muted

Load fonts via `<link>` tag in component or `@import` in `_group.css`.

## Motion principles
- All breath/blink/glow loops use `ease-in-out` with `infinite alternate` or `infinite`. Never linear.
- Stagger animation delays so the three dragons aren't synchronized (the panels feel mechanical otherwise).
- Particles use `animation-delay` randomized per-particle (use inline style with computed delays in the JSX).
- Hover effects use 240–320ms ease-out transitions.
- All animations respect `prefers-reduced-motion: reduce` — wrap motion-heavy CSS in `@media (prefers-reduced-motion: no-preference)`.

## Critical implementation notes

1. **The blink is the strongest "alive" signal.** Spend extra effort positioning the SVG eyelid PRECISELY over each dragon's eye. Use `position: absolute` with pixel-tuned `top` / `left` relative to the dragon's container. The eyelid is an `<ellipse>` matching the eye's natural shape and the dragon's nearby-skin color. If the eyelid is mispositioned, the whole effect collapses. Take time to tune this per dragon.

2. **The eye locations** (approximate, from inspecting the artwork at native resolution — verify by hovering DevTools over the dragon image):
   - Cinder adolescent: eye is at roughly 53% from left, 26% from top of the dragon's bounding box. Eye is roughly 24×16px when dragon is 360px tall.
   - Moss hatchling: eyes roughly 50% / 30%, smaller (roughly 18×12px at 340px tall).
   - Drift adolescent: eye roughly 50% / 25%, roughly 22×14px at 360px tall.

3. **Particles must NOT obscure the dragon.** Use `pointer-events: none` and `z-index: 5` (below the dragon at `z-index: 10`). Spawn them from off-dragon positions.

4. **Fonts are CRITICAL** — use Cormorant Garamond italic for all serif text and IBM Plex Mono for all small caps. Both on Google Fonts.

5. **No emoji.** No Lucide icons. Custom inline SVG only for the small ember dot, the locked icon, and the connecting gold thread.

6. **Self-contained CSS.** Do NOT touch `artifacts/mockup-sandbox/src/index.css`. All custom CSS goes in a sibling `_group.css` imported from your component.

## Anti-vibecoded checklist (must pass)
- All three dragons visibly breathe (chest rises/falls subtly).
- All three dragons blink (eyelid drops correctly over the painted eye, NOT a vague rectangle next to the eye).
- Each dragon has its own particle system (embers / leaves / mist) — visible and rising/drifting.
- Each dragon's environment has its own ambient motion (firelight flicker / dappled shift / mist drift).
- Cinder evolution arc shows all 5 stages with the active stage breathing and the locked stages visibly ghosted but recognizable.
- The page reads as a living scene, NOT a pasteboard of static cutouts. The user feels: *"Yes — the dragons are here."*
