# Sanctuary — Archetype

**Archetype:** Editorial
**Feels like:** Stripe Press × a hand-bound storybook the user keeps on their desk.

## Why this archetype for Ember
ADHD productivity tools usually shout (gamified streaks, dopamine pings, notification dots). Sanctuary does the opposite: it treats the user's projects like *chapters in a book they are slowly writing about themselves*. The dragon isn't a mascot — it's an illustration on a story page. The Resume Card ("Your dragon remembers…") becomes a quiet narrative beat, not a CTA banner.

This archetype defends itself against the soul doc on three counts:
- **Calm over urgency** — pages have generous margins, hairline rules, and serif body copy. Nothing flashes for attention.
- **Personal over public** — small caps, drop caps, and chapter heads make the surface feel like a private artifact, not a SaaS dashboard.
- **Dragons treated as illustrations** — `.dragon-plate` frames the bitmap with a soft radial wash, like a printed plate inside a book, instead of a glowing sticker.

## The "feels like X" claim
> "Like opening a beautifully typeset chapter where the dragon is the engraving facing the page."

## Anti-default tells this avoids
- No system-ui — body is **Source Serif 4**, display is **Cormorant Garamond**, system labels are **IBM Plex Sans**.
- No `#ff6b35`/`#1a1a2e` — the cinder accent is `#A2381A` (oxblood, not orange) on a `#F3EBE1` parchment.
- No `rounded-2xl shadow-md` cards — content uses hairline rules, drop caps, and chapter-head separators instead of carded grids.
- No emoji — all glyphs are hand-drawn 1.25-stroke SVG icons (flame, leaf, feather, quill, folded page).

## Where it could fail
- Serif body at small sizes is harder to scan when the user is mid-overwhelm. We compensate with generous line-height and IBM Plex Sans for utility labels.
- "Beautiful" can read as "fragile" — the chapter rhythm has to hold up across a project page with 12+ tasks, not just a hero. Dense states use Plex Sans + smaller measure to stay legible.
