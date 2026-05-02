# Variant 2 (replacement) — Hearth

> The keep at dusk. Your dragons are *here*, in the room with you, half-lit by firelight. You arrive and the page is already inhabited. They've been waiting.

## What this variant is correcting

The first three variants positioned the user as a journal-keeper, a quiet observer, a librarian. The user's actual relationship is: I have living creatures, they need me, they are right here, and I have to show up. Hearth puts the dragons in the foreground with weight, sets the room in dim warm firelight, and makes the Resume Card the dragon *speaking* — not a panel describing them.

The product is **Ember**. The page is set inside **Ember Keep**. We do not rename the brand. We change the *atmosphere*.

## Archetype
**Premium-consumer / cinematic / atmospheric.** Heavy on depth, lighting, and presence. The dragons are the protagonist of the visual hierarchy, not garnish. The room is a real place. The user feels watched in a warm way.

## "Feels like X"
"It feels like opening the door of a small lamplit keep at dusk. The fire is low, the room smells like cedar and warm metal, and three dragons turn their heads when you walk in. One has been pacing for four days. You both know it."

## Tokens — non-negotiable
- **Background:** a layered dim warm room. Base is deep mahogany `#170D08`. Layer on a *radial* warm-firelight glow from the lower-left corner: `radial-gradient(ellipse at 20% 85%, #D4421A33 0%, #8A2A0E1F 25%, transparent 55%)`. The page must visibly read as "lit from one side by a fire", not as a flat dark surface.
- **Mid-layer surfaces** (where text/cards sit): `#241410` to `#2C1A12` — slightly warmer mahogany, never pure dark gray.
- **Ember (primary accent):** `#D4421A` — used for the active-dragon glow, the CTA fill, the dragon-needs-you indicator dot. Real ember orange, deeper than the existing flat `#ff6b35`.
- **Amber-glow (secondary):** `#F0A04A` — used for the firelight rim on dragons, hover states, the timer digits.
- **Parchment text:** `#F4E8D0` warm paper-on-firelight. NOT pure white. NOT cool gray.
- **Muted text:** `#A89478` desaturated tan.
- **Per-dragon emotional cast (this is the new lever):**
  - Active / recently tended (Cinder, 2h ago): full saturation + warm amber rim-light glow behind dragon (radial `#D4421A40`).
  - Restless / overdue (Drift, 11d ago): full saturation + faint *red* haze behind (`#8A2A0E33`) + a small `#D4421A` dot near the dragon's name. Visual urgency without text.
  - Sleeping (Moss, 4d ago): -25% saturation + slightly cooler cast + no glow.
- **Banned:** existing `#1a1a2e` cold navy, the existing flat `#ff6b35`, slate/zinc grays, dark-mode-by-default Tailwind palette, any pure black, any pure white.

## Typography — non-negotiable
- **Display / dragon's voice:** **Cormorant Garamond Italic** weight 500 — set large, generous, slightly indented, like a quoted line. This carries enormous emotional weight; it must be a real serif italic.
- **Headings (small — section labels, project name on the project card):** **Cormorant Garamond** roman, weight 600.
- **Body / UI labels:** **Inter Tight** weight 500 (NOT 400 default). Letter-spacing -0.005em. Small.
- **Mono (timer, dates, neglect-days counter):** **JetBrains Mono** weight 400, 12–13px.
- **Banned:** Inter at weight 400, system-ui anywhere, Helvetica/Arial defaults, geometric display fonts (Poppins/Montserrat).

## Icons
- A small custom inline-SVG set, ~8 glyphs, drawn at 20px with stroke-width 1.5, square caps. Style: slightly rough, hand-feeling, warm-line. Glyphs needed: flame (active), small-circle-with-dot (overdue indicator), curl (sleeping), arrow-into-circle (begin training), feather (brain dump), small-cog (settings), back-arrow, plus.
- **Banned:** Lucide at default 24px stroke-1.5 — too clinical for this archetype. Phosphor at default — same problem. Emoji of any kind anywhere.

## Layout — non-negotiable
This is the biggest single departure from the first three variants.

**Top section ("Ember Keep" — the room view):**
- The page opens with a single inhabited room view, NOT a list. The three dragons are arranged across a horizontal scene, like creatures in a small lit room — not a grid, not a sidebar list. Approximate sizes:
  - The most-overdue dragon (Drift, 11d) is positioned **slightly off-center toward the front**, ~280–320px tall, full saturation, with the faint red haze behind. This dragon is the *visual subject* on first paint.
  - The recently-active dragon (Cinder, 2h) is to one side, ~220–240px, with a warm amber rim-light glow.
  - The sleeping dragon (Moss, 4d) is in the back/distance, ~140–160px, reduced saturation, no glow.
