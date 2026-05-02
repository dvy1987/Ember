# Variant 2 — Den

> The dragon's lair, dim and warm. Feels like Things 3 × Bear × Linear at night, by lamplight. Quiet, restrained, expensive.

## Archetype
**Premium-consumer / calm craft.** Restraint as luxury. Hairline borders. Generous whitespace. Single signature colour against near-black warm. The work foregrounded; the dragon recedes to a faithful companion in the periphery.

## "Feels like X"
"It feels like an oak-panelled study at night with a single brass lamp lit. Your dragon is sleeping at your feet — present, warm, watching you — but the work on the desk is what you came for."

## Tokens — non-negotiable
- **Background:** warm near-black, NOT navy and NOT pure black. `#15110E` to `#1A1612` range — brown-black, like dim mahogany. Visibly distinguishable from `#000`/`#0a0a0a` to anyone with calibrated eyes.
- **Surface (cards / panels):** `#1F1A14` — one stop lighter, faintly amber-tinged.
- **Hairlines:** `#3A2F23` — warm bronze, never `#27272a` (zinc).
- **Text primary:** warm off-white `#EFE4D2` (paper-on-mahogany feel, NOT `#fafafa`).
- **Text muted:** `#8A7B66` — desaturated tan.
- **Accent (one):** muted brass `#C9A55A` — used ONLY for the 20-min CTA, the active session indicator, and per-dragon-type single-pixel accent rules. *Not* the existing flat orange.
- **Per-dragon accents (used as 1px left-rule on the project entry, not as fill):** cinder → ember `#C9532E`; moss → lichen `#7B9B6B`; drift → moonstone `#7E96B5`. All desaturated. All quiet.
- **Banned:** existing `#1a1a2e` navy, existing flat `#ff6b35`, slate/zinc grays, purple/indigo, any saturated primary.

## Typography — non-negotiable
- **Display / Headings:** **Söhne** if available — otherwise **Inter Tight** at weight 500/600 (NOT regular Inter, NOT Inter at 400 default — those are the AI tells). Tight tracking on the display weight (-0.02em).
- **Body:** **Söhne** body or **Inter Tight 400** with letter-spacing -0.005em.
- **Mono (timer, kbd, file-style labels):** **Berkeley Mono** if avail, else **JetBrains Mono** at 13px. The timer is mono — that's the "Things 3 polish" tell.
- **Banned:** stock Inter at default tracking, system-ui anywhere, serif fonts (this is the *anti*-Sanctuary direction).

## Icons
- Tuned **Phosphor** at `weight="regular"` rendered at **20px** (not 24, not 16) with stroke-width effectively 1.25 via icon size choice. Optical size matters — match the type's quietness.
- Or, if creating custom: a small monoline set, 1.25 stroke, square caps, 20px grid. ~10 glyphs: flame, leaf, droplet (drift), book, timer/hourglass, plus, sliders/cog, arrow-right, check, brain.
- **Banned:** Lucide at default stroke 1.5 24px, any emoji, Heroicons solid.

## Layout
- **Sidebar nav left** (240px), narrow content area centred (max-width ~720px). The sidebar holds: app name set in display weight, dragon roost as a vertical list with dragon thumbnail (32px circle, dragon image cropped tight), per-dragon 1px left rule in the dragon's accent colour, last-trained timestamp in mono. Active project highlighted with a faint warm-amber surface tint.
- The dragon image is **always small and to the side** — never the focal point of the page. The page is about the *work*. The dragon shows up at 32px in the nav, 64px beside the Resume Card heading, and at 96px on the Project page header. Never larger.
- Resume Card is treated as a **calm letter from the dragon**:
  - Top: the dragon's small portrait + project name in display weight + "Last tended" timestamp in mono.
  - Mid: a single italic-set line: "I've been holding *<one short detail from last session>*."
  - Below that: "Suggested next move:" small-caps label, then the suggestion in body-weight, with a brass underline rule.
  - CTA: a wide button, brass on near-black, 14px medium-weight label "Begin a 20-minute session", with mono `20:00` countdown badge inside it on the right.
- Task list rendered as quiet rows, no card backgrounds, hairline `border-b`. Checkbox is a custom SVG (open ring → filled ring with brass).
- Brain dump area: a tall, generous textarea on the same near-black surface, hairline border, mono placeholder copy "what's been on your mind…".

## Microcopy direction
- "Dragon Roost" → just **"Roost"** in display weight.
- "Your dragon remembers…" → **"I've been holding…"** (first-person from the dragon, italic, *one* sentence).
- "Suggested next move" → **"Suggested next move"** (small-caps label, kept).
- "🔥 Start 20-minute training" → **"Begin a 20-minute session"** with `20:00` mono countdown badge.
- "Hatch New Dragon" → **"New project"** (plain, no metaphor in CTAs — the metaphor is *embodied*, not *announced*).
- Neglect labels: removed entirely as text. Conveyed instead via the dragon thumbnail's saturation in the nav (active = full warmth; sleepy = -20% sat; restless = -40% sat; decaying = monochrome with a faint amber dot).

## Motion
- 180ms ease-out for everything. Sidebar selection slides on a single keyframe. Timer ticks are pure mono digits — no animation, just the number changing. The session-start CTA has a subtle warm-amber inner glow on press (`box-shadow: inset 0 0 0 1px #C9A55A40`). No infinite breathing on the dragon.

## Anti-vibecoded checklist (must pass)
- Background is warm near-black, not navy, not pure black.
- Sidebar pattern (Things-3-like) — *not* a top nav with action buttons clustered upper-right.
- Dragon image never larger than 96px anywhere.
- Brass accent appears on ≤2 elements per screen.
- Mono font is loaded and visible on at least the timer + timestamp.
- Zero emoji.
- Zero rounded-2xl SaaS cards. Borders are 1px hairlines, radius 6–8px max.
