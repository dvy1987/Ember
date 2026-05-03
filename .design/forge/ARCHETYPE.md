# Forge — Archetype

**Archetype:** Brutalist / dev-tool (terminal-spec)
**Feels like:** A trading terminal for your projects — Bloomberg meets a CI dashboard, viewed at 2am.

## Why this archetype for Ember
Forge is the counter-proposal to Dusk. Where Dusk is editorial and warm, Forge is dense, monospaced, and information-rich. ADHD users who happen to be engineers, traders, or operators want every pixel to carry data, not vibe. The bet is that for *that* audience, "the room is on fire" is less motivating than "here's the ticker; act on it." Dragons render as ASCII / glyph badges with stage codes (HTCHL/ADLSC/ADLT) rather than painterly bitmaps. The Resume Card is a row in a panel, not a hero card.

It defends itself against the soul doc as follows:
- **Resume Card as ritual** — kept as the top panel row with a bright `--accent-cinder` Begin affordance, but expressed as `BEGIN ⏎` shortcut, not a glowing button.
- **Dragon as living co-worker** — replaced with a *status line* on each project ("Cinder · adolescent · 71/100 XP · last tended 2h ago"). The aliveness is in the data freshness, not the animation.
- **Cinematic ambience** — replaced by 24px monospace baseline grid via `repeating-linear-gradient` and a single yellow scanline cursor.

## The "feels like X" claim
> "Like opening a Bloomberg terminal for your own attention — every project is a row, every dragon is a ticker, the next move is one keystroke away."

## Anti-default tells this avoids
- No system-ui — Space Grotesk for display, JetBrains Mono for everything else.
- No `#ff6b35`/`#1a1a2e` — base is `#0A0A0A` (pure terminal black), accent is `#FFE600` (CRT yellow), text is `#E8E8E8`.
- No `rounded-2xl shadow-md` — `border-radius: 0` everywhere; depth comes from 1px `--rule` borders and the baseline grid.
- No emoji — every glyph is monospace ASCII or an inline SVG.

## Where it could fail
- Density can read "intimidating" rather than "powerful" for users who came to Ember *because* they couldn't handle a dense tool. Forge is intentionally niche — it is not the recommendation for the median ADHD user.
- Pure black + yellow accent risks looking like a Hacker News parody. Mitigated by the Bricolage-style baseline grid and uppercase-tight micro-labels giving the surface real magazine-of-systems posture.
