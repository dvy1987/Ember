# Variant 1 — Sanctuary

> An editorial dragon-keeper's notebook. Feels like Stripe Press × a personal storybook × the Pelican Books of productivity tools.

## Archetype
**Editorial.** Long-form respect for the content. Type does the heavy lifting. Imagery is treated like a plate in a book, not a graphic in a UI. Generous baseline grid. The reader (user) is treated as someone with taste and time.

## "Feels like X"
"It feels like opening a beautifully bound notebook a friend kept for you while you were away — someone has been tending these projects in your absence and is now handing them back, page by page."

## Tokens — non-negotiable
- **Background:** warm parchment / unbleached paper. *Not* `#fff`, *not* `#fafafa`. Aim around `#F4EDE0`–`#F1E8D5` range — visibly creamy under bright light, faintly textured (subtle grain via SVG noise overlay or repeating-radial-gradient at <5% opacity).
- **Ink:** deep warm ink, *not* pure black. `#2A1F18`-ish. Body copy, headings, dragon contours.
- **Accent:** **one** signature colour, deep ember-red — burnt sienna / oxblood territory, e.g. `#A2381A`. Used for the 20-min CTA, drop caps, page-flourish glyphs. Sparingly.
- **Secondary accents (one per dragon type, derived not arbitrary):** moss → muted forest `#3F5D3A`; drift → cold slate-blue `#3E5C7A`. Cinder uses the primary ember.
- **Banned:** the existing `#1a1a2e` navy, the existing flat `#ff6b35`, any Tailwind default (`slate-*`, `zinc-*`, `indigo-*`), purple→pink gradients, dark mode (this archetype is light-only).

## Typography — non-negotiable
- **Display / Headings:** **Cormorant Garamond** (or **Tiempos Headline** if it's available — Cormorant Garamond is on Google Fonts and is the safe pick). Weights 400 / 600. Optical size large for hero, smaller for section heads.
- **Body:** **Source Serif 4** (or fall back to **Lora**). 400 / 600. Set it generously — body copy at 17–18px line-height 1.55+.
- **Numerals & labels:** small caps from the body serif, letter-spaced. *No* sans-serif for primary content. A discreet sans (Inter Tight or IBM Plex Sans) is allowed only for tiny system labels (timer mm:ss, kbd hints).
- **Banned:** Inter as primary, system-ui anywhere, Helvetica/Arial defaults.

## Icons
- A small custom SVG set, ~12 glyphs total, hand-feeling — slightly imperfect strokes, 1.25–1.5 stroke-width, drawn at 24px, optically tuned. Style references: woodcut-meets-line-illustration. Glyphs needed: leaf (moss), feather (drift), flame (cinder), open-book (project), hourglass (timer), quill (brain-dump), folded-page (backlog), check-mark (done), small-arrow-right, small-arrow-left, settings-cog (replace ⚙️), trend-line (analytics).
- **Banned:** Lucide at default 1.5 stroke, emoji *anywhere*, Phosphor/Heroicons in their default form.

## Layout
- Single-column, narrow measure (~640–720px content width even on wide screens). Generous side margins. The eye should rest. The Roost (project list) reads like a table of contents with a small dragon plate beside each entry — not a card grid.
- Section headings styled like chapter heads (drop cap, hairline rule beneath).
- Dragon images rendered with a soft cream backdrop blob (SVG ellipse mask), ~96–128px at rest, never centred-large like a Pokémon. They sit in the margin or beside the heading like an illustrated initial.
- Resume Card is rendered like the **opening page of a chapter**: dragon plate + chapter number + session date in small caps, then "Where the keeper left off…" as a serif italic lede, then the suggested next move set in larger body copy, then the CTA.

## Microcopy direction (replaces emoji-laden current copy)
- "Dragon Roost 🐉" → **"Roost"** with a small flame glyph; subhead in italic small-caps "TENDED · NEGLECTED · WAITING".
- "🔥 Start 20-minute training" → **"Begin a tending — 20 minutes"** (no emoji, no shouting).
- "Your dragon remembers…" → **"Where the keeper left off"** (italic serif lede).
- "Hatch New Dragon" → **"Begin a new keeping"** with the leaf glyph.
- "💤 Sleepy / 😰 Restless / ⚠️ Needs training!" → small italic phrases beside the dragon name: "rests"; "stirs"; "calls".

## Motion
- All animation 200–280ms `ease-out`. No bouncy springs. No pulsing glows. Page transitions: subtle fade + 8px lift on enter. Hover states: deepen ink colour by ~6%, no scale transforms. No `dragon-breathe` infinite loop — it's toy energy.

## Anti-vibecoded checklist (must pass)
- Zero emoji in rendered output.
- Cream/parchment background visibly warm; no `slate-50` / `gray-50` / `zinc-50`.
- Display font is a real serif loaded via webfont, not system fallback.
- Dragon image NOT centred-large in any card.
- No `rounded-2xl shadow-lg` SaaS cards. Dividers are hairline rules, not boxes.
- The 20-min CTA reads as a button but is styled like an editorial pull-quote with a deep-ember solid fill.
