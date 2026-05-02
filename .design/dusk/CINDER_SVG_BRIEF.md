# Animated SVG Cinder — vector replacement for the hero dragon

> The bitmap version is rejected as "stiff and posing." No CSS on a static image can make wings flap or a jaw open. This brief replaces only the **hero Cinder** on the Dusk variant with an inline SVG whose anatomical parts animate independently. Periphery Moss and Drift stay as bitmaps. The page composition, palette, typography, embers, and global body wrappers (sway/bobble/headturn) all stay untouched.

## Files to read first

1. `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-dusk/Dusk.tsx` — current page; see the Cinder hero section starting around line 127
2. `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-dusk/_group.css` — current animation system; the existing `cinder-sway`, `cinder-bobble`, `cinder-headturn`, `breath-cinder`, `filigree-glow-cinder`, `cinder-eye-gleam` rules are around lines 234–330
3. The original bitmap reference (cannot view directly but this is a painterly seated adolescent western dragon: dark obsidian/charcoal body with warm amber underbelly glow, intricate gold filigree on chest and legs, large outstretched wings with visible bone structure and warm-lit membrane, glowing amber eye, curling muscular tail)

## What you're building

A standalone React component `CinderSVG` exporting an inline SVG, ~280px tall, that REPLACES the current `<img src="...adolescent-cinder.webp" />` element inside the Cinder hero scene. The SVG must contain anatomical part groups, each independently animated:

```
<g id="cinder-tail">       — curling tail behind/beside body
<g id="cinder-wing-left">  — outstretched left wing
<g id="cinder-wing-right"> — outstretched right wing  (mirror)
<g id="cinder-body">       — torso, chest, belly, legs (the stationary mass)
<g id="cinder-head">       — head + horns
  <g id="cinder-jaw">      — lower jaw (separate, opens)
  <ellipse id="cinder-eye"> — amber eye (with feGaussianBlur glow filter)
  <path id="cinder-eyelid"> — eyelid path positioned EXACTLY over the eye
<g id="cinder-filigree">   — gold accent overlays on body/wings/chest
```

Place `CinderSVG.tsx` in `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-dusk/`. Export `function CinderSVG()`.

## Visual style

- Stylized fantasy illustration — contemporary style, NOT cartoon, NOT photorealistic. Think Hollow Knight or D&D Beyond character art rendered as flat-shaded vector with rich gradients.
- Use `<defs>` heavily: `<linearGradient>` and `<radialGradient>` for body shading, wing membrane (lit by inner fire), eye glow.
- Use `<filter>` with `<feGaussianBlur>` for soft eye glow and a subtle drop-shadow on the body.
- Detail level: looks good at 280×280, not just a silhouette. Aim for 400–700 lines of SVG path data.
- The dragon should READ as the same character as the painterly Cinder (warm-amber, dark-bodied, gold-filigreed) even though rendered in vector style.

## Palette (must match rest of Dusk page exactly — use these CSS vars where possible, hex where not)

```
Body main:        #1A0F08  (dark obsidian)
Body deepest:     #0A0604
Body lifted:      #2C1A12
Underbelly warm:  #3A1F0E
Filigree gold:    #F0C674  (use #F8E0A0 highlight where appropriate)
Eye glow inner:   #FFD9A0
Eye glow mid:     #F0A04A   (var(--amber-glow))
Eye glow outer:   #D4421A   (var(--ember-accent))
Wing membrane:    radial #D4421A core → #8A2A0E mid → #1A0F08 edge
Wing bones:       #1A0F08
Outline:          #0A0604
```

## Anatomy & layout

ViewBox: `0 0 240 280`. The dragon sits at the bottom of the box, facing slightly toward viewer. Wings outstretched. Tail curling to the right.

Approximate bounding boxes (so you know where to draw):
- Body trunk: x ≈ 80–160, y ≈ 130–230
- Head: x ≈ 95–145, y ≈ 80–135  (head is upper-center)
- Eye: ellipse at approximately (cx=128, cy=105, rx=4, ry=3) — the eye is on the right side of the face since head is in 3/4 view
- Jaw: lower-front of head, hinged at top — pivot around (118, 122)
- Wings: each spans about 70px outward from shoulders at (100, 130) and (140, 130)
- Tail: curls from base (130, 220) outward to (200, 200)
- Legs: front legs come down from (100, 200) and (140, 200), feet at y=265

These are guidelines — adjust for visual balance.

## Animations — add to `_group.css`

Each group gets its own keyframe + animation. **Crucially, each animation specifies `transform-box: fill-box;` so transform-origin is computed in the SVG group's own coordinate space, not the viewport.**

Add this once in the CSS:

```css
#cinder-tail, #cinder-wing-left, #cinder-wing-right,
#cinder-body, #cinder-head, #cinder-jaw,
#cinder-eyelid, #cinder-filigree, #cinder-eye {
  transform-box: fill-box;
  transform-origin: 50% 50%;
}
```

Then per-group:

