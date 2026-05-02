# Today — Archetype

**Archetype:** Editorial (warm-light variant)
**Feels like:** A magazine spread on golden hour, where today's project is the cover story.

## Why this archetype for Ember
"Today at Ember Keep" is the daylight counterpart to Hearth/Dusk. Same Ember Keep, different time of day. The user shows up at the start of their working session, and the page is laid out like a magazine cover: today's focus dragon is the hero, yesterday's dragons sit in the periphery (de-saturated, peripheral but visible — they're not gone, they're just resting).

This archetype defends itself against the soul doc on three counts:
- **Single-focus surface** — there's exactly one CTA on the page (begin a 20-minute session with today's dragon). Everything else is supporting context.
- **Periphery preserves continuity** — `.periphery-moss` (saturate 70%) and `.periphery-drift` (saturate 40%) keep the other dragons visible without competing for attention. They brighten on hover so the user can switch focus deliberately.
- **Warm-light credibility** — the `bg-dusk` linear gradient + `dusk-shift` 30s animation simulates the slow color shift of late-afternoon light. Subtle enough to never distract, present enough to make the surface feel alive.

## The "feels like X" claim
> "Like opening a printed magazine to today's cover story — the dragon is the lede, not a stat box."

## Anti-default tells this avoids
- No system-ui — Fraunces (variable, opsz 144) for display, Source Serif 4 for body, IBM Plex Mono for labels.
- No `#ff6b35`/`#1a1a2e` — the page is `#F6E5C0` (golden parchment), the accent is `#C45A1F` (warm terra), the ink is `#3A1F0E` (deep walnut).
- No `rounded-2xl shadow-md` — surfaces are `#FAEBC9` cards with `rgba(58,31,14,0.1)` hairline borders. Lighting comes from the gradient, not box-shadow.
- No emoji — all glyphs are inline SVG.

## Where it could fail
- "Magazine cover" can degenerate into "marketing landing page" if the typography weight escalates. Fraunces stays at weight 500 even for display; Source Serif body never bolds for emphasis (italic is the only emphasis).
- The 30s `dusk-shift` background animation could distract sensitive users. Reduced-motion follow-up addresses this.
