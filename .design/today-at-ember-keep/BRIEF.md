# Variant 3 (replacement) — Today at Ember Keep

> A daily-rhythm page. You arrive and it answers one question in two seconds: *who needs you today*. One dragon foregrounded, one act of care, one CTA. The other dragons sit quietly in the margins, visibly fading if you've been away.

## What this variant is correcting

Same gap as Hearth: the first three made the user a passive observer. Today at Ember Keep takes a different angle from Hearth — instead of putting all three dragons in the room together, it commits to **a single daily focal point** with the others as a present-but-quiet periphery. The page IS today's act of care.

The product is **Ember**. The page is **Today at Ember Keep**. The brand stays.

## Archetype
**Personal-utility / ritual-driven / time-of-day-aware.** Closer to a meditation app's daily prompt or a high-quality habit tracker — but warm, dragon-inhabited, and serious. The page is small, focused, and changes through the day.

## "Feels like X"
"It feels like opening a single page in your morning ritual — the kind of page that exists for one reason and tells you the one thing. The room behind the page is golden-hour warm. One dragon is on the page. The others are watching from the edges. Today, Cinder calls."

## Tokens — non-negotiable
- **Background:** warm parchment-with-light, NOT cream-on-cream. Base `#F6E5C0` (warm honey paper). The TOP of the page has a soft gradient cap that *changes with time of day* (you'll render one fixed time — choose **dusk / golden hour** for the mockup):
  - Dawn (5–9am): `#F8DDB4` → `#F6E5C0` (peach-cream)
  - Midday (9am–3pm): `#FCEFD4` → `#F6E5C0` (bright clear)
  - Dusk (3–7pm): `#F4B98A` → `#F6E5C0` (warm amber-rose)  ← **use this**
  - Night (7pm–5am): `#3A2A4A` → `#1F1A2C` (deep warm-blue with subtle star-glow specks)
  - Render the dusk gradient as a soft `linear-gradient` filling the top ~280px of the page, fading down into the parchment.
- **Ink:** deep warm `#3A1F0E` (almost-black, brown-warm). NOT pure black, NOT navy.
- **Ember (primary accent):** `#C45A1F` — burnt amber, used for the day's CTA, the dragon-of-the-day's name, and the focal indicator.
- **Muted (secondary):** `#7A5A3A` — for muted dragon labels in the periphery.
- **Highlight (used once):** annotation-yellow `#F0D88A` at 50% opacity behind the day's act-of-care phrase, like a hand-marked underline. Used exactly once on the page.
- **Per-dragon mood:** the focal dragon (Cinder today) is at full saturation. The two periphery dragons are rendered in **CSS filter: saturation reduced to 70% if recently tended (Moss), 40% if neglected (Drift)** — the periphery LOOKS faded if you've been away. Visual nudge, no text scolding.
- **Banned:** existing `#1a1a2e` navy, existing flat `#ff6b35`, pure white, slate/zinc grays, dark mode (this is a daytime page that adapts; render the dusk version), any pastel pink, purple→pink gradients.

## Typography — non-negotiable
- **Display / the day's call:** **Fraunces** weight 500 italic with `font-variation-settings: "opsz" 144` (large optical size) — the line "Today, Cinder calls." is the visual hook of the page. Set at ~44–52px. Fraunces is on Google Fonts.
- **Section labels (`TODAY · TUESDAY · DUSK`, etc.):** **IBM Plex Mono** weight 400 small caps, 11px, letter-spaced +0.12em. The mono small-caps treatment is the signature of the daily ritual feel.
- **Body / suggested-act-of-care text:** **Source Serif 4** weight 400, 17px, line-height 1.55. Italic for descriptive lines.
- **The day's act of care (the highlighted phrase):** Source Serif 4 weight 600, set inline with the annotation-yellow highlight behind it.
- **Banned:** Inter, system-ui, geometric sans, all-caps without small-caps treatment, monospace as primary body.

## Icons
- A small custom set drawn in a warm-handmade style — ~8 glyphs, 1px stroke, 20px grid. Glyphs needed: small-flame (active), small-circle (today's dot), arrow-into-circle (begin), small-clock (time-of-day), feather (notes), arrow-right (tomorrow preview), small-cog (settings).
- For the dragons themselves: NOT icons — real dragon webp images.
- **Banned:** Lucide, Phosphor, Heroicons defaults; geometric icon sets; emoji of any kind.

## Layout — non-negotiable

**The page is single-column, narrow (~640px content width centered on the parchment), tall and quiet. Single focus.**

**Top band (the time-of-day cue):**
- Dusk gradient fills the top ~260px, fading into parchment.
- A small mono small-caps line floats top-center: `EMBER KEEP · TUESDAY · DUSK`.
- Beneath that, in tiny mono, the date in muted tone: `12 MAY · 6:42 PM`.

**The day's call (the visual hook):**
- Centered in the upper third, set in Fraunces italic 48px:
  - **Today, Cinder calls.**
- Beneath the line, the focal dragon — Cinder — at ~280px tall, centered, full saturation, sitting on parchment with NO border, no card, no shadow. Just the dragon on the page like a botanical print.
- A small mono small-caps line beneath the dragon: `LAST TENDED · 2 HOURS AGO · 12H 45M TOTAL`.

**The act of care (the meaningful action):**
- Centered, max-width 560px.
- A small label in mono small caps: `TODAY · 20 MINUTES`.
- Then the act-of-care line in Source Serif 4 weight 600, 22px:
  - "Drill the cancellation flow — your past self left a draft in Notion that needs the win-back sequence."
  - The phrase **`drill the cancellation flow`** has the annotation-yellow highlight `#F0D88A` at 50% opacity behind it (slight horizontal padding, no border).
- Beneath, in italic Source Serif 17px muted: *"This is the move Cinder remembers from yesterday — finish it and the launch copy is unblocked."* (One sentence of context, in the dragon's tone but not first-person.)

**The CTA:**
- Centered, ~360px wide. Burnt amber `#C45A1F` solid fill. Parchment text `#F6E5C0`. 16px Source Serif weight 600. Generous vertical padding (~18px).
- Label: **`Begin today's training — 20 min`**.
- A small mono `20:00` digit floats at the right inside the button.
- Below the button, a quiet single line: `or save for tomorrow` — small Source Serif italic muted, hover-underline.

**Periphery (the other dragons):**
- A clear horizontal divider — a single hairline rule with the small-flame glyph centered on it, separating "today" from "elsewhere in the keep".
- A small section heading mono small-caps: `ELSEWHERE IN THE KEEP`.
- Two dragon entries side-by-side, each ~120px wide:
  - **Moss** — image at ~96px, saturation 70%, label "Greek lessons", "rested 4 days · ready when you are" in mono micro.
  - **Drift** — image at ~96px, saturation 40% (visibly faded), label "Novel chapter 7", "**11 days quiet**" in mono micro with a small ember dot. The faded saturation IS the nudge.
- A "tend instead" link beneath each — small italic muted serif.

**Tomorrow preview (the gentle pull-forward):**
- Below the periphery, a small pale parchment card (NOT a Tailwind card — a hairline-bordered region with a slightly different parchment tone `#FAEBC9`, no shadow, no rounded corners larger than 4px).
- Inside, mono small caps `TOMORROW`. Then a short Fraunces italic line: *"Drift will likely call. The bridge scene has been waiting."*

**Brain dump (light, end-of-page):**
- A textarea on parchment, hairline border, mono italic placeholder: `add to today's notes…`.
- A small "save" affordance in muted serif italic.

## Microcopy direction
- App: **Ember**. Page: **Today at Ember Keep**.
- Header band: `EMBER KEEP · TUESDAY · DUSK` then `12 MAY · 6:42 PM`.
- The day's call: **`Today, Cinder calls.`** This is the brand voice in 4 words. (Other days might be "Today, Drift waits." or "Today, the keep is quiet.")
- The act-of-care framing: short, specific, action-oriented. NOT a task list. ONE thing.
- CTA: **`Begin today's training — 20 min`**.
- Periphery framing: "Elsewhere in the keep" — the others are present, just not today's focus.
- Neglect indicator: visual saturation + the mono `11 days quiet` line. No guilt copy.
- Tomorrow line: *"Drift will likely call. The bridge scene has been waiting."* — pulls the user forward without obligating them.
- "or save for tomorrow" — a kind, single escape hatch beneath the CTA. The ritual respects the user's energy.

## Motion — non-negotiable
- The dusk gradient at the top has a *very slow* lateral shift over 30s — like the light in the room is just barely changing. Imperceptible unless you stay.
- The annotation-yellow highlight draws on left-to-right over 500ms when the page enters view, like a real highlighter stroke.
- The two periphery dragons gain saturation slightly on hover (filter saturate 70% → 90%) over 240ms — a hint that you can switch focus.
- The CTA on hover: the burnt-amber fill brightens 8% and a faint amber inner glow appears. No scale transform.
- Page enter: 280ms ease-out fade + 12px lift.
- **Banned:** breathing/pulsing on the dragon, infinite glows, bouncy springs, confetti, any "achievement unlocked" energy.

## Anti-vibecoded checklist (must pass)
- The page answers "who needs you today" in two seconds — one dragon, one act, one CTA, dominant in the visual hierarchy.
- Time-of-day cue (dusk gradient) visible at the top, with the time-of-day mono label.
- The Fraunces italic display line "Today, Cinder calls." is the visual hook — large, italic, generous.
- The act-of-care phrase has the annotation-yellow highlight (used exactly once).
- Periphery dragons are visibly desaturated; the most-neglected one is the most faded.
- Tomorrow preview present and quietly pulls the user forward.
- Brand reads as **Ember** / **Ember Keep** / **Today at Ember Keep**. No "Roost", no "Specimens".
- Custom inline SVG icons only. Zero Lucide. Zero emoji. Zero rounded-2xl SaaS cards. Zero pure white.
- The page leaves the user feeling: *I have 20 minutes for Cinder right now.*