```css
@keyframes cinder-tail-sway {
  0%   { transform: rotate(-8deg); }
  100% { transform: rotate(8deg); }
}
#cinder-tail {
  animation: cinder-tail-sway 5s ease-in-out infinite alternate;
  transform-origin: 0% 50%;  /* base of tail (left-edge of tail group) */
}

@keyframes cinder-wing-left-flap {
  0%, 100% { transform: rotate(0deg)   translateY(0); }
  50%      { transform: rotate(-14deg) translateY(-4px); }
}
#cinder-wing-left {
  animation: cinder-wing-left-flap 3.8s ease-in-out infinite;
  transform-origin: 100% 35%;  /* shoulder = right edge of left-wing group */
}

@keyframes cinder-wing-right-flap {
  0%, 100% { transform: rotate(0deg)  translateY(0); }
  50%      { transform: rotate(14deg) translateY(-4px); }
}
#cinder-wing-right {
  animation: cinder-wing-right-flap 3.8s ease-in-out infinite;
  transform-origin: 0% 35%;    /* shoulder = left edge of right-wing group */
}

@keyframes cinder-body-breath {
  0%   { transform: scaleY(1)     scaleX(1); }
  100% { transform: scaleY(1.022) scaleX(1.008); }
}
#cinder-body {
  animation: cinder-body-breath 4s ease-in-out infinite alternate;
  transform-origin: 50% 100%;  /* feet */
}

@keyframes cinder-head-nod {
  0%, 100% { transform: rotate(-2deg) translateY(0); }
  50%      { transform: rotate(3deg)  translateY(-1.5px); }
}
#cinder-head {
  animation: cinder-head-nod 6s ease-in-out infinite;
  transform-origin: 50% 100%;  /* neck base */
}

@keyframes cinder-jaw-yawn {
  0%, 88%, 100% { transform: rotate(0deg); }
  92%           { transform: rotate(16deg); }
  96%           { transform: rotate(7deg); }
}
#cinder-jaw {
  animation: cinder-jaw-yawn 12s ease-in-out infinite;
  transform-origin: 50% 0%;  /* jaw hinge at top of jaw group */
}

@keyframes cinder-eye-pulse {
  0%, 100% { opacity: 0.75; transform: scale(0.92); }
  50%      { opacity: 1;    transform: scale(1.08); }
}
#cinder-eye {
  animation: cinder-eye-pulse 3.5s ease-in-out infinite;
}

@keyframes cinder-blink {
  0%, 94% { transform: scaleY(0); }
  97%     { transform: scaleY(1); }
  100%    { transform: scaleY(0); }
}
#cinder-eyelid {
  animation: cinder-blink 6s ease-in-out infinite;
  transform-origin: 50% 0%;  /* drops down from top */
}

@keyframes cinder-filigree-pulse {
  0%, 100% { opacity: 0.55; }
  50%      { opacity: 0.95; }
}
#cinder-filigree {
  animation: cinder-filigree-pulse 5s ease-in-out infinite;
}
```

## Edits to `Dusk.tsx`

1. Import the new component at the top: `import { CinderSVG } from './CinderSVG';`
2. Find the existing Cinder image block (the `<img src="...adolescent-cinder.webp" .../>` and the `<div className="dragon-eyelid" .../>` and `<div className="cinder-eye-gleam" />`).
3. Replace ALL THREE of those with a single `<CinderSVG />`.
4. The wrapper layers stay: `cinder-sway` → `cinder-bobble` → `cinder-headturn` → `dragon-image-container` → CinderSVG. Those wrappers continue to provide global body motion that compounds with the per-part SVG motion.
5. Remove the `.cinder-eye-gleam` block from `_group.css` (no longer needed — the SVG eye glows on its own).

## Verify

After implementation:
1. Take a screenshot of `https://b00ca67e-07ba-43e9-a0ea-b6a2bb456aba-00-1dkt7onrz2gja.pike.replit.dev/__mockup/preview/ember-redesign-dusk/Dusk` and confirm:
   - Dragon renders cleanly in vector style
   - Wings, tail, head, jaw, body all visibly distinct
   - Eye glows amber and has a clear iris/pupil
   - Eyelid is positioned over the eye (you should see no offset)
   - The page composition (text, embers, CTA, periphery dragons) is unchanged
2. The dragon should be visibly moving in the screenshot — wings up or down, tail at an angle, head tilted, etc., depending on which frame the screenshot caught.

## Hard rules

1. **DO NOT touch `index.css`** — all CSS goes in `_group.css`.
2. **DO NOT modify Moss or Drift** in `Dusk.tsx` — they stay as bitmaps. Their CSS stays untouched.
3. **DO NOT remove `cinder-sway` / `cinder-bobble` / `cinder-headturn` wrappers** — those provide the global body motion that makes the SVG feel even more alive.
4. **DO NOT add packages** — inline SVG only, no Lottie, no react-spring, no animation libraries.
5. **Palette match** — only use the colors specified above. No new hues.
6. **`prefers-reduced-motion: reduce`** — already respected at the bottom of `_group.css`. Do not break that block.

## Anti-vibecoded checklist

- The dragon is recognisably the same character as the painterly Cinder (warm-amber, dark-bodied, gold-filigreed seated dragon with outstretched wings) — not a generic clipart dragon
- All anatomical parts are visibly moving in animation: wings flap, tail sways, body breathes, head nods, jaw occasionally yawns, eye blinks ON the eye, eye glows pulse, filigree shimmers
- The blink lands ON the painted eye (you literally drew the eyelid where you drew the eye)
- The vector style feels intentional and crafted, not flat or cartoony — gradients give depth, filigree gives ornamentation
- The page reads identically otherwise — text, layout, embers, CTA, periphery, brain dump all unchanged