- Beneath each dragon: a small label set in Cormorant Garamond italic 18px — `Drift`, project name `Novel chapter 7` in Inter Tight small, then a *muted* time stamp in mono small caps (`obs. 11d` or just `11d`). Use the small ember-dot indicator beside the most-overdue one.
- A small ambient header at the very top in 13px Inter Tight letter-spaced caps: `EMBER KEEP · TUESDAY EVENING`. That's it. No nav buttons cluttered upper-right, no page title in display weight at the top — the room IS the title.

**Mid section (the dragon's voice — replaces the "Resume Card"):**
- After scrolling past the room view, the page transitions into the active session for the most overdue dragon (Drift). This is the Resume Card moment — but redesigned as **a quoted line from the dragon**.
- Centered, ~700px wide max:
  - The dragon's image at ~180px on the left, full bleed, no border, no card.
  - A large italic Cormorant Garamond line floating to the right of (or below) the dragon: *"I've been waiting eleven days. The bridge scene is still half-finished — Mira is mid-sentence at the train station. Ready?"* Set at ~28–32px, line-height 1.4, color `#F4E8D0`, with a single hairline ember underline beneath the most important phrase.
  - Below the line, in much smaller Inter Tight, a one-line context label: `Last tended · 64 min · Apr 21`.
  - Then the CTA — a wide weighted button, ember `#D4421A` solid fill, parchment text `#F4E8D0`, ~14px medium-weight, label: **`Begin training — 20 min`** with a small mono `20:00` countdown digit on the right inside the button. The button has a faint inner amber glow (`box-shadow: inset 0 0 32px #F0A04A30`) — like it's lit from inside.
- Below the CTA, a quiet "or tend a different dragon" link — small, muted, with the other two dragon thumbnails inline at 24px each, clickable.

**Lower section (active tasks + brain dump for Drift):**
- Tasks rendered as quiet rows on the mahogany surface, no card backgrounds. Each task is `[ ]  Task text` with a custom hand-drawn checkbox in `#A89478` stroke. 3–4 tasks, real and specific to "Novel chapter 7".
- Brain dump area: a tall textarea on the same mahogany surface, hairline `#3A2F23` border, mono placeholder `whats stirring tonight…` (no apostrophe to avoid encoding traps).

## Microcopy direction
- App name: **Ember**. Page name: **Ember Keep**. That's it. No "Roost", no "Specimens", no "Sanctuary".
- Top header: `EMBER KEEP · TUESDAY EVENING` (or whatever time of day) in small Inter Tight caps.
- The dragon's voice is *first person*, italic serif, present tense, slightly emotional. One sentence. Examples to draw from (do NOT copy verbatim):
  - Drift (overdue): *"I've been waiting eleven days. The bridge scene is still half-finished — Mira is mid-sentence at the train station. Ready?"*
  - Cinder (recent): *"We left it strong yesterday — the pricing page reads cleanly now. The cancellation flow is next."*
  - Moss (sleeping): *"I'll keep until you come back. The aorist tense isn't going anywhere."*
- CTA: **`Begin training — 20 min`** (committal, lower-case sentence, no shouting). NOT "Start session" — *training*. The product noun is "training", which carries the active-care energy.
- Brain dump label: **`Add to the night's notes`** or **`Whats on your mind`** — gentle, intimate.
- Neglect indicator: a small ember dot + the mono number `11d` beside the dragon's name. No apologetic copy.

## Motion — non-negotiable
- The firelight glow gently flickers — a slow `keyframes` over 4–6s shifting the radial-gradient opacity between 0.85 and 1.0 and shifting its center 6–8px. Subtle. Atmospheric. Not distracting.
- The most-overdue dragon (Drift) has a *very subtle* breathing — 1px vertical shift over 5s. Not a pulse. Not a glow. Just presence.
- On arrival, the room reveals over ~700ms: the dragons fade in staggered (back to front), the firelight glow fades up last.
- Hover on a dragon: the warm amber rim-light grows by ~15% over 200ms. The dragon shifts 2–3px toward the viewer (translateY).
- The CTA button on hover: the inner amber glow brightens. No scale transform.
- Page transitions: 240ms ease-out fade + 8px lift.
- **Banned:** any "breathe" / "pulse" / "glow" infinite animation that draws constant attention. Bouncy springs. Confetti. Anything that says "look at me".

## Anti-vibecoded checklist (must pass)
- The page reads as a dim warm room lit from one side, NOT a flat dark surface.
- The three dragons are visibly present at meaningful sizes (the most-overdue one is the largest visual element on first paint).
- The Resume Card is the dragon's first-person italic voice, not a panel.
- The CTA is committal weighted ember with an inner glow.
- Per-dragon saturation/cast is visibly different across the three (neglect is shown, not described).
- Custom inline SVG icons only. Zero Lucide at default. Zero emoji.
- Cormorant Garamond italic visible on the dragon's voice line.
- Mono visible on the timer and the neglect-days indicator.
- Brand reads as "Ember" / "Ember Keep" — no "Roost", no "Specimens", no journal vocabulary.
- The page leaves the user feeling: *I should sit down with Drift tonight.*
