# Ember Design Constraints

Product-specific constraints for `design-direction`, `design-system`, and `frontend-design`
when working on Ember UI. Read **`docs/visual-direction.md`** and **`docs/product-soul.md`**
before exploring directions.

These constraints thread Ember identity into the loom design pipeline — they do **not**
reintroduce the deprecated archetype/token/icon skill chain.

---

## Product identity (non-negotiable)

Ember is a **living creature companion**, not a task manager. The UI must evoke:

> "My dragon needs training." — not — "I have a list of tasks."

Blend **playful creature world** (cozy games, expressive dragons) with **calm focus workspace**
(minimal dashboards, distraction-free). Emotional tone: curiosity, warmth, gentle responsibility,
momentum.

---

## Direction exploration seeds

When `design-direction` explores 2–3 options, anchor on product docs — not generic archetype
labels. Example direction families for Ember:

| Direction family | Feels like | Bold move |
|------------------|------------|-----------|
| Cozy night forge | Calm dark productivity + warm creature glow | Dragon as emotional anchor on every project screen |
| Ritual-first | Duolingo streak energy, but quieter | Resume Card as the only hero — one primary CTA |
| Minimal focus chamber | Distraction-free timer space | Dragon + timer only; everything else recedes |

Directions must differ on ≥3 dimensions (type, color, layout, motion, density). Do not produce
three palette swaps of the same idea.

---

## Token naming — preserve existing conventions

Map semantic tokens **onto** Ember's established CSS custom properties where they exist.
Do not rename working tokens in components without a migration plan.

### Base UI (semantic → Ember)

| Semantic role | Ember token (prefer) |
|---------------|----------------------|
| App background | `--color-ember-bg` / deep charcoal family |
| Panel / card surface | `--color-ember-panel`, `--color-ember-panel-light` |
| Primary text | `--color-ember-text` (warm white) |
| Muted text | `--color-ember-text-muted` |
| Border | `--color-ember-border` |
| Primary accent (default) | `--color-ember-cinder` |
| Success | `--color-ember-success` |
| Warning | `--color-ember-warning` |
| Danger | `--color-ember-danger` |

### Dragon-type accents (per-project)

| Dragon | Accent token | Glow token |
|--------|--------------|------------|
| Cinder | `--color-ember-cinder` | `--color-ember-cinder-glow` |
| Moss | `--color-ember-moss` | `--color-ember-moss-glow` |
| Drift | `--color-ember-drift` | `--color-ember-drift-glow` |

`design-system` must document both semantic aliases and Ember names in `DESIGN.md` component
contracts. New screens consume tokens — never raw hex in components.

---

## Typography

Modern but friendly sans-serif. `docs/visual-direction.md` suggests Inter, Manrope, or Geist.
Generous spacing; readable at small sizes. Avoid decorative fonts.

---

## Motion

| Context | Timing |
|---------|--------|
| UI transitions | 150–250ms, soft easing |
| Dragon animations | 400–600ms, breathing/glow pulses |
| Session start / complete | Subtle alert + glow intensify — calm magic, not arcade |

Honor `prefers-reduced-motion`. Reward **progress**, not distraction.

---

## Mandatory UI surfaces (state coverage)

Every Ember screen that shows data must ship loading + empty + error + populated states.

### Resume Card (highest priority)

The Resume Card is the primary entry point. Hierarchy:

1. "Your dragon remembers…" (emotional hook)
2. Last session summary
3. Suggested next move
4. **Start 20-minute training** (single primary CTA)

Dragon image adjacent. User should understand where they left off in **<3 seconds**.

### Dragon cards (menagerie)

States: active, sleepy, restless, decaying (neglect). Visual neglect must feel gentle, not punishing.

### Focus session

Calm and immersive: dragon, timer, session tasks only. No analytics clutter mid-session.

### Session reflection

Post-session: what completed, dragon growth feedback, priming for next Resume Card.

---

## Icons

Simple, consistent stroke weight, minimal detail. Assets live in `assets/icons/`. One coherent
family — tuned to match typography weight. No default Lucide drop-in without restyling.

---

## Dragon artwork paths

```
assets/dragons/{drift|cinder|moss}/{stage}-{type}.webp
```

Stages: egg, hatchling, adolescent, adult, ancient.

---

## design-review checklist (Ember-specific)

In addition to APCA and anti-vibecoded gates:

- [ ] Feels like training a creature, not managing tasks
- [ ] Resume Card hierarchy correct when applicable
- [ ] Dragon accent used for glow/highlights, not overwhelming base UI
- [ ] Focus session screen is calm (no notification clutter)
- [ ] Ember token names used in components (no stray hex)
