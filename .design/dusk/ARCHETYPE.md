# Dusk — Archetype

**Archetype:** Editorial (cinematic dark variant)
**Feels like:** Tonight at Ember Keep — the same room as Today, but at dusk with the fire just lit.

## Why this archetype for Ember
Dusk is the leading candidate. It pairs the warmth and ambient firelight of Hearth with the magazine-spread editorial rhythm of Today, then layers in *a dragon that visibly breathes*. ADHD users opening the app at the end of the day need a surface that signals "you can rest here, but the work is still here too." The animated Cinder (sway, bobble, head-turn, breath ring, mouth embers) is the emotional anchor — the dragon isn't asleep, she's awake with you.

This archetype defends itself against the soul doc on three counts:
- **Resume Card as ritual** — the four-beat sequence (dragon remembers → last session → suggested next move → begin training) is given the most visual weight on the page, with a Fraunces title, marker-highlighted phrase, and the breathing Cinder in the lead.
- **Dragon as living co-worker** — `CinderAnimated.tsx` layers a painterly bitmap with three CSS overlays (warm halo, chest breath ring, mouth ember stream). Plus three outer animation wrappers (sway, bobble, head-turn). She is the most *alive* dragon across all variants.
- **Cinematic ambient lighting** — `firelight-overlay` + 16 ambient embers + 4 brighter "flare" embers create a believable lit-room, not a CSS gradient.

## The "feels like X" claim
> "Like opening tonight's chapter of your own story — the room is warm, the dragon is awake, and the first move is already lit up for you."

## Anti-default tells this avoids
- No system-ui — Fraunces (italic 500, opsz 144) for display, Source Serif 4 for body, IBM Plex Mono for system labels.
- No `#ff6b35`/`#1a1a2e` — base is `#170D08` (deep mahogany), accent is `#D4421A`, glow is `#F0A04A`, text is `#F4E8D0` parchment.
- No `rounded-2xl shadow-md` — surfaces are `#241410` mid with hairline borders. Depth comes from the firelight + ember layers, not box-shadow.
- No emoji — all glyphs are inline SVG; the ember particles are CSS-animated `<span>` elements, not 🔥.

## Where it could fail
- Layered animation can over-claim the user's attention. Each layer is intentionally low-amplitude (translateY 1–4px, opacity 0.6–0.95), and the Reduced Motion follow-up will hold them all still for users who prefer no motion.
- Dark editorial can read "moody" rather than "ready to work." The Resume Card's primary CTA stays bright (`--amber-glow`) and uses Fraunces italic for the Begin moment, so the action is unambiguously the brightest thing on the page.
