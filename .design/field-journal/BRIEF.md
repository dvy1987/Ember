# Variant 3 — Field Journal

> A naturalist's logbook for tending creatures. Feels like a leather-bound species journal × Cron × early-Posthog × a museum specimen card.

## Archetype
**Brutalist-distinctive (with a naturalist twist).** Dense, typographic, unafraid of structure. Information-dense but warm. The dragon is presented as an *observed creature* with field notes, dates, and measurements — not as a character or pet.

## "Feels like X"
"It feels like the field journal of someone who has spent ten years tending three particular dragons. The pages are organised, the handwriting is precise, the margins are full of dated observations. The system is deeply personal but legible to anyone who picks it up."

## Tokens — non-negotiable
- **Background:** off-white field-journal paper `#F2EEE4` with a *subtle* horizontal rule pattern at 32px intervals at 4–6% opacity (CSS `repeating-linear-gradient`) — like the faint ruling on archival journal paper. Not a heavy notebook texture; just enough to register at a glance.
- **Ink:** deep iron-gall `#1B1F23` (a touch cool, like real iron-gall ink that's oxidised). NOT pure black, NOT navy.
- **Marginalia / labels:** desaturated brick-red `#7A2E20` for stamped labels (specimen ID, date, cataloguing marks) — like a librarian's red ink stamp. Used for the small "SPECIMEN 003 · CINDER" header treatment.
- **Accent (single, for the CTA):** burnt sienna `#B8470F` — slightly desaturated cousin of the existing orange but warmer. Used ONLY on the 20-min CTA and the active-session indicator.
- **Per-dragon accents:** cinder → sienna `#B8470F`; moss → herbarium-green `#52663A`; drift → indigo-wash `#3A4D6E`. Each used as a small filled tag chip beside the dragon's name and as the underline on its specimen header.
- **Highlight:** annotation-yellow `#E8D9A2` at 40% opacity, used as a hand-marked highlighter behind 1–2 critical phrases per page (the suggested next move, an open question).
- **Banned:** existing `#1a1a2e` navy, existing flat `#ff6b35`, any pure black or pure white, slate/zinc grays, dark mode (this archetype is light only — it's *paper*).

## Typography — non-negotiable
- **Display / Headings:** **Domaine Display** if available, else **Playfair Display SC** (the small-caps cut) for specimen headers. Set in real small caps, letter-spaced +0.08em. NOT a regular sans-serif at all-caps — that's the AI-default tell.
- **Body:** **Tiempos Text** if available, else **Source Serif 4** at 16px / line-height 1.5. Tabular figures on. Italic used for observation notes ("the keeper notes that…").
- **Labels / catalogue marks:** **IBM Plex Mono** at 11px small caps for "SPECIMEN ID · DATE · LOG ENTRY №" treatments. This is the *signature* tell of the archetype.
- **Banned:** Inter, system-ui, sans-serif as primary body copy.

## Icons
- A small custom SVG set drawn in the style of **field-guide marginalia** — slightly imperfect, 1px stroke, sometimes filled with a stippled/cross-hatch pattern. Glyphs needed: feather, leaf, flame, open-book, hourglass, ink-quill, folded-corner-page, dot-pattern (for "active"), single hand-drawn arrow, magnifying-glass (analytics), simple cog with visible teeth (settings).
- Where stroke icons are used elsewhere, prefer **Phosphor weight="duotone"** at 20px in iron-gall ink + brick-red secondary — *never* Lucide at default stroke.
- **Banned:** Lucide at default 1.5/24px, emoji of any kind, Heroicons solid.

## Layout
- **Two-column on wide screens, single-column on mobile.** Left: a narrow nav (200px) styled like a *table of contents* in a journal — small-caps "SPECIMENS UNDER OBSERVATION", then numbered entries: "001 · CINDER", "002 · MOSS", "003 · DRIFT", with the dragon's name in italic body and the specimen mono-mark in brick-red.
- Right: the entry page itself, treated as a journal spread with:
  - **Specimen header**: small-caps title block with "SPECIMEN №" + dragon-type tag chip + first-observed date + total-hours-observed (mono small caps).
  - **The dragon's portrait** rendered like a botanical plate — small (~140px), aligned to the right margin of the spread, with a thin iron-gall border and a hand-typed Latin-style label beneath ("Cinder · Adolescent · obs. since 14 Jan").
  - **The Resume Card section** styled as a *log entry*:
    - Date stamp in mono small caps.
    - "Field notes — last session" italic serif lede, then the AI summary as body copy.
    - "Recommended next observation" with the suggested task highlighted in annotation-yellow.
    - The CTA button is rendered as a stamped-looking block: burnt sienna fill, white small-caps "BEGIN OBSERVATION · 20 MIN", with a thin double-rule border to evoke a stamp.
  - **Brain dump** is "Add to log" — a textarea styled exactly like a journal page section, with a hairline rule above and a mono "ENTRY №" label.
  - **Tasks** are a numbered list (mono numerals, period after) — `01.`, `02.` — not bullets, not checkboxes-in-cards. A single checkbox glyph (custom hand-drawn box, not the default OS one) sits to the left.

## Microcopy direction (lean into the naturalist conceit)
- "Dragon Roost 🐉" → **"Specimens under observation"** small-caps; subhead "Three creatures currently in your care."
- "Your dragon remembers…" → **"Field notes — last session"** with date stamp.
- "Suggested next move" → **"Recommended next observation"**.
- "🔥 Start 20-minute training" → **"Begin observation · 20 min"** in stamped style.
- "Hatch New Dragon" → **"Catalogue a new specimen"**.
- Neglect labels: rendered as marginalia in italic brick-red — "*observed restless · last entry 4d ago*", "*has not stirred · 11d*". Not pinned at the bottom of a card; written in the entry's right margin.

## Motion
- Sparse and deliberate. 220ms ease-in-out. Page enter: 12px lift + fade. Hover on a specimen entry: the brick-red ID stamp shifts 2px right (like flipping a page tab). Annotation-yellow highlights *draw on* across 400ms when entering view (left-to-right, like a real highlighter stroke). The dragon plate has *no* idle animation — it's a still illustration.

## Anti-vibecoded checklist (must pass)
- Off-white paper background visible; faint horizontal ruling visible.
- Two distinct serif weights in use (display + body).
- Mono small caps appearing on at least 4 elements per page (specimen IDs, dates, log entry numbers, "ENTRY №").
- Brick-red marginalia visible at least 2x per page.
- Annotation-yellow highlight used exactly once or twice — not as decoration, as emphasis.
- Dragon image rendered with a thin border like a botanical plate, with a typeset caption beneath.
- Zero emoji. Zero rounded-2xl shadow cards. Zero default Lucide.
- Tasks numbered (mono `01.`, `02.`), not bulleted or carded.
