# Tonight at Ember Keep — daily ritual, deep maroon, dragons alive

> The user has rejected all three previous variants but identified two things they love: **Hearth's deep maroon palette** and **Today's typography + content + framing**. They also want the **dragons-alive animation system** applied in context (inline on a real page) so they can finally see if dragons breathing, blinking, and glowing with particles makes the page feel alive.
>
> This brief synthesises those three sources into a fourth variant — same daily-ritual content shape as Today, recoloured into Hearth's atmospheric maroon, with the full animation system applied to the dragons.

## What this fixes

- Today's cream/yellow background (`#F6E5C0` → `#F4B98A`) is rejected — too yellow/orange.
- Today's content/framing/copy is loved — keep all of it.
- Hearth's deep maroon palette is loved — use it as the new background.
- Today's static dragons are rejected — every dragon on this page must breathe, blink, and glow using the dragons-alive system. Don't just port content; port LIFE.

## What to inherit from Today (verbatim or near-verbatim)

Read `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-today/Today.tsx` for the exact content. Preserve:

- Top band: "EMBER KEEP · TUESDAY · DUSK" + below it "12 MAY · 6:42 PM" (mono small caps, muted)
- Hero headline: **"Tonight, Cinder calls."** (was "Today, Cinder calls." — change to Tonight to match the dim-maroon evening feeling)
- Cinder centered, large, the focal dragon
- Last-tended caption: "Last tended · 2 hours ago | 12h 45m total"
- "Tonight · 20 Minutes" pill (was "Today · 20 Minutes" — change to Tonight)
- Body sentence: **"Drill the cancellation flow — your past self left a draft in Notion that needs the win-back sequence."** with the highlighter under "Drill the cancellation flow"
- Italic dragon quote: **"This is the move Cinder remembers from yesterday — finish it and the launch copy is unblocked."**
- CTA button: "Begin tonight's training — 20 min" with `20:00` timer on the right
- "or save for tomorrow" small italic
- Divider with flame icon
- Periphery section header: "Elsewhere in the keep"
- Moss and Drift periphery cards with the same content (Greek lessons / Novel chapter 7, etc.) — Drift gets the urgent "11 days quiet" line in ember-accent
- Tomorrow preview card: "Drift will likely call. The bridge scene has been waiting."
- Brain dump textarea with "add to tonight's notes…" placeholder
- Settings cog fixed bottom-right

## What to inherit from Hearth (palette + atmosphere)

Read `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-hearth/_group.css` for exact tokens. Use:

```
--bg-base: #170D08;            /* deep mahogany, page background */
--surface-mid: #241410;        /* card / textarea / pill background */
--surface-mid-hover: #2C1A12;
--ember-accent: #D4421A;       /* CTA, urgency, accents */
--amber-glow: #F0A04A;         /* glow color, highlighter, accent text */
--text-parchment: #F4E8D0;     /* primary text on dark */
--text-muted: #A89478;         /* muted/caption text on dark */
--border-subtle: #3A2F23;
```

Add Hearth's atmospheric firelight as a **fixed full-page overlay** behind everything:
```
position: fixed; inset: 0; pointer-events: none;
background: radial-gradient(ellipse at 20% 85%, #D4421A33 0%, #8A2A0E1F 25%, transparent 55%);
animation: firelight-flicker 5s infinite alternate ease-in-out;
z-index: 0;
```
Then content sits at `z-index: 10`. The flicker is what makes the room feel inhabited.

**The page background is `#170D08` — NOT yellow, NOT orange, NOT cream. Deep dark mahogany with warm firelight glow bleeding from the lower-left corner.**

## Typography (from Today, keep verbatim)

```
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@1,9..144,500&family=IBM+Plex+Mono:wght@400&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap');
```

- **Display headlines** (the "Tonight, Cinder calls." hero, tomorrow preview quote): Fraunces italic, opsz 144 — exactly as Today
- **Body text** (the act of care sentence, dragon italic quote): Source Serif 4 (regular for body, italic for quotes)
- **Mono small caps** (date stamp, time pills, captions, periphery state): IBM Plex Mono with `font-variant-caps: small-caps; text-transform: uppercase; letter-spacing: 0.12em;`

The hero "Tonight, Cinder calls." should be Fraunces italic ~48px in `--text-parchment`, sitting on the dark maroon — beautiful, glowing slightly with amber-warm color. Big italic serif on a dim warm room. That's the Today typography you love, recoloured for evening.

## Highlighter — recolour for dark mode

The animated highlighter under "Drill the cancellation flow" was light yellow on cream. On dark maroon it should be a warm amber underline-wash:
```
--ember-highlight: rgba(240, 160, 74, 0.28);
```
Keep the `highlight-draw` keyframe animation (background-size 0% → 100%) exactly. Just recolour. Position the underline-wash slightly below the text baseline (`top: 60%; bottom: 5%`) like Today does.

## CTA button — solid ember on parchment text

Replace Today's `#C45A1F` (cream-mode CTA) with Hearth's ember accent:
```
background: var(--ember-accent);  /* #D4421A */
color: var(--text-parchment);
box-shadow: inset 0 0 32px #F0A04A30;  /* warm inner glow from Hearth */
```
On hover, brighten and intensify the inner glow (Hearth pattern). The 20:00 timer text on the right should be `--amber-glow` color at 0.85 opacity (warm gold against the ember red — matches Hearth's CTA exactly).

## DRAGONS MUST BE ALIVE — port the animation system

This is the centrepiece. Every dragon image on this page applies the dragons-alive animation system. Read `artifacts/mockup-sandbox/src/components/mockups/ember-dragons-alive/DragonsAlive.tsx` and `_group.css` for the working primitives — port them into this page's `_group.css`.

### Hero Cinder (centre, ~280px tall)
- **Breath:** wrap the `<img>` in a container with `animation: breath-cinder 4s ease-in-out infinite alternate; transform-origin: bottom center;` — keyframes `0% { transform: scaleY(1); } 100% { transform: scaleY(1.012); }`
- **Filigree glow:** `animation: filigree-glow-cinder 5s ease-in-out infinite alternate;` — keyframes `0% { filter: drop-shadow(0 0 0 #F0A04A00); } 100% { filter: drop-shadow(0 0 14px #F0A04A50); }` (slightly stronger glow than the demo since this is the focal dragon)
- **Blink:** an SVG eyelid `<div>` absolutely positioned over Cinder's painted eye. Cinder adolescent eye is at approximately **53% from left, 26% from top** of the dragon's bounding box, dimensions roughly **20×14px** at 280px tall. Use `background-color: #1a0f08;` (matches dragon's dark hide). Animation: `0%, 96% { transform: scaleY(0); } 98% { transform: scaleY(1); } 100% { transform: scaleY(0); }` over 6s ease-in-out infinite. Verify position in DevTools — a misplaced eyelid breaks the illusion.
- **Embers around the dragon:** generate 8–10 small absolutely positioned divs (1–3px), `background: #F0A04A` or `#D4421A`, `border-radius: 50%`, `box-shadow: 0 0 4px currentColor`. Each ember rises with `translateY(0) → translateY(-260px)` + `translateX(var(--drift-x))` + opacity 0 → 0.9 → 0 over 3.5–5.5s, infinite, with staggered `animation-delay`. Spawn from the lower portion of the Cinder container (left/right of the dragon, not on top). Use `pointer-events: none` and a particle layer at `z-index: 5` (dragon at `z-index: 10`). Generate inline in JSX with randomised positions/durations/delays via `Array.from({length: 10}).map(...)`.
- **Hover:** `transform: rotateY(-3deg) scale(1.02)` on the dragon container, glow pulse speeds up.

### Periphery Moss (small, ~96px)
- Breath: 6s slow rhythm
- Blink: rare, every ~10s, eyelid color `#1A2014`, dimensions roughly 12×8px at this scale, position approximately 50% / 30%
- 3–4 leaf petals drifting down around it (smaller scale than the demo — keep them subtle)
- Hover: small `rotateY(2deg)` + leaf rate increases

### Periphery Drift (small, ~96px)
- Breath: 2.4s restless rhythm
- Blink: more frequent, every 3.5s, eyelid color `#0a1018`, dimensions roughly 14×10px, position approximately 50% / 25%
- 2–3 mist wisps drifting horizontally
- Urgent ember dot at top-right pulsing
- Hover: rim-light fades in, breath calms momentarily

### Reduced-motion guard
Wrap the entire `_group.css` motion section, OR add a final block:
```
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after { animation-play-state: paused !important; transition: none !important; }
}
```

## Layout (single column, ~640px max-width — same as Today)

```
[ Fixed firelight overlay z=0 ]
[ Page content z=10, max-w 640px, centered, px-6 pt-12 pb-24 ]
  ├─ Top band (mono caps date · time)
  ├─ Hero section: "Tonight, Cinder calls." Fraunces italic 48px parchment
  │     Cinder image alive (~280px) with embers around her
  │     Last-tended mono caption
  ├─ The act of care:
  │     "Tonight · 20 Minutes" pill (border --border-subtle, surface-mid bg)
  │     Body sentence with amber highlighter under key phrase
  │     Italic dragon quote
  ├─ CTA section:
  │     Big ember CTA button with timer
  │     "or save for tomorrow" italic muted
  ├─ Divider with flame icon
  ├─ Periphery: "Elsewhere in the keep"
  │     Moss + Drift cards side-by-side, both ALIVE
  ├─ Tomorrow preview card (surface-mid bg, parchment Fraunces italic quote)
  ├─ Brain dump textarea (surface-mid bg, parchment text)
  └─ Fixed settings cog bottom-right
```

## Hard rules

1. **Background MUST be `#170D08`** — deep dark mahogany. Not orange, not yellow, not cream.
2. **Do NOT touch `artifacts/mockup-sandbox/src/index.css`** — all CSS in `_group.css`.
3. **All dragons must visibly breathe AND blink** — the eyelid must land on the painted eye.
4. **Embers, leaves, mist** — use the same particle techniques as the dragons-alive demo, scoped per dragon.
5. **Firelight flicker overlay** — fixed full-page, behind content, low z-index, pointer-events: none.
6. **Custom inline SVG only** for icons. NO Lucide. NO Phosphor. NO emoji.
7. **Fonts:** Fraunces italic + Source Serif 4 + IBM Plex Mono via `@import` (matches Today exactly).
8. **`prefers-reduced-motion: reduce` respected.**
9. **The CTA, the highlighter, the dragon-glow, the firelight** all use the warm amber/ember palette — do not let any pure-yellow or cream colour leak into the design.
10. **Single column, ~640px max-width, centered** — same skeleton as Today.

## Output

- File: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-dusk/Dusk.tsx`
- CSS: `artifacts/mockup-sandbox/src/components/mockups/ember-redesign-dusk/_group.css`
- Export: `export function Dusk() { ... }`

## Anti-vibecoded checklist (must pass)

- Background reads as deep dark mahogany with warm firelight glow at lower-left — NOT yellow, NOT orange, NOT cream.
- Hero "Tonight, Cinder calls." is Fraunces italic ~48px in parchment colour, glowing softly on the dark room.
- Cinder visibly breathes (subtle scaleY pulse) and blinks (eyelid drops over the painted eye).
- Cinder's gold filigree visibly pulses warm.
- Embers visibly drift up from around Cinder.
- Highlighter under "Drill the cancellation flow" is warm amber (NOT yellow).
- CTA button is solid `#D4421A` ember with parchment text and the warm `20:00` timer.
- Moss and Drift in the periphery also breathe + blink (smaller scale).
- The page feels like Today's content shape transported into Hearth's evening room — the dragons are alive, the room is warm, the typography is gorgeous and italic on the dark.
- Settings cog fixed bottom-right.
